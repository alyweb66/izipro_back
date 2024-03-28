-- Revert izi:seeding from pg

BEGIN;

DELETE FROM "message_has_chat_media";
DELETE FROM "request_has_request_media";
DELETE FROM "chat_media";
DELETE FROM "request_media";
DELETE FROM "message";
DELETE FROM "conversation";
DELETE FROM "request";
DELETE FROM "job";
DELETE FROM "category";
DELETE FROM "user";

COMMIT;
