-- Revert izi:seeding from pg

BEGIN;

DELETE FROM "message_has_media";
DELETE FROM "media";
DELETE FROM "message";
DELETE FROM "conversation";
DELETE FROM "request";
DELETE FROM "job";
DELETE FROM "category";
DELETE FROM "user";

COMMIT;
