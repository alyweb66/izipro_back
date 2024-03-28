-- Revert izi:init from pg

BEGIN;

DROP TABLE "user_has_user";
DROP TABLE "user_has_job";
DROP TABLE "message_has_chat_media";
DROP TABLE "request_has_request_media";
DROP TABLE "message";
DROP TABLE "conversation";
DROP TABLE "request";
DROP TABLE "research";
DROP TABLE "event";
DROP TABLE "job";
DROP TABLE "request_media";
DROP TABLE "chat_media";
DROP TABLE "category";
DROP TABLE "type";
DROP TABLE "setting";
DROP TABLE "user";

DROP DOMAIN email;
DROP DOMAIN postal_code_domain;


COMMIT;
