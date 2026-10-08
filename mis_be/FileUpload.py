import os
import zipfile
import pandas as pd
from pymongo import MongoClient, ReplaceOne, errors, ASCENDING, DESCENDING
from flask import jsonify, g

def log_msg(msg):
    log_msg(msg)
    try:
        if "upload_messages" not in g:
            g.upload_messages = []
        g.upload_messages.append(msg)
    except:
        pass

from datetime import date, timedelta

# //////////////////////////////////////////////////////////////////////////////////////////Diagnostics/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


class RowCountMismatch(ValueError):
    """Raised when a parsed sheet does not have the expected number of 1-minute rows."""
    pass


def require_row_count(df, expected, label, for_date):
    if len(df) != expected:
        raise RowCountMismatch(
            f"{label}: expected {expected} rows (1 per minute) but found {len(df)} rows "
            f"for {for_date.strftime('%d-%m-%Y')} -- the file may be incomplete, truncated, "
            f"or its row layout may have changed."
        )


def _short(text, limit=200):
    """Collapse to one line and cap length so a single error never floods the terminal."""
    text = " ".join(str(text).split())
    return text if len(text) <= limit else text[:limit] + " ...[truncated]"


def diagnose_excel_error(exc, file_path, for_date=None, label=None):
    """Turn a raw exception from reading/parsing an Excel file into a precise, human-readable diagnosis."""
    date_str = f" for {for_date.strftime('%d-%m-%Y')}" if for_date is not None else ""
    tag = f"[{label}] " if label else ""
    msg = _short(exc)

    if isinstance(exc, RowCountMismatch):
        return f"{tag}DATA LENGTH MISMATCH{date_str}: {msg} (file: '{file_path}')"

    if isinstance(exc, FileNotFoundError) or (file_path and not os.path.exists(file_path)):
        return f"{tag}FILE NOT FOUND{date_str}: '{file_path}' does not exist."

    if isinstance(exc, PermissionError):
        return (f"{tag}FILE LOCKED / PERMISSION DENIED{date_str}: '{file_path}' could not be "
                f"opened (it may be open in Excel on the source machine, or locked by another process).")

    if isinstance(exc, zipfile.BadZipFile) or "not a zip file" in msg.lower():
        return (f"{tag}FILE CORRUPTED{date_str}: '{file_path}' is not a valid Excel file "
                f"(bad/incomplete .xlsx/.xlsm archive). It may be truncated or corrupted during transfer.")

    if ("Excel file format cannot be determined" in msg or "Unsupported format" in msg
            or "File is not a recognized excel file" in msg or "Can't find workbook" in msg):
        return (f"{tag}FILE FORMAT INVALID{date_str}: '{file_path}' could not be recognized as "
                f"a valid Excel file. It may be corrupted or saved with the wrong extension.")

    if isinstance(exc, ValueError) and "Worksheet named" in msg:
        return (f"{tag}SHEET NAME CHANGED{date_str}: {msg} in '{file_path}'. "
                f"The expected sheet name in the file format may have changed.")

    if isinstance(exc, KeyError):
        return (f"{tag}COLUMN/SHEET FORMAT CHANGED{date_str}: expected column or sheet key {msg} "
                f"was not found in '{file_path}'. The file layout appears to have changed.")

    if isinstance(exc, IndexError):
        return (f"{tag}ROW/COLUMN FORMAT CHANGED{date_str}: '{file_path}' does not have the "
                f"expected rows/columns at the expected position ({msg}). The file layout may have changed.")

    return f"{tag}UNEXPECTED ERROR{date_str} reading '{file_path}': {type(exc).__name__}: {msg}"


def diagnose_db_error(exc, collection_name, for_date=None, label=None):
    """Turn a raw exception from a MongoDB insert into a precise, human-readable diagnosis."""
    date_str = f" for {for_date.strftime('%d-%m-%Y')}" if for_date is not None else ""
    tag = f"[{label}] " if label else ""

    if isinstance(exc, errors.DuplicateKeyError):
        return f"{tag}DUPLICATE DATA{date_str}: data already exists in '{collection_name}' (insert skipped)."
    if isinstance(exc, errors.BulkWriteError):
        write_errors = exc.details.get('writeErrors', []) if exc.details else []
        n = len(write_errors)
        first_reason = _short(write_errors[0].get('errmsg', 'unknown reason')) if write_errors else _short(exc)
        return (f"{tag}BULK WRITE ERROR{date_str} inserting into '{collection_name}': "
                f"{n} document(s) failed - {first_reason}")
    if isinstance(exc, errors.ServerSelectionTimeoutError):
        return f"{tag}DATABASE UNREACHABLE{date_str}: could not reach MongoDB server for '{collection_name}' (connection/network issue)."
    if isinstance(exc, errors.PyMongoError):
        return f"{tag}DATABASE ERROR{date_str} inserting into '{collection_name}': {type(exc).__name__}: {_short(exc)}"
    return f"{tag}UNEXPECTED ERROR{date_str} inserting into '{collection_name}': {type(exc).__name__}: {_short(exc)}"


