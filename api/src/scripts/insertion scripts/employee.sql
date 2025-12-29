START TRANSACTION;

INSERT INTO employee (
    employee_id,
    first_name,
    middle_name,
    last_name,
    address,
    postal_code,
    contact_number,
    emergency_contact,
    email,
    age,
    date_of_birth,
    employment_start_date,
    employee_number,
    department,
    position,
    social_insurance_number,
    my_number,
    status
) VALUES
    (UUID(), '山田 (Yamada)', NULL, '太郎 (Taro)', '東京都新宿区西新宿1-1-1 (1-1-1 Nishi-Shinjuku, Shinjuku-ku, Tokyo)', '160-0023', '080-1234-5678', '090-1234-5678', 'yamada.taro@gc.com', 35, '1989-05-15', '2020-04-01', 'EMP001', '清掃部 (Cleaning Department)', '作業員 (Operator)', '1234567890', 'MY12345678', 'active'),
    (UUID(), '佐藤 (Sato)', NULL, '花子 (Hanako)', '東京都渋谷区渋谷2-2-2 (2-2-2 Shibuya, Shibuya-ku, Tokyo)', '150-0002', '080-2345-6789', '090-2345-6789', 'sato.hanako@gc.com', 28, '1996-08-20', '2021-04-01', 'EMP002', '清掃部 (Cleaning Department)', '主任 (Supervisor)', '2345678901', 'MY23456789', 'active'),
    (UUID(), '鈴木 (Suzuki)', NULL, '一郎 (Ichiro)', '東京都中野区中野3-3-3 (3-3-3 Nakano, Nakano-ku, Tokyo)', '164-0001', '080-3456-7890', '090-3456-7890', 'suzuki.ichiro@gc.com', 42, '1982-03-10', '2018-04-01', 'EMP003', '清掃部 (Cleaning Department)', '作業員 (Operator)', '3456789012', 'MY34567890', 'active'),
    (UUID(), '田中 (Tanaka)', NULL, '美咲 (Misaki)', '東京都杉並区阿佐谷4-4-4 (4-4-4 Asagaya, Suginami-ku, Tokyo)', '166-0004', '080-4567-8901', '090-4567-8901', 'tanaka.misaki@gc.com', 31, '1993-11-25', '2019-04-01', 'EMP004', '清掃部 (Cleaning Department)', '作業員 (Operator)', '4567890123', 'MY45678901', 'active'),
    (UUID(), '高橋 (Takahashi)', NULL, '健一 (Kenichi)', '東京都豊島区池袋5-5-5 (5-5-5 Ikebukuro, Toshima-ku, Tokyo)', '171-0014', '080-5678-9012', '090-5678-9012', 'takahashi.kenichi@gc.com', 38, '1986-07-30', '2017-04-01', 'EMP005', '清掃部 (Cleaning Department)', '主任 (Supervisor)', '5678901234', 'MY56789012', 'active'),
    (UUID(), '中村 (Nakamura)', NULL, '裕子 (Yuko)', '東京都文京区本郷6-6-6 (6-6-6 Hongo, Bunkyo-ku, Tokyo)', '113-0033', '080-6789-0123', '090-6789-0123', 'nakamura.yuko@gc.com', 33, '1991-12-05', '2019-04-01', 'EMP006', '清掃部 (Cleaning Department)', '作業員 (Operator)', '6789012345', 'MY67890123', 'active'),
    (UUID(), '小林 (Kobayashi)', NULL, '誠 (Makoto)', '東京都台東区上野7-7-7 (7-7-7 Ueno, Taito-ku, Tokyo)', '110-0005', '080-7890-1234', '090-7890-1234', 'kobayashi.makoto@gc.com', 45, '1979-09-18', '2015-04-01', 'EMP007', '清掃部 (Cleaning Department)', '主任 (Supervisor)', '7890123456', 'MY78901234', 'active'),
    (UUID(), '加藤 (Kato)', NULL, '直子 (Naoko)', '東京都品川区大井8-8-8 (8-8-8 Oi, Shinagawa-ku, Tokyo)', '140-0014', '080-8901-2345', '090-8901-2345', 'kato.naoko@gc.com', 29, '1995-03-22', '2022-04-01', 'EMP008', '清掃部 (Cleaning Department)', '作業員 (Operator)', '8901234567', 'MY89012345', 'active'),
    (UUID(), '吉田 (Yoshida)', NULL, '隆 (Takashi)', '東京都目黒区中目黒9-9-9 (9-9-9 Nakameguro, Meguro-ku, Tokyo)', '153-0061', '080-9012-3456', '090-9012-3456', 'yoshida.takashi@gc.com', 37, '1987-06-30', '2018-04-01', 'EMP009', '清掃部 (Cleaning Department)', '作業員 (Operator)', '9012345678', 'MY90123456', 'active'),
    (UUID(), '渡辺 (Watanabe)', NULL, '麗子 (Reiko)', '東京都港区六本木10-10-10 (10-10-10 Roppongi, Minato-ku, Tokyo)', '106-0032', '080-0123-4567', '090-0123-4567', 'watanabe.reiko@gc.com', 34, '1990-01-15', '2020-04-01', 'EMP010', '清掃部 (Cleaning Department)', '主任 (Supervisor)', '0123456789', 'MY01234567', 'active');

COMMIT;