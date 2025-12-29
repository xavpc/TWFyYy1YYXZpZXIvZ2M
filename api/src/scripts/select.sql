-- Show all data from each table with all columns

-- View complete route data
SELECT *
FROM route;

-- View complete employee data
SELECT *
FROM employee;

-- View complete device data
SELECT *
FROM device;

-- View complete collection points data
SELECT *
FROM collection_points;

-- View complete device route data
SELECT *
FROM device_route;

-- View complete image data
SELECT *
FROM image;

-- View complete complaints data
SELECT *
FROM complaints;

-- View complete device location data
SELECT *
FROM device_location;

-- View complete route coordinates data
SELECT *
FROM route_coordinates;

-- Optional: Add these for better formatted joined views if needed
-- View devices with employee details
SELECT d.*, e.first_name, e.last_name
FROM device d
JOIN employee e ON d.employee_id = e.employee_id;

-- View collection points with route details
SELECT cp.*, r.route_name
FROM collection_points cp
JOIN route r ON cp.route_id = r.route_id;

-- View complaints with device and image details
SELECT c.*, d.device_name, i.file_name
FROM complaints c
JOIN device d ON c.device_id = d.device_id
JOIN image i ON c.image_id = i.image_id;