def ensure_indexes(collection):
    """
    Every document is uniquely identified by (station/line name 'n', day 'd').
    A unique index on (n, d) both rejects duplicate entries at the database
    layer and serves the point-lookup query pattern ({'n': x, 'd': y}) used
    everywhere in mis.py. A single-field index on 'd' backs the date-range-only
    queries used by Names()/MultiNames() (names.py). 'ym' is written but never
    queried anywhere in the codebase, so it is deliberately NOT indexed.

    Several of these collections already carry a manually-created unique
    (n, d) index under a different name (e.g. 'Name_Date') - we check for an
    index with equivalent fields/options before creating anything, so we
    never build a second, redundant copy of a multi-GB index.
    """
    try:
        existing = list(collection.list_indexes())
    except errors.PyMongoError as e:
        log_msg(f"[Startup] COULD NOT READ INDEXES on '{collection.name}': {type(e).__name__}: {_short(e)}")
        return

    def has_equivalent(fields, unique_required):
        for idx in existing:
            if set(idx['key'].keys()) == set(fields) and (not unique_required or idx.get('unique', False)):
                return True
        return False

    if not has_equivalent(['n', 'd'], unique_required=True):
        try:
            collection.create_index([('n', DESCENDING), ('d', DESCENDING)], unique=True, name='n_d_unique')
        except errors.PyMongoError as e:
            if getattr(e, 'code', None) == 11000:
                log_msg(f"[Startup] INDEX NOT CREATED on '{collection.name}': duplicate (n, d) pairs already exist "
                      f"from earlier uploads, so the unique index cannot be built until those are de-duplicated. "
                      f"Uploads to this collection will NOT be protected from duplicates until this is fixed.")
            else:
                log_msg(f"[Startup] INDEX CREATION FAILED on '{collection.name}': {type(e).__name__}: {_short(e)}")

    if not has_equivalent(['d'], unique_required=False):
        try:
            collection.create_index([('d', ASCENDING)], name='d_range')
        except errors.PyMongoError as e:
            log_msg(f"[Startup] INDEX CREATION FAILED on '{collection.name}': {type(e).__name__}: {_short(e)}")


def bulk_upsert(collection, doc_list, label, for_date, announce_success=True):
    """
    Write doc_list by upserting each document on its (n, d) key instead of
    blindly inserting. Re-running the upload for a date that is already in
    the database corrects the existing record instead of creating a duplicate,
    and the whole batch goes in one round trip (ordered=False so one bad
    document can't block the rest).
    """
    if not doc_list:
        return
    ops = [ReplaceOne({'n': doc['n'], 'd': doc['d']}, doc, upsert=True) for doc in doc_list]
    try:
        collection.bulk_write(ops, ordered=False)
        if announce_success:
            log_msg(f"Successfully upserted {label} data for {for_date.strftime('%d-%m-%Y')} ({len(ops)} record(s))")
    except Exception as e:
        log_msg(diagnose_db_error(e, collection.name, for_date, label))

# //////////////////////////////////////////////////////////////////////////////////////////Collections/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


def GetCollection():
    # CONNECTION_STRING = "mongodb://mongodb0.erldc.in:27017,mongodb1.erldc.in:27017,mongodb10.erldc.in:27017/?replicaSet=CONSERV"
    CONNECTION_STRING = "mongodb://mongodb10.erldc.in:27017,mongodb11.erldc.in:27017/?replicaSet=CONSERV"
    try:
        client = MongoClient(CONNECTION_STRING)
        db = client['mis']
        collections = [
            'voltage_data', 'line_mw_data_p1', 'line_mw_data_p2', 'line_mw_data_400_above',
            'MVAR_p1', 'MVAR_p2', 'Lines_MVAR_400_above', 'ICT_data', 'ICT_data_MW',
            'frequency_data', 'Demand_minutes', 'Drawal_minutes', 'Generator_Data',
            'Thermal_Generator', 'ISGS_Data', 'Exchange_Data'
        ]
        selected = [db[collection] for collection in collections]
        for col in selected:
            ensure_indexes(col)
        return selected
    except errors.PyMongoError as e:
        log_msg(f"[Startup] DATABASE CONNECTION FAILED: could not connect to MongoDB at '{CONNECTION_STRING}': {type(e).__name__}: {_short(e)}")
        raise


(
    voltage_data_collection, line_mw_data_collection, line_mw_data_collection1,
    line_mw_data_collection2, MVAR_P1, MVAR_P2, Lines_MVAR_400_above, ICT_data1,
    ICT_data2, frequency_data_collection, demand_collection, drawal_collection,
    Generator_DB, Th_Gen_DB, ISGS_DB, Exchange_DB
) = GetCollection()

# /////////////////////////////////////////////////////////////////////////////Voltage////////////////////////////////////////////////////////////////////////////////////////////////////////////


