from cmath import nan
from unicodedata import name
# from matplotlib import projections
# from matplotlib.pyplot import table
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
# from urllib.parse import urlparse
# from urllib.parse import parse_qs
from flask_cors import CORS, cross_origin
from flask import send_from_directory
from pandas.tseries.offsets import MonthEnd
import numpy as np
import requests
import xmltodict
import urllib
import ssl

# ctx = ssl.create_default_context(ssl.Purpose.SERVER_AUTH)
# ctx.options |= 0x4  # OP_LEGACY_SERVER_CONNECT

def my_max_min_function(somelist):

    max_value = max(somelist)
    min_value = min(somelist)
    avg_value = 0 if len(somelist) == 0 else sum(somelist)/len(somelist)

    max_index = [i for i, val in enumerate(somelist) if val == max_value]
    min_index = [i for i, val in enumerate(somelist) if val == min_value]

    avg_value = avg_value
    max_value = max_value
    min_value = min_value

    max_index.insert(0, max_value)
    min_index.insert(0, min_value)

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


def isFloat(value):
    try:
        float(value)
        return True
    except ValueError:
        return False


def isNaN(num):
    return num != num


def changeToFloat(x):
    if (isFloat(x)):
        return float(x)
    else:
        return None


def convert_to_datetime(date_string):
  return datetime.strptime(date_string, '%d/%m/%Y')


def ExRlogin():
    try:
        resp = requests.post(
            "https://ebook.erldc.in:55001/api/Account/Login",
            data={"Username": "dm", "Password": "123456"},
        )
        token = json.loads(resp.text)["token"]
        headers = {
            "Authorization": "Bearer " + token,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36",
            "Accept": "*/*",
        }

    except Exception as e:
        return {"status": str(e)}
    return headers




# /////////////////////////////////////////////////////////dashboard////////////////////////////////


# def MISCollection():

#     CONNECTION_STRING = "mongodb://mongodb0.erldc.in:27017,mongodb1.erldc.in:27017/?replicaSet=CONSERV"
#     client = MongoClient(CONNECTION_STRING)
#     db = client['mis']
#     frequency_data_Table = db['frequency_data']
#     voltage_data_table = db['voltage_data']

#     return frequency_data_Table, voltage_data_table


# frequency_data_Table, voltage_data_table = MISCollection()


# /////////////////////////////////////////////frequency///////////////////////////////////////////////////

def FrequencyReport(date_val):
    headers = ExRlogin()

    date_val = date_val.split(",")

    if (date_val[0] == date_val[1]):
        date_val = [datetime.strptime(date_val[0], "%d-%m-%Y")]

    else:
        for i in range(len(date_val)):
            date_val[i] = datetime.strptime(date_val[i], "%d-%m-%Y")

    data_to_send = []

    date_val = [date_val[0]+timedelta(days=x)
                for x in range((date_val[-1]-date_val[0]).days+1)]

    Maximums = []
    Minimums = []
    Average = []
    v1 = []
    v2 = []
    v3 = []
    v4 = []
    v5 = []

    for item in date_val:

        item = item.strftime("%d-%m-%Y")

        res1 = requests.get(
            'https://report.erldc.in/posoco_api/api/PSP/GetPSPFrequencyProfileByDate/'+item)
        response1 = json.loads(res1.text)

        res2 = requests.get(
            'https://report.erldc.in/posoco_api/api/PSP/GetPSPFrequencyProfileMaxMinByDate/'+item)
        response2 = json.loads(res2.text)

        freq_dict = {
            'Date_Val': item,
            '49.9': [response1[0]['FREQ4_VALUE'],response1[0]['FREQ4_VALUE']+response1[0]['FREQ7_VALUE']+response1[0]['FREQ5_VALUE']],
            '50.05': [response1[0]['FREQ7_VALUE'],response1[0]['FREQ4_VALUE']+response1[0]['FREQ7_VALUE']+response1[0]['FREQ5_VALUE']],
            'Band': [response1[0]['FREQ5_VALUE'],response1[0]['FREQ4_VALUE']+response1[0]['FREQ7_VALUE']+response1[0]['FREQ5_VALUE']],
            'FDI_Time': round(100-float(response1[0]['FREQ5_VALUE']), 2),
            'FDI_Hour': round((24*((100-float(response1[0]['FREQ5_VALUE']))))/100, 2),
            'Max': response2[0]['MAX_FREQ'],
            'Max_Time': response2[0]['MAX_TIME'],
            'Min': response2[0]['MIN_FREQ'],
            'Min_Time': response2[0]['MIN_TIME'],
            'Avg': format(response2[0]['AVERAGE_FREQUENCY'],".2f"),
            
        }

        data_to_send.append(freq_dict)

        Maximums.append(response2[0]['MAX_FREQ'])
        Minimums.append(response2[0]['MIN_FREQ'])
        Average.append(response2[0]['AVERAGE_FREQUENCY'])
        v1.append(round(100-float(response1[0]['FREQ5_VALUE']), 2))
        v2.append(
            round((24*((100-float(response1[0]['FREQ5_VALUE']))))/100, 2))
        v3.append(response1[0]['FREQ4_VALUE'])
        v4.append(response1[0]['FREQ5_VALUE'])
        v5.append(response1[0]['FREQ7_VALUE'])

    

    max_min_val = {
        'Max_f': max(Maximums),
        'Min_f': min(Minimums),
        'Avg_f': round(sum(Average)/len(Average), 2),
        'v1': round(sum(v1)/len(v1), 2),
        'v2': round(sum(v2), 2),
        'v3': round(sum(v3)/len(v3), 2),
        'v4': round(sum(v4)/len(v4), 2),
        'v5': round(sum(v5)/len(v5), 2),
    }

    return jsonify(["frequency", data_to_send, [max_min_val]])

