import pandas as pd
import os
from pymongo import MongoClient
from datetime import timedelta, datetime, timezone
from flask import jsonify, request
import json
import requests


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


headers = ExRlogin()

# /////////////////////////////////////////////////////////dashboard////////////////////////////////


def ScadaCollection():

    CONNECTION_STRING = "mongodb://mongodb0.erldc.in:27017,mongodb1.erldc.in:27017/?replicaSet=CONSERV"
    client = MongoClient(CONNECTION_STRING)
    db = client['SemVsScada']
    User_Input_Table = db['Scada_Data']
    meter_table = db['meter_name_code']
    mapping_table = db['mapping_table']
    return meter_table

meter_table = ScadaCollection()


# ////////////////////////////////////////////////////////Meter Data/////////////////////////////////////////////////////////


def meternames(startDate,endDate,folder):

    startDate_obj = datetime.strptime(startDate, '%Y-%m-%d')

    if (folder == "no"):

        CONNECTION_STRING = "mongodb://10.3.101.179:1434"
        client = MongoClient(CONNECTION_STRING)
        db = client['meterDataArchival']
        Data_Table = db["meterData"+str(startDate_obj.year)]

        filter = {
            'date': {
                '$gte': pd.to_datetime(startDate),
                '$lte': pd.to_datetime(endDate)
            }
        }

        cursor = Data_Table.find(
            filter=filter, projection={'_id': 0, 'meterID': 1, 'meterNO': 1})

        meter = list(cursor)

        meter_list = []

        for item in meter:

            filter = {'Meter_Code':item['meterID']}

            cursor = meter_table.find(
                filter=filter, projection={'_id': 0, 'Name': 1, 'Meter_Name': 1})

            meter_name = list(cursor)

            if len(meter_name)==0 or len(meter_name[0]['Name'])==0:
                meter_name=""
            else:
                meter_name=meter_name[0]['Name']+": "

            full_name = meter_name+item["meterNO"]+" ("+item["meterID"]+")"

            if full_name not in meter_list:
                meter_list.append(full_name)

        meter_list = list(set(meter_list))

        return jsonify(meter_list)

    elif folder == "yes":

        path = "E:/test/SEMvsSCADA/svs_be/Meter_Files/"

        startDate_obj = datetime.strptime(startDate, '%Y-%m-%d')
        endDate_obj = datetime.strptime(endDate, '%Y-%m-%d')

        count_flag = 0

        for dates in ([startDate_obj+timedelta(days=x) for x in range((endDate_obj-startDate_obj).days+1)]):

            full_path = path+dates.strftime("%d-%m-%y")

            if (os.path.isdir(full_path)):
                # f = open(os.path.join(full_path, file),'r')

                if count_flag == 0:
                    meter_list = os.listdir(full_path)
                    count_flag += 1

                else:
                    meter_list = [value for value in os.listdir(
                        full_path) if value in meter_list]

            else:
                meter_list = ["Please Upoad"]
                return jsonify(meter_list)

        for i in range(len(meter_list)):

            meter_list[i] = meter_list[i].split(".")[0]

        meter_list = list(set(meter_list))

        

        filter = {'Meter_Name': {'$in': meter_list}}

        cursor = meter_table.find(
            filter=filter, projection={'_id': 0, 'Name': 1, 'Meter_Name': 1, 'Meter_Code': 1})

        meter_list = list(cursor)


        for i in range(len(meter_list)):
            meter_list[i] = meter_list[i]["Name"]+": "+meter_list[i]["Meter_Name"] + \
                " ("+meter_list[i]["Meter_Code"]+")"

        return jsonify(meter_list)


