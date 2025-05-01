from cmath import nan
import pandas as pd
import os
from pymongo import MongoClient, ASCENDING, DESCENDING, errors
from datetime import date, timedelta, datetime, timezone
from flask import Flask, jsonify, request, redirect, Response, send_file
from flask_cors import CORS
import json
import math

from flask_cors import CORS, cross_origin
from flask import send_from_directory
from pandas.tseries.offsets import MonthEnd
import numpy as np
import pandas as pd
import urllib.request
import datetime
import xmltodict, json
from datetime import date, timedelta, datetime
import requests
from io import StringIO


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



def Voltage(startDateObj,endDateObj,PATH):


    def getDf220P1(file, for_date):
        
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

        df = pd.read_excel(file, sheet_name='Data', header=[
                           2, 3]).drop(columns=['Station'], level=0)
        df = df.loc[:, (slice(None), ('Bus-1 Voltage (kV)',
                        'Bus-2 Voltage (kV)'))][1:]
        df.index = pd.date_range(
            for_date, for_date + timedelta(days=1), freq='1T')[:-1]
        if len(df) != 1440:
            print("VoltageFileInsert Length Mismatch")
        return df




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

            print("Voltage File reading Problem")
            continue

    return jsonify(res)



def Frequency(startDateObj,endDateObj,PATH):

    def insertFlowDfIntoDB(df, for_date):

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
            print("Successfully inserted Frequency Files", for_date)

        except errors.DuplicateKeyError:
            print("Frequency File Insert problem in Database ")

        return 'res'


    op = []
    for for_date1 in pd.date_range(date(startDateObj.year, startDateObj.month, startDateObj.day), date(endDateObj.year, endDateObj.month, endDateObj.day)):

        try:
            FILE = PATH+"BUS_FREQUENCY_220KV_and_ABOVE_{}.xlsx".format(
                for_date1.strftime("%d%m%Y"))

            df = pd.read_excel(FILE, sheet_name='Sheet1')
            df = df.drop(0)
            df = df.drop(columns=['Date'], axis=1)
            df.index = pd.date_range(
                for_date1, for_date1 + timedelta(days=1), freq='1T')[:-1]

            insertFlowDfIntoDB(df, for_date1)

            op.append(for_date1)

        except:
            print('Frequency File read problem', for_date1)

    return jsonify(op)