# /////////////////////////////////////////////////////////voltage////////////////////////////////
def VoltageReport(date_val):

    headers = ExRlogin()

    date_val = date_val.split(",")

    if (date_val[0] == date_val[1]):
        date_val = [datetime.strptime(date_val[0], "%d-%m-%Y")]

    else:
        for i in range(len(date_val)):
            date_val[i] = datetime.strptime(date_val[i], "%d-%m-%Y")

    

    date_val = [date_val[0]+timedelta(days=x)
                for x in range((date_val[-1]-date_val[0]).days+1)]

    

    val_dict = {
        "v1": [],
        "v2": [],
        "v3": [],
        "v4": [],
        "v5": [],
        "v6": [],
        "v7": [],
        "v8": [],
        "v9": [],
        "v10": [],
        "v11": [],
        "v12": [],
        "v13": [],
        "v14": [],
        "v15": [],
        "v16": [],
        "v17": [],
        "v18": [],
        "v19": [],
        "v20": [],
        "v21": [],
        "v22": []
    }

    x = 0

    for item in date_val:

        item = item.strftime("%d-%m-%Y")

        res1 = requests.get(
            'https://report.erldc.in/posoco_api/api/PSP/GetPSPVoltageProfile_400kvByDate/'+item)
        response1 = json.loads(res1.text)

        try:
            response1 = sorted(response1, key=lambda x: x['STATION_NAME'])

        except:
            pass

        res2 = requests.get(
            'https://report.erldc.in/posoco_api/api/PSP/GetPSPVoltageProfile_765kvByDate/'+item)
        response2 = json.loads(res2.text)

        response2 = sorted(response2, key=lambda x: x['STATION_NAME'])

        if x == 0:

            x += 1

            for i in range(len(response1)):
                four_dict = {
                    "Date_Val": item,
                    "Name": response1[i]['STATION_NAME'],
                    "Max": [response1[i]['max_voltage'],response1[i]['max_voltage']==response1[i]['min_voltage']],
                    "Min": [response1[i]['min_voltage'],response1[i]['max_voltage']==response1[i]['min_voltage']],
                    "VDI": round(float(response1[i]['volt1_value'])+float(response1[i]['volt3_value']), 2)
                }

                val_dict["v"+str(i+1)].append(four_dict)

            for j in range(len(response2)):
                seven_dict = {
                    "Date_Val": item,
                    "Name": response2[j]['STATION_NAME'],
                    "Max": [response2[j]['max_voltage'],response2[j]['max_voltage']==response2[j]['min_voltage']],
                    "Min": [response2[j]['min_voltage'],response2[j]['max_voltage']==response2[j]['min_voltage']],
                    "VDI": round(float(response2[j]['volt1_value'])+float(response2[j]['volt3_value']), 2)
                }

                val_dict["v"+str(j+16)].append(seven_dict)

        else:
            for a in range(15):

                for i in range(len(response1)):

                    if val_dict["v"+str(a+1)][0]["Name"] == response1[i]['STATION_NAME']:

                        four_dict = {
                            "Date_Val": item,
                            "Name": response1[i]['STATION_NAME'],
                            "Max": [response1[i]['max_voltage'],response1[i]['max_voltage']==response1[i]['min_voltage']],
                            "Min": [response1[i]['min_voltage'],response1[i]['max_voltage']==response1[i]['min_voltage']],
                            "VDI": round(float(response1[i]['volt1_value'])+float(response1[i]['volt3_value']), 2)
                        }

                        val_dict["v"+str(a+1)].append(four_dict)

                        break

            for b in range(7):

                for j in range(len(response2)):

                    if val_dict["v"+str(b+16)][0]["Name"] == response2[j]['STATION_NAME']:

                        seven_dict = {
                            "Date_Val": item,
                            "Name": response2[j]['STATION_NAME'],
                            "Max": [response2[j]['max_voltage'],response2[j]['max_voltage']==response2[j]['min_voltage']],
                            "Min": [response2[j]['min_voltage'],response2[j]['max_voltage']==response2[j]['min_voltage']],
                            "VDI": round(float(response2[j]['volt1_value'])+float(response2[j]['volt3_value']), 2)
                        }

                        val_dict["v"+str(b+16)].append(seven_dict)

                        break

    for vn in range(7):

        variable= 'v'+str(vn*3+1)
        variable1= 'v'+str(vn*3+2)
        variable2= 'v'+str(vn*3+3)
    
        for x in range(len(val_dict[variable])):
            val_dict[variable][x]['Name1']=val_dict[variable1][x]['Name']
            val_dict[variable][x]['Max1']=val_dict[variable1][x]['Max']
            val_dict[variable][x]['Min1']=val_dict[variable1][x]['Min']
            val_dict[variable][x]['VDI1']=val_dict[variable1][x]['VDI']

            val_dict[variable][x]['Name2']=val_dict[variable2][x]['Name']
            val_dict[variable][x]['Max2']=val_dict[variable2][x]['Max']
            val_dict[variable][x]['Min2']=val_dict[variable2][x]['Min']
            val_dict[variable][x]['VDI2']=val_dict[variable2][x]['VDI']

    data_to_send ={
        'v1': val_dict['v1'],
        'v2': val_dict['v4'],
        'v3': val_dict['v7'],
        'v4': val_dict['v10'],
        'v5': val_dict['v13'],
        'v6': val_dict['v16'],
        'v7': val_dict['v19'],
        'v8': val_dict['v22'],
    }
        

    return jsonify(["Voltage", data_to_send])

