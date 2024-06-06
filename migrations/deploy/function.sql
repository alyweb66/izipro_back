-- Deploy izi:function to pg

BEGIN;
-- Function to insert a new row in the request_media table
CREATE OR REPLACE FUNCTION insert_media(data jsonb)
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
        INSERT INTO media (url, name)
        VALUES (record->>'url', record->>'name')
        RETURNING id INTO inserted_id;
        
        -- Add the inserted ID to the table of inserted IDs
        inserted_ids := array_append(inserted_ids, inserted_id);
    END LOOP;
    
    -- Return the array of inserted IDs
    RETURN inserted_ids;
END;
$$ LANGUAGE plpgsql;

-- Function to insert a new row in the request_has_media table
CREATE OR REPLACE FUNCTION insert_request_has_media(request_id INTEGER, media_ids INTEGER[])
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
        INSERT INTO request_has_media (request_id, media_id)
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

-- Function to insert a new row in the message_has_media table
CREATE OR REPLACE FUNCTION insert_message_has_media(message_id INTEGER, media_ids INTEGER[])
RETURNS BOOLEAN AS $$
DECLARE
    media_id INTEGER;
BEGIN
    -- Loop over each media_id in the array
    FOR media_id IN SELECT UNNEST(media_ids)
    LOOP
    -- Begin an exception block
        BEGIN
        -- Insert a new row with the message_id and media_id
        INSERT INTO message_has_media (message_id, media_id)
        VALUES (message_id, media_id);
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
CREATE OR REPLACE FUNCTION delete_orphaned_media_func() RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM media
  WHERE id = OLD.media_id AND NOT EXISTS (
    SELECT 1 FROM request_has_media WHERE media_id = OLD.media_id
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER delete_orphaned_media
AFTER DELETE ON request_has_media
FOR EACH ROW EXECUTE PROCEDURE delete_orphaned_media_func();

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
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    job TEXT,
    media JSON,
    conversation JSON
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
        r.deleted_at,
        r.created_at,
        j.name AS job,
        m.media,
        c.conversation
    FROM "request" r
    LEFT JOIN (
        SELECT "request_id", json_agg(row_to_json((SELECT x FROM (SELECT m.id, m.url, m.name) AS x))) AS media
        FROM "request_has_media" rhm
        JOIN "media" m ON m."id"="media_id"
        GROUP BY "request_id"
    ) m ON m."request_id" = r."id"
    LEFT JOIN "job" j ON j."id" = r."job_id"
    JOIN "user" u ON u."id" = r."user_id"
    LEFT JOIN (
        SELECT "request_id", json_agg(json_build_object('id', conv.id, 'user_1', conv.user_1, 'user_2', conv.user_2, 'updated_at', conv.updated_at)) AS conversation
        FROM "conversation" conv
        GROUP BY "request_id"
    ) c ON c."request_id" = r."id"
    WHERE r.job_id = ANY(job_ids)
      AND r.deleted_at IS NULL
      AND NOT EXISTS (
          SELECT 1 FROM "user_has_hiddingClientRequest" uhhcr
          WHERE uhhcr."request_id" = r.id AND uhhcr."user_id" = userId_id
      )
      AND NOT EXISTS (
          SELECT 1 FROM "conversation" conv
          WHERE conv."request_id" = r.id AND (conv."user_1" = userId_id OR conv."user_2" = userId_id)
      )
    ORDER BY r.created_at DESC
    OFFSET ofset LIMIT lim;
END; $$
LANGUAGE plpgsql;



-- Function to insert a new row in the subscription table and return table
CREATE OR REPLACE FUNCTION insert_subscription(
    p_user_id INT,
    p_subscriber TEXT,
    p_subscriber_id INT[]
)
RETURNS TABLE(
    id INT,
    user_id INT,
    subscriber TEXT,
    subscriber_id INT[],
    created_at timestamptz,
    updated_at timestamptz
)
AS $$
BEGIN
    -- Check if a row already exists for this user and subscriber
    IF EXISTS (SELECT 1 FROM "subscription" WHERE "subscription"."subscriber" = p_subscriber AND "subscription"."user_id" = p_user_id) THEN
        -- Update the existing row
        RETURN QUERY
        UPDATE "subscription"
        SET "subscriber_id" = p_subscriber_id
        WHERE "subscription"."subscriber" = p_subscriber AND  "subscription"."user_id" = p_user_id
        RETURNING *;
    ELSE
        -- Insert a new row
        RETURN QUERY
        INSERT INTO "subscription" ("user_id", "subscriber", "subscriber_id")
        VALUES (p_user_id, p_subscriber, p_subscriber_id)
        RETURNING *;
    END IF;
END;
$$ LANGUAGE plpgsql;


COMMIT;

