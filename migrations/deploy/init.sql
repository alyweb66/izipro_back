-- Deploy izi:init to pg

BEGIN;
-- Creating a domain to validate email addresses
CREATE DOMAIN "email" AS TEXT
CHECK(
    value ~ '(?:[a-z0-9!#$%&''*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&''*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])'
);

-- Creating a domain to validate FRANCE postal code
CREATE DOMAIN "postal_code_domain" AS TEXT
CHECK (
    value ~ '^0[1-9]\d{3}$'-- 01-09 Métropole
    OR value ~ '^[1-8]\d{4}$'-- 10-89 Métropole
    OR value ~ '^9[0-69]\d{3}$'-- 90-95 Métropole + Paris concours et La Poste + Armée
    OR value ~ '^97[1-8]\d{2}$'-- DOM
    OR value ~ '^98[046-9]\d{2}$'-- TOM + Monaco
);

CREATE TABLE "user"(
   "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   "first_name" TEXT CHECK (LENGTH("first_name") <= 50),
   "last_name" TEXT CHECK (LENGTH("last_name") <= 50),
   "email" email UNIQUE CHECK (LENGTH("email") <= 50),
   "verified_email" BOOLEAN NOT NULL DEFAULT FALSE,
   "address" TEXT CHECK (LENGTH("address") <= 100),
   "postal_code" postal_code_domain,
   "city" TEXT CHECK (LENGTH("city") <= 100),
   "lat" NUMERIC,
   "lng" NUMERIC,
   "password" TEXT UNIQUE,
   "remember_token" TEXT,
   "refresh_token" TEXT[] DEFAULT '{}',
   "siret" BIGINT UNIQUE CHECK (LENGTH("siret"::TEXT) = 14),
   "denomination" TEXT CHECK (LENGTH("denomination") <= 50),
   "image" TEXT,
   "description" TEXT CHECK (LENGTH("description") <= 200),
   "role" TEXT NOT NULL,
   "CGU" BOOLEAN NOT NULL DEFAULT FALSE,
   "deleted_at" timestamptz,
   "created_at" timestamptz NOT NULL DEFAULT now(),
   "updated_at" timestamptz
);

CREATE TABLE "cookie_consents" (
    "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "user_id" INT NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
    "consented_at" timestamptz NOT NULL DEFAULT now(),
    "ip_address" TEXT CHECK (LENGTH("ip_address") <= 50),
    "cookies_necessary" BOOLEAN NOT NULL DEFAULT FALSE,
    "cookies_analytics" BOOLEAN,
    "cookies_marketing" BOOLEAN,
    "updated_at" timestamptz
);

-- 4 subscriber : request, jobrequest, clientConversation, conversation
CREATE TABLE "subscription"(
   "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   "user_id" INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
   "subscriber" TEXT NOT NULL CHECK (LENGTH("subscriber") <= 50),
   "subscriber_id" INT[] NOT NULL,
   "created_at" timestamptz NOT NULL DEFAULT now(),
   "updated_at" timestamptz,
   CONSTRAINT unique_user_subscriber UNIQUE ("user_id", "subscriber")
);

CREATE TABLE "notification_push"(
   "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   "user_id" INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
   "endpoint" TEXT NOT NULL,
   "public_key" TEXT NOT NULL,
   "auth_token" TEXT NOT NULL,
   "created_at" timestamptz NOT NULL DEFAULT now(),
   "updated_at" timestamptz
);

CREATE TABLE "notification" (
   "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   "user_id" INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
   "email_notification" BOOLEAN NOT NULL DEFAULT TRUE,
   "created_at" timestamptz NOT NULL DEFAULT now(),
   "updated_at" timestamptz
);

CREATE TABLE "user_setting"(
   "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   "name" TEXT CHECK (LENGTH("name") <= 50),
   "status" TEXT CHECK (LENGTH("status") <= 50) ,
   "content" TEXT,
   "range" INT NOT NULL DEFAULT 0,
   "user_id" INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
   "created_at" timestamptz NOT NULL DEFAULT now(),
   "updated_at" timestamptz
);


CREATE TABLE "category"(
   "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   "name" TEXT CHECK (LENGTH("name") <= 50),
   "created_at" timestamptz NOT NULL DEFAULT now(),
   "updated_at" timestamptz
);

CREATE TABLE "job"(
   "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   "name" TEXT CHECK (LENGTH("name") <= 60),
   "description" TEXT,
   "category_id" INT NOT NULL REFERENCES "category"(id),
   "created_at" timestamptz NOT NULL DEFAULT now(),
   "updated_at" timestamptz
);

