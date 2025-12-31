import requests
import json
from typing import List, Tuple
from datetime import datetime, timedelta
import random

# Each device will have 5-10 predefined points along a path
DEVICE_LOCATIONS_DATA: List[Tuple[str, float, float]] = [
    # Device Sakura - Moving around Tokyo Station area
    ('0a12b5ae-e848-11ef-bc07-c59fca171525', 35.6812, 139.7671),
    ('0a12b5ae-e848-11ef-bc07-c59fca171525', 35.6820, 139.7680),
    ('0a12b5ae-e848-11ef-bc07-c59fca171525', 35.6828, 139.7689),
    ('0a12b5ae-e848-11ef-bc07-c59fca171525', 35.6836, 139.7698),
    ('0a12b5ae-e848-11ef-bc07-c59fca171525', 35.6844, 139.7707),
    ('0a12b5ae-e848-11ef-bc07-c59fca171525', 35.6852, 139.7716),
    ('0a12b5ae-e848-11ef-bc07-c59fca171525', 35.6860, 139.7725),

    # Device Ume - Moving around Shinjuku area
    ('0a320373-e848-11ef-bc07-c59fca171525', 35.6896, 139.7006),
    ('0a320373-e848-11ef-bc07-c59fca171525', 35.6905, 139.7015),
    ('0a320373-e848-11ef-bc07-c59fca171525', 35.6914, 139.7024),
    ('0a320373-e848-11ef-bc07-c59fca171525', 35.6923, 139.7033),
    ('0a320373-e848-11ef-bc07-c59fca171525', 35.6932, 139.7042),
    ('0a320373-e848-11ef-bc07-c59fca171525', 35.6941, 139.7051),

    # Device Momiji - Moving around Shibuya area
    ('0a513ed1-e848-11ef-bc07-c59fca171525', 35.6580, 139.7016),
    ('0a513ed1-e848-11ef-bc07-c59fca171525', 35.6589, 139.7025),
    ('0a513ed1-e848-11ef-bc07-c59fca171525', 35.6598, 139.7034),
    ('0a513ed1-e848-11ef-bc07-c59fca171525', 35.6607, 139.7043),
    ('0a513ed1-e848-11ef-bc07-c59fca171525', 35.6616, 139.7052),
    ('0a513ed1-e848-11ef-bc07-c59fca171525', 35.6625, 139.7061),
    ('0a513ed1-e848-11ef-bc07-c59fca171525', 35.6634, 139.7070),
    ('0a513ed1-e848-11ef-bc07-c59fca171525', 35.6643, 139.7079),

    # Device Tsubaki - Moving around Ueno area
    ('0a709508-e848-11ef-bc07-c59fca171525', 35.7120, 139.7750),
    ('0a709508-e848-11ef-bc07-c59fca171525', 35.7129, 139.7759),
    ('0a709508-e848-11ef-bc07-c59fca171525', 35.7138, 139.7768),
    ('0a709508-e848-11ef-bc07-c59fca171525', 35.7147, 139.7777),
    ('0a709508-e848-11ef-bc07-c59fca171525', 35.7156, 139.7786),

    # Device Ayame - Moving around Akihabara area
    ('0a8fab8b-e848-11ef-bc07-c59fca171525', 35.7000, 139.7720),
    ('0a8fab8b-e848-11ef-bc07-c59fca171525', 35.7009, 139.7729),
    ('0a8fab8b-e848-11ef-bc07-c59fca171525', 35.7018, 139.7738),
    ('0a8fab8b-e848-11ef-bc07-c59fca171525', 35.7027, 139.7747),
    ('0a8fab8b-e848-11ef-bc07-c59fca171525', 35.7036, 139.7756),
    ('0a8fab8b-e848-11ef-bc07-c59fca171525', 35.7045, 139.7765),
    ('0a8fab8b-e848-11ef-bc07-c59fca171525', 35.7054, 139.7774)
]

def post_device_locations():
    url = "https://gcbackend-temporary.onrender.com/mobile.device-locations/"
    headers = {
        "Content-Type": "application/json"
    }
    
    success_count = 0
    error_count = 0

    base_time = datetime.utcnow()
    
    for index, (device_id, lat, lon) in enumerate(DEVICE_LOCATIONS_DATA):
        timestamp = (base_time - timedelta(minutes=10 * index)).strftime("%Y-%m-%dT%H:%M:%SZ")
        
        payload = {
            "device_id": device_id,
            "latitude": lat,
            "longitude": lon,
            "current_location_timestamp": timestamp
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            success_count += 1
            print(f"Successfully posted location: {lat}, {lon} for device {device_id}")
        except requests.exceptions.RequestException as e:
            error_count += 1
            print(f"Error posting location: {lat}, {lon} for device {device_id}")
            print(f"Error: {str(e)}")
            print(f"Response: {response.text if hasattr(response, 'text') else 'No response text'}")
    
    print(f"\nSummary:")
    print(f"Total locations: {len(DEVICE_LOCATIONS_DATA)}")
    print(f"Successfully posted: {success_count}")
    print(f"Failed to post: {error_count}")

if __name__ == "__main__":
    post_device_locations()