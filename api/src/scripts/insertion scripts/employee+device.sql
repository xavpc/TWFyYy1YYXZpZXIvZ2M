-- MariaDB Script for Inserting employee and device
-- Execute this script directly in MariaDB client or workbench

-- Begin transaction
START TRANSACTION;

-- Insert 20 employee
-- Using UUID() function for employee_id generation

-- Employee 1
SET @emp1_id = UUID();
INSERT INTO employee 
(employee_id, first_name, middle_name, last_name, email, contact_number, address, age, status)
VALUES 
(@emp1_id, '健太 (Kenta)', NULL, '山田 (Yamada)', 'kenta.yamada1@example.com', '080-1234-5678', '東京都渋谷区神宮前1-1-1 (1-1-1 Jingumae, Shibuya-ku, Tokyo)', 32, 'active');

-- Employee 2
SET @emp2_id = UUID();
INSERT INTO employee 
(employee_id, first_name, middle_name, last_name, email, contact_number, address, age, status)
VALUES 
(@emp2_id, '太郎 (Taro)', '雄一 (Yuichi)', '田中 (Tanaka)', 'taro.tanaka2@example.com', '080-2345-6789', '東京都新宿区西新宿2-2-2 (2-2-2 Nishi-Shinjuku, Shinjuku-ku, Tokyo)', 45, 'active');

-- Employee 3
SET @emp3_id = UUID();
INSERT INTO employee 
(employee_id, first_name, middle_name, last_name, email, contact_number, address, age, status)
VALUES 
(@emp3_id, '春子 (Haruko)', NULL, '佐藤 (Sato)', 'haruko.sato3@example.com', '080-3456-7890', '東京都港区六本木3-3-3 (3-3-3 Roppongi, Minato-ku, Tokyo)', 29, 'active');

-- Employee 4
SET @emp4_id = UUID();
INSERT INTO employee 
(employee_id, first_name, middle_name, last_name, email, contact_number, address, age, status)
VALUES 
(@emp4_id, '花子 (Hanako)', NULL, '鈴木 (Suzuki)', 'hanako.suzuki4@example.com', '080-4567-8901', '東京都千代田区丸の内4-4-4 (4-4-4 Marunouchi, Chiyoda-ku, Tokyo)', 33, 'active');

-- Employee 5
SET @emp5_id = UUID();
INSERT INTO employee 
(employee_id, first_name, middle_name, last_name, email, contact_number, address, age, status)
VALUES 
(@emp5_id, '一郎 (Ichiro)', '健 (Ken)', '渡辺 (Watanabe)', 'ichiro.watanabe5@example.com', '080-5678-9012', '東京都中央区銀座5-5-5 (5-5-5 Ginza, Chuo-ku, Tokyo)', 51, 'active');

-- Employee 6
SET @emp6_id = UUID();
INSERT INTO employee 
(employee_id, first_name, middle_name, last_name, email, contact_number, address, age, status)
VALUES 
(@emp6_id, '次郎 (Jiro)', NULL, '伊藤 (Ito)', 'jiro.ito6@example.com', '080-6789-0123', '東京都台東区浅草6-6-6 (6-6-6 Asakusa, Taito-ku, Tokyo)', 38, 'inactive');

-- Employee 7
SET @emp7_id = UUID();
INSERT INTO employee 
(employee_id, first_name, middle_name, last_name, email, contact_number, address, age, status)
VALUES 
(@emp7_id, '三郎 (Saburo)', '光 (Hikaru)', '高橋 (Takahashi)', 'saburo.takahashi7@example.com', '080-7890-1234', '東京都豊島区池袋7-7-7 (7-7-7 Ikebukuro, Toshima-ku, Tokyo)', 42, 'active');

-- Employee 8
SET @emp8_id = UUID();
INSERT INTO employee 
(employee_id, first_name, middle_name, last_name, email, contact_number, address, age, status)
VALUES 
(@emp8_id, '四郎 (Shiro)', NULL, '中村 (Nakamura)', 'shiro.nakamura8@example.com', '080-8901-2345', '東京都品川区五反田8-8-8 (8-8-8 Gotanda, Shinagawa-ku, Tokyo)', 27, 'active');