def Voltage(startDateObj, endDateObj, PATH):

    def InsertVoltageDfIntoDB(voltage_data_collection, df, for_date, label):

        df = df.astype('double').reset_index(drop=True)
        df.index = df.index.astype('str')
        require_row_count(df, 1440, label, for_date)

        doc_list = []
        for col in set(df.columns.get_level_values(0)):
            a = {
                "vol": df[col]['Bus-1 Voltage (kV)'].round(3).to_list(),
                "vol2": df[col]['Bus-2 Voltage (kV)'].round(3).to_list(),
                "d": pd.to_datetime(for_date),
                "ym": for_date.strftime("%Y%m"),
                "n": col}
            doc_list.append(a)

        bulk_upsert(voltage_data_collection, doc_list, label, for_date)

    def getDf220P1(file, for_date):

        df = pd.read_excel(file, sheet_name='data1', header=[2, 3])
        df.index = df['Date']['Unnamed: 1_level_1'].to_list()
        df = df.drop(columns=['Unnamed: 0_level_0', 'Date'], level=0)
        df = df.loc[:, (slice(None), ('Bus-1 Voltage (kV)',
                        'Bus-2 Voltage (kV)'))]
        df.index = pd.date_range(
            for_date, for_date + timedelta(days=1), freq='1min')[:-1]
        require_row_count(df, 1440, "220kV Voltage P1 sheet", for_date)
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
            log_msg(f"[Voltage-220P2] DATA LENGTH MISMATCH for {for_date.strftime('%d-%m-%Y')}: "
                  f"expected 1440 rows, found {len(df)} (file: '{file}').")
        return df

    def getDf400(file, for_date):

        df = pd.read_excel(file, sheet_name='Data', header=[
                           2, 3]).drop(columns=['Station'], level=0)
        df = df.loc[:, (slice(None), ('Bus-1 Voltage (kV)',
                        'Bus-2 Voltage (kV)'))][1:]
        df.index = pd.date_range(
            for_date, for_date + timedelta(days=1), freq='1min')[:-1]
        if len(df) != 1440:
            log_msg(f"[Voltage-400] DATA LENGTH MISMATCH for {for_date.strftime('%d-%m-%Y')}: "
                  f"expected 1440 rows, found {len(df)} (file: '{file}').")
        return df

    res = []
    for for_date in pd.date_range(date(startDateObj.year, startDateObj.month, startDateObj.day), date(endDateObj.year, endDateObj.month, endDateObj.day)):

        current_file = None
        try:
            current_file = PATH + \
                "220KV_Voltage_data_P1_{}.xlsm".format(
                    for_date.strftime("%d%m%Y"))
            df = getDf220P1(current_file, for_date)
            InsertVoltageDfIntoDB(voltage_data_collection, df, for_date, "220kV Voltage P1")

            current_file = PATH + \
                "220KV_Voltage_data_P2_{}.xlsm".format(
                    for_date.strftime("%d%m%Y"))
            df = getDf220P2(current_file, for_date)
            InsertVoltageDfIntoDB(voltage_data_collection, df, for_date, "220kV Voltage P2")

            current_file = PATH + \
                "400KV_Voltage_Data_{}.xlsm".format(
                    for_date.strftime("%d%m%Y"))
            df = getDf400(current_file, for_date)
            InsertVoltageDfIntoDB(voltage_data_collection, df, for_date, "400kV Voltage")

            res.append(for_date)

        except Exception as e:
            log_msg(diagnose_excel_error(e, current_file, for_date, "Voltage"))

    return jsonify({'dates': res, 'messages': getattr(g, 'upload_messages', [])})

# /////////////////////////////////////////////////////////////////////////////Frequency////////////////////////////////////////////////////////////////////////////////////////////////////////////


def Frequency(startDateObj, endDateObj, PATH):

    def insertFlowDfIntoDB(df, for_date):

        df = df.astype('double').reset_index(drop=True)
        df.index = df.index.astype('str')
        require_row_count(df, 1440, "Frequency sheet", for_date)

        doc_list = []
        try:
            for col in set(df.columns):
                a = {
                    "p": df[col].round(3).to_list(),
                    "d": pd.to_datetime(for_date),
                    "ym": for_date.strftime("%Y%m"),
                    "n": col}
                doc_list.append(a)
        except Exception as e:
            log_msg(f"[Frequency] COLUMN FORMAT ISSUE for {for_date.strftime('%d-%m-%Y')}: {type(e).__name__}: {_short(e)}")

        bulk_upsert(frequency_data_collection, doc_list, "Frequency", for_date)

    op = []
    for for_date1 in pd.date_range(date(startDateObj.year, startDateObj.month, startDateObj.day), date(endDateObj.year, endDateObj.month, endDateObj.day)):

        FILE = PATH+"BUS_FREQUENCY_220KV_and_ABOVE_{}.xlsx".format(
            for_date1.strftime("%d%m%Y"))
        try:
            df = pd.read_excel(FILE, sheet_name='Sheet1')
            df = df.drop(0)
            df = df.drop(columns=['Date'], axis=1)
            df.index = pd.date_range(
                for_date1, for_date1 + timedelta(days=1), freq='1min')[:-1]

            insertFlowDfIntoDB(df, for_date1)

            op.append(for_date1)

        except Exception as e:
            log_msg(diagnose_excel_error(e, FILE, for_date1, "Frequency"))

    return jsonify({'dates': op, 'messages': getattr(g, 'upload_messages', [])})

# /////////////////////////////////////////////////////////////////////////////Lines////////////////////////////////////////////////////////////////////////////////////////////////////////////


