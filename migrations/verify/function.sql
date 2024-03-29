-- Verify izi:function on pg

BEGIN;

SELECT * FROM input_request_media(null);
SELECT * FROM input_request_has_request_media(null, null);

ROLLBACK;
