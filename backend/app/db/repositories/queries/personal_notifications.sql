/* plpgsql-language-server:use-keyword-query-parameter */
-- name: CreatePersonalNotification :one
insert into personal_notifications (sender, receiver_email, title, body, LABEL, link)
  values (@sender, @receiver_email, @title, @body, @label, @link)
returning
  *;

-- name: DeletePersonalNotification :exec
delete from personal_notifications
where personal_notification_id = @personal_notification_id
returning
  *;

-- name: GetPersonalNotificationById :one
select
  *
from
  personal_notifications
where
  personal_notification_id = @personal_notification_id;

-- name: CheckHasNewPersonalNotifications :one
select
  exists (
    select
      1
    from
      personal_notifications
    where
      updated_at > (
        select
          last_personal_notification_at
        from
          users
        where
          email = @receiver_email)
        and receiver_email = @receiver_email) as has_new_notifications;

-- name: GetPersonalNotificationsByStartingDate :many
select
  notifications.personal_notification_id,
  notifications.sender,
  notifications.receiver_email,
  notifications.title,
  notifications.label,
  notifications.link,
  notifications.body,
  notifications.created_at,
  notifications.updated_at,
  notifications.event_timestamp,
  notifications.event_type::event_type as event_type,
  ROW_NUMBER() over (order by event_timestamp desc) as "row_number"
from ((
    -- Rows where the notification has been updated at some point.
    select
      *,
      updated_at as event_timestamp,
      -- define a new column event_type and set its value
      'is_update' as event_type
    from
      personal_notifications
    where
      personal_notifications.updated_at < @starting_date
      and receiver_email = @receiver_email::text
      and updated_at != created_at
    order by
      updated_at desc
    limit sqlc.arg('page_chunk_size?')::int)
union (
  -- All rows.
  select
    *,
    created_at as event_timestamp,
    -- define a new column event_type and set its value
    'is_create' as event_type
  from
    personal_notifications
  where
    personal_notifications.created_at < @starting_date
    and receiver_email = @receiver_email
  order by
    created_at desc
  limit sqlc.arg('page_chunk_size?')::int)) as notifications
order by
  event_timestamp desc
limit sqlc.arg('page_chunk_size?')::int;
