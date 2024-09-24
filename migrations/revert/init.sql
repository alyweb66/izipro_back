-- Revert izi:init from pg

BEGIN;

DROP INDEX IF EXISTS "idx_user_email";
DROP INDEX IF EXISTS "idx_request_user_id";
DROP INDEX IF EXISTS "idx_message_conversation_id";
DROP INDEX IF EXISTS "idx_conversation_request_id";
DROP INDEX IF EXISTS "idx_media_name";

DROP TABLE IF EXISTS "user_has_hiddingClientRequest";
DROP TABLE IF EXISTS "user_has_job";
DROP TABLE IF EXISTS "user_has_notViewedRequest";
DROP TABLE IF EXISTS "user_has_notViewedConversation";
DROP TABLE IF EXISTS "message_has_media" CASCADE;
DROP TABLE IF EXISTS "request_has_media" CASCADE;
DROP TABLE IF EXISTS "message";
DROP TABLE IF EXISTS "notification_push";
DROP TABLE IF EXISTS "notification";
DROP TABLE IF EXISTS "media";
DROP TABLE IF EXISTS "conversation";
DROP TABLE IF EXISTS "request";
DROP TABLE IF EXISTS "rules";
DROP TABLE IF EXISTS "cookie_consents";
DROP TABLE IF EXISTS "job";
DROP TABLE IF EXISTS "category";
DROP TABLE IF EXISTS "user_setting";
DROP TABLE IF EXISTS "subscription";
DROP TABLE IF EXISTS "user";

DROP DOMAIN email;
DROP DOMAIN postal_code_domain;




COMMIT;
