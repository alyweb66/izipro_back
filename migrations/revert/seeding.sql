-- Revert izi:seeding from pg

BEGIN;

/*  DELETE FROM "user_has_hiddingClientRequest";
DELETE FROM "user_has_job";
DELETE FROM "message_has_media";
DELETE FROM "request_has_media";
DELETE FROM "media";
DELETE FROM "message";
DELETE FROM "conversation";
DELETE FROM "request"; 
DELETE FROM "job";
DELETE FROM "category"; */
/* DELETE FROM "subscription";
DELETE FROM "user"; */

DELETE FROM "user_has_hiddingClientRequest";
DELETE FROM "user_has_job";
DELETE FROM "user_has_notViewedRequest";
DELETE FROM "user_has_notViewedConversation";
DELETE FROM "message_has_media" CASCADE;
DELETE FROM "request_has_media" CASCADE;
DELETE FROM "message";
DELETE FROM "media";
DELETE FROM "conversation";
DELETE FROM "request";
DELETE FROM "rules";
DELETE FROM "cookie_consents";
DELETE FROM "job";
DELETE FROM "category";
/* DELETE FROM "user_setting";
DELETE FROM "subscription";
DELETE FROM "user"; */

COMMIT;