CREATE TABLE "request"(
   "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   "title" TEXT NOT NULL CHECK (LENGTH("title") <= 50),
   "urgent" BOOLEAN NOT NULL,
   "message" TEXT NOT NULL CHECK (LENGTH("message") <= 500),
   "city" TEXT NOT NULL CHECK (LENGTH("city") <= 50),
   "lng" NUMERIC NOT NULL,
   "lat" NUMERIC NOT NULL,
   "range" INT NOT NULL,
   "user_id" INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
   "job_id" INT NOT NULL REFERENCES "job"(id),
   "deleted_at" timestamptz,
   "created_at" timestamptz NOT NULL DEFAULT now(),
   "updated_at" timestamptz
);

CREATE TABLE "conversation"( 
   "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   "user_1" INT REFERENCES "user"(id) ON DELETE SET NULL,
   "user_2" INT REFERENCES "user"(id) ON DELETE SET NULL,
   "request_id" INT NOT NULL REFERENCES "request"(id) ON DELETE CASCADE,
   "created_at" timestamptz NOT NULL DEFAULT now(),
   "updated_at" timestamptz
   /* Check if the two participants are different */
   CONSTRAINT different_participants CHECK ("user_1" <> "user_2"),
   CONSTRAINT unique_conversation UNIQUE ("user_1", "user_2", "request_id")
);

CREATE TABLE "message"(
   "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   "content" TEXT CHECK (LENGTH("content") <= 1000),
   "user_id" INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
   "conversation_id" INT NOT NULL REFERENCES "conversation"(id) ON DELETE CASCADE,
   "created_at" timestamptz NOT NULL DEFAULT now(),
   "updated_at" timestamptz
);


CREATE TABLE "media"(
   "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   "url" TEXT NOT NULL UNIQUE,
   "thumbnail" TEXT NULL UNIQUE,
   "name" TEXT NOT NULL UNIQUE,
   "created_at" timestamptz NOT NULL DEFAULT now(),
   "updated_at" timestamptz
  
);

CREATE TABLE "rules"(
   "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   "CGU" TEXT NULL,
   "cookies" TEXT NULL,
   "created_at" timestamptz NOT NULL DEFAULT now(),
   "updated_at" timestamptz
);


CREATE TABLE "request_has_media"(
   "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   "media_id" INT NOT NULL REFERENCES "media"(id),
   "request_id" INT NOT NULL REFERENCES "request"(id) ON DELETE CASCADE,
   "created_at" timestamptz NOT NULL DEFAULT now(),
   "updated_at" timestamptz
);

CREATE TABLE "message_has_media"(
   "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   "media_id" INT NOT NULL REFERENCES "media"(id),
   "message_id" INT NOT NULL REFERENCES "message"(id) ON DELETE CASCADE,
   "created_at" timestamptz NOT NULL DEFAULT now(),
   "updated_at" timestamptz
);

CREATE TABLE "user_has_job"(
   "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   "user_id" INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
   "job_id" INT NOT NULL REFERENCES "job"(id),
   "created_at" timestamptz NOT NULL DEFAULT now(),
   "updated_at" timestamptz
);

CREATE TABLE "user_has_notViewedRequest"(
   "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   "user_id" INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
   "request_id" INT NOT NULL REFERENCES "request"(id) ON DELETE CASCADE,
   "created_at" timestamptz NOT NULL DEFAULT now(),
   "updated_at" timestamptz
);

CREATE TABLE "user_has_notViewedConversation"(
   "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   "user_id" INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
   "conversation_id" INT NOT NULL REFERENCES "conversation"(id) ON DELETE CASCADE,
   "created_at" timestamptz NOT NULL DEFAULT now(),
   "updated_at" timestamptz
);


CREATE TABLE "user_has_hiddingClientRequest"(
   "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   "user_id" INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
   "request_id" INT NOT NULL REFERENCES "request"(id) ON DELETE CASCADE,
   "created_at" timestamptz NOT NULL DEFAULT now(),
   "updated_at" timestamptz,
   CONSTRAINT unique_user_request UNIQUE ("user_id", "request_id")
);

CREATE INDEX "idx_user_email" ON "user"("email");
CREATE INDEX "idx_request_user_id" ON "request"("user_id");
CREATE INDEX "idx_message_conversation_id" ON "message"("conversation_id");
CREATE INDEX "idx_conversation_request_id" ON "conversation"("request_id");
CREATE INDEX "idx_media_name" ON "media"("name");


COMMIT;
