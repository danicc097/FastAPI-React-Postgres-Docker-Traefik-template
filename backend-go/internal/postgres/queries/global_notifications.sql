-- name: CreateNotification :one
INSERT INTO global_notifications (
    "sender", "receiver_role", "title", "body", "label", "link"
)
VALUES (@sender, @receiver_role, @title, @body, @label, @link)
RETURNING
  *;

-- name: DeleteNotification :exec
DELETE FROM global_notifications
WHERE "id" = @id 
RETURNING
  *;

-- name: CheckHasNewNotifications :one
SELECT EXISTS(
    SELECT 1
    FROM
        global_notifications
    WHERE
        "updated_at" > @last_notification_at
        AND "receiver_role" = ANY(@roles::text[])) AS "has_new_notifications";

-- name: GetNotificationsByLastRead :many
SELECT
    notifications.id,
    notifications.sender,
    notifications.receiver_role,
    notifications.label,
    notifications.link,
    notifications.title,
    notifications.body,
    notifications.created_at,
    notifications.updated_at,
    notifications.event_timestamp,
    CAST(notifications.event_type AS text) AS "event_type",
    ROW_NUMBER() OVER (ORDER BY "event_timestamp" DESC) AS "row_number"
FROM ((
    -- Rows where the notification has been updated at some point.
    SELECT
        *,
        "updated_at" AS "event_timestamp",
        -- define a new column event_type and set its value
        'is_update' AS "event_type"
    FROM
        global_notifications
    WHERE
        global_notifications.updated_at > @last_notification_at
        AND "receiver_role" = ANY(@roles::text[])
        AND "updated_at" != "created_at"
    ORDER BY
        "updated_at" DESC
    LIMIT @page_chunk_size)
    UNION (
    -- All rows.
        SELECT
            *,
            "created_at" AS "event_timestamp",
            -- define a new column event_type and set its value
            'is_create' AS "event_type"
        FROM
            global_notifications
        WHERE
            global_notifications.created_at > @last_notification_at
            AND "receiver_role" = ANY(@roles::text[])
        ORDER BY
            "created_at" DESC
  LIMIT @page_chunk_size)) AS notifications
ORDER BY
    "event_timestamp" DESC
LIMIT @page_chunk_size;

-- name: GetNotificationsByStartingDate :many
SELECT
    notifications.id,
    notifications.sender,
    notifications.receiver_role,
    notifications.title,
    notifications.label,
    notifications.link,
    notifications.body,
    notifications.created_at,
    notifications.updated_at,
    notifications.event_timestamp,
    CAST(notifications.event_type AS text) AS "event_type",
    ROW_NUMBER() OVER (ORDER BY "event_timestamp" DESC) AS "row_number"
FROM ((
    -- Rows where the notification has been updated at some point.
    SELECT
        *,
        "updated_at" AS "event_timestamp",
        -- define a new column event_type and set its value
        'is_update' AS "event_type"
    FROM
        global_notifications
    WHERE
        global_notifications.updated_at < @starting_date
        AND "receiver_role" = ANY(@roles::text[])
        AND "updated_at" != "created_at"
    ORDER BY
        "updated_at" DESC
    LIMIT @page_chunk_size)
    UNION (
    -- All rows.
        SELECT
            *,
            "created_at" AS "event_timestamp",
            -- define a new column event_type and set its value
            'is_create' AS "event_type"
        FROM
            global_notifications
        WHERE
            global_notifications.created_at < @starting_date
            AND "receiver_role" = ANY(@roles::text[])
        ORDER BY
            "created_at" DESC
  LIMIT @page_chunk_size)) AS notifications
ORDER BY
    "event_timestamp" DESC
LIMIT @page_chunk_size;
