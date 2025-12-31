START TRANSACTION;

INSERT INTO employee (
    employee_id,
    first_name,
    middle_name,
    last_name,
    address,
    contact_number,
    email,
    age,
    status
) VALUES
    (UUID(), '山田 (Yamada)', NULL, '太郎 (Taro)', '東京都新宿区西新宿1-1-1 (1-1-1 Nishi-Shinjuku, Shinjuku-ku, Tokyo)', '080-1234-5678', 'yamada.taro@gc.com', 35, 'active'),
    (UUID(), '佐藤 (Sato)', NULL, '花子 (Hanako)', '東京都渋谷区渋谷2-2-2 (2-2-2 Shibuya, Shibuya-ku, Tokyo)', '080-2345-6789', 'sato.hanako@gc.com', 28, 'active'),
    (UUID(), '鈴木 (Suzuki)', NULL, '一郎 (Ichiro)', '東京都中野区中野3-3-3 (3-3-3 Nakano, Nakano-ku, Tokyo)', '080-3456-7890', 'suzuki.ichiro@gc.com', 42, 'active'),
    (UUID(), '田中 (Tanaka)', NULL, '美咲 (Misaki)', '東京都杉並区阿佐谷4-4-4 (4-4-4 Asagaya, Suginami-ku, Tokyo)', '080-4567-8901', 'tanaka.misaki@gc.com', 31, 'active'),
    (UUID(), '高橋 (Takahashi)', NULL, '健一 (Kenichi)', '東京都豊島区池袋5-5-5 (5-5-5 Ikebukuro, Toshima-ku, Tokyo)', '080-5678-9012', 'takahashi.kenichi@gc.com', 38, 'active'),
    (UUID(), '中村 (Nakamura)', NULL, '裕子 (Yuko)', '東京都文京区本郷6-6-6 (6-6-6 Hongo, Bunkyo-ku, Tokyo)', '080-6789-0123', 'nakamura.yuko@gc.com', 33, 'active'),
    (UUID(), '小林 (Kobayashi)', NULL, '誠 (Makoto)', '東京都台東区上野7-7-7 (7-7-7 Ueno, Taito-ku, Tokyo)', '080-7890-1234', 'kobayashi.makoto@gc.com', 45, 'active'),
    (UUID(), '加藤 (Kato)', NULL, '直子 (Naoko)', '東京都品川区大井8-8-8 (8-8-8 Oi, Shinagawa-ku, Tokyo)', '080-8901-2345', 'kato.naoko@gc.com', 29, 'active'),
    (UUID(), '吉田 (Yoshida)', NULL, '隆 (Takashi)', '東京都目黒区中目黒9-9-9 (9-9-9 Nakameguro, Meguro-ku, Tokyo)', '080-9012-3456', 'yoshida.takashi@gc.com', 37, 'active'),
    (UUID(), '渡辺 (Watanabe)', NULL, '麗子 (Reiko)', '東京都港区六本木10-10-10 (10-10-10 Roppongi, Minato-ku, Tokyo)', '080-0123-4567', 'watanabe.reiko@gc.com', 34, 'active');

COMMIT;