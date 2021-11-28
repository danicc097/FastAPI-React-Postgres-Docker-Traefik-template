-- name: CreateProfile :one
INSERT INTO profiles (full_name, phone_number, bio, image, user_id)
VALUES (
    @full_name,
    @phone_number,
    @bio,
    @image,
    @user_id
  ) RETURNING *;

-- name: GetProfileById :one
SELECT *
FROM profiles
WHERE user_id = @user_id;

-- name: GetProfileByUsername :one
SELECT p.id,
  u.email AS email,
  u.username AS username,
  full_name,
  phone_number,
  bio,
  image,
  user_id,
  p.created_at,
  p.updated_at
FROM profiles p
  INNER JOIN users u ON p.user_id = u.id
WHERE user_id = (
    SELECT id
    FROM users
    WHERE username = @username::text
  );

-- name: UpdateProfile :one
UPDATE profiles
SET full_name = CASE
    WHEN @full_name_do_update::boolean THEN @full_name
    ELSE full_name
  END,
  phone_number = CASE
    WHEN @phone_number_do_update::boolean THEN @phone_number
    ELSE phone_number
  END,
  bio = CASE
    WHEN @bio_do_update::boolean THEN @bio
    ELSE bio
  END,
  image = CASE
    WHEN @image_do_update::boolean THEN @image
    ELSE image
  END
WHERE user_id = @user_id RETURNING *;