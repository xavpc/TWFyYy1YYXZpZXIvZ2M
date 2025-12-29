import requests
import json
from typing import List, Dict, Tuple

# Define the coordinates data
COORDINATES_DATA: List[Tuple[str, float, float]] = [
    # Ueno Route
    ('a44cef37-e847-11ef-9da2-54ee75718d0f', 35.7100, 139.7700),
    ('a44cef37-e847-11ef-9da2-54ee75718d0f', 35.7115, 139.7715),
    ('a44cef37-e847-11ef-9da2-54ee75718d0f', 35.7130, 139.7730),
    ('a44cef37-e847-11ef-9da2-54ee75718d0f', 35.7145, 139.7745),
    ('a44cef37-e847-11ef-9da2-54ee75718d0f', 35.7155, 139.7755),
    ('a44cef37-e847-11ef-9da2-54ee75718d0f', 35.7165, 139.7765),
    
    # Roppongi Route
    ('a44d124a-e847-11ef-9da2-54ee75718d0f', 35.6600, 139.7300),
    ('a44d124a-e847-11ef-9da2-54ee75718d0f', 35.6615, 139.7315),
    ('a44d124a-e847-11ef-9da2-54ee75718d0f', 35.6630, 139.7330),
    ('a44d124a-e847-11ef-9da2-54ee75718d0f', 35.6645, 139.7345),
    ('a44d124a-e847-11ef-9da2-54ee75718d0f', 35.6655, 139.7355),
    ('a44d124a-e847-11ef-9da2-54ee75718d0f', 35.6665, 139.7365),
    ('a44d124a-e847-11ef-9da2-54ee75718d0f', 35.6675, 139.7375),
    
    # Harajuku Route
    ('a44d4028-e847-11ef-9da2-54ee75718d0f', 35.6800, 139.7000),
    ('a44d4028-e847-11ef-9da2-54ee75718d0f', 35.6815, 139.7015),
    ('a44d4028-e847-11ef-9da2-54ee75718d0f', 35.6830, 139.7030),
    ('a44d4028-e847-11ef-9da2-54ee75718d0f', 35.6840, 139.7040),
    ('a44d4028-e847-11ef-9da2-54ee75718d0f', 35.6850, 139.7050),
    ('a44d4028-e847-11ef-9da2-54ee75718d0f', 35.6860, 139.7060),
    ('a44d4028-e847-11ef-9da2-54ee75718d0f', 35.6870, 139.7070),
    ('a44d4028-e847-11ef-9da2-54ee75718d0f', 35.6880, 139.7080),
    
    # Shinagawa Route
    ('a44d1df2-e847-11ef-9da2-54ee75718d0f', 35.6300, 139.7400),
    ('a44d1df2-e847-11ef-9da2-54ee75718d0f', 35.6315, 139.7415),
    ('a44d1df2-e847-11ef-9da2-54ee75718d0f', 35.6330, 139.7430),
    ('a44d1df2-e847-11ef-9da2-54ee75718d0f', 35.6345, 139.7445),
    ('a44d1df2-e847-11ef-9da2-54ee75718d0f', 35.6355, 139.7455),
    
    # Shinjuku Route
    ('a44cbd63-e847-11ef-9da2-54ee75718d0f', 35.6900, 139.7000),
    ('a44cbd63-e847-11ef-9da2-54ee75718d0f', 35.6915, 139.7015),
    ('a44cbd63-e847-11ef-9da2-54ee75718d0f', 35.6930, 139.7030),
    ('a44cbd63-e847-11ef-9da2-54ee75718d0f', 35.6945, 139.7045),
    ('a44cbd63-e847-11ef-9da2-54ee75718d0f', 35.6955, 139.7055),
    ('a44cbd63-e847-11ef-9da2-54ee75718d0f', 35.6965, 139.7065),
    
    # Ikebukuro Route
    ('a44ce36b-e847-11ef-9da2-54ee75718d0f', 35.7300, 139.7100),
    ('a44ce36b-e847-11ef-9da2-54ee75718d0f', 35.7315, 139.7115),
    ('a44ce36b-e847-11ef-9da2-54ee75718d0f', 35.7330, 139.7130),
    ('a44ce36b-e847-11ef-9da2-54ee75718d0f', 35.7345, 139.7145),
    ('a44ce36b-e847-11ef-9da2-54ee75718d0f', 35.7355, 139.7155),
    
    # Asakusa Route
    ('a44cfaf7-e847-11ef-9da2-54ee75718d0f', 35.7100, 139.7950),
    ('a44cfaf7-e847-11ef-9da2-54ee75718d0f', 35.7115, 139.7965),
    ('a44cfaf7-e847-11ef-9da2-54ee75718d0f', 35.7130, 139.7980),
    ('a44cfaf7-e847-11ef-9da2-54ee75718d0f', 35.7140, 139.7990),
    ('a44cfaf7-e847-11ef-9da2-54ee75718d0f', 35.7150, 139.8000),
    ('a44cfaf7-e847-11ef-9da2-54ee75718d0f', 35.7160, 139.8010),
    ('a44cfaf7-e847-11ef-9da2-54ee75718d0f', 35.7170, 139.8020),
    ('a44cfaf7-e847-11ef-9da2-54ee75718d0f', 35.7180, 139.8030),
    ('a44cfaf7-e847-11ef-9da2-54ee75718d0f', 35.7190, 139.8040),
    
    # Shibuya Route
    ('a44cd72d-e847-11ef-9da2-54ee75718d0f', 35.6600, 139.7000),
    ('a44cd72d-e847-11ef-9da2-54ee75718d0f', 35.6615, 139.7015),
    ('a44cd72d-e847-11ef-9da2-54ee75718d0f', 35.6630, 139.7030),
    ('a44cd72d-e847-11ef-9da2-54ee75718d0f', 35.6640, 139.7040),
    ('a44cd72d-e847-11ef-9da2-54ee75718d0f', 35.6650, 139.7050),
    
    # Akihabara Route
    ('a44d06aa-e847-11ef-9da2-54ee75718d0f', 35.7000, 139.7700),
    ('a44d06aa-e847-11ef-9da2-54ee75718d0f', 35.7015, 139.7715),
    ('a44d06aa-e847-11ef-9da2-54ee75718d0f', 35.7030, 139.7730),
    ('a44d06aa-e847-11ef-9da2-54ee75718d0f', 35.7045, 139.7745),
    ('a44d06aa-e847-11ef-9da2-54ee75718d0f', 35.7055, 139.7755),
    ('a44d06aa-e847-11ef-9da2-54ee75718d0f', 35.7065, 139.7765),
    ('a44d06aa-e847-11ef-9da2-54ee75718d0f', 35.7075, 139.7775),
    
    # Ginza Route
    ('a44d302a-e847-11ef-9da2-54ee75718d0f', 35.6700, 139.7600),
    ('a44d302a-e847-11ef-9da2-54ee75718d0f', 35.6715, 139.7615),
    ('a44d302a-e847-11ef-9da2-54ee75718d0f', 35.6730, 139.7630),
    ('a44d302a-e847-11ef-9da2-54ee75718d0f', 35.6740, 139.7640),
    ('a44d302a-e847-11ef-9da2-54ee75718d0f', 35.6750, 139.7650),
    ('a44d302a-e847-11ef-9da2-54ee75718d0f', 35.6760, 139.7660)
]

def post_coordinates():
    url = "https://gcbackend-temporary.onrender.com/mobile.route-coordinates/"  # Base URL
    headers = {
        "Content-Type": "application/json"
    }
    
    success_count = 0
    error_count = 0
    
    for route_id, lat, lon in COORDINATES_DATA:
        payload = {
            "route_id": route_id,
            "latitude": lat,
            "longitude": lon
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            success_count += 1
            print(f"Successfully posted coordinates: {lat}, {lon} for route {route_id}")
        except requests.exceptions.RequestException as e:
            error_count += 1
            print(f"Error posting coordinates: {lat}, {lon} for route {route_id}")
            print(f"Error: {str(e)}")
            print(f"Response: {response.text if hasattr(response, 'text') else 'No response text'}")
    
    print(f"\nSummary:")
    print(f"Total coordinates: {len(COORDINATES_DATA)}")
    print(f"Successfully posted: {success_count}")
    print(f"Failed to post: {error_count}")

if __name__ == "__main__":
    post_coordinates()