-- Employee 9
SET @emp9_id = UUID();
INSERT INTO employee 
(employee_id, first_name, middle_name, last_name, email, contact_number, address, age, status)
VALUES 
(@emp9_id, '美智子 (Michiko)', NULL, '小林 (Kobayashi)', 'michiko.kobayashi9@example.com', '080-9012-3456', '東京都目黒区自由が丘9-9-9 (9-9-9 Jiyugaoka, Meguro-ku, Tokyo)', 36, 'active');

-- Employee 10
SET @emp10_id = UUID();
INSERT INTO employee 
(employee_id, first_name, middle_name, last_name, email, contact_number, address, age, status)
VALUES 
(@emp10_id, '恵子 (Keiko)', '真 (Makoto)', '加藤 (Kato)', 'keiko.kato10@example.com', '090-0123-4567', '東京都世田谷区二子玉川10-10-10 (10-10-10 Futakotamagawa, Setagaya-ku, Tokyo)', 44, 'active');

-- Employee 11
SET @emp11_id = UUID();
INSERT INTO employee 
(employee_id, first_name, middle_name, last_name, email, contact_number, address, age, status)
VALUES 
(@emp11_id, '佐藤 (Sato)', NULL, '吉田 (Yoshida)', 'sato.yoshida11@example.com', '090-1234-5678', '大阪府大阪市北区梅田1-1-1 (1-1-1 Umeda, Kita-ku, Osaka)', 31, 'active');

-- Employee 12
SET @emp12_id = UUID();
INSERT INTO employee 
(employee_id, first_name, middle_name, last_name, email, contact_number, address, age, status)
VALUES 
(@emp12_id, '鈴木 (Suzuki)', '翔 (Sho)', '山口 (Yamaguchi)', 'suzuki.yamaguchi12@example.com', '090-2345-6789', '大阪府大阪市中央区心斎橋2-2-2 (2-2-2 Shinsaibashi, Chuo-ku, Osaka)', 39, 'inactive');

-- Employee 13
SET @emp13_id = UUID();
INSERT INTO employee 
(employee_id, first_name, middle_name, last_name, email, contact_number, address, age, status)
VALUES 
(@emp13_id, '裕子 (Yuko)', NULL, '松本 (Matsumoto)', 'yuko.matsumoto13@example.com', '090-3456-7890', '大阪府大阪市中央区難波3-3-3 (3-3-3 Namba, Chuo-ku, Osaka)', 35, 'active');

-- Employee 14
SET @emp14_id = UUID();
INSERT INTO employee 
(employee_id, first_name, middle_name, last_name, email, contact_number, address, age, status)
VALUES 
(@emp14_id, '直樹 (Naoki)', NULL, '井上 (Inoue)', 'naoki.inoue14@example.com', '090-4567-8901', '大阪府大阪市浪速区日本橋4-4-4 (4-4-4 Nipponbashi, Naniwa-ku, Osaka)', 47, 'active');

-- Employee 15
SET @emp15_id = UUID();
INSERT INTO employee 
(employee_id, first_name, middle_name, last_name, email, contact_number, address, age, status)
VALUES 
(@emp15_id, '和子 (Kazuko)', '愛 (Ai)', '木村 (Kimura)', 'kazuko.kimura15@example.com', '090-5678-9012', '京都府京都市東山区祇園町5-5-5 (5-5-5 Gion-machi, Higashiyama-ku, Kyoto)', 28, 'active');

-- Employee 16
SET @emp16_id = UUID();
INSERT INTO employee 
(employee_id, first_name, middle_name, last_name, email, contact_number, address, age, status)
VALUES 
(@emp16_id, '智子 (Tomoko)', NULL, '林 (Hayashi)', 'tomoko.hayashi16@example.com', '090-6789-0123', '京都府京都市上京区河原町6-6-6 (6-6-6 Kawaramachi, Kamigyo-ku, Kyoto)', 52, 'active');

-- Employee 17
SET @emp17_id = UUID();
INSERT INTO employee 
(employee_id, first_name, middle_name, last_name, email, contact_number, address, age, status)
VALUES 
(@emp17_id, '大輔 (Daisuke)', NULL, '斎藤 (Saito)', 'daisuke.saito17@example.com', '090-7890-1234', '福岡県福岡市博多区博多駅前7-7-7 (7-7-7 Hakataekimae, Hakata-ku, Fukuoka)', 34, 'active');