def Lines(startDateObj,endDateObj,PATH):

    LinesMVARFileInsert(startDateObj,endDateObj,PATH)

    def insertFlowDfIntoDB(df, df1, df2, df3, for_date):

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
                print("Successfully inserted Lines data P1 for ", for_date)
            except:
                print("Lines Database file insert problem P1")
                pass
            try:
                res1 = line_mw_data_collection1.insert_many(doc_list1)
                print("Successfully inserted Voltage data P2 for ", for_date)
            except:
                print("Lines Database file insert problem P2")
                pass

            try:
                res2 = line_mw_data_collection2.insert_many(doc_list2)
                print("Successfully inserted Voltage data 400 KV for ", for_date)
            except:
                print("Lines Database file insert problem 400 kV")
                pass
            try:

                res3 = line_mw_data_collection2.insert_many(doc_list3)
                print("Successfully inserted Voltage data 765 KV for ", for_date)
            except:
                print("Lines Database file insert problem 765 kV")
                pass

        except errors.DuplicateKeyError:
            print("LinesFileInsert couldn't insert ")

        return 'res'

    op = []
    for for_date1 in pd.date_range(date(startDateObj.year, startDateObj.month, startDateObj.day), date(endDateObj.year, endDateObj.month, endDateObj.day)):

        try:

            df = ""
            df1 = ""
            df2 = ""
            df3 = ""

            try:

                FILE = PATH+"220_LINES_MW_P1_{}.xlsm".format(
                    for_date1.strftime("%d%m%Y"))
                df = pd.read_excel(FILE, sheet_name='Data', header=[2, 3])
                df = df.drop(columns=['Unnamed: 0_level_0', 'Date'], level=0)
                df = df[17:1440+17]
                df.index = pd.date_range(
                    for_date1, for_date1 + timedelta(days=1), freq='1T')[:-1]
                df.columns = df.columns.map(
                    lambda x: x[0]+": " + x[1] if 'Unnamed' not in x[1] else x[0]+': '+((x[0].split('-'))[0].split(' '))[-1] + ' end')

            except:
                print("P1 Lines file read problem for ", for_date1)
                pass

            try:
                FILE1 = PATH+"220_LINES_MW_P2_{}.xlsm".format(
                    for_date1.strftime("%d%m%Y"))
                df1 = pd.read_excel(FILE1, sheet_name='Data', header=[2, 3])
                df1 = df1.drop(columns=['Unnamed: 0_level_0', 'Date'], level=0)
                df1 = df1[17:1440+17]
                df1.index = pd.date_range(
                    for_date1, for_date1 + timedelta(days=1), freq='1T')[:-1]
                df1.columns = df1.columns.map(
                    lambda x1: x1[0]+": " + x1[1] if 'Unnamed' not in x1[1] else x1[0]+': '+((x1[0].split('-'))[0].split(' '))[-1] + ' end')

            except:
                print("P2 Lines file read problem for ", for_date1)
                pass

            try:

                FILE2 = PATH+"400_LINES_MW_{}.xlsm".format(
                    for_date1.strftime("%d%m%Y"))

                df2 = pd.read_excel(
                    FILE2, sheet_name='Data', header=[2, 3])[:1440]

                df2 = df2.drop(columns=['Unnamed: 0_level_0', 'Date'], level=0)

                df2.index = pd.date_range(
                    for_date1, for_date1 + timedelta(days=1), freq='1T')[:-1]

                df2.columns = df2.columns.map(
                    lambda x1: x1[0]+": " + x1[1] if 'Unnamed' not in x1[1] else x1[0]+': '+((x1[0].split('-'))[0].split(' '))[-1] + ' end')

            except:
                print("400 KV Lines file xlsm read problem for ", for_date1)
                pass

            try:
                FILE2 = PATH+"400_LINES_MW_{}.xlsx".format(
                    for_date1.strftime("%d%m%Y"))

                df2 = pd.read_excel(
                    FILE2, sheet_name='Data', header=[2, 3])

                df2 = df2.drop(columns=['Unnamed: 0_level_0', 'Date'], level=0)

                df2.index = pd.date_range(
                    for_date1, for_date1 + timedelta(days=1), freq='1T')[:-1]

                df2.columns = df2.columns.map(
                    lambda x1: x1[0]+": " + x1[1] if 'Unnamed' not in x1[1] else x1[0]+': '+((x1[0].split('-'))[0].split(' '))[-1] + ' end')
            except:
                print("400 KV Lines file xlsx read problem for ", for_date1)
                pass

            try:
                FILE3 = PATH+"765_LINES_MW_{}.xlsm".format(
                    for_date1.strftime("%d%m%Y"))

                df3 = pd.read_excel(
                    FILE3, sheet_name='Data', header=[2, 3])[:1440]

                df3 = df3.drop(columns=['Unnamed: 0_level_0', 'Date'], level=0)

                df3.index = pd.date_range(
                    for_date1, for_date1 + timedelta(days=1), freq='1T')[:-1]
                df3.columns = df3.columns.map(
                    lambda x1: x1[0]+": " + x1[1] if 'Unnamed' not in x1[1] else x1[0]+': '+((x1[0].split('-'))[0].split(' '))[-1] + ' end')

            except:
                print("765 KV Lines file xlsm read problem for ", for_date1)
                pass

            try:
                FILE3 = PATH+"765_LINES_MW_{}.xlsx".format(
                    for_date1.strftime("%d%m%Y"))
                df3 = pd.read_excel(
                    FILE3, sheet_name='Data', header=[2, 3])[:1440]

                df3 = df3.drop(columns=['Unnamed: 0_level_0', 'Date'], level=0)

                df3.index = pd.date_range(
                    for_date1, for_date1 + timedelta(days=1), freq='1T')[:-1]
                df3.columns = df3.columns.map(
                    lambda x1: x1[0]+": " + x1[1] if 'Unnamed' not in x1[1] else x1[0]+': '+((x1[0].split('-'))[0].split(' '))[-1] + ' end')

            except:
                print("765 KV Lines file xlsx read problem for ", for_date1)
                pass

            insertFlowDfIntoDB(df, df1, df2, df3, for_date1)

            op.append(for_date1)

        except:
            print('Lines File Insert problem all', for_date1)

    return jsonify(op)