# /////////////////////////////////////////////////////////Generator////////////////////////////////

def GeneratorBreakdownReport(date_val):

    headers = ExRlogin()

    date_val = date_val.split(",")

    start_date_val = date_val[0]

    start_date_val = start_date_val.replace("-", "/")

    start_date_val = datetime.strptime(start_date_val, "%d/%m/%Y")

    end_date_val = date_val[-1]

    end_date_val = end_date_val.replace("-", "/")

    end_date_val = datetime.strptime(end_date_val, "%d/%m/%Y")

    gen_map={"ADHUNIK ":"APNRL",
        "CHUKHA":"BHUTAN",
        "DAGACHU":"BHUTAN",
        "KURICHU HPC ":"BHUTAN",
        "MANGDECHHU":"BHUTAN",
        "TALA":"BHUTAN",
        "MUZAFFARPUR TPS ":"BSPHCL",
        "BUDGE-BUDGE":"CESC",
        "SOUTHERN":"CESC",
        "TITAGARH":"CESC",
        "HALDIA ENERGY LTD":"CESC, HEL",
        "JORETHANG":"DANS",
        "TASHIDING":"DANS",
        "BOKARO-A' ":"DVC",
        "BOKARO'B' ":"DVC",
        "CHANDRAPURA TPS ":"DVC",
        "DSTPS":"DVC",
        "KODERMA ":"DVC",
        "MAITHON HPS ":"DVC",
        "MEJIA TPS":"DVC",
        "PANCHET HPS ":"DVC",
        "RTPS":"DVC",
        "TILAIYA HPS ":"DVC",
        "WARIA TPS":"DVC",
        "CHUZACHEN":"GATI",
        "GMR":"GMR-Infra",
        "GMR 3":"GMR-Infra",
        "HEL HIRANMAYEE":"HEL",
        "IBEUL ":"IBEUL",
        "JITPL ":"JITPL",
        "PATRATU TPS ":"JUUNL",
        "SUBARNREKHA HPS ":"JUUNL",
        "Rongnichu":"MBPGCL",
        "MPL":"MPL",
        "RANGIT HPS ":"NHPC",
        "TEESTA HPS ":"NHPC",
        "BARAUNI TPS ":"NTPC",
        "BARH":"NTPC",
        "DARLIPALI":"NTPC",
        "FSTPP":"NTPC",
        "KHSTPP":"NTPC",
        "NABINAGAR(BRBCL)":"NTPC",
        "NABINAGAR(NPGC)":"NTPC",
        "NORTH KARANPURA":"NTPC",
        "Talcher_Solar":"NTPC",
        "TSTPP":"NTPC",
        "TTPS":"NTPC",
        "KBUNL":"NTPC, BSPHCL",
        "BALIMELA HPS ":"OHPC",
        "BURLA HPS/HIRAKUD I ":"OHPC",
        "CHIPLIMA HPS / HIRAKUD II ":"OHPC",
        "INDRAVATI ":"OHPC",
        "MACHKUND":"OHPC",
        "MEENAKSHI POWER LTD":"OHPC",
        "RENGALI HPS ":"OHPC",
        "U.KOLAB ":"OHPC",
        "IB.TPS ":"OPGC",
        "JSL":"OPGC",
        "OPGC":"OPGC",
        "OPGC3":"OPGC",
        "Sterlite":"SEL",
        "VEDANTA":"SEL",
        "DIKCHU Hep":"SKPPL",
        "TEESTA STG III Hep":"TUL",
        "TENUGHAT ":"TVNL",
        "BAKRESHWAR":"WBPDCL",
        "BANDEL TPS":"WBPDCL",
        "DPL":"WBPDCL",
        "JALDHAKA HPS":"WBPDCL",
        "KOLAGHAT":"WBPDCL",
        "PURULIA PSP(G)":"WBPDCL",
        "PURULIA PSP(P)":"WBPDCL",
        "RAMAM":"WBPDCL",
        "SAGARDIGHI":"WBPDCL",
        "SANTALDIH TPS":"WBPDCL",
        "TISTA CANAL":"WBPDCL",
        "TLDP":"WBPDCL"
    }
    gen_list= list(gen_map.keys())

    current_date_object = datetime.now()
    current_date = current_date_object.strftime("%d-%m-%Y")

    # # target_datetime_object = datetime.strptime(target_datetime, '%d-%m-%Y %H:%M')
    # target_datetime_object = current_date_object

    LOGBOOK_URL = "https://ebook.erldc.in:55001/api/GeneratorOutage/GetGeneratorOutageReport?date="+current_date

    r = requests.get(LOGBOOK_URL)

    outage_data = json.loads(r.text)

    units_api = "https://mdp.erldc.in/testoutage_api/api/ELogBookRequests/ElementsByEnity/8"
    units_api_res = requests.get(units_api).json()

    Data_to_send = []

    for item in outage_data:

        if item["OUTAGE_DATE"] is not None:

            outage_date = datetime.strptime(item["OUTAGE_DATE"], "%d/%m/%Y")

            if item["REVIVAL_DATE"] is not None:

                restore_date = datetime.strptime(
                    item["REVIVAL_DATE"], "%d/%m/%Y")

                if (start_date_val <= outage_date <= end_date_val) or (start_date_val <= restore_date <= end_date_val):

                    capacity = "660"
                    owner= ""
                    for nam in units_api_res:
                        # print(nam['Name'],item['ELEMENT_NAME'])
                        if nam['Name'] == item['ELEMENT_NAME']:
                            capacity = nam['Capacity']  
                            break

                    for it in gen_list:
                        
                        if item['ELEMENT_NAME'].lower().find(it.lower()) != -1:
                            owner= gen_map[it]
                            break

                    send_dict = {
                        "Name": item['ELEMENT_NAME'].split("UNIT")[0][:-2],
                        "Unit_Number": (item['ELEMENT_NAME'].split("-")[-1]).split(" ")[-1],
                        "OUTAGE_DATE": item['OUTAGE_DATE'],
                        "OUTAGE_TIME": item['OUTAGE_TIME'],
                        "REVIVAL_DATE": item['REVIVAL_DATE'],
                        "REVIVAL_TIME": item['REVIVAL_TIME'],
                        "OUT_REASON": item['OUT_REASON'],
                        "INSTALLED_CAPACITY": capacity,
                        "Owner": owner,
                    }

                    Data_to_send.append(send_dict)

            else:
                if (start_date_val <= outage_date <= end_date_val):

                    capacity = "660"
                    owner= ""
                    for nam in units_api_res:

                        if nam['Name'] == item['ELEMENT_NAME']:
                            capacity = nam['Capacity']
                            break

                    for it in gen_list:
                        
                        if item['ELEMENT_NAME'].lower().find(it.lower()) != -1:
                            owner= gen_map[it]
                            break

                    send_dict = {
                        "Name": item['ELEMENT_NAME'].split("-")[0],
                        "Unit_Number": (item['ELEMENT_NAME'].split("-")[-1]).split(" ")[-1],
                        "OUTAGE_DATE": item['OUTAGE_DATE'],
                        "OUTAGE_TIME": item['OUTAGE_TIME'],
                        "REVIVAL_DATE": "",
                        "REVIVAL_TIME": "",
                        "OUT_REASON": item['OUT_REASON'],
                        "INSTALLED_CAPACITY": capacity,
                        "Owner": owner,
                    }

                    Data_to_send.append(send_dict)

    if len(Data_to_send) > 0:

        for i in range(len(Data_to_send)):

            Data_to_send[i]["SNo"] = i+1

    return jsonify(["GeneratorBreakdown", Data_to_send])


