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

# from pylinerating import thermal_rating, conductor, cigre601
# from util import *
# import schedule
# import time
# import re


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
ISGS_excel_data = []
MVAR_excel_data = []


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


def GetVoltageCollection():

    CONNECTION_STRING = "mongodb://mongodb0.erldc.in:27017,mongodb1.erldc.in:27017/?replicaSet=CONSERV"
    client = MongoClient(CONNECTION_STRING)
    db = client['mis']
    voltage_data_collection = db['voltage_data']

    return voltage_data_collection


voltageDateCollection = GetVoltageCollection()


def UpdateVoltageDfIntoDBtest(voltage_data_collection, df, for_date):
    doc_list = []
    df = df.astype('double').reset_index(drop=True)
    df.index = df.index.astype('str')

    if (len(df) != 1440):

        raise Exception("Error")

    for col in set(df.columns):
        temp = col
        temp = temp[:-1]
        temp = temp[1:]
        temp = temp.split("'")

        a = {
            "vol": df[col].round(3).to_list(),
            "vol2": df[col].round(3).to_list(),
            "d": pd.to_datetime(for_date),
            "ym": for_date.strftime("%Y%m"),
            "n": temp[1]}
        doc_list.append(a)
        if temp[3] == 'voltageBus1':
            res = voltage_data_collection.update_one(
                {"d": for_date, "ym": for_date.strftime("%Y%m"), "n": a['n']},
                {"$set": {"vol": a["vol"]}}, upsert=True)

        if temp[3] == 'voltageBus2':
            res = voltage_data_collection.update_one(
                {"d": for_date, "ym": for_date.strftime("%Y%m"), "n": a['n']},
                {"$set": {"vol2": a["vol2"]}}, upsert=True)

    return res


def InsertVoltageDfIntoDB(voltage_data_collection, df, for_date):

    CONNECTION_STRING = "mongodb://mongodb0.erldc.in:27017,mongodb1.erldc.in:27017/?replicaSet=CONSERV"
    client = MongoClient(CONNECTION_STRING)
    db = client['mis']
    voltage_data_collection = db['voltage_data']
    # voltage_data_collection.create_index(
    #     [("d", ASCENDING), ("n", ASCENDING)],
    #     unique=True
    # )

    doc_list = []
    df = df.astype('double').reset_index(drop=True)
    df.index = df.index.astype('str')
    if (len(df) != 1440):

        raise Exception("Error")
    for col in set(df.columns.get_level_values(0)):
        a = {
            "vol": df[col]['Bus-1 Voltage (kV)'].round(3).to_list(),
            "vol2": df[col]['Bus-2 Voltage (kV)'].round(3).to_list(),
            "d": pd.to_datetime(for_date),
            "ym": for_date.strftime("%Y%m"),
            "n": col}
        doc_list.append(a)

    try:
        res = voltage_data_collection.insert_many(doc_list)
        # print("Successfully inserted Voltage data for ", for_date)
    except:
        print("Voltage Database file insert not done")

    return res


@app.route('/VoltageFileInsert', methods=['GET', 'POST'])
def VoltageFileInsert():

    def getDf220P1(file, for_date):

        CONNECTION_STRING = "mongodb://mongodb0.erldc.in:27017,mongodb1.erldc.in:27017/?replicaSet=CONSERV"
        client = MongoClient(CONNECTION_STRING)
        db = client['mis']
        voltage_data_collection = db['voltage_data']
        # voltage_data_collection.create_index(
        #     [("d", ASCENDING), ("n", ASCENDING)],
        #     unique=True
        # )

        df = pd.read_excel(file, sheet_name='data1', header=[2, 3])
        df.index = df['Date']['Unnamed: 1_level_1'].to_list()
        df = df.drop(columns=['Unnamed: 0_level_0', 'Date'], level=0)
        df = df.loc[:, (slice(None), ('Bus-1 Voltage (kV)',
                        'Bus-2 Voltage (kV)'))]
        df.index = pd.date_range(
            for_date, for_date + timedelta(days=1), freq='1T')[:-1]
        if len(df) != 1440:
            raise Exception("Length Mismatch")
        return df

    def getDf220P2(file, for_date):

        CONNECTION_STRING = "mongodb://mongodb0.erldc.in:27017,mongodb1.erldc.in:27017/?replicaSet=CONSERV"
        client = MongoClient(CONNECTION_STRING)
        db = client['mis']
        voltage_data_collection = db['voltage_data']
        # voltage_data_collection.create_index(
        #     [("d", ASCENDING), ("n", ASCENDING)],
        #     unique=True
        # )

        df = pd.read_excel(file, sheet_name='data1', header=[2, 3])
        df.index = df['Date']['Unnamed: 1_level_1'].to_list()
        df = df.drop(columns=['Unnamed: 0_level_0',
                     'Date', '220 kV Keonjhar (PG)'], level=0)
        df = df.loc[:, (slice(None), ('Bus-1 Voltage (kV)',
                        'Bus-2 Voltage (kV)'))]
        df = df.loc[pd.to_datetime(for_date):pd.to_datetime(
            for_date)+timedelta(hours=23, minutes=59)]
        if len(df) != 1440:
            print("VoltageFileInsert Length Mismatch")
        return df

    def getDf400(file, for_date):

        CONNECTION_STRING = "mongodb://mongodb0.erldc.in:27017,mongodb1.erldc.in:27017/?replicaSet=CONSERV"
        client = MongoClient(CONNECTION_STRING)
        db = client['mis']
        voltage_data_collection = db['voltage_data']
        # voltage_data_collection.create_index(
        #     [("d", ASCENDING), ("n", ASCENDING)],
        #     unique=True
        # )

        df = pd.read_excel(file, sheet_name='Data', header=[
                           2, 3]).drop(columns=['Station'], level=0)
        df = df.loc[:, (slice(None), ('Bus-1 Voltage (kV)',
                        'Bus-2 Voltage (kV)'))][1:]
        df.index = pd.date_range(
            for_date, for_date + timedelta(days=1), freq='1T')[:-1]
        if len(df) != 1440:
            print("VoltageFileInsert Length Mismatch")
        return df

    CONNECTION_STRING = "mongodb://mongodb0.erldc.in:27017,mongodb1.erldc.in:27017/?replicaSet=CONSERV"
    client = MongoClient(CONNECTION_STRING)
    db = client['mis']
    voltage_data_collection = db['voltage_data']
    # voltage_data_collection.create_index(
    #     [("d", ASCENDING), ("n", ASCENDING)],
    #     unique=True
    # )

    PATH = "http://10.3.100.24/DAILY_DUMP_FILES_SCADA/"

    startDate = request.args['startDate']
    endDate = request.args['endDate']

    startDateObj = datetime.strptime(startDate, "%Y-%m-%d")
    endDateObj = datetime.strptime(endDate, "%Y-%m-%d")

    res = []
    for for_date in pd.date_range(date(startDateObj.year, startDateObj.month, startDateObj.day), date(endDateObj.year, endDateObj.month, endDateObj.day)):

        try:

            FILE_220_P1 = PATH + \
                "220KV_Voltage_data_P1_{}.xlsm".format(
                    for_date.strftime("%d%m%Y"))
            FILE_220_P2 = PATH + \
                "220KV_Voltage_data_P2_{}.xlsm".format(
                    for_date.strftime("%d%m%Y"))
            FILE_400 = PATH + \
                "400KV_Voltage_Data_{}.xlsm".format(
                    for_date.strftime("%d%m%Y"))
            df = getDf220P1(FILE_220_P1, for_date)
            InsertVoltageDfIntoDB(voltage_data_collection, df, for_date)
            df = getDf220P2(FILE_220_P2, for_date)
            InsertVoltageDfIntoDB(voltage_data_collection, df, for_date)
            df = getDf400(FILE_400, for_date)
            InsertVoltageDfIntoDB(voltage_data_collection, df, for_date)
            res.append(for_date)

        except:

            # print("Voltage File reading Problem")
            continue

    return jsonify({'status': "success", 'dates': res})


@app.route('/VoltageNames', methods=['GET', 'POST'])
def VoltageNames():

    startDate1 = request.args['startDate']
    endDate1 = request.args['endDate']

    startDate1 = startDate1.split(" ")
    endDate1 = endDate1.split(" ")

    startDate = startDate1[0]
    endDate = endDate1[0]

    startTime = startDate1[1]
    endTime = endDate1[1]

    filter = {
        'd': {
            '$gte': pd.to_datetime(startDate),
            '$lte': pd.to_datetime(endDate)
        }
    }

    cursor = voltageDateCollection.find(
        filter=filter, projection={'n': 1}).distinct('n')

    data = list(cursor)
    return jsonify(data)


@app.route('/MultiVoltageNames', methods=['GET', 'POST'])
def MultiVoltageNames():

    MultistartDate = request.args['MultistartDate']
    MultistartDate = MultistartDate.split(',')
    # endDate = request.args['endDate']

    for item in range(len(MultistartDate)):
        filter = {
            'd': {
                '$gte': pd.to_datetime(MultistartDate[item]),
                '$lte': pd.to_datetime(MultistartDate[item])
            }
        }

        cursor = voltageDateCollection.find(
            filter=filter, projection={'n': 1}).distinct('n')

        data = list(cursor)

        if item == 0:
            final_data = data

        else:
            final_data = list(set(final_data) & set(data))

    final_data = list(dict.fromkeys(final_data))
    return jsonify(final_data)