def meter_check(startDate_obj,endDate_obj):

    startDate = request.args['startDate']
    endDate = request.args['endDate']
    
    startDate_obj = datetime.strptime(startDate, '%Y-%m-%d')
    endDate_obj = datetime.strptime(endDate, '%Y-%m-%d')
    

    db_dates=[]
    meter_folder_dates=[]
    non_meter_folder_dates=[]
    path = "E:/test/SEMvsSCADA/svs_be/Meter_Files/"

    CONNECTION_STRING = "mongodb://10.3.101.179:1434"
    client = MongoClient(CONNECTION_STRING)
    db = client['meterDataArchival']
    Data_Table = db["meterData"+str(startDate_obj.year)]

    filter = {
        'date': {
            '$gte': pd.to_datetime(startDate),
            '$lte': pd.to_datetime(endDate)
        }
    }

    cursor = Data_Table.find(
        filter=filter, projection={'_id': 0, 'meterID': 1})

    meter = list(cursor)

    if len(meter)==0:
    
        for dates in ([startDate_obj+timedelta(days=x) for x in range((endDate_obj-startDate_obj).days+1)]):

            full_path = path+dates.strftime("%d-%m-%y")

            if (os.path.isdir(full_path)):
                
                meter_folder_dates.append(dates)
                
            else:
                non_meter_folder_dates.append(dates)

        if len(meter_folder_dates)==0:
            return jsonify(["Nowhere"])

        elif len(meter_folder_dates)>0 and len(non_meter_folder_dates)>0:
            return jsonify(["Some",non_meter_folder_dates])

        else:
            return jsonify(["Folder"])

    else:
        return jsonify(["Database"])