-- Employee 18
SET @emp18_id = UUID();
INSERT INTO employee 
(employee_id, first_name, middle_name, last_name, email, contact_number, address, age, status)
VALUES 
(@emp18_id, '明美 (Akemi)', '桜 (Sakura)', '清水 (Shimizu)', 'akemi.shimizu18@example.com', '090-8901-2345', '福岡県福岡市中央区天神8-8-8 (8-8-8 Tenjin, Chuo-ku, Fukuoka)', 29, 'inactive');

-- Employee 19
SET @emp19_id = UUID();
INSERT INTO employee 
(employee_id, first_name, middle_name, last_name, email, contact_number, address, age, status)
VALUES 
(@emp19_id, '真理子 (Mariko)', NULL, '山本 (Yamamoto)', 'mariko.yamamoto19@example.com', '090-9012-3456', '北海道札幌市中央区大通西9-9-9 (9-9-9 Odori-Nishi, Chuo-ku, Sapporo)', 41, 'active');

-- Employee 20
SET @emp20_id = UUID();
INSERT INTO employee 
(employee_id, first_name, middle_name, last_name, email, contact_number, address, age, status)
VALUES 
(@emp20_id, '幸子 (Sachiko)', NULL, '中野 (Nakano)', 'sachiko.nakano20@example.com', '090-0123-4567', '宮城県仙台市青葉区一番町10-10-10 (10-10-10 Ichiban-cho, Aoba-ku, Sendai)', 37, 'active');

-- Now insert device and associate with employee
-- Using UUID() function for device_id generation

-- Device 1 (associated with employee 1)
INSERT INTO device
(device_id, vehicle_plate_num, device_name, employee_id)
VALUES
(UUID(), '東京 あ-1234 (Tokyo A-1234)', 'タブレット X13 (Tablet X13)', @emp1_id);

-- Device 2 (associated with employee 1 - multiple device per employee)
INSERT INTO device
(device_id, vehicle_plate_num, device_name, employee_id)
VALUES
(UUID(), '東京 い-5678 (Tokyo I-5678)', 'スマートフォン S21 (Smartphone S21)', @emp1_id);

-- Device 3 (associated with employee 2)
INSERT INTO device
(device_id, vehicle_plate_num, device_name, employee_id)
VALUES
(UUID(), '大阪 さ-9012 (Osaka SA-9012)', 'タブレット X15 (Tablet X15)', @emp2_id);

-- Device 4 (associated with employee 3)
INSERT INTO device
(device_id, vehicle_plate_num, device_name, employee_id)
VALUES
(UUID(), '京都 た-3456 (Kyoto TA-3456)', 'スマートフォン S22 (Smartphone S22)', @emp3_id);

-- Device 5 (associated with employee 4)
INSERT INTO device
(device_id, vehicle_plate_num, device_name, employee_id)
VALUES
(UUID(), '福岡 な-7890 (Fukuoka NA-7890)', 'タブレット X17 (Tablet X17)', @emp4_id);

-- Device 6 (associated with employee 5)
INSERT INTO device
(device_id, vehicle_plate_num, device_name, employee_id)
VALUES
(UUID(), '北海道 は-1234 (Hokkaido HA-1234)', 'スマートフォン S23 (Smartphone S23)', @emp5_id);

-- Device 7 (associated with employee 6)
INSERT INTO device
(device_id, vehicle_plate_num, device_name, employee_id)
VALUES
(UUID(), '宮城 ま-5678 (Miyagi MA-5678)', 'タブレット X19 (Tablet X19)', @emp6_id);

-- Device 8 (associated with employee 7)
INSERT INTO device
(device_id, vehicle_plate_num, device_name, employee_id)
VALUES
(UUID(), '東京 や-9012 (Tokyo YA-9012)', 'スマートフォン S25 (Smartphone S25)', @emp7_id);

-- Device 9 (associated with employee 8)
INSERT INTO device
(device_id, vehicle_plate_num, device_name, employee_id)
VALUES
(UUID(), '大阪 わ-3456 (Osaka WA-3456)', 'タブレット X21 (Tablet X21)', @emp8_id);

-- Device 10 (associated with employee 9)
INSERT INTO device
(device_id, vehicle_plate_num, device_name, employee_id)
VALUES
(UUID(), '東京 れ-7890 (Tokyo RE-7890)', 'スマートフォン S27 (Smartphone S27)', @emp9_id);