# /////////////////////////////////////////////////////////transmission////////////////////////////////


def LineTrippingReport(date_val):

    headers = ExRlogin()

    date_val = date_val.split(",")

    start_date_val = date_val[0]

    start_date_val = start_date_val.replace("-", "/")

    start_date_val = datetime.strptime(start_date_val, "%d/%m/%Y")

    end_date_val = date_val[-1]

    end_date_val = end_date_val.replace("-", "/")

    end_date_val = datetime.strptime(end_date_val, "%d/%m/%Y")

    if (date_val[0] == date_val[1]):
        date_val = [datetime.strptime(date_val[0], "%d-%m-%Y")]

    else:
        for i in range(len(date_val)):
            date_val[i] = datetime.strptime(date_val[i], "%d-%m-%Y")

    date_val = [date_val[0]+timedelta(days=x)
                for x in range((date_val[-1]-date_val[0]).days+1)]

    start_date = date_val[0]
    end_date = date_val[-1]

    current_date = start_date
    dates_list = []

    while current_date <= end_date:
        dates_list.append(current_date)
        # Move to the first day of the next month
        current_date = (current_date.replace(day=1) +
                        timedelta(days=32)).replace(day=1)

    data_to_send = []

    for dates in dates_list:
        TRIPPING_URL = "https://ebook.erldc.in:55001/api/HistoricElements/Tripping?month=" + \
            str(f'{dates.month:02d}')+"/"+str(dates.year)
        # print(TRIPPING_URL)
        resp = requests.get(
            TRIPPING_URL,
            headers=headers,
            verify=False
        )
        resp = json.loads(resp.text)
        
        for item in resp:
            
            if item["TripDate"] is not None and item["RevivalDate"] is not None:

                Trip_date = datetime.strptime(item["TripDate"], "%d/%m/%Y")
                RevivalDate = datetime.strptime(item["RevivalDate"], "%d/%m/%Y")

                if ((start_date_val <= Trip_date <= end_date_val) or (start_date_val <= RevivalDate <= end_date_val)) and (item['Type'] == 9 or item['Type'] == 14):
                    temp_dict = {
                        'Name': item['Name'],
                        'TripDate': item['TripDate'],
                        'TripTime': item['TripTime'],
                        'RevivalDate': item['RevivalDate'],
                        'RevivalTime': item['RevivalTime'],
                        'Reason': item['EndRelayReasonOne']
                    }
                    data_to_send.append(temp_dict)

            elif item["TripDate"] is not None:

                Trip_date = datetime.strptime(item["TripDate"], "%d/%m/%Y")

                if (start_date_val <= Trip_date <= end_date_val) and (item['Type'] == 9 or item['Type'] == 14):

                    temp_dict = {
                        'Name': item['Name'],
                        'TripDate': item['TripDate'],
                        'TripTime': item['TripTime'],
                        'RevivalDate': "",
                        'RevivalTime': "",
                        'Reason': item['EndRelayReasonOne']
                    }
                    data_to_send.append(temp_dict)

    data_to_send = sorted(data_to_send, key=lambda x: convert_to_datetime(x['TripDate']))

    if len(data_to_send) > 0:
        for i in range(len(data_to_send)):

            data_to_send[i]["SNo"] = i+1

    return jsonify(["LineTrippingReport", data_to_send])

