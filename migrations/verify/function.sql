-- Verify izi:function on pg

BEGIN;

SELECT * FROM input_request_media(null);

ROLLBACK;