def Lines(startDateObj, endDateObj, PATH):

    LinesMVARFileInsert(startDateObj, endDateObj, PATH)

    def insertFlowDfIntoDB(df, df1, df2, df3, for_date):

        def prep(d, label):
            if not isinstance(d, pd.DataFrame):
                return None
            try:
                d = d.astype('double').reset_index(drop=True)
                d.index = d.index.astype('str')
                require_row_count(d, 1440, label, for_date)
                return d
            except Exception as e:
                log_msg(f"[{label}] {_short(e)}")
                return None

        df = prep(df, "Lines-P1")
        df1 = prep(df1, "Lines-P2")
        df2 = prep(df2, "Lines-400kV")
        df3 = prep(df3, "Lines-765kV")

        doc_list, doc_list1, doc_list2, doc_list3 = [], [], [], []

        if df is not None:
            for col in set(df.columns):
                doc_list.append({
                    "p": df[col].round(3).to_list(),
                    "d": pd.to_datetime(for_date),
                    "ym": for_date.strftime("%Y%m"),
                    "n": col})

        if df1 is not None:
            for col1 in set(df1.columns):
                doc_list1.append({
                    "p": df1[col1].round(3).to_list(),
                    "d": pd.to_datetime(for_date),
                    "ym": for_date.strftime("%Y%m"),
                    "n": col1})

        if df2 is not None:
            for col2 in set(df2.columns):
                doc_list2.append({
                    "p": df2[col2].round(3).to_list(),
                    "d": pd.to_datetime(for_date),
                    "ym": for_date.strftime("%Y%m"),
                    "n": col2})

        if df3 is not None:
            for col3 in set(df3.columns):
                doc_list3.append({
                    "p": df3[col3].round(3).to_list(),
                    "d": pd.to_datetime(for_date),
                    "ym": for_date.strftime("%Y%m"),
                    "n": col3})

        bulk_upsert(line_mw_data_collection, doc_list, "Lines-P1", for_date)
        bulk_upsert(line_mw_data_collection1, doc_list1, "Lines-P2", for_date)
        bulk_upsert(line_mw_data_collection2, doc_list2, "Lines-400kV", for_date)
        bulk_upsert(line_mw_data_collection2, doc_list3, "Lines-765kV", for_date)

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
                    for_date1, for_date1 + timedelta(days=1), freq='1min')[:-1]
                df.columns = df.columns.map(
                    lambda x: x[0]+": " + x[1] if 'Unnamed' not in x[1] else x[0]+': '+((x[0].split('-'))[0].split(' '))[-1] + ' end')

            except Exception as e:
                log_msg(diagnose_excel_error(e, FILE, for_date1, "Lines-P1"))

            try:
                FILE1 = PATH+"220_LINES_MW_P2_{}.xlsm".format(
                    for_date1.strftime("%d%m%Y"))
                df1 = pd.read_excel(FILE1, sheet_name='Data', header=[2, 3])
                df1 = df1.drop(columns=['Unnamed: 0_level_0', 'Date'], level=0)
                df1 = df1[17:1440+17]
                df1.index = pd.date_range(
                    for_date1, for_date1 + timedelta(days=1), freq='1min')[:-1]
                df1.columns = df1.columns.map(
                    lambda x1: x1[0]+": " + x1[1] if 'Unnamed' not in x1[1] else x1[0]+': '+((x1[0].split('-'))[0].split(' '))[-1] + ' end')

            except Exception as e:
                log_msg(diagnose_excel_error(e, FILE1, for_date1, "Lines-P2"))

            try:

                FILE2 = PATH+"400_LINES_MW_{}.xlsm".format(
                    for_date1.strftime("%d%m%Y"))

                df2 = pd.read_excel(
                    FILE2, sheet_name='Data', header=[2, 3])[:1440]

                df2 = df2.drop(columns=['Unnamed: 0_level_0', 'Date'], level=0)

                df2.index = pd.date_range(
                    for_date1, for_date1 + timedelta(days=1), freq='1min')[:-1]

                df2.columns = df2.columns.map(
                    lambda x1: x1[0]+": " + x1[1] if 'Unnamed' not in x1[1] else x1[0]+': '+((x1[0].split('-'))[0].split(' '))[-1] + ' end')

            except Exception as e:
                log_msg(diagnose_excel_error(e, FILE2, for_date1, "Lines-400kV(.xlsm)"))

            try:
                FILE2 = PATH+"400_LINES_MW_{}.xlsx".format(
                    for_date1.strftime("%d%m%Y"))

                df2 = pd.read_excel(
                    FILE2, sheet_name='Data', header=[2, 3])

                df2 = df2.drop(columns=['Unnamed: 0_level_0', 'Date'], level=0)

                df2.index = pd.date_range(
                    for_date1, for_date1 + timedelta(days=1), freq='1min')[:-1]

                df2.columns = df2.columns.map(
                    lambda x1: x1[0]+": " + x1[1] if 'Unnamed' not in x1[1] else x1[0]+': '+((x1[0].split('-'))[0].split(' '))[-1] + ' end')
            except Exception as e:
                log_msg(diagnose_excel_error(e, FILE2, for_date1, "Lines-400kV(.xlsx)"))

            try:
                FILE3 = PATH+"765_LINES_MW_{}.xlsm".format(
                    for_date1.strftime("%d%m%Y"))

                df3 = pd.read_excel(
                    FILE3, sheet_name='Data', header=[2, 3])[:1440]

                df3 = df3.drop(columns=['Unnamed: 0_level_0', 'Date'], level=0)

                df3.index = pd.date_range(
                    for_date1, for_date1 + timedelta(days=1), freq='1min')[:-1]
                df3.columns = df3.columns.map(
                    lambda x1: x1[0]+": " + x1[1] if 'Unnamed' not in x1[1] else x1[0]+': '+((x1[0].split('-'))[0].split(' '))[-1] + ' end')

            except Exception as e:
                log_msg(diagnose_excel_error(e, FILE3, for_date1, "Lines-765kV(.xlsm)"))

            try:
                FILE3 = PATH+"765_LINES_MW_{}.xlsx".format(
                    for_date1.strftime("%d%m%Y"))
                df3 = pd.read_excel(
                    FILE3, sheet_name='Data', header=[2, 3])[:1440]

                df3 = df3.drop(columns=['Unnamed: 0_level_0', 'Date'], level=0)

                df3.index = pd.date_range(
                    for_date1, for_date1 + timedelta(days=1), freq='1min')[:-1]
                df3.columns = df3.columns.map(
                    lambda x1: x1[0]+": " + x1[1] if 'Unnamed' not in x1[1] else x1[0]+': '+((x1[0].split('-'))[0].split(' '))[-1] + ' end')

            except Exception as e:
                log_msg(diagnose_excel_error(e, FILE3, for_date1, "Lines-765kV(.xlsx)"))

            insertFlowDfIntoDB(df, df1, df2, df3, for_date1)

            op.append(for_date1)

        except Exception as e:
            log_msg(f"[Lines] UNEXPECTED ERROR processing {for_date1.strftime('%d-%m-%Y')}: {type(e).__name__}: {_short(e)}")

    return jsonify({'dates': op, 'messages': getattr(g, 'upload_messages', [])})