@app.route('/VoltageDates', methods=['GET', 'POST'])
def VoltageDates():

    cursor = voltageDateCollection.find(projection={'d': 1}).distinct('d')

    data = list(cursor)
    op = []
    x = (math.ceil(len(data)/10))
    for i in range(10):
        l = []
        for j in range(x*i, x*(i+1)):
            if j < len(data):
                temp = str(data[j])
                temp = temp.split(" ")
                temp = temp[0]
                temp = temp.split('-')
                temp = temp[2]+'-'+temp[1]+'-'+temp[0]
                l.append(temp)
        op.append(l)
    df = pd.DataFrame(op).T
    return jsonify(df.to_json(orient='table'))


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

    # dts = [dt.strftime("%d-%m-%Y %H:%M:%S") for dt in
    #        datetime_range(startDateObj, endDateObj,
    #                       timedelta(minutes=time1))]

    # allDateTime = dts

    # allDateTime = allDateTime[allDateTime.index(
    #     startTime):allDateTime.index(endTime)+1]

    # for i in range(((endDateObj - startDateObj).days + 1)*24*60) :
    #     allDateTime.append((startDateObj + timedelta(seconds = 60*i)).strftime("%d-%m-%Y %H:%M:%S"))

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
            result = voltageDateCollection.find(
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
                result = voltageDateCollection.find(
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

                    result = voltageDateCollection.find(
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
            "D:/Applications/MIS/mis_be/Excel_Files/Voltage.xlsx", index=None)

        path = "D:/Applications/MIS/mis_be/Excel_Files/Voltage.xlsx"

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
            return send_file('D:/Applications/MIS/mis_be/Excel_Files/Voltage.xlsx', as_attachment=True, download_name=custom)
        else:
            return Response('Some error occured!')

    else:
        return jsonify("No Data to Download")


@app.route('/VoltageUpload', methods=['GET', 'POST'])
def VoltageUpload():
    file = request.files["demo[]"]
    if file:
        df = pd.read_excel(file, index_col=0, header=[0])

        for item in range(len(df)//1440):
            fd = df[(1440*item):((1440*item)+1440)]

            if (len(fd) == 1440):
                for_date = pd.to_datetime(fd.index, dayfirst=True).min()

                UpdateVoltageDfIntoDBtest(voltageDateCollection, fd, for_date)

    return Response("ok")


# //////////////////////////////////////////////////////////////////////////////////////////voltage/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

# //////////////////////////////////////////////////////////////////////////////////////////line/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


def GetLinesCollection():

    CONNECTION_STRING = "mongodb://mongodb0.erldc.in:27017,mongodb1.erldc.in:27017/?replicaSet=CONSERV"
    client = MongoClient(CONNECTION_STRING)
    db = client['mis']
    line_mw_data_collection = db['line_mw_data_p1']
    line_mw_data_collection1 = db['line_mw_data_p2']
    line_mw_data_collection2 = db['line_mw_data_400_above']
    # line_mw_data_collection.create_index(
    # [("d", ASCENDING), ("n", ASCENDING)],
    # unique=True
    # )
    # line_mw_data_collection2.create_index(
    # [("d", ASCENDING), ("n", ASCENDING)],
    # unique=True
    # )
    return line_mw_data_collection, line_mw_data_collection1, line_mw_data_collection2


line_mw_data_collection, line_mw_data_collection1, line_mw_data_collection2 = GetLinesCollection()


@app.route('/LinesFileInsert', methods=['GET', 'POST'])
def LinesFileInsert():

    def insertFlowDfIntoDB(line_mw_data_collection, line_mw_data_collection1, line_mw_data_collection2, df, df1, df2, df3, for_date):

        doc_list = []
        doc_list1 = []
        doc_list2 = []
        doc_list3 = []

        try:

            df = df.astype('double').reset_index(drop=True)
            df.index = df.index.astype('str')
            if (len(df) != 1440):

                raise Exception("Error")
        except:
            pass

        try:
            df1 = df1.astype('double').reset_index(drop=True)
            df1.index = df1.index.astype('str')
            if (len(df1) != 1440):

                raise Exception("Error")
        except:
            pass

        try:
            df2 = df2.astype('double').reset_index(drop=True)

            df2.index = df2.index.astype('str')

            if (len(df2) != 1440):

                raise Exception("Error")
        except:
            pass

        try:
            df3 = df3.astype('double').reset_index(drop=True)
            df3.index = df3.index.astype('str')

            if (len(df3) != 1440):

                raise Exception("Error")
        except:
            pass

        try:

            for col in set(df.columns):
                a = {
                    "p": df[col].round(3).to_list(),
                    "d": pd.to_datetime(for_date),
                    "ym": for_date.strftime("%Y%m"),
                    "n": col}
                doc_list.append(a)
        except:
            pass

        try:

            for col1 in set(df1.columns):
                b = {
                    "p": df1[col1].round(3).to_list(),
                    "d": pd.to_datetime(for_date),
                    "ym": for_date.strftime("%Y%m"),
                    "n": col1}
                doc_list1.append(b)
        except:
            pass

        try:

            for col2 in set(df2.columns):

                c = {
                    "p": df2[col2].round(3).to_list(),
                    "d": pd.to_datetime(for_date),
                    "ym": for_date.strftime("%Y%m"),
                    "n": col2}
                doc_list2.append(c)

        except:
            pass

        try:

            for col3 in set(df3.columns):
                d = {
                    "p": df3[col3].round(3).to_list(),
                    "d": pd.to_datetime(for_date),
                    "ym": for_date.strftime("%Y%m"),
                    "n": col3}

                doc_list3.append(d)

        except:
            pass

        try:
            try:
                res = line_mw_data_collection.insert_many(doc_list)
                # print("Successfully inserted Lines data P1 for ", for_date)
            except:
                # print("Lines Database file insert problem P1")
                pass
            try:
                res1 = line_mw_data_collection1.insert_many(doc_list1)
                # print("Successfully inserted Voltage data P2 for ", for_date)
            except:
                # print("Lines Database file insert problem P2")
                pass

            try:
                res2 = line_mw_data_collection2.insert_many(doc_list2)
                # print("Successfully inserted Voltage data 400 KV for ", for_date)
            except:
                # print("Lines Database file insert problem 400 kV")
                pass
            try:

                res3 = line_mw_data_collection2.insert_many(doc_list3)
                # print("Successfully inserted Voltage data 765 KV for ", for_date)
            except:
                # print("Lines Database file insert problem 765 kV")
                pass

        except errors.DuplicateKeyError:
            print("LinesFileInsert couldn't insert ")

        return 'res'

    startDate = request.args['startDate']
    endDate = request.args['endDate']

    startDateObj = datetime.strptime(startDate, "%Y-%m-%d")
    endDateObj = datetime.strptime(endDate, "%Y-%m-%d")

    op = []
    for for_date1 in pd.date_range(date(startDateObj.year, startDateObj.month, startDateObj.day), date(endDateObj.year, endDateObj.month, endDateObj.day)):

        try:

            df = ""
            df1 = ""
            df2 = ""
            df3 = ""

            try:

                FILE = "http://10.3.100.24/DAILY_DUMP_FILES_SCADA/220_LINES_MW_P1_{}.xlsm".format(
                    for_date1.strftime("%d%m%Y"))
                df = pd.read_excel(FILE, sheet_name='Data', header=[2, 3])
                df = df.drop(columns=['Unnamed: 0_level_0', 'Date'], level=0)
                df = df[17:1440+17]
                df.index = pd.date_range(
                    for_date1, for_date1 + timedelta(days=1), freq='1T')[:-1]
                df.columns = df.columns.map(
                    lambda x: x[0]+": " + x[1] if 'Unnamed' not in x[1] else x[0]+': '+((x[0].split('-'))[0].split(' '))[-1] + ' end')

            except:
                # print("P1 Lines file read problem for ", for_date1)
                pass

            try:
                FILE1 = "http://10.3.100.24/DAILY_DUMP_FILES_SCADA/220_LINES_MW_P2_{}.xlsm".format(
                    for_date1.strftime("%d%m%Y"))
                df1 = pd.read_excel(FILE1, sheet_name='Data', header=[2, 3])
                df1 = df1.drop(columns=['Unnamed: 0_level_0', 'Date'], level=0)
                df1 = df1[17:1440+17]
                df1.index = pd.date_range(
                    for_date1, for_date1 + timedelta(days=1), freq='1T')[:-1]
                df1.columns = df1.columns.map(
                    lambda x1: x1[0]+": " + x1[1] if 'Unnamed' not in x1[1] else x1[0]+': '+((x1[0].split('-'))[0].split(' '))[-1] + ' end')

            except:
                # print("P2 Lines file read problem for ", for_date1)
                pass

            try:

                FILE2 = "http://10.3.100.24/DAILY_DUMP_FILES_SCADA/400_LINES_MW_{}.xlsm".format(
                    for_date1.strftime("%d%m%Y"))

                df2 = pd.read_excel(
                    FILE2, sheet_name='Data', header=[2, 3])[:1440]

                df2 = df2.drop(columns=['Unnamed: 0_level_0', 'Date'], level=0)

                df2.index = pd.date_range(
                    for_date1, for_date1 + timedelta(days=1), freq='1T')[:-1]

                df2.columns = df2.columns.map(
                    lambda x1: x1[0]+": " + x1[1] if 'Unnamed' not in x1[1] else x1[0]+': '+((x1[0].split('-'))[0].split(' '))[-1] + ' end')

            except:
                # print("400 KV Lines file xlsm read problem for ", for_date1)
                pass

            try:
                FILE2 = "http://10.3.100.24/DAILY_DUMP_FILES_SCADA/400_LINES_MW_{}.xlsx".format(
                    for_date1.strftime("%d%m%Y"))

                df2 = pd.read_excel(
                    FILE2, sheet_name='Data', header=[2, 3])

                df2 = df2.drop(columns=['Unnamed: 0_level_0', 'Date'], level=0)

                df2.index = pd.date_range(
                    for_date1, for_date1 + timedelta(days=1), freq='1T')[:-1]

                df2.columns = df2.columns.map(
                    lambda x1: x1[0]+": " + x1[1] if 'Unnamed' not in x1[1] else x1[0]+': '+((x1[0].split('-'))[0].split(' '))[-1] + ' end')
            except:
                # print("400 KV Lines file xlsx read problem for ", for_date1)
                pass

            try:
                FILE3 = "http://10.3.100.24/DAILY_DUMP_FILES_SCADA/765_LINES_MW_{}.xlsm".format(
                    for_date1.strftime("%d%m%Y"))

                df3 = pd.read_excel(
                    FILE3, sheet_name='Data', header=[2, 3])[:1440]

                df3 = df3.drop(columns=['Unnamed: 0_level_0', 'Date'], level=0)

                df3.index = pd.date_range(
                    for_date1, for_date1 + timedelta(days=1), freq='1T')[:-1]
                df3.columns = df3.columns.map(
                    lambda x1: x1[0]+": " + x1[1] if 'Unnamed' not in x1[1] else x1[0]+': '+((x1[0].split('-'))[0].split(' '))[-1] + ' end')

            except:
                # print("765 KV Lines file xlsm read problem for ", for_date1)
                pass

            try:
                FILE3 = "http://10.3.100.24/DAILY_DUMP_FILES_SCADA/765_LINES_MW_{}.xlsx".format(
                    for_date1.strftime("%d%m%Y"))
                df3 = pd.read_excel(
                    FILE3, sheet_name='Data', header=[2, 3])[:1440]

                df3 = df3.drop(columns=['Unnamed: 0_level_0', 'Date'], level=0)

                df3.index = pd.date_range(
                    for_date1, for_date1 + timedelta(days=1), freq='1T')[:-1]
                df3.columns = df3.columns.map(
                    lambda x1: x1[0]+": " + x1[1] if 'Unnamed' not in x1[1] else x1[0]+': '+((x1[0].split('-'))[0].split(' '))[-1] + ' end')

            except:
                # print("765 KV Lines file xlsx read problem for ", for_date1)
                pass

            insertFlowDfIntoDB(line_mw_data_collection, line_mw_data_collection1,
                               line_mw_data_collection2, df, df1, df2, df3, for_date1)

            op.append(for_date1)

        except:
            print('Lines File Insert problem all', for_date1)

    return jsonify(op)


@app.route('/LinesNames', methods=['GET', 'POST'])
def LinesNames():

    startDate1 = request.args['startDate']
    endDate1 = request.args['endDate']

    startDate1 = startDate1.split(" ")
    endDate1 = endDate1.split(" ")

    startDate = startDate1[0]
    endDate = endDate1[0]

    startTime = startDate1[1]
    endTime = endDate1[1]

    filter = {
        'd': {
            '$gte': pd.to_datetime(startDate),
            '$lte': pd.to_datetime(endDate)
        }
    }

    cursor = line_mw_data_collection.find(
        filter=filter, projection={'n': 1}).distinct('n')
    cursor1 = line_mw_data_collection1.find(
        filter=filter, projection={'n': 1}).distinct('n')
    cursor2 = line_mw_data_collection2.find(
        filter=filter, projection={'n': 1}).distinct('n')

    data = list(cursor)
    data1 = list(cursor1)
    data2 = list(cursor2)
    data = data+data1+data2

    for item in range(len(data)):
        data[item] = data[item]+" MW"

    return jsonify(data)


@app.route('/MultiLinesNames', methods=['GET', 'POST'])
def MultiLinesNames():

    MultistartDate = request.args['MultistartDate']
    MultistartDate = MultistartDate.split(',')
    # endDate = request.args['endDate']

    for item in range(len(MultistartDate)):
        filter = {
            'd': {
                '$gte': pd.to_datetime(MultistartDate[item]),
                '$lte': pd.to_datetime(MultistartDate[item])
            }
        }

        cursor = line_mw_data_collection.find(
            filter=filter, projection={'n': 1}).distinct('n')
        cursor1 = line_mw_data_collection1.find(
            filter=filter, projection={'n': 1}).distinct('n')
        cursor2 = line_mw_data_collection2.find(
            filter=filter, projection={'n': 1}).distinct('n')

        data = list(cursor)
        data1 = list(cursor1)
        data2 = list(cursor2)

        if item == 0:
            final_data = data
            final_data1 = data1
            final_data2 = data2

        else:
            final_data = list(set(final_data) & set(data))
            final_data1 = list(set(final_data1) & set(data1))
            final_data2 = list(set(final_data2) & set(data2))

    final_data = final_data+final_data1+final_data2
    final_data = list(dict.fromkeys(final_data))

    for item in range(len(final_data)):
        final_data[item] = final_data[item]+" MW"

    return jsonify(final_data)


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
            "D:/Applications/MIS/mis_be/Excel_Files/Lines.xlsx", index=None)

        path = "D:/Applications/MIS/mis_be/Excel_Files/Lines.xlsx"

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
        return send_file('D:/Applications/MIS/mis_be/Excel_Files/Lines.xlsx', as_attachment=True, download_name=custom)

    else:
        return jsonify("No Data to Download")


def InsertLinesDfIntoDBtest(line_mw_data_collection, line_mw_data_collection1, df, for_date):

    df = df.astype('double').reset_index(drop=True)
    df.index = df.index.astype('str')

    if (len(df) != 1440):

        raise Exception("Error")

    for col in set(df.columns):
        temp = col

        db = temp[-2]+temp[-1]
        temp = temp[:-3]

        if db == 'p1':

            a = {
                "p": df[col].round(3).to_list(),
                "d": pd.to_datetime(for_date),
                "ym": for_date.strftime("%Y%m"),
                "n": temp}

            res = line_mw_data_collection.update_one(
                {"d": for_date, "ym": for_date.strftime("%Y%m"), "n": a['n']},
                {"$set": {"p": a["p"]}}, upsert=True)

        if db == 'p2':

            b = {
                "p": df[col].round(3).to_list(),
                "d": pd.to_datetime(for_date),
                "ym": for_date.strftime("%Y%m"),
                "n": temp}

            res = line_mw_data_collection1.update_one(
                {"d": for_date, "ym": for_date.strftime("%Y%m"), "n": b['n']},
                {"$set": {"p": b["p"]}}, upsert=True)

    return res


@app.route('/lines_upload', methods=['GET', 'POST'])
def lines_upload():
    file = request.files["demo[]"]

    if file:
        df = pd.read_excel(file, index_col=0, header=[0])

        for item in range(len(df)//1440):
            fd = df[(1440*item):((1440*item)+1440)]

            if (len(fd) == 1440):
                for_date = pd.to_datetime(fd.index, dayfirst=True).min()

                InsertLinesDfIntoDBtest(
                    line_mw_data_collection, line_mw_data_collection1, fd, for_date)

    return ('hi')


# //////////////////////////////////////////////////////////////////////////////////////////line/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


# //////////////////////////////////////////////////////////////////////////////////////////lines-mvar/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


def GetMVARCollection():

    CONNECTION_STRING = "mongodb://mongodb0.erldc.in:27017,mongodb1.erldc.in:27017/?replicaSet=CONSERV"
    client = MongoClient(CONNECTION_STRING)
    db = client['mis']
    MVAR_P1 = db['MVAR_p1']
    MVAR_P2 = db['MVAR_p2']
    Lines_MVAR_400_above = db['Lines_MVAR_400_above']
    # Lines_MVAR_400_above.create_index(
    # [("d", ASCENDING), ("n", ASCENDING)],
    # unique=True
    # )
    # MVAR_P2.create_index(
    # [("d", ASCENDING), ("n", ASCENDING)],
    # unique=True
    # )
    return MVAR_P1, MVAR_P2, Lines_MVAR_400_above


MVAR_P1, MVAR_P2, Lines_MVAR_400_above = GetMVARCollection()


@app.route('/MVARFileInsert', methods=['GET', 'POST'])
def MVARFileInsert():

    def insertFlowDfIntoDB(MVAR_P1, MVAR_P2, Lines_MVAR_400_above, df, df1, df2, df3, for_date):

        doc_list = []
        doc_list1 = []
        doc_list2 = []
        doc_list3 = []

        df = df.astype('double').reset_index(drop=True)
        df.index = df.index.astype('str')
        if (len(df) != 1440):

            raise Exception("Error")

        df1 = df1.astype('double').reset_index(drop=True)
        df1.index = df1.index.astype('str')
        if (len(df1) != 1440):

            raise Exception("Error")

        df2 = df2.astype('double').reset_index(drop=True)
        df2.index = df2.index.astype('str')
        if (len(df2) != 1440):

            raise Exception("Error")

        df3 = df3.astype('double').reset_index(drop=True)
        df3.index = df3.index.astype('str')
        if (len(df3) != 1440):

            raise Exception("Error")

        df = df.loc[:, ~df.columns.duplicated()].copy()
        for col in set(df.columns):
            a = {
                "p": df[col].round(3).to_list(),
                "d": pd.to_datetime(for_date),
                "ym": for_date.strftime("%Y%m"),
                "n": col}
            doc_list.append(a)

        df1 = df1.loc[:, ~df1.columns.duplicated()].copy()
        for col1 in set(df1.columns):

            b = {
                "p": df1[col1].round(3).to_list(),
                "d": pd.to_datetime(for_date),
                "ym": for_date.strftime("%Y%m"),
                "n": col1}
            doc_list1.append(b)
        try:
            df2 = df2.loc[:, ~df2.columns.duplicated()].copy()
            for col2 in set(df2.columns):

                c = {
                    "p": df2[col2].round(3).to_list(),
                    "d": pd.to_datetime(for_date),
                    "ym": for_date.strftime("%Y%m"),
                    "n": col2}
                doc_list2.append(c)

        except:
            pass

        try:
            df3 = df3.loc[:, ~df3.columns.duplicated()].copy()
            for col3 in set(df3.columns):

                d = {
                    "p": df3[col3].round(3).to_list(),
                    "d": pd.to_datetime(for_date),
                    "ym": for_date.strftime("%Y%m"),
                    "n": col3}
                doc_list3.append(d)
        except:
            pass

        try:
            try:
                res = MVAR_P1.insert_many(doc_list)
                # print("Successfully inserted P1 Lines Files", for_date)
            except:
                # print("P1 Lines MVAR File Database problem")
                pass
            try:
                res1 = MVAR_P2.insert_many(doc_list1)
                # print("Successfully inserted P2 Lines Files", for_date)
            except:
                # print("P2 Lines MVAR File Database problem")
                pass
            try:
                res2 = Lines_MVAR_400_above.insert_many(doc_list2)
                # print("Successfully inserted 400 KV Lines Files", for_date)
            except:
                # print("400 KV Lines MVAR File Database problem")
                pass
            try:
                res3 = Lines_MVAR_400_above.insert_many(doc_list3)
                # print("Successfully inserted 765 KV Lines Files", for_date)
            except:
                # print("765 KV Lines MVAR File Database problem")
                pass

        except:
            print("Lines MVAR File Database problem")

        return 'res'

    startDate = request.args['startDate']
    endDate = request.args['endDate']

    startDateObj = datetime.strptime(startDate, "%Y-%m-%d")
    endDateObj = datetime.strptime(endDate, "%Y-%m-%d")

    op = []
    for for_date1 in pd.date_range(date(startDateObj.year, startDateObj.month, startDateObj.day), date(endDateObj.year, endDateObj.month, endDateObj.day)):

        try:

            FILE = "http://10.3.100.24/DAILY_DUMP_FILES_SCADA/220KV_Lines_MVAR_P1_{}.xlsm".format(
                for_date1.strftime("%d%m%Y"))
            df = pd.read_excel(FILE, sheet_name='Data', header=[2, 3])
            
            df = df.drop(columns=['Unnamed: 0_level_0', 'Date'], level=0)

            df.index = pd.date_range(
                for_date1, for_date1 + timedelta(days=1), freq='1T')[:-1]
            df.columns = df.columns.map(
                lambda x: x[0]+": " + x[1] if 'Unnamed' not in x[1] else x[0]+': '+((x[0].split('-'))[0].split(' '))[-1] + ' end')
            
            

            FILE1 = "http://10.3.100.24/DAILY_DUMP_FILES_SCADA/220_LINES_MVAR_P2_{}.xlsm".format(
                for_date1.strftime("%d%m%Y"))
            df1 = pd.read_excel(FILE1, sheet_name='Data', header=[2, 3])
            df1 = df1.drop(columns=['Unnamed: 0_level_0', 'Date'], level=0)

            df1.index = pd.date_range(
                for_date1, for_date1 + timedelta(days=1), freq='1T')[:-1]
            df1.columns = df1.columns.map(
                lambda x1: x1[0]+": " + x1[1] if 'Unnamed' not in x1[1] else x1[0]+': '+((x1[0].split('-'))[0].split(' '))[-1] + ' end')
            
            

            FILE2 = "http://10.3.100.24/DAILY_DUMP_FILES_SCADA/400_LINES_MVAR_{}.xlsx".format(
                for_date1.strftime("%d%m%Y"))

            df2 = pd.read_excel(FILE2, sheet_name='Data', header=[2, 3])[:1440]

            df2 = df2.drop(columns=['Unnamed: 0_level_0', 'Date'], level=0)

            df2.index = pd.date_range(
                for_date1, for_date1 + timedelta(days=1), freq='1T')[:-1]

            df2.columns = df2.columns.map(
                lambda x: x[0]+": " + x[1] if 'Unnamed' not in x[1] else x[0]+': '+((x[0].split('-'))[0].split(' '))[-1] + ' end')
            
            

            FILE3 = "http://10.3.100.24/DAILY_DUMP_FILES_SCADA/765_LINES_MVAR_{}.xlsm".format(
                for_date1.strftime("%d%m%Y"))
            df3 = pd.read_excel(FILE3, sheet_name='Data', header=[2, 3])

            df3 = df3.drop(columns=['Unnamed: 0_level_0', 'Date'], level=0)

            df3.index = pd.date_range(
                for_date1, for_date1 + timedelta(days=1), freq='1T')[:-1]
            df3.columns = df3.columns.map(
                lambda x1: x1[0]+": " + x1[1] if 'Unnamed' not in x1[1] else x1[0]+': '+((x1[0].split('-'))[0].split(' '))[-1] + ' end')
        

            insertFlowDfIntoDB(
                MVAR_P1, MVAR_P2, Lines_MVAR_400_above, df, df1, df2, df3, for_date1)

            op.append(for_date1)

        except:
            print('Lines MVAR File read problem for ', for_date1)
    return jsonify(op)


# //////////////////////////////////////////////////////////////////////////////////////////mvar/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

# //////////////////////////////////////////////////////////////////////////////////////////ict/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


def GetICTCollection():

    CONNECTION_STRING = "mongodb://mongodb0.erldc.in:27017,mongodb1.erldc.in:27017/?replicaSet=CONSERV"

    client = MongoClient(CONNECTION_STRING)

    db = client['mis']
    ICT_data1 = db['ICT_data']
    ICT_data2 = db['ICT_data_MW']

    # ICT_data2.create_index(
    # [("d", ASCENDING), ("n", ASCENDING)],
    # unique=True
    # )

    return ICT_data1, ICT_data2


ICT_data1, ICT_data2 = GetICTCollection()


@app.route('/ICTFileInsert', methods=['GET', 'POST'])
def ICTFileInsert():

    def insertFlowDfIntoDB(ICT_data, df, for_date):

        data_list1 = []

        for item in df:

            item = item.astype('double').reset_index(drop=True)
            item.index = item.index.astype('str')

            name = item.name
            data = (item.to_list())[:-1]
            if (len(data) != 1440):

                raise Exception("Error")

            a = {
                "p": data,
                "d": pd.to_datetime(for_date),
                "ym": for_date.strftime("%Y%m"),
                "n": name}

            data_list1.append(a)

        try:
            res = ICT_data.insert_many(data_list1)
            # print("Successfully inserted ICT Files (MVAR)", for_date)

        except:
            print("ICT File (MVAR) Insert problem in Database ", for_date)

        return 'res'

    startDate = request.args['startDate']
    endDate = request.args['endDate']

    ICTFileInsertMW(startDate, endDate)
    ICTFileInsertMW_132_220(startDate, endDate)

    startDateObj = datetime.strptime(startDate, "%Y-%m-%d")
    endDateObj = datetime.strptime(endDate, "%Y-%m-%d")

    op = []
    for for_date1 in pd.date_range(date(startDateObj.year, startDateObj.month, startDateObj.day), date(endDateObj.year, endDateObj.month, endDateObj.day)):

        try:

            FILE = "http://10.3.100.24/DAILY_DUMP_FILES_SCADA/765_400_400_220_ICT_MVAR_{}.xlsx".format(
                for_date1.strftime("%d%m%Y"))
            df = pd.read_excel(FILE, sheet_name='Sheet1', header=[2, 3])[:1441]

            df = df.drop(columns=['Unnamed: 0_level_0', 'Date'], level=0)

            df.index = pd.date_range(
                for_date1, for_date1 + timedelta(days=1), freq='1T')

            columns_list = []

            data_list = []

            for col in df.columns:

                sub_df = df[col]
                if (sub_df.name[0] not in columns_list):
                    columns_list.append(sub_df.name[0])
                    new_col_name = sub_df.name[0] + " : " + \
                        sub_df.name[0][:3] + " KV Side MVAR"
                else:
                    new_col_name = sub_df.name[0] + " : " + \
                        sub_df.name[0][4:7] + " KV Side MVAR"

                sub_df.name = new_col_name

                data_list.append(sub_df)

            insertFlowDfIntoDB(ICT_data1, data_list, for_date1)

            op.append(for_date1)

        except:
            print('ICT File read problem for ', for_date1)
    return jsonify(op)

def ICTFileInsertMW_132_220(startDate, endDate):

    startDateObj = datetime.strptime(startDate, "%Y-%m-%d")
    endDateObj = datetime.strptime(endDate, "%Y-%m-%d")

    for for_date1 in pd.date_range(date(startDateObj.year, startDateObj.month, startDateObj.day), date(endDateObj.year, endDateObj.month, endDateObj.day)):

        FILE = "http://10.3.100.24/DAILY_DUMP_FILES_SCADA/220_132_ICT_MW_{}.xlsx".format(
            for_date1.strftime("%d%m%Y"))

        df = pd.read_excel(FILE, sheet_name='Sheet1', header=[2,3])[:1444]
        df = df.drop(columns=['Unnamed: 0_level_0'], level=0)
        df = df.drop(columns=['Date'], level=0)
        col_list= list(df.columns)

        for i in range(len(col_list)):
            if i%2==0:
                col_list[i]= col_list[i][0]+": 220 KV Side MW"
            else:
                col_list[i]= col_list[i][0]+": 132 KV Side MW"

        df.columns = col_list

        for item in col_list:
            a = {
                "p": list(df[item]),
                "d": pd.to_datetime(for_date1),
                "ym": for_date1.strftime("%Y%m"),
                "n": item}

            try:
                res = ICT_data2.insert_one(a)
            except:
                pass

def ICTFileInsertMW(startDate, endDate):

    def insertFlowDfIntoDB(ICT_data, df, for_date):

        data_list1 = []

        for item in df:

            try:
                name = item.name
                data = (item.to_list())

                if data[0] != data[0] and data[-1] != data[-1]:
                    data = [0]*1440

                if (len(data) != 1440):
                    # print("Error", len(data))
                    raise Exception("Error")

                a = {
                    "p": data,
                    "d": pd.to_datetime(for_date),
                    "ym": for_date.strftime("%Y%m"),
                    "n": name}

                try:

                    res = ICT_data.insert_one(a)

                except errors.DuplicateKeyError as e:
                    # print('ICT File Insert for MW problem in DB', for_date)
                    continue

                except:

                    continue

            except:
                continue

        return 'res'

    startDateObj = datetime.strptime(startDate, "%Y-%m-%d")
    endDateObj = datetime.strptime(endDate, "%Y-%m-%d")

    op = []
    for for_date1 in pd.date_range(date(startDateObj.year, startDateObj.month, startDateObj.day), date(endDateObj.year, endDateObj.month, endDateObj.day)):

        try:

            FILE = "http://10.3.100.24/DAILY_DUMP_FILES_SCADA/765_400_400_220_ICT_MW_{}.xlsx".format(
                for_date1.strftime("%d%m%Y"))

            df = pd.read_excel(FILE, sheet_name='Sheet1', header=[3, 4])[:1441]

            df = df.drop(columns=['Unnamed: 0_level_0'], level=0)

            # print(df)

            # df.index = pd.date_range(
            #     for_date1, for_date1 + timedelta(days=1), freq='1T')

            columns_list = []
            data_list = []

            for col in df.columns:

                sub_df = df[col][:-1]

                if (sub_df.name[0] not in columns_list):
                    columns_list.append(sub_df.name[0])
                    new_col_name = sub_df.name[0] + " : " + \
                        sub_df.name[0][:3] + " KV Side MW"
                else:
                    new_col_name = sub_df.name[0] + " : " + \
                        sub_df.name[0][4:7] + " KV Side MW"

                sub_df.name = new_col_name
                data_list.append(sub_df)

            insertFlowDfIntoDB(ICT_data2, data_list, for_date1)

            op.append(for_date1)

        except:
            print('ICT File Insert for MW not found', for_date1)
    return jsonify(op)


@app.route('/ICTNames', methods=['GET', 'POST'])
def ICTNames():

    startDate1 = request.args['startDate']
    endDate1 = request.args['endDate']

    startDate1 = startDate1.split(" ")
    endDate1 = endDate1.split(" ")

    startDate = startDate1[0]
    endDate = endDate1[0]

    startTime = startDate1[1]
    endTime = endDate1[1]

    filter = {
        'd': {
            '$gte': pd.to_datetime(startDate),
            '$lte': pd.to_datetime(endDate)
        }
    }

    cursor1 = ICT_data1.find(filter=filter, projection={'n': 1}).distinct('n')
    cursor2 = ICT_data2.find(filter=filter, projection={'n': 1}).distinct('n')

    data1 = list(cursor1)
    data2 = list(cursor2)
    data1 = data2+data1

    return jsonify(data1)


@app.route('/MultiICTNames', methods=['GET', 'POST'])
def MultiICTNames():

    MultistartDate = request.args['MultistartDate']
    MultistartDate = MultistartDate.split(',')
    Type = request.args['Type']

    if Type == "Date":

        for item in range(len(MultistartDate)):
            filter = {
                'd': {
                    '$gte': pd.to_datetime(MultistartDate[item]),
                    '$lte': pd.to_datetime(MultistartDate[item])
                }
            }

            cursor1 = ICT_data1.find(filter=filter, projection={
                                     'n': 1}).distinct('n')
            cursor2 = ICT_data2.find(filter=filter, projection={
                                     'n': 1}).distinct('n')

            data1 = list(cursor1)
            data2 = list(cursor2)
            data1 = data1+data2

            if item == 0:
                final_data = data1

            else:
                final_data = list(set(final_data) & set(data1))

        final_data = list(dict.fromkeys(final_data))

    if Type == "Month":

        for item in range(len(MultistartDate)):

            startDateObj = datetime.strptime(MultistartDate[item], "%Y-%m-%d")
            endDateObj = pd.Timestamp(MultistartDate[item]) + MonthEnd(1)

            filter = {
                'd': {
                    '$gte': datetime(startDateObj.year, startDateObj.month, startDateObj.day, 0, 0, 0, tzinfo=timezone.utc),
                    '$lte': datetime(endDateObj.year, endDateObj.month, endDateObj.day, 0, 0, 0, tzinfo=timezone.utc)
                }
            }

            cursor1 = ICT_data1.find(filter=filter, projection={
                                     'n': 1}).distinct('n')
            cursor2 = ICT_data2.find(filter=filter, projection={
                                     'n': 1}).distinct('n')

            data1 = list(cursor1)
            data2 = list(cursor2)
            data1 = data2+data1

            if item == 0:
                final_data = data1

            else:
                final_data = list(set(final_data) & set(data1))

        final_data = list(dict.fromkeys(final_data))

    return jsonify(final_data)


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
        merged.to_excel("D:/Applications/MIS/mis_be/Excel_Files/ICT.xlsx", index=None)

        path = "D:/Applications/MIS/mis_be/Excel_Files/ICT.xlsx"

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

        return send_file('D:/Applications/MIS/mis_be/Excel_Files/ICT.xlsx', as_attachment=True, download_name=custom)

    else:
        return jsonify("No Data to Download")


def InsertICTDfIntoDBtest(line_mw_data_collection, line_mw_data_collection1, df, for_date):

    df = df.astype('double').reset_index(drop=True)
    df.index = df.index.astype('str')

    if (len(df) != 1440):

        raise Exception("Error")

    for col in set(df.columns):
        temp = col

        db = temp[-2]+temp[-1]
        temp = temp[:-3]

        if db == 'p1':

            a = {
                "p": df[col].round(3).to_list(),
                "d": pd.to_datetime(for_date),
                "ym": for_date.strftime("%Y%m"),
                "n": temp}

            res = line_mw_data_collection.update_one(
                {"d": for_date, "ym": for_date.strftime("%Y%m"), "n": a['n']},
                {"$set": {"p": a["p"]}}, upsert=True)

        if db == 'p2':

            b = {
                "p": df[col].round(3).to_list(),
                "d": pd.to_datetime(for_date),
                "ym": for_date.strftime("%Y%m"),
                "n": temp}

            res = line_mw_data_collection1.update_one(
                {"d": for_date, "ym": for_date.strftime("%Y%m"), "n": b['n']},
                {"$set": {"p": b["p"]}}, upsert=True)

    return res


@app.route('/ICTUpload', methods=['GET', 'POST'])
def ICTUpload():
    file = request.files["demo[]"]

    if file:
        df = pd.read_excel(file, index_col=0, header=[0])
        # print()
        for item in range(len(df)//1440):
            fd = df[(1440*item):((1440*item)+1440)]

            if (len(fd) == 1440):
                for_date = pd.to_datetime(fd.index, dayfirst=True).min()
                # print(for_date)
                InsertICTDfIntoDBtest(ICT_data1, fd, for_date)

    return ('hi')


# //////////////////////////////////////////////////////////////////////////////////////////ict/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


# //////////////////////////////////////////////////////////////////////////////////////////frequency/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


def GetFrequencyCollection():

    CONNECTION_STRING = "mongodb://mongodb0.erldc.in:27017,mongodb1.erldc.in:27017/?replicaSet=CONSERV"
    client = MongoClient(CONNECTION_STRING)
    db = client['mis']
    frequency_data_collection = db['frequency_data']

    # frequency_data_collection.create_index(
    # [("d", ASCENDING), ("n", ASCENDING)],
    # unique=True
    # )

    return frequency_data_collection


frequency_data_collection = GetFrequencyCollection()


@app.route('/FrequencyFileInsert', methods=['GET', 'POST'])
def FrequencyFileInsert():

    def insertFlowDfIntoDB(frequency_data_collection, df, for_date):

        doc_list = []

        df = df.astype('double').reset_index(drop=True)
        df.index = df.index.astype('str')
        if (len(df) != 1440):

            raise Exception("Error")

        try:

            for col in set(df.columns):
                a = {
                    "p": df[col].round(3).to_list(),
                    "d": pd.to_datetime(for_date),
                    "ym": for_date.strftime("%Y%m"),
                    "n": col}
                doc_list.append(a)
        except:
            pass

        try:

            res = frequency_data_collection.insert_many(doc_list)
            # print("Successfully inserted Frequency Files", for_date)

        except errors.DuplicateKeyError:
            print("Frequency File Insert problem in Database ")

        return 'res'

    startDate = request.args['startDate']
    endDate = request.args['endDate']

    startDateObj = datetime.strptime(startDate, "%Y-%m-%d")
    endDateObj = datetime.strptime(endDate, "%Y-%m-%d")

    op = []
    for for_date1 in pd.date_range(date(startDateObj.year, startDateObj.month, startDateObj.day), date(endDateObj.year, endDateObj.month, endDateObj.day)):

        try:
            FILE = "http://10.3.100.24/DAILY_DUMP_FILES_SCADA/BUS_FREQUENCY_220KV_and_ABOVE_{}.xlsx".format(
                for_date1.strftime("%d%m%Y"))

            df = pd.read_excel(FILE, sheet_name='Sheet1')
            df = df.drop(0)
            df = df.drop(columns=['Date'], axis=1)
            df.index = pd.date_range(
                for_date1, for_date1 + timedelta(days=1), freq='1T')[:-1]

            insertFlowDfIntoDB(frequency_data_collection, df, for_date1)

            op.append(for_date1)

        except:
            print('Frequency File read problem', for_date1)

    return jsonify(op)


@app.route('/FrequencyNames', methods=['GET', 'POST'])
def FrequencyNames():

    startDate1 = request.args['startDate']
    endDate1 = request.args['endDate']

    startDate1 = startDate1.split(" ")
    endDate1 = endDate1.split(" ")

    startDate = startDate1[0]
    endDate = endDate1[0]

    startTime = startDate1[1]
    endTime = endDate1[1]

    filter = {
        'd': {
            '$gte': pd.to_datetime(startDate),
            '$lte': pd.to_datetime(endDate)
        }
    }

    cursor = frequency_data_collection.find(
        filter=filter, projection={'n': 1}).distinct('n')

    data = list(cursor)

    return jsonify(data)


@app.route('/MultiFrequencyNames', methods=['GET', 'POST'])
def MultiFrequencyNames():

    MultistartDate = request.args['MultistartDate']
    MultistartDate = MultistartDate.split(',')
    # endDate = request.args['endDate']

    for item in range(len(MultistartDate)):
        filter = {
            'd': {
                '$gte': pd.to_datetime(MultistartDate[item]),
                '$lte': pd.to_datetime(MultistartDate[item])
            }
        }

        cursor = frequency_data_collection.find(
            filter=filter, projection={'n': 1}).distinct('n')

        data = list(cursor)

        if item == 0:
            final_data = data

        else:
            final_data = list(set(final_data) & set(data))

    final_data = list(dict.fromkeys(final_data))

    return jsonify(final_data)


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
            "D:/Applications/MIS/mis_be/Excel_Files/Frequency.xlsx", index=None)

        path = "D:/Applications/MIS/mis_be/Excel_Files/Frequency.xlsx"

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
        return send_file('D:/Applications/MIS/mis_be/Excel_Files/Frequency.xlsx', as_attachment=True, download_name=custom)

    else:
        return jsonify("No Data to Download")


def InsertFrequencyDfIntoDBtest(frequency_mw_data_collection, frequency_mw_data_collection1, df, for_date):

    df = df.astype('double').reset_index(drop=True)
    df.index = df.index.astype('str')

    if (len(df) != 1440):

        raise Exception("Error")

    for col in set(df.columns):
        temp = col

        db = temp[-2]+temp[-1]
        temp = temp[:-3]

        if db == 'p1':

            a = {
                "p": df[col].round(3).to_list(),
                "d": pd.to_datetime(for_date),
                "ym": for_date.strftime("%Y%m"),
                "n": temp}

            res = frequency_mw_data_collection.update_one(
                {"d": for_date, "ym": for_date.strftime("%Y%m"), "n": a['n']},
                {"$set": {"p": a["p"]}}, upsert=True)

        if db == 'p2':

            b = {
                "p": df[col].round(3).to_list(),
                "d": pd.to_datetime(for_date),
                "ym": for_date.strftime("%Y%m"),
                "n": temp}

            res = frequency_mw_data_collection1.update_one(
                {"d": for_date, "ym": for_date.strftime("%Y%m"), "n": b['n']},
                {"$set": {"p": b["p"]}}, upsert=True)

    return res


@app.route('/Frequency_upload', methods=['GET', 'POST'])
def Frequency_upload():
    file = request.files["demo[]"]

    if file:
        df = pd.read_excel(file, index_col=0, header=[0])

        for item in range(len(df)//1440):
            fd = df[(1440*item):((1440*item)+1440)]

            if (len(fd) == 1440):
                for_date = pd.to_datetime(fd.index, dayfirst=True).min()

                InsertFrequencyDfIntoDBtest(
                    frequency_data_collection, fd, for_date)

    return ('hi')


# //////////////////////////////////////////////////////////////////////////////////////////frequency/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


# #  //////////////////////////////////////////////////////////////////////////////////// DLR ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

# @app.route('/GetDLRData', methods=['GET', 'POST'])
# def GetDLRData():

#     startDate = request.args['startDate']
#     endDate = request.args['endDate']

#     startDateObj = datetime.strptime(startDate, "%Y-%m-%d")
#     endDateObj = datetime.strptime(endDate, "%Y-%m-%d")

#     db = getDatabase()
#     # from_date = datetime(2022, 1, 1, 0, 0, 0)
#     # to_date = datetime(2022, 1, 7, 0, 0, 0)
#     from_date = datetime(
#         startDateObj.year, startDateObj.month, startDateObj.day, 0, 0, 0)
#     to_date = datetime(endDateObj.year, endDateObj.month,
#                        endDateObj.day, 0, 0, 0)

#     df = getWeatherParamData(db.actual_weather, db.forecast_weather,
#                              "kolkata", from_date - timedelta(days=1), to_date)
#     df = df[["temp", "sw_irradiation", "wind_speed", "wind_direction"]]
#     df.index = df.index.map(lambda x: x+timedelta(hours=5.5))
#     df = df[from_date: to_date]
#     df.sw_irradiation[df.sw_irradiation < 0] = 0
#     df.temp[df.temp < 280] = pd.NA
#     df.temp = df.temp.ffill()

#     df.wind_speed[df.wind_speed < -100] = pd.NA
#     df.wind_speed = df.wind_speed.ffill()

#     df.wind_direction[df.wind_direction < -900] = pd.NA
#     df.wind_direction = df.wind_direction.ffill()

#     tr_list_ieee = []
#     tr_list_cigre = []
#     for i, row in df.iterrows():
#         ambient_temperature = row.temp - 273.15
#         wind_speed = 0
#         angle_of_attack = 0  # line angle reqd, # weather, 0, 90
#         # conductor = conductor.drake_constants_ieee738
#         solar_irradiation = row.sw_irradiation
#         conductor_temperature = 75.0
#         horizontal_angle = 0
#         elevation = 0.0

#         cigre_tr = thermal_rating(
#             ambient_temperature,
#             wind_speed,
#             angle_of_attack,
#             solar_irradiation,
#             conductor.drake_constants,
#             conductor_temperature,
#             horizontal_angle,
#             elevation,
#             standard="cigre",
#         )
#         tr_list_cigre.append(cigre_tr)

#         ieee_tr = thermal_rating(ambient_temperature=ambient_temperature,
#                                  wind_speed=wind_speed,
#                                  angle_of_attack=angle_of_attack,
#                                  conductor=conductor.drake_constants_ieee738,
#                                  solar_irradiation=solar_irradiation,
#                                  conductor_temperature=conductor_temperature,
#                                  horizontal_angle=horizontal_angle,
#                                  elevation=elevation,
#                                  standard="ieee")
#         tr_list_ieee.append(ieee_tr)

#     params = {
#         "ambient_temperature": "from_weather",
#         "wind_speed": wind_speed,
#         "angle_of_attack": angle_of_attack,
#         "conductor": "conductor.drake_constants_ieee738",
#         "solar_irradiation": "from_weather",
#         "conductor_temperature": conductor_temperature,
#         "horizontal_angle": (horizontal_angle,),
#         "elevation": elevation,
#     }

#     df["ieee_tr"] = tr_list_ieee
#     df["cigre_tr"] = tr_list_cigre
#     # with pd.ExcelWriter("output/tr_{}_{}.xlsx".format(from_date.strftime("%d%m%Y"), to_date.strftime("%d%m%Y"))) as writer:
#     #     df.to_excel(writer, sheet_name='data')
#     #     pd.DataFrame(params).T.to_excel(writer, sheet_name='params')

#     dataToSend = {
#         "allDates": list(df.index),
#         "temp": list(df['temp']),
#         "Solar Radiation": list(df['sw_irradiation']),
#         "wind_speed": list(df['wind_speed']),
#         "wind_direction": list(df['wind_direction']),
#         "ieee_tr": list(df['ieee_tr']),
#         "cigre_tr": list(df['cigre_tr'])
#     }

#     return jsonify(dataToSend)


#  //////////////////////////////////////////////////////////////////////////////////// DLR ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


@app.route('/LinesMWMVARNames', methods=['GET', 'POST'])
def LinesMWMVARNames():

    startDate1 = request.args['startDate']
    endDate1 = request.args['endDate']

    startDate1 = startDate1.split(" ")
    endDate1 = endDate1.split(" ")

    startDate = startDate1[0]
    endDate = endDate1[0]

    # startTime = startDate1[1]
    # endTime = endDate1[1]

    filter = {
        'd': {
            '$gte': pd.to_datetime(startDate),
            '$lte': pd.to_datetime(endDate)
        }
    }

    cursor = MVAR_P1.find(filter=filter, projection={'n': 1}).distinct('n')
    cursor1 = MVAR_P2.find(filter=filter, projection={'n': 1}).distinct('n')
    cursor2 = Lines_MVAR_400_above.find(
        filter=filter, projection={'n': 1}).distinct('n')

    cursor3 = line_mw_data_collection.find(
        filter=filter, projection={'n': 1}).distinct('n')
    cursor4 = line_mw_data_collection1.find(
        filter=filter, projection={'n': 1}).distinct('n')
    cursor5 = line_mw_data_collection2.find(
        filter=filter, projection={'n': 1}).distinct('n')

    data3 = list(cursor3)
    data4 = list(cursor4)
    data5 = list(cursor5)
    data3 = data3+data4+data5

    for item in range(len(data3)):

        # x= re.split("ckt-", data3[item], flags=re.IGNORECASE)

        data3[item] = data3[item]+" MW"

    data = list(cursor)
    data1 = list(cursor1)
    data2 = list(cursor2)
    data = data+data1+data2

    for item in range(len(data)):
        data[item] = data[item]+" MVAR"

    data = data3+data

    return jsonify(data)


@app.route('/MultiLinesMWMVARNames', methods=['GET', 'POST'])
def MultiLinesMWMVARNames():

    MultistartDate = request.args['MultistartDate']
    MultistartDate = MultistartDate.split(',')
    # endDate = request.args['endDate']

    for item in range(len(MultistartDate)):
        filter = {
            'd': {
                '$gte': pd.to_datetime(MultistartDate[item]),
                '$lte': pd.to_datetime(MultistartDate[item])
            }
        }

        cursor = MVAR_P1.find(filter=filter, projection={'n': 1}).distinct('n')
        cursor1 = MVAR_P2.find(filter=filter, projection={
                               'n': 1}).distinct('n')
        cursor2 = Lines_MVAR_400_above.find(
            filter=filter, projection={'n': 1}).distinct('n')

        data = list(cursor)
        data1 = list(cursor1)
        data2 = list(cursor2)

        if item == 0:
            final_data = data
            final_data1 = data1
            final_data2 = data2

        else:
            final_data = list(set(final_data) & set(data))
            final_data1 = list(set(final_data1) & set(data1))
            final_data2 = list(set(final_data2) & set(data2))

        cursor3 = line_mw_data_collection.find(
            filter=filter, projection={'n': 1}).distinct('n')
        cursor4 = line_mw_data_collection1.find(
            filter=filter, projection={'n': 1}).distinct('n')
        cursor5 = line_mw_data_collection2.find(
            filter=filter, projection={'n': 1}).distinct('n')

        data3 = list(cursor3)
        data4 = list(cursor4)
        data5 = list(cursor5)

        if item == 0:
            final_data3 = data3
            final_data4 = data4
            final_data5 = data5

        else:
            final_data3 = list(set(final_data3) & set(data3))
            final_data4 = list(set(final_data4) & set(data4))
            final_data5 = list(set(final_data5) & set(data5))

    final_data3 = final_data3+final_data4+final_data5
    final_data3 = list(dict.fromkeys(final_data3))

    for item in range(len(final_data3)):
        final_data3[item] = final_data3[item]+" MW"

    final_data = final_data+final_data1+final_data2
    final_data = list(dict.fromkeys(final_data))

    for item in range(len(final_data)):
        final_data[item] = final_data[item]+" MVAR"

    final_data = final_data3+final_data

    return jsonify(final_data)


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


def GetDemandCollection():

    CONNECTION_STRING = "mongodb://mongodb0.erldc.in:27017,mongodb1.erldc.in:27017/?replicaSet=CONSERV"
    client = MongoClient(CONNECTION_STRING)
    db = client['mis']
    demand_collection = db['Demand_minutes']
    drawal_collection = db['Drawal_minutes']
    # drawal_collection.create_index(
    #     [("d", ASCENDING), ("n", ASCENDING)],
    #     unique=True
    # )
    # line_mw_data_collection2.create_index(
    # [("d", ASCENDING), ("n", ASCENDING)],
    # unique=True
    # )
    return demand_collection, drawal_collection


demand_collection, drawal_collection = GetDemandCollection()


@app.route('/DemandFileInsert', methods=['GET', 'POST'])
def DemandFileInsert():

    def insertFlowDfIntoDB(demand_collection, drawal_collection, df, df1, for_date):

        doc_list = []
        doc_list1 = []

        df = df.astype('double').reset_index(drop=True)
        df.index = df.index.astype('str')
        if (len(df) != 1440):

            raise Exception("Error")

        for col in set(df.columns):
            a = {
                "p": df[col].round(3).to_list(),
                "d": pd.to_datetime(for_date),
                "ym": for_date.strftime("%Y%m"),
                "n": col}
            doc_list.append(a)

        df1 = df1.astype('double').reset_index(drop=True)
        df1.index = df1.index.astype('str')
        if (len(df1) != 1440):

            raise Exception("Error")

        for col1 in set(df1.columns):
            b = {
                "p": df1[col1].round(3).to_list(),
                "d": pd.to_datetime(for_date),
                "ym": for_date.strftime("%Y%m"),
                "n": col1}
            doc_list1.append(b)

        try:
            try:
                res = drawal_collection.insert_many(doc_list1)
                # print("Successfully inserted Demand drawal Files", for_date)

            except:
                # print("Demand drawal Files insert problem in Database", for_date)
                pass

            try:
                res = demand_collection.insert_many(doc_list)
                # print("Successfully inserted Demand rest Files", for_date)

            except:
                # print("Demand rest Files insert problem in Database", for_date)
                pass

        except:
            print("Demand File insert problem in Database")

        return 'res'

    startDate = request.args['startDate']
    endDate = request.args['endDate']

    startDateObj = datetime.strptime(startDate, "%Y-%m-%d")
    endDateObj = datetime.strptime(endDate, "%Y-%m-%d")

    op = []
    for for_date1 in pd.date_range(date(startDateObj.year, startDateObj.month, startDateObj.day), date(endDateObj.year, endDateObj.month, endDateObj.day)):

        try:

            FILE = "http://10.3.100.24/ScadaData/er_web/Er_web_state_demand_{}.xlsx".format(
                for_date1.strftime("%d%m%Y"))

            df = pd.read_excel(FILE, sheet_name='Sheet1')
            df = df.drop(0)

            df = df.drop(columns=['Unnamed: 0'])

            df.index = pd.date_range(
                for_date1, for_date1 + timedelta(days=1), freq='1T')[:-1]

            FILE1 = "http://10.3.100.24/ScadaData/er_web/Er_web_state_exchange_{}.xlsx".format(
                for_date1.strftime("%d%m%Y"))

            df1 = pd.read_excel(FILE1, sheet_name='Sheet1')
            df1 = df1.drop(0)

            df1 = df1.drop(columns=['Unnamed: 0'])

            df1.index = pd.date_range(
                for_date1, for_date1 + timedelta(days=1), freq='1T')[:-1]

            # df.columns = df.columns.map(
            #     lambda x: x[0]+": " + x[1] if 'Unnamed' not in x[1] else x[0]+': '+((x[0].split('-'))[0].split(' '))[-1] + ' end')

            insertFlowDfIntoDB(demand_collection,
                               drawal_collection, df, df1, for_date1)

            op.append(for_date1)

        except:
            print('DemandFileInsert', for_date1)

    return jsonify(op)


@app.route('/DemandMinNames', methods=['GET', 'POST'])
def DemandMinNames():

    startDate1 = request.args['startDate']
    endDate1 = request.args['endDate']

    startDate1 = startDate1.split(" ")
    endDate1 = endDate1.split(" ")

    startDate = startDate1[0]
    endDate = endDate1[0]

    startTime = startDate1[1]
    endTime = endDate1[1]

    filter = {
        'd': {
            '$gte': pd.to_datetime(startDate),
            '$lte': pd.to_datetime(endDate)
        }
    }

    cursor = demand_collection.find(
        filter=filter, projection={'n': 1}).distinct('n')
    cursor1 = drawal_collection.find(
        filter=filter, projection={'n': 1}).distinct('n')

    data = list(cursor)
    data1 = list(cursor1)

    data = data+data1

    delete_item = []

    for item in data:
        item1 = item.split(":")
        if len(item1) > 1:
            delete_item.append(item)

    for item in delete_item:
        data.remove(item)

    return jsonify(data)


@app.route('/MultiDemandMinNames', methods=['GET', 'POST'])
def MultiDemandMinNames():

    MultistartDate = request.args['MultistartDate']
    MultistartDate = MultistartDate.split(',')
    # endDate = request.args['endDate']

    for item in range(len(MultistartDate)):
        filter = {
            'd': {
                '$gte': pd.to_datetime(MultistartDate[item]),
                '$lte': pd.to_datetime(MultistartDate[item])
            }
        }

        cursor = demand_collection.find(
            filter=filter, projection={'n': 1}).distinct('n')
        cursor1 = drawal_collection.find(
            filter=filter, projection={'n': 1}).distinct('n')

        data = list(cursor)
        data1 = list(cursor1)

        if item == 0:
            final_data = data
            final_data1 = data1

        else:
            final_data = list(set(final_data) & set(data))
            final_data1 = list(set(final_data1) & set(data1))

    final_data = final_data+final_data1
    final_data = list(dict.fromkeys(final_data))

    delete_item = []

    for item in final_data:
        item1 = item.split(":")
        if len(item1) > 1:
            delete_item.append(item)

    for item in delete_item:
        final_data.remove(item)

    return jsonify(final_data)


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

            if (temp_station[-1] == "DEMAND" or station == "REG DEMAND"):

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
            "D:/Applications/MIS/mis_be/Excel_Files/Demand.xlsx", index=None)

        path = "D:/Applications/MIS/mis_be/Excel_Files/DemandMin.xlsx"

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
        return send_file('D:/Applications/MIS/mis_be/Excel_Files/Demand.xlsx', as_attachment=True, download_name=custom)

    else:
        return jsonify("No Data to Download")


# ///////////////////////////////////////////////////////////////////////////////////Generator/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


def GetGeneratorCollection():

    CONNECTION_STRING = "mongodb://mongodb0.erldc.in:27017,mongodb1.erldc.in:27017/?replicaSet=CONSERV"
    client = MongoClient(CONNECTION_STRING)
    db = client['mis']
    Generator_DB = db['Generator_Data']

    # Generator_DB.create_index(
    #     [("d", ASCENDING), ("n", ASCENDING)],
    #     unique=True
    # )
    # Generator_MVAR.create_index(
    #     [("d", ASCENDING), ("n", ASCENDING)],
    #     unique=True
    # )
    return Generator_DB


Generator_DB = GetGeneratorCollection()


@app.route('/GeneratorFileInsert', methods=['GET', 'POST'])
def GeneratorFileInsert():

    def insertFlowDfIntoDB(Generator_DB, df, for_date):

        doc_list = []

        df = df.astype('double').reset_index(drop=True)
        df.index = df.index.astype('str')
        if (len(df) != 1440):

            raise Exception("Error")

        for col in set(df.columns):
            a = {
                "p": df[col].round(3).to_list(),
                "d": pd.to_datetime(for_date),
                "ym": for_date.strftime("%Y%m"),
                "n": col}
            doc_list.append(a)

        try:
            res = Generator_DB.insert_many(doc_list)
            # print("Successfully inserted Generator Data for ", for_date)
        except:

            print("Generator Files insert problem in Database", for_date)

        return 'res'

    startDate = request.args['startDate']
    endDate = request.args['endDate']

    startDateObj = datetime.strptime(startDate, "%Y-%m-%d")
    endDateObj = datetime.strptime(endDate, "%Y-%m-%d")

    op = []
    for for_date1 in pd.date_range(date(startDateObj.year, startDateObj.month, startDateObj.day), date(endDateObj.year, endDateObj.month, endDateObj.day)):

        try:
            FILE = "http://10.3.100.24/DAILY_DUMP_FILES_SCADA/ER_Generator_MW_MVAR_Exchange_data_{}.xlsm".format(
                for_date1.strftime("%d%m%Y"))

            df = pd.read_excel(FILE, sheet_name='Data1')
            df = df.drop(0)
            df = df.drop(columns=['Unnamed: 0', "Unnamed: 1"])[0:1442]
            df.columns = df.iloc[0]
            df = df.drop(1)
            df = df.drop(2)
            df.index = pd.date_range(
                for_date1, for_date1 + timedelta(days=1), freq='1T')[:-1]

            temp1 = df.columns.tolist()

            for i in range(len(temp1)):

                if not (temp1[i] == temp1[i]):

                    temp1[i] = temp1[i-1]+" MVAR"
                    temp1[i-1] = temp1[i-1]+" MW"

            for i in range(len(temp1)):
                x = temp1[i][-3:]
                y = temp1[i][-5:]
                if x != " MW" and y != " MVAR":
                    temp1[i] = temp1[i]+" MW"

            df.columns = temp1

            insertFlowDfIntoDB(Generator_DB, df, for_date1)

            op.append(for_date1)

        except:
            print('Generator File read problem', for_date1)

    return jsonify(op)


@app.route('/GeneratorNames', methods=['GET', 'POST'])
def GeneratorNames():

    startDate1 = request.args['startDate']
    endDate1 = request.args['endDate']

    startDate1 = startDate1.split(" ")
    endDate1 = endDate1.split(" ")

    startDate = startDate1[0]
    endDate = endDate1[0]

    # startTime = startDate1[1]
    # endTime = endDate1[1]

    filter = {
        'd': {
            '$gte': pd.to_datetime(startDate),
            '$lte': pd.to_datetime(endDate)
        }
    }

    cursor = Generator_DB.find(
        filter=filter, projection={'n': 1}).distinct('n')

    data = list(cursor)

    return jsonify(data)


@app.route('/MultiGeneratorNames', methods=['GET', 'POST'])
def MultiGeneratorNames():

    MultistartDate = request.args['MultistartDate']
    MultistartDate = MultistartDate.split(',')
    # endDate = request.args['endDate']

    for item in range(len(MultistartDate)):
        filter = {
            'd': {
                '$gte': pd.to_datetime(MultistartDate[item]),
                '$lte': pd.to_datetime(MultistartDate[item])
            }
        }

        cursor = Generator_DB.find(
            filter=filter, projection={'n': 1}).distinct('n')

        data = list(cursor)

        if item == 0:
            final_data = data

        else:
            final_data = list(set(final_data) & set(data))

    final_data = list(dict.fromkeys(final_data))

    return jsonify(final_data)


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
        "D:/Applications/MIS/mis_be/Excel_Files/Generator.xlsx", index=None)

    path = "D:/Applications/MIS/mis_be/Excel_Files/Generator.xlsx"

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
        return send_file('D:/Applications/MIS/mis_be/Excel_Files/Generator.xlsx', as_attachment=True, download_name=custom)

    else:
        return jsonify("No Data to Download")


# ///////////////////////////////////////////////////////////////////////////////////ISGS/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


def GetISGSCollection():

    CONNECTION_STRING = "mongodb://mongodb0.erldc.in:27017,mongodb1.erldc.in:27017/?replicaSet=CONSERV"
    client = MongoClient(CONNECTION_STRING)
    db = client['mis']
    ISGS_DB = db['ISGS_Data']

    # ISGS_DB.create_index(
    #     [("d", ASCENDING), ("n", ASCENDING)],
    #     unique=True
    # )
    # Generator_MVAR.create_index(
    #     [("d", ASCENDING), ("n", ASCENDING)],
    #     unique=True
    # )
    return ISGS_DB


ISGS_DB = GetISGSCollection()


@app.route('/ISGSFileInsert', methods=['GET', 'POST'])
def ISGSFileInsert():

    def insertFlowDfIntoDB(ISGS_DB, df, for_date):

        doc_list = []

        df = df.astype('double').reset_index(drop=True)
        df.index = df.index.astype('str')
        if (len(df) != 1440):

            raise Exception("Error")

        for col in set(df.columns):
            a = {
                "p": df[col].round(3).to_list(),
                "d": pd.to_datetime(for_date),
                "ym": for_date.strftime("%Y%m"),
                "n": col}
            doc_list.append(a)

        try:
            res = ISGS_DB.insert_many(doc_list)
            # print("Successfully inserted ISGS Data for ", for_date)
        except:

            print("ISGS Files insert problem in Database", for_date)

        return 'res'

    startDate = request.args['startDate']
    endDate = request.args['endDate']

    startDateObj = datetime.strptime(startDate, "%Y-%m-%d")
    endDateObj = datetime.strptime(endDate, "%Y-%m-%d")

    op = []
    for for_date1 in pd.date_range(date(startDateObj.year, startDateObj.month, startDateObj.day), date(endDateObj.year, endDateObj.month, endDateObj.day)):

        try:
            FILE = "http://10.3.100.24/ScadaData/er_web/Er_web_isgs_gen_{}.xlsx".format(
                for_date1.strftime("%d%m%Y"))

            df = pd.read_excel(FILE, sheet_name='Sheet1')
            df = df.drop(0)
            df = df.drop(columns=['Unnamed: 0',])[0:1442]

            df.index = pd.date_range(
                for_date1, for_date1 + timedelta(days=1), freq='1T')[:-1]

            insertFlowDfIntoDB(ISGS_DB, df, for_date1)

            op.append(for_date1)

        except:
            print('ISGS File read problem', for_date1)

    return jsonify(op)


@app.route('/ISGSNames', methods=['GET', 'POST'])
def ISGSNames():

    startDate1 = request.args['startDate']
    endDate1 = request.args['endDate']

    startDate1 = startDate1.split(" ")
    endDate1 = endDate1.split(" ")

    startDate = startDate1[0]
    endDate = endDate1[0]

    # startTime = startDate1[1]
    # endTime = endDate1[1]

    filter = {
        'd': {
            '$gte': pd.to_datetime(startDate),
            '$lte': pd.to_datetime(endDate)
        }
    }

    cursor = ISGS_DB.find(
        filter=filter, projection={'n': 1}).distinct('n')

    data = list(cursor)

    return jsonify(data)


@app.route('/MultiISGSNames', methods=['GET', 'POST'])
def MultiISGSNames():

    MultistartDate = request.args['MultistartDate']
    MultistartDate = MultistartDate.split(',')
    # endDate = request.args['endDate']

    for item in range(len(MultistartDate)):
        filter = {
            'd': {
                '$gte': pd.to_datetime(MultistartDate[item]),
                '$lte': pd.to_datetime(MultistartDate[item])
            }
        }

        cursor = ISGS_DB.find(
            filter=filter, projection={'n': 1}).distinct('n')

        data = list(cursor)

        if item == 0:
            final_data = data

        else:
            final_data = list(set(final_data) & set(data))

    final_data = list(dict.fromkeys(final_data))

    return jsonify(final_data)


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

                ISGS_result = ISGS_DB.find(
                    filter=filter,
                    projection=project
                )

                ISGS_list = list(ISGS_result)

                for item in ISGS_list:

                    output = output + item['p']
                # print('ISGS ',len(ISGS))

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


@app.route('/GetISGSDataExcel', methods=['GET', 'POST'])
def GetISGSDataExcel():

    merged = pd.concat(ISGS_excel_data, axis=1, join="inner")

    merged.to_excel("D:/Applications/MIS/mis_be/Excel_Files/ISGS.xlsx", index=None)

    path = "D:/Applications/MIS/mis_be/Excel_Files/ISGS.xlsx"

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
        return send_file('D:/Applications/MIS/mis_be/Excel_Files/ISGS.xlsx', as_attachment=True, download_name=custom)

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

# @app.route('/SCED_Data', methods=['GET', 'POST'])
# def SCED_Data():

#     startDate = request.args['startDate']
#     startDate = datetime.strptime(startDate, "%d-%m-%Y")
#     endDate = request.args['endDate']
#     endDate = datetime.strptime(endDate, "%d-%m-%Y")

#     date_val = [startDate+timedelta(days=x)
#                 for x in range((endDate-startDate).days+1)]
    
#     for item in date_val:

#         item = item.strftime("%d-%m-%Y")

#         res1 = requests.get(
#                 'https://scedpublic.posoco.in/marginalcost/getTodayCost?selectedDate%5B%5D:='+item)
#         response1 = json.loads(res1.text)

#     return jsonify(response1)



@app.route('/outage', methods=['GET', 'POST'])
def outage():

    daterange = request.args['daterange']
    daterange= daterange.split(",")

    startDateObj = datetime.strptime(daterange[0], "%d-%m-%Y")
    endDateObj = datetime.strptime(daterange[1], "%d-%m-%Y")
    date_range= [date.strftime(startDateObj+timedelta(days=x),"%d-%m-%Y") for x in range((endDateObj-startDateObj).days+1)]

    hydro1=[]
    coal1=[]
    nuclear1=[]

    def blank_check(value):

        blank_val= {'Date': dates,
                'ELEMENT_NAME':'',
                'UNIT_NUMBER':'',
                'INSTALLED_CAPACITY':'',
                'LOCATION':'',
                'OUT_REASON':'',
                'EXPECTED_REVIVAL_DATE':'',
                'FUEL':'',
                'OUTAGE_DATE':'',
                'OWNER_NAME':'',
                'SECTOR':'',
                'OUTAGE_TIME':'',
                'OUTAGE_TYPE':''}

        if len(value)==0:
            return ([blank_val])
        else: 
            return (value)


    for dates in date_range:
        units_api = "https://report.erldc.in/POSOCO_API/api/Outage/GetQueryNpmcReportData/"+dates
        units_api_res = requests.get(units_api).json()

        blank= {'Date': dates,
                'ELEMENT_NAME':'',
                'INSTALLED_CAPACITY':'',
                'EXPECTED_REVIVAL_DATE':'',
                'FUEL':'',
                'LOCATION':'',
                'OUTAGE_DATE':'',
                'OUT_REASON':'',
                'OWNER_NAME':'',
                'SECTOR':'',
                'UNIT_NUMBER':'',
                'OUTAGE_TIME':'',
                'OUTAGE_TYPE':''}

        if len(units_api_res)!=0:

            hydro_planned_rev=[]
            coal_planned_rev=[]
            nuclear_planned_rev=[]

            hydro_forced_rev=[]
            coal_forced_rev=[]
            nuclear_forced_rev=[]

            hydro_planned_out=[]
            coal_planned_out=[]
            nuclear_planned_out=[]

            hydro_forced_out=[]
            coal_forced_out=[]
            nuclear_forced_out=[]

            coal_short_rev=[]
            coal_short_out=[]

            for item in units_api_res:

                if item['FUEL']== 'HYDRO':
                    hydro1.append({'Date': dates,
                                    'ELEMENT_NAME':item['ELEMENT_NAME'],
                                    'INSTALLED_CAPACITY':str(item['INSTALLED_CAPACITY'])+" MW",
                                    'EXPECTED_REVIVAL_DATE':item['EXPECTED_REVIVAL_DATE'],
                                    'FUEL':item['FUEL'],
                                    'LOCATION/OWNER_NAME':item['LOCATION']+"/"+item['OWNER_NAME'],
                                    'OUTAGE_DATE':item['OUTAGE_DATE'],
                                    'OUT_REASON':item['OUT_REASON'],
                                    # 'OWNER_NAME':item['OWNER_NAME'],
                                    'SECTOR':item['SECTOR'],
                                    'UNIT_NUMBER':item['UNIT_NUMBER'],
                                    'OUTAGE_TIME':item['OUTAGE_TIME'],
                                    'OUTAGE_TYPE':item['OUTAGE_TYPE']})

                    if item['OUTAGE_TYPE'] is None or item['OUTAGE_TYPE']=="PLANNED OUTAGE":
                        report_date= daterange[0].replace("-","/")

                        if item['EXPECTED_REVIVAL_DATE']==report_date:

                            if item['REVIVAL_TIME'] is None:
                                remark= ""
                            else:
                                remark= "Synchronized at "+str(item['REVIVAL_TIME'])

                            hydro_planned_rev.append(
                                {'Date': dates,
                                    'ELEMENT_NAME':item['ELEMENT_NAME'],
                                    'INSTALLED_CAPACITY':item['INSTALLED_CAPACITY'],
                                    'EXPECTED_REVIVAL_DATE':item['EXPECTED_REVIVAL_DATE'],
                                    'FUEL':item['FUEL'],
                                    'LOCATION':item['LOCATION']+"/"+item['OWNER_NAME'],
                                    'OUTAGE_DATE':remark,
                                    'OUT_REASON':item['OUT_REASON'],
                                    'OWNER_NAME':item['OWNER_NAME'],
                                    'SECTOR':item['SECTOR'],
                                    'UNIT_NUMBER':item['UNIT_NUMBER'],
                                    'OUTAGE_TIME':item['OUTAGE_TIME'],
                                    'OUTAGE_TYPE':item['OUTAGE_TYPE']}
                            )
                        else:
                            hydro_planned_out.append(
                                {'Date': dates,
                                    'ELEMENT_NAME':item['ELEMENT_NAME'],
                                    'INSTALLED_CAPACITY':item['INSTALLED_CAPACITY'],
                                    'EXPECTED_REVIVAL_DATE':item['EXPECTED_REVIVAL_DATE'],
                                    'FUEL':item['FUEL'],
                                    'LOCATION':item['LOCATION']+"/"+item['OWNER_NAME'],
                                    'OUTAGE_DATE':item['OUTAGE_DATE'],
                                    'OUT_REASON':item['OUT_REASON'],
                                    'OWNER_NAME':item['OWNER_NAME'],
                                    'SECTOR':item['SECTOR'],
                                    'UNIT_NUMBER':item['UNIT_NUMBER'],
                                    'OUTAGE_TIME':item['OUTAGE_TIME'],
                                    'OUTAGE_TYPE':item['OUTAGE_TYPE']}
                            )

                    else:
                        report_date= daterange[0].replace("-","/")

                        if item['EXPECTED_REVIVAL_DATE']==report_date:

                            if item['REVIVAL_TIME'] is None:
                                remark= ""
                            else:
                                remark= "Synchronized at "+str(item['REVIVAL_TIME'])

                            hydro_forced_rev.append(
                                {'Date': dates,
                                    'ELEMENT_NAME':item['ELEMENT_NAME'],
                                    'INSTALLED_CAPACITY':item['INSTALLED_CAPACITY'],
                                    'EXPECTED_REVIVAL_DATE':item['EXPECTED_REVIVAL_DATE'],
                                    'FUEL':item['FUEL'],
                                    'LOCATION':item['LOCATION']+"/"+item['OWNER_NAME'],
                                    'OUTAGE_DATE':remark,
                                    'OUT_REASON':item['OUT_REASON'],
                                    'OWNER_NAME':item['OWNER_NAME'],
                                    'SECTOR':item['SECTOR'],
                                    'UNIT_NUMBER':item['UNIT_NUMBER'],
                                    'OUTAGE_TIME':item['OUTAGE_TIME'],
                                    'OUTAGE_TYPE':item['OUTAGE_TYPE']}
                            )
                        else:
                            hydro_forced_out.append(
                                {'Date': dates,
                                    'ELEMENT_NAME':item['ELEMENT_NAME'],
                                    'INSTALLED_CAPACITY':item['INSTALLED_CAPACITY'],
                                    'EXPECTED_REVIVAL_DATE':item['EXPECTED_REVIVAL_DATE'],
                                    'FUEL':item['FUEL'],
                                    'LOCATION':item['LOCATION']+"/"+item['OWNER_NAME'],
                                    'OUTAGE_DATE':item['OUTAGE_DATE'],
                                    'OUT_REASON':item['OUT_REASON'],
                                    'OWNER_NAME':item['OWNER_NAME'],
                                    'SECTOR':item['SECTOR'],
                                    'UNIT_NUMBER':item['UNIT_NUMBER'],
                                    'OUTAGE_TIME':item['OUTAGE_TIME'],
                                    'OUTAGE_TYPE':item['OUTAGE_TYPE']}
                            )


                if item['FUEL']== 'COAL':
                    coal1.append({'Date': dates,
                                    'ELEMENT_NAME':item['ELEMENT_NAME'],
                                    'INSTALLED_CAPACITY':str(item['INSTALLED_CAPACITY'])+" MW",
                                    'EXPECTED_REVIVAL_DATE':item['EXPECTED_REVIVAL_DATE'],
                                    'FUEL':item['FUEL'],
                                    'LOCATION/OWNER_NAME':item['LOCATION']+"/"+item['OWNER_NAME'],
                                    'OUTAGE_DATE':item['OUTAGE_DATE'],
                                    'OUT_REASON':item['OUT_REASON'],
                                    # 'OWNER_NAME':item['OWNER_NAME'],
                                    'SECTOR':item['SECTOR'],
                                    'UNIT_NUMBER':item['UNIT_NUMBER'],
                                    'OUTAGE_TIME':item['OUTAGE_TIME'],
                                    'OUTAGE_TYPE':item['OUTAGE_TYPE']})

                    if "Coal Shortage" not in item['OUT_REASON']: 

                        if item['OUTAGE_TYPE'] is None or item['OUTAGE_TYPE']=="PLANNED OUTAGE":
                            report_date= daterange[0].replace("-","/")

                            if item['EXPECTED_REVIVAL_DATE']==report_date:

                                if item['REVIVAL_TIME'] is None:
                                    remark= ""
                                else:
                                    remark= "Synchronized at "+str(item['REVIVAL_TIME'])

                                coal_planned_rev.append(
                                    {'Date': dates,
                                        'ELEMENT_NAME':item['ELEMENT_NAME'],
                                        'INSTALLED_CAPACITY':item['INSTALLED_CAPACITY'],
                                        'EXPECTED_REVIVAL_DATE':item['EXPECTED_REVIVAL_DATE'],
                                        'FUEL':item['FUEL'],
                                        'LOCATION':item['LOCATION']+"/"+item['OWNER_NAME'],
                                        'OUTAGE_DATE':remark,
                                        'OUT_REASON':item['OUT_REASON'],
                                        'OWNER_NAME':item['OWNER_NAME'],
                                        'SECTOR':item['SECTOR'],
                                        'UNIT_NUMBER':item['UNIT_NUMBER'],
                                        'OUTAGE_TIME':item['OUTAGE_TIME'],
                                        'OUTAGE_TYPE':item['OUTAGE_TYPE']}
                                )
                            else:
                                coal_planned_out.append(
                                    {'Date': dates,
                                        'ELEMENT_NAME':item['ELEMENT_NAME'],
                                        'INSTALLED_CAPACITY':item['INSTALLED_CAPACITY'],
                                        'EXPECTED_REVIVAL_DATE':item['EXPECTED_REVIVAL_DATE'],
                                        'FUEL':item['FUEL'],
                                        'LOCATION':item['LOCATION']+"/"+item['OWNER_NAME'],
                                        'OUTAGE_DATE':item['OUTAGE_DATE'],
                                        'OUT_REASON':item['OUT_REASON'],
                                        'OWNER_NAME':item['OWNER_NAME'],
                                        'SECTOR':item['SECTOR'],
                                        'UNIT_NUMBER':item['UNIT_NUMBER'],
                                        'OUTAGE_TIME':item['OUTAGE_TIME'],
                                        'OUTAGE_TYPE':item['OUTAGE_TYPE']}
                                )
                            
                        else:
                            report_date= daterange[0].replace("-","/")

                            if item['EXPECTED_REVIVAL_DATE']==report_date:

                                if item['REVIVAL_TIME'] is None:
                                    remark= ""
                                else:
                                    remark= "Synchronized at "+str(item['REVIVAL_TIME'])

                                coal_forced_rev.append(
                                    {'Date': dates,
                                        'ELEMENT_NAME':item['ELEMENT_NAME'],
                                        'INSTALLED_CAPACITY':item['INSTALLED_CAPACITY'],
                                        'EXPECTED_REVIVAL_DATE':item['EXPECTED_REVIVAL_DATE'],
                                        'FUEL':item['FUEL'],
                                        'LOCATION':item['LOCATION']+"/"+item['OWNER_NAME'],
                                        'OUTAGE_DATE':remark,
                                        'OUT_REASON':item['OUT_REASON'],
                                        'OWNER_NAME':item['OWNER_NAME'],
                                        'SECTOR':item['SECTOR'],
                                        'UNIT_NUMBER':item['UNIT_NUMBER'],
                                        'OUTAGE_TIME':item['OUTAGE_TIME'],
                                        'OUTAGE_TYPE':item['OUTAGE_TYPE']}
                                )
                            else:
                                coal_forced_out.append(
                                    {'Date': dates,
                                        'ELEMENT_NAME':item['ELEMENT_NAME'],
                                        'INSTALLED_CAPACITY':item['INSTALLED_CAPACITY'],
                                        'EXPECTED_REVIVAL_DATE':item['EXPECTED_REVIVAL_DATE'],
                                        'FUEL':item['FUEL'],
                                        'LOCATION':item['LOCATION']+"/"+item['OWNER_NAME'],
                                        'OUTAGE_DATE':item['OUTAGE_DATE'],
                                        'OUT_REASON':item['OUT_REASON'],
                                        'OWNER_NAME':item['OWNER_NAME'],
                                        'SECTOR':item['SECTOR'],
                                        'UNIT_NUMBER':item['UNIT_NUMBER'],
                                        'OUTAGE_TIME':item['OUTAGE_TIME'],
                                        'OUTAGE_TYPE':item['OUTAGE_TYPE']}
                                )
                        
                    else:
                        report_date= daterange[0].replace("-","/")

                        if item['EXPECTED_REVIVAL_DATE']==report_date:

                            if item['REVIVAL_TIME'] is None:
                                remark= ""
                            else:
                                remark= "Synchronized at "+str(item['REVIVAL_TIME'])

                            coal_short_rev.append(
                                {'Date': dates,
                                    'ELEMENT_NAME':item['ELEMENT_NAME'],
                                    'INSTALLED_CAPACITY':item['INSTALLED_CAPACITY'],
                                    'EXPECTED_REVIVAL_DATE':item['EXPECTED_REVIVAL_DATE'],
                                    'FUEL':item['FUEL'],
                                    'LOCATION':item['LOCATION']+"/"+item['OWNER_NAME'],
                                    'OUTAGE_DATE':remark,
                                    'OUT_REASON':item['OUT_REASON'],
                                    'OWNER_NAME':item['OWNER_NAME'],
                                    'SECTOR':item['SECTOR'],
                                    'UNIT_NUMBER':item['UNIT_NUMBER'],
                                    'OUTAGE_TIME':item['OUTAGE_TIME'],
                                    'OUTAGE_TYPE':item['OUTAGE_TYPE']}
                            )
                        else:
                            coal_short_out.append(
                                {'Date': dates,
                                    'ELEMENT_NAME':item['ELEMENT_NAME'],
                                    'INSTALLED_CAPACITY':item['INSTALLED_CAPACITY'],
                                    'EXPECTED_REVIVAL_DATE':item['EXPECTED_REVIVAL_DATE'],
                                    'FUEL':item['FUEL'],
                                    'LOCATION':item['LOCATION']+"/"+item['OWNER_NAME'],
                                    'OUTAGE_DATE':item['OUTAGE_DATE'],
                                    'OUT_REASON':item['OUT_REASON'],
                                    'OWNER_NAME':item['OWNER_NAME'],
                                    'SECTOR':item['SECTOR'],
                                    'UNIT_NUMBER':item['UNIT_NUMBER'],
                                    'OUTAGE_TIME':item['OUTAGE_TIME'],
                                    'OUTAGE_TYPE':item['OUTAGE_TYPE']}
                            )


                if item['FUEL']== 'NUCLEAR':
                    nuclear1.append({'Date': dates,
                                    'ELEMENT_NAME':item['ELEMENT_NAME'],
                                    'INSTALLED_CAPACITY':str(item['INSTALLED_CAPACITY'])+" MW",
                                    'EXPECTED_REVIVAL_DATE':item['EXPECTED_REVIVAL_DATE'],
                                    'FUEL':item['FUEL'],
                                    'LOCATION/OWNER_NAME':item['LOCATION']+"/"+item['OWNER_NAME'],
                                    'OUTAGE_DATE':item['OUTAGE_DATE'],
                                    'OUT_REASON':item['OUT_REASON'],
                                    # 'OWNER_NAME':item['OWNER_NAME'],
                                    'SECTOR':item['SECTOR'],
                                    'UNIT_NUMBER':item['UNIT_NUMBER'],
                                    'OUTAGE_TIME':item['OUTAGE_TIME'],
                                    'OUTAGE_TYPE':item['OUTAGE_TYPE']})

            hydro_report={
                'Planned': {
                    'Revived': blank_check(hydro_planned_rev),
                    'Out': blank_check(hydro_planned_out)
                },
                'Forced': {
                    'Revived': blank_check(hydro_forced_rev),
                    'Out': blank_check(hydro_forced_out)
                }
            }
            coal_report={
                'Planned': {
                    'Revived': blank_check(coal_planned_rev),
                    'Out': blank_check(coal_planned_out)
                },
                'Forced': {
                    'Revived': blank_check(coal_forced_rev),
                    'Out': blank_check(coal_forced_out)
                },
                'Shortage': {
                    'Revived': blank_check(coal_short_rev),
                    'Out': blank_check(coal_short_out)
                }
            }
            nuclear_report={
                'Planned': {
                    'Revived': blank_check(nuclear_planned_rev),
                    'Out': blank_check(nuclear_planned_out)
                },
                'Forced': {
                    'Revived': blank_check(nuclear_forced_rev),
                    'Out': blank_check(nuclear_forced_out)
                }
            }

        else:
            
            hydro1.append(blank)
            coal1.append(blank)
            nuclear1.append(blank)

            hydro_report={
                'Planned': {
                    'Revived': [blank],
                    'Out': [blank]
                },
                'Forced': {
                    'Revived': [blank],
                    'Out': [blank]
                }
            }
            coal_report={
                'Planned': {
                    'Revived': [blank],
                    'Out': [blank]
                },
                'Forced': {
                    'Revived': [blank],
                    'Out': [blank]
                },
                'Shortage': {
                    'Revived': [blank],
                    'Out': [blank]
                }
            }
            nuclear_report={
                'Planned': {
                    'Revived': [blank],
                    'Out': [blank]
                },
                'Forced': {
                    'Revived': [blank],
                    'Out': [blank]
                }
            }

    return ({'HYDRO':[hydro1,hydro_report],'COAL':[coal1,coal_report],'NUCLEAR':[nuclear1,nuclear_report]})

if __name__ == '__main__':

    # app.debug = True

    app.run(debug=True, host='0.0.0.0', port=5010)
