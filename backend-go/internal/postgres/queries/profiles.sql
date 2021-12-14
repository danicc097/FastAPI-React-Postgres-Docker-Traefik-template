-- name: CreateProfile :one
INSERT INTO "profiles" ("full_name", "phone_number", "bio", "image", "user_id")
VALUES (@full_name, @phone_number, @bio, @image, @user_id)
RETURNING
  *;

-- name: GetProfileById :one
SELECT
    *
FROM
    "profiles"
WHERE
    "user_id" = @user_id;

-- name: GetProfileByUsername :one
SELECT
    profiles.id,
    users.email,
    users.username,
    profiles.full_name,
    profiles.phone_number,
    profiles.bio,
    profiles.image,
    profiles.user_id,
    profiles.created_at,
    profiles.updated_at
FROM
    profiles
INNER JOIN users ON profiles.user_id = users.id
WHERE
    users.username = @username::text;

-- name: UpdateProfile :one
UPDATE
  profiles
SET
    "full_name" = CASE WHEN @full_name_do_update::boolean THEN
        @full_name
        ELSE
            "full_name"
    END,
    "phone_number" = CASE WHEN @phone_number_do_update::boolean THEN
        @phone_number
        ELSE
            "phone_number"
    END,
    "bio" = CASE WHEN @bio_do_update::boolean THEN
        @bio
        ELSE
            "bio"
    END,
    "image" = CASE WHEN @image_do_update::boolean THEN
        @image
        ELSE
            "image"
    END
WHERE
    "user_id" = @user_id 
RETURNING
  *;
