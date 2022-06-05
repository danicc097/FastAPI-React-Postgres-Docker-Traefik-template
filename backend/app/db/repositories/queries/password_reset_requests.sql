/* plpgsql-language-server:use-keyword-query-parameter */
-- name: CreatePasswordResetRequest :one
insert into password_reset_requests (email, message)
  values (@email::text, @message::text)
returning
  *;

-- name: DeletePasswordResetRequest :one
delete from password_reset_requests
where password_reset_request_id = @password_reset_request_id
returning
  *;

-- name: GetPasswordResetRequests :many
select
  *
from
  password_reset_requests;
