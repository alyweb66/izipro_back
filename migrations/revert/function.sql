-- Revert izi:function from pg

BEGIN;

DROP FUNCTION IF EXISTS insert_media;
DROP FUNCTION IF EXISTS insert_request_has_media;
DROP FUNCTION IF EXISTS insert_message_has_media;
DROP TRIGGER IF EXISTS delete_orphaned_media ON request_has_media;
DROP TRIGGER IF EXISTS delete_orphaned_media_from_message ON message_has_media;
DROP FUNCTION IF EXISTS delete_orphaned_media_func;
DROP FUNCTION IF EXISTS insert_user_has_job;
DROP FUNCTION IF EXISTS insert_subscription;
DROP FUNCTION IF EXISTS getRequestByJob;
DROP FUNCTION IF EXISTS getRequestSubscription;
DROP TRIGGER IF EXISTS request_inserted ON request;
DROP FUNCTION IF EXISTS add_not_viewed_request;
DROP FUNCTION IF EXISTS getMyConversationRequest;
DROP TRIGGER IF EXISTS trigger_delete_not_viewed_requests ON "request";
DROP FUNCTION IF EXISTS delete_not_viewed_requests;


COMMIT;
