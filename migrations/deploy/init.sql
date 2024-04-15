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
   "email" email NOT NULL UNIQUE CHECK (LENGTH("email") <= 50),
   "verified_email" BOOLEAN NOT NULL DEFAULT FALSE,
   "address" TEXT CHECK (LENGTH("address") <= 100),
   "postal_code" postal_code_domain,
   "city" TEXT CHECK (LENGTH("city") <= 50),
   "lat" NUMERIC,
   "lng" NUMERIC,
   "password" TEXT NOT NULL UNIQUE,
   "remember_token" TEXT,
   "refresh_token" TEXT,
   "siret" BIGINT UNIQUE CHECK (LENGTH("siret"::TEXT) = 14),
   "denomination" TEXT CHECK (LENGTH("last_name") <= 50),
   "role" TEXT NOT NULL,
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

CREATE TABLE "type"(
   "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   "name" TEXT CHECK (LENGTH("name") <= 50),
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
   "message" TEXT NOT NULL,
   "lng" NUMERIC NOT NULL,
   "lat" NUMERIC NOT NULL,
   "range" INT NOT NULL,
   "user_id" INT NOT NULL REFERENCES "user"(id),
   "job_id" INT NOT NULL REFERENCES "job"(id),
   "created_at" timestamptz NOT NULL DEFAULT now(),
   "updated_at" timestamptz
);

CREATE TABLE "conversation"( 
   "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   "title" TEXT CHECK (LENGTH("title") <= 50),
   "participant_1" INT NOT NULL REFERENCES "user"(id),
   "participant_2" INT NOT NULL REFERENCES "user"(id),
   "request_id" INT NOT NULL REFERENCES "request"(id),
   "created_at" timestamptz NOT NULL DEFAULT now(),
   "updated_at" timestamptz
   CONSTRAINT different_participants CHECK ("participant_1" <> "participant_2")
);

CREATE TABLE "message"(
   "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   "content" TEXT,
   "sender" INT NOT NULL REFERENCES "user"(id),
   "receiver" INT NOT NULL REFERENCES "user"(id),
   "conversation_id" INT NOT NULL REFERENCES "conversation"(id),
   "created_at" timestamptz NOT NULL DEFAULT now(),
   "updated_at" timestamptz
);

CREATE TABLE "chat_media"(
   "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   "url" TEXT,
   "sender" INT NOT NULL REFERENCES "user"(id),
   "receiver" INT NOT NULL REFERENCES "user"(id),
   "created_at" timestamptz NOT NULL DEFAULT now(),
   "updated_at" timestamptz
  
);

CREATE TABLE "request_media"(
   "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   "url" TEXT NOT NULL UNIQUE,
   "name" TEXT NOT NULL UNIQUE,
   "user_id" INT NOT NULL REFERENCES "user"(id),
   "created_at" timestamptz NOT NULL DEFAULT now(),
   "updated_at" timestamptz
  
);


CREATE TABLE "event"(
   "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   "start_date" timestamptz,
   "end_date" timestamptz,
   "all_day" BOOLEAN,
   "user_id" INT NOT NULL REFERENCES "user"(id),
   "user_id_1" INT NOT NULL REFERENCES "user"(id),
   "type_id" INT NOT NULL REFERENCES "type"(id),
   "created_at" timestamptz NOT NULL DEFAULT now(),
   "updated_at" timestamptz
);

CREATE TABLE "research"(
   "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   "localization" TEXT,
   "job_id" INT NOT NULL REFERENCES "job"(id),
   "created_at" timestamptz NOT NULL DEFAULT now(),
   "updated_at" timestamptz
);


CREATE TABLE "request_has_request_media"(
    "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   "request_media_id" INT NOT NULL REFERENCES "request_media"(id),
   "request_id" INT NOT NULL REFERENCES "request"(id) ON DELETE CASCADE,
   "created_at" timestamptz NOT NULL DEFAULT now(),
   "updated_at" timestamptz
);

CREATE TABLE "message_has_chat_media"(
   "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   "chat_media_id" INT NOT NULL REFERENCES "chat_media"(id),
   "message_id" INT NOT NULL REFERENCES "message"(id),
   "created_at" timestamptz NOT NULL DEFAULT now(),
   "updated_at" timestamptz
);

CREATE TABLE "user_has_job"(
   "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   "user_id" INT NOT NULL REFERENCES "user"(id),
   "job_id" INT NOT NULL REFERENCES "job"(id),
   "created_at" timestamptz NOT NULL DEFAULT now(),
   "updated_at" timestamptz
);

CREATE TABLE "user_has_user"(
   "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   "user_id" INT NOT NULL REFERENCES "user"(id),
   "user_id_1" INT NOT NULL REFERENCES "user"(id),
   "created_at" timestamptz NOT NULL DEFAULT now(),
   "updated_at" timestamptz
);

CREATE TABLE "user_has_hiddingClientRequest"(
   "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   "user_id" INT NOT NULL REFERENCES "user"(id),
   "request_id" INT NOT NULL REFERENCES "request"(id),
   "created_at" timestamptz NOT NULL DEFAULT now(),
   "updated_at" timestamptz
);

COMMIT;
