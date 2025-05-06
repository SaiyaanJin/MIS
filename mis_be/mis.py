import pandas as pd
import os
from pymongo import MongoClient, ASCENDING, DESCENDING, errors
from datetime import date, timedelta, datetime, timezone
from flask import Flask, jsonify, request, Response, send_file
from flask_cors import CORS
import math
from flask_cors import CORS
from pandas.tseries.offsets import MonthEnd
import numpy as np
import requests

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
    collection_names = [
        'voltage_data', 'line_mw_data_p1', 'line_mw_data_p2', 'line_mw_data_400_above',
        'MVAR_p1', 'MVAR_p2', 'Lines_MVAR_400_above', 'ICT_data', 'ICT_data_MW',
        'frequency_data', 'Demand_minutes', 'Drawal_minutes', 'Generator_Data', 'Thermal_Generator', 'ISGS_Data'
    ]
    return [db[name] for name in collection_names]


(
    voltage_data_collection, line_mw_data_collection, line_mw_data_collection1, line_mw_data_collection2,
    MVAR_P1, MVAR_P2, Lines_MVAR_400_above, ICT_data1, ICT_data2,
    frequency_data_collection, demand_collection, drawal_collection, Generator_DB, Th_Gen_DB, ISGS_DB
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

    startDate1 = startDate1.split(" ")
    endDate1 = endDate1.split(" ")

    startDate = startDate1[0]
    endDate = endDate1[0]

    res = Names(startDate,endDate,"Voltage")
    return res


@app.route('/MultiVoltageNames', methods=['GET', 'POST'])
def MultiVoltageNames():

    MultistartDate = request.args['MultistartDate']
    MultistartDate = MultistartDate.split(',')
    
    res= MultiNames(MultistartDate,"Voltage")
    return res



@app.route('/GetVoltageData', methods=['GET', 'POST'])
def GetVoltageData():

    startDate1 = request.args['startDate']
    endDate1 = request.args['endDate']

    stationName = request.args['stationName']
    stationName = stationName.split(',')
    time1 = int(request.args['time'])

    startTime = startDate1+":00"
    endTime = endDate1+":00"

    startDate1 = startDate1.split(" ")
    endDate1 = endDate1.split(" ")

    startDate = startDate1[0]
    endDate = endDate1[0]

    startTime = (datetime.strptime(startTime, "%Y-%m-%d %H:%M:%S")
                 ).strftime("%d-%m-%Y %H:%M:%S")
    endTime = ((datetime.strptime(endTime, "%Y-%m-%d %H:%M:%S")
                ).strftime("%d-%m-%Y %H:%M:%S"))

    allDateTime = []

    index1 = (datetime.strptime(startTime, "%d-%m-%Y %H:%M:%S")
              ).hour*60+(datetime.strptime(startTime, "%d-%m-%Y %H:%M:%S")).minute

    index2 = index1 + int((datetime.strptime(endTime, "%d-%m-%Y %H:%M:%S") -
                           datetime.strptime(startTime, "%d-%m-%Y %H:%M:%S")).total_seconds() / 60)

    if time1 > 1 + (datetime.strptime(endTime, "%d-%m-%Y %H:%M:%S")-datetime.strptime(startTime, "%d-%m-%Y %H:%M:%S")).total_seconds() / 60:
        return jsonify("Time ERROR")

    startTime = (datetime.strptime(startTime, "%d-%m-%Y %H:%M:%S"))
    endTime = (datetime.strptime(endTime, "%d-%m-%Y %H:%M:%S"))

    while startTime <= endTime:

        allDateTime.append(startTime.strftime("%d-%m-%Y %H:%M:%S"))

        startTime = (startTime + timedelta(hours=0, minutes=time1))

    startDateObj = datetime.strptime(startDate, "%Y-%m-%d")
    endDateObj = datetime.strptime(endDate, "%Y-%m-%d")

    date_range = [startDateObj+timedelta(days=x)
                  for x in range((endDateObj-startDateObj).days+1)]

    reply = []
    listofzeros = [0] * 1440

    names = ''

    for station in stationName:

        names = names+station+', '
        voltageBus1 = []
        voltageBus2 = []

        for it in date_range:

            filter = {
                'd': {
                    '$gte': datetime(it.year, it.month, it.day, 0, 0, 0, tzinfo=timezone.utc),
                    '$lte': datetime(it.year, it.month, it.day, 0, 0, 0, tzinfo=timezone.utc)
                },
                'n': station
            }
            project = {
                '_id': 0,
                'vol': 1,
                'vol2': 1,

            }
            result = voltage_data_collection.find(
                filter=filter,
                projection=project

            )

            result_list = list(result)

            if len(result_list) == 0:
                voltageBus1 = voltageBus1 + listofzeros
                voltageBus2 = voltageBus2 + listofzeros

            else:

                voltageBus1 = voltageBus1 + result_list[0]['vol']
                voltageBus2 = voltageBus2 + result_list[0]['vol2']

        for i in range(len(voltageBus1)):
            x = float(voltageBus1[i])
            math.isnan(x)
            if math.isnan(x):
                voltageBus1[i] = 0

        for j in range(len(voltageBus2)):
            y = float(voltageBus2[j])
            math.isnan(y)
            if math.isnan(y):
                voltageBus2[j] = 0

        voltageBus1 = voltageBus1[index1:index2+1]

        voltageBus2 = voltageBus2[index1:index2+1]

        if time1 == 1:

            data = {'stationName': station,
                    'voltageBus1': voltageBus1, 'voltageBus2': voltageBus2}
            reply.append(data)

        else:
            temp_voltageBus1 = []
            temp_voltageBus2 = []

            x = list(divide_chunks(voltageBus1, time1))
            y = list(divide_chunks(voltageBus2, time1))

            for item in x:
                max_1, min_1, avg_1 = my_max_min_function(item)
                temp_voltageBus1.append(avg_1)

            for item in y:
                max_2, min_2, avg_2 = my_max_min_function(item)
                temp_voltageBus2.append(avg_2)

            data = {'stationName': station, 'voltageBus1': temp_voltageBus1,
                    'voltageBus2': temp_voltageBus2}
            reply.append(data)

    df1 = pd.DataFrame.from_dict({'Date_Time': allDateTime})

    merge_list = [df1]

    index = 0
    for it in reply:

        df = pd.DataFrame.from_dict(it)
        df = df.drop(['stationName'], axis=1)
        df.columns = pd.MultiIndex.from_product(
            [[stationName[index]], df.columns])
        merge_list.append(df)
        index += 1

    global Voltage_excel_data

    Voltage_excel_data = merge_list

    # merged = pd.concat(merge_list, axis=1, join="inner")

    # merged.to_excel("Voltage.xlsx", index=None)

    names = names[:-2]

    for i in range(len(reply)):

        temp_freq_lst = reply[i]['voltageBus1'].copy()
        temp_freq_lst.sort()
        z = list(np.linspace(0, 100, len(temp_freq_lst)))
        temp_freq_lst.reverse()
        temp_list = [temp_freq_lst, z]

        reply[i]['voltageBus1 Duration'] = temp_list

        temp_freq_lst1 = reply[i]['voltageBus2'].copy()
        temp_freq_lst1.sort()
        z1 = list(np.linspace(0, 100, len(temp_freq_lst1)))
        temp_freq_lst1.reverse()
        temp_list1 = [temp_freq_lst1, z1]

        reply[i]['voltageBus2 Duration'] = temp_list1

        max_v1, min_v1, avg_v1 = my_max_min_function(reply[i]['voltageBus1'])
        max_v2, min_v2, avg_v2 = my_max_min_function(reply[i]['voltageBus2'])

        if max_v1[0] == 0 and min_v1[0] == 0:
            max_v1 = [[""], []]
            min_v1 = [[""], []]

        elif len(max_v1) > 50 and len(min_v1) > 50:
            max_v1 = [[""], []]
            min_v1 = [[""], []]

        else:
            l1 = []
            l2 = []

            for x in range(1, len(max_v1)):
                l1.append(max_v1[0])
                l2.append(allDateTime[max_v1[x]])

            max_v1 = [l1, l2]
            l1 = []
            l2 = []

            for y in range(1, len(min_v1)):
                l1.append(min_v1[0])
                l2.append(allDateTime[min_v1[y]])

            min_v1 = [l1, l2]

        if max_v2[0] == 0 and min_v2[0] == 0:
            max_v2 = [[""], []]
            min_v2 = [[""], []]

        elif len(max_v2) > 50 and len(min_v2) > 50:
            max_v2 = [[""], []]
            min_v2 = [[""], []]

        else:
            l1 = []
            l2 = []

            for x in range(1, len(max_v2)):
                l1.append(max_v2[0])
                l2.append(allDateTime[max_v2[x]])

            max_v2 = [l1, l2]
            l1 = []
            l2 = []

            for y in range(1, len(min_v2)):
                l1.append(min_v2[0])
                l2.append(allDateTime[min_v2[y]])

            min_v2 = [l1, l2]

        reply[i]['max_v1'] = max_v1
        reply[i]['min_v1'] = min_v1
        reply[i]['avg_v1'] = avg_v1

        reply[i]['max_v2'] = max_v2
        reply[i]['min_v2'] = min_v2
        reply[i]['avg_v2'] = avg_v2

    reply.append({'Date_Time': allDateTime})
    return jsonify(reply)


@app.route('/GetMultiVoltageData', methods=['GET', 'POST'])
def GetMultiVoltageData():

    MultistartDate = request.args['MultistartDate']
    MultistartDate = MultistartDate.split(',')
    MultistationName = request.args['MultistationName']
    stationName = MultistationName.split(',')
    Type = request.args['Type']

    time1 = int(request.args['time'])

    listofzeros = [0] * 1440

    if Type == "Date":

        startDateObj = datetime.strptime(MultistartDate[0], "%Y-%m-%d")
        endDateObj = datetime.strptime(MultistartDate[0], "%Y-%m-%d")

        # date_range= [startDateObj+timedelta(days=x) for x in range((endDateObj-startDateObj).days+1)]

        reply = []

        dts = [dt.strftime("%H:%M:%S") for dt in
               datetime_range(startDateObj, endDateObj,
                              timedelta(minutes=time1))]

        allDateTime = dts
        # for i in range(((endDateObj - startDateObj).days + 1)*24*60) :
        #     allDateTime.append((startDateObj + timedelta(seconds = 60*i)).strftime("%H:%M:%S"))

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
                project = {
                    '_id': 0,
                    'vol': 1,
                    'vol2': 1,

                }
                result = voltage_data_collection.find(
                    filter=filter,
                    projection=project

                )

                result_list = list(result)

                if len(result_list) == 0:
                    voltageBus1 = listofzeros
                    voltageBus2 = listofzeros

                else:

                    voltageBus1 = result_list[0]['vol']
                    voltageBus2 = result_list[0]['vol2']

                for i in range(len(voltageBus1)):

                    x = float(voltageBus1[i])

                    math.isnan(x)

                    if math.isnan(x):
                        voltageBus1[i] = 0

                for j in range(len(voltageBus2)):

                    y = float(voltageBus2[j])
                    math.isnan(y)

                    if math.isnan(y):
                        voltageBus2[j] = 0

                if time1 == 1:

                    data = {'stationName': station, 'voltageBus1': voltageBus1,
                            'voltageBus2': voltageBus2, 'Date_Time': DateObj}
                    reply.append(data)

                else:
                    temp_voltageBus1 = []
                    temp_voltageBus2 = []

                    x = list(divide_chunks(voltageBus1, time1))
                    y = list(divide_chunks(voltageBus2, time1))

                    for item in x:
                        max_1, min_1, avg_1 = my_max_min_function(item)
                        temp_voltageBus1.append(avg_1)

                    for item in y:
                        max_2, min_2, avg_2 = my_max_min_function(item)
                        temp_voltageBus2.append(avg_2)

                    data = {'stationName': station, 'voltageBus1': temp_voltageBus1,
                            'voltageBus2': temp_voltageBus2, 'Date_Time': DateObj}
                    reply.append(data)

        temp_dict = {
            'Date_Time': allDateTime
        }

        reply.append(temp_dict)

    elif Type == "Month":

        reply = []
        allDateTime = []

        for station in stationName:

            for dateval in MultistartDate:

                startDateObj = datetime.strptime(dateval, "%Y-%m-%d")
                endDateObj = pd.Timestamp(dateval) + MonthEnd(1)

                dts = [dt.strftime("%d-%m-%Y %H:%M:%S") for dt in
                       datetime_range(startDateObj, endDateObj,
                                      timedelta(minutes=time1))]
                # for i in range(((endDateObj - startDateObj).days + 1)*24*60) :
                #     allDateTime.append((startDateObj + timedelta(seconds = 60*i)).strftime("%d-%m-%Y %H:%M:%S"))

                alldate = pd.date_range(
                    startDateObj, endDateObj-timedelta(days=1), freq='d').strftime("%Y-%m-%d")
                alldate = list(alldate)
                endDateObj = endDateObj.strftime("%Y-%m-%d")
                alldate.append(endDateObj)

                if len(allDateTime) < len(dts):
                    allDateTime = dts

                voltageBus1 = []
                voltageBus2 = []

                for dates in alldate:

                    dates = datetime.strptime(dates, "%Y-%m-%d")

                    filter = {
                        'd': {
                            '$gte': datetime(dates.year, dates.month, dates.day, 0, 0, 0, tzinfo=timezone.utc),
                            '$lte': datetime(dates.year, dates.month, dates.day, 0, 0, 0, tzinfo=timezone.utc)
                        },
                        'n': station
                    }
                    project = {
                        '_id': 0,
                        'vol': 1,
                        'vol2': 1,

                    }

                    result = voltage_data_collection.find(
                        filter=filter,
                        projection=project

                    )

                    result_list = list(result)

                    if len(result_list) == 0:
                        voltageBus1 = voltageBus1 + listofzeros
                        voltageBus2 = voltageBus2 + listofzeros

                    else:

                        voltageBus1 = voltageBus1 + result_list[0]['vol']
                        voltageBus2 = voltageBus2 + result_list[0]['vol2']

                for i in range(len(voltageBus1)):
                    x = float(voltageBus1[i])
                    math.isnan(x)
                    if math.isnan(x):
                        voltageBus1[i] = 0

                for j in range(len(voltageBus2)):
                    y = float(voltageBus2[j])
                    math.isnan(y)
                    if math.isnan(y):
                        voltageBus2[j] = 0

                if time1 == 1:

                    data = {'stationName': station, 'voltageBus1': voltageBus1,
                            'voltageBus2': voltageBus2, 'Date_Time': startDateObj}
                    reply.append(data)

                else:
                    temp_voltageBus1 = []
                    temp_voltageBus2 = []

                    x = list(divide_chunks(voltageBus1, time1))
                    y = list(divide_chunks(voltageBus2, time1))

                    for item in x:
                        max_1, min_1, avg_1 = my_max_min_function(item)
                        temp_voltageBus1.append(avg_1)

                    for item in y:
                        max_2, min_2, avg_2 = my_max_min_function(item)
                        temp_voltageBus2.append(avg_2)

                    data = {'stationName': station, 'voltageBus1': temp_voltageBus1,
                            'voltageBus2': temp_voltageBus2, 'Date_Time': startDateObj}
                    reply.append(data)

        temp_dict = {
            'Date_Time': allDateTime
        }

        reply.append(temp_dict)

    for i in range(len(reply)-1):

        temp_freq_lst = reply[i]['voltageBus1'].copy()
        temp_freq_lst.sort()
        z = list(np.linspace(0, 100, len(temp_freq_lst)))
        temp_freq_lst.reverse()
        temp_list = [temp_freq_lst, z]

        reply[i]['voltageBus1 Duration'] = temp_list

        temp_freq_lst1 = reply[i]['voltageBus2'].copy()
        temp_freq_lst1.sort()
        z1 = list(np.linspace(0, 100, len(temp_freq_lst1)))
        temp_freq_lst1.reverse()
        temp_list1 = [temp_freq_lst1, z1]

        reply[i]['voltageBus2 Duration'] = temp_list1

        max_v1, min_v1, avg_v1 = my_max_min_function(reply[i]['voltageBus1'])
        max_v2, min_v2, avg_v2 = my_max_min_function(reply[i]['voltageBus2'])

        if max_v1[0] == 0 and min_v1[0] == 0:
            max_v1 = [[""], []]
            min_v1 = [[""], []]

        elif len(max_v1) > 50 and len(min_v1) > 50:
            max_v1 = [[""], []]
            min_v1 = [[""], []]

        else:
            l1 = []
            l2 = []

            for x in range(1, len(max_v1)):
                l1.append(max_v1[0])
                l2.append(allDateTime[max_v1[x]])

            max_v1 = [l1, l2]
            l1 = []
            l2 = []

            for y in range(1, len(min_v1)):
                l1.append(min_v1[0])
                l2.append(allDateTime[min_v1[y]])

            min_v1 = [l1, l2]

        if max_v2[0] == 0 and min_v2[0] == 0:
            max_v2 = [[""], []]
            min_v2 = [[""], []]

        elif len(max_v2) > 50 and len(min_v2) > 50:
            max_v2 = [[""], []]
            min_v2 = [[""], []]

        else:
            l1 = []
            l2 = []

            for x in range(1, len(max_v2)):
                l1.append(max_v2[0])
                l2.append(allDateTime[max_v2[x]])

            max_v2 = [l1, l2]
            l1 = []
            l2 = []

            for y in range(1, len(min_v2)):
                l1.append(min_v2[0])
                l2.append(allDateTime[min_v2[y]])

            min_v2 = [l1, l2]

        reply[i]['max_v1'] = max_v1
        reply[i]['min_v1'] = min_v1
        reply[i]['avg_v1'] = avg_v1

        reply[i]['max_v2'] = max_v2
        reply[i]['min_v2'] = min_v2
        reply[i]['avg_v2'] = avg_v2

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

    startDate1 = startDate1.split(" ")
    endDate1 = endDate1.split(" ")

    startDate = startDate1[0]
    endDate = endDate1[0]

    res= Names(startDate,endDate,"Lines")

    return res


@app.route('/MultiLinesNames', methods=['GET', 'POST'])
def MultiLinesNames():

    MultistartDate = request.args['MultistartDate']
    MultistartDate = MultistartDate.split(',')

    res= MultiNames(MultistartDate,"Lines")

    return res


@app.route('/GetLinesData', methods=['GET', 'POST'])
def GetLinesData():

    startDate1 = request.args['startDate']
    endDate1 = request.args['endDate']

    startTime = startDate1+":00"
    endTime = endDate1+":00"

    startDate1 = startDate1.split(" ")
    endDate1 = endDate1.split(" ")

    startDate = startDate1[0]
    endDate = endDate1[0]

    startTime = (datetime.strptime(startTime, "%Y-%m-%d %H:%M:%S")
                 ).strftime("%d-%m-%Y %H:%M:%S")
    endTime = (datetime.strptime(endTime, "%Y-%m-%d %H:%M:%S")
               ).strftime("%d-%m-%Y %H:%M:%S")

    stationName = request.args['stationName']
    stationName = stationName.split(',')
    time1 = int(request.args['time'])

    startDateObj = datetime.strptime(startDate, "%Y-%m-%d")
    endDateObj = datetime.strptime(endDate, "%Y-%m-%d")

    date_range = [startDateObj+timedelta(days=x)
                  for x in range((endDateObj-startDateObj).days+1)]

    dts = [dt.strftime("%d-%m-%Y %H:%M:%S") for dt in
           datetime_range(startDateObj, endDateObj,
                          timedelta(minutes=time1))]

    allDateTime = dts

    allDateTime = allDateTime[allDateTime.index(
        startTime):allDateTime.index(endTime)+1]

    reply = []
    listofzeros = [11111] * 1440

    names = ''

    merge_list = []

    df1 = pd.DataFrame.from_dict({'Date_Time': allDateTime})

    merge_list.append(df1)

    for station in stationName:

        station = station[:-3]

        names = names+station+', '
        line = []

        for it in date_range:

            filter = {
                'd': {
                    '$gte': datetime(it.year, it.month, it.day, 0, 0, 0, tzinfo=timezone.utc),
                    '$lte': datetime(it.year, it.month, it.day, 0, 0, 0, tzinfo=timezone.utc)
                },
                'n': station

            }
            project = {
                '_id': 0,
                'p': 1,

            }

            result = line_mw_data_collection.find(
                filter=filter,
                projection=project

            )

            global Lines_file_name

            Lines_file_name = 'p1'

            result_list = list(result)

            if len(result_list) == 0:

                result1 = line_mw_data_collection1.find(
                    filter=filter,
                    projection=project

                )
                Lines_file_name = 'p2'

                result_list = list(result1)

            if len(result_list) == 0:

                result2 = line_mw_data_collection2.find(
                    filter=filter,
                    projection=project

                )
                Lines_file_name = '400 & above'

                result_list = list(result2)

            if len(result_list) == 0:
                line = line + listofzeros

            else:

                line = line + result_list[0]['p']

        for i in range(len(line)):
            x = float(line[i])
            math.isnan(x)
            if math.isnan(x):
                line[i] = 0

        line = line[allDateTime.index(
            startTime):allDateTime.index(endTime)+1]

        if time1 == 1:

            data = {'stationName': station, 'line': line}
            reply.append(data)

        else:
            temp_line = []

            x = list(divide_chunks(line, time1))

            for item in x:
                max_1, min_1, avg_1 = my_max_min_function(item)
                temp_line.append(avg_1)

            data = {'stationName': station, 'line': temp_line}
            reply.append(data)

        # df1 = pd.DataFrame.from_dict({station+' '+Lines_file_name: line})

        # merge_list.append(df1)

    # merged = pd.concat(merge_list, axis=1, join="inner")

    # merged.to_excel("Line.xlsx", index=None)

    for i in range(len(reply)):

        max, min, avg = my_max_min_function(reply[i]['line'])

        if max[0] == 0 and min[0] == 0:
            max = [[0], []]
            min = [[0], []]

        elif len(max) > 50 and len(min) > 50:
            max = [[max[0]], []]
            min = [[min[0]], []]

        else:
            l1 = []
            l2 = []

            for x in range(1, len(max)):
                l1.append(max[0])
                l2.append(allDateTime[x])

            max = [l1, l2]
            l1 = []
            l2 = []

            for y in range(1, len(min)):
                l1.append(min[0])
                l2.append(allDateTime[y])

            min = [l1, l2]

        reply[i]['max'] = max
        reply[i]['min'] = min
        reply[i]['avg'] = avg

    reply.append({'Date_Time': allDateTime})

    # df1 = pd.DataFrame.from_dict({station+' '+Lines_file_name: line})

    # merge_list.append(df1)

    for x in range(len(reply)-1):
        df1 = pd.DataFrame.from_dict(
            {reply[x]['stationName']: reply[x]['line']})
        merge_list.append(df1)

    global Lines_excel_data

    Lines_excel_data = merge_list

    names = names[:-2]

    return jsonify(reply)


@app.route('/GetMultiLinesData', methods=['GET', 'POST'])
def GetMultiLinesData():

    MultistartDate = request.args['MultistartDate']
    MultistartDate = MultistartDate.split(',')
    MultistationName = request.args['MultistationName']
    stationName = MultistationName.split(',')
    Type = request.args['Type']

    time1 = int(request.args['time'])

    global Lines_file_name

    listofzeros = [0] * 1440

    if Type == "Date":

        startDateObj = datetime.strptime(MultistartDate[0], "%Y-%m-%d")
        endDateObj = datetime.strptime(MultistartDate[0], "%Y-%m-%d")

        reply = []

        dts = [dt.strftime("%H:%M:%S") for dt in
               datetime_range(startDateObj, endDateObj,
                              timedelta(minutes=time1))]

        allDateTime = dts

        for station in stationName:

            station = station[:-3]

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
                project = {
                    '_id': 0,
                    'p': 1,

                }

                result = line_mw_data_collection.find(
                    filter=filter,
                    projection=project

                )

                Lines_file_name = 'p1'

                result_list = list(result)

                if len(result_list) == 0:

                    result1 = line_mw_data_collection1.find(
                        filter=filter,
                        projection=project

                    )
                    Lines_file_name = 'p2'

                    result_list = list(result1)

                if len(result_list) == 0:

                    result2 = line_mw_data_collection2.find(
                        filter=filter,
                        projection=project

                    )
                    Lines_file_name = '400 & above'

                    result_list = list(result2)

                if len(result_list) == 0:
                    line = line + listofzeros

                else:

                    line = line + result_list[0]['p']

                for i in range(len(line)):
                    x = float(line[i])
                    math.isnan(x)
                    if math.isnan(x):
                        line[i] = 0

                if time1 == 1:

                    data = {'stationName': station,
                            'line': line, 'Date_Time': DateObj}
                    reply.append(data)

                else:
                    temp_line = []

                    x = list(divide_chunks(line, time1))

                    for item in x:
                        max_1, min_1, avg_1 = my_max_min_function(item)
                        temp_line.append(avg_1)

                    data = {'stationName': station,
                            'line': temp_line, 'Date_Time': DateObj}
                    reply.append(data)

    elif Type == "Month":

        reply = []
        allDateTime = []

        for station in stationName:

            for dateval in MultistartDate:

                startDateObj = datetime.strptime(dateval, "%Y-%m-%d")
                endDateObj = pd.Timestamp(dateval) + MonthEnd(1)

                dts = [dt.strftime("%d-%m-%Y %H:%M:%S") for dt in
                       datetime_range(startDateObj, endDateObj,
                                      timedelta(minutes=time1))]

                if len(allDateTime) < len(dts):
                    allDateTime = dts

                alldate = pd.date_range(
                    startDateObj, endDateObj-timedelta(days=1), freq='d').strftime("%Y-%m-%d")
                alldate = list(alldate)
                endDateObj = endDateObj.strftime("%Y-%m-%d")
                alldate.append(endDateObj)

                line = []

                for dates in alldate:

                    dates = datetime.strptime(dates, "%Y-%m-%d")

                    filter = {
                        'd': {
                            '$gte': datetime(dates.year, dates.month, dates.day, 0, 0, 0, tzinfo=timezone.utc),
                            '$lte': datetime(dates.year, dates.month, dates.day, 0, 0, 0, tzinfo=timezone.utc)
                        },
                        'n': station
                    }
                    project = {
                        '_id': 0,
                        'p': 1,

                    }

                    result = line_mw_data_collection.find(
                        filter=filter,
                        projection=project

                    )

                    Lines_file_name = 'p1'

                    result_list = list(result)

                    if len(result_list) == 0:

                        result1 = line_mw_data_collection1.find(
                            filter=filter,
                            projection=project

                        )
                        Lines_file_name = 'p2'

                        result_list = list(result1)

                    if len(result_list) == 0:

                        result2 = line_mw_data_collection2.find(
                            filter=filter,
                            projection=project

                        )
                        Lines_file_name = '400 & above'

                        result_list = list(result2)

                    if len(result_list) == 0:
                        line = line + listofzeros

                    else:

                        line = line + result_list[0]['p']

                for i in range(len(line)):
                    x = float(line[i])
                    math.isnan(x)
                    if math.isnan(x):
                        line[i] = 0

                if time1 == 1:

                    data = {'stationName': station,
                            'line': line, 'Date_Time': startDateObj}
                    reply.append(data)

                else:
                    temp_line = []

                    x = list(divide_chunks(line, time1))

                    for item in x:
                        max_1, min_1, avg_1 = my_max_min_function(item)
                        temp_line.append(avg_1)

                    data = {'stationName': station,
                            'line': temp_line, 'Date_Time': startDateObj}
                    reply.append(data)

    temp_dict = {
        'Date_Time': allDateTime
    }

    for i in range(len(reply)):

        max, min, avg = my_max_min_function(reply[i]['line'])

        if max[0] == 0 and min[0] == 0:
            max = [[0], []]
            min = [[0], []]

        elif len(max) > 50 and len(min) > 50:
            max = [[max[0]], []]
            min = [[min[0]], []]

        else:
            l1 = []
            l2 = []

            for x in range(1, len(max)):
                l1.append(max[0])
                l2.append(allDateTime[x])

            max = [l1, l2]
            l1 = []
            l2 = []

            for y in range(1, len(min)):
                l1.append(min[0])
                l2.append(allDateTime[y])

            min = [l1, l2]

        reply[i]['max'] = max
        reply[i]['min'] = min
        reply[i]['avg'] = avg

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

    startDate1 = startDate1.split(" ")
    endDate1 = endDate1.split(" ")

    startDate = startDate1[0]
    endDate = endDate1[0]

    res= Names(startDate,endDate,"ICT")

    return res


@app.route('/MultiICTNames', methods=['GET', 'POST'])
def MultiICTNames():

    MultistartDate = request.args['MultistartDate']
    MultistartDate = MultistartDate.split(',')
    Type = request.args['Type']

    res= MultiNames([MultistartDate,Type],"ICT")

    return res


@app.route('/GetICTData', methods=['GET', 'POST'])
def GetICTData():

    startDate1 = request.args['startDate']
    endDate1 = request.args['endDate']

    stationName = request.args['stationName']
    stationName = stationName.split(',')
    time1 = int(request.args['time'])

    startTime = startDate1+":00"
    endTime = endDate1+":00"

    startDate1 = startDate1.split(" ")
    endDate1 = endDate1.split(" ")

    startDate = startDate1[0]
    endDate = endDate1[0]

    startTime = (datetime.strptime(startTime, "%Y-%m-%d %H:%M:%S")
                 ).strftime("%d-%m-%Y %H:%M:%S")
    endTime = ((datetime.strptime(endTime, "%Y-%m-%d %H:%M:%S")
                ).strftime("%d-%m-%Y %H:%M:%S"))

    allDateTime = []

    index1 = (datetime.strptime(startTime, "%d-%m-%Y %H:%M:%S")
              ).hour*60+(datetime.strptime(startTime, "%d-%m-%Y %H:%M:%S")).minute

    index2 = index1 + int((datetime.strptime(endTime, "%d-%m-%Y %H:%M:%S") -
                           datetime.strptime(startTime, "%d-%m-%Y %H:%M:%S")).total_seconds() / 60)

    if time1 > 1 + (datetime.strptime(endTime, "%d-%m-%Y %H:%M:%S")-datetime.strptime(startTime, "%d-%m-%Y %H:%M:%S")).total_seconds() / 60:
        return jsonify("Time ERROR")

    startTime = (datetime.strptime(startTime, "%d-%m-%Y %H:%M:%S"))
    endTime = (datetime.strptime(endTime, "%d-%m-%Y %H:%M:%S"))

    while startTime <= endTime:

        allDateTime.append(startTime.strftime("%d-%m-%Y %H:%M:%S"))

        startTime = (startTime + timedelta(hours=0, minutes=time1))

    startDateObj = datetime.strptime(startDate, "%Y-%m-%d")
    endDateObj = datetime.strptime(endDate, "%Y-%m-%d")

    date_range = [startDateObj+timedelta(days=x)
                  for x in range((endDateObj-startDateObj).days+1)]

    # dts = [dt.strftime("%d-%m-%Y %H:%M:%S") for dt in
    #        datetime_range(startDateObj, endDateObj,
    #                       timedelta(minutes=time1))]

    # allDateTime = dts

    # allDateTime = allDateTime[allDateTime.index(
    #     startTime):allDateTime.index(endTime)+1]

    reply = []
    listofzeros = [0] * 1440

    names = ''

    merge_list = []

    df1 = pd.DataFrame.from_dict({'Date_Time': allDateTime})

    merge_list.append(df1)

    for station in stationName:

        names = names+station+', '
        line = []

        for it in date_range:

            filter = {
                'd': {
                    '$gte': datetime(it.year, it.month, it.day, 0, 0, 0, tzinfo=timezone.utc),
                    '$lte': datetime(it.year, it.month, it.day, 0, 0, 0, tzinfo=timezone.utc)
                },
                'n': station

            }
            project = {
                '_id': 0,
                'p': 1,

            }

            result1 = ICT_data1.find(
                filter=filter,
                projection=project

            )

            result_list = list(result1)

            if len(result_list) == 0:
                result2 = ICT_data2.find(
                    filter=filter,
                    projection=project
                )
                result_list = list(result2)

            if len(result_list) == 0:
                line = line + listofzeros

            else:

                line = line + result_list[0]['p']

        for i in range(len(line)):
            x = float(line[i])
            math.isnan(x)
            if math.isnan(x):
                line[i] = 0

        line = line[index1:index2+1]

        if time1 == 1:

            data = {'stationName': station, 'line': line}
            reply.append(data)

        else:
            temp_line = []

            x = list(divide_chunks(line, time1))

            for item in x:
                max_1, min_1, avg_1 = my_max_min_function(item)
                temp_line.append(avg_1)

            data = {'stationName': station, 'line': temp_line}
            reply.append(data)

        # df1 = pd.DataFrame.from_dict({station: line})

        # merge_list.append(df1)

    # merged = pd.concat(merge_list, axis=1, join="inner")

    # merged.to_excel("ICT.xlsx", index=None)

    for i in range(len(reply)):

        max, min, avg = my_max_min_function(reply[i]['line'])

        if max[0] == 0 and min[0] == 0:
            max = [[0], []]
            min = [[0], []]

        elif len(max) > 50 and len(min) > 50:
            max = [[max[0]], []]
            min = [[min[0]], []]

        else:
            l1 = []
            l2 = []

            for x in range(1, len(max)):
                l1.append(max[0])
                l2.append(allDateTime[x])

            max = [l1, l2]
            l1 = []
            l2 = []

            for y in range(1, len(min)):
                l1.append(min[0])
                l2.append(allDateTime[y])

            min = [l1, l2]

        reply[i]['max'] = max
        reply[i]['min'] = min
        reply[i]['avg'] = avg

    reply.append({'Date_Time': allDateTime})

    for x in range(len(reply)-1):
        df1 = pd.DataFrame.from_dict(
            {reply[x]['stationName']: reply[x]['line']})
        merge_list.append(df1)

    global ICT_excel_data

    ICT_excel_data = merge_list

    names = names[:-2]

    return jsonify(reply)


@app.route('/GetMultiICTData', methods=['GET', 'POST'])
def GetMultiICTData():

    MultistartDate = request.args['MultistartDate']
    MultistartDate = MultistartDate.split(',')
    MultistationName = request.args['MultistationName']
    stationName = MultistationName.split(',')
    Type = request.args['Type']

    time1 = int(request.args['time'])

    listofzeros = [0] * 1440

    if Type == "Date":

        startDateObj = datetime.strptime(MultistartDate[0], "%Y-%m-%d")
        endDateObj = datetime.strptime(MultistartDate[0], "%Y-%m-%d")

        # date_range= [startDateObj+timedelta(days=x) for x in range((endDateObj-startDateObj).days+1)]

        reply = []

        dts = [dt.strftime("%H:%M:%S") for dt in
               datetime_range(startDateObj, endDateObj,
                              timedelta(minutes=time1))]

        allDateTime = dts

        for station in stationName:

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
                project = {
                    '_id': 0,
                    'p': 1,

                }

                result = ICT_data1.find(
                    filter=filter,
                    projection=project

                )

                result_list = list(result)

                if len(result_list) == 0:
                    line = line + listofzeros

                else:

                    line = line + result_list[0]['p']

                for i in range(len(line)):
                    x = float(line[i])
                    math.isnan(x)
                    if math.isnan(x):
                        line[i] = 0

                if time1 == 1:

                    data = {'stationName': station,
                            'line': line, 'Date_Time': DateObj}
                    reply.append(data)

                else:
                    temp_line = []

                    x = list(divide_chunks(line, time1))

                    for item in x:
                        max_1, min_1, avg_1 = my_max_min_function(item)
                        temp_line.append(avg_1)

                    data = {'stationName': station,
                            'line': temp_line, 'Date_Time': DateObj}
                    reply.append(data)

        temp_dict = {
            'Date_Time': allDateTime
        }
        reply.append(temp_dict)

    if Type == "Month":

        reply = []

        allDateTime = []

        for station in stationName:

            for dateval in MultistartDate:

                startDateObj = datetime.strptime(dateval, "%Y-%m-%d")
                endDateObj = pd.Timestamp(dateval) + MonthEnd(1)

                dts = [dt.strftime("%d-%m-%Y %H:%M:%S") for dt in
                       datetime_range(startDateObj, endDateObj,
                                      timedelta(minutes=time1))]

                if len(allDateTime) < len(dts):
                    allDateTime = dts

                alldate = pd.date_range(
                    startDateObj, endDateObj-timedelta(days=1), freq='d').strftime("%Y-%m-%d")
                alldate = list(alldate)
                endDateObj = endDateObj.strftime("%Y-%m-%d")
                alldate.append(endDateObj)

                line = []

                for dates in alldate:

                    dates = datetime.strptime(dates, "%Y-%m-%d")

                    filter = {
                        'd': {
                            '$gte': datetime(dates.year, dates.month, dates.day, 0, 0, 0, tzinfo=timezone.utc),
                            '$lte': datetime(dates.year, dates.month, dates.day, 0, 0, 0, tzinfo=timezone.utc)
                        },
                        'n': station

                    }
                    project = {
                        '_id': 0,
                        'p': 1,

                    }

                    result = ICT_data1.find(
                        filter=filter,
                        projection=project

                    )

                    result_list = list(result)

                    if len(result_list) == 0:
                        line = line + listofzeros

                    else:

                        line = line + result_list[0]['p']

                for i in range(len(line)):
                    x = float(line[i])
                    math.isnan(x)
                    if math.isnan(x):
                        line[i] = 0

                if time1 == 1:

                    data = {'stationName': station,
                            'line': line, 'Date_Time': startDateObj}
                    reply.append(data)

                else:
                    temp_line = []

                    x = list(divide_chunks(line, time1))

                    for item in x:
                        max_1, min_1, avg_1 = my_max_min_function(item)
                        temp_line.append(avg_1)

                    data = {'stationName': station,
                            'line': temp_line, 'Date_Time': startDateObj}
                    reply.append(data)

        temp_dict = {
            'Date_Time': allDateTime
        }

        reply.append(temp_dict)

    for i in range(len(reply)-1):

        max, min, avg = my_max_min_function(reply[i]['line'])

        if max[0] == 0 and min[0] == 0:
            max = [[0], []]
            min = [[0], []]

        elif len(max) > 50 and len(min) > 50:
            max = [[max[0]], []]
            min = [[min[0]], []]

        else:
            l1 = []
            l2 = []

            for x in range(1, len(max)):
                l1.append(max[0])
                l2.append(allDateTime[x])

            max = [l1, l2]
            l1 = []
            l2 = []

            for y in range(1, len(min)):
                l1.append(min[0])
                l2.append(allDateTime[y])

            min = [l1, l2]

        reply[i]['max'] = max
        reply[i]['min'] = min
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

    startDate1 = startDate1.split(" ")
    endDate1 = endDate1.split(" ")

    startDate = startDate1[0]
    endDate = endDate1[0]

    res= Names(startDate,endDate,"Frequency")

    return res

@app.route('/MultiFrequencyNames', methods=['GET', 'POST'])
def MultiFrequencyNames():

    MultistartDate = request.args['MultistartDate']
    MultistartDate = MultistartDate.split(',')
    
    res= MultiNames(MultistartDate,"Frequency")

    return res

@app.route('/GetFrequencyData', methods=['GET', 'POST'])
def GetFrequencyData():

    startDate1 = request.args['startDate']
    endDate1 = request.args['endDate']

    stationName = request.args['stationName']
    stationName = stationName.split(',')
    time1 = int(request.args['time'])

    startTime = startDate1+":00"
    endTime = endDate1+":00"

    startDate1 = startDate1.split(" ")
    endDate1 = endDate1.split(" ")

    startDate = startDate1[0]
    endDate = endDate1[0]

    startTime = (datetime.strptime(startTime, "%Y-%m-%d %H:%M:%S")
                 ).strftime("%d-%m-%Y %H:%M:%S")
    endTime = ((datetime.strptime(endTime, "%Y-%m-%d %H:%M:%S")
                ).strftime("%d-%m-%Y %H:%M:%S"))

    allDateTime = []

    index1 = (datetime.strptime(startTime, "%d-%m-%Y %H:%M:%S")
              ).hour*60+(datetime.strptime(startTime, "%d-%m-%Y %H:%M:%S")).minute

    index2 = index1 + int((datetime.strptime(endTime, "%d-%m-%Y %H:%M:%S") -
                           datetime.strptime(startTime, "%d-%m-%Y %H:%M:%S")).total_seconds() / 60)

    if time1 > 1 + (datetime.strptime(endTime, "%d-%m-%Y %H:%M:%S")-datetime.strptime(startTime, "%d-%m-%Y %H:%M:%S")).total_seconds() / 60:
        return jsonify("Time ERROR")

    startTime = (datetime.strptime(startTime, "%d-%m-%Y %H:%M:%S"))
    endTime = (datetime.strptime(endTime, "%d-%m-%Y %H:%M:%S"))

    while startTime <= endTime:

        allDateTime.append(startTime.strftime("%d-%m-%Y %H:%M:%S"))

        startTime = (startTime + timedelta(hours=0, minutes=time1))

    startDateObj = datetime.strptime(startDate, "%Y-%m-%d")
    endDateObj = datetime.strptime(endDate, "%Y-%m-%d")

    date_range = [startDateObj+timedelta(days=x)
                  for x in range((endDateObj-startDateObj).days+1)]

    # dts = [dt.strftime("%d-%m-%Y %H:%M:%S") for dt in
    #        datetime_range(startDateObj, endDateObj,
    #                       timedelta(minutes=time1))]

    # allDateTime = dts
    # print(allDateTime)

    # allDateTime = allDateTime[allDateTime.index(
    #     startTime):allDateTime.index(endTime)+1]

    reply = []
    listofzeros = [] * 1440

    names = ''

    merge_list = []

    df1 = pd.DataFrame.from_dict({'Date_Time': allDateTime})

    merge_list.append(df1)

    for station in stationName:

        names = names+station+', '
        frequency = []

        for it in date_range:

            filter = {
                'd': {
                    '$gte': datetime(it.year, it.month, it.day, 0, 0, 0, tzinfo=timezone.utc),
                    '$lte': datetime(it.year, it.month, it.day, 0, 0, 0, tzinfo=timezone.utc)
                },
                'n': station

            }
            project = {
                '_id': 0,
                'p': 1,

            }

            result = frequency_data_collection.find(
                filter=filter,
                projection=project
            )

            result_list = list(result)

            if len(result_list) == 0:
                frequency = frequency + listofzeros

            else:

                frequency = frequency + result_list[0]['p']

        for i in range(len(frequency)):
            x = float(frequency[i])
            math.isnan(x)
            if math.isnan(x):
                frequency[i] = 0

        frequency = frequency[index1:index2+1]

        if time1 == 1:

            data = {'stationName': station,
                    'frequency': frequency}
            reply.append(data)

        else:

            temp_frequency = []

            x = list(divide_chunks(frequency, time1))

            for item in x:
                max_1, min_1, avg_1 = my_max_min_function(item)
                temp_frequency.append(avg_1)

            data = {'stationName': station,
                    'frequency': temp_frequency}
            reply.append(data)

        # df1 = pd.DataFrame.from_dict({station: frequency})

        # merge_list.append(df1)

    # merged = pd.concat(merge_list, axis=1, join="inner")

    # merged.to_excel("Frequency.xlsx", index=None)

    for i in range(len(reply)):

        max, min, avg = my_max_min_function(reply[i]['frequency'])

        if max[0] == 0 and min[0] == 0:
            max = [[0], []]
            min = [[0], []]

        elif len(max) > 50 and len(min) > 50:
            max = [[max[0]], []]
            min = [[min[0]], []]

        else:
            l1 = []
            l2 = []

            for x in range(1, len(max)):

                l1.append(max[0])
                l2.append(allDateTime[x])

            max = [l1, l2]
            l1 = []
            l2 = []

            for y in range(1, len(min)):
                l1.append(min[0])
                l2.append(allDateTime[y])

            min = [l1, l2]

        reply[i]['max'] = max
        reply[i]['min'] = min
        reply[i]['avg'] = avg

        temp_freq_lst = reply[i]["frequency"].copy()
        temp_freq_lst.sort()
        # temp_freq_lst = list(dict.fromkeys(temp_freq_lst))
        # iz = 5
        # while iz < len(temp_freq_lst):
        #     if temp_freq_lst[iz] == temp_freq_lst[iz-1] and temp_freq_lst[iz] == temp_freq_lst[iz-2] and temp_freq_lst[iz] == temp_freq_lst[iz-3] and temp_freq_lst[iz] == temp_freq_lst[iz-4] and temp_freq_lst[iz] == temp_freq_lst[iz-5]:
        #         del temp_freq_lst[iz]
        #     else:
        #         iz += 1
        z = list(np.linspace(0, 100, len(temp_freq_lst)))
        temp_freq_lst.reverse()
        temp_list = [temp_freq_lst, z]

        reply[i]['Duration'] = temp_list

    reply.append({'Date_Time': allDateTime})

    for x in range(len(reply)-1):
        df1 = pd.DataFrame.from_dict(
            {reply[x]['stationName']: reply[x]['frequency']})
        merge_list.append(df1)

    global Frequency_excel_data

    Frequency_excel_data = merge_list
    names = names[:-2]

    return jsonify(reply)


@app.route('/GetMultiFrequencyData', methods=['GET', 'POST'])
def GetMultiFrequencyData():

    MultistartDate = request.args['MultistartDate']
    MultistartDate = MultistartDate.split(',')
    MultistationName = request.args['MultistationName']
    stationName = MultistationName.split(',')
    Type = request.args['Type']

    time1 = int(request.args['time'])

    listofzeros = [0] * 1440

    if Type == "Date":

        startDateObj = datetime.strptime(MultistartDate[0], "%Y-%m-%d")
        endDateObj = datetime.strptime(MultistartDate[0], "%Y-%m-%d")

        reply = []

        dts = [dt.strftime("%H:%M:%S") for dt in
               datetime_range(startDateObj, endDateObj,
                              timedelta(minutes=time1))]

        allDateTime = dts

        for station in stationName:

            for dateval in MultistartDate:

                DateObj = datetime.strptime(dateval, "%Y-%m-%d")

                frequency = []

                filter = {
                    'd': {
                        '$gte': datetime(DateObj.year, DateObj.month, DateObj.day, 0, 0, 0, tzinfo=timezone.utc),
                        '$lte': datetime(DateObj.year, DateObj.month, DateObj.day, 0, 0, 0, tzinfo=timezone.utc)
                    },
                    'n': station
                }
                project = {
                    '_id': 0,
                    'p': 1,

                }

                result = frequency_data_collection.find(
                    filter=filter,
                    projection=project

                )

                result_list = list(result)

                if len(result_list) == 0:
                    frequency = frequency + listofzeros

                else:

                    frequency = frequency + result_list[0]['p']

                for i in range(len(frequency)):
                    x = float(frequency[i])
                    math.isnan(x)
                    if math.isnan(x):
                        frequency[i] = 0

                if time1 == 1:

                    temp_freq_lst = frequency.copy()
                    temp_freq_lst.sort()
                    z = list(np.linspace(0, 100, len(temp_freq_lst)))
                    temp_freq_lst.reverse()
                    temp_list = [temp_freq_lst, z]

                    data = {'stationName': station,
                            'frequency': frequency, 'Date_Time': DateObj, 'Duration': temp_list}
                    reply.append(data)

                else:
                    temp_frequency = []

                    x = list(divide_chunks(frequency, time1))

                    for item in x:
                        max_1, min_1, avg_1 = my_max_min_function(item)
                        temp_frequency.append(avg_1)

                    data = {'stationName': station,
                            'frequency': temp_frequency, 'Date_Time': DateObj}
                    reply.append(data)

    elif Type == "Month":

        reply = []
        allDateTime = []

        for station in stationName:

            for dateval in MultistartDate:

                startDateObj = datetime.strptime(dateval, "%Y-%m-%d")
                endDateObj = pd.Timestamp(dateval) + MonthEnd(1)

                dts = [dt.strftime("%d-%m-%Y %H:%M:%S") for dt in
                       datetime_range(startDateObj, endDateObj,
                                      timedelta(minutes=time1))]

                if len(allDateTime) < len(dts):
                    allDateTime = dts

                alldate = pd.date_range(
                    startDateObj, endDateObj-timedelta(days=1), freq='d').strftime("%Y-%m-%d")
                alldate = list(alldate)
                endDateObj = endDateObj.strftime("%Y-%m-%d")
                alldate.append(endDateObj)

                frequency = []

                for dates in alldate:

                    dates = datetime.strptime(dates, "%Y-%m-%d")

                    filter = {
                        'd': {
                            '$gte': datetime(dates.year, dates.month, dates.day, 0, 0, 0, tzinfo=timezone.utc),
                            '$lte': datetime(dates.year, dates.month, dates.day, 0, 0, 0, tzinfo=timezone.utc)
                        },
                        'n': station
                    }
                    project = {
                        '_id': 0,
                        'p': 1,

                    }

                    result = frequency_data_collection.find(
                        filter=filter,
                        projection=project

                    )

                    result_list = list(result)

                    if len(result_list) == 0:
                        frequency = frequency + listofzeros

                    else:

                        frequency = frequency + result_list[0]['p']

                for i in range(len(frequency)):
                    x = float(frequency[i])
                    math.isnan(x)
                    if math.isnan(x):
                        frequency[i] = 0

                if time1 == 1:

                    temp_freq_lst = frequency.copy()
                    temp_freq_lst.sort()
                    z = list(np.linspace(0, 100, len(temp_freq_lst)))
                    temp_freq_lst.reverse()
                    temp_list = [temp_freq_lst, z]

                    data = {'stationName': station,
                            'frequency': frequency, 'Date_Time': startDateObj, 'Duration': temp_list}
                    reply.append(data)

                else:
                    temp_frequency = []

                    x = list(divide_chunks(frequency, time1))

                    for item in x:
                        max_1, min_1, avg_1 = my_max_min_function(item)
                        temp_frequency.append(avg_1)

                    data = {'stationName': station,
                            'frequency': temp_frequency, 'Date_Time': startDateObj}
                    reply.append(data)

    temp_dict = {
        'Date_Time': allDateTime
    }

    for i in range(len(reply)):

        max, min, avg = my_max_min_function(reply[i]['frequency'])

        if max[0] == 0 and min[0] == 0:
            max = [[0], []]
            min = [[0], []]

        elif len(max) > 50 and len(min) > 50:
            max = [[max[0]], []]
            min = [[min[0]], []]

        else:
            l1 = []
            l2 = []

            for x in range(1, len(max)):
                l1.append(max[0])
                l2.append(allDateTime[x])

            max = [l1, l2]
            l1 = []
            l2 = []

            for y in range(1, len(min)):
                l1.append(min[0])
                l2.append(allDateTime[y])

            min = [l1, l2]

        reply[i]['max'] = max
        reply[i]['min'] = min
        reply[i]['avg'] = avg

        temp_freq_lst = reply[i]["frequency"].copy()
        temp_freq_lst.sort()
        z = list(np.linspace(0, 100, len(temp_freq_lst)))
        temp_freq_lst.reverse()
        temp_list = [temp_freq_lst, z]

        reply[i]['Duration'] = temp_list

    reply.append(temp_dict)

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

    startDate1 = startDate1.split(" ")
    endDate1 = endDate1.split(" ")

    startDate = startDate1[0]
    endDate = endDate1[0]

    res= Names(startDate,endDate,"LinesMWMVAR")

    return res


@app.route('/MultiLinesMWMVARNames', methods=['GET', 'POST'])
def MultiLinesMWMVARNames():

    MultistartDate = request.args['MultistartDate']
    MultistartDate = MultistartDate.split(',')

    res= MultiNames(MultistartDate,"LinesMWMVAR")

    return res


@app.route('/LinesMWMVARData', methods=['GET', 'POST'])
def LinesMWMVARData():

    startDate1 = request.args['startDate']
    endDate1 = request.args['endDate']

    stationName = request.args['stationName']
    stationName = stationName.split(',')
    time1 = int(request.args['time'])

    startTime = startDate1+":00"
    endTime = endDate1+":00"

    startDate1 = startDate1.split(" ")
    endDate1 = endDate1.split(" ")

    startDate = startDate1[0]
    endDate = endDate1[0]

    startTime = (datetime.strptime(startTime, "%Y-%m-%d %H:%M:%S")
                 ).strftime("%d-%m-%Y %H:%M:%S")
    endTime = ((datetime.strptime(endTime, "%Y-%m-%d %H:%M:%S")
                ).strftime("%d-%m-%Y %H:%M:%S"))

    allDateTime = []

    index1 = (datetime.strptime(startTime, "%d-%m-%Y %H:%M:%S")
              ).hour*60+(datetime.strptime(startTime, "%d-%m-%Y %H:%M:%S")).minute

    index2 = index1 + int((datetime.strptime(endTime, "%d-%m-%Y %H:%M:%S") -
                           datetime.strptime(startTime, "%d-%m-%Y %H:%M:%S")).total_seconds() / 60)

    if time1 > 1 + (datetime.strptime(endTime, "%d-%m-%Y %H:%M:%S")-datetime.strptime(startTime, "%d-%m-%Y %H:%M:%S")).total_seconds() / 60:
        return jsonify("Time ERROR")

    startTime = (datetime.strptime(startTime, "%d-%m-%Y %H:%M:%S"))
    endTime = (datetime.strptime(endTime, "%d-%m-%Y %H:%M:%S"))

    while startTime <= endTime:

        allDateTime.append(startTime.strftime("%d-%m-%Y %H:%M:%S"))

        startTime = (startTime + timedelta(hours=0, minutes=time1))

    startDateObj = datetime.strptime(startDate, "%Y-%m-%d")
    endDateObj = datetime.strptime(endDate, "%Y-%m-%d")

    date_range = [startDateObj+timedelta(days=x)
                  for x in range((endDateObj-startDateObj).days+1)]

    # dts = [dt.strftime("%d-%m-%Y %H:%M:%S") for dt in
    #        datetime_range(startDateObj, endDateObj,
    #                       timedelta(minutes=time1))]

    # allDateTime = dts

    # allDateTime = allDateTime[allDateTime.index(
    #     startTime):allDateTime.index(endTime)+1]

    reply = []
    listofzeros = [0] * 1440

    merge_list = []

    df1 = pd.DataFrame.from_dict({'Date_Time': allDateTime})

    merge_list.append(df1)

    for station in stationName:

        temp_name = station
        temp_name = temp_name.split(" ")

        if temp_name[-1] == "MW":

            station = station[:-3]

            line = []

            for it in date_range:

                filter = {
                    'd': {
                        '$gte': datetime(it.year, it.month, it.day, 0, 0, 0, tzinfo=timezone.utc),
                        '$lte': datetime(it.year, it.month, it.day, 0, 0, 0, tzinfo=timezone.utc)
                    },
                    'n': station

                }
                project = {
                    '_id': 0,
                    'p': 1,

                }

                result = line_mw_data_collection.find(
                    filter=filter,
                    projection=project

                )

                global Lines_file_name

                Lines_file_name = 'p1'

                result_list = list(result)

                if len(result_list) == 0:

                    result1 = line_mw_data_collection1.find(
                        filter=filter,
                        projection=project

                    )
                    Lines_file_name = 'p2'

                    result_list = list(result1)

                if len(result_list) == 0:

                    result2 = line_mw_data_collection2.find(
                        filter=filter,
                        projection=project

                    )
                    Lines_file_name = '400 & above'

                    result_list = list(result2)

                if len(result_list) == 0:
                    line = line + listofzeros

                else:

                    line = line + result_list[0]['p']

            for i in range(len(line)):
                x = float(line[i])
                math.isnan(x)
                if math.isnan(x):
                    line[i] = 0

            line = line[index1:index2+1]

            if time1 == 1:

                data = {'stationName': station, 'line': line}
                reply.append(data)

            else:
                temp_line = []

                x = list(divide_chunks(line, time1))

                for item in x:
                    max_1, min_1, avg_1 = my_max_min_function(item)
                    temp_line.append(avg_1)

                data = {'stationName': station, 'line': temp_line}
                reply.append(data)

            # df1 = pd.DataFrame.from_dict({station+' '+Lines_file_name: line})

            # merge_list.append(df1)

        elif temp_name[-1] == "MVAR":

            station = station[:-5]

            line = []

            for it in date_range:

                filter = {
                    'd': {
                        '$gte': datetime(it.year, it.month, it.day, 0, 0, 0, tzinfo=timezone.utc),
                        '$lte': datetime(it.year, it.month, it.day, 0, 0, 0, tzinfo=timezone.utc)
                    },
                    'n': station

                }
                project = {
                    '_id': 0,
                    'p': 1,

                }

                result = MVAR_P1.find(
                    filter=filter,
                    projection=project

                )

                global MVAR_file_name

                MVAR_file_name = 'p1'

                result_list = list(result)

                if len(result_list) == 0:

                    result1 = MVAR_P2.find(
                        filter=filter,
                        projection=project

                    )
                    MVAR_file_name = 'p2'

                    result_list = list(result1)

                if len(result_list) == 0:

                    result2 = Lines_MVAR_400_above.find(
                        filter=filter,
                        projection=project

                    )
                    MVAR_file_name = '400 & above'

                    result_list = list(result2)

                if len(result_list) == 0:
                    line = line + listofzeros

                else:

                    line = line + result_list[0]['p']

            for i in range(len(line)):
                x = float(line[i])
                math.isnan(x)
                if math.isnan(x):
                    line[i] = 0

            line = line[index1:index2+1]

            if time1 == 1:

                data = {'stationName': station, 'line': line}
                reply.append(data)

            else:
                temp_line = []

                x = list(divide_chunks(line, time1))

                for item in x:
                    max_1, min_1, avg_1 = my_max_min_function(item)
                    temp_line.append(avg_1)

                data = {'stationName': station, 'line': temp_line}
                reply.append(data)

            # df1 = pd.DataFrame.from_dict({station+' '+MVAR_file_name: line})

            # merge_list.append(df1)

    # merged = pd.concat(merge_list, axis=1, join="inner")

    # merged.to_excel("Line.xlsx", index=None)

    for i in range(len(reply)):

        max, min, avg = my_max_min_function(reply[i]['line'])

        if max[0] == 0 and min[0] == 0:
            max = [[0], []]
            min = [[0], []]

        elif len(max) > 50 and len(min) > 50:
            max = [[max[0]], []]
            min = [[min[0]], []]

        else:
            l1 = []
            l2 = []

            for x in range(1, len(max)):
                l1.append(max[0])
                l2.append(allDateTime[x])

            max = [l1, l2]
            l1 = []
            l2 = []

            for y in range(1, len(min)):
                l1.append(min[0])
                l2.append(allDateTime[y])

            min = [l1, l2]

        reply[i]['max'] = max
        reply[i]['min'] = min
        reply[i]['avg'] = avg

    reply.append({'Date_Time': allDateTime})

    for x in range(len(reply)-1):
        df1 = pd.DataFrame.from_dict(
            {reply[x]['stationName']: reply[x]['line']})
        merge_list.append(df1)

    global Lines_excel_data
    Lines_excel_data = merge_list

    return jsonify(reply)


@app.route('/MultiLinesMWMVARData', methods=['GET', 'POST'])
def MultiLinesMWMVARData():

    MultistartDate = request.args['MultistartDate']
    MultistartDate = MultistartDate.split(',')
    MultistationName = request.args['MultistationName']
    stationName = MultistationName.split(',')
    Type = request.args['Type']

    time1 = int(request.args['time'])

    global Lines_file_name

    listofzeros = [0] * 1440

    if Type == "Date":

        startDateObj = datetime.strptime(MultistartDate[0], "%Y-%m-%d")
        endDateObj = datetime.strptime(MultistartDate[0], "%Y-%m-%d")

        reply = []

        dts = [dt.strftime("%H:%M:%S") for dt in
               datetime_range(startDateObj, endDateObj,
                              timedelta(minutes=time1))]

        allDateTime = dts

        for station in stationName:

            temp_name = station
            temp_name = temp_name.split(" ")

            if temp_name[-1] == "MW":

                station = station[:-3]

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
                    project = {
                        '_id': 0,
                        'p': 1,

                    }

                    result = line_mw_data_collection.find(
                        filter=filter,
                        projection=project

                    )

                    Lines_file_name = 'p1'

                    result_list = list(result)

                    if len(result_list) == 0:

                        result1 = line_mw_data_collection1.find(
                            filter=filter,
                            projection=project

                        )
                        Lines_file_name = 'p2'

                        result_list = list(result1)

                    if len(result_list) == 0:

                        result2 = line_mw_data_collection2.find(
                            filter=filter,
                            projection=project

                        )
                        Lines_file_name = '400 & above'

                        result_list = list(result2)

                    if len(result_list) == 0:
                        line = line + listofzeros

                    else:

                        line = line + result_list[0]['p']

                    for i in range(len(line)):
                        x = float(line[i])
                        math.isnan(x)
                        if math.isnan(x):
                            line[i] = 0

                    if time1 == 1:

                        data = {'stationName': station,
                                'line': line, 'Date_Time': DateObj}
                        reply.append(data)

                    else:
                        temp_line = []

                        x = list(divide_chunks(line, time1))

                        for item in x:
                            max_1, min_1, avg_1 = my_max_min_function(item)
                            temp_line.append(avg_1)

                        data = {'stationName': station,
                                'line': temp_line, 'Date_Time': DateObj}
                        reply.append(data)

            elif temp_name[-1] == "MVAR":

                station = station[:-5]

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
                    project = {
                        '_id': 0,
                        'p': 1,

                    }

                    result = MVAR_P1.find(
                        filter=filter,
                        projection=project

                    )

                    result_list = list(result)

                    if len(result_list) == 0:

                        result1 = MVAR_P2.find(
                            filter=filter,
                            projection=project

                        )

                        result_list = list(result1)

                    if len(result_list) == 0:

                        result2 = Lines_MVAR_400_above.find(
                            filter=filter,
                            projection=project

                        )

                        result_list = list(result2)

                    if len(result_list) == 0:
                        line = line + listofzeros

                    else:

                        line = line + result_list[0]['p']

                    for i in range(len(line)):
                        x = float(line[i])
                        math.isnan(x)
                        if math.isnan(x):
                            line[i] = 0

                    if time1 == 1:

                        data = {'stationName': station,
                                'line': line, 'Date_Time': DateObj}
                        reply.append(data)

                    else:
                        temp_line = []

                        x = list(divide_chunks(line, time1))

                        for item in x:
                            max_1, min_1, avg_1 = my_max_min_function(item)
                            temp_line.append(avg_1)

                        data = {'stationName': station,
                                'line': temp_line, 'Date_Time': DateObj}
                        reply.append(data)

    elif Type == "Month":

        reply = []
        allDateTime = []

        for station in stationName:

            temp_name = station
            temp_name = temp_name.split(" ")

            if temp_name[-1] == "MW":

                station = station[:-3]

                for dateval in MultistartDate:

                    startDateObj = datetime.strptime(dateval, "%Y-%m-%d")
                    endDateObj = pd.Timestamp(dateval) + MonthEnd(1)

                    dts = [dt.strftime("%d-%m-%Y %H:%M:%S") for dt in
                           datetime_range(startDateObj, endDateObj,
                                          timedelta(minutes=time1))]

                    if len(allDateTime) < len(dts):
                        allDateTime = dts

                    alldate = pd.date_range(
                        startDateObj, endDateObj-timedelta(days=1), freq='d').strftime("%Y-%m-%d")
                    alldate = list(alldate)
                    endDateObj = endDateObj.strftime("%Y-%m-%d")
                    alldate.append(endDateObj)

                    line = []

                    for dates in alldate:

                        dates = datetime.strptime(dates, "%Y-%m-%d")

                        filter = {
                            'd': {
                                '$gte': datetime(dates.year, dates.month, dates.day, 0, 0, 0, tzinfo=timezone.utc),
                                '$lte': datetime(dates.year, dates.month, dates.day, 0, 0, 0, tzinfo=timezone.utc)
                            },
                            'n': station
                        }
                        project = {
                            '_id': 0,
                            'p': 1,

                        }

                        result = line_mw_data_collection.find(
                            filter=filter,
                            projection=project

                        )

                        Lines_file_name = 'p1'

                        result_list = list(result)

                        if len(result_list) == 0:

                            result1 = line_mw_data_collection1.find(
                                filter=filter,
                                projection=project

                            )
                            Lines_file_name = 'p2'

                            result_list = list(result1)

                        if len(result_list) == 0:

                            result2 = line_mw_data_collection2.find(
                                filter=filter,
                                projection=project

                            )
                            Lines_file_name = '400 & above'

                            result_list = list(result2)

                        if len(result_list) == 0:
                            line = line + listofzeros

                        else:

                            line = line + result_list[0]['p']

                    for i in range(len(line)):
                        x = float(line[i])
                        math.isnan(x)
                        if math.isnan(x):
                            line[i] = 0

                    if time1 == 1:

                        data = {'stationName': station,
                                'line': line, 'Date_Time': startDateObj}
                        reply.append(data)

                    else:
                        temp_line = []

                        x = list(divide_chunks(line, time1))

                        for item in x:
                            max_1, min_1, avg_1 = my_max_min_function(item)
                            temp_line.append(avg_1)

                        data = {'stationName': station,
                                'line': temp_line, 'Date_Time': startDateObj}
                        reply.append(data)

            elif temp_name[-1] == "MVAR":

                station = station[:-5]

                for dateval in MultistartDate:

                    startDateObj = datetime.strptime(dateval, "%Y-%m-%d")
                    endDateObj = pd.Timestamp(dateval) + MonthEnd(1)

                    dts = [dt.strftime("%d-%m-%Y %H:%M:%S") for dt in
                           datetime_range(startDateObj, endDateObj,
                                          timedelta(minutes=time1))]

                    if len(allDateTime) < len(dts):
                        allDateTime = dts

                    alldate = pd.date_range(
                        startDateObj, endDateObj-timedelta(days=1), freq='d').strftime("%Y-%m-%d")
                    alldate = list(alldate)
                    endDateObj = endDateObj.strftime("%Y-%m-%d")
                    alldate.append(endDateObj)

                    line = []

                    for dates in alldate:

                        dates = datetime.strptime(dates, "%Y-%m-%d")

                        filter = {
                            'd': {
                                '$gte': datetime(dates.year, dates.month, dates.day, 0, 0, 0, tzinfo=timezone.utc),
                                '$lte': datetime(dates.year, dates.month, dates.day, 0, 0, 0, tzinfo=timezone.utc)
                            },
                            'n': station

                        }

                        project = {
                            '_id': 0,
                            'p': 1,

                        }

                        result = MVAR_P1.find(
                            filter=filter,
                            projection=project

                        )

                        result_list = list(result)

                        if len(result_list) == 0:

                            result1 = MVAR_P2.find(
                                filter=filter,
                                projection=project

                            )

                            result_list = list(result1)

                        if len(result_list) == 0:

                            result2 = Lines_MVAR_400_above.find(
                                filter=filter,
                                projection=project

                            )

                            result_list = list(result2)

                        if len(result_list) == 0:
                            line = line + listofzeros

                        else:

                            line = line + result_list[0]['p']

                    for i in range(len(line)):
                        x = float(line[i])
                        math.isnan(x)
                        if math.isnan(x):
                            line[i] = 0

                    if time1 == 1:

                        data = {'stationName': station,
                                'line': line, 'Date_Time': startDateObj}
                        reply.append(data)

                    else:
                        temp_line = []

                        x = list(divide_chunks(line, time1))

                        for item in x:
                            max_1, min_1, avg_1 = my_max_min_function(item)
                            temp_line.append(avg_1)

                        data = {'stationName': station,
                                'line': temp_line, 'Date_Time': startDateObj}
                        reply.append(data)

    temp_dict = {
        'Date_Time': allDateTime
    }

    for i in range(len(reply)):

        max, min, avg = my_max_min_function(reply[i]['line'])

        if max[0] == 0 and min[0] == 0:
            max = [[0], []]
            min = [[0], []]

        elif len(max) > 50 and len(min) > 50:
            max = [[max[0]], []]
            min = [[min[0]], []]

        else:
            l1 = []
            l2 = []

            for x in range(1, len(max)):
                l1.append(max[0])
                l2.append(allDateTime[x])

            max = [l1, l2]
            l1 = []
            l2 = []

            for y in range(1, len(min)):
                l1.append(min[0])
                l2.append(allDateTime[y])

            min = [l1, l2]

        reply[i]['max'] = max
        reply[i]['min'] = min
        reply[i]['avg'] = avg

    reply.append(temp_dict)

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

    startDate1 = startDate1.split(" ")
    endDate1 = endDate1.split(" ")

    startDate = startDate1[0]
    endDate = endDate1[0]

    res= Names(startDate,endDate,"Demand")

    return res


@app.route('/MultiDemandMinNames', methods=['GET', 'POST'])
def MultiDemandMinNames():

    MultistartDate = request.args['MultistartDate']
    MultistartDate = MultistartDate.split(',')
    
    res= MultiNames(MultistartDate,"Demand")

    return res


@app.route('/GetDemandMinData', methods=['GET', 'POST'])
def GetDemandMinData():

    startDate1 = request.args['startDate']
    endDate1 = request.args['endDate']

    stationName = request.args['stationName']
    stationName = stationName.split(',')
    time1 = int(request.args['time'])

    startTime = startDate1+":00"
    endTime = endDate1+":00"

    startDate1 = startDate1.split(" ")
    endDate1 = endDate1.split(" ")

    startDate = startDate1[0]
    endDate = endDate1[0]

    startTime = (datetime.strptime(startTime, "%Y-%m-%d %H:%M:%S")
                 ).strftime("%d-%m-%Y %H:%M:%S")
    endTime = ((datetime.strptime(endTime, "%Y-%m-%d %H:%M:%S")
                ).strftime("%d-%m-%Y %H:%M:%S"))

    allDateTime = []

    index1 = (datetime.strptime(startTime, "%d-%m-%Y %H:%M:%S")
              ).hour*60+(datetime.strptime(startTime, "%d-%m-%Y %H:%M:%S")).minute

    index2 = index1 + int((datetime.strptime(endTime, "%d-%m-%Y %H:%M:%S") -
                           datetime.strptime(startTime, "%d-%m-%Y %H:%M:%S")).total_seconds() / 60)

    if time1 > 1+(datetime.strptime(endTime, "%d-%m-%Y %H:%M:%S")-datetime.strptime(startTime, "%d-%m-%Y %H:%M:%S")).total_seconds() / 60:
        return jsonify("Time ERROR")

    startTime = (datetime.strptime(startTime, "%d-%m-%Y %H:%M:%S"))
    endTime = (datetime.strptime(endTime, "%d-%m-%Y %H:%M:%S"))

    while startTime <= endTime:

        allDateTime.append(startTime.strftime("%d-%m-%Y %H:%M:%S"))

        startTime = (startTime + timedelta(hours=0, minutes=time1))

    startDateObj = datetime.strptime(startDate, "%Y-%m-%d")
    endDateObj = datetime.strptime(endDate, "%Y-%m-%d")

    date_range = [startDateObj+timedelta(days=x)
                  for x in range((endDateObj-startDateObj).days+1)]

    reply = []
    listofzeros = [0] * 1440

    names = ''

    merge_list = []

    df1 = pd.DataFrame.from_dict({'Date_Time': allDateTime})

    merge_list.append(df1)

    for station in stationName:

        names = names+station+', '

        output = []

        for it in date_range:

            filter = {
                'd': {
                    '$gte': datetime(it.year, it.month, it.day, 0, 0, 0, tzinfo=timezone.utc),
                    '$lte': datetime(it.year, it.month, it.day, 0, 0, 0, tzinfo=timezone.utc)
                },
                'n': station

            }
            project = {
                '_id': 0,
                'p': 1,

            }

            temp_station = station
            temp_station = temp_station.split("_")

            exempt_list= ['CESC DEMAND', 'ALL INDIA DEMAND', 'REG DEMAND']

            if (temp_station[-1] == "DEMAND" or station in exempt_list):

                demand_result = demand_collection.find(
                    filter=filter,
                    projection=project
                )

                demand_list = list(demand_result)

                if len(demand_list) == 0:
                    output = output + listofzeros

                else:

                    output = output + demand_list[0]['p']

            else:

                drawal_result = drawal_collection.find(
                    filter=filter,
                    projection=project
                )

                drawal_list = list(drawal_result)

                if len(drawal_list) == 0:
                    output = output + listofzeros

                else:

                    output = output + drawal_list[0]['p']

        for i in range(1, len(output)):
            x = float(output[i])
            math.isnan(x)
            if math.isnan(x):
                output[i] = 0

        output = output[index1:index2+1]

        # df1 = pd.DataFrame.from_dict({station: output})

        # merge_list.append(df1)

        if time1 == 1:

            data = {'stationName': station,
                    'output': output}
            reply.append(data)

        else:
            temp_output = []

            x = list(divide_chunks(output, time1))

            for item in x:
                max_1, min_1, avg_1 = my_max_min_function(item)
                temp_output.append(avg_1)

            data = {'stationName': station,
                    'output': temp_output}
            reply.append(data)

    # merged = pd.concat(merge_list, axis=1, join="inner")

    # merged.to_excel("DemandMin.xlsx", index=None)

    for i in range(len(reply)):

        max, min, avg = my_max_min_function(reply[i]['output'])

        if max[0] == 0 and min[0] == 0:
            max = [[0], []]
            min = [[0], []]

        elif len(max) > 50 and len(min) > 50:
            max = [[max[0]], []]
            min = [[min[0]], []]

        else:
            l1 = []
            l2 = []

            for x in range(1, len(max)):
                l1.append(max[0])
                l2.append(allDateTime[x])

            max = [l1, l2]
            l1 = []
            l2 = []

            for y in range(1, len(min)):
                l1.append(min[0])
                l2.append(allDateTime[y])

            min = [l1, l2]

        reply[i]['max'] = max
        reply[i]['min'] = min
        reply[i]['avg'] = avg

        temp_freq_lst = reply[i]["output"].copy()
        temp_freq_lst.sort()
        z = list(np.linspace(0, 100, len(temp_freq_lst)))
        temp_freq_lst.reverse()
        temp_list = [temp_freq_lst, z]

        reply[i]['Duration'] = temp_list

    reply.append({'Date_Time': allDateTime})

    names = names[:-2]

    for x in range(len(reply)-1):
        df1 = pd.DataFrame.from_dict(
            {reply[x]['stationName']: reply[x]['output']})
        merge_list.append(df1)

        # df2 = pd.DataFrame.from_dict(
        #     {'Maximums': reply[x]['max'][0]+reply[x]['max'][1]})
        # merge_list.append(df2)

        # df3 = pd.DataFrame.from_dict(
        #     {'Minimums': reply[x]['min'][0]+reply[x]['min'][1]})
        # merge_list.append(df3)

        # df4 = pd.DataFrame.from_dict({'Average': [reply[x]['avg']]})
        # merge_list.append(df4)

        # df5 = pd.DataFrame.from_dict({'Duration': reply[x]['Duration'][0]})
        # merge_list.append(df5)

    global Demand_excel_data
    Demand_excel_data = merge_list

    return jsonify(reply)


@app.route('/GetMultiDemandMinData', methods=['GET', 'POST'])
def GetMultiDemandMinData():

    MultistartDate = request.args['MultistartDate']
    MultistartDate = MultistartDate.split(',')
    MultistationName = request.args['MultistationName']
    stationName = MultistationName.split(',')
    Type = request.args['Type']

    time1 = int(request.args['time'])

    listofzeros = [0] * 1440

    if Type == "Date":

        startDateObj = datetime.strptime(MultistartDate[0], "%Y-%m-%d")
        endDateObj = datetime.strptime(MultistartDate[0], "%Y-%m-%d")

        # date_range= [startDateObj+timedelta(days=x) for x in range((endDateObj-startDateObj).days+1)]

        reply = []

        dts = [dt.strftime("%H:%M:%S") for dt in
               datetime_range(startDateObj, endDateObj,
                              timedelta(minutes=time1))]

        allDateTime = dts

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
                project = {
                    '_id': 0,
                    'p': 1,

                }

                # temp_station = station
                # temp_station = temp_station.split("_")
                temp_station= station[-6:]

                if temp_station == "DEMAND":

                    demand_result = demand_collection.find(
                        filter=filter,
                        projection=project
                    )

                    demand_list = list(demand_result)

                    if len(demand_list) == 0:
                        output = output + listofzeros

                    else:

                        output = output + demand_list[0]['p']

                else:

                    drawal_result = drawal_collection.find(
                        filter=filter,
                        projection=project
                    )

                    drawal_list = list(drawal_result)

                    if len(drawal_list) == 0:
                        output = output + listofzeros

                    else:

                        output = output + drawal_list[0]['p']

                for i in range(1, len(output)):
                    x = float(output[i])
                    math.isnan(x)
                    if math.isnan(x):
                        output[i] = 0

                if time1 == 1:

                    data = {'stationName': station, 'output': output,
                            'Date_Time': DateObj}
                    reply.append(data)

                else:
                    temp_output = []

                    x = list(divide_chunks(output, time1))

                    for item in x:
                        max_1, min_1, avg_1 = my_max_min_function(item)
                        temp_output.append(avg_1)

                    data = {'stationName': station, 'output': temp_output,
                            'Date_Time': DateObj}
                    reply.append(data)

        temp_dict = {
            'Date_Time': allDateTime
        }

        reply.append(temp_dict)

    elif Type == "Month":

        reply = []

        allDateTime = []

        # listofzeros = [0] * 96

        for station in stationName:

            for dateval in MultistartDate:

                startDateObj = datetime.strptime(dateval, "%Y-%m-%d")
                endDateObj = pd.Timestamp(dateval) + MonthEnd(1)

                # temp_allDateTime = []

                # for i in range(((endDateObj - startDateObj).days + 1)*24*60) :
                #     temp_allDateTime.append((startDateObj + timedelta(seconds = 900*i)).strftime("%d-%m-%Y %H:%M:%S"))

                # if (len(temp_allDateTime)>=len(allDateTime)):
                #     allDateTime= temp_allDateTime

                dts = [dt.strftime("%d-%m-%Y %H:%M:%S") for dt in
                       datetime_range(startDateObj, endDateObj,
                                      timedelta(minutes=time1))]

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
                project = {
                    '_id': 0,
                    'p': 1,

                }

                # temp_station = station
                # temp_station = temp_station.split("_")
                temp_station= station[-6:]

                if temp_station == "DEMAND":

                    demand_result = demand_collection.find(
                        filter=filter,
                        projection=project
                    )

                    demand_list = list(demand_result)

                    for item in demand_list:

                        output = output + item['p']
                    # print('demand ',len(demand))

                else:

                    drawal_result = drawal_collection.find(
                        filter=filter,
                        projection=project
                    )

                    drawal_list = list(drawal_result)

                    if len(drawal_list) == 0:
                        output = output + listofzeros

                    for item in drawal_list:

                        output = output + item['p']
                        # print('drawal ',len(drawal))

                for i in range(1, len(output)):
                    x = float(output[i])
                    math.isnan(x)
                    if math.isnan(x):
                        output[i] = 0

                if time1 == 1:

                    data = {'stationName': station, 'output': output,
                            'Date_Time': startDateObj}
                    reply.append(data)

                else:
                    temp_output = []

                    x = list(divide_chunks(output, time1))

                    for item in x:
                        max_1, min_1, avg_1 = my_max_min_function(item)
                        temp_output.append(avg_1)

                    data = {'stationName': station, 'output': output,
                            'Date_Time': startDateObj}
                    reply.append(data)

        temp_dict = {
            'Date_Time': allDateTime
        }

        reply.append(temp_dict)

    for i in range(len(reply)-1):

        max, min, avg = my_max_min_function(reply[i]['output'])

        if max[0] == 0 and min[0] == 0:
            max = [[0], []]
            min = [[0], []]

        elif len(max) > 50 and len(min) > 50:
            max = [[max[0]], []]
            min = [[min[0]], []]

        else:
            l1 = []
            l2 = []

            for x in range(1, len(max)):
                l1.append(max[0])
                l2.append(allDateTime[x])

            max = [l1, l2]
            l1 = []
            l2 = []

            for y in range(1, len(min)):
                l1.append(min[0])
                l2.append(allDateTime[y])

            min = [l1, l2]

        reply[i]['max'] = max
        reply[i]['min'] = min
        reply[i]['avg'] = avg

        temp_freq_lst = reply[i]["output"].copy()
        temp_freq_lst.sort()
        z = list(np.linspace(0, 100, len(temp_freq_lst)))
        temp_freq_lst.reverse()
        temp_list = [temp_freq_lst, z]

        reply[i]['Duration'] = temp_list

    return jsonify(reply)


@app.route('/GetDemandMinDataExcel', methods=['GET', 'POST'])
def GetDemandMinDataExcel():

    global Demand_excel_data

    if len(Demand_excel_data) > 0:

        merged = pd.concat(Demand_excel_data, axis=1, join="inner")

        merged.to_excel(
            dir_path+"Excel_Files/Demand.xlsx", index=None)

        path = dir_path+"Excel_Files/DemandMin.xlsx"

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

    startDate1 = startDate1.split(" ")
    endDate1 = endDate1.split(" ")

    startDate = startDate1[0]
    endDate = endDate1[0]

    res= Names(startDate,endDate,"Generator")

    return res


@app.route('/MultiGeneratorNames', methods=['GET', 'POST'])
def MultiGeneratorNames():

    MultistartDate = request.args['MultistartDate']
    MultistartDate = MultistartDate.split(',')

    res= MultiNames(MultistartDate,"Generator")

    return res


@app.route('/GetGeneratorData', methods=['GET', 'POST'])
def GetGeneratorData():

    startDate1 = request.args['startDate']
    endDate1 = request.args['endDate']

    stationName = request.args['stationName']
    stationName = stationName.split(',')
    time1 = int(request.args['time'])

    startTime = startDate1+":00"
    endTime = endDate1+":00"

    startDate1 = startDate1.split(" ")
    endDate1 = endDate1.split(" ")

    startDate = startDate1[0]
    endDate = endDate1[0]

    startTime = (datetime.strptime(startTime, "%Y-%m-%d %H:%M:%S")
                 ).strftime("%d-%m-%Y %H:%M:%S")
    endTime = ((datetime.strptime(endTime, "%Y-%m-%d %H:%M:%S")
                ).strftime("%d-%m-%Y %H:%M:%S"))

    allDateTime = []

    index1 = (datetime.strptime(startTime, "%d-%m-%Y %H:%M:%S")
              ).hour*60+(datetime.strptime(startTime, "%d-%m-%Y %H:%M:%S")).minute

    index2 = index1 + int((datetime.strptime(endTime, "%d-%m-%Y %H:%M:%S") -
                           datetime.strptime(startTime, "%d-%m-%Y %H:%M:%S")).total_seconds() / 60)

    if time1 > 1+(datetime.strptime(endTime, "%d-%m-%Y %H:%M:%S")-datetime.strptime(startTime, "%d-%m-%Y %H:%M:%S")).total_seconds() / 60:
        return jsonify("Time ERROR")

    startTime = (datetime.strptime(startTime, "%d-%m-%Y %H:%M:%S"))
    endTime = (datetime.strptime(endTime, "%d-%m-%Y %H:%M:%S"))

    while startTime <= endTime:

        allDateTime.append(startTime.strftime("%d-%m-%Y %H:%M:%S"))

        startTime = (startTime + timedelta(hours=0, minutes=time1))

    startDateObj = datetime.strptime(startDate, "%Y-%m-%d")
    endDateObj = datetime.strptime(endDate, "%Y-%m-%d")

    date_range = [startDateObj+timedelta(days=x)
                  for x in range((endDateObj-startDateObj).days+1)]

    # dts = [dt.strftime("%d-%m-%Y %H:%M:%S") for dt in
    #        datetime_range(startDateObj, endDateObj,
    #                       timedelta(minutes=time1))]

    # allDateTime = dts

    # allDateTime = allDateTime[allDateTime.index(
    #     startTime):allDateTime.index(endTime)+1]
    # allDateTime = []
    # for i in range(((endDateObj - startDateObj).days + 1)*24*60) :
    #     allDateTime.append((startDateObj + timedelta(seconds = 900*i)).strftime("%d-%m-%Y %H:%M:%S"))

    reply = []
    listofzeros = [0] * 1440

    names = ''

    merge_list = []

    df1 = pd.DataFrame.from_dict({'Date_Time': allDateTime})

    merge_list.append(df1)

    for station in stationName:

        names = names+station+', '

        output = []

        for it in date_range:

            filter = {
                'd': {
                    '$gte': datetime(it.year, it.month, it.day, 0, 0, 0, tzinfo=timezone.utc),
                    '$lte': datetime(it.year, it.month, it.day, 0, 0, 0, tzinfo=timezone.utc)
                },
                'n': station

            }
            project = {
                '_id': 0,
                'p': 1,

            }

            generator_result = Generator_DB.find(
                filter=filter,
                projection=project
            )

            generator_list = list(generator_result)

            if len(generator_list) == 0:
                output = output + listofzeros

            else:

                output = output + generator_list[0]['p']

        for i in range(1, len(output)):
            x = float(output[i])
            math.isnan(x)
            if math.isnan(x):
                output[i] = 0

        output = output[index1:index2+1]

        # df1 = pd.DataFrame.from_dict({station: output})

        # merge_list.append(df1)

        if time1 == 1:

            data = {'stationName': station,
                    'output': output}
            reply.append(data)

        else:
            temp_output = []

            x = list(divide_chunks(output, time1))

            for item in x:
                max_1, min_1, avg_1 = my_max_min_function(item)
                temp_output.append(avg_1)

            data = {'stationName': station,
                    'output': temp_output}
            reply.append(data)

    # merged = pd.concat(merge_list, axis=1, join="inner")

    # merged.to_excel("Generator.xlsx", index=None)

    for i in range(len(reply)):

        max, min, avg = my_max_min_function(reply[i]['output'])

        if max[0] == 0 and min[0] == 0:
            max = [[0], []]
            min = [[0], []]

        elif len(max) > 50 and len(min) > 50:
            max = [[max[0]], []]
            min = [[min[0]], []]

        else:
            l1 = []
            l2 = []

            for x in range(1, len(max)):
                l1.append(max[0])
                l2.append(allDateTime[x])

            max = [l1, l2]
            l1 = []
            l2 = []

            for y in range(1, len(min)):
                l1.append(min[0])
                l2.append(allDateTime[y])

            min = [l1, l2]

        reply[i]['max'] = max
        reply[i]['min'] = min
        reply[i]['avg'] = avg

        temp_freq_lst = reply[i]["output"].copy()
        temp_freq_lst.sort()
        z = list(np.linspace(0, 100, len(temp_freq_lst)))
        temp_freq_lst.reverse()
        temp_list = [temp_freq_lst, z]

        reply[i]['Duration'] = temp_list

    reply.append({'Date_Time': allDateTime})

    for x in range(len(reply)-1):
        df1 = pd.DataFrame.from_dict(
            {reply[x]['stationName']: reply[x]['output']})
        merge_list.append(df1)

    global Generator_excel_data
    Generator_excel_data = merge_list

    names = names[:-2]

    return jsonify(reply)


@app.route('/GetMultiGeneratorData', methods=['GET', 'POST'])
def GetMultiGeneratorData():

    MultistartDate = request.args['MultistartDate']
    MultistartDate = MultistartDate.split(',')
    MultistationName = request.args['MultistationName']
    stationName = MultistationName.split(',')
    Type = request.args['Type']

    time1 = int(request.args['time'])

    listofzeros = [0] * 1440

    if Type == "Date":

        startDateObj = datetime.strptime(MultistartDate[0], "%Y-%m-%d")
        endDateObj = datetime.strptime(MultistartDate[0], "%Y-%m-%d")

        # date_range= [startDateObj+timedelta(days=x) for x in range((endDateObj-startDateObj).days+1)]

        reply = []

        dts = [dt.strftime("%H:%M:%S") for dt in
               datetime_range(startDateObj, endDateObj,
                              timedelta(minutes=time1))]

        allDateTime = dts

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
                project = {
                    '_id': 0,
                    'p': 1,

                }

                generator_result = Generator_DB.find(
                    filter=filter,
                    projection=project
                )

                generator_list = list(generator_result)

                if len(generator_list) == 0:
                    output = output + listofzeros

                else:

                    output = output + generator_list[0]['p']

                for i in range(1, len(output)):
                    x = float(output[i])
                    math.isnan(x)
                    if math.isnan(x):
                        output[i] = 0

                if time1 == 1:

                    data = {'stationName': station, 'output': output,
                            'Date_Time': DateObj}
                    reply.append(data)

                else:
                    temp_output = []

                    x = list(divide_chunks(output, time1))

                    for item in x:
                        max_1, min_1, avg_1 = my_max_min_function(item)
                        temp_output.append(avg_1)

                    data = {'stationName': station, 'output': temp_output,
                            'Date_Time': DateObj}
                    reply.append(data)

        temp_dict = {
            'Date_Time': allDateTime
        }

        reply.append(temp_dict)

    elif Type == "Month":

        reply = []

        allDateTime = []

        # listofzeros = [0] * 96

        for station in stationName:

            for dateval in MultistartDate:

                startDateObj = datetime.strptime(dateval, "%Y-%m-%d")
                endDateObj = pd.Timestamp(dateval) + MonthEnd(1)

                # temp_allDateTime = []

                # for i in range(((endDateObj - startDateObj).days + 1)*24*60) :
                #     temp_allDateTime.append((startDateObj + timedelta(seconds = 900*i)).strftime("%d-%m-%Y %H:%M:%S"))

                # if (len(temp_allDateTime)>=len(allDateTime)):
                #     allDateTime= temp_allDateTime

                dts = [dt.strftime("%d-%m-%Y %H:%M:%S") for dt in
                       datetime_range(startDateObj, endDateObj,
                                      timedelta(minutes=time1))]

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
                project = {
                    '_id': 0,
                    'p': 1,

                }

                generator_result = Generator_DB.find(
                    filter=filter,
                    projection=project
                )

                generator_list = list(generator_result)

                for item in generator_list:

                    output = output + item['p']
                # print('generator ',len(generator))

                for i in range(1, len(output)):
                    x = float(output[i])
                    math.isnan(x)
                    if math.isnan(x):
                        output[i] = 0

                if time1 == 1:

                    data = {'stationName': station, 'output': output,
                            'Date_Time': startDateObj}
                    reply.append(data)

                else:
                    temp_output = []

                    x = list(divide_chunks(output, time1))

                    for item in x:
                        max_1, min_1, avg_1 = my_max_min_function(item)
                        temp_output.append(avg_1)

                    data = {'stationName': station, 'output': output,
                            'Date_Time': startDateObj}
                    reply.append(data)

        temp_dict = {
            'Date_Time': allDateTime
        }

        reply.append(temp_dict)

    for i in range(len(reply)-1):

        max, min, avg = my_max_min_function(reply[i]['output'])

        if max[0] == 0 and min[0] == 0:
            max = [[0], []]
            min = [[0], []]

        elif len(max) > 50 and len(min) > 50:
            max = [[max[0]], []]
            min = [[min[0]], []]

        else:
            l1 = []
            l2 = []

            for x in range(1, len(max)):
                l1.append(max[0])
                l2.append(allDateTime[x])

            max = [l1, l2]
            l1 = []
            l2 = []

            for y in range(1, len(min)):
                l1.append(min[0])
                l2.append(allDateTime[y])

            min = [l1, l2]

        reply[i]['max'] = max
        reply[i]['min'] = min
        reply[i]['avg'] = avg

        temp_freq_lst = reply[i]["output"].copy()
        temp_freq_lst.sort()
        z = list(np.linspace(0, 100, len(temp_freq_lst)))
        temp_freq_lst.reverse()
        temp_list = [temp_freq_lst, z]

        reply[i]['Duration'] = temp_list

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

    startDate1 = startDate1.split(" ")
    endDate1 = endDate1.split(" ")

    startDate = startDate1[0]
    endDate = endDate1[0]

    res= Names(startDate,endDate,"ThGenerator")

    return res


@app.route('/MultiThGeneratorNames', methods=['GET', 'POST'])
def ThMultiGeneratorNames():

    MultistartDate = request.args['MultistartDate']
    MultistartDate = MultistartDate.split(',')

    res= MultiNames(MultistartDate,"ThGenerator")

    return res



@app.route('/GetThGeneratorData', methods=['GET', 'POST'])
def GetThGeneratorData():

    startDate1 = request.args['startDate']
    endDate1 = request.args['endDate']

    stationName = request.args['stationName']
    stationName = stationName.split(',')
    time1 = int(request.args['time'])

    startTime = startDate1+":00"
    endTime = endDate1+":00"

    startDate1 = startDate1.split(" ")
    endDate1 = endDate1.split(" ")

    startDate = startDate1[0]
    endDate = endDate1[0]

    startTime = (datetime.strptime(startTime, "%Y-%m-%d %H:%M:%S")
                 ).strftime("%d-%m-%Y %H:%M:%S")
    endTime = ((datetime.strptime(endTime, "%Y-%m-%d %H:%M:%S")
                ).strftime("%d-%m-%Y %H:%M:%S"))

    allDateTime = []

    index1 = (datetime.strptime(startTime, "%d-%m-%Y %H:%M:%S")
              ).hour*60+(datetime.strptime(startTime, "%d-%m-%Y %H:%M:%S")).minute

    index2 = index1 + int((datetime.strptime(endTime, "%d-%m-%Y %H:%M:%S") -
                           datetime.strptime(startTime, "%d-%m-%Y %H:%M:%S")).total_seconds() / 60)

    if time1 > 1+(datetime.strptime(endTime, "%d-%m-%Y %H:%M:%S")-datetime.strptime(startTime, "%d-%m-%Y %H:%M:%S")).total_seconds() / 60:
        return jsonify("Time ERROR")

    startTime = (datetime.strptime(startTime, "%d-%m-%Y %H:%M:%S"))
    endTime = (datetime.strptime(endTime, "%d-%m-%Y %H:%M:%S"))

    while startTime <= endTime:

        allDateTime.append(startTime.strftime("%d-%m-%Y %H:%M:%S"))

        startTime = (startTime + timedelta(hours=0, minutes=time1))

    startDateObj = datetime.strptime(startDate, "%Y-%m-%d")
    endDateObj = datetime.strptime(endDate, "%Y-%m-%d")

    date_range = [startDateObj+timedelta(days=x)
                  for x in range((endDateObj-startDateObj).days+1)]

    # dts = [dt.strftime("%d-%m-%Y %H:%M:%S") for dt in
    #        datetime_range(startDateObj, endDateObj,
    #                       timedelta(minutes=time1))]

    # allDateTime = dts

    # allDateTime = allDateTime[allDateTime.index(
    #     startTime):allDateTime.index(endTime)+1]
    # allDateTime = []
    # for i in range(((endDateObj - startDateObj).days + 1)*24*60) :
    #     allDateTime.append((startDateObj + timedelta(seconds = 900*i)).strftime("%d-%m-%Y %H:%M:%S"))

    reply = []
    listofzeros = [0] * 1440

    names = ''

    merge_list = []

    df1 = pd.DataFrame.from_dict({'Date_Time': allDateTime})

    merge_list.append(df1)

    for station in stationName:

        names = names+station+', '

        output = []

        for it in date_range:

            filter = {
                'd': {
                    '$gte': datetime(it.year, it.month, it.day, 0, 0, 0, tzinfo=timezone.utc),
                    '$lte': datetime(it.year, it.month, it.day, 0, 0, 0, tzinfo=timezone.utc)
                },
                'n': station

            }
            project = {
                '_id': 0,
                'p': 1,

            }

            generator_result = Th_Gen_DB.find(
                filter=filter,
                projection=project
            )

            generator_list = list(generator_result)

            if len(generator_list) == 0:
                output = output + listofzeros

            else:

                output = output + generator_list[0]['p']

        for i in range(1, len(output)):
            x = float(output[i])
            math.isnan(x)
            if math.isnan(x):
                output[i] = 0

        output = output[index1:index2+1]

        # df1 = pd.DataFrame.from_dict({station: output})

        # merge_list.append(df1)

        if time1 == 1:

            data = {'stationName': station,
                    'output': output}
            reply.append(data)

        else:
            temp_output = []

            x = list(divide_chunks(output, time1))

            for item in x:
                max_1, min_1, avg_1 = my_max_min_function(item)
                temp_output.append(avg_1)

            data = {'stationName': station,
                    'output': temp_output}
            reply.append(data)

    # merged = pd.concat(merge_list, axis=1, join="inner")

    # merged.to_excel("Generator.xlsx", index=None)

    for i in range(len(reply)):

        max, min, avg = my_max_min_function(reply[i]['output'])

        if max[0] == 0 and min[0] == 0:
            max = [[0], []]
            min = [[0], []]

        elif len(max) > 50 and len(min) > 50:
            max = [[max[0]], []]
            min = [[min[0]], []]

        else:
            l1 = []
            l2 = []

            for x in range(1, len(max)):
                l1.append(max[0])
                l2.append(allDateTime[x])

            max = [l1, l2]
            l1 = []
            l2 = []

            for y in range(1, len(min)):
                l1.append(min[0])
                l2.append(allDateTime[y])

            min = [l1, l2]

        reply[i]['max'] = max
        reply[i]['min'] = min
        reply[i]['avg'] = avg

        temp_freq_lst = reply[i]["output"].copy()
        temp_freq_lst.sort()
        z = list(np.linspace(0, 100, len(temp_freq_lst)))
        temp_freq_lst.reverse()
        temp_list = [temp_freq_lst, z]

        reply[i]['Duration'] = temp_list

    reply.append({'Date_Time': allDateTime})

    for x in range(len(reply)-1):
        df1 = pd.DataFrame.from_dict(
            {reply[x]['stationName']: reply[x]['output']})
        merge_list.append(df1)

    global ThGenerator_excel_data
    ThGenerator_excel_data = merge_list

    names = names[:-2]

    return jsonify(reply)


@app.route('/GetMultiThGeneratorData', methods=['GET', 'POST'])
def GetMultiThGeneratorData():

    MultistartDate = request.args['MultistartDate']
    MultistartDate = MultistartDate.split(',')
    MultistationName = request.args['MultistationName']
    stationName = MultistationName.split(',')
    Type = request.args['Type']

    time1 = int(request.args['time'])

    listofzeros = [0] * 1440

    if Type == "Date":

        startDateObj = datetime.strptime(MultistartDate[0], "%Y-%m-%d")
        endDateObj = datetime.strptime(MultistartDate[0], "%Y-%m-%d")

        # date_range= [startDateObj+timedelta(days=x) for x in range((endDateObj-startDateObj).days+1)]

        reply = []

        dts = [dt.strftime("%H:%M:%S") for dt in
               datetime_range(startDateObj, endDateObj,
                              timedelta(minutes=time1))]

        allDateTime = dts

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
                project = {
                    '_id': 0,
                    'p': 1,

                }

                generator_result = Th_Gen_DB.find(
                    filter=filter,
                    projection=project
                )

                generator_list = list(generator_result)

                if len(generator_list) == 0:
                    output = output + listofzeros

                else:

                    output = output + generator_list[0]['p']

                for i in range(1, len(output)):
                    x = float(output[i])
                    math.isnan(x)
                    if math.isnan(x):
                        output[i] = 0

                if time1 == 1:

                    data = {'stationName': station, 'output': output,
                            'Date_Time': DateObj}
                    reply.append(data)

                else:
                    temp_output = []

                    x = list(divide_chunks(output, time1))

                    for item in x:
                        max_1, min_1, avg_1 = my_max_min_function(item)
                        temp_output.append(avg_1)

                    data = {'stationName': station, 'output': temp_output,
                            'Date_Time': DateObj}
                    reply.append(data)

        temp_dict = {
            'Date_Time': allDateTime
        }

        reply.append(temp_dict)

    elif Type == "Month":

        reply = []

        allDateTime = []

        # listofzeros = [0] * 96

        for station in stationName:

            for dateval in MultistartDate:

                startDateObj = datetime.strptime(dateval, "%Y-%m-%d")
                endDateObj = pd.Timestamp(dateval) + MonthEnd(1)

                # temp_allDateTime = []

                # for i in range(((endDateObj - startDateObj).days + 1)*24*60) :
                #     temp_allDateTime.append((startDateObj + timedelta(seconds = 900*i)).strftime("%d-%m-%Y %H:%M:%S"))

                # if (len(temp_allDateTime)>=len(allDateTime)):
                #     allDateTime= temp_allDateTime

                dts = [dt.strftime("%d-%m-%Y %H:%M:%S") for dt in
                       datetime_range(startDateObj, endDateObj,
                                      timedelta(minutes=time1))]

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
                project = {
                    '_id': 0,
                    'p': 1,

                }

                generator_result = Th_Gen_DB.find(
                    filter=filter,
                    projection=project
                )

                generator_list = list(generator_result)

                for item in generator_list:

                    output = output + item['p']
                # print('generator ',len(generator))

                for i in range(1, len(output)):
                    x = float(output[i])
                    math.isnan(x)
                    if math.isnan(x):
                        output[i] = 0

                if time1 == 1:

                    data = {'stationName': station, 'output': output,
                            'Date_Time': startDateObj}
                    reply.append(data)

                else:
                    temp_output = []

                    x = list(divide_chunks(output, time1))

                    for item in x:
                        max_1, min_1, avg_1 = my_max_min_function(item)
                        temp_output.append(avg_1)

                    data = {'stationName': station, 'output': output,
                            'Date_Time': startDateObj}
                    reply.append(data)

        temp_dict = {
            'Date_Time': allDateTime
        }

        reply.append(temp_dict)

    for i in range(len(reply)-1):

        max, min, avg = my_max_min_function(reply[i]['output'])

        if max[0] == 0 and min[0] == 0:
            max = [[0], []]
            min = [[0], []]

        elif len(max) > 50 and len(min) > 50:
            max = [[max[0]], []]
            min = [[min[0]], []]

        else:
            l1 = []
            l2 = []

            for x in range(1, len(max)):
                l1.append(max[0])
                l2.append(allDateTime[x])

            max = [l1, l2]
            l1 = []
            l2 = []

            for y in range(1, len(min)):
                l1.append(min[0])
                l2.append(allDateTime[y])

            min = [l1, l2]

        reply[i]['max'] = max
        reply[i]['min'] = min
        reply[i]['avg'] = avg

        temp_freq_lst = reply[i]["output"].copy()
        temp_freq_lst.sort()
        z = list(np.linspace(0, 100, len(temp_freq_lst)))
        temp_freq_lst.reverse()
        temp_list = [temp_freq_lst, z]

        reply[i]['Duration'] = temp_list

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

    startDate1 = startDate1.split(" ")
    endDate1 = endDate1.split(" ")

    startDate = startDate1[0]
    endDate = endDate1[0]

    res= Names(startDate,endDate,"ISGS")

    return res


@app.route('/MultiISGSNames', methods=['GET', 'POST'])
def MultiISGSNames():

    MultistartDate = request.args['MultistartDate']
    MultistartDate = MultistartDate.split(',')

    res= MultiNames(MultistartDate,"ISGS")

    return res


@app.route('/GetISGSData', methods=['GET', 'POST'])
def GetISGSData():

    startDate1 = request.args['startDate']
    endDate1 = request.args['endDate']

    stationName = request.args['stationName']

    stationName = stationName.split(',')

    time1 = int(request.args['time'])

    startTime = startDate1+":00"
    endTime = endDate1+":00"

    startDate1 = startDate1.split(" ")
    endDate1 = endDate1.split(" ")

    startDate = startDate1[0]
    endDate = endDate1[0]

    startTime = (datetime.strptime(startTime, "%Y-%m-%d %H:%M:%S")
                 ).strftime("%d-%m-%Y %H:%M:%S")
    endTime = ((datetime.strptime(endTime, "%Y-%m-%d %H:%M:%S")
                ).strftime("%d-%m-%Y %H:%M:%S"))

    allDateTime = []

    index1 = (datetime.strptime(startTime, "%d-%m-%Y %H:%M:%S")
              ).hour*60+(datetime.strptime(startTime, "%d-%m-%Y %H:%M:%S")).minute

    index2 = index1 + int((datetime.strptime(endTime, "%d-%m-%Y %H:%M:%S") -
                           datetime.strptime(startTime, "%d-%m-%Y %H:%M:%S")).total_seconds() / 60)

    if time1 > 1+(datetime.strptime(endTime, "%d-%m-%Y %H:%M:%S")-datetime.strptime(startTime, "%d-%m-%Y %H:%M:%S")).total_seconds() / 60:
        return jsonify("Time ERROR")

    startTime = (datetime.strptime(startTime, "%d-%m-%Y %H:%M:%S"))
    endTime = (datetime.strptime(endTime, "%d-%m-%Y %H:%M:%S"))

    while startTime <= endTime:

        allDateTime.append(startTime.strftime("%d-%m-%Y %H:%M:%S"))

        startTime = (startTime + timedelta(hours=0, minutes=time1))

    startDateObj = datetime.strptime(startDate, "%Y-%m-%d")
    endDateObj = datetime.strptime(endDate, "%Y-%m-%d")

    date_range = [startDateObj+timedelta(days=x)
                  for x in range((endDateObj-startDateObj).days+1)]

    # dts = [dt.strftime("%d-%m-%Y %H:%M:%S") for dt in
    #        datetime_range(startDateObj, endDateObj,
    #                       timedelta(minutes=time1))]

    # allDateTime = dts

    # allDateTime = allDateTime[allDateTime.index(
    #     startTime):allDateTime.index(endTime)+1]
    # allDateTime = []
    # for i in range(((endDateObj - startDateObj).days + 1)*24*60) :
    #     allDateTime.append((startDateObj + timedelta(seconds = 900*i)).strftime("%d-%m-%Y %H:%M:%S"))

    reply = []
    listofzeros = [0] * 1440

    names = ''

    merge_list = []

    df1 = pd.DataFrame.from_dict({'Date_Time': allDateTime})

    merge_list.append(df1)

    for station in stationName:

        names = names+station+', '

        output = []

        for it in date_range:

            filter = {
                'd': {
                    '$gte': datetime(it.year, it.month, it.day, 0, 0, 0, tzinfo=timezone.utc),
                    '$lte': datetime(it.year, it.month, it.day, 0, 0, 0, tzinfo=timezone.utc)
                },
                'n': station

            }
            project = {
                '_id': 0,
                'p': 1,

            }

            ISGS_result = ISGS_DB.find(
                filter=filter,
                projection=project
            )

            ISGS_list = list(ISGS_result)

            if len(ISGS_list) == 0:
                output = output + listofzeros

            else:

                output = output + ISGS_list[0]['p']

        for i in range(1, len(output)):
            x = float(output[i])
            math.isnan(x)
            if math.isnan(x):
                output[i] = 0

        output = output[index1:index2+1]

        # df1 = pd.DataFrame.from_dict({station: output})

        # merge_list.append(df1)

        if time1 == 1:

            data = {'stationName': station,
                    'output': output}
            reply.append(data)

        else:
            temp_output = []

            x = list(divide_chunks(output, time1))

            for item in x:
                max_1, min_1, avg_1 = my_max_min_function(item)
                temp_output.append(avg_1)

            data = {'stationName': station,
                    'output': temp_output}
            reply.append(data)

    # merged = pd.concat(merge_list, axis=1, join="inner")

    # merged.to_excel("ISGS.xlsx", index=None)

    for i in range(len(reply)):

        max, min, avg = my_max_min_function(reply[i]['output'])

        if max[0] == 0 and min[0] == 0:
            max = [[0], []]
            min = [[0], []]

        elif len(max) > 50 and len(min) > 50:
            max = [[max[0]], []]
            min = [[min[0]], []]

        else:
            l1 = []
            l2 = []

            for x in range(1, len(max)):
                l1.append(max[0])
                l2.append(allDateTime[x])

            max = [l1, l2]
            l1 = []
            l2 = []

            for y in range(1, len(min)):
                l1.append(min[0])
                l2.append(allDateTime[y])

            min = [l1, l2]

        reply[i]['max'] = max
        reply[i]['min'] = min
        reply[i]['avg'] = avg

        temp_freq_lst = reply[i]["output"].copy()
        temp_freq_lst.sort()
        z = list(np.linspace(0, 100, len(temp_freq_lst)))
        temp_freq_lst.reverse()
        temp_list = [temp_freq_lst, z]

        reply[i]['Duration'] = temp_list

    reply.append({'Date_Time': allDateTime})

    for x in range(len(reply)-1):
        df1 = pd.DataFrame.from_dict(
            {reply[x]['stationName']: reply[x]['output']})
        merge_list.append(df1)

    global ISGS_excel_data
    ISGS_excel_data = merge_list

    names = names[:-2]

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

    merged = pd.concat(ISGS_excel_data, axis=1, join="inner")

    merged.to_excel(dir_path+"Excel_Files/ISGS.xlsx", index=None)

    path = dir_path+"Excel_Files/ISGS.xlsx"

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
        custom = startDate+' '+' ISGS Data of '+names+'.xlsx'

    else:
        custom = startDate+' to '+endDate+' '+' ISGS Data of '+names+'.xlsx'

    if os.path.exists(path):
        with open(path, "rb") as excel:
            data = excel.read()

        response = Response(
            data, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        return send_file(dir_path+'Excel_Files/ISGS.xlsx', as_attachment=True, download_name=custom)

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
