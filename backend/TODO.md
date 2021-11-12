## Notification handling

Applicable to site notifications, news, etc.

  1. Create table notifications. Index by ``created_at``
  2. Set ``last_notification_date`` to ``now()`` by default for every user
  3. User logs in, then we fetch every ``X`` min interval **IF** there are notification with ``EXISTS`` restricting them to ``last_notification_date`` (don't care about number, just put a label saying **NEW**). Or fetch once then use websockets if they're not blocked in your infrastructure.
  4. User decides to click notification bell ->
     1. Create variable ``current_time``.
     2. Fetch notifications starting from ``last_notification_date`` (a new account would not get old notifications unless clicking "See older notifications" or something)
     3. Store ``last_notification_date`` in user table for the user as ``current_time``. In case some notification appears in the meantime we will consider it not fetched and will show it again.
     4. Points above should be done inside a transaction
  5. Fetch 10 notifications, paginated
