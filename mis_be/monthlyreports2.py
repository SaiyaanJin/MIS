from pymongo import MongoClient
from datetime import timedelta, datetime, timezone
from flask import  jsonify


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
  return datetime.strptime(date_string, '%Y-%m-%d')



# /////////////////////////////////////////////////////////dashboard////////////////////////////////


def ScadaCollection():

    CONNECTION_STRING = "mongodb://mongodb0.erldc.in:27017,mongodb1.erldc.in:27017/?replicaSet=CONSERV"
    client = MongoClient(CONNECTION_STRING)
    db = client['SemVsScada']
    User_Input_Table = db['Scada_Data']
    meter_table = db['meter_name_code']
    mapping_table = db['mapping_table']
    return User_Input_Table, meter_table, mapping_table


Scada_database, meter_table, mapping_table = ScadaCollection()


# ////////////////////////////////////////////////////////Meter Data2/////////////////////////////////////////////////////////


def ReportMeterData2(startDate,endDate,time,folder):

    startDate_obj = datetime.strptime(startDate, '%Y-%m-%d')

    check_list1=["NE-91","NE-85","NE-86","NE-89","NE-90","NE-81","NE-82","NE-83","NE-87"] #length=9

    meter_list1= ["NE-81","NE-82","NE-83","NE-87","NE-85","NE-86","NE-89","NE-90"]	#length=8

    meter_list2= ["ER-84","ER-85","TL-14","TL-15","ES-59","ES-58"] #length=6	

    meter_list3= ["OR-56","OR-57","OR-59","EP-68","EP-66","ET-31","ET-32","EM-47",
                  "EM-48","EN-10","EN-99","ET-29","ET-30","EN-41","EN-42","EG-75","EG-76"] #length=17
    	
    meter_list4= ["ER-82","ER-83","EP-23","EP-24","ET-35","ET-36","ER-97","ER-94","BR-12",
                  "NR-05","NR-06","NR-07","NR-08","EM-25","EM-26","EM-57","EM-53","BR-13",
                  "BR-14","EM-21","EM-22","EP-19","ES-26","EN-72","DM-16","DM-17","EP-03",
                  "EP-04","ES-76","ES-77","ES-85","ES-86","EP-42","EP-03","EP-04"]	#length=35																																																																															
    
    Name_Hindi1= ["220kV अलिपुरद्वार - सालाकाटी-I", "220kV अलिपुरद्वार - सालाकाटी-II", "132kV गेलेफू - सालाकाटी", "132kV रंगिया - मोतंगा", 
                  "400kV बिनागुड़ी - बोंगाईगांव- I", "400kV बिनागुड़ी - बोंगाईगांव- II", "400kV अलिपुरद्वार - बोंगाईगांव- I", "400kV अलिपुरद्वार - बोंगाईगांव- II"]	
    																		
    Name_Hindi2= ["गाजूवाका एचवीडीसी-EA-I", "गाजूवाका एचवीडीसी-EA-2", "तालचर स्टेज-II आई/सी_E1", "तालचर स्टेज-II आई/सी_E2", "765kV अंगूल - श्रीकाकुलम-I", "765kV अंगूल - श्रीकाकुलम-II"]

    Name_Hindi3= ["220kV बुधिपादार- रायगढ़-I", "220kV बुधिपादार- कोरबा-II", "220kV बुधिपादार- कोरबा-III", "400kV झारसुगुडा- रायगढ़-I", "400kV झारसुगुडा- रायगढ़-II", 
                  "400kV झारसुगुडा- रायगढ़-III", "400kV झारसुगुडा- रायगढ़-IV", "400KV न्यू रांची-सिपत-I", "400KV न्यू रांची-सिपत-II", "765KV न्यू रांची-धरमजयगढ़-I", 
                  "765KV न्यू रांची-धरमजयगढ़-II", "765KV झारसुगुडा-धरमजयगढ़-I", "765KV झारसुगुडा-धरमजयगढ़-II", "765KV झारसुगुडा-धरमजयगढ़-III", 
                  "765KV झारसुगुडा-धरमजयगढ़-IV", "765kV झारसुगुडा- रायपुर (दूर्ग) -I", "765kV झारसुगुडा- रायपुर (दूर्ग) -II"]
    
    Name_Hindi4= ["400KV सासाराम-बिहारशरीफ-I", "400KV सासाराम-बिहारशरीफ-II", "400kV सासाराम- नबीनगर-I", "400kV सासाराम- नबीनगर-II", "400kV सासाराम- डाल्टनगंज-I", 
                  "400kV सासाराम- डाल्टनगंज-II", "पुसौली आईसीटी-I", "पुसौली आईसीटी-II", "220KV-नई कर्मनासा-साहूपुरी", "132KV-कर्मनाशा-साहूपुरी", "132KV-कर्मनाशा-चंदौली", 
                  "132KV-नागरुनतारी-रिहन्द", "132KV-गढ़वा-रिहन्द", "400KV-मुजफ्फरपुर - गोरखपुर-I", "400KV-मुजफ्फरपुर - गोरखपुर-II","400KV पटना- बलिया-I", "400KV पटना- बलिया-II", 
                  "400KV नौबतपुर-बलिया-I", "400KV नौबतपुर-बलिया-II", "400KV-बिहारशरीफ - बलिया-I", "400KV-बिहारशरीफ - बलिया-II", "765KV-गया- वाराणसी-I", "765KV-गया- वाराणसी-II", 
                  "765KV-गया - बलिया", "400KV-मोतिहारी- गोरखपुर-I", "400KV-मोतिहारी- गोरखपुर-II", "400KV-बिहारशरीफ-वाराणसी-I", "400KV-बिहारशरीफ-वाराणसी-II", "एचवीडीसी 800KV-अलिपुरद्वार - आगरा-3MB", 
                  "एचवीडीसी 800KV-अलिपुरद्वार - आगरा-3TB", "एचवीडीसी 800KV-अलिपुरद्वार - आगरा-4MB", "एचवीडीसी 800KV-अलिपुरद्वार - आगरा-4TB", "400KV पटना- बलिया-III","400KV-बिहारशरीफ-साहूपुरी(चंदौली)-I",
                  "400KV-बिहारशरीफ-साहूपुरी(चंदौली)-II"]

    
    Name1= ["220KV-ALIPURDUAR-SALAKATI-I", "220KV-ALIPURDUAR-SALAKATI-II", "132KV-GELEPHU-SALAKATI", "132kV RANGIA-MOTANGA", "400KV-BINAGURI-BONGAIGAON-I", 
            "400KV-BINAGURI-BONGAIGAON-II", "400KV-ALIPURDUAR-BONGAIGAON-I","400KV-ALIPURDUAR-BONGAIGAON-II"]
    
    Name2= ["GAZUWAKA HVDC-EA-I", "GAZUWAKA HVDC-EA-2", "TALCHER STG-II I/C_E1", "TALCHER STG-II I/C_E2", "765KV-ANGUL-SRIKAKULAM-I", "765KV-ANGUL-SRIKAKULAM-II"]

    Name3= ["220KV-BUDHIPADAR-RAIGARH-I", "220KV-BUDHIPADAR-KORBA-II", "220KV-BUDHIPADAR-KORBA-III", "400KV-JHARSUGUDA-RAIGARH-I", "400KV-JHARSUGUDA-RAIGARH-II",
            "400KV-JHARSUGUDA-RAIGARH-III", "400KV-JHARSUGUDA-RAIGARH-IV","400KV- RANCHI-SIPAT-I", "400KV-RANCHI-SIPAT-II", "765KV-NEW RANCHI-DHARMAJAYAGARH-I", 
            "765KV-NEW RANCHI-DHARMAJAYAGARH-II", "765KV-JHARSUGUDA-DHARMAJAYAGARH-I", "765KV-JHARSUGUDA-DHARMAJAYAGARH-II", "765KV-JHARSUGUDA-DHARMAJAYAGARH-III", 
            "765KV-JHARSUGUDA-DHARMAJAYAGARH-IV", "765KV-JHARSUGUDA (S'GARH)-RAIPUR (DURG)-I", "765KV-JHARSUGUDA (S'GARH)-RAIPUR (DURG)-II"]
    
    Name4= ["400KV SASARAM-BIHARSARIFF-1", "400KV SASARAM-BIHARSARIFF-II", "400kV SASARAM-NABINAGAR-I", "400kV SASARAM-NABINAGAR-II", "400kV SASARAM-DALTONGUNJ-I", 
            "400kV SASARAM-DALTONGUNJ-II", "PUSAULI ICT-I", "PUSAULI ICT-II", "220KV-NEW KARMANASA-SAHUPURI", "132KV-KARMANASA-SAHUPURI", "132KV-KARMANASA-CHANDAULI", 
            "132KV-NAGARUNTARI-RIHAND", "132KV-GARWAH-RIHAND", "400KV-MUZAFFARPUR-GORAKHPUR-I", "400KV-MUZAFFARPUR-GORAKHPUR-II", "400KV-PATNA-BALIA-I", 
            "400KV-PATNA-BALIA-II", "400KV-NAUBATPUR(BH)-BALIA-I", "400KV-NAUBATPUR(BH)-BALIA-II", "400KV-BIHARSARIFF-BALIA-I", "400KV-BIHARSARIFF-BALIA-II", 
            "765KV-GAYA-VARANASI-I", "765KV-GAYA-VARANASI-II", "765KV-GAYA-BALIA", "400KV-MOTIHARI-GORAKHPUR-I", "400KV-MOTIHARI-GORAKHPUR-II", "400KV-BIHARSARIFF-VARANASI-I", 
            "400KV-BIHARSARIFF-VARANASI-II", "HVDC 800KV-ALIPURDUAR-AGRA-3MB", "HVDC 800KV-ALIPURDUAR-AGRA-3TB", "HVDC 800KV-ALIPURDUAR-AGRA-4MB", 
            "HVDC 800KV-ALIPURDUAR-AGRA-4TB", "400KV-PATNA-BALIA-III", "400KV-BIHARSARIFF- SAHUPURI(CHANDAULI)-I", "400KV-BIHARSARIFF- SAHUPURI(CHANDAULI)-II"]
    
    name_code= {
        'm1': meter_list1,
        'm2': meter_list2,
        'm3': meter_list3,
        'm4': meter_list4,

        'h1': Name_Hindi1,
        'h2': Name_Hindi2,
        'h3': Name_Hindi3,
        'h4': Name_Hindi4,

        'n1': Name1,
        'n2': Name2,
        'n3': Name3,
        'n4': Name4,
    }

    names_dict={}

    temp_name=[]

    for l in range (1,5):
        for m in range(len(name_code['n'+str(l)])):
            temp_name.append([name_code['n'+str(l)][m],name_code['m'+str(l)][m]])

        temp_name.append("कुल")
        temp_name.append("नेट")

    temp_name_hindi= Name_Hindi1+["Total","Net"]+Name_Hindi2+["Total","Net"]+Name_Hindi3+["Total","Net"]+Name_Hindi4+["Total","Net"]

    for z in range(len(temp_name)):
        names_dict['name'+str(z+1)]= temp_name[z]
        names_dict['name_hindi'+str(z+1)]= temp_name_hindi[z]

    startDateObj = datetime.strptime(startDate, "%Y-%m-%d")
    endDateObj = datetime.strptime(endDate, "%Y-%m-%d")

    date_range = [startDateObj+timedelta(days=x)
            for x in range((endDateObj-startDateObj).days+1)]

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
                sample_dict= names_dict.copy()
            else:
                sample_dict= {}

            sample_dict["Date"]= date_range[rng].strftime("%d-%m-%y")
            
            for lst_num in range(1,5):

                net_pos= 0
                net_neg= 0

                it= date_range[rng]

                if lst_num==1:

                    for x in range(len(name_code['m1'])):
                        meterID= name_code['m1'][x]   

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
                        
                        temp_pos= pos
                        pos= -1*neg
                        neg= -1*temp_pos

                        net_pos+= pos
                        net_neg+= neg

                        sample_dict['pos_data'+str(lst_num)+str(x+1)]= round(pos,2)
                        sample_dict['neg_data'+str(lst_num)+str(x+1)]= round(neg,2)

                        if x== len(name_code['m1'])-1:
                            sample_dict['net_pos'+str(lst_num)]= round(net_pos,2)
                            sample_dict['net_neg'+str(lst_num)]= round(net_neg,2)
                            sample_dict['net_val'+str(lst_num)]= round(net_pos+net_neg,2)
                    
                else:

                    for x in range(len(name_code['m'+str(lst_num)])):

                    
                        meterID= name_code['m'+str(lst_num)][x]

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

                        if meterID in ["ER-82","ER-83","EP-23","EP-24","ET-35","ET-36","ER-97","NR-08","ER-94"]:
                            temp_pos1= pos
                            pos= -1*neg
                            neg= -1*temp_pos1

                        if lst_num== 4:

                            if meterID=="EP-03":
                            
                                if date_range[rng]<convert_to_datetime("2024-04-20"):
                                    if x==len(name_code['m'+str(lst_num)])-2:
                                        pos1=0
                                        neg1=0
                                    else:
                                        pos1=pos
                                        neg1=neg
                                else:
                                    if x==len(name_code['m'+str(lst_num)])-2:
                                        pos1=pos
                                        neg1=neg
                                    else:
                                        pos1=0
                                        neg1=0

                                net_pos+= pos1
                                net_neg+= neg1

                                sample_dict['pos_data'+str(lst_num)+str(x+1)]= round(pos1,2)
                                sample_dict['neg_data'+str(lst_num)+str(x+1)]= round(neg1,2)

                                if x== len(name_code['m'+str(lst_num)])-1:
                                    sample_dict['net_pos'+str(lst_num)]= round(net_pos,2)
                                    sample_dict['net_neg'+str(lst_num)]= round(net_neg,2)
                                    sample_dict['net_val'+str(lst_num)]= round(net_pos+net_neg,2)

                            elif meterID=="EP-04":
                            
                                if date_range[rng]<convert_to_datetime("2024-05-18"):
                                    if x==len(name_code['m'+str(lst_num)])-1:
                                        pos1=0
                                        neg1=0
                                    else:
                                        pos1=pos
                                        neg1=neg
                                else:
                                    if x==len(name_code['m'+str(lst_num)])-1:
                                        pos1=pos
                                        neg1=neg
                                    else:
                                        pos1=0
                                        neg1=0

                                net_pos+= pos1
                                net_neg+= neg1

                                sample_dict['pos_data'+str(lst_num)+str(x+1)]= round(pos1,2)
                                sample_dict['neg_data'+str(lst_num)+str(x+1)]= round(neg1,2)

                                if x== len(name_code['m'+str(lst_num)])-1:
                                    sample_dict['net_pos'+str(lst_num)]= round(net_pos,2)
                                    sample_dict['net_neg'+str(lst_num)]= round(net_neg,2)
                                    sample_dict['net_val'+str(lst_num)]= round(net_pos+net_neg,2)
                                
                            else:
                        
                                net_pos+= pos
                                net_neg+= neg

                                sample_dict['pos_data'+str(lst_num)+str(x+1)]= round(pos,2)
                                sample_dict['neg_data'+str(lst_num)+str(x+1)]= round(neg,2)

                                if x== len(name_code['m'+str(lst_num)])-1:
                                    sample_dict['net_pos'+str(lst_num)]= round(net_pos,2)
                                    sample_dict['net_neg'+str(lst_num)]= round(net_neg,2)
                                    sample_dict['net_val'+str(lst_num)]= round(net_pos+net_neg,2)

                        else:
                            net_pos+= pos
                            net_neg+= neg

                            sample_dict['pos_data'+str(lst_num)+str(x+1)]= round(pos,2)
                            sample_dict['neg_data'+str(lst_num)+str(x+1)]= round(neg,2)

                            if x== len(name_code['m'+str(lst_num)])-1:
                                sample_dict['net_pos'+str(lst_num)]= round(net_pos,2)
                                sample_dict['net_neg'+str(lst_num)]= round(net_neg,2)
                                sample_dict['net_val'+str(lst_num)]= round(net_pos+net_neg,2)

                    if lst_num== 4:
                        
                        data_to_send.append(sample_dict)
                    
        return jsonify(data_to_send)

    elif folder == "yes":

        return jsonify("Nothing Found")
