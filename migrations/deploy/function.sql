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

COMMIT;