# /////////////////////////////////////////////////////////elements////////////////////////////////

def ElementBreakdownReport(date_val):

    headers = ExRlogin()

    date_val = date_val.split(",")
    date_val = date_val[-1]

    date_val = date_val.replace("-", "/")

    date_val = datetime.strptime(date_val, "%d/%m/%Y")

    # if (date_val[0] == date_val[1]):
    #     date_val = [datetime.strptime(date_val[0], "%d-%m-%Y")]

    # else:
    #     for i in range(len(date_val)):
    #         date_val[i] = datetime.strptime(date_val[i], "%d-%m-%Y")

    # data_to_send = []

    # date_val = [date_val[0]+timedelta(days=x)
    #             for x in range((date_val[-1]-date_val[0]).days+1)]

    LOGIN_URL = "https://ebook.erldc.in:55001/api/Account/Login"
    ALL_ELEMENTS_DATA_URL = "https://ebook.erldc.in:55001/api/Master/Get/AllElementsData"

    # Login into logbook using userid and password to get the authentication token
    resp = requests.post(
        LOGIN_URL,
        data={"Username": "dm", "Password": "123456"},
    )
    token = json.loads(resp.text)["token"]

    # prepare headers from the authentication token to be used in subsequent api calls
    headers = {
        "Authorization": "Bearer " + token,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36",
        "Accept": "*/*",
    }

    logbook_url = "https://ebook.erldc.in:55001/api/Dashboard/Get"

    mapping_url = "https://ebook.erldc.in:55001/api/Master/Get/CommonMasterData"

    logbook_data = requests.get(
        logbook_url,
        headers=headers,
        verify=False
    )

    logbook_data = json.loads(logbook_data.text)

    mapping_data = requests.get(
        mapping_url,
        headers=headers,
        verify=False
    )
    mapping_resp = json.loads(mapping_data.text)

    outage_data = logbook_data["OutageElements"]
    tripping_data = logbook_data["TrippingElements"]
    shutdown_data = logbook_data["ShutdownElements"]
    constituent_data = mapping_resp["constituents"]

    Data_to_send = []

    const_name = "Name not found"

    for item in outage_data:
        for const in constituent_data:
            if (int(const["Id"]) == int(item["Constituent"])):
                const_name = const["Name"]
                break

        if item["LogDate"] is not None:

            item_date = datetime.strptime(item["LogDate"], "%d/%m/%Y")

            if (item["Type"] == 9 or item["Type"] == 14) and date_val >= item_date:
                t_d = {
                    "Name": item["Name"],
                    "OutDate": item["LogDate"],
                    "Contituent": const_name,
                    "Reason": item["Reason"],

                }
                Data_to_send.append(t_d)

    for item in tripping_data:

        if item["TripDate"] is not None:

            item_date = datetime.strptime(item["TripDate"], "%d/%m/%Y")

            if (item["Type"] == 9 or item["Type"] == 14) and date_val >= item_date:
                t_d = {
                    "Name": item["Name"],
                    "OutDate": item["TripDate"],
                    "Contituent": "",
                    "Reason": item["EndRelayReasonOne"],

                }
                Data_to_send.append(t_d)

    const_name = "Name not found"

    for item in shutdown_data:
        for const in constituent_data:
            if (int(const["Id"]) == int(item["EntityId"])):
                const_name = const["Name"]
                break

        if item["ActualOutageDate"] is not None:

            item_date = datetime.strptime(item["ActualOutageDate"], "%d/%m/%Y")

            if date_val >= item_date:
                t_d = {
                    "Name": item["ElementName"],
                    "OutDate": item["ActualOutageDate"],
                    "Contituent": const_name,
                    "Reason": item["Reason"],
                }
                Data_to_send.append(t_d)

    Data_to_send = sorted(Data_to_send, key=lambda x: convert_to_datetime(x['OutDate']))

    if len(Data_to_send) > 0:

        for i in range(len(Data_to_send)):

            Data_to_send[i]["SNo"] = i+1

    return jsonify(["ElementBreakdown", Data_to_send])


