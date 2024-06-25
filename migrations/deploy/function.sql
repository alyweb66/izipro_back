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
    denomination TEXT,
    viewed_conv BOOLEAN,
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
        u.denomination,
		r.viewed_conv,
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
        SELECT "request_id", json_agg(json_build_object('id', conv.id,
         'user_1', conv.user_1, 
         'user_2', conv.user_2, 
         'request_id', conv.request_id,
         'sender', conv.sender,
         'updated_at', conv.updated_at)) AS conversation
        FROM "conversation" conv
        GROUP BY "request_id"
    ) c ON c."request_id" = r."id"
    WHERE r.job_id = ANY(job_ids)
      AND r.deleted_at IS NULL
      AND r.user_id != userId_id
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

CREATE OR REPLACE FUNCTION getRequestSubscription(job_ids INT[], userId_id INT, ofset INT, lim INT)
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
    denomination TEXT,
    viewed_conv BOOLEAN,
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
        u.denomination,
        r.viewed_conv,
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
        SELECT "request_id", json_agg(json_build_object(
            'id', conv.id, 
            'user_1', conv.user_1, 
            'user_2', conv.user_2, 
            'request_id', conv.request_id,
            'sender', conv.sender,
            'updated_at', conv.updated_at)) AS conversation
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

-- Function to insert a new row in the user_has_notViewedRequest table when a new request is inserted
CREATE OR REPLACE FUNCTION add_not_viewed_request() RETURNS TRIGGER AS $$
DECLARE
    subscribers RECORD;
BEGIN
    FOR subscribers IN SELECT * FROM subscription WHERE subscriber = 'jobRequest' AND subscriber_id @> ARRAY[NEW.job_id]
    LOOP
        IF subscribers.user_id != NEW.user_id THEN
            INSERT INTO "user_has_notViewedRequest"(user_id, request_id, created_at)
            VALUES (subscribers.user_id, NEW.id, NOW(), NOW());
        END IF;
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER request_inserted
AFTER INSERT ON request
FOR EACH ROW
EXECUTE FUNCTION add_not_viewed_request();


-- Function to get request by conversation for myConversation
CREATE OR REPLACE FUNCTION getMyConversationRequest(user_id_param INT, offset_param INT, limit_param INT)
RETURNS TABLE (
    id INT,
    title TEXT,
    urgent BOOLEAN,
    message TEXT,
    lng NUMERIC,
    lat NUMERIC,
    city TEXT,
    range INT,
    user_id INT,
    job_id INT,
    first_name TEXT,
    last_name TEXT,
    denomination TEXT,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    job TEXT,
    media JSON,
    conversation JSON
) AS $$
BEGIN
    RETURN QUERY
    WITH req_with_max_updated_at AS (
        SELECT r.*, 
               COALESCE(MAX(c.updated_at), r.created_at) AS max_updated_at
        FROM "request" r
        LEFT JOIN "conversation" c ON c."request_id" = r."id"
        GROUP BY r.id
    ), 
    req_with_conversation AS (
        SELECT 
        r.id, r.title, 
        r.urgent, 
        r.message, 
        r.lng, 
        r.lat, 
        r.city, 
        r.range, 
        r.user_id, 
        r.job_id,
        u.first_name, 
        u.last_name,
        u.denomination, 
        u.image, 
        r.created_at, 
        r.deleted_at, 
        j.name AS job, 
        rm.media, 
        c.conversation
        FROM req_with_max_updated_at r
        JOIN "job" j ON j."id" = r."job_id"
        JOIN "user" u ON u."id" = r."user_id"
        LEFT JOIN (
            SELECT "request_id", json_agg(row_to_json((SELECT x FROM (SELECT media.id, media.url, media.name) AS x))) AS media 
            FROM "request_has_media"
            JOIN "media" ON "media"."id" = "request_has_media"."media_id"
            GROUP BY "request_id"
        ) rm ON rm."request_id" = r."id"
        LEFT JOIN (
            SELECT "request_id", json_agg(json_build_object(
                'id', "conversation".id, 
                'user_1', "conversation".user_1, 
                'user_2', "conversation".user_2,
                'request_id', "conversation".request_id, 
                'sender', "conversation".sender,
                'updated_at', "conversation".updated_at)) AS conversation 
            FROM "conversation"
            GROUP BY "request_id"
        ) c ON c."request_id" = r."id"
        ORDER BY r.max_updated_at DESC
    )
    SELECT 
    rq.id, rq.title, rq.urgent, rq.message, rq.lng, rq.lat, rq.city, rq.range, 
    rq.user_id, rq.job_id, rq.first_name, rq.last_name, rq.denomination, rq.image, 
    rq.created_at, rq.deleted_at, rq.job, rq.media, rq.conversation
    FROM req_with_conversation rq
    WHERE EXISTS (
        SELECT 1
        FROM json_array_elements(rq.conversation) AS conv
        WHERE conv->>'user_1' = user_id_param::TEXT OR conv->>'user_2' = user_id_param::TEXT
    )
	AND rq.user_id != user_id_param
    AND NOT EXISTS (
        SELECT 1
        FROM "user_has_hiddingClientRequest" uhcr
        WHERE uhcr.user_id = user_id_param AND uhcr.request_id = rq.id
    )
    OFFSET offset_param LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION add_to_not_viewed() RETURNS TRIGGER AS $$
