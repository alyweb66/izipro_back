-- Revert izi:seeding from pg

BEGIN;

DELETE FROM "message";
DELETE FROM "user";

COMMIT;
