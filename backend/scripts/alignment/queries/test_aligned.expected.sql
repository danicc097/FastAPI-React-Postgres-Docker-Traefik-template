/* plpgsql-language-server:use-keyword-query-parameter */
-- name: GetUser :one
select
  username,
  email,
  role,
  is_verified,
  is_active,
  is_superuser,
  last_notification_at,
  users.created_at,
  users.updated_at,
  full_name,
  phone_number,
  bio,
  image,
  case when @get_db_data::boolean then
    (user_id)
  end as user_id,
  case when @get_db_data::boolean then
    (salt)
  end as salt,
  case when @get_db_data::boolean then
    (password)
  end as password
from
  users
  left join profiles using (user_id)
where
  email            = sqlc.arg('email?')
  or username      = sqlc.arg('username?')
  or users.user_id = sqlc.arg('user_id?')
limit 1;

-- name: RegisterNewUser :one
insert into users (username, email, password, salt, is_superuser, is_verified)
  values (@username, @email, @password, @salt, @is_superuser, @is_verified)
returning
  username, email, role, is_verified, is_active, is_superuser, last_notification_at,
    created_at, updated_at;

-- name: UpdateUserById :one
update
  users
set
  password = COALESCE(sqlc.arg('password?'), password),
  salt     = COALESCE(sqlc.arg('salt?'), salt),
  username = COALESCE(sqlc.arg('username?'), username),
  email    = COALESCE(sqlc.arg('email?'), email)
where
  user_id = @user_id
returning
  user_id,
  username,
  email,
  role,
  is_verified,
  salt,
  password,
  is_active,
  is_superuser,
  last_notification_at,
  created_at,
  updated_at;

-- name: ListAllUsers :many
select
  user_id,
  username,
  email,
  role,
  is_verified,
  salt,
  password,
  is_active,
  is_superuser,
  last_notification_at,
  created_at,
  updated_at
from
  users;

-- name: ListAllNonVerifiedUsers :many
select
  user_id,
  username,
  email,
  role,
  is_verified,
  salt,
  password,
  is_active,
  is_superuser,
  last_notification_at,
  created_at,
  updated_at
from
  users
where
  is_verified = 'false';

-- name: VerifyUserByEmail :exec
update
  users
set
  is_verified = 'true'
where
  email = @email;

-- name: ResetUserPassword :exec
update
  users
set
  password = @password,
  salt     = @salt
where
  email = @email;

-- name: UpdateLastNotificationAt :exec
update
  users
set
  last_notification_at = @last_notification_at
where
  user_id = @user_id;

-- name: UpdateUserRole :exec
update
  users
set
  role = @role
where
  user_id = @user_id;

-- name: GetRoles :many
select
  ENUM_RANGE(null::users.role)::text[];
