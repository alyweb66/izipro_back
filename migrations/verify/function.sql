-- Verify izi:function on pg

BEGIN;

SELECT * FROM input_request_media(null);
SELECT * FROM input_request_has_request_media(null, null);
SELECT * FROM delete_orphaned_request_media_func();
SELECT * FROM delete_orphaned_request_media;

ROLLBACK;