def MeterData(startDate,endDate,time,meter_list,folder):

    startDate_obj = datetime.strptime(startDate, '%Y-%m-%d')

    time = int(time)

    if (folder == "no"):

        CONNECTION_STRING = "mongodb://10.3.101.179:1434"
        client = MongoClient(CONNECTION_STRING)
        db = client['meterDataArchival']
        Data_Table = db["meterData"+str(startDate_obj.year)]

        startDateObj = datetime.strptime(startDate, "%Y-%m-%d")
        endDateObj = datetime.strptime(endDate, "%Y-%m-%d")

        allDateTime = [dt.strftime("%d-%m-%Y %H:%M:%S") for dt in
                       datetime_range(startDateObj, endDateObj,
                                      timedelta(minutes=time))]

        data_to_send = [allDateTime]

        for meters in meter_list:

            meters = meters.split(": ")
            meters= meters[-1]

            meters = meters.split("(")
            meterNO = meters[0][:-1]
            meterID = meters[1][:-1]

            meter_obj = {
                'meterNO': meterNO,
                'meterID': meterID
            }

            filter = {
                'date': {
                    '$gte': pd.to_datetime(startDate),
                    '$lte': pd.to_datetime(endDate)
                },
                'meterNO': meterNO,
                'meterID': meterID
            }

            cursor = Data_Table.find(
                filter=filter, projection={'_id': 0, 'data': 1, 'activeHigh': 1, 'reactiveHigh': 1, 'reactiveLow': 1, 'date': 1})

            cursor_list = list(cursor)

            data = []
            activeHigh = []
            reactiveHigh = []
            reactiveLow = []
            date_list = []

            for item in cursor_list:
                data = data+item['data']
                activeHigh.append(item['activeHigh'])
                reactiveHigh.append(item['reactiveHigh'])
                reactiveLow.append(item['reactiveLow'])
                date_list.append(item['date'].date())

            x = list(divide_chunks(data, time//15))

            final_data = []

            for items in x:
                max_1, min_1, avg_1 = my_max_min_function(items)
                final_data.append(avg_1)

            meter_obj['data'] = final_data

            for item in range(len(final_data)):
                final_data[item] = final_data[item]

            meter_obj['modified_data'] = final_data
            meter_obj['activeHigh'] = activeHigh
            meter_obj['reactiveHigh'] = reactiveHigh
            meter_obj['reactiveLow'] = reactiveLow
            meter_obj['date'] = date_list

            data_to_send.append(meter_obj)

        return jsonify(data_to_send)

    elif folder == "yes":

        path = "E:/test/SEMvsSCADA/svs_be/Meter_Files/"

        startDateObj = datetime.strptime(startDate, "%Y-%m-%d")
        endDateObj = datetime.strptime(endDate, "%Y-%m-%d")

        allDateTime = [dt.strftime("%d-%m-%Y %H:%M:%S") for dt in
                       datetime_range(startDateObj, endDateObj,
                                      timedelta(minutes=time))]

        data_to_send = [allDateTime]

        for meters in meter_list:

            meters = meters.split(": ")
            meters= meters[-1]

            meters = meters.split("(")
            meters = meters[0][:-1]

            meters = meters+".MWH"
            count_flag = 0

            date_list = []
            end1Data = []

            for dates in ([startDateObj+timedelta(days=x) for x in range((endDateObj-startDateObj).days+1)]):

                date_list.append(dates)
                full_path = path+dates.strftime("%d-%m-%y")

                if (os.path.isdir(full_path)):
                    # f = open(os.path.join(full_path, file),'r')
                    full_path = full_path+"/"+meters

                    if count_flag == 0:

                        dataEnd1 = pd.read_csv(full_path, header=None)
                        dfSeriesEnd1 = pd.DataFrame(dataEnd1)
                        dfEnd1 = dfSeriesEnd1[0]

                        first_index = dfEnd1[0].split()

                        meter_obj = {
                            'meterNO': first_index[1],
                            'meterID': first_index[0]
                        }

                        total_active_high = [first_index[3]]
                        total_reactive_high = [first_index[4]]
                        total_reactive_low = [first_index[5]]

                        for i in range(1, len(dfEnd1)):
                            oneHourDataEnd1 = [changeToFloat(
                                x) for x in dfEnd1[i].split()[1:]]
                            end1Data = end1Data + oneHourDataEnd1

                        count_flag += 1

                    else:
                        dataEnd1 = pd.read_csv(full_path, header=None)
                        dfSeriesEnd1 = pd.DataFrame(dataEnd1)
                        dfEnd1 = dfSeriesEnd1[0]

                        first_index = dfEnd1[0].split()

                        total_active_high.append(first_index[3])
                        total_reactive_high.append(first_index[4])
                        total_reactive_low.append(first_index[5])

                        for i in range(1, len(dfEnd1)):
                            oneHourDataEnd1 = [changeToFloat(
                                x) for x in dfEnd1[i].split()[1:]]
                            end1Data = end1Data + oneHourDataEnd1

            x = list(divide_chunks(end1Data, time//15))

            final_data = []

            for items in x:
                max_1, min_1, avg_1 = my_max_min_function(items)
                final_data.append(avg_1)

            meter_obj['data'] = final_data

            for item in range(len(final_data)):
                final_data[item] = final_data[item]

            meter_obj['modified_data'] = final_data
            meter_obj['activeHigh'] = total_active_high
            meter_obj['reactiveHigh'] = total_reactive_high
            meter_obj['reactiveLow'] = total_reactive_low
            meter_obj['date'] = date_list

            data_to_send.append(meter_obj)

        return jsonify(data_to_send)



def ReportMeterData(startDate,endDate,time,folder):


    startDate_obj = datetime.strptime(startDate, '%Y-%m-%d')

    check_list1=["NE-91","NE-85","NE-86","NE-89","NE-90","NE-81","NE-82","NE-83","NE-87","NE-84","NE-88"]

    meter_list=["EM-07","EM-08","EM-09","EM-10","ER-39","ER-40","ER-41","ET-27","ET-28","ET-52","ET-53","NE-83","NE-87","EP-93","EP-95","EH-16","EH-18","ES-07","ES-09"]

    Name_Hindi= ["400kV बिनागुड़ी-ताला-1","400kV बिनागुड़ी-ताला-2","400kV बिनागुड़ी-मालबेस","400kV बिनागुड़ी-ताला-4","220kV बीरपाड़ा-चुखा -1","220kV बीरपाड़ा-चुखा -2","220kV बीरपाड़ा-मालबेस",
                 "400kV पुनात्संचू-अलीपुरद्वार -1","400kV पुनात्संचू-अलीपुरद्वार -2","400kV जिगमेलिंग-अलीपुरद्वार -1","400kV जिगमेलिंग-अलीपुरद्वार -2","132KV-गेलेफ़ु-सलाकाती","132kV रंगिया-मोटंगा",
                 "400kV बरहामपुर-भेड़ामारा -1","400kV बरहामपुर-भेड़ामारा-2","400kV बरहामपुर-भेड़ामारा -3","400kV बरहामपुर-भेड़ामारा -4","400kV मुजफ्फरपुर-ढालकेबार -1","400kV मुजफ्फरपुर-ढालकेबार -2","बिहार स्रोत से"]
    
    Name= ["400kV BINAGURI-TALA-1","400kV BINAGURI-TALA-2","400 kV BINAGURI-MALBASE","400kV BINAGURI-TALA-4","220 kV BIRPARA-CHUKHA-1","220 kV BIRPARA-CHUKHA-2","220 kV BIRPARA-MALBASE",
           "400 kV PUNATSANCHU-ALIPURDUAR-1","400 kV PUNATSANCHU-ALIPURDUAR-2","400 kV JIGMELING-ALIPURDUAR-1","400 kV JIGMELING-ALIPURDUAR-2","132KV-GELEPHU-SALAKATI","132kV RANGIA-MOTANGA",
           "400 kV BERHAMPORE-BHERAMARA-1","400 kV BERHAMPORE-BHERAMARA-2","400 kV BERHAMPORE-BHERAMARA-3","401 kV BERHAMPORE-BHERAMARA-4","400kV MUZAFFARPUR-DHALKEBAR-1",
           "400kV MUZAFFARPUR-DHALKEBAR-2","From Bihar Source"]

    startDateObj = datetime.strptime(startDate, "%Y-%m-%d")
    endDateObj = datetime.strptime(endDate, "%Y-%m-%d")

    date_range = [startDateObj+timedelta(days=x)
            for x in range((endDateObj-startDateObj).days+1)]
    
    temp_name= {}

    for z in range(len(meter_list)):
        temp_name["name"+str(z+1)]= [Name[z],meter_list[z]]
        temp_name["name_hindi"+str(z+1)]= Name_Hindi[z]

        if z== len(meter_list)-1:
            temp_name["name"+str(z+2)]= [Name[-1],"API Data"]
            temp_name["name_hindi"+str(z+2)]= Name_Hindi[-1]


    if (folder == "no"):

        CONNECTION_STRING = "mongodb://10.3.101.179:1434"
        client = MongoClient(CONNECTION_STRING)
        db = client['meterDataArchival']
        Data_Table = db["meterData"+str(startDate_obj.year)]

        data_to_send = []

        flag_list=[]

        for ind in range(len(date_range)):

            date_check= date_range[ind]

            for ind2 in range(len(check_list1)):

                meter_check= check_list1[ind2]

                filter = {
                    'date': {
                        '$gte': datetime(date_check.year, date_check.month, date_check.day, 0, 0, 0, tzinfo=timezone.utc),
                        '$lte': datetime(date_check.year, date_check.month, date_check.day, 0, 0, 0, tzinfo=timezone.utc)
                    },
                    'meterID': meter_check
                }

                cursor = Data_Table.find(
                    filter=filter, projection={'_id': 0, 'data': 1, 'date': 1})

                cursor_list = list(cursor)

                if len(cursor_list)!=0:

                    for item in cursor_list:
                        check_data= item['data']
                else:
                    check_data= [0]*96

                if meter_check=="NE-91":
                    initial_value= check_data[0]
                    initial_value1= check_data[0]
                    initial_value2= check_data[0]
                    initial_value3= check_data[0]

                elif meter_check=="NE-85" or meter_check=="NE-86" or meter_check=="NE-89" or meter_check=="NE-90" or meter_check=="NE-81" or meter_check=="NE-82":
                    initial_value= initial_value-check_data[0]
                    initial_value1= initial_value1-check_data[0]
                    initial_value2= initial_value2-check_data[0]
                    initial_value3= initial_value3-check_data[0]
                
                elif meter_check=="NE-83":
                    pos_check_data= abs(check_data[0])
                    neg_check_data= -1*abs(check_data[0])
                    
                    initial_value= initial_value-pos_check_data
                    initial_value1= initial_value1-neg_check_data
                    initial_value2= initial_value2-pos_check_data
                    initial_value3= initial_value3-neg_check_data

                elif meter_check=="NE-87":
                    pos_check_data= abs(check_data[0])
                    neg_check_data= -1*abs(check_data[0])
                    
                    initial_value= initial_value-pos_check_data
                    initial_value1= initial_value1-neg_check_data
                    initial_value2= initial_value2+pos_check_data
                    initial_value3= initial_value3+neg_check_data
                    
            if round(initial_value,2)==0 or round(initial_value1,2)==0 or round(initial_value2,2)==0 or round(initial_value3,2)==0:
                flag_list.append(0)
            else:
                flag_list.append(1)



        for rng in range(len(date_range)):

            if rng== 0:
                sample_dict= temp_name.copy()
            else:
                sample_dict= {}

            sample_dict["Date"]= date_range[rng].strftime("%d-%m-%y")
            it= date_range[rng]

            for x in range(len(meter_list)):

                meterID = meter_list[x]

                if meterID== "NE-83" and flag_list[rng]==1:
                    meterID= "NE-84"

                if meterID== "NE-87" and flag_list[rng]==1:
                    meterID= "NE-88"

                filter = {
                    'date': {
                        '$gte': datetime(it.year, it.month, it.day, 0, 0, 0, tzinfo=timezone.utc),
                        '$lte': datetime(it.year, it.month, it.day, 0, 0, 0, tzinfo=timezone.utc)
                    },
                    'meterID': meterID
                }

                cursor = Data_Table.find(
                    filter=filter, projection={'_id': 0, 'data': 1, 'date': 1})

                cursor_list = list(cursor)

                if len(cursor_list)!=0:

                    for item in cursor_list:

                        all_date_data= item['data']

                else:
                    all_date_data= [0]*96

                pos= 0
                neg= 0

                if time//15>1:

                    chunks = list(divide_chunks(all_date_data, time//15))

                    final_data = []

                    for items in chunks:
                        max_1, min_1, avg_1 = my_max_min_function(items)
                        final_data.append(avg_1)

                else:
                    final_data= all_date_data

                for vals in final_data:
                    if vals>0:
                        pos+= vals

                    else:
                        neg+= vals

                sample_dict["pos_data"+str(x+1)]= round(pos,2)
                sample_dict["neg_data"+str(x+1)]= round(neg,2)
                sample_dict["sum"+str(x+1)]= round(pos+neg,2)

                if x== len(meter_list)-1:

                    dt= sample_dict["Date"]
                    dt= dt.split("-")
                    dt= dt[0]+"-"+dt[1]+"-20"+dt[2]
                    
                    res1 = requests.get(
                        'https://report.erldc.in/posoco_api/api/PSP/GetPSPTransnationalExchangeLineByDate/'+dt)
                    response1 = json.loads(res1.text)

                    for item in response1:
                
                        if item['LINE_NAME']=="132KV-BIHAR-NEPAL":
                            pos1=0
                            neg1=0

                            if float(item['ENERGY_EXCHANGE'])>0:
                                neg1= -1000*float(item['ENERGY_EXCHANGE'])
                                pos1= 0

                            else:
                                neg1= 0
                                pos1= -1000*float(item['ENERGY_EXCHANGE'])

                            sample_dict["pos_data"+str(x+2)]= round(pos1,2)
                            sample_dict["neg_data"+str(x+2)]= round(neg1,2)
                            sample_dict["sum"+str(x+2)]= round(pos1+neg1,2)

            data_to_send.append(sample_dict)

        return jsonify(data_to_send)

    elif folder == "yes":

        meter_list=["EM-07","EM-08","EM-09","EM-10","ER-39","ER-40","ER-41","ET-27","ET-28","ET-52","ET-53","NE-83","NE-87","EP-93","EP-95","EH-16","EH-18","ES-07","ES-09"]

        Name_Hindi= ["400kV बिनागुड़ी-ताला-1","400kV बिनागुड़ी-ताला-2","400kV बिनागुड़ी-मालबेस","400kV बिनागुड़ी-ताला-4","220kV बीरपाड़ा-चुखा -1","220kV बीरपाड़ा-चुखा -2","220kV बीरपाड़ा-मालबेस",
                     "400kV पुनात्संचू-अलीपुरद्वार -1","400kV पुनात्संचू-अलीपुरद्वार -2","400kV जिगमेलिंग-अलीपुरद्वार -1","400kV जिगमेलिंग-अलीपुरद्वार -2","132KV-गेलेफ़ु-सलाकाती","132kV रंगिया-मोटंगा",
                     "400kV बरहामपुर-भेड़ामारा -1","400kV बरहामपुर-भेड़ामारा-2","400kV बरहामपुर-भेड़ामारा -3","400kV बरहामपुर-भेड़ामारा -4","400kV मुजफ्फरपुर-ढालकेबार -1","400kV मुजफ्फरपुर-ढालकेबार -2",
                     "बिहार स्रोत से"]
        Name= ["400kV BINAGURI-TALA-1","400kV BINAGURI-TALA-2","400 kV BINAGURI-MALBASE","400kV BINAGURI-TALA-4","220 kV BIRPARA-CHUKHA-1","220 kV BIRPARA-CHUKHA-2",
               "220 kV BIRPARA-MALBASE","400 kV PUNATSANCHU-ALIPURDUAR-1","400 kV PUNATSANCHU-ALIPURDUAR-2","400 kV JIGMELING-ALIPURDUAR-1","400 kV JIGMELING-ALIPURDUAR-2",
               "132KV-GELEPHU-SALAKATI","132kV RANGIA-MOTANGA","400 kV BERHAMPORE-BHERAMARA-1","400 kV BERHAMPORE-BHERAMARA-2","400 kV BERHAMPORE-BHERAMARA-3","401 kV BERHAMPORE-BHERAMARA-4",
               "400kV MUZAFFARPUR-DHALKEBAR-1","400kV MUZAFFARPUR-DHALKEBAR-2","From Bihar Source"]

        path = "E:/test/SEMvsSCADA/svs_be/Meter_Files/"

        data_to_send = []

        for x in range(len(meter_list)):

            meter_data=[]

            meters= meter_list[x]

            filter = {'Meter_Code':meters}

            cursor = meter_table.find(
                filter=filter, projection={'_id': 0, 'Name': 1, 'Meter_Name': 1})

            meter_name = list(cursor)

            meters = meter_name[0]["Meter_Name"]+".MWH"

            end1Data = []

            for dates in ([startDateObj+timedelta(days=x) for x in range((endDateObj-startDateObj).days+1)]):

                
                full_path = path+dates.strftime("%d-%m-%y")

                if (os.path.isdir(full_path)):
                    # f = open(os.path.join(full_path, file),'r')
                    full_path = full_path+"/"+meters

                    try:

                        dataEnd1 = pd.read_csv(full_path, header=None)
                        dfSeriesEnd1 = pd.DataFrame(dataEnd1)
                        dfEnd1 = dfSeriesEnd1[0]

                        for i in range(1, len(dfEnd1)):
                            oneHourDataEnd1 = [changeToFloat(
                                x) for x in dfEnd1[i].split()[1:]]
                            end1Data = end1Data + oneHourDataEnd1

                        all_date_data= end1Data

                    except:
                        all_date_data= [0]*96

                else:
                    all_date_data= [0]*96

                pos= 0
                neg= 0

                if time//15>1:

                    chunks = list(divide_chunks(all_date_data, time//15))

                    final_data = []

                    for items in chunks:
                        max_1, min_1, avg_1 = my_max_min_function(items)
                        final_data.append(avg_1)

                else:
                    final_data= all_date_data

                for vals in final_data:
                    if vals>0:
                        pos+= vals

                    else:
                        neg+= vals

                temp_dict={
                    "name": Name[x],
                    "name_hindi": Name_Hindi[x],
                    "pos_data": round(pos,2),
                    "neg_data": round(neg,2),
                    "sum": round(pos+neg,2),
                    "Date": full_path
                }
                meter_data.append(temp_dict)   

            data_to_send.append(meter_data)

        for rang in range(len(data_to_send)):

            if rang==0:
                final_data_to_send= data_to_send[0]

            else:
                for rang2 in range(len(data_to_send[rang])):
                    final_data_to_send[rang2]['name'+str(rang)]= data_to_send[rang][rang2]['name']
                    final_data_to_send[rang2]['name_hindi'+str(rang)]= data_to_send[rang][rang2]['name_hindi']
                    final_data_to_send[rang2]['neg_data'+str(rang)]= data_to_send[rang][rang2]['neg_data']
                    final_data_to_send[rang2]['pos_data'+str(rang)]= data_to_send[rang][rang2]['pos_data']
                    final_data_to_send[rang2]['sum'+str(rang)]= data_to_send[rang][rang2]['sum']


        for obj in range(len(final_data_to_send)):

            dt= final_data_to_send[obj]["Date"]
            dt= dt.split("-")
            dt= dt[0]+"-"+dt[1]+"-20"+dt[2]
            
            res1 = requests.get(
                'https://report.erldc.in/posoco_api/api/PSP/GetPSPTransnationalExchangeLineByDate/'+dt)
            response1 = json.loads(res1.text)

            for item in response1:
                
                if item['LINE_NAME']=="132KV-BIHAR-NEPAL":
                    pos=0
                    neg=0

                    if float(item['ENERGY_EXCHANGE'])>0:
                        neg= -1000*float(item['ENERGY_EXCHANGE'])
                        pos= 0

                    else:
                        neg= 0
                        pos= -1000*float(item['ENERGY_EXCHANGE'])
                        

                    final_data_to_send[obj]['name'+str(rang+1)]= Name[rang+1]
                    final_data_to_send[obj]['name_hindi'+str(rang+1)]= Name_Hindi[rang+1]
                    final_data_to_send[obj]['neg_data'+str(rang+1)]= round(neg,2)
                    final_data_to_send[obj]['pos_data'+str(rang+1)]= round(pos,2)
                    final_data_to_send[obj]['sum'+str(rang+1)]= round(pos+neg,2)

        return jsonify(final_data_to_send)
