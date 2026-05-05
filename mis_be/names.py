import pandas as pd
from pymongo import MongoClient
from datetime import datetime, timezone
from flask import jsonify
from pandas.tseries.offsets import MonthEnd


def GetCollection():
    client = MongoClient("mongodb://mongodb0.erldc.in:27017,mongodb1.erldc.in:27017,mongodb10.erldc.in:27017/?replicaSet=CONSERV")
    db = client['mis']
    collection_names = [
        'voltage_data', 'line_mw_data_p1', 'line_mw_data_p2', 'line_mw_data_400_above',
        'MVAR_p1', 'MVAR_p2', 'Lines_MVAR_400_above', 'ICT_data', 'ICT_data_MW',
        'frequency_data', 'Demand_minutes', 'Drawal_minutes', 'Generator_Data', 'Thermal_Generator', 'ISGS_Data', 'Exchange_Data'
    ]
    return [db[name] for name in collection_names]


(
    voltage_data_collection, line_mw_data_collection, line_mw_data_collection1, line_mw_data_collection2,
    MVAR_P1, MVAR_P2, Lines_MVAR_400_above, ICT_data1, ICT_data2,
    frequency_data_collection, demand_collection, drawal_collection, Generator_DB, Th_Gen_DB, ISGS_DB, Exchange_DB
) = GetCollection()


def build_filter(start, end):
    return {'d': {'$gte': pd.to_datetime(start), '$lte': pd.to_datetime(end)}}


def fetch_distinct_names(collections, filter_, suffix=None):
    data = []
    for coll in collections:
        data.extend(coll.find(filter=filter_, projection={'n': 1}).distinct('n'))
    if suffix:
        data = [f"{name} {suffix}" for name in data]
    return list(dict.fromkeys(data))


def Names(startDate, endDate, type_):
    filter_ = build_filter(startDate, endDate)

    if type_ == "Voltage":
        data = voltage_data_collection.find(filter=filter_, projection={'n': 1}).distinct('n')

    elif type_ == "Lines":
        data = fetch_distinct_names(
            [line_mw_data_collection, line_mw_data_collection1, line_mw_data_collection2],
            filter_, suffix="MW"
        )

    elif type_ == "ICT":
        data = fetch_distinct_names([ICT_data1, ICT_data2], filter_)

    elif type_ == "Frequency":
        data = frequency_data_collection.find(filter=filter_, projection={'n': 1}).distinct('n')

    elif type_ == "LinesMWMVAR":
        mvar_data = fetch_distinct_names([MVAR_P1, MVAR_P2, Lines_MVAR_400_above], filter_, suffix="MVAR")
        mw_data = fetch_distinct_names([line_mw_data_collection, line_mw_data_collection1, line_mw_data_collection2], filter_, suffix="MW")
        data = mw_data + mvar_data

    elif type_ == "Demand":
        data = list(demand_collection.find(filter=filter_, projection={'n': 1}).distinct('n'))
        data += drawal_collection.find(filter=filter_, projection={'n': 1}).distinct('n')
        data = [item for item in data if ':' not in item]

    elif type_ == "Generator":
        data = Generator_DB.find(filter=filter_, projection={'n': 1}).distinct('n')

    elif type_ == "ThGenerator":
        data = Th_Gen_DB.find(filter=filter_, projection={'n': 1}).distinct('n')

    elif type_ == "ISGS":
        data = ISGS_DB.find(filter=filter_, projection={'n': 1}).distinct('n')

    elif type_ == "Exchange":
        data = Exchange_DB.find(filter=filter_, projection={'n': 1}).distinct('n')

    else:
        data = []

    return jsonify(list(data))


def MultiNames(data_input, type_):
    # data_input can be a list of dates (legacy) or a tuple (dates, period_type)
    if isinstance(data_input, tuple):
        dates, period_type = data_input
    else:
        dates = data_input
        period_type = "Date"

    def common_names(collections, dates, period_type, suffix=None):
        results = []
        for idx, date in enumerate(dates):
            if period_type == "Date":
                start, end = pd.to_datetime(date), pd.to_datetime(date)
            elif period_type == "Month":
                start = pd.to_datetime(date)
                end = start + MonthEnd(1)
            
            filter_ = {'d': {'$gte': start.replace(tzinfo=timezone.utc), '$lte': end.replace(tzinfo=timezone.utc)}}
            
            names = []
            for coll in collections:
                names += coll.find(filter=filter_, projection={'n': 1}).distinct('n')
            
            if idx == 0:
                results = names
            else:
                results = list(set(results) & set(names))
        
        if suffix:
            results = [f"{name} {suffix}" for name in results]
        return list(dict.fromkeys(results))

    collection_map = {
        "Voltage": [voltage_data_collection],
        "Frequency": [frequency_data_collection],
        "Generator": [Generator_DB],
        "ThGenerator": [Th_Gen_DB],
        "ISGS": [ISGS_DB],
        "Exchange": [Exchange_DB],
        "ICT": [ICT_data1, ICT_data2],
        "Lines": ([line_mw_data_collection, line_mw_data_collection1, line_mw_data_collection2], "MW"),
        "Demand": "SPECIAL_DEMAND"
    }

    if type_ == "Demand":
        results = []
        for idx, date in enumerate(dates):
            if period_type == "Date":
                start, end = pd.to_datetime(date), pd.to_datetime(date)
            elif period_type == "Month":
                start = pd.to_datetime(date)
                end = start + MonthEnd(1)
            filter_ = {'d': {'$gte': start.replace(tzinfo=timezone.utc), '$lte': end.replace(tzinfo=timezone.utc)}}
            
            names = list(demand_collection.find(filter=filter_, projection={'n': 1}).distinct('n'))
            names += drawal_collection.find(filter=filter_, projection={'n': 1}).distinct('n')
            names = [item for item in names if ':' not in item]
            results = names if idx == 0 else list(set(results) & set(names))
        return jsonify(list(dict.fromkeys(results)))

    if type_ == "LinesMWMVAR":
        mw_names = common_names([line_mw_data_collection, line_mw_data_collection1, line_mw_data_collection2], dates, period_type, suffix="MW")
        mvar_names = common_names([MVAR_P1, MVAR_P2, Lines_MVAR_400_above], dates, period_type, suffix="MVAR")
        return jsonify(mw_names + mvar_names)

    if type_ in collection_map:
        val = collection_map[type_]
        if isinstance(val, tuple):
            colls, suffix = val
            return jsonify(common_names(colls, dates, period_type, suffix=suffix))
        else:
            return jsonify(common_names(val, dates, period_type))

    return jsonify([])