def LinesMVARFileInsert(startDateObj,endDateObj,PATH):

    def insertFlowDfIntoDB(df, df1, df2, df3, for_date):

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
                print("Successfully inserted P1 Lines Files", for_date)
            except:
                print("P1 Lines MVAR File Database problem")
                pass
            try:
                res1 = MVAR_P2.insert_many(doc_list1)
                print("Successfully inserted P2 Lines Files", for_date)
            except:
                print("P2 Lines MVAR File Database problem")
                pass
            try:
                res2 = Lines_MVAR_400_above.insert_many(doc_list2)
                print("Successfully inserted 400 KV Lines Files", for_date)
            except:
                print("400 KV Lines MVAR File Database problem")
                pass
            try:
                res3 = Lines_MVAR_400_above.insert_many(doc_list3)
                print("Successfully inserted 765 KV Lines Files", for_date)
            except:
                print("765 KV Lines MVAR File Database problem")
                pass

        except:
            print("Lines MVAR File Database problem")

        return 'res'



    op = []
    for for_date1 in pd.date_range(date(startDateObj.year, startDateObj.month, startDateObj.day), date(endDateObj.year, endDateObj.month, endDateObj.day)):

        try:

            FILE = PATH+"220KV_Lines_MVAR_P1_{}.xlsm".format(
                for_date1.strftime("%d%m%Y"))
            df = pd.read_excel(FILE, sheet_name='Data', header=[2, 3])
            df = df.drop(columns=['Unnamed: 0_level_0', 'Date'], level=0)

            df.index = pd.date_range(
                for_date1, for_date1 + timedelta(days=1), freq='1T')[:-1]
            df.columns = df.columns.map(
                lambda x: x[0]+": " + x[1] if 'Unnamed' not in x[1] else x[0]+': '+((x[0].split('-'))[0].split(' '))[-1] + ' end')

            FILE1 = PATH+"220_LINES_MVAR_P2_{}.xlsm".format(
                for_date1.strftime("%d%m%Y"))
            df1 = pd.read_excel(FILE1, sheet_name='Data', header=[2, 3])
            df1 = df1.drop(columns=['Unnamed: 0_level_0', 'Date'], level=0)

            df1.index = pd.date_range(
                for_date1, for_date1 + timedelta(days=1), freq='1T')[:-1]
            df1.columns = df1.columns.map(
                lambda x1: x1[0]+": " + x1[1] if 'Unnamed' not in x1[1] else x1[0]+': '+((x1[0].split('-'))[0].split(' '))[-1] + ' end')

            FILE2 = PATH+"400_LINES_MVAR_{}.xlsx".format(
                for_date1.strftime("%d%m%Y"))

            df2 = pd.read_excel(FILE2, sheet_name='Data', header=[2, 3])[:1440]

            df2 = df2.drop(columns=['Unnamed: 0_level_0', 'Date'], level=0)

            df2.index = pd.date_range(
                for_date1, for_date1 + timedelta(days=1), freq='1T')[:-1]

            df2.columns = df2.columns.map(
                lambda x: x[0]+": " + x[1] if 'Unnamed' not in x[1] else x[0]+': '+((x[0].split('-'))[0].split(' '))[-1] + ' end')

            FILE3 = PATH+"765_LINES_MVAR_{}.xlsm".format(
                for_date1.strftime("%d%m%Y"))
            df3 = pd.read_excel(FILE3, sheet_name='Data', header=[2, 3])

            df3 = df3.drop(columns=['Unnamed: 0_level_0', 'Date'], level=0)

            df3.index = pd.date_range(
                for_date1, for_date1 + timedelta(days=1), freq='1T')[:-1]
            df3.columns = df3.columns.map(
                lambda x1: x1[0]+": " + x1[1] if 'Unnamed' not in x1[1] else x1[0]+': '+((x1[0].split('-'))[0].split(' '))[-1] + ' end')

            insertFlowDfIntoDB(
                df, df1, df2, df3, for_date1)

            op.append(for_date1)

        except:
            print('Lines MVAR File read problem for ', for_date1)
    return jsonify(op)


