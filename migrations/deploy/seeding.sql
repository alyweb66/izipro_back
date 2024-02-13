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
    "denomination",
    "role",
    "created_at",
    "updated_at"
) VALUES
    ('John', 'Doe', 'john.doe@example.com', '75001', 'Paris', 'hashed_password_1', 'token_1', 12345678901234, 'Company A', 'user', '2023-01-01 12:00:00', '2023-01-01 12:00:00'),
    ('Jane', 'Smith', 'jane.smith@example.com', '91300', 'Massy', 'hashed_password_2', 'token_2', 98765432109876, 'Company B', 'admin', '2023-01-02 14:30:00', '2023-01-02 14:30:00'),
    ('Alice', 'Johnson', 'alice.johnson@example.com', '69001', 'Lyon', 'hashed_password_3', 'token_3', 11112222333344, 'Company C', 'user', '2023-01-03 10:45:00', '2023-01-03 10:45:00');


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


COMMIT;
