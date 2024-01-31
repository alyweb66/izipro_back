-- Deploy izi:init to pg

BEGIN;
-- Creating a domain to validate email addresses
CREATE DOMAIN "email" AS TEXT
CHECK(
    value ~ '(?:[a-z0-9!#$%&''*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&''*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])'
);

CREATE DOMAIN "postal_code" AS INT
CHECK (
    "postal_code" ~ '^0[1-9]\d{3}$'-- 01-09 Métropole
    OR "postal_code" ~ '^[1-8]\d{4}$'-- 10-89 Métropole
    OR "postal_code" ~ '^9[0-69]\d{3}$'-- 90-95 Métropole + Paris concours et La Poste + Armée
    OR "postal_code" ~ '^97[1-8]\d{2}$'-- DOM
    OR "postal_code" ~ '^98[046-9]\d{2}$'-- TOM + Monaco
);

CREATE TABLE "user"(
   "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   "fir_stname" TEXT NOT NULL CHECK (LENGTH("first_name") <= 50),
   "last_name" TEXT NOT NULL CHECK (LENGTH("last_name") <= 50),
   "email" email NOT NULL UNIQUE CHECK (LENGTH("email") <= 50),
   "postal_code" postal_code NOT NULL,
   "city" TEXT NOT NULL CHECK (LENGTH("city") <= 50),
   "password" TEXT NOT NULL UNIQUE,
   "remember_token" TEXT,
   "siret" INT(14),
   "denomination" TEXT NOT NULL CHECK (LENGTH("last_name") <= 50),
   "role" TEXT NOT NULL,
   "created_at" timestamptz NOT NULL DEFAULT now(),
   "updated_at" timestamptz
   
);

CREATE TABLE "setting"(
   "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   "name" TEXT CHECK (LENGTH("name") <= 50),
   "status" TEXT NOT NULL CHECK (LENGTH("status") <= 50) ,
   "content" TEXT,
   "user_id" INT NOT NULL REFERENCES "user"(id),
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

CREATE TABLE "message"(
   "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   "content" TEXT,
   "user_id" INT NOT NULL REFERENCES "user"(id),
   "user_id_1" INT NOT NULL REFERENCES "user"(id),
   "created_at" timestamptz NOT NULL DEFAULT now(),
   "updated_at" timestamptz
);

CREATE TABLE "media"(
   "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   "url" TEXT,
   "user_id" INT NOT NULL REFERENCES "user"(id),
   "user_id_1" INT NOT NULL REFERENCES "user"(id),
   "created_at" timestamptz NOT NULL DEFAULT now(),
   "updated_at" timestamptz
  
);

CREATE TABLE "message_has_media"(
   "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   "media_id" INT NOT NULL REFERENCES "media"(id),
   "message_id" INT NOT NULL REFERENCES "message"(id),
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

CREATE TABLE "job"(
   "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   "name" TEXT CHECK (LENGTH("name") <= 50),
   "description" TEXT,
   "category_id" INT NOT NULL REFERENCES "category"(id),
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

CREATE TABLE "event"(
   "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   "start_date" timestamptz,
   "end_date" timestamptz,
   "all_day" LOGICAL,
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

CREATE TABLE "request"(
   "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   "urgent" BOOLEAN NOT NULL,
   "message" TEXT NOT NULL,
   "localization" TEXT,
   "user_id" INT NOT NULL REFERENCES "user"(id),
   "job_id" INT NOT NULL REFERENCES "job"(id),
   "created_at" timestamptz NOT NULL DEFAULT now(),
   "updated_at" timestamptz
);

CREATE TABLE "request_has_media"(
    "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   "media_id" INT NOT NULL REFERENCES "media"(id),
   "request_id" INT NOT NULL REFERENCES "request"(id) ,
   "created_at" timestamptz NOT NULL DEFAULT now(),
   "updated_at" timestamptz
);


COMMIT;