def ICT(startDateObj,endDateObj,PATH):

    def ICTFileInsertMW_132_220(startDateObj,endDateObj,PATH):


        for for_date1 in pd.date_range(date(startDateObj.year, startDateObj.month, startDateObj.day), date(endDateObj.year, endDateObj.month, endDateObj.day)):
            try:
                FILE = PATH+"220_132_ICT_MW_{}.xlsx".format(
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
            
            except:
                pass

    def ICTFileInsertMW(startDateObj,endDateObj,PATH):

        def insertFlowDfIntoDB(df, for_date):

            data_list1 = []

            for item in df:

                try:
                    name = item.name
                    data = (item.to_list())

                    if data[0] != data[0] and data[-1] != data[-1]:
                        data = [0]*1440

                    if (len(data) != 1440):
                        print("Error", len(data))
                        raise Exception("Error")

                    a = {
                        "p": data,
                        "d": pd.to_datetime(for_date),
                        "ym": for_date.strftime("%Y%m"),
                        "n": name}

                    try:

                        res = ICT_data2.insert_one(a)

                    except errors.DuplicateKeyError as e:
                        print('ICT File Insert for MW problem in DB', for_date)
                        continue

                    except:

                        continue

                except:
                    continue

            return 'res'


        op = []
        for for_date1 in pd.date_range(date(startDateObj.year, startDateObj.month, startDateObj.day), date(endDateObj.year, endDateObj.month, endDateObj.day)):

            try:

                FILE = PATH+"765_400_400_220_ICT_MW_{}.xlsx".format(
                    for_date1.strftime("%d%m%Y"))

                df = pd.read_excel(FILE, sheet_name='Sheet1', header=[3, 4])[:1441]

                df = df.drop(columns=['Unnamed: 0_level_0'], level=0)

                

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

                insertFlowDfIntoDB(data_list, for_date1)

                op.append(for_date1)

            except:
                print('ICT File Insert for MW not found', for_date1)
        return jsonify(op)

    def insertFlowDfIntoDB(df, for_date):

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
            res = ICT_data1.insert_many(data_list1)
            print("Successfully inserted ICT Files (MVAR)", for_date)

        except:
            print("ICT File (MVAR) Insert problem in Database ", for_date)

        return 'res'

    
    ICTFileInsertMW(startDateObj,endDateObj,PATH)
    ICTFileInsertMW_132_220(startDateObj,endDateObj,PATH)
    

    op = []
    for for_date1 in pd.date_range(date(startDateObj.year, startDateObj.month, startDateObj.day), date(endDateObj.year, endDateObj.month, endDateObj.day)):

        try:

            FILE = PATH+"765_400_400_220_ICT_MVAR_{}.xlsx".format(
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





def Demand(startDateObj,endDateObj,PATH):

    def insertFlowDfIntoDB(df, df1, for_date):

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
                print("Successfully inserted Demand drawal Files", for_date)

            except:
                print("Demand drawal Files insert problem in Database", for_date)
                pass

            try:
                res = demand_collection.insert_many(doc_list)
                print("Successfully inserted Demand rest Files", for_date)

            except:
                print("Demand rest Files insert problem in Database", for_date)
                pass

        except:
            print("Demand File insert problem in Database")

        return 'res'


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

            insertFlowDfIntoDB(df, df1, for_date1)

            op.append(for_date1)

        except:
            print('DemandFileInsert', for_date1)

    return jsonify(op)



def Generator(startDateObj,endDateObj,PATH):

    def insertFlowDfIntoDB(df, for_date):

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
            print("Successfully inserted Generator Data for ", for_date)
        except:

            print("Generator Files insert problem in Database", for_date)

        return 'res'


    op = []
    for for_date1 in pd.date_range(date(startDateObj.year, startDateObj.month, startDateObj.day), date(endDateObj.year, endDateObj.month, endDateObj.day)):

        try:
            FILE = PATH+"ER_Generator_MW_MVAR_Exchange_data_{}.xlsm".format(
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

            insertFlowDfIntoDB(df, for_date1)

            op.append(for_date1)

        except:
            print('Generator File read problem', for_date1)

    return jsonify(op)




def ISGS(startDateObj,endDateObj,PATH):
    

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
            print("Successfully inserted ISGS Data for ", for_date)
        except:

            print("ISGS Files insert problem in Database", for_date)

        return 'res'


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