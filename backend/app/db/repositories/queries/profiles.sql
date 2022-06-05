/* plpgsql-language-server:use-keyword-query-parameter */
-- name: CreateProfile :one
insert into profiles (full_name, phone_number, bio, image, user_id)
  values (@full_name, @phone_number, @bio, @image, @user_id)
returning
  *;

-- name: GetProfileById :one
select
  *
from
  profiles
where
  user_id = @user_id;

-- name: GetProfileByUsername :one
select
  profiles.profile_id,
  users.email,
  users.username,
  profiles.full_name,
  profiles.phone_number,
  profiles.bio,
  profiles.image,
  profiles.user_id
from
  profiles
  inner join users using (user_id)
where
  users.username = @username::text;

-- UPDATE
-- profiles
-- SET
--     full_name = CASE WHEN @full_name_do_update::boolean THEN
--         @full_name
--         ELSE
--             full_name
--     END,
--     phone_number = CASE WHEN @phone_number_do_update::boolean THEN
--         @phone_number
--         ELSE
--             phone_number
--     END,
--     bio = CASE WHEN @bio_do_update::boolean THEN
--         @bio
--         ELSE
--             bio
--     END,
--     image = CASE WHEN @image_do_update::boolean THEN
--         @image
--         ELSE
--             image
--     END
-- WHERE
--     user_id = @user_id
-- RETURNING
--   *;
-- name: UpdateProfile :one
update
  profiles
set
  full_name    = COALESCE(@full_name, full_name),
  phone_number = COALESCE(@phone_number, phone_number),
  bio          = COALESCE(@bio, bio),
  image        = COALESCE(@image, image)
where
  user_id = @user_id
returning
  *;
