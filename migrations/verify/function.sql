-- Verify izi:function on pg

BEGIN;

SELECT * FROM input_request_media(null);
SELECT * FROM input_request_has_media(null, null);
SELECT * FROM input_message_has_media(null, null);
SELECT * FROM delete_orphaned_request_media_func();
SELECT * FROM delete_orphaned_request_media;
SELECT * FROM insert_user_has_job(null, null);
SELECT * FROM insert_subscription(null, null);
SELECT * FROM getRequestSubscription(null);
SELECT * FROM getRequestByJob(null);
SELECT * FROM getMyConversationRequest(null);
SELECT * FROM add_not_viewed_request(null);
SELECT * FROM delete_not_viewed_requests(null);

ROLLBACK;
