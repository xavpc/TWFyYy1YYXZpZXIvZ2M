-- Start transaction
START TRANSACTION;

-- Declare variables for route IDs
SET @route_id1 = UUID();
SET @route_id2 = UUID();
SET @route_id3 = UUID();
SET @route_id4 = UUID();
SET @route_id5 = UUID();
SET @route_id6 = UUID();
SET @route_id7 = UUID();
SET @route_id8 = UUID();
SET @route_id9 = UUID();
SET @route_id10 = UUID();

-- Route (Base table)
INSERT INTO route (route_id, route_name) VALUES
(@route_id1, '新宿ルート (Shinjuku Route)'),
(@route_id2, '渋谷ルート (Shibuya Route)'),
(@route_id3, '池袋ルート (Ikebukuro Route)'),
(@route_id4, '上野ルート (Ueno Route)'),
(@route_id5, '浅草ルート (Asakusa Route)'),
(@route_id6, '秋葉原ルート (Akihabara Route)'),
(@route_id7, '六本木ルート (Roppongi Route)'),
(@route_id8, '品川ルート (Shinagawa Route)'),
(@route_id9, '銀座ルート (Ginza Route)'),
(@route_id10, '原宿ルート (Harajuku Route)');

-- Declare variables for employee IDs
SET @emp_id1 = UUID();
SET @emp_id2 = UUID();
SET @emp_id3 = UUID();
SET @emp_id4 = UUID();
SET @emp_id5 = UUID();
SET @emp_id6 = UUID();
SET @emp_id7 = UUID();
SET @emp_id8 = UUID();
SET @emp_id9 = UUID();
SET @emp_id10 = UUID();

-- Employee
INSERT INTO employee (employee_id, first_name, middle_name, last_name, address, contact_number, email, age, postal_code, emergency_contact, date_of_birth, employment_start_date, employee_number, department, position, social_insurance_number, my_number) VALUES
(@emp_id1, '田中 (Tanaka)', NULL, '太郎 (Taro)', '東京都新宿区1-1-1', '090-1234-5678', 'tanaka.taro@example.com', 28, '160-0001', '090-8765-4321', '1996-01-15', '2020-04-01', 'EMP-2024-001', '清掃部 (Cleaning Department)', '作業員 (Operator)', '1234-5678-9012', '123456789012'),
(@emp_id2, '鈴木 (Suzuki)', NULL, '花子 (Hanako)', '東京都渋谷区2-2-2', '090-2345-6789', 'suzuki.hanako@example.com', 32, '150-0002', '090-7654-3210', '1992-03-20', '2019-04-01', 'EMP-2024-002', '清掃部 (Cleaning Department)', '主任 (Supervisor)', '2345-6789-0123', '234567890123'),
(@emp_id3, '佐藤 (Sato)', NULL, '次郎 (Jiro)', '東京都品川区3-3-3', '090-3456-7890', 'sato.jiro@example.com', 35, '140-0003', '090-6543-2109', '1989-06-25', '2018-04-01', 'EMP-2024-003', '清掃部 (Cleaning Department)', '作業員 (Operator)', '3456-7890-1234', '345678901234'),
(@emp_id4, '山田 (Yamada)', NULL, '明子 (Akiko)', '東京都目黒区4-4-4', '090-4567-8901', 'yamada.akiko@example.com', 29, '130-0004', '090-5432-1098', '1995-09-10', '2021-04-01', 'EMP-2024-004', '清掃部 (Cleaning Department)', '作業員 (Operator)', '4567-8901-2345', '456789012345'),
(@emp_id5, '伊藤 (Ito)', NULL, '健一 (Kenichi)', '東京都港区5-5-5', '090-5678-9012', 'ito.kenichi@example.com', 41, '120-0005', '090-4321-0987', '1983-12-05', '2015-04-01', 'EMP-2024-005', '清掃部 (Cleaning Department)', '主任 (Supervisor)', '5678-9012-3456', '567890123456'),
(@emp_id6, '渡辺 (Watanabe)', NULL, '真理子 (Mariko)', '東京都中野区6-6-6', '090-6789-0123', 'watanabe.mariko@example.com', 31, '110-0006', '090-3210-9876', '1993-08-15', '2019-04-01', 'EMP-2024-006', '清掃部 (Cleaning Department)', '作業員 (Operator)', '6789-0123-4567', '678901234567'),
(@emp_id7, '加藤 (Kato)', NULL, '裕太 (Yuta)', '東京都杉並区7-7-7', '090-7890-1234', 'kato.yuta@example.com', 27, '100-0007', '090-2109-8765', '1997-04-20', '2022-04-01', 'EMP-2024-007', '清掃部 (Cleaning Department)', '作業員 (Operator)', '7890-1234-5678', '789012345678'),
(@emp_id8, '木村 (Kimura)', NULL, '美咲 (Misaki)', '東京都豊島区8-8-8', '090-8901-2345', 'kimura.misaki@example.com', 33, '090-0008', '090-1098-7654', '1991-11-30', '2018-04-01', 'EMP-2024-008', '清掃部 (Cleaning Department)', '作業員 (Operator)', '8901-2345-6789', '890123456789'),
(@emp_id9, '山本 (Yamamoto)', NULL, '大輔 (Daisuke)', '東京都世田谷区9-9-9', '090-9012-3456', 'yamamoto.daisuke@example.com', 38, '080-0009', '090-0987-6543', '1986-07-25', '2016-04-01', 'EMP-2024-009', '清掃部 (Cleaning Department)', '主任 (Supervisor)', '9012-3456-7890', '901234567890'),
(@emp_id10, '中村 (Nakamura)', NULL, '七海 (Nanami)', '東京都練馬区10-10-10', '090-0123-4567', 'nakamura.nanami@example.com', 30, '070-0010', '090-9876-5432', '1994-02-10', '2020-04-01', 'EMP-2024-010', '清掃部 (Cleaning Department)', '作業員 (Operator)', '0123-4567-8901', '012345678901');

