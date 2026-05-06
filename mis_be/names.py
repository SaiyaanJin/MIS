import pandas as pd
from pymongo import MongoClient
from datetime import datetime, timezone
from flask import jsonify
from pandas.tseries.offsets import MonthEnd

# ── Cache reference (injected by mis.py via init_cache) ───────────────────────
# This avoids a circular import: mis.py creates the Flask-Cache instance, then
# calls names.init_cache(cache) once at startup so every Names/MultiNames call
# can read from / write to the same in-process cache.
_cache = None
CACHE_TTL = 86400  # 24 hours (matches mis.py default)


def init_cache(cache_instance):
    """Call this once from mis.py after creating the Cache object."""
    global _cache
    _cache = cache_instance


def _cache_get(key):
    return _cache.get(key) if _cache else None


def _cache_set(key, value):
    if _cache:
        _cache.set(key, value, timeout=CACHE_TTL)


def GetCollection():
    client = MongoClient("mongodb://mongodb0.erldc.in:27017,mongodb1.erldc.in:27017,mongodb10.erldc.in:27017/?replicaSet=CONSERV")
    db = client['mis']
    collection_names = [
        'voltage_data', 'line_mw_data_p1', 'line_mw_data_p2', 'line_mw_data_400_above',
        'MVAR_p1', 'MVAR_p2', 'Lines_MVAR_400_above', 'ICT_data', 'ICT_data_MW',
        'frequency_data', 'Demand_minutes', 'Drawal_minutes', 'Generator_Data',
        'Thermal_Generator', 'ISGS_Data', 'Exchange_Data'
    ]
    return [db[name] for name in collection_names]


(
    voltage_data_collection, line_mw_data_collection, line_mw_data_collection1, line_mw_data_collection2,
    MVAR_P1, MVAR_P2, Lines_MVAR_400_above, ICT_data1, ICT_data2,
    frequency_data_collection, demand_collection, drawal_collection,
    Generator_DB, Th_Gen_DB, ISGS_DB, Exchange_DB
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


# ──────────────────────────────────────────────────────────────────────────────
def Names(startDate, endDate, type_):
    """Return a JSON list of station names for a date range and data type.

    Results are cached for 24 hours using the (startDate, endDate, type_) triple
    as the key so repeated identical requests never touch MongoDB.
    """
    cache_key = f"Names_{type_}_{startDate}_{endDate}"
    cached = _cache_get(cache_key)
    if cached is not None:
        return cached

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
        mw_data   = fetch_distinct_names(
            [line_mw_data_collection, line_mw_data_collection1, line_mw_data_collection2],
            filter_, suffix="MW"
        )
        data = mw_data + mvar_data

    elif type_ == "Demand":
        data  = list(demand_collection.find(filter=filter_, projection={'n': 1}).distinct('n'))
        data += drawal_collection.find(filter=filter_, projection={'n': 1}).distinct('n')
        data  = [item for item in data if ':' not in item]

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

    result = jsonify(list(data))
    _cache_set(cache_key, result)
    return result


# ──────────────────────────────────────────────────────────────────────────────
def MultiNames(data_input, type_):
    """Return the intersection of station names across multiple dates/months.

    Cache key is built from the sorted date list and type so the order of
    dates in the request does not create duplicate cache entries.
    """
    # Unpack input (supports legacy list or new (dates, period_type) tuple)
    if isinstance(data_input, tuple):
        dates, period_type = data_input
    else:
        dates = data_input
        period_type = "Date"

    dates_key  = "_".join(sorted(str(d) for d in dates))
    cache_key  = f"MultiNames_{type_}_{period_type}_{dates_key}"
    cached     = _cache_get(cache_key)
    if cached is not None:
        return cached

    # ── helpers ───────────────────────────────────────────────────────────────
    def date_filter(date):
        if period_type == "Date":
            start = end = pd.to_datetime(date)
        else:  # "Month"
            start = pd.to_datetime(date)
            end   = start + MonthEnd(1)
        return {'d': {
            '$gte': start.replace(tzinfo=timezone.utc),
            '$lte': end.replace(tzinfo=timezone.utc)
        }}

    def common_names(collections, suffix=None):
        results = []
        for idx, date in enumerate(dates):
            f_ = date_filter(date)
            names = []
            for coll in collections:
                names += coll.find(filter=f_, projection={'n': 1}).distinct('n')
            results = names if idx == 0 else list(set(results) & set(names))
        if suffix:
            results = [f"{name} {suffix}" for name in results]
        return list(dict.fromkeys(results))

    # ── dispatch ──────────────────────────────────────────────────────────────
    if type_ == "Demand":
        results = []
        for idx, date in enumerate(dates):
            f_ = date_filter(date)
            names  = list(demand_collection.find(filter=f_, projection={'n': 1}).distinct('n'))
            names += drawal_collection.find(filter=f_, projection={'n': 1}).distinct('n')
            names  = [item for item in names if ':' not in item]
            results = names if idx == 0 else list(set(results) & set(names))
        result = jsonify(list(dict.fromkeys(results)))
        _cache_set(cache_key, result)
        return result

    if type_ == "LinesMWMVAR":
        mw_names   = common_names([line_mw_data_collection, line_mw_data_collection1, line_mw_data_collection2], suffix="MW")
        mvar_names = common_names([MVAR_P1, MVAR_P2, Lines_MVAR_400_above], suffix="MVAR")
        result = jsonify(mw_names + mvar_names)
        _cache_set(cache_key, result)
        return result

    collection_map = {
        "Voltage":     ([voltage_data_collection], None),
        "Frequency":   ([frequency_data_collection], None),
        "Generator":   ([Generator_DB], None),
        "ThGenerator": ([Th_Gen_DB], None),
        "ISGS":        ([ISGS_DB], None),
        "Exchange":    ([Exchange_DB], None),
        "ICT":         ([ICT_data1, ICT_data2], None),
        "Lines":       ([line_mw_data_collection, line_mw_data_collection1, line_mw_data_collection2], "MW"),
    }

    if type_ in collection_map:
        colls, suffix = collection_map[type_]
        result = jsonify(common_names(colls, suffix=suffix))
        _cache_set(cache_key, result)
        return result

    return jsonify([])