import requests
import json

BASE_URL = "http://127.0.0.1:5010"

def test_isgs_names():
    print("Testing /isgsnames...")
    params = {
        "startDate": "2022-01-01 00:00",
        "endDate": "2022-01-01 23:59"
    }
    # Test lowercase route
    response = requests.post(f"{BASE_URL}/isgsnames", params=params)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        names = response.json()
        print(f"Found {len(names)} names.")
        return names
    else:
        print(f"Error: {response.text}")
        return []

def test_multi_isgs_names():
    print("\nTesting /multiisgsnames (Type=Date)...")
    params = {
        "MultistartDate": "2022-01-01",
        "Type": "Date"
    }
    response = requests.post(f"{BASE_URL}/multiisgsnames", params=params)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        names = response.json()
        print(f"Found {len(names)} names.")
    else:
        print(f"Error: {response.text}")

def test_get_isgs_data(names):
    if not names:
        return
    print("\nTesting /getisgsdata...")
    # Select first station name
    station = names[0].replace("&", "%26")
    params = {
        "startDate": "2022-01-01 00:00",
        "endDate": "2022-01-01 23:59",
        "stationName": station,
        "time": "15"
    }
    response = requests.post(f"{BASE_URL}/getisgsdata", params=params)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        for item in data:
            if isinstance(item, dict) and "stationName" in item:
                print(f"Station: {item['stationName']}")
                print(f"Keys: {list(item.keys())}")
                print(f"Output length: {len(item.get('output', []))}")
                print(f"Stats: Max={item.get('max')}")
            elif isinstance(item, dict) and "Date_Time" in item:
                print(f"Date_Time length: {len(item.get('Date_Time', []))}")
    else:
        print(f"Error: {response.text}")

def test_get_multi_isgs_data(names):
    if not names:
        return
    print("\nTesting /getmultiisgsdata (Type=Date)...")
    # Select first station name
    station = names[0].replace("&", "%26")
    params = {
        "MultistartDate": "2022-01-01",
        "MultistationName": station,
        "Type": "Date",
        "time": "15"
    }
    response = requests.post(f"{BASE_URL}/getmultiisgsdata", params=params)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        for item in data:
            if isinstance(item, dict) and "stationName" in item:
                print(f"Station: {item['stationName']}")
                print(f"Keys: {list(item.keys())}")
                print(f"Output length: {len(item.get('output', []))}")
            elif isinstance(item, dict) and "Date_Time" in item:
                print(f"Date_Time length: {len(item.get('Date_Time', []))}")
    else:
        print(f"Error: {response.text}")

if __name__ == "__main__":
    try:
        names = test_isgs_names()
        test_multi_isgs_names()
        test_get_isgs_data(names)
        test_get_multi_isgs_data(names)
    except Exception as e:
        print(f"Request failed: {e}. Is the server running?")
