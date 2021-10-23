SELECT
  pid AS process_id,
  usename AS username,
  datname AS database_name,
  client_addr AS client_address,
  client_hostname,
  client_port,
  application_name,
  backend_start,
  state,
  state_change
FROM
  pg_stat_activity;
