-- Revert izi:init from pg

BEGIN;

DROP TABLE "user_has_hiddingClientRequest";
DROP TABLE "user_has_job";
DROP TABLE "user_has_notViewedRequest";
DROP TABLE "user_has_notViewedConversation";
DROP TABLE "message_has_media" CASCADE;
DROP TABLE "request_has_media" CASCADE;
DROP TABLE "message";
DROP TABLE "notification_push";
DROP TABLE "notification";
DROP TABLE "media";
DROP TABLE "conversation";
DROP TABLE "request";
DROP TABLE "rules";
DROP TABLE "cookie_consents";
DROP TABLE "job";
DROP TABLE "category";
DROP TABLE "user_setting";
DROP TABLE "subscription";
DROP TABLE "user";

DROP DOMAIN email;
DROP DOMAIN postal_code_domain;

DROP INDEX IF EXISTS "idx_user_email";
DROP INDEX IF EXISTS "idx_request_user_id";
DROP INDEX IF EXISTS "idx_message_conversation_id";
DROP INDEX IF EXISTS "idx_conversation_request_id";


COMMIT;
