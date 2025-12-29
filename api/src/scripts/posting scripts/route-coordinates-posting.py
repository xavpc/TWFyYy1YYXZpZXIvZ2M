import requests
import time

# Configuration
BASE_URL = "http://localhost:3001"  # Adjust this to your API URL
ROUTE_ID = "7a38bdf8-176c-4573-8796-2b7e692e6cdb"  # test_route_2

# Test coordinates - making a rough circular pattern to test center point
coordinates = [
    {"latitude": 35.6895, "longitude": 139.6917},  # Point 1
    {"latitude": 35.6925, "longitude": 139.7017},  # Point 2
    {"latitude": 35.6955, "longitude": 139.6917},  # Point 3
    {"latitude": 35.6925, "longitude": 139.6817},  # Point 4
    {"latitude": 35.6895, "longitude": 139.6917},  # Point 5
    {"latitude": 35.6865, "longitude": 139.7017},  # Point 6
    {"latitude": 35.6835, "longitude": 139.6917},  # Point 7
]

def post_coordinate(coord, sequence):
    url = f"{BASE_URL}/route-coordinates"
    
    payload = {
        "route_id": ROUTE_ID,
        "latitude": coord["latitude"],
        "longitude": coord["longitude"],
        "sequence": sequence
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        print(f"Successfully posted coordinate {sequence}: {coord}")
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error posting coordinate {sequence}: {e}")
        return None

def main():
    print("Starting to post coordinates...")
    
    for i, coord in enumerate(coordinates, 1):
        result = post_coordinate(coord, i)
        if result:
            print(f"Posted coordinate {i}/{len(coordinates)}")
        time.sleep(1)  # Small delay between requests
    
    print("\nAll coordinates posted. Now fetching route details to check center point...")
    
    # Fetch route details to check center point
    try:
        response = requests.get(f"{BASE_URL}/routes/{ROUTE_ID}")
        route = response.json()
        print("\nUpdated Route Details:")
        print(f"Center Latitude: {route['data']['center_latitude']}")
        print(f"Center Longitude: {route['data']['center_longitude']}")
    except requests.exceptions.RequestException as e:
        print(f"Error fetching route details: {e}")

if __name__ == "__main__":
    main()