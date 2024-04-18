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
json_agg(row_to_json((SELECT x FROM (SELECT rm.id, rm.url, rm.name) AS x))) AS "media"
FROM "request" r
JOIN "request_has_media" rhm ON "request_id"=r."id"
JOIN "media" rm ON rm."id"="media_id"
JOIN "job" j ON j."id"=r."job_id"
JOIN "user" u ON u."id"=r."user_id"
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
json_agg(row_to_json((SELECT x FROM (SELECT rm.id, rm.url, rm.name) AS x))) AS "media",
json_agg(json_build_object('id', conversation.id, 'user_1', conversation.user_1, 'user_2', conversation.user_2)) AS conversation
FROM "request" r
JOIN "request_has_media" rhm ON "request_id"=r."id"
JOIN "media" rm ON rm."id"="media_id"
JOIN "job" j ON j."id"=r."job_id"
JOIN "user" u ON u."id"=r."user_id"
JOIN "conversation" ON conversation."request_id"=r."id"
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

COMMIT;