# /////////////////////////////////////////////////////////////////////////////LinesMVAR////////////////////////////////////////////////////////////////////////////////////////////////////////////


def LinesMVARFileInsert(startDateObj, endDateObj, PATH):

    def insertFlowDfIntoDB(df, df1, df2, df3, for_date):

        df = df.astype('double').reset_index(drop=True)
        df.index = df.index.astype('str')
        require_row_count(df, 1440, "220kV Lines MVAR P1", for_date)

        df1 = df1.astype('double').reset_index(drop=True)
        df1.index = df1.index.astype('str')
        require_row_count(df1, 1440, "220kV Lines MVAR P2", for_date)

        df2 = df2.astype('double').reset_index(drop=True)
        df2.index = df2.index.astype('str')
        require_row_count(df2, 1440, "400kV Lines MVAR", for_date)

        df3 = df3.astype('double').reset_index(drop=True)
        df3.index = df3.index.astype('str')
        require_row_count(df3, 1440, "765kV Lines MVAR", for_date)

        doc_list = []
        df = df.loc[:, ~df.columns.duplicated()].copy()
        for col in set(df.columns):
            a = {
                "p": df[col].round(3).to_list(),
                "d": pd.to_datetime(for_date),
                "ym": for_date.strftime("%Y%m"),
                "n": col}
            doc_list.append(a)

        doc_list1 = []
        df1 = df1.loc[:, ~df1.columns.duplicated()].copy()
        for col1 in set(df1.columns):

            b = {
                "p": df1[col1].round(3).to_list(),
                "d": pd.to_datetime(for_date),
                "ym": for_date.strftime("%Y%m"),
                "n": col1}
            doc_list1.append(b)

        doc_list2 = []
        try:
            df2 = df2.loc[:, ~df2.columns.duplicated()].copy()
            for col2 in set(df2.columns):

                c = {
                    "p": df2[col2].round(3).to_list(),
                    "d": pd.to_datetime(for_date),
                    "ym": for_date.strftime("%Y%m"),
                    "n": col2}
                doc_list2.append(c)

        except Exception as e:
            log_msg(f"[LinesMVAR-400kV] COLUMN FORMAT ISSUE for {for_date.strftime('%d-%m-%Y')}: {type(e).__name__}: {_short(e)}")

        doc_list3 = []
        try:
            df3 = df3.loc[:, ~df3.columns.duplicated()].copy()
            for col3 in set(df3.columns):

                d = {
                    "p": df3[col3].round(3).to_list(),
                    "d": pd.to_datetime(for_date),
                    "ym": for_date.strftime("%Y%m"),
                    "n": col3}
                doc_list3.append(d)
        except Exception as e:
            log_msg(f"[LinesMVAR-765kV] COLUMN FORMAT ISSUE for {for_date.strftime('%d-%m-%Y')}: {type(e).__name__}: {_short(e)}")

        bulk_upsert(MVAR_P1, doc_list, "LinesMVAR-P1", for_date)
        bulk_upsert(MVAR_P2, doc_list1, "LinesMVAR-P2", for_date)
        bulk_upsert(Lines_MVAR_400_above, doc_list2, "LinesMVAR-400kV", for_date)
        bulk_upsert(Lines_MVAR_400_above, doc_list3, "LinesMVAR-765kV", for_date)

    op = []
    for for_date1 in pd.date_range(date(startDateObj.year, startDateObj.month, startDateObj.day), date(endDateObj.year, endDateObj.month, endDateObj.day)):

        current_file = None
        try:

            current_file = PATH+"220KV_Lines_MVAR_P1_{}.xlsm".format(
                for_date1.strftime("%d%m%Y"))
            df = pd.read_excel(current_file, sheet_name='Data', header=[2, 3])
            df = df.drop(columns=['Unnamed: 0_level_0', 'Date'], level=0)

            df.index = pd.date_range(
                for_date1, for_date1 + timedelta(days=1), freq='1min')[:-1]
            df.columns = df.columns.map(
                lambda x: x[0]+": " + x[1] if 'Unnamed' not in x[1] else x[0]+': '+((x[0].split('-'))[0].split(' '))[-1] + ' end')

            current_file = PATH+"220_LINES_MVAR_P2_{}.xlsm".format(
                for_date1.strftime("%d%m%Y"))
            df1 = pd.read_excel(current_file, sheet_name='Data', header=[2, 3])
            df1 = df1.drop(columns=['Unnamed: 0_level_0', 'Date'], level=0)

            df1.index = pd.date_range(
                for_date1, for_date1 + timedelta(days=1), freq='1min')[:-1]
            df1.columns = df1.columns.map(
                lambda x1: x1[0]+": " + x1[1] if 'Unnamed' not in x1[1] else x1[0]+': '+((x1[0].split('-'))[0].split(' '))[-1] + ' end')

            current_file = PATH+"400_LINES_MVAR_{}.xlsx".format(
                for_date1.strftime("%d%m%Y"))

            df2 = pd.read_excel(current_file, sheet_name='Data', header=[2, 3])[:1440]

            df2 = df2.drop(columns=['Unnamed: 0_level_0', 'Date'], level=0)

            df2.index = pd.date_range(
                for_date1, for_date1 + timedelta(days=1), freq='1min')[:-1]

            df2.columns = df2.columns.map(
                lambda x: x[0]+": " + x[1] if 'Unnamed' not in x[1] else x[0]+': '+((x[0].split('-'))[0].split(' '))[-1] + ' end')

            current_file = PATH+"765_LINES_MVAR_{}.xlsm".format(
                for_date1.strftime("%d%m%Y"))
            df3 = pd.read_excel(current_file, sheet_name='Data', header=[2, 3])

            df3 = df3.drop(columns=['Unnamed: 0_level_0', 'Date'], level=0)

            df3.index = pd.date_range(
                for_date1, for_date1 + timedelta(days=1), freq='1min')[:-1]
            df3.columns = df3.columns.map(
                lambda x1: x1[0]+": " + x1[1] if 'Unnamed' not in x1[1] else x1[0]+': '+((x1[0].split('-'))[0].split(' '))[-1] + ' end')

            insertFlowDfIntoDB(
                df, df1, df2, df3, for_date1)

            op.append(for_date1)

        except Exception as e:
            log_msg(diagnose_excel_error(e, current_file, for_date1, "LinesMVAR"))

    return jsonify({'dates': op, 'messages': getattr(g, 'upload_messages', [])})

