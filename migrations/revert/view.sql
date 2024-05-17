-- Revert izi:view from pg

BEGIN;

DROP VIEW "getRequestByConversation";
DROP VIEW "getMessageByUserConversation";

COMMIT;