-- Declare variables for device IDs
SET @device_id1 = UUID();
SET @device_id2 = UUID();
SET @device_id3 = UUID();
SET @device_id4 = UUID();
SET @device_id5 = UUID();

-- Device
INSERT INTO device (device_id, device_name, vehicle_plate_num, employee_id) VALUES
(@device_id1, 'デバイス・サクラ (Device Sakura)', '東京 500 さ 12-34', @emp_id1),
(@device_id2, 'デバイス・うめ (Device Ume)', '東京 500 う 23-45', @emp_id2),
(@device_id3, 'デバイス・もみじ (Device Momiji)', '東京 500 も 34-56', @emp_id3),
(@device_id4, 'デバイス・つばき (Device Tsubaki)', '東京 500 つ 45-67', @emp_id4),
(@device_id5, 'デバイス・あやめ (Device Ayame)', '東京 500 あ 56-78', @emp_id5);

-- Collection Points
INSERT INTO collection_points (collection_point_id, collection_point_name, latitude, longitude, route_id) VALUES
(UUID(), '新宿東口集積所 (Shinjuku East Exit Collection Point)', 35.690921, 139.700258, @route_id1),
(UUID(), '渋谷スクランブル集積所 (Shibuya Scramble Collection Point)', 35.659494, 139.700622, @route_id2),
(UUID(), '池袋西口集積所 (Ikebukuro West Exit Collection Point)', 35.733926, 139.707358, @route_id3),
(UUID(), '上野公園集積所 (Ueno Park Collection Point)', 35.716750, 139.774556, @route_id4),
(UUID(), '浅草寺集積所 (Sensoji Collection Point)', 35.714839, 139.796649, @route_id5);

