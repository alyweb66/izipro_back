-- Deploy izi:function to pg

BEGIN;
-- Function to insert a new row in the request_media table
CREATE OR REPLACE FUNCTION insert_request_media(data jsonb)
RETURNS INTEGER[] AS $$
DECLARE
    record jsonb;
    inserted_ids INTEGER[] := ARRAY[]::INTEGER[];
    inserted_id INTEGER;
BEGIN
    -- Loop through each object in JSON array
    FOR record IN SELECT * FROM jsonb_array_elements(data)
    LOOP
        -- Insert data into request_media table and retrieve inserted ID
        INSERT INTO request_media (url, name, user_id)
        VALUES (record->>'url', record->>'name', (record->>'user_id')::int)
        RETURNING id INTO inserted_id;
        
        -- Add the inserted ID to the table of inserted IDs
        inserted_ids := array_append(inserted_ids, inserted_id);
    END LOOP;
    
    -- Return the array of inserted IDs
    RETURN inserted_ids;
END;
$$ LANGUAGE plpgsql;

-- Function to insert a new row in the request_has_request_media table
CREATE OR REPLACE FUNCTION insert_request_has_request_media(request_id INTEGER, media_ids INTEGER[])
RETURNS BOOLEAN AS $$
DECLARE
    media_id INTEGER;
BEGIN
    -- Loop over each media_id in the array
    FOR media_id IN SELECT UNNEST(media_ids)
    LOOP
    -- Begin an exception block
        BEGIN
        -- Insert a new row with the request_id and media_id
        INSERT INTO request_has_request_media (request_id, request_media_id)
        VALUES (request_id, media_id);
        EXCEPTION WHEN OTHERS THEN
            -- If an error occurred, return false
            RETURN false;
        END;
    END LOOP;
     -- If no errors occurred, return true
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to delete a row from the request_media table
CREATE OR REPLACE FUNCTION delete_orphaned_request_media_func() RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM request_media
  WHERE id = OLD.request_media_id AND NOT EXISTS (
    SELECT 1 FROM request_has_request_media WHERE request_media_id = OLD.request_media_id
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER delete_orphaned_request_media
AFTER DELETE ON request_has_request_media
FOR EACH ROW EXECUTE PROCEDURE delete_orphaned_request_media_func();

-- Function to insert a new row in the user_has_job table
CREATE OR REPLACE FUNCTION insert_user_has_job(user_id INTEGER, job_ids INTEGER[])
RETURNS BOOLEAN AS $$
DECLARE
    job_id INTEGER;
BEGIN
    -- Loop over each job_id in the array
    FOR job_id IN SELECT UNNEST(job_ids)
    LOOP
    -- Begin an exception block
        BEGIN
        -- Insert a new row with the user_id and job_id
        INSERT INTO user_has_job (user_id, job_id)
        VALUES (user_id, job_id);
        EXCEPTION WHEN OTHERS THEN
            -- If an error occurred, return false
            RETURN false;
        END;
    END LOOP;
     -- If no errors occurred, return true
    RETURN true;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION getRequestByJob(job_ids INT[], userId_id INT, ofset INT, lim INT)
RETURNS TABLE(
id INT,
title TEXT,
urgent BOOLEAN,
message TEXT,
lng NUMERIC,
lat NUMERIC,
range INT,
user_id INT,
job_id INT,
city TEXT,
first_name TEXT,
last_name TEXT,
created_at TIMESTAMP WITH TIME ZONE,
job TEXT,
media JSON
) AS $$
BEGIN
  RETURN QUERY 
  SELECT 
r.id,
r.title,
r.urgent,
r.message,
r.lng,
r.lat,
r.range,
r.user_id,
r.job_id,
r.city,
u.first_name,
u.last_name,
r.created_at,
j.name AS job,
json_agg(row_to_json((SELECT x FROM (SELECT rm.id, rm.url, rm.name) AS x))) AS "media"
FROM "request" r
LEFT JOIN "request_has_request_media" rhm ON "request_id"=r."id"
LEFT JOIN "request_media" rm ON rm."id"="request_media_id"
JOIN "job" j ON j."id"=r."job_id"
JOIN "user" u ON u."id"=r."user_id"
WHERE r.job_id = ANY(job_ids)
AND NOT EXISTS (
  SELECT 1 FROM "user_has_hiddingClientRequest" uhhcr
  WHERE uhhcr."request_id" = r.id AND uhhcr."user_id" = userId_id
)
GROUP BY
r.id,
r.title,
r.urgent,
r.message,
r.lng,
r.lat,
r.range,
r.user_id,
r.job_id,
r.city,
u.first_name,
u.last_name,
r.created_at,
j.name
ORDER BY r.created_at DESC
  OFFSET ofset LIMIT lim;
END; $$
LANGUAGE plpgsql;




COMMIT;

