/* plpgsql-language-server:use-keyword-query-parameter */
-- name: GetUser :one
select
  username,
  email,
  role,
  is_verified,
  is_active,
  is_superuser,
  last_global_notification_at,
  last_personal_notification_at,
  created_at,
  updated_at,
  full_name,
  phone_number,
  bio,
  image,
  COALESCE(
    case when @get_db_data::boolean then
      (user_id)
    end, -1)::int as user_id,
  case when @get_db_data::boolean then
    (salt)
  end as salt,
  case when @get_db_data::boolean then
    (password)
  end as password
from
  users
  left join profiles using (user_id)
where (email = LOWER(sqlc.arg('email?'))::text
  or sqlc.arg('email?')::text is null)
and (username = sqlc.arg('username?')::text
  or sqlc.arg('username?')::text is null)
and (users.user_id = sqlc.arg('user_id?')::int
  or sqlc.arg('user_id?')::int is null)
limit 1;

-- name: RegisterNewUser :one
insert into users (username, email, password, salt, is_superuser, is_verified)
  values (@username, @email, @password, @salt, @is_superuser, @is_verified)
returning
  user_id, username, email, role, is_verified, is_active, is_superuser,
    last_global_notification_at, last_personal_notification_at, created_at, updated_at;

-- name: UpdateUserById :one
update
  users
set
  password = COALESCE(sqlc.arg('password?'), password),
  salt     = COALESCE(sqlc.arg('salt?'), salt),
  username = COALESCE(sqlc.arg('username?'), username),
  email    = COALESCE(LOWER(sqlc.arg('email?')), email)
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
  last_global_notification_at,
  last_personal_notification_at,
  created_at,
  updated_at;

-- name: ListAllUsers :many
select
  users.user_id,
  username,
  email,
  role,
  is_verified,
  salt,
  password,
  is_active,
  is_superuser,
  last_global_notification_at,
  last_personal_notification_at,
  created_at,
  updated_at
from
  users
  left join profiles using (user_id)
where
  is_verified = sqlc.arg('is_verified?')::boolean
  or sqlc.arg('is_verified?')::boolean is null;

-- name: VerifyUserByEmail :one
update
  users
set
  is_verified = 'true'
where
  email = LOWER(@email)
returning
  email;

-- name: ResetUserPassword :exec
update
  users
set
  password = @password,
  salt     = @salt
where
  email = LOWER(@email);

-- name: UpdateGlobalLastNotificationAt :exec
update
  users
set
  last_global_notification_at = @last_global_notification_at
where
  user_id = @user_id;

-- name: UpdatePersonalLastNotificationAt :exec
update
  users
set
  last_personal_notification_at = @last_personal_notification_at
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
