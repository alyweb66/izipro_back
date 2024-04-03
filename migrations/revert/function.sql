-- Revert izi:function from pg

BEGIN;

DROP FUNCTION insert_request_media;
DROP FUNCTION insert_request_has_request_media;
DROP TRIGGER delete_orphaned_request_media ON request_has_request_media;;
DROP FUNCTION delete_orphaned_request_media_func;

COMMIT;
