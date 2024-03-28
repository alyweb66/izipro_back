-- Revert izi:function from pg

BEGIN;

DROP FUNCTION insert_request_media;

COMMIT;