# /////////////////////////////////////////////////////////////////////////////ICT////////////////////////////////////////////////////////////////////////////////////////////////////////////


def ICT(startDateObj, endDateObj, PATH):

    def insertFlowDfIntoDB(ICT_data, df, for_date):

        data_list1 = []

        for item in df:

            item = item.astype('double').reset_index(drop=True)
            item.index = item.index.astype('str')

            name = item.name
            data = (item.to_list())[:-1]
            require_row_count(data, 1440, f"ICT MVAR column '{name}'", for_date)

            a = {
                "p": data,
                "d": pd.to_datetime(for_date),
                "ym": for_date.strftime("%Y%m"),
                "n": name}

            data_list1.append(a)

        bulk_upsert(ICT_data, data_list1, "ICT-MVAR", for_date, announce_success=False)

    op = []
    for for_date1 in pd.date_range(date(startDateObj.year, startDateObj.month, startDateObj.day), date(endDateObj.year, endDateObj.month, endDateObj.day)):

        FILE = PATH+"765_400_400_220_ICT_MVAR_{}.xlsx".format(
            for_date1.strftime("%d%m%Y"))
        try:

            df = pd.read_excel(FILE, sheet_name='Sheet1', header=[2, 3])[:1441]

            df = df.drop(columns=['Unnamed: 0_level_0', 'Date'], level=0)

            df.index = pd.date_range(
                for_date1, for_date1 + timedelta(days=1), freq='1min')

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

        except Exception as e:
            log_msg(diagnose_excel_error(e, FILE, for_date1, "ICT-MVAR"))

    def ICTFileInsertMW(startDateObj, endDateObj, PATH):

        def insertFlowDfIntoDB(ICT_data, df, for_date):

            valid_docs = []
            for item in df:

                try:
                    name = item.name
                    data = (item.to_list())

                    if data[0] != data[0] and data[-1] != data[-1]:
                        data = [0]*1440

                    if (len(data) != 1440):
                        raise RowCountMismatch(
                            f"ICT MW column '{name}': expected 1440 rows but found {len(data)} "
                            f"for {for_date.strftime('%d-%m-%Y')}.")

                    valid_docs.append({
                        "p": data,
                        "d": pd.to_datetime(for_date),
                        "ym": for_date.strftime("%Y%m"),
                        "n": name})

                except Exception as e:
                    log_msg(f"[ICT-MW] {_short(e)}")
                    continue

            bulk_upsert(ICT_data, valid_docs, "ICT-MW", for_date, announce_success=False)
            return 'res'

        op = []
        for for_date1 in pd.date_range(date(startDateObj.year, startDateObj.month, startDateObj.day), date(endDateObj.year, endDateObj.month, endDateObj.day)):

            FILE = PATH+"765_400_400_220_ICT_MW_{}.xlsx".format(
                for_date1.strftime("%d%m%Y"))
            try:

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

                insertFlowDfIntoDB(ICT_data2, data_list, for_date1)

                op.append(for_date1)

            except Exception as e:
                log_msg(diagnose_excel_error(e, FILE, for_date1, "ICT-MW"))

        return jsonify({'dates': op, 'messages': getattr(g, 'upload_messages', [])})

    def ICTFileInsertMW_132_220(startDateObj, endDateObj, PATH):

        for for_date1 in pd.date_range(date(startDateObj.year, startDateObj.month, startDateObj.day), date(endDateObj.year, endDateObj.month, endDateObj.day)):

            FILE = PATH+"220_132_ICT_MW_{}.xlsx".format(
                for_date1.strftime("%d%m%Y"))
            try:
                df = pd.read_excel(FILE, sheet_name='Sheet1', header=[2, 3])[:1444]
                df = df.drop(columns=['Unnamed: 0_level_0'], level=0)
                df = df.drop(columns=['Date'], level=0)
                col_list = list(df.columns)

                for i in range(len(col_list)):
                    if i % 2 == 0:
                        col_list[i] = col_list[i][0]+": 220 KV Side MW"
                    else:
                        col_list[i] = col_list[i][0]+": 132 KV Side MW"

                df.columns = col_list

                valid_docs = [{
                    "p": list(df[item]),
                    "d": pd.to_datetime(for_date1),
                    "ym": for_date1.strftime("%Y%m"),
                    "n": item} for item in col_list]

                bulk_upsert(ICT_data2, valid_docs, "ICT-MW-132/220", for_date1, announce_success=False)

            except Exception as e:
                log_msg(diagnose_excel_error(e, FILE, for_date1, "ICT-MW-132/220"))

    ICTFileInsertMW(startDateObj, endDateObj, PATH)
    ICTFileInsertMW_132_220(startDateObj, endDateObj, PATH)

    return jsonify({'dates': op, 'messages': getattr(g, 'upload_messages', [])})