-- Device Route
INSERT INTO device_route (device_route_id, device_id, route_id, day_assigned) VALUES
(UUID(), @device_id1, @route_id1, 'monday'),
(UUID(), @device_id2, @route_id2, 'tuesday'),
(UUID(), @device_id3, @route_id3, 'wednesday'),
(UUID(), @device_id4, @route_id4, 'thursday'),
(UUID(), @device_id5, @route_id5, 'friday');

-- Image
SET @image_id1 = UUID();
SET @image_id2 = UUID();
SET @image_id3 = UUID();
SET @image_id4 = UUID();
SET @image_id5 = UUID();

INSERT INTO image (image_id, image_url, file_name, route_id) VALUES
(@image_id1, 'https://example.com/images/新宿ルート01.jpg', '新宿ルート写真1 (Shinjuku Route Photo 1)', @route_id1),
(@image_id2, 'https://example.com/images/渋谷ルート01.jpg', '渋谷ルート写真1 (Shibuya Route Photo 1)', @route_id2),
(@image_id3, 'https://example.com/images/池袋ルート01.jpg', '池袋ルート写真1 (Ikebukuro Route Photo 1)', @route_id3),
(@image_id4, 'https://example.com/images/上野ルート01.jpg', '上野ルート写真1 (Ueno Route Photo 1)', @route_id4),
(@image_id5, 'https://example.com/images/浅草ルート01.jpg', '浅草ルート写真1 (Asakusa Route Photo 1)', @route_id5);

-- Complaints
INSERT INTO complaints (complaint_id, description, latitude, longitude, image_id, device_id, title, complaint_timestamp) VALUES
(UUID(), '不法投棄発見 (Illegal Dumping Found)', 35.689487, 139.691706, @image_id1, @device_id1, 'ゴミの不法投棄 (Illegal Garbage Dumping)', '2024-02-11 08:30:00'),
(UUID(), '収集未完了 (Collection Incomplete)', 35.690487, 139.692706, @image_id2, @device_id2, '収集もれ報告 (Missed Collection Report)', '2024-02-11 09:15:00'),
(UUID(), 'ごみ箱破損 (Damaged Garbage Bin)', 35.691487, 139.693706, @image_id3, @device_id3, 'ごみ箱修理要請 (Garbage Bin Repair Request)', '2024-02-11 10:00:00'),
(UUID(), '分別違反 (Sorting Violation)', 35.692487, 139.694706, @image_id4, @device_id4, '分別ルール違反 (Sorting Rule Violation)', '2024-02-11 10:45:00'),
(UUID(), '悪臭報告 (Bad Odor Report)', 35.693487, 139.695706, @image_id5, @device_id5, '悪臭問題 (Odor Issue)', '2024-02-11 11:30:00');

-- Device Location
INSERT INTO device_location (device_location_id, latitude, longitude, sequence, device_id, current_location_timestamp) VALUES
(UUID(), 35.652832, 139.839478, 1, @device_id1, '2024-02-11 08:00:00'),
(UUID(), 35.654921, 139.838547, 2, @device_id2, '2024-02-11 08:15:00'),
(UUID(), 35.655832, 139.837478, 3, @device_id3, '2024-02-11 08:30:00'),
(UUID(), 35.656832, 139.836478, 4, @device_id4, '2024-02-11 08:45:00'),
(UUID(), 35.657832, 139.835478, 5, @device_id5, '2024-02-11 09:00:00');

-- Route Coordinates
INSERT INTO route_coordinates (route_coordinates_id, route_id, latitude, longitude) VALUES
(UUID(), @route_id1, 35.658584, 139.745431),
(UUID(), @route_id2, 35.659584, 139.746431),
(UUID(), @route_id3, 35.660584, 139.747431),
(UUID(), @route_id4, 35.661584, 139.748431),
(UUID(), @route_id5, 35.662584, 139.749431);

-- Commit transaction
COMMIT;