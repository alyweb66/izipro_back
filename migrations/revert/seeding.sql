-- Revert izi:seeding from pg

BEGIN;

DELETE FROM "user_has_hiddingClientRequest";
DELETE FROM "user_has_job";
DELETE FROM "message_has_media";
DELETE FROM "request_has_media";
DELETE FROM "media";
DELETE FROM "message";
DELETE FROM "conversation";
DELETE FROM "request";
DELETE FROM "job";
DELETE FROM "category";
DELETE FROM "subscription";
DELETE FROM "user";

COMMIT;
