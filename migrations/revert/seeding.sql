-- Revert izi:seeding from pg

BEGIN;

DELETE FROM "message_has_media";
DELETE FROM "media";
DELETE FROM "request";
DELETE FROM "job";
DELETE FROM "category";
DELETE FROM "message";
DELETE FROM "user";

COMMIT;