# /////////////////////////////////////////////////////////////////////////////Demand////////////////////////////////////////////////////////////////////////////////////////////////////////////


def Demand(startDateObj, endDateObj, PATH):

    def insertFlowDfIntoDB(demand_collection, drawal_collection, df, df1, for_date):

        df = df.astype('double').reset_index(drop=True)
        df.index = df.index.astype('str')
        require_row_count(df, 1440, "State Demand sheet", for_date)

        doc_list = []
        for col in set(df.columns):
            a = {
                "p": df[col].round(3).to_list(),
                "d": pd.to_datetime(for_date),
                "ym": for_date.strftime("%Y%m"),
                "n": col}
            doc_list.append(a)

        df1 = df1.astype('double').reset_index(drop=True)
        df1.index = df1.index.astype('str')
        require_row_count(df1, 1440, "State Exchange (drawal) sheet", for_date)

        doc_list1 = []
        for col1 in set(df1.columns):
            b = {
                "p": df1[col1].round(3).to_list(),
                "d": pd.to_datetime(for_date),
                "ym": for_date.strftime("%Y%m"),
                "n": col1}
            doc_list1.append(b)

        bulk_upsert(drawal_collection, doc_list1, "Demand-Drawal", for_date, announce_success=False)
        bulk_upsert(demand_collection, doc_list, "Demand", for_date, announce_success=False)

    op = []
    for for_date1 in pd.date_range(date(startDateObj.year, startDateObj.month, startDateObj.day), date(endDateObj.year, endDateObj.month, endDateObj.day)):

        current_file = None
        try:

            current_file = PATH+"Er_web_state_demand_{}.xlsx".format(
                for_date1.strftime("%d%m%Y"))

            df = pd.read_excel(current_file, sheet_name='Sheet1')
            df = df.drop(0)

            df = df.drop(columns=['Unnamed: 0'])

            df.index = pd.date_range(
                for_date1, for_date1 + timedelta(days=1), freq='1min')[:-1]

            current_file = PATH+"Er_web_state_exchange_{}.xlsx".format(
                for_date1.strftime("%d%m%Y"))

            df1 = pd.read_excel(current_file, sheet_name='Sheet1')
            df1 = df1.drop(0)

            df1 = df1.drop(columns=['Unnamed: 0'])

            df1.index = pd.date_range(
                for_date1, for_date1 + timedelta(days=1), freq='1min')[:-1]

            insertFlowDfIntoDB(demand_collection,
                               drawal_collection, df, df1, for_date1)

            op.append(for_date1)

        except Exception as e:
            log_msg(diagnose_excel_error(e, current_file, for_date1, "Demand"))

    return jsonify({'dates': op, 'messages': getattr(g, 'upload_messages', [])})

# /////////////////////////////////////////////////////////////////////////////Generator////////////////////////////////////////////////////////////////////////////////////////////////////////////


def Generator(startDateObj, endDateObj, PATH):

    def insertFlowDfIntoDB(Generator_DB, df, for_date):

        df = df.astype('double').reset_index(drop=True)
        df.index = df.index.astype('str')
        require_row_count(df, 1440, "Generator MW/MVAR sheet", for_date)

        doc_list = []
        for col in set(df.columns):
            a = {
                "p": df[col].round(3).to_list(),
                "d": pd.to_datetime(for_date),
                "ym": for_date.strftime("%Y%m"),
                "n": col}
            doc_list.append(a)

        bulk_upsert(Generator_DB, doc_list, "Generator", for_date, announce_success=False)

    op = []
    for for_date1 in pd.date_range(date(startDateObj.year, startDateObj.month, startDateObj.day), date(endDateObj.year, endDateObj.month, endDateObj.day)):

        FILE = PATH+"ER_Generator_MW_MVAR_Exchange_data_{}.xlsm".format(
            for_date1.strftime("%d%m%Y"))
        try:
            df = pd.read_excel(FILE, sheet_name='Data1')
            df = df.drop(0)
            df = df.drop(columns=['Unnamed: 0', "Unnamed: 1"])[0:1442]
            df.columns = df.iloc[0]
            df = df.drop(1)
            df = df.drop(2)
            df.index = pd.date_range(
                for_date1, for_date1 + timedelta(days=1), freq='1min')[:-1]

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

        except Exception as e:
            log_msg(diagnose_excel_error(e, FILE, for_date1, "Generator"))

    return jsonify({'dates': op, 'messages': getattr(g, 'upload_messages', [])})


def Thermal_Generator(startDateObj, endDateObj, PATH):

    def insertFlowDfIntoDB(Th_Gen_DB, df, for_date):

        df = df.astype('double').reset_index(drop=True)
        df.index = df.index.astype('str')
        require_row_count(df, 1440, "Thermal Generator sheet", for_date)

        doc_list = []
        for col in set(df.columns):
            a = {
                "p": df[col].round(3).to_list(),
                "d": pd.to_datetime(for_date),
                "ym": for_date.strftime("%Y%m"),
                "n": col}
            doc_list.append(a)

        bulk_upsert(Th_Gen_DB, doc_list, "Thermal-Generator", for_date, announce_success=False)

    op = []
    for for_date1 in pd.date_range(date(startDateObj.year, startDateObj.month, startDateObj.day), date(endDateObj.year, endDateObj.month, endDateObj.day)):

        FILE = PATH+"ER_THERMAL_GEN_{}.xlsx".format(for_date1.strftime("%d%m%Y"))
        try:
            df = pd.read_excel(FILE, sheet_name='DATA')
            df = df.drop(1)

            df = df.drop(columns=['Unnamed: 0'])[0:1442]

            df.columns = df.iloc[0]

            df = df.drop(0)

            # Drop all columns after 'ER_Total'
            if 'ER_Total' in df.columns:
                df = df.loc[:, :'ER_Total']

            col_name = [col + " MW" for col in df.columns.tolist()]
            df.columns = col_name

            df.index = pd.date_range(for_date1, for_date1 + timedelta(days=1), freq='1min')[:-1]
            insertFlowDfIntoDB(Th_Gen_DB, df, for_date1)

            op.append(for_date1)

        except Exception as e:
            log_msg(diagnose_excel_error(e, FILE, for_date1, "Thermal-Generator"))

    return jsonify({'dates': op, 'messages': getattr(g, 'upload_messages', [])})


