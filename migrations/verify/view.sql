-- Verify izi:view on pg

BEGIN;

SELECT * FROM getRequestByConversation WHERE false;
SELECT * FROM getMessageByUserConversation WHERE false;

ROLLBACK;
