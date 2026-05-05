import requests
import json

BASE_URL = "http://127.0.0.1:5010"

def test_multi_ict_names():
    print("Testing /MultiIctNames...")
    params = {
        "MultistartDate": "2021-01-01",
        "Type": "Date"
    }
    response = requests.post(f"{BASE_URL}/MultiIctNames", params=params)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        names = response.json()
        print(f"Found {len(names)} names.")
        return names
    else:
        print(f"Error: {response.text}")
        return []

def test_get_multi_ict_data(names):
    if not names:
        return
    print("\nTesting /GetMultiIctData...")
    # Select first station name
    station = names[0].replace("&", "%26")
    params = {
        "MultistartDate": "2021-01-01",
        "MultistationName": station,
        "Type": "Date",
        "time": "1"
    }
    response = requests.post(f"{BASE_URL}/GetMultiIctData", params=params)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        # Data should be a list where the last element is Date_Time
        # and other elements are station data with 'line', 'max', 'min', 'avg'
        for item in data:
            if "stationName" in item:
                print(f"Station: {item['stationName']}")
                print(f"Keys: {list(item.keys())}")
                print(f"Line length: {len(item.get('line', []))}")
                print(f"Stats: Max={item.get('max')}, Avg={item.get('avg')}")
            elif "Date_Time" in item:
                print(f"Date_Time length: {len(item.get('Date_Time', []))}")
    else:
        print(f"Error: {response.text}")

def test_get_ict_data(names):
    if not names:
        return
    print("\nTesting /GetIctData...")
    # Select first station name
    station = names[0].replace("&", "%26")
    params = {
        "startDate": "2021-01-01 00:00",
        "endDate": "2021-01-01 23:59",
        "stationName": station,
        "time": "1"
    }
    response = requests.post(f"{BASE_URL}/GetIctData", params=params)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        # Should be a list
        for item in data:
            if isinstance(item, dict) and "stationName" in item:
                print(f"Station: {item['stationName']}")
                print(f"Keys: {list(item.keys())}")
                print(f"Line length: {len(item.get('line', []))}")
            elif isinstance(item, dict) and "Date_Time" in item:
                print(f"Date_Time length: {len(item.get('Date_Time', []))}")
    else:
        print(f"Error: {response.text}")

if __name__ == "__main__":
    try:
        names = test_multi_ict_names()
        test_get_multi_ict_data(names)
        test_get_ict_data(names)
    except Exception as e:
        print(f"Request failed: {e}. Is the server running?")
