# Notes

- To avoid generating *_2, *_3 etc duplicate columns in struct with sqlc when there are multiple joins, 
  ensure to have the main SELECT get only what's actually needed. E.g.
```sql
  SELECT
    a_new_table.id,
    a_new_table.sender,
    a_new_table.receiver_role,
    a_new_table.label,
    a_new_table.link,
    a_new_table.body,
    a_new_table.created_at,
    a_new_table.updated_at,
    'is_create' AS event_type,
    a_new_table.created_at AS event_timestamp,
    ROW_NUMBER() OVER (ORDER BY event_timestamp DESC) AS row_number
FROM 
  --long JOIN's and SELECT *'s from some table(s)
  ...  AS a_new_table

```