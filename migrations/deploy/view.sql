-- Deploy izi:view to pg

BEGIN;

CREATE OR REPLACE VIEW "getRequest" AS
SELECT
r.id,
r.title,
r.urgent,
r.message,
r.lng,
r.lat,
r.city,
r.range,
r.user_id,
r.job_id,
u.first_name,
u.last_name,
r.created_at,
j.name AS job,
json_agg(row_to_json((SELECT x FROM (SELECT rm.id, rm.url, rm.name) AS x))) AS "media",
json_agg(json_build_object(
    'id', conversation.id, 
    'user_1', conversation.user_1, 
    'user_2', conversation.user_2, 
    'updated_at', conversation.updated_at 
    )) AS conversation
FROM "request" r
LEFT JOIN "request_has_media" rhm ON "request_id"=r."id"
LEFT JOIN "media" rm ON rm."id"="media_id"
JOIN "job" j ON j."id"=r."job_id"
JOIN "user" u ON u."id"=r."user_id"
LEFT JOIN "conversation" ON conversation."request_id"=r."id"
GROUP BY
r.id,
r.title,
r.urgent,
r.message,
r.lng,
r.lat,
r.city,
r.range,
r.user_id,
r.job_id,
u.first_name,
u.last_name,
r.created_at,
j.name
ORDER BY r.created_at DESC;

CREATE OR REPLACE VIEW "getRequestByConversation" AS
SELECT
r.id,
r.title,
r.urgent,
r.message,
r.lng,
r.lat,
r.city,
r.range,
r.user_id,
r.job_id,
u.first_name,
u.last_name,
r.created_at,
j.name AS job,
rm.media,
c.conversation
FROM "request" r
JOIN "job" j ON j."id"=r."job_id"
JOIN "user" u ON u."id"=r."user_id"
LEFT JOIN (
  SELECT "request_id", json_agg(row_to_json((SELECT x FROM (SELECT media.id, media.url, media.name) AS x))) AS media
  FROM "request_has_media"
  JOIN "media" ON "media"."id"="request_has_media"."media_id"
  GROUP BY "request_id"
) rm ON rm."request_id"=r."id"
LEFT JOIN (
  SELECT "request_id", json_agg(json_build_object(
    'id', id, 
    'user_1', user_1, 
    'user_2', user_2, 
    'updated_at', updated_at 
  )) AS conversation
  FROM "conversation"
  GROUP BY "request_id"
) c ON c."request_id"=r."id"
ORDER BY r.created_at DESC;

CREATE OR REPLACE VIEW "getMessageByUserConversation" AS
SELECT
m.id,
m.content,
m.user_id,
m.conversation_id,
m.created_at,
c.request_id,
json_agg(row_to_json((SELECT x FROM (SELECT rm.id, rm.url, rm.name) AS x))) AS "media"
FROM "message" m
LEFT JOIN "message_has_media" mhm ON mhm."message_id"= m."id"
LEFT JOIN "media" rm ON rm."id"=mhm."media_id"
JOIN "conversation" c ON c."id"=m."conversation_id"
GROUP BY
m.id,
m.content,
m.user_id,
m.conversation_id,
c.request_id,
m.created_at,
m.updated_at
ORDER BY m.created_at DESC;


COMMIT;
