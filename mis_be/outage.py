
from datetime import date, timedelta, datetime
import requests

def outagedata(daterange):

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