def NC_IEGC_Report(date_val):

    headers = ExRlogin()

    date_val = date_val.split(",")
    start_date = date_val[0]
    end_date = date_val[-1]

    start_date = start_date.replace("-", "/")
    start_date = datetime.strptime(start_date, "%d/%m/%Y")
    start_date = start_date.strftime("%d/%m/%Y")

    end_date = end_date.replace("-", "/")
    end_date = datetime.strptime(end_date, "%d/%m/%Y")
    end_date = end_date.strftime("%d/%m/%Y")

    resp = requests.get(
        "https://ebook.erldc.in:55001/api/Reports/ViolationMessage?startDate="+start_date+"&endDate="+end_date,
        headers=headers,
        verify=False
    )
    resp = json.loads(resp.text)

    unique_values = set()

    for obj in resp:
        unique_values.add(obj['Constituent'])

    unique_values= list(unique_values)

    data_to_send=[]
    fixed_fields=['DVC','GRIDCO','BSPTCL','WBSETCL','SIKKIM','JUSNL']
    fixed_fields_remove=['DVC','GRIDCO','BSPTCL','WBSETCL','SIKKIM','JUSNL']

    # state_map={
    #     'DVC':'दा.घा.नि. / DVC',
    #     'GRIDCO':'ओडिशा / ODISHA',
    #     'BSPTCL':'बिहार / BIHAR',
    #     'WBSETCL':'पश्चिम बंगाल/WEST BENGAL',
    #     'SIKKIM':'सिक्किम / SIKKIM',
    #     'JUSNL':'झारखंड / JHARKHAND',
    # }

    state_map={
        "ER-I":"ई.आर-I / ER-I",
        "DVC":"दा.घा.नि. / DVC",
        "ER-II":"ई.आर-II / ER-II",
        "GRIDCO":"ओडिशा / ODISHA",
        "DMTCL":"डी.एम.टी.सी.एल. / DMTCL",
        "BSPTCL":"बिहार / BIHAR",
        "WBSETCL":"पश्चिम बंगाल / WEST BENGAL",
        "SIKKIM":"सिक्किम / SIKKIM",
        "NLDC":"एन.एल.डी.सी. / NLDC",
        "NRLDC":"एन.आर.एल.डी.सी. / NRLDC",
        "NERLDC":"एन.ई.आर.एल.डी.सी. / NERLDC",
        "WRLDC":"डब्ल्यू.आर.एल.डी.सी. / WRLDC",
        "SRLDC":"एस.आर.एल.डी.सी. / SRLDC",
        "FSTPP":"फरक्का एस.टी.पी.पी. / FARAKKA STPP",
        "KhSTPP":"कहलगांव एस.टी.पी.पी. / KAHALGAON STPP",
        "TSTPP":"तालचेर एस.टी.पी.पी. / TALCHER STPP",
        "BARH":"बाढ़ एस.टी.पी.पी. / BARH STPP",
        "JITPL":"जे.आई.टी.पी.एल. / JITPL",
        "GMR":"जी.एम.आर. / GMR",
        "TEESTA-V":"तीस्ता-V / TEESTA-V",
        "TEESTA-III":"तीस्ता-III / TEESTA-III",
        "RANGIT":"रंगीत / RANGIT",
        "POWERLINK":"पावरलिंक / POWERLINK",
        "ENICL":"ई.एन.आई.सी.एल. / ENICL",
        "CHUZACHEN":"चुज़ाचेन / CHUZACHEN",
        "STERLITE":"स्टरलाइट / STERLITE",
        "MPL":"एम.पी.एल / MPL",
        "IBEUL":"आई.बी.ई.यू.एल. / IBEUL",
        "BRBCL":"बी.आर.बी.सी.एल. / BRBCL",
        "ADHUNIK":"आधुनिक / ADHUNIK",
        "JLHEP":"जोरेथांग एच.ई.पी. / JORETHANG HEP",
        "PKTCL":"पी.के.टी.सी.एल. / PKTCL",
        "TISCO":"टिस्को / TISCO",
        "TVTPL":"टी.वी.टी.पी.एल / TVTPL",
        "CBPTCL":"सी.बी.पी.टी.सी.एल. / CBPTCL",
        "DIKCHU":"दिक्चु / DIKCHU",
        "JUSNL":"झारखंड / JHARKHAND",
        "OGPTL":"ओ.जी.पी.टी.एल. / OGPTL",
        "ER_II":"ताशीडिंग एच.ई.पी. / TASHIDING HEP",
        "TASHIDING":"ओ.पी.जी.सी. / OPGC",
        "OPGC":"अलीपुरद्वार ट्रा लिमिटेड / ALIPURDUAR TR LTD",
        "ALIPURDUAR TR LTD":"एन.पी.जी.सी (नबीनगर) / NPGC (NABINAGAR)",
        "NPGC (NABINAGAR)":"बांग्लादेश / BANGLADESH",
        "BANGLADESH":"भूटान / BHUTAN",
        "BHUTAN":"एम.बी.पी.सी.एल. / MBPCL",
        "MBPCL":"ओडिशा प्रोजेक्ट (पीजी) / Odisha Project(PG)",
        "Odisha Project(PG)":"दर्लिपल्ली एस.टी.पी.पी. / DARLIPALLY STPP",
        "DARLIPALLY":"पी.एम.जे.टी.एल. / PMJTL",
        "PMJTL":"पी.एम.टी.एल. / PMTL",
        "PMTL":"एन.के.टी.एल. / NKTL",
        "NKTL":"नेपाल / Nepal",
        "Nepal":"उत्तरी कर्णपुरा एस.टी.पी.पी. / North Karanpura STPP",
        "NKSTPP":"एन के एस टी पी पी / NKSTPP"
    }


    for stat in unique_values:

        state_dict={
            'Name':'',
            'Alert':0,
            'Emergency':0,
            'NCompliance':0,
            'FV':0,
            'VV':0,
            'LV':0,
        }

        for vals in resp:
            if stat==vals['Constituent']:
                if vals['Constituent'] in fixed_fields:
                    try:
                        fixed_fields_remove.remove(vals['Constituent'])

                    except:
                        pass 
                    
                    state_dict['Name']= state_map[vals['Constituent']]
                    
                else:
                    consti_name=""
                    try:
                        consti_name= state_map[vals['Constituent']]
                    except:
                        consti_name= vals['Constituent']

                    state_dict['Name']= consti_name

                if vals['ViolationType']== "DEVIATION" and vals['SubViolationType']== 'ALERT':
                    state_dict['Alert']= state_dict['Alert']+1

                if vals['ViolationType']== "DEVIATION" and vals['SubViolationType']== 'EMERGENCY':
                    state_dict['Emergency']= state_dict['Emergency']+1

                if vals['ViolationType']== "DEVIATION" and vals['SubViolationType']== 'NON-COMPLIANCE':
                    state_dict['NCompliance']= state_dict['NCompliance']+1
                
                if vals['ViolationType']== 'FREQUENCY VIOLATION':
                    state_dict['FV']= state_dict['FV']+1

                if vals['ViolationType']== 'VOLTAGE VIOLATION':
                    state_dict['VV']= state_dict['VV']+1

                if vals['ViolationType']== 'LOADING VIOLATION':
                    state_dict['LV']= state_dict['LV']+1

        data_to_send.append(state_dict)


    for items in fixed_fields_remove:
        state_dict={
            'Name':state_map[items],
            'Alert':0,
            'Emergency':0,
            'NCompliance':0,
            'FV':0,
            'VV':0,
            'LV':0,
        }
        data_to_send.append(state_dict)

    
    for sno in range(len(data_to_send)):
        data_to_send[sno]['Total']= data_to_send[sno]['Alert']+data_to_send[sno]['Emergency']+data_to_send[sno]['NCompliance']+data_to_send[sno]['FV']+data_to_send[sno]['VV']+data_to_send[sno]['LV']

    data_to_send = sorted(data_to_send, key=lambda x: x['Total'],reverse=True)

    for sno in range(len(data_to_send)):
        data_to_send[sno]['SNo']= sno+1

    return jsonify(["NC_IEGC", data_to_send])



