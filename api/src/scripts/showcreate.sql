-- Script to generate SHOW CREATE TABLE for all tables in the current database

-- Declare a variable to store the table name
SET @table_name = '';

-- Create a cursor to loop through all tables in the database
DECLARE done INT DEFAULT FALSE;
DECLARE table_cursor CURSOR FOR 
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'gomicollection'; -- Use your database name here

-- Declare a handler for when the cursor reaches the end of the result set
DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

-- Open the cursor
OPEN table_cursor;

-- Loop through all the tables
read_loop: LOOP
  FETCH table_cursor INTO @table_name;
  IF done THEN
    LEAVE read_loop;
  END IF;

  -- Print the CREATE TABLE statement for each table
  SET @sql = CONCAT('SHOW CREATE TABLE ', @table_name);
  PREPARE stmt FROM @sql;
  EXECUTE stmt;
  DEALLOCATE PREPARE stmt;
  
END LOOP;

-- Close the cursor
CLOSE table_cursor;
