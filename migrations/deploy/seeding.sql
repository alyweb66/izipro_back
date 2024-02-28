-- Deploy izi:seeding to pg

BEGIN;

INSERT INTO "user" (
    "first_name",
    "last_name",
    "email",
    "postal_code",
    "city",
    "password",
    "remember_token",
    "siret",
    "company_name",
    "role",
    "created_at",
    "updated_at"
) VALUES
    ('John', 'Doe', 'john.doe@example.com', '75001', 'Paris', 'hashed_password_1', 'token_1', 12345678901234, 'Company A', 'user', '2023-01-01 12:00:00', '2023-01-01 12:00:00'),
    ('Jane', 'Smith', 'jane.smith@example.com', '91300', 'Massy', 'hashed_password_2', 'token_2', 98765432109876, 'Company B', 'admin', '2023-01-02 14:30:00', '2023-01-02 14:30:00'),
    ('Alice', 'Johnson', 'alice.johnson@example.com', '69001', 'Lyon', 'hashed_password_3', 'token_3', 11112222333344, 'Company C', 'user', '2023-01-03 10:45:00', '2023-01-03 10:45:00'),
    ('Bob', 'Dylan', 'bob.dylan@example.com', '13005', 'Marseille', 'hashed_password_4', 'token_4', 45678901234567, 'Company D', 'user', '2023-02-14 16:34:00', '2023-02-14 16:34:00'),
    ('Éléonore', 'Rousseau', 'eleonore.rousseau@example.com', '33000', 'Bordeaux', 'hashed_password_5', 'token_5', 89012345678901, 'Company E', 'admin', '2023-02-14 16:34:00', '2023-02-14 16:34:00');


INSERT INTO "message" (
    "content",
    "user_id",
    "user_id_1",
    "created_at",
    "updated_at"
) VALUES
    ('Hello, how are you?', 1, 2, '2023-01-01 15:00:00', '2023-01-01 15:00:00'),
    ('I am doing well, thank you!', 2, 1, '2023-01-01 15:30:00', '2023-01-01 15:30:00'),
    ('Any plans for the weekend?', 3, 1, '2023-01-02 10:00:00', '2023-01-02 10:00:00'),
    ('Not yet, maybe some relaxation.', 1, 3, '2023-01-02 11:00:00', '2023-01-02 11:00:00'),
    ('Meeting at 2 PM today.', 2, 3, '2023-01-03 13:45:00', '2023-01-03 13:45:00');



INSERT INTO "category" (
    "name", 
    "updated_at"
) VALUES
    ('Category 1', '2024-02-14T12:00:00Z'),
    ('Category 2', '2024-02-13T15:30:00Z'),
    ('Category 3', '2024-02-15T10:45:00Z'),
    ('Category 4', '2024-02-16T08:20:00Z'),
    ('Category 5', '2024-02-17T14:10:00Z');



INSERT INTO "job" (
    "name", 
    "description", 
    "category_id", 
    "updated_at"
) VALUES
    ('Job 1', 'Description du job 1', 1, '2024-02-14T12:00:00Z'),
    ('Job 2', 'Description du job 2', 2, '2024-02-13T15:30:00Z'),
    ('Job 3', 'Description du job 3', 1, '2024-02-15T10:45:00Z'),
    ('Job 4', 'Description du job 4', 3, '2024-02-16T08:20:00Z'),
    ('Job 5', 'Description du job 5', 2, '2024-02-17T14:10:00Z');



INSERT INTO "request"(
    "urgent",
    "message",
    "localization",
    "user_id",
    "job_id",
    "updated_at"
) VALUES
    (true, 'Demande urgente 1', 'Paris', 1, 3, '2024-02-14T12:00:00Z'),
    (false, 'Demande non urgente 1', 'Lyon', 2, 5, '2024-02-13T15:30:00Z'),
    (true, 'Demande urgente 2', 'Marseille', 3, 2, '2024-02-15T10:45:00Z'),
    (false, 'Demande non urgente 2', 'Nice', 2, 1, '2024-02-16T08:20:00Z'),
    (true, 'Demande urgente 3', 'Bordeaux', 3, 4, '2024-02-17T14:10:00Z');



INSERT INTO "media" (
    "url", 
    "user_id", 
    "user_id_1", 
    "updated_at"
) VALUES
    ('http://exemple.com/image1.jpg', 1, 2, '2024-02-14T12:00:00Z'),
    ('http://exemple.com/image2.jpg', 2, 3, '2024-02-13T15:30:00Z'),
    ('http://exemple.com/image3.jpg', 3, 4, '2024-02-15T10:45:00Z'),
    ('http://exemple.com/image4.jpg', 4, 5, '2024-02-16T08:20:00Z'),
    ('http://exemple.com/image5.jpg', 5, 1, '2024-02-17T14:10:00Z');



INSERT INTO "message_has_media" (
    "media_id", 
    "message_id", 
    "updated_at"
) VALUES
    (1, 1, '2024-02-14T12:00:00Z'),
    (2, 2, '2024-02-13T15:30:00Z'),
    (3, 3, '2024-02-15T10:45:00Z'),
    (4, 4, '2024-02-16T08:20:00Z'),
    (5, 5, '2024-02-17T14:10:00Z');



COMMIT;
