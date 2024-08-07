-- Verify izi:seeding on pg

BEGIN;

SELECT * FROM "user" WHERE false;
SELECT * FROM "message" WHERE false;

ROLLBACK;
