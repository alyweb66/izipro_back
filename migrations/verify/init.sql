-- Verify izi:init on pg

BEGIN;

SELECT * FROM "user_has_hiddingClientRequest" WHERE false;
SELECT * FROM "user_has_notViewedRequest" WHERE false;
SELECT * FROM "user_has_notViewedConversation" WHERE false;
SELECT * FROM "user" WHERE false;
SELECT * FROM "subscription" WHERE false;
SELECT * FROM "user_setting" WHERE false;
SELECT * FROM "type" WHERE false;
SELECT * FROM "category" WHERE false;
SELECT * FROM "message" WHERE false;
SELECT * FROM "notification" WHERE false;
SELECT * FROM "media" WHERE false;
SELECT * FROM "message_has_media" WHERE false;
SELECT * FROM "user_has_user" WHERE false;
SELECT * FROM "job" WHERE false;
SELECT * FROM "rules" WHERE false;
SELECT * FROM "cookie_consents" WHERE false;
SELECT * FROM "user_has_job" WHERE false;
SELECT * FROM "event" WHERE false;
SELECT * FROM "research" WHERE false;
SELECT * FROM "request" WHERE false;
SELECT * FROM "conversation" WHERE false;
SELECT * FROM "request_has_media" WHERE false;


ROLLBACK;
