-- Deploy izi:view to pg

BEGIN;

CREATE OR REPLACE VIEW "getRequest" AS
SELECT
r.id,
r.title,
r.urgent,
r.message,
r.localization,
r.range,
r.user_id,
r.job_id,
r.created_at,
j.name AS job,
json_agg(row_to_json((SELECT x FROM (SELECT rm.url, rm.name) AS x))) AS "media"
FROM "request" r
JOIN "request_has_request_media" rhm ON "request_id"=r."id"
JOIN "request_media" rm ON rm."id"="request_media_id"
JOIN "job" j ON j."id"=r."job_id"
GROUP BY
r.id,
r.title,
r.urgent,
r.message,
r.localization,
r.range,
r.user_id,
r.job_id,
r.created_at,
j.name
ORDER BY r.created_at DESC;

COMMIT;