# /////////////////////////////////////////////////////////////////////////////ISGS////////////////////////////////////////////////////////////////////////////////////////////////////////////


def ISGS(startDateObj, endDateObj, PATH):

    def insertFlowDfIntoDB(ISGS_DB, df, for_date):

        df = df.astype('double').reset_index(drop=True)
        df.index = df.index.astype('str')
        require_row_count(df, 1440, "ISGS Generation sheet", for_date)

        doc_list = []
        for col in set(df.columns):
            a = {
                "p": df[col].round(3).to_list(),
                "d": pd.to_datetime(for_date),
                "ym": for_date.strftime("%Y%m"),
                "n": col}
            doc_list.append(a)

        bulk_upsert(ISGS_DB, doc_list, "ISGS", for_date)

    op = []
    for for_date1 in pd.date_range(date(startDateObj.year, startDateObj.month, startDateObj.day), date(endDateObj.year, endDateObj.month, endDateObj.day)):

        FILE = PATH+"Er_web_isgs_gen_{}.xlsx".format(
            for_date1.strftime("%d%m%Y"))
        try:
            df = pd.read_excel(FILE, sheet_name='Sheet1')
            df = df.drop(0)
            df = df.drop(columns=['Unnamed: 0', ])[0:1442]

            df.index = pd.date_range(
                for_date1, for_date1 + timedelta(days=1), freq='1min')[:-1]

            insertFlowDfIntoDB(ISGS_DB, df, for_date1)

            op.append(for_date1)

        except Exception as e:
            log_msg(diagnose_excel_error(e, FILE, for_date1, "ISGS"))

    return jsonify({'dates': op, 'messages': getattr(g, 'upload_messages', [])})

# //////////////////////////////////////////////////////////////////////Exchange////////////////////////////////////////////////////////////////////////////////////////////////////////////


def Exchange(startDateObj, endDateObj, PATH):

    def insertFlowDfIntoDB(df, for_date):

        name_dict = {'NR_NIC': 'NR EXCHANGE',
                     'SR_NIC': 'SR EXCHANGE',
                     'WR_NIC': 'WR EXCHANGE',
                     'NE_NIC': 'NER EXCHANGE',
                     'NEPAL ACTUAL': 'NEPAL(ISTS) EXCHANGE',
                     'BDESH_NIC': 'BDESH EXCHANGE',
                     'IR ACTUAL': 'IR ACTUAL',
                     'BHUTAN EXCHANGE': 'BHUTAN EXCHANGE',
                     'NEA_BIHAR EXCHANGE': 'NEA_BIHAR EXCHANGE'}

        checklist = ['NR EXCHANGE', 'SR EXCHANGE', 'WR EXCHANGE', 'NER EXCHANGE', 'NEPAL(ISTS) EXCHANGE',
                     'BDESH EXCHANGE', 'IR ACTUAL', 'BHUTAN EXCHANGE', 'NEA_BIHAR EXCHANGE']

        df = df.astype('double').reset_index(drop=True)
        df.index = df.index.astype('str')
        require_row_count(df, 1440, "International/Regional Exchange sheet", for_date)

        doc_list = []
        try:

            for col in set(df.columns):
                checklist.remove(name_dict[col])
                a = {
                    "p": df[col].round(3).to_list(),
                    "d": pd.to_datetime(for_date),
                    "ym": for_date.strftime("%Y%m"),
                    "n": name_dict[col]}
                doc_list.append(a)
        except Exception as e:
            log_msg(f"[Exchange] COLUMN MAPPING ISSUE for {for_date.strftime('%d-%m-%Y')}: "
                  f"unexpected column {_short(e)} in sheet - the Exchange file's column headers may have changed.")

        for item in checklist:
            doc_list.append({
                "p": [0]*1440,
                "d": pd.to_datetime(for_date),
                "ym": for_date.strftime("%Y%m"),
                "n": item
            })

        bulk_upsert(Exchange_DB, doc_list, "Exchange", for_date)

    op = []
    for for_date1 in pd.date_range(date(startDateObj.year, startDateObj.month, startDateObj.day), date(endDateObj.year, endDateObj.month, endDateObj.day)):

        FILE = PATH+"Er_web_ir_int_exch_{}.xlsx".format(
            for_date1.strftime("%d%m%Y"))
        try:
            df = pd.read_excel(FILE, sheet_name='Sheet1')

            df = df.drop(0)
            df = df.drop(columns=['Unnamed: 0'], axis=1)
            df.index = pd.date_range(
                for_date1, for_date1 + timedelta(days=1), freq='1min')[:-1]

            insertFlowDfIntoDB(df, for_date1)
            op.append(for_date1)

        except Exception as e:
            log_msg(diagnose_excel_error(e, FILE, for_date1, "Exchange"))

    return jsonify({'dates': op, 'messages': getattr(g, 'upload_messages', [])})
