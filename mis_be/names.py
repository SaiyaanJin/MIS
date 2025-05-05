from cmath import nan
from unicodedata import name
import pandas as pd
import os
import time
from pymongo import MongoClient, ASCENDING, DESCENDING, errors
from datetime import date, timedelta, datetime, timezone
from flask import Flask, jsonify, request, redirect, Response, send_file
from flask_cors import CORS
import json
import math
from io import StringIO
from urllib.parse import urlparse
from urllib.parse import parse_qs
from flask_cors import CORS, cross_origin
from flask import send_from_directory
from pandas.tseries.offsets import MonthEnd
import numpy as np
import requests
import xmltodict
import urllib.request


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




# //////////////////////////////////////////////////////////////////////////////////////////Collections/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


def GetCollection():

    CONNECTION_STRING = "mongodb://mongodb0.erldc.in:27017,mongodb1.erldc.in:27017,mongodb10.erldc.in:27017/?replicaSet=CONSERV"
    client = MongoClient(CONNECTION_STRING)
    db = client['mis']
    x1 = db['voltage_data']
    x2  = db['line_mw_data_p1']
    x3  = db['line_mw_data_p2']
    x4  = db['line_mw_data_400_above']
    x5  = db['MVAR_p1']
    x6  = db['MVAR_p2']
    x7  = db['Lines_MVAR_400_above']
    x8  = db['ICT_data']
    x9  = db['ICT_data_MW']
    x10  = db['frequency_data']
    x11  = db['Demand_minutes']
    x12  = db['Drawal_minutes']
    x13  = db['Generator_Data']
    x14  = db['ISGS_Data']

    return [x1,x2,x3,x4,x5,x6,x7,x8,x9,x10,x11,x12,x13,x14]


tables = GetCollection()
voltage_data_collection = tables[0]
line_mw_data_collection = tables[1]
line_mw_data_collection1 = tables[2]
line_mw_data_collection2 = tables[3]
MVAR_P1 = tables[4]
MVAR_P2 = tables[5]
Lines_MVAR_400_above = tables[6]
ICT_data1 = tables[7]
ICT_data2 = tables[8]
frequency_data_collection = tables[9]
demand_collection = tables[10]
drawal_collection = tables[11]
Generator_DB = tables[12]
ISGS_DB = tables[13]


def Names(startDate,endDate,type):

    if type=="Voltage":

        filter = {
            'd': {
                '$gte': pd.to_datetime(startDate),
                '$lte': pd.to_datetime(endDate)
            }
        }

        cursor = voltage_data_collection.find(
            filter=filter, projection={'n': 1}).distinct('n')

        data = list(cursor)
        return jsonify(data)
    
    if type=="Lines":

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
    
    if type=="ICT":

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
    
    if type=="Frequency":

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

    if type=="LinesMWMVAR":

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


    if type=="Demand":

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


    if type=="Generator":

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
    
    if type=="ISGS":

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

def MultiNames(MultistartDate,type):

    if type=="Voltage":

        for item in range(len(MultistartDate)):
            filter = {
                'd': {
                    '$gte': pd.to_datetime(MultistartDate[item]),
                    '$lte': pd.to_datetime(MultistartDate[item])
                }
            }

            cursor = voltage_data_collection.find(
                filter=filter, projection={'n': 1}).distinct('n')

            data = list(cursor)

            if item == 0:
                final_data = data

            else:
                final_data = list(set(final_data) & set(data))

        final_data = list(dict.fromkeys(final_data))
        return jsonify(final_data)
    
    if type=="Lines":

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
    

    if type=="ICT":

        Type= MultistartDate[1]

        if Type == "Date":

            for item in range(len(MultistartDate[0])):
                filter = {
                    'd': {
                        '$gte': pd.to_datetime(MultistartDate[0][item]),
                        '$lte': pd.to_datetime(MultistartDate[0][item])
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

            for item in range(len(MultistartDate[0])):

                startDateObj = datetime.strptime(MultistartDate[0][item], "%Y-%m-%d")
                endDateObj = pd.Timestamp(MultistartDate[0][item]) + MonthEnd(1)

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


    if type=="Frequency":

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

    if type=="LinesMWMVAR":

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

    if type=="Demand":

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
    
    if type=="Generator":

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
    
    if type=="ISGS":

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