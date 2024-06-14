-- Revert izi:init from pg

BEGIN;

DROP TABLE "user_has_hiddingClientRequest";
DROP TABLE "user_has_user";
DROP TABLE "user_has_job";
DROP TABLE "user_has_notViewedRequest";
DROP TABLE "message_has_media" CASCADE;
DROP TABLE "request_has_media" CASCADE;
DROP TABLE "message";
DROP TABLE "media";
DROP TABLE "research";
DROP TABLE "event";
DROP TABLE "conversation";
DROP TABLE "request";
DROP TABLE "job";
DROP TABLE "category";
DROP TABLE "type";
DROP TABLE "user_setting";
DROP TABLE "subscription";
DROP TABLE "user";

DROP DOMAIN email;
DROP DOMAIN postal_code_domain;


COMMIT;
