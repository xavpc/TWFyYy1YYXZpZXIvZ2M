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

INSERT INTO route (route_id, route_name, center_latitude, center_longitude) VALUES
(@route_id1, '新宿ルート (Shinjuku Route)', 35.689722, 139.700278),
(@route_id2, '渋谷ルート (Shibuya Route)', 35.658517, 139.701334),
(@route_id3, '池袋ルート (Ikebukuro Route)', 35.729167, 139.710556),
(@route_id4, '上野ルート (Ueno Route)', 35.713889, 139.777222),
(@route_id5, '浅草ルート (Asakusa Route)', 35.714722, 139.796667),
(@route_id6, '秋葉原ルート (Akihabara Route)', 35.698333, 139.773056),
(@route_id7, '六本木ルート (Roppongi Route)', 35.662778, 139.731389),
(@route_id8, '品川ルート (Shinagawa Route)', 35.628889, 139.738889),
(@route_id9, '銀座ルート (Ginza Route)', 35.671389, 139.765278),
(@route_id10, '原宿ルート (Harajuku Route)', 35.671389, 139.702444);

INSERT INTO route_coordinates (route_coordinates_id, latitude, longitude, sequence, route_id) VALUES
(UUID(), 35.689722, 139.700278, 1, @route_id1),
(UUID(), 35.692778, 139.703056, 2, @route_id1),
(UUID(), 35.687500, 139.703889, 3, @route_id1),
(UUID(), 35.685833, 139.698333, 4, @route_id1),
(UUID(), 35.688889, 139.697222, 5, @route_id1),

(UUID(), 35.658517, 139.701334, 1, @route_id2),
(UUID(), 35.661389, 139.703611, 2, @route_id2),
(UUID(), 35.664167, 139.698333, 3, @route_id2),
(UUID(), 35.659722, 139.697222, 4, @route_id2),
(UUID(), 35.657778, 139.699444, 5, @route_id2),

(UUID(), 35.729167, 139.710556, 1, @route_id3),
(UUID(), 35.732222, 139.713889, 2, @route_id3),
(UUID(), 35.728333, 139.715556, 3, @route_id3),
(UUID(), 35.726667, 139.711667, 4, @route_id3),
(UUID(), 35.727778, 139.708333, 5, @route_id3),

(UUID(), 35.713889, 139.777222, 1, @route_id4),
(UUID(), 35.715833, 139.773889, 2, @route_id4),
(UUID(), 35.718333, 139.775556, 3, @route_id4),
(UUID(), 35.712222, 139.774444, 4, @route_id4),
(UUID(), 35.711667, 139.778333, 5, @route_id4),

(UUID(), 35.714722, 139.796667, 1, @route_id5),
(UUID(), 35.712500, 139.798333, 2, @route_id5),
(UUID(), 35.710833, 139.795556, 3, @route_id5),
(UUID(), 35.715833, 139.793889, 4, @route_id5),
(UUID(), 35.717778, 139.796111, 5, @route_id5),

(UUID(), 35.698333, 139.773056, 1, @route_id6),
(UUID(), 35.700556, 139.771389, 2, @route_id6),
(UUID(), 35.702222, 139.774444, 3, @route_id6),
(UUID(), 35.699722, 139.770833, 4, @route_id6),
(UUID(), 35.697222, 139.771667, 5, @route_id6),

(UUID(), 35.662778, 139.731389, 1, @route_id7),
(UUID(), 35.665000, 139.729167, 2, @route_id7),
(UUID(), 35.660556, 139.734444, 3, @route_id7),
(UUID(), 35.663333, 139.733889, 4, @route_id7),
(UUID(), 35.662222, 139.728889, 5, @route_id7),

(UUID(), 35.628889, 139.738889, 1, @route_id8),
(UUID(), 35.631111, 139.741111, 2, @route_id8),
(UUID(), 35.627222, 139.741667, 3, @route_id8),
(UUID(), 35.625556, 139.737778, 4, @route_id8),
(UUID(), 35.629444, 139.736667, 5, @route_id8),

(UUID(), 35.671389, 139.765278, 1, @route_id9),
(UUID(), 35.673611, 139.767500, 2, @route_id9),
(UUID(), 35.669722, 139.763889, 3, @route_id9),
(UUID(), 35.672778, 139.761667, 4, @route_id9),
(UUID(), 35.674444, 139.763333, 5, @route_id9),

(UUID(), 35.671389, 139.702444, 1, @route_id10),
(UUID(), 35.673611, 139.704167, 2, @route_id10),
(UUID(), 35.670278, 139.705556, 3, @route_id10),
(UUID(), 35.668889, 139.701667, 4, @route_id10),
(UUID(), 35.671944, 139.703333, 5, @route_id10);