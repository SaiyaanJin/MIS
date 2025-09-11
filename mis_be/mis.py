import pandas as pd
import os
from pymongo import MongoClient, ASCENDING, DESCENDING
from datetime import timedelta, datetime, timezone
from flask import Flask, jsonify, request, Response, send_file
from flask_cors import CORS
import math
from pandas.tseries.offsets import MonthEnd
import numpy as np
from flask_caching import Cache

from weeklyreports import FrequencyReport
from weeklyreports import VoltageReport2
from weeklyreports import ElementBreakdownReport
from weeklyreports import GeneratorBreakdownReport
from weeklyreports import LineTrippingReport
from weeklyreports import NC_IEGC_Report
from weeklyreports import dc_revision_counter

from monthlyreports2 import ReportMeterData2

from monthlyreports import meter_check
from monthlyreports import meternames
from monthlyreports import MeterData
from monthlyreports import ReportMeterData

from FileUpload import *
from names import *
from outage import *

app = Flask(__name__)
CORS(app)

# Configure caching (SimpleCache for dev; use Redis for production)
app.config['CACHE_TYPE'] = 'SimpleCache'  # Or 'RedisCache'
app.config['CACHE_DEFAULT_TIMEOUT'] = 86400  # 1 day in seconds

cache = Cache(app)

Lines_file_name = ''
MVAR_file_name = ''

Frequency_excel_data = []
Voltage_excel_data = []
Demand_excel_data = []
ICT_excel_data = []
Lines_excel_data = []
Generator_excel_data = []
ThGenerator_excel_data = []
ISGS_excel_data = []
MVAR_excel_data = []
Exchange_excel_data = []

cwd = os.getcwd()
dir_path = (cwd[0].upper() + cwd[1:]).replace('\\', '/')+'/'


@app.route('/', methods=['GET', 'POST'])
def default():

    return jsonify("Working")


def my_max_min_function(somelist):

    try:
        max_value = max(somelist)
        min_value = min(somelist)
        avg_value = 0 if len(somelist) == 0 else sum(somelist)/len(somelist)

        max_index = [i for i, val in enumerate(somelist) if val == max_value]
        min_index = [i for i, val in enumerate(somelist) if val == min_value]

        avg_value = round(avg_value, 3)
        max_value = round(max_value, 3)
        min_value = round(min_value, 3)

        max_index.insert(0, max_value)
        min_index.insert(0, min_value)

    except:

        max_index = [0, 0]
        min_index = [0, 0]
        avg_value = 0

    return max_index, min_index, avg_value


def datetime_range(start, end, delta):
    end = end + timedelta(days=1)
    current = start
    while current < end:
        yield current
        current += delta

    return current


def divide_chunks(l, n):

    # looping till length l
    for i in range(0, len(l), n):
        yield l[i:i + n]


# //////////////////////////////////////////////////////////////////////////////////////////voltage/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


def GetCollection():
    client = MongoClient("mongodb://mongodb0.erldc.in:27017,mongodb1.erldc.in:27017,mongodb10.erldc.in:27017/?replicaSet=CONSERV")
    db = client['mis']
    Exchange_Data= db['Exchange_Data']
    Exchange_Data.create_index([('n',DESCENDING),('d',DESCENDING)], unique= True)
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


@app.route('/VoltageFileInsert', methods=['GET', 'POST'])
def VoltageFileInsert():

    PATH = "http://10.3.100.24/DAILY_DUMP_FILES_SCADA/"

    startDate = request.args['startDate']
    endDate = request.args['endDate']

    startDateObj = datetime.strptime(startDate, "%Y-%m-%d")
    endDateObj = datetime.strptime(endDate, "%Y-%m-%d")

    res= Voltage(startDateObj,endDateObj,PATH)

    return jsonify({'status': "success", 'dates': res})

@app.route('/VoltageNames', methods=['GET', 'POST'])
def VoltageNames():
    startDate1 = request.args['startDate']
    endDate1 = request.args['endDate']

    startDate = startDate1.split(" ")[0]
    endDate = endDate1.split(" ")[0]

    cache_key = f"VoltageNames_{startDate}_{endDate}"
    cached_res = cache.get(cache_key)
    if cached_res:
        
        return cached_res

    res = Names(startDate, endDate, "Voltage")
    cache.set(cache_key, res, timeout=86400)
    
    return res


@app.route('/MultiVoltageNames', methods=['GET', 'POST'])
def MultiVoltageNames():
    MultistartDate = request.args['MultistartDate']
    dates_key = "_".join(sorted(MultistartDate.split(',')))

    cache_key = f"MultiVoltageNames_{dates_key}"
    cached_res = cache.get(cache_key)
    if cached_res:
        
        return cached_res

    date_list = MultistartDate.split(',')
    res = MultiNames(date_list, "Voltage")
    cache.set(cache_key, res, timeout=86400)
    
    return res


@app.route('/GetVoltageData', methods=['GET', 'POST'])
def GetVoltageData():

    startDate1 = request.args['startDate']
    endDate1 = request.args['endDate']
    stationName = request.args['stationName'].split(',')
    time1 = int(request.args['time'])

    startTime = f"{startDate1}:00"
    endTime = f"{endDate1}:00"

    startDate = startDate1.split(" ")[0]
    endDate = endDate1.split(" ")[0]

    startTimeObj = datetime.strptime(startTime, "%Y-%m-%d %H:%M:%S")
    endTimeObj = datetime.strptime(endTime, "%Y-%m-%d %H:%M:%S")

    index1 = startTimeObj.hour * 60 + startTimeObj.minute
    index2 = index1 + int((endTimeObj - startTimeObj).total_seconds() / 60)

    if time1 > 1 + (endTimeObj - startTimeObj).total_seconds() / 60:
        return jsonify("Time ERROR")

    allDateTime = []
    dt_cursor = startTimeObj
    while dt_cursor <= endTimeObj:
        allDateTime.append(dt_cursor.strftime("%d-%m-%Y %H:%M:%S"))
        dt_cursor += timedelta(minutes=time1)

    startDateObj = datetime.strptime(startDate, "%Y-%m-%d")
    endDateObj = datetime.strptime(endDate, "%Y-%m-%d")
    date_range = [startDateObj + timedelta(days=x)
                  for x in range((endDateObj - startDateObj).days + 1)]

    reply = []
    listofzeros = [0] * 1440
    names = ''

    for station in stationName:
        names += station + ', '
        voltageBus1 = []
        voltageBus2 = []

        for dt in date_range:
            filter = {
                'd': {
                    '$gte': datetime(dt.year, dt.month, dt.day, 0, 0, 0, tzinfo=timezone.utc),
                    '$lte': datetime(dt.year, dt.month, dt.day, 0, 0, 0, tzinfo=timezone.utc)
                },
                'n': station
            }
            project = {'_id': 0, 'vol': 1, 'vol2': 1}
            result_list = list(voltage_data_collection.find(filter=filter, projection=project))

            if not result_list:
                voltageBus1 += listofzeros
                voltageBus2 += listofzeros
            else:
                voltageBus1 += result_list[0]['vol']
                voltageBus2 += result_list[0]['vol2']

        voltageBus1 = [0 if math.isnan(float(v)) else v for v in voltageBus1]
        voltageBus2 = [0 if math.isnan(float(v)) else v for v in voltageBus2]

        voltageBus1 = voltageBus1[index1:index2 + 1]
        voltageBus2 = voltageBus2[index1:index2 + 1]

        if time1 == 1:
            reply.append({'stationName': station, 'voltageBus1': voltageBus1, 'voltageBus2': voltageBus2})
        else:
            chunks1 = list(divide_chunks(voltageBus1, time1))
            chunks2 = list(divide_chunks(voltageBus2, time1))

            avg1 = [my_max_min_function(chunk)[2] for chunk in chunks1]
            avg2 = [my_max_min_function(chunk)[2] for chunk in chunks2]

            reply.append({'stationName': station, 'voltageBus1': avg1, 'voltageBus2': avg2})

    df1 = pd.DataFrame.from_dict({'Date_Time': allDateTime})
    merge_list = [df1]

    for idx, it in enumerate(reply):
        df = pd.DataFrame.from_dict(it).drop(['stationName'], axis=1)
        df.columns = pd.MultiIndex.from_product([[stationName[idx]], df.columns])
        merge_list.append(df)

    global Voltage_excel_data
    Voltage_excel_data = merge_list

    for i in range(len(reply)):
        for key in ['voltageBus1', 'voltageBus2']:
            temp_vals = sorted(reply[i][key], reverse=True)
            percentiles = list(np.linspace(0, 100, len(temp_vals)))
            reply[i][f"{key} Duration"] = [temp_vals, percentiles]

        max_v1, min_v1, avg_v1 = my_max_min_function(reply[i]['voltageBus1'])
        max_v2, min_v2, avg_v2 = my_max_min_function(reply[i]['voltageBus2'])

        def process_extremes(extremes, label):
            if extremes[0] == 0 or len(extremes) > 50:
                return [[""], []]
            values = [extremes[0]] * (len(extremes) - 1)
            times = [allDateTime[i] for i in extremes[1:]]
            return [values, times]

        reply[i]['max_v1'] = process_extremes(max_v1, 'max_v1')
        reply[i]['min_v1'] = process_extremes(min_v1, 'min_v1')
        reply[i]['avg_v1'] = avg_v1

        reply[i]['max_v2'] = process_extremes(max_v2, 'max_v2')
        reply[i]['min_v2'] = process_extremes(min_v2, 'min_v2')
        reply[i]['avg_v2'] = avg_v2

    reply.append({'Date_Time': allDateTime})
    return jsonify(reply)



@app.route('/GetMultiVoltageData', methods=['GET', 'POST'])
def GetMultiVoltageData():

    MultistartDate = request.args['MultistartDate'].split(',')
    stationName = request.args['MultistationName'].split(',')
    Type = request.args['Type']
    time1 = int(request.args['time'])

    listofzeros = [0] * 1440
    reply = []
    allDateTime = []

    if Type == "Date":
        date_obj = datetime.strptime(MultistartDate[0], "%Y-%m-%d")
        dts = [dt.strftime("%H:%M:%S") for dt in datetime_range(date_obj, date_obj, timedelta(minutes=time1))]
        allDateTime = dts

        for station in stationName:
            for dateval in MultistartDate:
                dt_obj = datetime.strptime(dateval, "%Y-%m-%d")
                filter = {
                    'd': {
                        '$gte': datetime(dt_obj.year, dt_obj.month, dt_obj.day, 0, 0, 0, tzinfo=timezone.utc),
                        '$lte': datetime(dt_obj.year, dt_obj.month, dt_obj.day, 0, 0, 0, tzinfo=timezone.utc)
                    },
                    'n': station
                }
                project = {'_id': 0, 'vol': 1, 'vol2': 1}
                result_list = list(voltage_data_collection.find(filter=filter, projection=project))

                voltageBus1 = result_list[0]['vol'] if result_list else listofzeros
                voltageBus2 = result_list[0]['vol2'] if result_list else listofzeros

                voltageBus1 = [0 if pd.isna(float(v)) else float(v) for v in voltageBus1]
                voltageBus2 = [0 if pd.isna(float(v)) else float(v) for v in voltageBus2]

                if time1 == 1:
                    reply.append({'stationName': station, 'voltageBus1': voltageBus1,
                                  'voltageBus2': voltageBus2, 'Date_Time': dt_obj})
                else:
                    temp_voltageBus1 = [my_max_min_function(chunk)[2] for chunk in divide_chunks(voltageBus1, time1)]
                    temp_voltageBus2 = [my_max_min_function(chunk)[2] for chunk in divide_chunks(voltageBus2, time1)]

                    reply.append({'stationName': station, 'voltageBus1': temp_voltageBus1,
                                  'voltageBus2': temp_voltageBus2, 'Date_Time': dt_obj})

        reply.append({'Date_Time': allDateTime})

    elif Type == "Month":
        for station in stationName:
            for dateval in MultistartDate:
                startDateObj = datetime.strptime(dateval, "%Y-%m-%d")
                endDateObj = pd.Timestamp(dateval) + MonthEnd(1)
                dts = [dt.strftime("%d-%m-%Y %H:%M:%S") for dt in datetime_range(startDateObj, endDateObj, timedelta(minutes=time1))]

                if len(allDateTime) < len(dts):
                    allDateTime = dts

                alldate = list(pd.date_range(startDateObj, endDateObj - timedelta(days=1), freq='d').strftime("%Y-%m-%d"))
                alldate.append(endDateObj.strftime("%Y-%m-%d"))

                voltageBus1, voltageBus2 = [], []

                for d in alldate:
                    dt = datetime.strptime(d, "%Y-%m-%d")
                    filter = {
                        'd': {
                            '$gte': datetime(dt.year, dt.month, dt.day, 0, 0, 0, tzinfo=timezone.utc),
                            '$lte': datetime(dt.year, dt.month, dt.day, 0, 0, 0, tzinfo=timezone.utc)
                        },
                        'n': station
                    }
                    project = {'_id': 0, 'vol': 1, 'vol2': 1}
                    result_list = list(voltage_data_collection.find(filter=filter, projection=project))

                    voltageBus1 += result_list[0]['vol'] if result_list else listofzeros
                    voltageBus2 += result_list[0]['vol2'] if result_list else listofzeros

                voltageBus1 = [0 if pd.isna(float(v)) else float(v) for v in voltageBus1]
                voltageBus2 = [0 if pd.isna(float(v)) else float(v) for v in voltageBus2]

                if time1 == 1:
                    reply.append({'stationName': station, 'voltageBus1': voltageBus1,
                                  'voltageBus2': voltageBus2, 'Date_Time': startDateObj})
                else:
                    temp_voltageBus1 = [my_max_min_function(chunk)[2] for chunk in divide_chunks(voltageBus1, time1)]
                    temp_voltageBus2 = [my_max_min_function(chunk)[2] for chunk in divide_chunks(voltageBus2, time1)]

                    reply.append({'stationName': station, 'voltageBus1': temp_voltageBus1,
                                  'voltageBus2': temp_voltageBus2, 'Date_Time': startDateObj})

        reply.append({'Date_Time': allDateTime})

    for item in reply[:-1]:
        sorted_v1 = sorted(item['voltageBus1'], reverse=True)
        sorted_v2 = sorted(item['voltageBus2'], reverse=True)
        z = list(np.linspace(0, 100, len(sorted_v1)))
        z2 = list(np.linspace(0, 100, len(sorted_v2)))

        item['voltageBus1 Duration'] = [sorted_v1, z]
        item['voltageBus2 Duration'] = [sorted_v2, z2]

        max_v1, min_v1, avg_v1 = my_max_min_function(item['voltageBus1'])
        max_v2, min_v2, avg_v2 = my_max_min_function(item['voltageBus2'])

        def format_max_min(val, label):
            if val[0] == 0 or len(val) > 50:
                return [[""], []]
            return [[val[0]] * len(val[1]), [allDateTime[i] for i in val[1]]]

        item['max_v1'] = format_max_min(max_v1, 'max')
        item['min_v1'] = format_max_min(min_v1, 'min')
        item['avg_v1'] = avg_v1
        item['max_v2'] = format_max_min(max_v2, 'max')
        item['min_v2'] = format_max_min(min_v2, 'min')
        item['avg_v2'] = avg_v2

    return jsonify(reply)



