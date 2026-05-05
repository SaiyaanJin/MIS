import requests
import json

BASE_URL = "http://127.0.0.1:5010"

def test_demand_names():
    print("Testing /demandnames...")
    params = {
        "startDate": "2021-01-01 00:00",
        "endDate": "2021-01-01 23:59"
    }
    response = requests.post(f"{BASE_URL}/demandnames", params=params)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        names = response.json()
        print(f"Found {len(names)} names.")
        return names
    else:
        print(f"Error: {response.text}")
        return []

def test_multi_demand_names():
    print("\nTesting /multidemandnames (Type=Date)...")
    params = {
        "MultistartDate": "2021-01-01",
        "Type": "Date"
    }
    response = requests.post(f"{BASE_URL}/multidemandnames", params=params)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        names = response.json()
        print(f"Found {len(names)} names.")
    else:
        print(f"Error: {response.text}")

if __name__ == "__main__":
    try:
        names = test_demand_names()
        test_multi_demand_names()
    except Exception as e:
        print(f"Request failed: {e}. Is the server running?")
