/* plpgsql-language-server:use-keyword-query-parameter */
-- name: CreateGlobalNotification :one
insert into global_notifications (sender, receiver_role, title, body, LABEL, link)
  values (@sender, @receiver_role, @title, @body, @label, @link)
returning
  *;

-- name: DeleteGlobalNotification :exec
delete from global_notifications
where global_notification_id = @global_notification_id
returning
  *;

-- name: CheckHasNewGlobalNotifications :one
select
  exists (
    select
      1
    from
      global_notifications
    where
      updated_at > (
        select
          last_global_notification_at
        from
          users
        where
          user_id = @user_id)
        and receiver_role = any (@roles::role[])) as has_new_global_notifications;

-- name: GetGlobalNotificationsByStartingDate :many
select
  notifications.global_notification_id,
  notifications.sender,
  notifications.receiver_role,
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
      global_notifications
    where
      global_notifications.updated_at < @starting_date
      and receiver_role = any (@roles::role[])
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
    global_notifications
  where
    global_notifications.created_at < @starting_date
    and receiver_role = any (@roles::role[])
  order by
    created_at desc
  limit sqlc.arg('page_chunk_size?')::int)) as notifications
order by
  event_timestamp desc
limit sqlc.arg('page_chunk_size?')::int;
