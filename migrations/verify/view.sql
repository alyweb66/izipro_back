-- Verify izi:view on pg

BEGIN;

SELECT * FROM getRequest WHERE false;

ROLLBACK;