DECLARE
  sub_user_id INT;
  req_id INT;
  found BOOLEAN := FALSE;
BEGIN
  -- Get the request_id from the conversation
  SELECT request_id FROM conversation WHERE id = NEW.conversation_id INTO req_id;

  -- Debugging: Log the retrieved request_id
  RAISE NOTICE 'Request ID: %', req_id;

  -- Loop through subscribers for 'conversation' and 'clientConversation' first
  FOR sub_user_id IN (
    SELECT user_id 
    FROM subscription 
    WHERE subscriber IN ('conversation', 'clientConversation') 
      AND NEW.conversation_id = ANY(subscriber_id)
  ) LOOP
    found := TRUE;
    -- Debugging: Log the current sub_user_id
    RAISE NOTICE 'Subscriber User ID: %', sub_user_id;

    IF sub_user_id <> NEW.user_id THEN
      -- Check if the pair (sub_user_id, NEW.conversation_id) already exists
      IF NOT EXISTS (
        SELECT 1 FROM "user_has_notViewedConversation" 
        WHERE user_id = sub_user_id AND conversation_id = NEW.conversation_id
      ) THEN
        -- Debugging: Log the insertion statement
        RAISE NOTICE 'Inserting into user_has_notViewedConversation: user_id=%, conversation_id=%', sub_user_id, NEW.conversation_id;

        INSERT INTO "user_has_notViewedConversation"(user_id, conversation_id, created_at) 
        VALUES (sub_user_id, NEW.conversation_id, NOW());
      END IF;
    END IF;
  END LOOP;

  -- If no subscribers were found for 'conversation' and 'clientConversation', check 'request'
  IF NOT found THEN
    FOR sub_user_id IN (
      SELECT user_id 
      FROM subscription 
      WHERE subscriber = 'request' 
        AND req_id = ANY(subscriber_id)
    ) LOOP
      -- Debugging: Log the current sub_user_id
      RAISE NOTICE 'Subscriber User ID: %', sub_user_id;

      IF sub_user_id <> NEW.user_id THEN
        -- Check if the pair (sub_user_id, NEW.conversation_id) already exists
        IF NOT EXISTS (
          SELECT 1 FROM "user_has_notViewedConversation" 
          WHERE user_id = sub_user_id AND conversation_id = NEW.conversation_id
        ) THEN
          -- Debugging: Log the insertion statement
          RAISE NOTICE 'Inserting into user_has_notViewedConversation: user_id=%, conversation_id=%', sub_user_id, NEW.conversation_id;

          INSERT INTO "user_has_notViewedConversation"(user_id, conversation_id, created_at) 
          VALUES (sub_user_id, NEW.conversation_id, NOW());
        END IF;
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER message_inserted
AFTER INSERT ON message
FOR EACH ROW
EXECUTE FUNCTION add_to_not_viewed();

COMMIT;

