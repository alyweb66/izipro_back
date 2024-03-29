-- Revert izi:function from pg

BEGIN;

DROP FUNCTION insert_request_media;
DROP FUNCTION insert_request_has_request_media;

COMMIT;