@app.route('/GetVoltageDataExcel', methods=['GET', 'POST'])
def GetVoltageDataExcel():

    global Voltage_excel_data

    if len(Voltage_excel_data) > 0:

        merged = pd.concat(Voltage_excel_data, axis=1, join="inner")
        merged.to_excel(
            dir_path+"Excel_Files/Voltage.xlsx", index=None)

        path = dir_path+"Excel_Files/Voltage.xlsx"

        startDate1 = request.args['startDate']
        endDate1 = request.args['endDate']

        startDate1 = startDate1.split(" ")
        endDate1 = endDate1.split(" ")

        startDate = startDate1[0]
        endDate = endDate1[0]

        # startTime = startDate1[1]
        # endTime = endDate1[1]

        stationName = request.args['stationName']
        stationName = stationName.split(',')

        names = ''
        for i in stationName:
            names = names+i+', '

        names = names[:-2]

        if startDate == endDate:
            custom = startDate+' Voltage Data of '+names+'.xlsx'

        else:
            custom = startDate+' to '+endDate+' Voltage Data of '+names+'.xlsx'

        if os.path.exists(path):
            with open(path, "rb") as excel:
                data = excel.read()

            response = Response(
                data, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            return send_file(dir_path+'Excel_Files/Voltage.xlsx', as_attachment=True, download_name=custom)
        else:
            return Response('Some error occured!')

    else:
        return jsonify("No Data to Download")



# //////////////////////////////////////////////////////////////////////////////////////////voltage/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

# //////////////////////////////////////////////////////////////////////////////////////////line/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


@app.route('/LinesFileInsert', methods=['GET', 'POST'])
def LinesFileInsert():

    startDate = request.args['startDate']
    endDate = request.args['endDate']

    startDateObj = datetime.strptime(startDate, "%Y-%m-%d")
    endDateObj = datetime.strptime(endDate, "%Y-%m-%d")

    path = "http://10.3.100.24/DAILY_DUMP_FILES_SCADA/"
    res = Lines(startDateObj,endDateObj,path)

    return res


@app.route('/LinesNames', methods=['GET', 'POST'])
def LinesNames():
    startDate1 = request.args['startDate']
    endDate1 = request.args['endDate']

    startDate = startDate1.split(" ")[0]
    endDate = endDate1.split(" ")[0]

    cache_key = f"LinesNames_{startDate}_{endDate}"
    cached_res = cache.get(cache_key)
    if cached_res:
        
        return cached_res

    res = Names(startDate, endDate, "Lines")
    cache.set(cache_key, res, timeout=86400)
    
    return res


@app.route('/MultiLinesNames', methods=['GET', 'POST'])
def MultiLinesNames():
    MultistartDate = request.args['MultistartDate']
    dates_sorted = "_".join(sorted(MultistartDate.split(',')))

    cache_key = f"MultiLinesNames_{dates_sorted}"
    cached_res = cache.get(cache_key)
    if cached_res:
        
        return cached_res

    date_list = MultistartDate.split(',')
    res = MultiNames(date_list, "Lines")
    cache.set(cache_key, res, timeout=86400)
    
    return res


@app.route('/GetLinesData', methods=['GET', 'POST'])
def GetLinesData():
    startDate1 = request.args['startDate']
    endDate1 = request.args['endDate']
    stationName = request.args['stationName'].split(',')
    time1 = int(request.args['time'])

    startTime = startDate1 + ":00"
    endTime = endDate1 + ":00"

    startDate = startDate1.split(" ")[0]
    endDate = endDate1.split(" ")[0]

    startTime_fmt = datetime.strptime(startTime, "%Y-%m-%d %H:%M:%S").strftime("%d-%m-%Y %H:%M:%S")
    endTime_fmt = datetime.strptime(endTime, "%Y-%m-%d %H:%M:%S").strftime("%d-%m-%Y %H:%M:%S")

    startDateObj = datetime.strptime(startDate, "%Y-%m-%d")
    endDateObj = datetime.strptime(endDate, "%Y-%m-%d")
    date_range = [startDateObj + timedelta(days=x) for x in range((endDateObj - startDateObj).days + 1)]

    dts = [dt.strftime("%d-%m-%Y %H:%M:%S") for dt in datetime_range(startDateObj, endDateObj, timedelta(minutes=time1))]
    allDateTime = dts[dts.index(startTime_fmt):dts.index(endTime_fmt) + 1]

    listofzeros = [11111] * 1440
    reply = []
    merge_list = [pd.DataFrame({'Date_Time': allDateTime})]
    names = ''

    for station in stationName:
        station_clean = station[:-3]
        names += station_clean + ', '
        line = []

        for dt in date_range:
            date_filter = {'d': {
                '$gte': datetime(dt.year, dt.month, dt.day, 0, 0, 0, tzinfo=timezone.utc),
                '$lte': datetime(dt.year, dt.month, dt.day, 0, 0, 0, tzinfo=timezone.utc)
            }, 'n': station_clean}
            projection = {'_id': 0, 'p': 1}

            global Lines_file_name
            Lines_file_name = 'p1'
            result = list(line_mw_data_collection.find(filter=date_filter, projection=projection))

            if not result:
                Lines_file_name = 'p2'
                result = list(line_mw_data_collection1.find(filter=date_filter, projection=projection))

            if not result:
                Lines_file_name = '400 & above'
                result = list(line_mw_data_collection2.find(filter=date_filter, projection=projection))

            line += result[0]['p'] if result else listofzeros

        for i in range(len(line)):
            val = float(line[i])
            if math.isnan(val):
                line[i] = 0

        line = line[dts.index(startTime_fmt):dts.index(endTime_fmt) + 1]

        if time1 == 1:
            reply.append({'stationName': station_clean, 'line': line})
        else:
            chunks = list(divide_chunks(line, time1))
            temp_line = [my_max_min_function(chunk)[2] for chunk in chunks]
            reply.append({'stationName': station_clean, 'line': temp_line})

    for entry in reply:
        max_v, min_v, avg = my_max_min_function(entry['line'])

        if max_v[0] == 0 and min_v[0] == 0:
            max_v = [[0], []]
            min_v = [[0], []]
        elif len(max_v) > 50 and len(min_v) > 50:
            max_v = [[max_v[0]], []]
            min_v = [[min_v[0]], []]
        else:
            max_v = [[max_v[0]] * len(max_v[1]), [allDateTime[i] for i in max_v[1]]]
            min_v = [[min_v[0]] * len(min_v[1]), [allDateTime[i] for i in min_v[1]]]

        entry['max'] = max_v
        entry['min'] = min_v
        entry['avg'] = avg

    reply.append({'Date_Time': allDateTime})

    for x in range(len(reply) - 1):
        merge_list.append(pd.DataFrame({reply[x]['stationName']: reply[x]['line']}))

    global Lines_excel_data
    Lines_excel_data = merge_list

    return jsonify(reply)



@app.route('/GetMultiLinesData', methods=['GET', 'POST'])
def GetMultiLinesData():
    MultistartDate = request.args['MultistartDate'].split(',')
    stationName = request.args['MultistationName'].split(',')
    Type = request.args['Type']
    time1 = int(request.args['time'])

    global Lines_file_name

    listofzeros = [0] * 1440
    reply = []
    allDateTime = []

    if Type == "Date":
        startDateObj = datetime.strptime(MultistartDate[0], "%Y-%m-%d")
        endDateObj = startDateObj

        allDateTime = [dt.strftime("%H:%M:%S") for dt in datetime_range(startDateObj, endDateObj, timedelta(minutes=time1))]

        for raw_station in stationName:
            station = raw_station[:-3]

            for dateval in MultistartDate:
                DateObj = datetime.strptime(dateval, "%Y-%m-%d")
                line = []

                filter = {
                    'd': {
                        '$gte': datetime(DateObj.year, DateObj.month, DateObj.day, 0, 0, 0, tzinfo=timezone.utc),
                        '$lte': datetime(DateObj.year, DateObj.month, DateObj.day, 0, 0, 0, tzinfo=timezone.utc)
                    },
                    'n': station
                }
                project = {'_id': 0, 'p': 1}

                for collection, name in [(line_mw_data_collection, 'p1'), (line_mw_data_collection1, 'p2'), (line_mw_data_collection2, '400 & above')]:
                    result_list = list(collection.find(filter=filter, projection=project))
                    if result_list:
                        line += result_list[0]['p']
                        Lines_file_name = name
                        break
                else:
                    line += listofzeros

                line = [0 if math.isnan(float(x)) else float(x) for x in line]

                if time1 == 1:
                    reply.append({'stationName': station, 'line': line, 'Date_Time': DateObj})
                else:
                    chunked = list(divide_chunks(line, time1))
                    averaged = [my_max_min_function(chunk)[2] for chunk in chunked]
                    reply.append({'stationName': station, 'line': averaged, 'Date_Time': DateObj})

    elif Type == "Month":
        for station in stationName:
            for dateval in MultistartDate:
                startDateObj = datetime.strptime(dateval, "%Y-%m-%d")
                endDateObj = pd.Timestamp(dateval) + MonthEnd(1)

                dts = [dt.strftime("%d-%m-%Y %H:%M:%S") for dt in datetime_range(startDateObj, endDateObj, timedelta(minutes=time1))]
                if len(allDateTime) < len(dts):
                    allDateTime = dts

                alldate = list(pd.date_range(startDateObj, endDateObj - timedelta(days=1), freq='d').strftime("%Y-%m-%d"))
                alldate.append(endDateObj.strftime("%Y-%m-%d"))

                line = []

                for datestr in alldate:
                    dates = datetime.strptime(datestr, "%Y-%m-%d")
                    filter = {
                        'd': {
                            '$gte': datetime(dates.year, dates.month, dates.day, 0, 0, 0, tzinfo=timezone.utc),
                            '$lte': datetime(dates.year, dates.month, dates.day, 0, 0, 0, tzinfo=timezone.utc)
                        },
                        'n': station
                    }

                    project = {'_id': 0, 'p': 1}

                    for collection, name in [(line_mw_data_collection, 'p1'), (line_mw_data_collection1, 'p2'), (line_mw_data_collection2, '400 & above')]:
                        result_list = list(collection.find(filter=filter, projection=project))
                        if result_list:
                            line += result_list[0]['p']
                            Lines_file_name = name
                            break
                    else:
                        line += listofzeros

                line = [0 if math.isnan(float(x)) else float(x) for x in line]

                if time1 == 1:
                    reply.append({'stationName': station, 'line': line, 'Date_Time': startDateObj})
                else:
                    chunked = list(divide_chunks(line, time1))
                    averaged = [my_max_min_function(chunk)[2] for chunk in chunked]
                    reply.append({'stationName': station, 'line': averaged, 'Date_Time': startDateObj})

    temp_dict = {'Date_Time': allDateTime}

    for entry in reply:
        max_, min_, avg_ = my_max_min_function(entry['line'])

        if max_[0] == 0 and min_[0] == 0:
            max_ = [[0], []]
            min_ = [[0], []]
        elif len(max_) > 50 and len(min_) > 50:
            max_ = [[max_[0]], []]
            min_ = [[min_[0]], []]
        else:
            l1 = [max_[0]] * (len(max_) - 1)
            l2 = allDateTime[1:len(max_)]
            max_ = [l1, l2]

            l1 = [min_[0]] * (len(min_) - 1)
            l2 = allDateTime[1:len(min_)]
            min_ = [l1, l2]

        entry['max'] = max_
        entry['min'] = min_
        entry['avg'] = avg_

    reply.append(temp_dict)

    return jsonify(reply)



@app.route('/GetLinesDataExcel', methods=['GET', 'POST'])
def GetLinesDataExcel():

    global Lines_file_name
    global Lines_excel_data

    if len(Lines_excel_data) > 0:

        merged = pd.concat(Lines_excel_data, axis=1, join="inner")
        merged.to_excel(
            dir_path+"Excel_Files/Lines.xlsx", index=None)

        path = dir_path+"Excel_Files/Lines.xlsx"

        startDate1 = request.args['startDate']
        endDate1 = request.args['endDate']

        startDate1 = startDate1.split(" ")
        endDate1 = endDate1.split(" ")

        startDate = startDate1[0]
        endDate = endDate1[0]

        # startTime = startDate1[1]
        # endTime = endDate1[1]

        stationName = request.args['stationName']
        stationName = stationName.split(',')

        names = ''
        for i in stationName:
            names = names+i+', '

        names = names[:-2]

        if startDate == endDate:
            custom = startDate+' '+Lines_file_name+' Line Data of '+names+'.xlsx'

        else:
            custom = startDate+' to '+endDate+' ' + \
                Lines_file_name+' Line Data of '+names+'.xlsx'

        if os.path.exists(path):
            with open(path, "rb") as excel:
                data = excel.read()

            response = Response(
                data, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        return send_file(dir_path+'Excel_Files/Lines.xlsx', as_attachment=True, download_name=custom)

    else:
        return jsonify("No Data to Download")




# //////////////////////////////////////////////////////////////////////////////////////////line/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


# //////////////////////////////////////////////////////////////////////////////////////////lines-mvar/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


@app.route('/MVARFileInsert', methods=['GET', 'POST'])
def MVARFileInsert():

    startDate = request.args['startDate']
    endDate = request.args['endDate']

    startDateObj = datetime.strptime(startDate, "%Y-%m-%d")
    endDateObj = datetime.strptime(endDate, "%Y-%m-%d")

    path = "http://10.3.100.24/DAILY_DUMP_FILES_SCADA/"

    res= LinesMVARFileInsert(startDateObj,endDateObj,path)

    return res


# //////////////////////////////////////////////////////////////////////////////////////////mvar/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

# //////////////////////////////////////////////////////////////////////////////////////////ict/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


@app.route('/ICTFileInsert', methods=['GET', 'POST'])
def ICTFileInsert():

    startDate = request.args['startDate']
    endDate = request.args['endDate']

    startDateObj = datetime.strptime(startDate, "%Y-%m-%d")
    endDateObj = datetime.strptime(endDate, "%Y-%m-%d")

    path = "http://10.3.100.24/DAILY_DUMP_FILES_SCADA/"

    res= ICT(startDateObj,endDateObj,path)

    return res


@app.route('/ICTNames', methods=['GET', 'POST'])
def ICTNames():
    startDate1 = request.args['startDate']
    endDate1 = request.args['endDate']

    startDate = startDate1.split(" ")[0]
    endDate = endDate1.split(" ")[0]

    cache_key = f"ICTNames_{startDate}_{endDate}"
    cached_res = cache.get(cache_key)
    if cached_res:
        return cached_res

    res = Names(startDate, endDate, "ICT")
    cache.set(cache_key, res, timeout=86400)
    return res


@app.route('/MultiICTNames', methods=['GET', 'POST'])
def MultiICTNames():
    MultistartDate = request.args['MultistartDate']
    Type = request.args['Type']

    dates_sorted = "_".join(sorted(MultistartDate.split(',')))
    cache_key = f"MultiICTNames_{dates_sorted}_{Type}"

    cached_res = cache.get(cache_key)
    if cached_res:
        return cached_res

    date_list = MultistartDate.split(',')
    res = MultiNames([date_list, Type], "ICT")
    cache.set(cache_key, res, timeout=86400)
    return res


@app.route('/GetICTData', methods=['GET', 'POST'])
def GetICTData():

    startDate1 = request.args['startDate']
    endDate1 = request.args['endDate']
    stationName = request.args['stationName'].split(',')
    time1 = int(request.args['time'])

    startTime = startDate1 + ":00"
    endTime = endDate1 + ":00"

    startDate = startDate1.split(" ")[0]
    endDate = endDate1.split(" ")[0]

    startTimeObj = datetime.strptime(startTime, "%Y-%m-%d %H:%M:%S")
    endTimeObj = datetime.strptime(endTime, "%Y-%m-%d %H:%M:%S")

    index1 = startTimeObj.hour * 60 + startTimeObj.minute
    index2 = index1 + int((endTimeObj - startTimeObj).total_seconds() / 60)

    if time1 > 1 + (endTimeObj - startTimeObj).total_seconds() / 60:
        return jsonify("Time ERROR")

    allDateTime = []
    ts = startTimeObj
    while ts <= endTimeObj:
        allDateTime.append(ts.strftime("%d-%m-%Y %H:%M:%S"))
        ts += timedelta(minutes=time1)

    startDateObj = datetime.strptime(startDate, "%Y-%m-%d")
    endDateObj = datetime.strptime(endDate, "%Y-%m-%d")

    date_range = [startDateObj + timedelta(days=x) for x in range((endDateObj - startDateObj).days + 1)]

    reply = []
    listofzeros = [0] * 1440
    names = ''
    merge_list = []

    df1 = pd.DataFrame.from_dict({'Date_Time': allDateTime})
    merge_list.append(df1)

    for station in stationName:
        names += station + ', '
        line = []

        for it in date_range:
            filter = {
                'd': {
                    '$gte': datetime(it.year, it.month, it.day, 0, 0, 0, tzinfo=timezone.utc),
                    '$lte': datetime(it.year, it.month, it.day, 0, 0, 0, tzinfo=timezone.utc)
                },
                'n': station
            }
            project = {'_id': 0, 'p': 1}

            result1 = ICT_data1.find(filter=filter, projection=project)
            result_list = list(result1)

            if not result_list:
                result2 = ICT_data2.find(filter=filter, projection=project)
                result_list = list(result2)

            line += result_list[0]['p'] if result_list else listofzeros

        for i in range(len(line)):
            try:
                if math.isnan(float(line[i])):
                    line[i] = 0
            except:
                line[i] = 0

        line = line[index1:index2 + 1]

        if time1 == 1:
            data = {'stationName': station, 'line': line}
        else:
            temp_line = []
            for chunk in divide_chunks(line, time1):
                _, _, avg = my_max_min_function(chunk)
                temp_line.append(avg)
            data = {'stationName': station, 'line': temp_line}

        reply.append(data)

    for i in range(len(reply)):
        max_, min_, avg = my_max_min_function(reply[i]['line'])

        if max_[0] == 0 and min_[0] == 0:
            max_, min_ = [[0], []], [[0], []]
        elif len(max_) > 50 and len(min_) > 50:
            max_ = [[max_[0]], []]
            min_ = [[min_[0]], []]
        else:
            max_ = [[max_[0]] * (len(max_) - 1), allDateTime[1:len(max_)]]
            min_ = [[min_[0]] * (len(min_) - 1), allDateTime[1:len(min_)]]

        reply[i]['max'] = max_
        reply[i]['min'] = min_
        reply[i]['avg'] = avg

    reply.append({'Date_Time': allDateTime})

    for x in range(len(reply) - 1):
        df1 = pd.DataFrame.from_dict({reply[x]['stationName']: reply[x]['line']})
        merge_list.append(df1)

    global ICT_excel_data
    ICT_excel_data = merge_list

    return jsonify(reply)



@app.route('/GetMultiICTData', methods=['GET', 'POST'])
def GetMultiICTData():

    MultistartDate = request.args['MultistartDate'].split(',')
    stationName = request.args['MultistationName'].split(',')
    Type = request.args['Type']
    time1 = int(request.args['time'])

    listofzeros = [0] * 1440
    reply = []
    allDateTime = []

    if Type == "Date":
        startDateObj = datetime.strptime(MultistartDate[0], "%Y-%m-%d")
        endDateObj = startDateObj
        allDateTime = [dt.strftime("%H:%M:%S") for dt in datetime_range(startDateObj, endDateObj, timedelta(minutes=time1))]

        for station in stationName:
            for dateval in MultistartDate:
                DateObj = datetime.strptime(dateval, "%Y-%m-%d")

                filter = {
                    'd': {
                        '$gte': datetime(DateObj.year, DateObj.month, DateObj.day, 0, 0, 0, tzinfo=timezone.utc),
                        '$lte': datetime(DateObj.year, DateObj.month, DateObj.day, 0, 0, 0, tzinfo=timezone.utc)
                    },
                    'n': station
                }

                result_list = list(ICT_data1.find(filter=filter, projection={'_id': 0, 'p': 1}))
                line = result_list[0]['p'] if result_list else listofzeros

                for i in range(len(line)):
                    try:
                        if math.isnan(float(line[i])):
                            line[i] = 0
                    except:
                        line[i] = 0

                if time1 > 1:
                    line = [my_max_min_function(chunk)[2] for chunk in divide_chunks(line, time1)]

                reply.append({'stationName': station, 'line': line, 'Date_Time': DateObj})

    elif Type == "Month":
        for station in stationName:
            for dateval in MultistartDate:
                startDateObj = datetime.strptime(dateval, "%Y-%m-%d")
                endDateObj = (pd.Timestamp(dateval) + MonthEnd(1)).to_pydatetime()

                dts = [dt.strftime("%d-%m-%Y %H:%M:%S") for dt in datetime_range(startDateObj, endDateObj, timedelta(minutes=time1))]
                if len(allDateTime) < len(dts):
                    allDateTime = dts

                alldates = pd.date_range(startDateObj, endDateObj - timedelta(days=1), freq='d').strftime("%Y-%m-%d").tolist()
                alldates.append(endDateObj.strftime("%Y-%m-%d"))

                line = []
                for d in alldates:
                    d_obj = datetime.strptime(d, "%Y-%m-%d")
                    filter = {
                        'd': {
                            '$gte': datetime(d_obj.year, d_obj.month, d_obj.day, 0, 0, 0, tzinfo=timezone.utc),
                            '$lte': datetime(d_obj.year, d_obj.month, d_obj.day, 0, 0, 0, tzinfo=timezone.utc)
                        },
                        'n': station
                    }
                    result_list = list(ICT_data1.find(filter=filter, projection={'_id': 0, 'p': 1}))
                    line += result_list[0]['p'] if result_list else listofzeros

                for i in range(len(line)):
                    try:
                        if math.isnan(float(line[i])):
                            line[i] = 0
                    except:
                        line[i] = 0

                if time1 > 1:
                    line = [my_max_min_function(chunk)[2] for chunk in divide_chunks(line, time1)]

                reply.append({'stationName': station, 'line': line, 'Date_Time': startDateObj})

    # Append timestamps
    reply.append({'Date_Time': allDateTime})

    # Calculate max, min, avg for each station
    for i in range(len(reply) - 1):
        max_, min_, avg = my_max_min_function(reply[i]['line'])

        if max_[0] == 0 and min_[0] == 0:
            max_, min_ = [[0], []], [[0], []]
        elif len(max_) > 50 and len(min_) > 50:
            max_, min_ = [[max_[0]], []], [[min_[0]], []]
        else:
            max_ = [[max_[0]] * (len(max_)-1), allDateTime[1:len(max_)]]
            min_ = [[min_[0]] * (len(min_)-1), allDateTime[1:len(min_)]]

        reply[i]['max'] = max_
        reply[i]['min'] = min_
        reply[i]['avg'] = avg

    return jsonify(reply)



@app.route('/GetICTDataExcel', methods=['GET', 'POST'])
def GetICTDataExcel():

    global ICT_excel_data

    if len(ICT_excel_data) > 0:

        merged = pd.concat(ICT_excel_data, axis=1, join="inner")
        merged.to_excel(dir_path+"Excel_Files/ICT.xlsx", index=None)

        path = dir_path+"Excel_Files/ICT.xlsx"

        startDate1 = request.args['startDate']
        endDate1 = request.args['endDate']

        startDate1 = startDate1.split(" ")
        endDate1 = endDate1.split(" ")

        startDate = startDate1[0]
        endDate = endDate1[0]

        # startTime = startDate1[1]
        # endTime = endDate1[1]

        stationName = request.args['stationName']
        stationName = stationName.split(',')

        names = ''
        for i in stationName:
            names = names+i+', '

        names = names[:-2]

        if startDate == endDate:
            custom = startDate+' '+' ICT Data of '+names+'.xlsx'

        else:
            custom = startDate+' to '+endDate+' '+' ICT Data of '+names+'.xlsx'

        if os.path.exists(path):
            with open(path, "rb") as excel:
                data = excel.read()

            response = Response(
                data, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

        return send_file(dir_path+'Excel_Files/ICT.xlsx', as_attachment=True, download_name=custom)

    else:
        return jsonify("No Data to Download")


# //////////////////////////////////////////////////////////////////////////////////////////ict/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


# //////////////////////////////////////////////////////////////////////////////////////////frequency/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


@app.route('/FrequencyFileInsert', methods=['GET', 'POST'])
def FrequencyFileInsert():

    startDate = request.args['startDate']
    endDate = request.args['endDate']

    startDateObj = datetime.strptime(startDate, "%Y-%m-%d")
    endDateObj = datetime.strptime(endDate, "%Y-%m-%d")

    path= "http://10.3.100.24/DAILY_DUMP_FILES_SCADA/"

    res= Frequency(startDateObj,endDateObj,path)

    return res


@app.route('/FrequencyNames', methods=['GET', 'POST'])
def FrequencyNames():
    startDate1 = request.args['startDate']
    endDate1 = request.args['endDate']

    startDate = startDate1.split(" ")[0]
    endDate = endDate1.split(" ")[0]

    cache_key = f"FrequencyNames_{startDate}_{endDate}"
    cached_res = cache.get(cache_key)
    if cached_res:
        return cached_res

    res = Names(startDate, endDate, "Frequency")
    cache.set(cache_key, res, timeout=86400)
    return res

@app.route('/MultiFrequencyNames', methods=['GET', 'POST'])
def MultiFrequencyNames():
    MultistartDate = request.args['MultistartDate']
    date_list = MultistartDate.split(',')

    dates_sorted = "_".join(sorted(date_list))
    cache_key = f"MultiFrequencyNames_{dates_sorted}"

    cached_res = cache.get(cache_key)
    if cached_res:
        return cached_res

    res = MultiNames(date_list, "Frequency")
    cache.set(cache_key, res, timeout=86400)
    return res


@app.route('/GetFrequencyData', methods=['GET', 'POST'])
@cache.cached(timeout=86400, query_string=True)
def GetFrequencyData():

    startDate1 = request.args['startDate']
    endDate1 = request.args['endDate']
    stationName = request.args['stationName'].split(',')
    time1 = int(request.args['time'])

    cache_key = f"FrequencyData_{startDate1}_{endDate1}_{stationName}_{time1}"

    cached_res = cache.get(cache_key)
    if cached_res:
        return cached_res

    startTime = startDate1 + ":00"
    endTime = endDate1 + ":00"

    startDateOnly = startDate1.split(" ")[0]
    endDateOnly = endDate1.split(" ")[0]

    startTimeDT = datetime.strptime(startTime, "%Y-%m-%d %H:%M:%S")
    endTimeDT = datetime.strptime(endTime, "%Y-%m-%d %H:%M:%S")

    index1 = startTimeDT.hour * 60 + startTimeDT.minute
    total_minutes = int((endTimeDT - startTimeDT).total_seconds() / 60)
    index2 = index1 + total_minutes

    if time1 > 1 + total_minutes:
        return jsonify("Time ERROR")

    allDateTime = []
    cursor_time = startTimeDT
    while cursor_time <= endTimeDT:
        allDateTime.append(cursor_time.strftime("%d-%m-%Y %H:%M:%S"))
        cursor_time += timedelta(minutes=time1)

    startDateObj = datetime.strptime(startDateOnly, "%Y-%m-%d")
    endDateObj = datetime.strptime(endDateOnly, "%Y-%m-%d")
    date_range = [startDateObj + timedelta(days=x) for x in range((endDateObj - startDateObj).days + 1)]

    reply = []
    names = ''
    merge_list = [pd.DataFrame.from_dict({'Date_Time': allDateTime})]

    for station in stationName:
        names += station + ', '
        frequency = []

        for it in date_range:
            filter = {
                'd': {
                    '$gte': datetime(it.year, it.month, it.day, 0, 0, 0, tzinfo=timezone.utc),
                    '$lte': datetime(it.year, it.month, it.day, 0, 0, 0, tzinfo=timezone.utc)
                },
                'n': station
            }
            project = {'_id': 0, 'p': 1}
            result = frequency_data_collection.find(filter=filter, projection=project)
            result_list = list(result)

            if not result_list:
                frequency += [0] * 1440
            else:
                frequency += result_list[0]['p']

        for i in range(len(frequency)):
            val = float(frequency[i])
            if math.isnan(val):
                frequency[i] = 0

        frequency = frequency[index1:index2+1]

        if time1 == 1:
            reply.append({'stationName': station, 'frequency': frequency})
        else:
            temp_frequency = []
            chunks = list(divide_chunks(frequency, time1))
            for chunk in chunks:
                _, _, avg = my_max_min_function(chunk)
                temp_frequency.append(avg)
            reply.append({'stationName': station, 'frequency': temp_frequency})

    for i in range(len(reply)):
        max_vals, min_vals, avg = my_max_min_function(reply[i]['frequency'])

        if max_vals[0] == 0 and min_vals[0] == 0:
            max_vals, min_vals = [[0], []], [[0], []]
        elif len(max_vals) > 50 and len(min_vals) > 50:
            max_vals, min_vals = [[max_vals[0]], []], [[min_vals[0]], []]
        else:
            max_time = [max_vals[0]] * (len(max_vals)-1)
            min_time = [min_vals[0]] * (len(min_vals)-1)
            max_vals = [max_time, allDateTime[1:len(max_vals)]]
            min_vals = [min_time, allDateTime[1:len(min_vals)]]

        temp_freq_sorted = sorted(reply[i]['frequency'], reverse=True)
        z = list(np.linspace(0, 100, len(temp_freq_sorted)))
        duration = [temp_freq_sorted, z]

        reply[i]['max'] = max_vals
        reply[i]['min'] = min_vals
        reply[i]['avg'] = avg
        reply[i]['Duration'] = duration

    reply.append({'Date_Time': allDateTime})

    for x in range(len(reply) - 1):
        df = pd.DataFrame.from_dict({reply[x]['stationName']: reply[x]['frequency']})
        merge_list.append(df)

    global Frequency_excel_data
    Frequency_excel_data = merge_list

    cache.set(cache_key, reply, timeout=86400)

    return jsonify(reply)



@app.route('/GetMultiFrequencyData', methods=['GET', 'POST'])
def GetMultiFrequencyData():
    MultistartDate = request.args['MultistartDate'].split(',')
    stationName = request.args['MultistationName'].split(',')
    Type = request.args['Type']
    time1 = int(request.args['time'])

    listofzeros = [0] * 1440
    reply = []
    allDateTime = []

    def get_frequency(date_obj, station):
        filter = {
            'd': {
                '$gte': datetime(date_obj.year, date_obj.month, date_obj.day, 0, 0, 0, tzinfo=timezone.utc),
                '$lte': datetime(date_obj.year, date_obj.month, date_obj.day, 0, 0, 0, tzinfo=timezone.utc)
            },
            'n': station
        }
        project = {'_id': 0, 'p': 1}
        result = list(frequency_data_collection.find(filter=filter, projection=project))
        return result[0]['p'] if result else listofzeros

    def clean_data(data):
        for i in range(len(data)):
            try:
                x = float(data[i])
                if math.isnan(x):
                    data[i] = 0
            except:
                data[i] = 0
        return data

    def add_metadata(item, freq_list, datetime_label):
        item['frequency'] = freq_list
        item['Date_Time'] = datetime_label
        maxv, minv, avgv = my_max_min_function(freq_list)

        if maxv[0] == 0 and minv[0] == 0:
            item['max'], item['min'] = [[0], []], [[0], []]
        elif len(maxv) > 50 and len(minv) > 50:
            item['max'], item['min'] = [[maxv[0]], []], [[minv[0]], []]
        else:
            max_list = [maxv[0]] * (len(allDateTime) - 1)
            min_list = [minv[0]] * (len(allDateTime) - 1)
            item['max'] = [max_list, allDateTime[1:]]
            item['min'] = [min_list, allDateTime[1:]]
        item['avg'] = avgv
        sorted_freq = sorted(freq_list, reverse=True)
        z = list(np.linspace(0, 100, len(sorted_freq)))
        item['Duration'] = [sorted_freq, z]
        return item

    if Type == "Date":
        date_obj = datetime.strptime(MultistartDate[0], "%Y-%m-%d")
        allDateTime = [dt.strftime("%H:%M:%S") for dt in datetime_range(date_obj, date_obj + timedelta(days=1), timedelta(minutes=time1))]

        for station in stationName:
            for dateval in MultistartDate:
                current_date = datetime.strptime(dateval, "%Y-%m-%d")
                frequency = []
                frequency += get_frequency(current_date, station)
                frequency = clean_data(frequency)

                if time1 > 1:
                    chunked = divide_chunks(frequency, time1)
                    frequency = [my_max_min_function(chunk)[2] for chunk in chunked]

                item = {'stationName': station}
                reply.append(add_metadata(item, frequency, current_date))

    elif Type == "Month":
        for station in stationName:
            for dateval in MultistartDate:
                start_date = datetime.strptime(dateval, "%Y-%m-%d")
                end_date = pd.Timestamp(dateval) + MonthEnd(1)

                allDateTime_candidate = [dt.strftime("%d-%m-%Y %H:%M:%S")
                                         for dt in datetime_range(start_date, end_date, timedelta(minutes=time1))]
                if len(allDateTime) < len(allDateTime_candidate):
                    allDateTime = allDateTime_candidate

                date_list = pd.date_range(start=start_date, end=end_date).strftime("%Y-%m-%d").tolist()

                frequency = []
                for d in date_list:
                    frequency += get_frequency(datetime.strptime(d, "%Y-%m-%d"), station)

                frequency = clean_data(frequency)

                if time1 > 1:
                    chunked = divide_chunks(frequency, time1)
                    frequency = [my_max_min_function(chunk)[2] for chunk in chunked]

                item = {'stationName': station}
                reply.append(add_metadata(item, frequency, start_date))

    reply.append({'Date_Time': allDateTime})
    return jsonify(reply)



@app.route('/GetFrequencyDataExcel', methods=['GET', 'POST'])
def GetFrequencyDataExcel():

    global Frequency_excel_data

    if len(Frequency_excel_data) > 0:

        merged = pd.concat(Frequency_excel_data, axis=1, join="inner")
        merged.to_excel(
            dir_path+"Excel_Files/Frequency.xlsx", index=None)

        path = dir_path+"Excel_Files/Frequency.xlsx"

        startDate1 = request.args['startDate']
        endDate1 = request.args['endDate']

        startDate1 = startDate1.split(" ")
        endDate1 = endDate1.split(" ")

        startDate = startDate1[0]
        endDate = endDate1[0]

        # startTime = startDate1[1]
        # endTime = endDate1[1]

        stationName = request.args['stationName']
        stationName = stationName.split(',')

        names = ''
        for i in stationName:
            names = names+i+', '

        names = names[:-2]

        if startDate == endDate:
            custom = startDate+' '+' frequency Data of '+names+'.xlsx'

        else:
            custom = startDate+' to '+endDate+' '+' frequency Data of '+names+'.xlsx'

        if os.path.exists(path):
            with open(path, "rb") as excel:
                data = excel.read()

            response = Response(
                data, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        return send_file(dir_path+'Excel_Files/Frequency.xlsx', as_attachment=True, download_name=custom)

    else:
        return jsonify("No Data to Download")


# //////////////////////////////////////////////////////////////////////////////////////////frequency/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


@app.route('/LinesMWMVARNames', methods=['GET', 'POST'])
def LinesMWMVARNames():
    startDate1 = request.args['startDate']
    endDate1 = request.args['endDate']

    startDate = startDate1.split(" ")[0]
    endDate = endDate1.split(" ")[0]

    cache_key = f"LinesMWMVARNames_{startDate}_{endDate}"
    cached_res = cache.get(cache_key)
    if cached_res:
        return cached_res

    res = Names(startDate, endDate, "LinesMWMVAR")
    cache.set(cache_key, res, timeout=86400)
    return res


@app.route('/MultiLinesMWMVARNames', methods=['GET', 'POST'])
def MultiLinesMWMVARNames():
    MultistartDate = request.args['MultistartDate']
    date_list = MultistartDate.split(',')

    dates_sorted = "_".join(sorted(date_list))
    cache_key = f"MultiLinesMWMVARNames_{dates_sorted}"

    cached_res = cache.get(cache_key)
    if cached_res:
        return cached_res

    res = MultiNames(date_list, "LinesMWMVAR")
    cache.set(cache_key, res, timeout=86400)
    return res


@app.route('/LinesMWMVARData', methods=['GET', 'POST'])
def LinesMWMVARData():
    startDate1 = request.args['startDate']
    endDate1 = request.args['endDate']
    stationList = request.args['stationName'].split(',')
    time1 = int(request.args['time'])

    startTime = startDate1 + ":00"
    endTime = endDate1 + ":00"

    startDate = startDate1.split(" ")[0]
    endDate = endDate1.split(" ")[0]

    startTimeFmt = datetime.strptime(startTime, "%Y-%m-%d %H:%M:%S")
    endTimeFmt = datetime.strptime(endTime, "%Y-%m-%d %H:%M:%S")

    index1 = startTimeFmt.hour * 60 + startTimeFmt.minute
    duration_minutes = int((endTimeFmt - startTimeFmt).total_seconds() / 60)
    index2 = index1 + duration_minutes

    if time1 > 1 + duration_minutes:
        return jsonify("Time ERROR")

    allDateTime = []
    current = startTimeFmt
    while current <= endTimeFmt:
        allDateTime.append(current.strftime("%d-%m-%Y %H:%M:%S"))
        current += timedelta(minutes=time1)

    date_range = [datetime.strptime(startDate, "%Y-%m-%d") + timedelta(days=x)
                  for x in range((datetime.strptime(endDate, "%Y-%m-%d") - datetime.strptime(startDate, "%Y-%m-%d")).days + 1)]

    reply = []
    listofzeros = [0] * 1440
    merge_list = [pd.DataFrame.from_dict({'Date_Time': allDateTime})]

    def fetch_line_data(collections, station, day):
        for col in collections:
            result = list(col.find({
                'd': {
                    '$gte': datetime(day.year, day.month, day.day, 0, 0, 0, tzinfo=timezone.utc),
                    '$lte': datetime(day.year, day.month, day.day, 0, 0, 0, tzinfo=timezone.utc)
                },
                'n': station
            }, {'_id': 0, 'p': 1}))
            if result:
                return result[0]['p']
        return listofzeros

    def clean_data(line):
        for i in range(len(line)):
            try:
                x = float(line[i])
                if math.isnan(x):
                    line[i] = 0
            except:
                line[i] = 0
        return line

    for station in stationList:
        temp = station.split(" ")
        is_mw = temp[-1] == "MW"
        is_mvar = temp[-1] == "MVAR"
        name = station[:-3] if is_mw else station[:-5]

        if is_mw:
            collections = [line_mw_data_collection, line_mw_data_collection1, line_mw_data_collection2]
        elif is_mvar:
            collections = [MVAR_P1, MVAR_P2, Lines_MVAR_400_above]
        else:
            continue

        line = []
        for date in date_range:
            line += fetch_line_data(collections, name, date)

        line = clean_data(line)
        line = line[index1:index2+1]

        if time1 == 1:
            result = line
        else:
            result = [my_max_min_function(chunk)[2] for chunk in divide_chunks(line, time1)]

        reply.append({'stationName': name, 'line': result})

    for entry in reply:
        maxv, minv, avgv = my_max_min_function(entry['line'])

        if maxv[0] == 0 and minv[0] == 0:
            maxv, minv = [[0], []], [[0], []]
        elif len(maxv) > 50 and len(minv) > 50:
            maxv, minv = [[maxv[0]], []], [[minv[0]], []]
        else:
            maxv = [[maxv[0]] * (len(allDateTime) - 1), allDateTime[1:]]
            minv = [[minv[0]] * (len(allDateTime) - 1), allDateTime[1:]]

        entry['max'] = maxv
        entry['min'] = minv
        entry['avg'] = avgv

    reply.append({'Date_Time': allDateTime})

    for item in reply[:-1]:
        merge_list.append(pd.DataFrame.from_dict({item['stationName']: item['line']}))

    global Lines_excel_data
    Lines_excel_data = merge_list

    return jsonify(reply)


@app.route('/MultiLinesMWMVARData', methods=['GET', 'POST'])
def MultiLinesMWMVARData():
    MultistartDate = request.args['MultistartDate'].split(',')
    stationNames = request.args['MultistationName'].split(',')
    Type = request.args['Type']
    time1 = int(request.args['time'])
    listofzeros = [0] * 1440

    global Lines_file_name
    reply = []
    allDateTime = []

    def fetch_data(collections, station, date):
        for col in collections:
            result = list(col.find({
                'd': {
                    '$gte': datetime(date.year, date.month, date.day, 0, 0, 0, tzinfo=timezone.utc),
                    '$lte': datetime(date.year, date.month, date.day, 0, 0, 0, tzinfo=timezone.utc)
                },
                'n': station
            }, {'_id': 0, 'p': 1}))
            if result:
                return result[0]['p']
        return listofzeros

    def clean_line(line):
        for i in range(len(line)):
            try:
                x = float(line[i])
                if math.isnan(x):
                    line[i] = 0
            except:
                line[i] = 0
        return line

    def process_station(station, is_mw, collections):
        name = station[:-3] if is_mw else station[:-5]

        for dateval in MultistartDate:
            startDateObj = datetime.strptime(dateval, "%Y-%m-%d")

            if Type == "Date":
                endDateObj = startDateObj
                dts = [dt.strftime("%H:%M:%S") for dt in datetime_range(startDateObj, endDateObj, timedelta(minutes=time1))]
                allDateTime[:] = dts

                line = fetch_data(collections, name, startDateObj)
                line = clean_line(line)

                if time1 == 1:
                    reply.append({'stationName': name, 'line': line, 'Date_Time': startDateObj})
                else:
                    temp_line = [my_max_min_function(chunk)[2] for chunk in divide_chunks(line, time1)]
                    reply.append({'stationName': name, 'line': temp_line, 'Date_Time': startDateObj})

            elif Type == "Month":
                endDateObj = pd.Timestamp(dateval) + MonthEnd(1)
                dts = [dt.strftime("%d-%m-%Y %H:%M:%S") for dt in datetime_range(startDateObj, endDateObj, timedelta(minutes=time1))]
                if len(allDateTime) < len(dts):
                    allDateTime[:] = dts

                alldates = pd.date_range(startDateObj, endDateObj - timedelta(days=1), freq='d').strftime("%Y-%m-%d").tolist()
                alldates.append(endDateObj.strftime("%Y-%m-%d"))

                line = []
                for d in alldates:
                    day = datetime.strptime(d, "%Y-%m-%d")
                    day_line = fetch_data(collections, name, day)
                    line += day_line

                line = clean_line(line)

                if time1 == 1:
                    reply.append({'stationName': name, 'line': line, 'Date_Time': startDateObj})
                else:
                    temp_line = [my_max_min_function(chunk)[2] for chunk in divide_chunks(line, time1)]
                    reply.append({'stationName': name, 'line': temp_line, 'Date_Time': startDateObj})

    for station in stationNames:
        if station.endswith("MW"):
            process_station(station, True, [line_mw_data_collection, line_mw_data_collection1, line_mw_data_collection2])
        elif station.endswith("MVAR"):
            process_station(station, False, [MVAR_P1, MVAR_P2, Lines_MVAR_400_above])

    # Attach min/max/avg
    for entry in reply:
        max_v, min_v, avg = my_max_min_function(entry['line'])

        if max_v[0] == 0 and min_v[0] == 0:
            max_v, min_v = [[0], []], [[0], []]
        elif len(max_v) > 50 and len(min_v) > 50:
            max_v, min_v = [[max_v[0]], []], [[min_v[0]], []]
        else:
            max_v = [[max_v[0]] * (len(allDateTime) - 1), allDateTime[1:]]
            min_v = [[min_v[0]] * (len(allDateTime) - 1), allDateTime[1:]]

        entry['max'], entry['min'], entry['avg'] = max_v, min_v, avg

    reply.append({'Date_Time': allDateTime})
    return jsonify(reply)



# ///////////////////////////////////////////////////////////////////////////////////Demand/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

@app.route('/DemandFileInsert', methods=['GET', 'POST'])
def DemandFileInsert():

    startDate = request.args['startDate']
    endDate = request.args['endDate']

    startDateObj = datetime.strptime(startDate, "%Y-%m-%d")
    endDateObj = datetime.strptime(endDate, "%Y-%m-%d")

    path= "http://10.3.100.24/ScadaData/er_web/"

    res = Demand(startDateObj,endDateObj,path)

    return res

@app.route('/DemandMinNames', methods=['GET', 'POST'])
def DemandMinNames():
    startDate1 = request.args['startDate']
    endDate1 = request.args['endDate']

    startDate = startDate1.split(" ")[0]
    endDate = endDate1.split(" ")[0]

    cache_key = f"DemandMinNames_{startDate}_{endDate}"
    cached_res = cache.get(cache_key)
    if cached_res:
        return cached_res

    res = Names(startDate, endDate, "Demand")
    cache.set(cache_key, res, timeout=86400)
    return res

@app.route('/MultiDemandMinNames', methods=['GET', 'POST'])
def MultiDemandMinNames():
    MultistartDate = request.args['MultistartDate']
    date_list = MultistartDate.split(',')

    dates_sorted = "_".join(sorted(date_list))
    cache_key = f"MultiDemandMinNames_{dates_sorted}"

    cached_res = cache.get(cache_key)
    if cached_res:
        return cached_res

    res = MultiNames(date_list, "Demand")
    cache.set(cache_key, res, timeout=86400)
    return res


@app.route('/GetDemandMinData', methods=['GET', 'POST'])
def GetDemandMinData():
    startDate1 = request.args['startDate']
    endDate1 = request.args['endDate']
    stationName = request.args['stationName'].split(',')
    time1 = int(request.args['time'])

    startTimeStr = startDate1 + ":00"
    endTimeStr = endDate1 + ":00"

    startDate = startDate1.split(" ")[0]
    endDate = endDate1.split(" ")[0]

    startTime = datetime.strptime(startTimeStr, "%Y-%m-%d %H:%M:%S")
    endTime = datetime.strptime(endTimeStr, "%Y-%m-%d %H:%M:%S")

    index1 = startTime.hour * 60 + startTime.minute
    total_minutes = int((endTime - startTime).total_seconds() / 60)
    index2 = index1 + total_minutes

    if time1 > (total_minutes + 1):
        return jsonify("Time ERROR")

    allDateTime = []
    current_time = startTime
    while current_time <= endTime:
        allDateTime.append(current_time.strftime("%d-%m-%Y %H:%M:%S"))
        current_time += timedelta(minutes=time1)

    startDateObj = datetime.strptime(startDate, "%Y-%m-%d")
    endDateObj = datetime.strptime(endDate, "%Y-%m-%d")
    date_range = [startDateObj + timedelta(days=x) for x in range((endDateObj - startDateObj).days + 1)]

    reply = []
    listofzeros = [0] * 1440
    merge_list = []
    merge_list.append(pd.DataFrame.from_dict({'Date_Time': allDateTime}))

    exempt_list = ['CESC DEMAND', 'ALL INDIA DEMAND', 'REG DEMAND']

    for station in stationName:
        output = []

        for day in date_range:
            filter = {
                'd': {
                    '$gte': datetime(day.year, day.month, day.day, 0, 0, 0, tzinfo=timezone.utc),
                    '$lte': datetime(day.year, day.month, day.day, 0, 0, 0, tzinfo=timezone.utc)
                },
                'n': station
            }
            project = {'_id': 0, 'p': 1}

            parts = station.split("_")
            is_demand = (parts[-1] == "DEMAND" or station in exempt_list)

            collection = demand_collection if is_demand else drawal_collection
            result = list(collection.find(filter=filter, projection=project))

            if result:
                output += result[0]['p']
            else:
                output += listofzeros

        for i in range(1, len(output)):
            try:
                if math.isnan(float(output[i])):
                    output[i] = 0
            except:
                output[i] = 0

        output = output[index1:index2 + 1]

        if time1 == 1:
            reply.append({'stationName': station, 'output': output})
        else:
            temp_output = []
            for item in divide_chunks(output, time1):
                _, _, avg = my_max_min_function(item)
                temp_output.append(avg)
            reply.append({'stationName': station, 'output': temp_output})

    for i in range(len(reply)):
        max_val, min_val, avg_val = my_max_min_function(reply[i]['output'])

        if max_val[0] == 0 and min_val[0] == 0:
            reply[i]['max'] = [[0], []]
            reply[i]['min'] = [[0], []]
        elif len(max_val) > 50 and len(min_val) > 50:
            reply[i]['max'] = [[max_val[0]], []]
            reply[i]['min'] = [[min_val[0]], []]
        else:
            reply[i]['max'] = [[max_val[0]] * (len(max_val) - 1), allDateTime[1:]]
            reply[i]['min'] = [[min_val[0]] * (len(min_val) - 1), allDateTime[1:]]

        reply[i]['avg'] = avg_val

        sorted_output = sorted(reply[i]["output"], reverse=True)
        z = list(np.linspace(0, 100, len(sorted_output)))
        reply[i]['Duration'] = [sorted_output, z]

    reply.append({'Date_Time': allDateTime})

    for i in range(len(reply) - 1):
        df = pd.DataFrame.from_dict({reply[i]['stationName']: reply[i]['output']})
        merge_list.append(df)

    global Demand_excel_data
    Demand_excel_data = merge_list

    return jsonify(reply)


@app.route('/GetMultiDemandMinData', methods=['GET', 'POST'])
def GetMultiDemandMinData():
    MultistartDate = request.args['MultistartDate'].split(',')
    stationName = request.args['MultistationName'].split(',')
    Type = request.args['Type']
    time1 = int(request.args['time'])

    listofzeros = [0] * 1440
    reply = []

    if Type == "Date":
        date_obj = datetime.strptime(MultistartDate[0], "%Y-%m-%d")
        allDateTime = [dt.strftime("%H:%M:%S") for dt in datetime_range(date_obj, date_obj + timedelta(days=1), timedelta(minutes=time1))]

        for station in stationName:
            for dateval in MultistartDate:
                DateObj = datetime.strptime(dateval, "%Y-%m-%d")
                output = []

                filter = {
                    'd': {
                        '$gte': datetime(DateObj.year, DateObj.month, DateObj.day, 0, 0, 0, tzinfo=timezone.utc),
                        '$lte': datetime(DateObj.year, DateObj.month, DateObj.day, 0, 0, 0, tzinfo=timezone.utc)
                    },
                    'n': station
                }
                project = {'_id': 0, 'p': 1}
                is_demand = station[-6:] == "DEMAND"

                collection = demand_collection if is_demand else drawal_collection
                data_list = list(collection.find(filter=filter, projection=project))

                if data_list:
                    output += data_list[0]['p']
                else:
                    output += listofzeros

                for i in range(1, len(output)):
                    try:
                        if math.isnan(float(output[i])):
                            output[i] = 0
                    except:
                        output[i] = 0

                if time1 == 1:
                    data = {'stationName': station, 'output': output, 'Date_Time': DateObj}
                else:
                    chunked = list(divide_chunks(output, time1))
                    averaged = [my_max_min_function(chunk)[2] for chunk in chunked]
                    data = {'stationName': station, 'output': averaged, 'Date_Time': DateObj}

                reply.append(data)

        reply.append({'Date_Time': allDateTime})

    elif Type == "Month":
        allDateTime = []

        for station in stationName:
            for dateval in MultistartDate:
                startDateObj = datetime.strptime(dateval, "%Y-%m-%d")
                endDateObj = pd.Timestamp(dateval) + MonthEnd(1)
                dts = [dt.strftime("%d-%m-%Y %H:%M:%S") for dt in datetime_range(startDateObj, endDateObj, timedelta(minutes=time1))]

                if len(allDateTime) < len(dts):
                    allDateTime = dts

                output = []
                filter = {
                    'd': {
                        '$gte': datetime(startDateObj.year, startDateObj.month, startDateObj.day, 0, 0, 0, tzinfo=timezone.utc),
                        '$lte': datetime(endDateObj.year, endDateObj.month, endDateObj.day, 0, 0, 0, tzinfo=timezone.utc)
                    },
                    'n': station
                }
                project = {'_id': 0, 'p': 1}
                is_demand = station[-6:] == "DEMAND"

                collection = demand_collection if is_demand else drawal_collection
                data_list = list(collection.find(filter=filter, projection=project))

                if not data_list:
                    output += listofzeros
                else:
                    for item in data_list:
                        output += item['p']

                for i in range(1, len(output)):
                    try:
                        if math.isnan(float(output[i])):
                            output[i] = 0
                    except:
                        output[i] = 0

                if time1 == 1:
                    data = {'stationName': station, 'output': output, 'Date_Time': startDateObj}
                else:
                    chunked = list(divide_chunks(output, time1))
                    averaged = [my_max_min_function(chunk)[2] for chunk in chunked]
                    data = {'stationName': station, 'output': averaged, 'Date_Time': startDateObj}

                reply.append(data)

        reply.append({'Date_Time': allDateTime})

    for i in range(len(reply) - 1):
        output = reply[i]['output']
        max_val, min_val, avg_val = my_max_min_function(output)

        if max_val[0] == 0 and min_val[0] == 0:
            reply[i]['max'] = [[0], []]
            reply[i]['min'] = [[0], []]
        elif len(max_val) > 50 and len(min_val) > 50:
            reply[i]['max'] = [[max_val[0]], []]
            reply[i]['min'] = [[min_val[0]], []]
        else:
            reply[i]['max'] = [[max_val[0]] * (len(max_val) - 1), allDateTime[1:]]
            reply[i]['min'] = [[min_val[0]] * (len(min_val) - 1), allDateTime[1:]]

        reply[i]['avg'] = avg_val

        sorted_output = sorted(output, reverse=True)
        z = list(np.linspace(0, 100, len(sorted_output)))
        reply[i]['Duration'] = [sorted_output, z]

    return jsonify(reply)



@app.route('/GetDemandMinDataExcel', methods=['GET', 'POST'])
def GetDemandMinDataExcel():

    global Demand_excel_data

    if len(Demand_excel_data) > 0:

        merged = pd.concat(Demand_excel_data, axis=1, join="inner")
        
        merged.to_excel(
            dir_path+"Excel_Files/Demand.xlsx", index=None)

        path = dir_path+"Excel_Files/Demand.xlsx"

        startDate1 = request.args['startDate']
        endDate1 = request.args['endDate']

        startDate1 = startDate1.split(" ")
        endDate1 = endDate1.split(" ")

        startDate = startDate1[0]
        endDate = endDate1[0]

        # startTime = startDate1[1]
        # endTime = endDate1[1]

        stationName = request.args['stationName']
        stationName = stationName.split(',')

        names = ''
        for i in stationName:
            names = names+i+', '

        names = names[:-2]

        if startDate == endDate:
            custom = startDate+' '+' Demand Data of '+names+'.xlsx'

        else:
            custom = startDate+' to '+endDate+' '+' Demand Data of '+names+'.xlsx'

        if os.path.exists(path):
            with open(path, "rb") as excel:
                data = excel.read()

            response = Response(
                data, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        return send_file(dir_path+'Excel_Files/Demand.xlsx', as_attachment=True, download_name=custom)

    else:
        return jsonify("No Data to Download")


# ///////////////////////////////////////////////////////////////////////////////////Generator/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

@app.route('/GeneratorFileInsert', methods=['GET', 'POST'])
def GeneratorFileInsert():

    startDate = request.args['startDate']
    endDate = request.args['endDate']

    startDateObj = datetime.strptime(startDate, "%Y-%m-%d")
    endDateObj = datetime.strptime(endDate, "%Y-%m-%d")

    path= "http://10.3.100.24/DAILY_DUMP_FILES_SCADA/"

    res= Generator(startDateObj,endDateObj,path)

    return res


@app.route('/GeneratorNames', methods=['GET', 'POST'])
def GeneratorNames():
    startDate1 = request.args['startDate']
    endDate1 = request.args['endDate']

    startDate = startDate1.split(" ")[0]
    endDate = endDate1.split(" ")[0]

    cache_key = f"GeneratorNames_{startDate}_{endDate}"
    cached_res = cache.get(cache_key)
    if cached_res:
        return cached_res

    res = Names(startDate, endDate, "Generator")
    cache.set(cache_key, res, timeout=86400)
    return res

@app.route('/MultiGeneratorNames', methods=['GET', 'POST'])
def MultiGeneratorNames():
    MultistartDate = request.args['MultistartDate']
    date_list = MultistartDate.split(',')

    dates_sorted = "_".join(sorted(date_list))
    cache_key = f"MultiGeneratorNames_{dates_sorted}"

    cached_res = cache.get(cache_key)
    if cached_res:
        return cached_res

    res = MultiNames(date_list, "Generator")
    cache.set(cache_key, res, timeout=86400)
    return res


@app.route('/GetGeneratorData', methods=['GET', 'POST'])
def GetGeneratorData():
    startDate1 = request.args['startDate']
    endDate1 = request.args['endDate']
    stationName = request.args['stationName'].split(',')
    time1 = int(request.args['time'])

    start_datetime = datetime.strptime(startDate1 + ":00", "%Y-%m-%d %H:%M:%S")
    end_datetime = datetime.strptime(endDate1 + ":00", "%Y-%m-%d %H:%M:%S")

    startDate = startDate1.split(" ")[0]
    endDate = endDate1.split(" ")[0]

    index1 = start_datetime.hour * 60 + start_datetime.minute
    duration_minutes = int((end_datetime - start_datetime).total_seconds() / 60)
    index2 = index1 + duration_minutes

    if time1 > 1 + duration_minutes:
        return jsonify("Time ERROR")

    allDateTime = []
    temp_time = start_datetime
    while temp_time <= end_datetime:
        allDateTime.append(temp_time.strftime("%d-%m-%Y %H:%M:%S"))
        temp_time += timedelta(minutes=time1)

    startDateObj = datetime.strptime(startDate, "%Y-%m-%d")
    endDateObj = datetime.strptime(endDate, "%Y-%m-%d")
    date_range = [startDateObj + timedelta(days=x) for x in range((endDateObj - startDateObj).days + 1)]

    reply = []
    listofzeros = [0] * 1440
    names = ''
    merge_list = [pd.DataFrame.from_dict({'Date_Time': allDateTime})]

    for station in stationName:
        names += station + ', '
        output = []

        for date_val in date_range:
            filter = {
                'd': {
                    '$gte': datetime(date_val.year, date_val.month, date_val.day, 0, 0, 0, tzinfo=timezone.utc),
                    '$lte': datetime(date_val.year, date_val.month, date_val.day, 0, 0, 0, tzinfo=timezone.utc)
                },
                'n': station
            }
            project = {'_id': 0, 'p': 1}
            generator_result = Generator_DB.find(filter=filter, projection=project)
            generator_list = list(generator_result)

            output += generator_list[0]['p'] if generator_list else listofzeros

        for i in range(1, len(output)):
            try:
                if math.isnan(float(output[i])):
                    output[i] = 0
            except:
                output[i] = 0

        output = output[index1:index2 + 1]

        if time1 == 1:
            data = {'stationName': station, 'output': output}
        else:
            chunked = list(divide_chunks(output, time1))
            temp_output = [my_max_min_function(chunk)[2] for chunk in chunked]
            data = {'stationName': station, 'output': temp_output}

        reply.append(data)

    for i in range(len(reply)):
        output = reply[i]['output']
        max_val, min_val, avg_val = my_max_min_function(output)

        if max_val[0] == 0 and min_val[0] == 0:
            reply[i]['max'] = [[0], []]
            reply[i]['min'] = [[0], []]
        elif len(max_val) > 50 and len(min_val) > 50:
            reply[i]['max'] = [[max_val[0]], []]
            reply[i]['min'] = [[min_val[0]], []]
        else:
            time_labels = allDateTime[1:]
            reply[i]['max'] = [[max_val[0]] * (len(max_val) - 1), time_labels]
            reply[i]['min'] = [[min_val[0]] * (len(min_val) - 1), time_labels]

        reply[i]['avg'] = avg_val

        sorted_output = sorted(output, reverse=True)
        z = list(np.linspace(0, 100, len(sorted_output)))
        reply[i]['Duration'] = [sorted_output, z]

    reply.append({'Date_Time': allDateTime})

    for x in range(len(reply) - 1):
        df1 = pd.DataFrame.from_dict({reply[x]['stationName']: reply[x]['output']})
        merge_list.append(df1)

    global Generator_excel_data
    Generator_excel_data = merge_list

    return jsonify(reply)


@app.route('/GetMultiGeneratorData', methods=['GET', 'POST'])
def GetMultiGeneratorData():
    MultistartDate = request.args['MultistartDate'].split(',')
    stationNames = request.args['MultistationName'].split(',')
    Type = request.args['Type']
    time1 = int(request.args['time'])

    listofzeros = [0] * 1440
    reply = []
    allDateTime = []

    for station in stationNames:
        for dateval in MultistartDate:
            if Type == "Date":
                startDateObj = datetime.strptime(dateval, "%Y-%m-%d")
                endDateObj = startDateObj
                date_filter = {
                    '$gte': datetime(startDateObj.year, startDateObj.month, startDateObj.day, 0, 0, 0, tzinfo=timezone.utc),
                    '$lte': datetime(startDateObj.year, startDateObj.month, startDateObj.day, 0, 0, 0, tzinfo=timezone.utc)
                }
                dts = [dt.strftime("%H:%M:%S") for dt in datetime_range(startDateObj, endDateObj, timedelta(minutes=time1))]
            else:  # Type == "Month"
                startDateObj = datetime.strptime(dateval, "%Y-%m-%d")
                endDateObj = pd.Timestamp(dateval) + MonthEnd(1)
                date_filter = {
                    '$gte': datetime(startDateObj.year, startDateObj.month, startDateObj.day, 0, 0, 0, tzinfo=timezone.utc),
                    '$lte': datetime(endDateObj.year, endDateObj.month, endDateObj.day, 0, 0, 0, tzinfo=timezone.utc)
                }
                dts = [dt.strftime("%d-%m-%Y %H:%M:%S") for dt in datetime_range(startDateObj, endDateObj, timedelta(minutes=time1))]
                if len(allDateTime) < len(dts):
                    allDateTime = dts

            if Type == "Date":
                allDateTime = dts

            generator_list = list(Generator_DB.find({'d': date_filter, 'n': station}, {'_id': 0, 'p': 1}))
            output = []

            if not generator_list:
                output.extend(listofzeros)
            else:
                for item in generator_list:
                    output.extend(item['p'])

            for i in range(1, len(output)):
                try:
                    x = float(output[i])
                    if math.isnan(x):
                        output[i] = 0
                except:
                    output[i] = 0

            if time1 == 1:
                reply.append({'stationName': station, 'output': output, 'Date_Time': startDateObj})
            else:
                temp_output = []
                for chunk in divide_chunks(output, time1):
                    _, _, avg_1 = my_max_min_function(chunk)
                    temp_output.append(avg_1)
                reply.append({'stationName': station, 'output': temp_output, 'Date_Time': startDateObj})

    reply.append({'Date_Time': allDateTime})

    for i in range(len(reply) - 1):
        output = reply[i]['output']
        max_vals, min_vals, avg_val = my_max_min_function(output)

        if max_vals[0] == 0 and min_vals[0] == 0:
            max_vals = [[0], []]
            min_vals = [[0], []]
        elif len(max_vals) > 50 and len(min_vals) > 50:
            max_vals = [[max_vals[0]], []]
            min_vals = [[min_vals[0]], []]
        else:
            l1 = [max_vals[0]] * (len(max_vals) - 1)
            l2 = allDateTime[1:len(max_vals)]
            max_vals = [l1, l2]

            l1 = [min_vals[0]] * (len(min_vals) - 1)
            l2 = allDateTime[1:len(min_vals)]
            min_vals = [l1, l2]

        reply[i]['max'] = max_vals
        reply[i]['min'] = min_vals
        reply[i]['avg'] = avg_val

        temp_freq_lst = sorted(output, reverse=True)
        z = list(np.linspace(0, 100, len(temp_freq_lst)))
        reply[i]['Duration'] = [temp_freq_lst, z]

    return jsonify(reply)



@app.route('/GetGeneratorDataExcel', methods=['GET', 'POST'])
def GetGeneratorDataExcel():

    merged = pd.concat(Generator_excel_data, axis=1, join="inner")

    merged.to_excel(
        dir_path+"Excel_Files/Generator.xlsx", index=None)

    path = dir_path+"Excel_Files/Generator.xlsx"

    startDate1 = request.args['startDate']
    endDate1 = request.args['endDate']

    startDate1 = startDate1.split(" ")
    endDate1 = endDate1.split(" ")

    startDate = startDate1[0]
    endDate = endDate1[0]

    # startTime = startDate1[1]
    # endTime = endDate1[1]

    stationName = request.args['stationName']
    stationName = stationName.split(',')

    names = ''
    for i in stationName:
        names = names+i+', '

    names = names[:-2]

    if startDate == endDate:
        custom = startDate+' '+' Generator Data of '+names+'.xlsx'

    else:
        custom = startDate+' to '+endDate+' '+' Generator Data of '+names+'.xlsx'

    if os.path.exists(path):
        with open(path, "rb") as excel:
            data = excel.read()

        response = Response(
            data, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        return send_file(dir_path+'Excel_Files/Generator.xlsx', as_attachment=True, download_name=custom)

    else:
        return jsonify("No Data to Download")

# ////////////////////////////////////////////////////////////////////////////////////////////Thermal-Generator///////////////////////////////////////////////////////////////////////////////////////

@app.route('/ThGeneratorFileInsert', methods=['GET', 'POST'])
def ThGeneratorFileInsert():

    startDate = request.args['startDate']
    endDate = request.args['endDate']

    startDateObj = datetime.strptime(startDate, "%Y-%m-%d")
    endDateObj = datetime.strptime(endDate, "%Y-%m-%d")

    path = "http://10.3.100.24/ScadaData/er_web/"

    res= Thermal_Generator(startDateObj,endDateObj,path)

    return res


@app.route('/ThGeneratorNames', methods=['GET', 'POST'])
def ThGeneratorNames():
    startDate1 = request.args['startDate']
    endDate1 = request.args['endDate']

    startDate = startDate1.split(" ")[0]
    endDate = endDate1.split(" ")[0]

    cache_key = f"ThGeneratorNames_{startDate}_{endDate}"
    cached_res = cache.get(cache_key)
    if cached_res:
        return cached_res

    res = Names(startDate, endDate, "ThGenerator")
    cache.set(cache_key, res, timeout=86400)
    return res



@app.route('/MultiThGeneratorNames', methods=['GET', 'POST'])
def ThMultiGeneratorNames():
    MultistartDate = request.args['MultistartDate']
    date_list = MultistartDate.split(',')

    dates_sorted = "_".join(sorted(date_list))
    cache_key = f"MultiThGeneratorNames_{dates_sorted}"

    cached_res = cache.get(cache_key)
    if cached_res:
        return cached_res

    res = MultiNames(date_list, "ThGenerator")
    cache.set(cache_key, res, timeout=86400)
    return res


@app.route('/GetThGeneratorData', methods=['GET', 'POST'])
def GetThGeneratorData():
    # Extract and validate parameters
    start_str = request.args.get('startDate') or request.form.get('startDate')
    end_str = request.args.get('endDate') or request.form.get('endDate')
    station_str = request.args.get('stationName') or request.form.get('stationName')
    time_interval = request.args.get('time') or request.form.get('time')

    if not all([start_str, end_str, station_str, time_interval]):
        return jsonify({"error": "Missing one or more required parameters"}), 400

    try:
        station_list = station_str.split(',')
        time_interval = int(time_interval)
        start_dt = datetime.strptime(start_str + ":00", "%Y-%m-%d %H:%M:%S")
        end_dt = datetime.strptime(end_str + ":00", "%Y-%m-%d %H:%M:%S")
    except Exception as e:
        return jsonify({"error": f"Invalid date/time format: {e}"}), 400

    total_minutes = int((end_dt - start_dt).total_seconds() / 60)
    if time_interval > (total_minutes + 1):
        return jsonify("Time ERROR"), 400

    # Create list of all time points
    allDateTime = []
    cursor = start_dt
    while cursor <= end_dt:
        allDateTime.append(cursor.strftime("%d-%m-%Y %H:%M:%S"))
        cursor += timedelta(minutes=time_interval)

    # Get start and end indexes
    index_start = start_dt.hour * 60 + start_dt.minute
    index_end = index_start + total_minutes

    # Generate date range list
    start_date = start_dt.date()
    end_date = end_dt.date()
    date_range = [start_date + timedelta(days=i) for i in range((end_date - start_date).days + 1)]

    reply = []
    merge_list = [pd.DataFrame({'Date_Time': allDateTime})]
    list_of_zeros = [0] * 1440

    for station in station_list:
        full_output = []

        for day in date_range:
            filter = {
                'd': {
                    '$gte': datetime(day.year, day.month, day.day, 0, 0, 0, tzinfo=timezone.utc),
                    '$lte': datetime(day.year, day.month, day.day, 0, 0, 0, tzinfo=timezone.utc)
                },
                'n': station
            }

            projection = {'_id': 0, 'p': 1}
            results = list(Th_Gen_DB.find(filter=filter, projection=projection))

            if results:
                full_output += results[0]['p']
            else:
                full_output += list_of_zeros

        # Clean NaN or non-numeric
        for i in range(len(full_output)):
            try:
                if math.isnan(float(full_output[i])):
                    full_output[i] = 0
            except:
                full_output[i] = 0

        sliced_output = full_output[index_start:index_end + 1]

        if time_interval == 1:
            reply.append({'stationName': station, 'output': sliced_output})
        else:
            chunks = list(divide_chunks(sliced_output, time_interval))
            averaged = [my_max_min_function(chunk)[2] for chunk in chunks]
            reply.append({'stationName': station, 'output': averaged})

    # Add max, min, avg, and Duration
    for i, item in enumerate(reply):
        max_v, min_v, avg_v = my_max_min_function(item['output'])

        if max_v[0] == 0 and min_v[0] == 0:
            max_v = [[0], []]
            min_v = [[0], []]
        elif len(max_v) > 50 and len(min_v) > 50:
            max_v = [[max_v[0]], []]
            min_v = [[min_v[0]], []]
        else:
            max_times = [max_v[0]] * (len(max_v) - 1)
            max_labels = [allDateTime[x] for x in range(1, len(max_v))]
            max_v = [max_times, max_labels]

            min_times = [min_v[0]] * (len(min_v) - 1)
            min_labels = [allDateTime[y] for y in range(1, len(min_v))]
            min_v = [min_times, min_labels]

        item['max'] = max_v
        item['min'] = min_v
        item['avg'] = avg_v

        sorted_output = sorted(item['output'], reverse=True)
        linspace = list(np.linspace(0, 100, len(sorted_output)))
        item['Duration'] = [sorted_output, linspace]

    reply.append({'Date_Time': allDateTime})

    # Prepare Excel data
    for item in reply[:-1]:
        df = pd.DataFrame({item['stationName']: item['output']})
        merge_list.append(df)

    global ThGenerator_excel_data
    ThGenerator_excel_data = merge_list

    return jsonify(reply)


@app.route('/GetMultiThGeneratorData', methods=['GET', 'POST'])
def GetMultiThGeneratorData():
    multistart_dates = request.args.get('MultistartDate')
    multistation_names = request.args.get('MultistationName')
    data_type = request.args.get('Type')
    time_interval = request.args.get('time')

    if not all([multistart_dates, multistation_names, data_type, time_interval]):
        return jsonify({'error': 'Missing required parameters'}), 400

    try:
        multistart_dates = multistart_dates.split(',')
        station_list = multistation_names.split(',')
        time_interval = int(time_interval)
    except:
        return jsonify({'error': 'Invalid input format'}), 400

    list_of_zeros = [0] * 1440
    reply = []
    allDateTime = []

    if data_type == "Date":
        allDateTime = [
            dt.strftime("%H:%M:%S") for dt in datetime_range(
                datetime.strptime(multistart_dates[0], "%Y-%m-%d"),
                datetime.strptime(multistart_dates[0], "%Y-%m-%d"),
                timedelta(minutes=time_interval)
            )
        ]

        for station in station_list:
            for date_str in multistart_dates:
                date_obj = datetime.strptime(date_str, "%Y-%m-%d")
                filter = {
                    'd': {
                        '$gte': datetime(date_obj.year, date_obj.month, date_obj.day, 0, 0, 0, tzinfo=timezone.utc),
                        '$lte': datetime(date_obj.year, date_obj.month, date_obj.day, 0, 0, 0, tzinfo=timezone.utc)
                    },
                    'n': station
                }
                projection = {'_id': 0, 'p': 1}
                result = list(Th_Gen_DB.find(filter=filter, projection=projection))
                output = result[0]['p'] if result else list_of_zeros[:]

                for i in range(len(output)):
                    try:
                        if math.isnan(float(output[i])):
                            output[i] = 0
                    except:
                        output[i] = 0

                if time_interval == 1:
                    reply.append({'stationName': station, 'output': output, 'Date_Time': date_obj})
                else:
                    chunks = list(divide_chunks(output, time_interval))
                    averaged = [my_max_min_function(chunk)[2] for chunk in chunks]
                    reply.append({'stationName': station, 'output': averaged, 'Date_Time': date_obj})

        reply.append({'Date_Time': allDateTime})

    elif data_type == "Month":
        for station in station_list:
            for date_str in multistart_dates:
                start_date_obj = datetime.strptime(date_str, "%Y-%m-%d")
                end_date_obj = pd.Timestamp(date_str) + MonthEnd(1)

                dts = [dt.strftime("%d-%m-%Y %H:%M:%S") for dt in datetime_range(
                    start_date_obj, end_date_obj, timedelta(minutes=time_interval)
                )]

                if len(allDateTime) < len(dts):
                    allDateTime = dts

                filter = {
                    'd': {
                        '$gte': datetime(start_date_obj.year, start_date_obj.month, start_date_obj.day, 0, 0, 0, tzinfo=timezone.utc),
                        '$lte': datetime(end_date_obj.year, end_date_obj.month, end_date_obj.day, 0, 0, 0, tzinfo=timezone.utc)
                    },
                    'n': station
                }
                projection = {'_id': 0, 'p': 1}
                result = list(Th_Gen_DB.find(filter=filter, projection=projection))
                output = []

                for entry in result:
                    output.extend(entry['p'])

                for i in range(len(output)):
                    try:
                        if math.isnan(float(output[i])):
                            output[i] = 0
                    except:
                        output[i] = 0

                if time_interval == 1:
                    reply.append({'stationName': station, 'output': output, 'Date_Time': start_date_obj})
                else:
                    chunks = list(divide_chunks(output, time_interval))
                    averaged = [my_max_min_function(chunk)[2] for chunk in chunks]
                    reply.append({'stationName': station, 'output': averaged, 'Date_Time': start_date_obj})

        reply.append({'Date_Time': allDateTime})

    for i in range(len(reply) - 1):
        max_v, min_v, avg_v = my_max_min_function(reply[i]['output'])

        if max_v[0] == 0 and min_v[0] == 0:
            max_v = [[0], []]
            min_v = [[0], []]
        elif len(max_v) > 50 and len(min_v) > 50:
            max_v = [[max_v[0]], []]
            min_v = [[min_v[0]], []]
        else:
            max_vals = [max_v[0]] * (len(max_v) - 1)
            max_times = [allDateTime[j] for j in range(1, len(max_v))]
            max_v = [max_vals, max_times]

            min_vals = [min_v[0]] * (len(min_v) - 1)
            min_times = [allDateTime[j] for j in range(1, len(min_v))]
            min_v = [min_vals, min_times]

        reply[i]['max'] = max_v
        reply[i]['min'] = min_v
        reply[i]['avg'] = avg_v

        freq_sorted = sorted(reply[i]['output'], reverse=True)
        freq_percent = list(np.linspace(0, 100, len(freq_sorted)))
        reply[i]['Duration'] = [freq_sorted, freq_percent]

    return jsonify(reply)



@app.route('/GetThGeneratorDataExcel', methods=['GET', 'POST'])
def GetThGeneratorDataExcel():

    merged = pd.concat(ThGenerator_excel_data, axis=1, join="inner")

    merged.to_excel(
        dir_path+"Excel_Files/ThGenerator.xlsx", index=None)

    path = dir_path+"Excel_Files/ThGenerator.xlsx"

    startDate1 = request.args['startDate']
    endDate1 = request.args['endDate']

    startDate1 = startDate1.split(" ")
    endDate1 = endDate1.split(" ")

    startDate = startDate1[0]
    endDate = endDate1[0]

    # startTime = startDate1[1]
    # endTime = endDate1[1]

    stationName = request.args['stationName']
    stationName = stationName.split(',')

    names = ''
    for i in stationName:
        names = names+i+', '

    names = names[:-2]

    if startDate == endDate:
        custom = startDate+' '+' Thermal Generator Data of '+names+'.xlsx'

    else:
        custom = startDate+' to '+endDate+' '+' Thermal Generator Data of '+names+'.xlsx'

    if os.path.exists(path):
        with open(path, "rb") as excel:
            data = excel.read()

        response = Response(
            data, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        return send_file(dir_path+'Excel_Files/ThGenerator.xlsx', as_attachment=True, download_name=custom)

    else:
        return jsonify("No Data to Download")


# ///////////////////////////////////////////////////////////////////////////////////ISGS/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


@app.route('/ISGSFileInsert', methods=['GET', 'POST'])
def ISGSFileInsert():

    startDate = request.args['startDate']
    endDate = request.args['endDate']

    startDateObj = datetime.strptime(startDate, "%Y-%m-%d")
    endDateObj = datetime.strptime(endDate, "%Y-%m-%d")

    path= "http://10.3.100.24/ScadaData/er_web/"

    res= ISGS(startDateObj,endDateObj,path)

    return res


@app.route('/ISGSNames', methods=['GET', 'POST'])
def ISGSNames():
    startDate1 = request.args['startDate']
    endDate1 = request.args['endDate']

    startDate = startDate1.split(" ")[0]
    endDate = endDate1.split(" ")[0]

    cache_key = f"ISGSNames_{startDate}_{endDate}"
    cached_res = cache.get(cache_key)
    if cached_res:
        return cached_res

    res = Names(startDate, endDate, "ISGS")
    cache.set(cache_key, res, timeout=86400)
    return res


@app.route('/MultiISGSNames', methods=['GET', 'POST'])
def MultiISGSNames():
    MultistartDate = request.args['MultistartDate']
    date_list = MultistartDate.split(',')

    dates_sorted = "_".join(sorted(date_list))
    cache_key = f"MultiISGSNames_{dates_sorted}"

    cached_res = cache.get(cache_key)
    if cached_res:
        return cached_res

    res = MultiNames(date_list, "ISGS")
    cache.set(cache_key, res, timeout=86400)
    return res



@app.route('/GetISGSData', methods=['GET', 'POST'])
def GetISGSData():
    # Parameter extraction with fallback for POST data
    startDateStr = request.args.get('startDate') or request.form.get('startDate')
    endDateStr = request.args.get('endDate') or request.form.get('endDate')
    stationNames = request.args.get('stationName') or request.form.get('stationName')
    time_interval = request.args.get('time') or request.form.get('time')

    # Validate required parameters
    if not all([startDateStr, endDateStr, stationNames, time_interval]):
        return jsonify({"error": "Missing one or more required parameters"}), 400

    try:
        station_list = stationNames.split(',')
        time_interval = int(time_interval)
        startTime = datetime.strptime(startDateStr + ":00", "%Y-%m-%d %H:%M:%S")
        endTime = datetime.strptime(endDateStr + ":00", "%Y-%m-%d %H:%M:%S")
    except Exception as e:
        return jsonify({"error": f"Invalid date or time format: {e}"}), 400

    # Duration check
    total_minutes = int((endTime - startTime).total_seconds() / 60)
    if time_interval > (total_minutes + 1):
        return jsonify("Time ERROR"), 400

    # Generate datetime points
    allDateTime = []
    dt_cursor = startTime
    while dt_cursor <= endTime:
        allDateTime.append(dt_cursor.strftime("%d-%m-%Y %H:%M:%S"))
        dt_cursor += timedelta(minutes=time_interval)

    # Calculate index range
    index_start = startTime.hour * 60 + startTime.minute
    index_end = index_start + total_minutes

    # Generate list of all dates in the range
    date_range = [startTime.date() + timedelta(days=i) for i in range((endTime.date() - startTime.date()).days + 1)]
    
    reply = []
    zeros_per_day = [0] * 1440
    merge_list = [pd.DataFrame.from_dict({'Date_Time': allDateTime})]

    for station in station_list:
        full_output = []

        for single_date in date_range:
            filter = {
                'd': {
                    '$gte': datetime(single_date.year, single_date.month, single_date.day, 0, 0, 0, tzinfo=timezone.utc),
                    '$lte': datetime(single_date.year, single_date.month, single_date.day, 0, 0, 0, tzinfo=timezone.utc)
                },
                'n': station
            }
            project = {'_id': 0, 'p': 1}
            results = list(ISGS_DB.find(filter=filter, projection=project))

            if not results:
                full_output += zeros_per_day
            else:
                full_output += results[0]['p']

        # Handle NaN and invalid entries
        for i in range(len(full_output)):
            try:
                if math.isnan(float(full_output[i])):
                    full_output[i] = 0
            except:
                full_output[i] = 0

        output_slice = full_output[index_start:index_end + 1]

        if time_interval == 1:
            reply.append({'stationName': station, 'output': output_slice})
        else:
            grouped = list(divide_chunks(output_slice, time_interval))
            averaged = [my_max_min_function(chunk)[2] for chunk in grouped]
            reply.append({'stationName': station, 'output': averaged})

    # Calculate max, min, avg, duration for each station
    for i, item in enumerate(reply):
        max_v, min_v, avg_v = my_max_min_function(item['output'])

        if max_v[0] == 0 and min_v[0] == 0:
            max_v = [[0], []]
            min_v = [[0], []]
        elif len(max_v) > 50 and len(min_v) > 50:
            max_v = [[max_v[0]], []]
            min_v = [[min_v[0]], []]
        else:
            max_times = [max_v[0]] * (len(max_v) - 1)
            max_labels = [allDateTime[x] for x in range(1, len(max_v))]
            max_v = [max_times, max_labels]

            min_times = [min_v[0]] * (len(min_v) - 1)
            min_labels = [allDateTime[y] for y in range(1, len(min_v))]
            min_v = [min_times, min_labels]

        item['max'] = max_v
        item['min'] = min_v
        item['avg'] = avg_v

        sorted_output = sorted(item['output'], reverse=True)
        linspace = list(np.linspace(0, 100, len(sorted_output)))
        item['Duration'] = [sorted_output, linspace]

    reply.append({'Date_Time': allDateTime})

    # Prepare for Excel download (global var if needed)
    for item in reply[:-1]:
        df = pd.DataFrame.from_dict({item['stationName']: item['output']})
        merge_list.append(df)

    global ISGS_excel_data
    ISGS_excel_data = merge_list

    return jsonify(reply)

@app.route('/GetMultiISGSData', methods=['GET', 'POST'])
def GetMultiISGSData():
    # Parse request arguments
    MultistartDate = request.args['MultistartDate'].split(',')
    stationNames = request.args['MultistationName'].split(',')
    query_type = request.args['Type']
    time_interval = int(request.args['time'])

    listofzeros = [0] * 1440
    reply = []
    allDateTime = []

    def fetch_data(station, start_date, end_date):
        """Fetch ISGS data from DB for a station and date range"""
        filter_query = {
            'd': {
                '$gte': datetime(start_date.year, start_date.month, start_date.day, 0, 0, 0, tzinfo=timezone.utc),
                '$lte': datetime(end_date.year, end_date.month, end_date.day, 0, 0, 0, tzinfo=timezone.utc)
            },
            'n': station
        }
        projection = {'_id': 0, 'p': 1}
        return list(ISGS_DB.find(filter=filter_query, projection=projection))

    def clean_output(raw_output):
        """Replace NaNs with zero"""
        for i in range(1, len(raw_output)):
            try:
                if math.isnan(float(raw_output[i])):
                    raw_output[i] = 0
            except:
                raw_output[i] = 0
        return raw_output

    def process_output(station, output, date_obj):
        """Aggregate and compute stats for the output"""
        if time_interval == 1:
            return {'stationName': station, 'output': output, 'Date_Time': date_obj}
        else:
            chunks = list(divide_chunks(output, time_interval))
            avg_output = [my_max_min_function(chunk)[2] for chunk in chunks]
            return {'stationName': station, 'output': avg_output, 'Date_Time': date_obj}

    if query_type == "Date":
        startDateObj = datetime.strptime(MultistartDate[0], "%Y-%m-%d")
        endDateObj = datetime.strptime(MultistartDate[0], "%Y-%m-%d")
        allDateTime = [dt.strftime("%H:%M:%S") for dt in datetime_range(startDateObj, endDateObj, timedelta(minutes=time_interval))]

        for station in stationNames:
            for date_str in MultistartDate:
                date_obj = datetime.strptime(date_str, "%Y-%m-%d")
                result = fetch_data(station, date_obj, date_obj)

                output = result[0]['p'] if result else listofzeros
                output = clean_output(output)
                reply.append(process_output(station, output, date_obj))

    elif query_type == "Month":
        for station in stationNames:
            for date_str in MultistartDate:
                startDateObj = datetime.strptime(date_str, "%Y-%m-%d")
                endDateObj = pd.Timestamp(date_str) + MonthEnd(1)

                dts = [dt.strftime("%d-%m-%Y %H:%M:%S") for dt in datetime_range(startDateObj, endDateObj, timedelta(minutes=time_interval))]
                if len(dts) > len(allDateTime):
                    allDateTime = dts

                result = fetch_data(station, startDateObj, endDateObj)
                output = [val for entry in result for val in entry['p']]
                output = clean_output(output)
                reply.append(process_output(station, output, startDateObj))

    # Append Date_Time metadata
    reply.append({'Date_Time': allDateTime})

    # Post-process: compute max, min, avg, duration
    for i in range(len(reply) - 1):  # Skip the last one (Date_Time)
        stats_max, stats_min, stats_avg = my_max_min_function(reply[i]['output'])

        if stats_max[0] == 0 and stats_min[0] == 0:
            stats_max = [[0], []]
            stats_min = [[0], []]
        elif len(stats_max) > 50 and len(stats_min) > 50:
            stats_max = [[stats_max[0]], []]
            stats_min = [[stats_min[0]], []]
        else:
            stats_max = [[stats_max[0]] * (len(allDateTime) - 1), allDateTime[1:]]
            stats_min = [[stats_min[0]] * (len(allDateTime) - 1), allDateTime[1:]]

        reply[i]['max'] = stats_max
        reply[i]['min'] = stats_min
        reply[i]['avg'] = stats_avg

        sorted_output = sorted(reply[i]['output'], reverse=True)
        percentile = list(np.linspace(0, 100, len(sorted_output)))
        reply[i]['Duration'] = [sorted_output, percentile]

    return jsonify(reply)


@app.route('/GetISGSDataExcel', methods=['GET', 'POST'])
def GetISGSDataExcel():
    # Merge and save Excel
    output_path = os.path.join(dir_path, "Excel_Files", "ISGS.xlsx")
    pd.concat(ISGS_excel_data, axis=1, join="inner").to_excel(output_path, index=False)

    # Parse request parameters
    startDateStr = request.args.get('startDate', '').split(" ")[0]
    endDateStr = request.args.get('endDate', '').split(" ")[0]
    stationNames = request.args.get('stationName', '').split(',')

    # Clean station names
    names = ', '.join([name.strip() for name in stationNames if name.strip()])

    # Generate download file name
    if startDateStr == endDateStr:
        filename = f"{startDateStr} ISGS Data of {names}.xlsx"
    else:
        filename = f"{startDateStr} to {endDateStr} ISGS Data of {names}.xlsx"

    # Return file if exists
    if os.path.exists(output_path):
        return send_file(
            output_path,
            as_attachment=True,
            download_name=filename,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
    else:
        return jsonify("No Data to Download")



# /////////////////////////////////////////////////////////////////////////////////////////////Exchange///////////////////////////////////////////////////////////////////////////////////////


@app.route('/ExchangeFileInsert', methods=['GET', 'POST'])
def ExchangeFileInsert():

    startDate = request.args['startDate']
    endDate = request.args['endDate']

    startDateObj = datetime.strptime(startDate, "%Y-%m-%d")
    endDateObj = datetime.strptime(endDate, "%Y-%m-%d")

    path= "http://10.3.100.24/ScadaData/er_web/"

    res= Exchange(startDateObj,endDateObj,path)

    return res


@app.route('/ExchangeNames', methods=['GET', 'POST'])
def ExchangeNames():
    startDate1 = request.args['startDate']
    endDate1 = request.args['endDate']

    startDate = startDate1.split(" ")[0]
    endDate = endDate1.split(" ")[0]

    cache_key = f"ExchangeNames_{startDate}_{endDate}"
    cached_res = cache.get(cache_key)
    if cached_res:
        return cached_res

    res = Names(startDate, endDate, "Exchange")
    cache.set(cache_key, res, timeout=86400)
    return res


@app.route('/MultiExchangeNames', methods=['GET', 'POST'])
def MultiExchangeNames():
    MultistartDate = request.args['MultistartDate']
    date_list = MultistartDate.split(',')

    dates_sorted = "_".join(sorted(date_list))
    cache_key = f"MultiExchangeNames_{dates_sorted}"

    cached_res = cache.get(cache_key)
    if cached_res:
        return cached_res

    res = MultiNames(date_list, "ISGS")
    cache.set(cache_key, res, timeout=86400)
    return res



@app.route('/GetExchangeData', methods=['GET', 'POST'])
def GetExchangeData():
    # Parameter extraction with fallback for POST data
    startDateStr = request.args.get('startDate') or request.form.get('startDate')
    endDateStr = request.args.get('endDate') or request.form.get('endDate')
    stationNames = request.args.get('stationName') or request.form.get('stationName')
    time_interval = request.args.get('time') or request.form.get('time')

    # Validate required parameters
    if not all([startDateStr, endDateStr, stationNames, time_interval]):
        return jsonify({"error": "Missing one or more required parameters"}), 400

    try:
        station_list = stationNames.split(',')
        time_interval = int(time_interval)
        startTime = datetime.strptime(startDateStr + ":00", "%Y-%m-%d %H:%M:%S")
        endTime = datetime.strptime(endDateStr + ":00", "%Y-%m-%d %H:%M:%S")
    except Exception as e:
        return jsonify({"error": f"Invalid date or time format: {e}"}), 400

    # Duration check
    total_minutes = int((endTime - startTime).total_seconds() / 60)
    if time_interval > (total_minutes + 1):
        return jsonify("Time ERROR"), 400

    # Generate datetime points
    allDateTime = []
    dt_cursor = startTime
    while dt_cursor <= endTime:
        allDateTime.append(dt_cursor.strftime("%d-%m-%Y %H:%M:%S"))
        dt_cursor += timedelta(minutes=time_interval)

    # Calculate index range
    index_start = startTime.hour * 60 + startTime.minute
    index_end = index_start + total_minutes

    # Generate list of all dates in the range
    date_range = [startTime.date() + timedelta(days=i) for i in range((endTime.date() - startTime.date()).days + 1)]
    
    reply = []
    zeros_per_day = [0] * 1440
    merge_list = [pd.DataFrame.from_dict({'Date_Time': allDateTime})]

    for station in station_list:
        full_output = []

        for single_date in date_range:
            filter = {
                'd': {
                    '$gte': datetime(single_date.year, single_date.month, single_date.day, 0, 0, 0, tzinfo=timezone.utc),
                    '$lte': datetime(single_date.year, single_date.month, single_date.day, 0, 0, 0, tzinfo=timezone.utc)
                },
                'n': station
            }
            project = {'_id': 0, 'p': 1}
            results = list(Exchange_DB.find(filter=filter, projection=project))

            if not results:
                full_output += zeros_per_day
            else:
                full_output += results[0]['p']

        # Handle NaN and invalid entries
        for i in range(len(full_output)):
            try:
                if math.isnan(float(full_output[i])):
                    full_output[i] = 0
            except:
                full_output[i] = 0

        output_slice = full_output[index_start:index_end + 1]

        if time_interval == 1:
            reply.append({'stationName': station, 'output': output_slice})
        else:
            grouped = list(divide_chunks(output_slice, time_interval))
            averaged = [my_max_min_function(chunk)[2] for chunk in grouped]
            reply.append({'stationName': station, 'output': averaged})

    # Calculate max, min, avg, duration for each station
    for i, item in enumerate(reply):
        max_v, min_v, avg_v = my_max_min_function(item['output'])

        if max_v[0] == 0 and min_v[0] == 0:
            max_v = [[0], []]
            min_v = [[0], []]
        elif len(max_v) > 50 and len(min_v) > 50:
            max_v = [[max_v[0]], []]
            min_v = [[min_v[0]], []]
        else:
            max_times = [max_v[0]] * (len(max_v) - 1)
            max_labels = [allDateTime[x] for x in range(1, len(max_v))]
            max_v = [max_times, max_labels]

            min_times = [min_v[0]] * (len(min_v) - 1)
            min_labels = [allDateTime[y] for y in range(1, len(min_v))]
            min_v = [min_times, min_labels]

        item['max'] = max_v
        item['min'] = min_v
        item['avg'] = avg_v

        sorted_output = sorted(item['output'], reverse=True)
        linspace = list(np.linspace(0, 100, len(sorted_output)))
        item['Duration'] = [sorted_output, linspace]

    reply.append({'Date_Time': allDateTime})

    # Prepare for Excel download (global var if needed)
    for item in reply[:-1]:
        df = pd.DataFrame.from_dict({item['stationName']: item['output']})
        merge_list.append(df)

    global Exchange_excel_data
    Exchange_excel_data = merge_list

    return jsonify(reply)

@app.route('/GetMultiExchangeData', methods=['GET', 'POST'])
def GetMultiExchangeData():
    # Parse request arguments
    MultistartDate = request.args['MultistartDate'].split(',')
    stationNames = request.args['MultistationName'].split(',')
    query_type = request.args['Type']
    time_interval = int(request.args['time'])

    listofzeros = [0] * 1440
    reply = []
    allDateTime = []

    def fetch_data(station, start_date, end_date):
        """Fetch ISGS data from DB for a station and date range"""
        filter_query = {
            'd': {
                '$gte': datetime(start_date.year, start_date.month, start_date.day, 0, 0, 0, tzinfo=timezone.utc),
                '$lte': datetime(end_date.year, end_date.month, end_date.day, 0, 0, 0, tzinfo=timezone.utc)
            },
            'n': station
        }
        projection = {'_id': 0, 'p': 1}
        return list(Exchange_DB.find(filter=filter_query, projection=projection))

    def clean_output(raw_output):
        """Replace NaNs with zero"""
        for i in range(1, len(raw_output)):
            try:
                if math.isnan(float(raw_output[i])):
                    raw_output[i] = 0
            except:
                raw_output[i] = 0
        return raw_output

    def process_output(station, output, date_obj):
        """Aggregate and compute stats for the output"""
        if time_interval == 1:
            return {'stationName': station, 'output': output, 'Date_Time': date_obj}
        else:
            chunks = list(divide_chunks(output, time_interval))
            avg_output = [my_max_min_function(chunk)[2] for chunk in chunks]
            return {'stationName': station, 'output': avg_output, 'Date_Time': date_obj}

    if query_type == "Date":
        startDateObj = datetime.strptime(MultistartDate[0], "%Y-%m-%d")
        endDateObj = datetime.strptime(MultistartDate[0], "%Y-%m-%d")
        allDateTime = [dt.strftime("%H:%M:%S") for dt in datetime_range(startDateObj, endDateObj, timedelta(minutes=time_interval))]

        for station in stationNames:
            for date_str in MultistartDate:
                date_obj = datetime.strptime(date_str, "%Y-%m-%d")
                result = fetch_data(station, date_obj, date_obj)

                output = result[0]['p'] if result else listofzeros
                output = clean_output(output)
                reply.append(process_output(station, output, date_obj))

    elif query_type == "Month":
        for station in stationNames:
            for date_str in MultistartDate:
                startDateObj = datetime.strptime(date_str, "%Y-%m-%d")
                endDateObj = pd.Timestamp(date_str) + MonthEnd(1)

                dts = [dt.strftime("%d-%m-%Y %H:%M:%S") for dt in datetime_range(startDateObj, endDateObj, timedelta(minutes=time_interval))]
                if len(dts) > len(allDateTime):
                    allDateTime = dts

                result = fetch_data(station, startDateObj, endDateObj)
                output = [val for entry in result for val in entry['p']]
                output = clean_output(output)
                reply.append(process_output(station, output, startDateObj))

    # Append Date_Time metadata
    reply.append({'Date_Time': allDateTime})

    # Post-process: compute max, min, avg, duration
    for i in range(len(reply) - 1):  # Skip the last one (Date_Time)
        stats_max, stats_min, stats_avg = my_max_min_function(reply[i]['output'])

        if stats_max[0] == 0 and stats_min[0] == 0:
            stats_max = [[0], []]
            stats_min = [[0], []]
        elif len(stats_max) > 50 and len(stats_min) > 50:
            stats_max = [[stats_max[0]], []]
            stats_min = [[stats_min[0]], []]
        else:
            stats_max = [[stats_max[0]] * (len(allDateTime) - 1), allDateTime[1:]]
            stats_min = [[stats_min[0]] * (len(allDateTime) - 1), allDateTime[1:]]

        reply[i]['max'] = stats_max
        reply[i]['min'] = stats_min
        reply[i]['avg'] = stats_avg

        sorted_output = sorted(reply[i]['output'], reverse=True)
        percentile = list(np.linspace(0, 100, len(sorted_output)))
        reply[i]['Duration'] = [sorted_output, percentile]

    return jsonify(reply)


@app.route('/GetExchangeDataExcel', methods=['GET', 'POST'])
def GetExchangeDataExcel():
    # Merge and save Excel
    output_path = os.path.join(dir_path, "Excel_Files", "Exchange.xlsx")
    pd.concat(Exchange_excel_data, axis=1, join="inner").to_excel(output_path, index=False)

    # Parse request parameters
    startDateStr = request.args.get('startDate', '').split(" ")[0]
    endDateStr = request.args.get('endDate', '').split(" ")[0]
    stationNames = request.args.get('stationName', '').split(',')

    # Clean station names
    names = ', '.join([name.strip() for name in stationNames if name.strip()])

    # Generate download file name
    if startDateStr == endDateStr:
        filename = f"{startDateStr} ISGS Data of {names}.xlsx"
    else:
        filename = f"{startDateStr} to {endDateStr} ISGS Data of {names}.xlsx"

    # Return file if exists
    if os.path.exists(output_path):
        return send_file(
            output_path,
            as_attachment=True,
            download_name=filename,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
    else:
        return jsonify("No Data to Download")

# /////////////////////////////////////////////Reports////////////////////////////////////////////////////////////////////////////////


@app.route('/reports', methods=['GET', 'POST'])
def reports():

    date_val = request.args['date_val']
    category = request.args['category']

    if category == "Frequency":
        response = FrequencyReport(date_val)

    if category == "Voltage":
        response = VoltageReport2(date_val)

    if category == "ElementBreakdown":
        response = ElementBreakdownReport(date_val)

    if category == "GeneratorBreakdown":
        response = GeneratorBreakdownReport(date_val)

    if category == "LineTripping":
        response = LineTrippingReport(date_val)

    if category == "NC_IEGC_Report":
        response = NC_IEGC_Report(date_val)

    return (response)


@app.route('/cm_dc_revision', methods=['GET', 'POST'])
def cm_dc_revision():

    response= dc_revision_counter()

    return (response)



@app.route('/metercheck', methods=['GET', 'POST'])
def metercheck():

    startDate = request.args['startDate']
    endDate = request.args['endDate']
    
    startDate_obj = datetime.strptime(startDate, '%Y-%m-%d')
    endDate_obj = datetime.strptime(endDate, '%Y-%m-%d')

    response= meter_check(startDate_obj,endDate_obj)

    return (response)


@app.route('/meter_names', methods=['GET', 'POST'])
def meter_names():

    startDate = request.args['startDate']
    endDate = request.args['endDate']
    folder = request.args['folder']
    
    response= meternames(startDate,endDate,folder)

    return (response)



@app.route('/GetMeterData', methods=['GET', 'POST'])
def GetMeterData():

    startDate = request.args['startDate']
    startDate_obj = datetime.strptime(startDate, '%Y-%m-%d')
    endDate = request.args['endDate']
    time = int(request.args['time'])
    meter = request.args['meter']
    meter_list = meter.split(",")
    folder = request.args['folder']

    response= MeterData(startDate,endDate,time,meter_list,folder)

    return (response)


@app.route('/Report_Meter_Data', methods=['GET', 'POST'])
def Report_Meter_Data():

    startDate = request.args['startDate']
    endDate = request.args['endDate']
    folder = request.args['folder']
    time = int(request.args['time'])
    
    response= ReportMeterData(startDate,endDate,time,folder)

    return (response)


@app.route('/Report_Meter_Data2', methods=['GET', 'POST'])
def Report_Meter_Data2():

    startDate = request.args['startDate']
    endDate = request.args['endDate']
    folder = request.args['folder']
    time = int(request.args['time'])
    
    response= ReportMeterData2(startDate,endDate,time,folder)

    return (response)


@app.route('/outage', methods=['GET', 'POST'])
def outage():
    
    daterange = request.args['daterange']
    daterange= daterange.split(",")

    response= outagedata(daterange)

    return response

if __name__ == '__main__':

    # app.debug = True

    app.run(debug=True, host='0.0.0.0', port=5010)


