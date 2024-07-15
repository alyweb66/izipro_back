-- Revert izi:function from pg

BEGIN;

DROP FUNCTION insert_media;
DROP FUNCTION insert_request_has_media;
DROP FUNCTION insert_message_has_media;
DROP TRIGGER delete_orphaned_media ON request_has_media;;
DROP FUNCTION delete_orphaned_media_func;
DROP FUNCTION insert_user_has_job;
DROP FUNCTION insert_subscription;
DROP FUNCTION getRequestByJob;
DROP FUNCTION getRequestSubscription;
DROP TRIGGER request_inserted ON request;
DROP FUNCTION add_not_viewed_request;
DROP FUNCTION getMyConversationRequest;


COMMIT;
