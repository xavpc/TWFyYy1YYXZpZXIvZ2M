import requests
import json
import random
import uuid

url = "https://gcbackend-temporary.onrender.com/devices"

employees = [
    {"employee_id": "5c4bc212-ef64-11ef-bc07-c59fca171525", "name": "山田 (Yamada) 太郎 (Taro)"},
    {"employee_id": "5c4bc499-ef64-11ef-bc07-c59fca171525", "name": "佐藤 (Sato) 花子 (Hanako)"},
    {"employee_id": "5c4bc540-ef64-11ef-bc07-c59fca171525", "name": "鈴木 (Suzuki) 一郎 (Ichiro)"},
    {"employee_id": "5c4bc589-ef64-11ef-bc07-c59fca171525", "name": "田中 (Tanaka) 美咲 (Misaki)"},
    {"employee_id": "5c4bc5c7-ef64-11ef-bc07-c59fca171525", "name": "高橋 (Takahashi) 健一 (Kenichi)"},
    {"employee_id": "5c4bc5fe-ef64-11ef-bc07-c59fca171525", "name": "中村 (Nakamura) 裕子 (Yuko)"},
    {"employee_id": "5c4bc635-ef64-11ef-bc07-c59fca171525", "name": "小林 (Kobayashi) 誠 (Makoto)"},
    {"employee_id": "5c4bc669-ef64-11ef-bc07-c59fca171525", "name": "加藤 (Kato) 直子 (Naoko)"},
    {"employee_id": "5c4bc6a1-ef64-11ef-bc07-c59fca171525", "name": "吉田 (Yoshida) 隆 (Takashi)"},
    {"employee_id": "5c4bc6d6-ef64-11ef-bc07-c59fca171525", "name": "渡辺 (Watanabe) 麗子 (Reiko)"},
    {"employee_id": "9c0c6ce1-5a68-472d-8a75-aa21d6ce9386", "name": "佐藤 (Satou) 和馬 (Kazuma)"},
    {"employee_id": "ca3e88db-0ace-4460-b786-19ab636080c9", "name": "James Anquillano"}
]

# Japanese device names with English translations
device_names = [
    "桜 (Sakura)", # Cherry Blossom
    "藤 (Fuji)", # Wisteria
    "月 (Tsuki)", # Moon
    "星 (Hoshi)", # Star
    "風 (Kaze)", # Wind
    "雲 (Kumo)", # Cloud
    "雷 (Kaminari)", # Thunder
    "海 (Umi)", # Sea
    "山 (Yama)", # Mountain
    "川 (Kawa)", # River
    "雪 (Yuki)", # Snow
    "火 (Hi)", # Fire
    "竹 (Take)", # Bamboo
    "松 (Matsu)", # Pine
    "梅 (Ume)", # Plum Blossom
    "菊 (Kiku)", # Chrysanthemum
    "鳳凰 (Houou)", # Phoenix
    "龍 (Ryu)", # Dragon
    "虎 (Tora)", # Tiger
    "鷹 (Taka)" # Hawk
]

hiragana = ["あ", "い", "う", "え", "お", "か", "き", "く", "け", "こ", 
            "さ", "し", "す", "せ", "そ", "た", "ち", "つ", "て", "と"]

def generate_japanese_plate():
    """Generate a Japanese-style license plate number"""
    region_code = random.randint(100, 999)
    hiragana_char = random.choice(hiragana)
    number = random.randint(1000, 9999)
    return f"{region_code} {hiragana_char} {number}"

def create_device(count):
    """Create a device with Japanese name and plate number"""
    device_name = f"デバイス{count} {random.choice(device_names)}"
    plate = generate_japanese_plate()
    employee = random.choice(employees)
    
    payload = {
        "device_name": device_name,
        "vehicle_plate_num": plate,
        "employee_id": employee["employee_id"]
    }
    
    print(f"Creating device: {device_name}")
    print(f"Plate number: {plate}")
    print(f"Assigned to: {employee['name']}")
    
    response = requests.post(url, json=payload)
    
    if response.status_code in [200, 201]:
        print(f"Success! Device created with response: {response.json()}")
    else:
        print(f"Error {response.status_code}: {response.text}")
    
    print("-" * 50)
    
    return response.status_code in [200, 201]

def main():
    """Main function to create multiple devices"""
    num_devices = int(input("How many devices would you like to create? "))
    success_count = 0
    
    for i in range(1, num_devices + 1):
        if create_device(i):
            success_count += 1
    
    print(f"Created {success_count} out of {num_devices} devices successfully.")

if __name__ == "__main__":
    main()