-- Device 11 (associated with employee 10)
INSERT INTO device
(device_id, vehicle_plate_num, device_name, employee_id)
VALUES
(UUID(), '東京 を-1234 (Tokyo WO-1234)', 'タブレット X23 (Tablet X23)', @emp10_id);

-- Device 12 (associated with employee 11)
INSERT INTO device
(device_id, vehicle_plate_num, device_name, employee_id)
VALUES
(UUID(), '大阪 あ-5678 (Osaka A-5678)', 'スマートフォン S29 (Smartphone S29)', @emp11_id);

-- Device 13 (associated with employee 12)
INSERT INTO device
(device_id, vehicle_plate_num, device_name, employee_id)
VALUES
(UUID(), '京都 い-9012 (Kyoto I-9012)', 'タブレット X25 (Tablet X25)', @emp12_id);

-- Device 14 (associated with employee 13)
INSERT INTO device
(device_id, vehicle_plate_num, device_name, employee_id)
VALUES
(UUID(), '福岡 さ-3456 (Fukuoka SA-3456)', 'スマートフォン S31 (Smartphone S31)', @emp13_id);

-- Device 15 (associated with employee 14)
INSERT INTO device
(device_id, vehicle_plate_num, device_name, employee_id)
VALUES
(UUID(), '北海道 た-7890 (Hokkaido TA-7890)', 'タブレット X27 (Tablet X27)', @emp14_id);

-- Device 16 (associated with employee 15)
INSERT INTO device
(device_id, vehicle_plate_num, device_name, employee_id)
VALUES
(UUID(), '宮城 な-1234 (Miyagi NA-1234)', 'スマートフォン S33 (Smartphone S33)', @emp15_id);

-- Device 17 (associated with employee 16)
INSERT INTO device
(device_id, vehicle_plate_num, device_name, employee_id)
VALUES
(UUID(), '東京 は-5678 (Tokyo HA-5678)', 'タブレット X29 (Tablet X29)', @emp16_id);

-- Device 18 (associated with employee 17)
INSERT INTO device
(device_id, vehicle_plate_num, device_name, employee_id)
VALUES
(UUID(), '大阪 ま-9012 (Osaka MA-9012)', 'スマートフォン S35 (Smartphone S35)', @emp17_id);

-- Device 19 (associated with employee 18)
INSERT INTO device
(device_id, vehicle_plate_num, device_name, employee_id)
VALUES
(UUID(), '京都 や-3456 (Kyoto YA-3456)', 'タブレット X31 (Tablet X31)', @emp18_id);

-- Device 20 (associated with employee 19)
INSERT INTO device
(device_id, vehicle_plate_num, device_name, employee_id)
VALUES
(UUID(), '福岡 わ-7890 (Fukuoka WA-7890)', 'スマートフォン S37 (Smartphone S37)', @emp19_id);

-- Device 21 (associated with employee 20)
INSERT INTO device
(device_id, vehicle_plate_num, device_name, employee_id)
VALUES
(UUID(), '北海道 れ-1234 (Hokkaido RE-1234)', 'タブレット X33 (Tablet X33)', @emp20_id);

-- Device 22 (associated with employee 20 - multiple device per employee)
INSERT INTO device
(device_id, vehicle_plate_num, device_name, employee_id)
VALUES
(UUID(), '北海道 を-5678 (Hokkaido WO-5678)', 'スマートフォン S39 (Smartphone S39)', @emp20_id);

-- Device 23 (unassigned device - no employee association)
INSERT INTO device
(device_id, vehicle_plate_num, device_name)
VALUES
(UUID(), '宮城 あ-9012 (Miyagi A-9012)', '予備タブレット X35 (Spare Tablet X35)');

-- Device 24 (unassigned device - no employee association)
INSERT INTO device
(device_id, vehicle_plate_num, device_name)
VALUES
(UUID(), '宮城 い-3456 (Miyagi I-3456)', '予備スマートフォン S41 (Spare Smartphone S41)');

-- Device 25 (unassigned device - no employee association)
INSERT INTO device
(device_id, vehicle_plate_num, device_name)
VALUES
(UUID(), '東京 さ-7890 (Tokyo SA-7890)', '新型タブレット X37 (New Tablet X37)');

-- Commit the transaction
COMMIT;