def dc_revision_counter():
    headers = ExRlogin()

    current_datetime = datetime.today()
    first_day_of_month = current_datetime.replace(day=1)

    opener = urllib.request.build_opener()
    opener.addheaders = [('User-agent', 'Mozilla/5.0')]
    urllib.request.install_opener(opener)

    monthly_counter_Downward = pd.DataFrame()
    monthly_counter_Upward = pd.DataFrame()
    monthly_counter_Total = pd.DataFrame()

    for dt in pd.date_range(first_day_of_month, current_datetime):
        date_share = dt.strftime("%m-%d-%Y")
        F_date = dt.strftime("%d-%m-%Y")
        # print(F_date)

        Share_URL = "https://wbes.erldc.in:8080/api/ShareAllocation/Date/{}/region/1/type/1".format(date_share)
        Share_response = urllib.request.urlopen(Share_URL).read()
        # http = urllib3.PoolManager()
        # Share_response = http.request('GET', Share_URL)
        Share_data = json.loads(Share_response.decode())
        seller_list = []
        DC_Dict = {}


        for single in Share_data:
            if single['Seller']['Acronym'] not in seller_list:
                seller_list.append(single['Seller']['Acronym'])
                DC_Dict[single['Seller']['Acronym']] = {}
        # print(seller_list)


        Rev_URL = "https://wbes.erldc.in/Report/GetCurrentDayFullScheduleMaxRev?regionid=1&ScheduleDate={}".format(F_date)

        response = urllib.request.urlopen(Rev_URL).read()
        # http = urllib3.PoolManager()
        # response = http.request('GET', Rev_URL)
        # print(response)

        maxRev = int(json.loads(response.decode())["MaxRevision"])

        with open(f"//10.3.200.155/xml/FullSchedule-({maxRev})-{F_date}.xml", encoding="utf8") as xml_file:
            data_dict = xmltodict.parse(xml_file.read())

            DC_Data = data_dict['FullScheduleScadaDetails']['lstDeclaration']['Declaration']

            for x in DC_Data:
                Gen = x['Seller']['Acronym'] 
                if Gen in DC_Dict.keys():
                    if 'DownwardRevNo' in x.keys():
                        DownRev = int(x['DownwardRevNo'])
                        UpRev = int(x['UpwardRevNo'])
                        DC_Dict[Gen]['upward'] = UpRev
                        DC_Dict[Gen]['downward'] = DownRev
                        DC_Dict[Gen]['Total Rev'] = UpRev + DownRev


        Record_df = pd.DataFrame()
        for gen in DC_Dict.keys():
            temp_df = pd.DataFrame.from_dict([DC_Dict[gen]])
            temp_df['Generator'] = gen
            Record_df = pd.concat([Record_df, temp_df], axis = 0)

        Record_df = Record_df.set_index('Generator')
        
        monthly_counter_Downward[F_date] = Record_df['downward']
        monthly_counter_Upward[F_date] = Record_df['upward']
        monthly_counter_Total[F_date] = Record_df['Total Rev']
        
        # print(monthly_counter_Downward)
    monthly_counter_Downward['Total'] = monthly_counter_Downward.sum(axis=1)
    monthly_counter_Upward['Total'] = monthly_counter_Upward.sum(axis=1)
    monthly_counter_Total['Total'] = monthly_counter_Total.sum(axis=1)
    x=[monthly_counter_Downward,monthly_counter_Upward,monthly_counter_Total]

    g1=list(x[0].index)
    g2=list(x[1].index)
    g3=list(x[2].index)
    c1=list(x[0].columns)
    c2=list(x[1].columns)
    c3=list(x[2].columns)

    o1=[]
    o2=[]
    o3=[]

    for i in range(len(g1)):
        d1= {
            'Generator': g1[i]
        }
        for j in range(len(c1)):
            d1[c1[j]]= list(x[0][c1[j]])[i]

        o1.append(d1)

    for i in range(len(g2)):
        d2= {
            'Generator': g2[i]
        }
        for j in range(len(c1)):
            d2[c2[j]]= list(x[1][c2[j]])[i]

        o2.append(d2)

    for i in range(len(g3)):
        d3= {
            'Generator': g3[i]
        }
        for j in range(len(c1)):
            d3[c3[j]]= list(x[2][c3[j]])[i]

        o3.append(d3)

    c1.insert(0,"Generator")
    c2.insert(0,"Generator")
    c3.insert(0,"Generator")

    return jsonify([o1,o2,o3,c1,c2,c3])