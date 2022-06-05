# Systemd
## full vacuum nightly
```bash
docker exec -it postgres_db_myapp_dev vacuumdb --analyze
```

## clustering
Right after clustering, ANALYZE at least

## Locks

```sql
select pid,
       usename,
       pg_blocking_pids(pid) as blocked_by,
       query as blocked_query
from pg_stat_activity
where cardinality(pg_blocking_pids(pid)) > 0;
```

## Performance

```sql
select
  schemaname,
  relname,
  seq_scan,
  seq_tup_read,
  idx_scan,
  seq_tup_read / seq_scan as avg
from
  pg_stat_user_tables
where
  seq_scan > 0
order by
  seq_tup_read desc;
```

## Toast

```sql
SELECT
    c1.relname,
    pg_size_pretty(pg_relation_size(c1.relname::regclass)) AS size,
    c2.relname AS toast_relname,
    pg_size_pretty(pg_relation_size(('pg_toast.' || c2.relname)::regclass)) AS toast_size
FROM
    pg_class c1
    JOIN pg_class c2 ON c1.reltoastrelid = c2.oid
WHERE
    c1.relname LIKE 'toast_test_%'
    AND c1.relkind = 'r';
```
