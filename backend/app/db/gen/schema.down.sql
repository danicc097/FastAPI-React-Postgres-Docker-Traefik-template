BEGIN;

-- Running downgrade 00000001 -> 

DROP TYPE IF EXISTS role CASCADE;

DROP TYPE IF EXISTS event_type CASCADE;

DROP TABLE IF EXISTS global_notifications CASCADE;

DROP TABLE IF EXISTS personal_notifications CASCADE;

DROP TABLE IF EXISTS password_reset_requests CASCADE;

DROP TABLE IF EXISTS profiles CASCADE;

DROP TABLE IF EXISTS users CASCADE;

DROP FUNCTION IF EXISTS update_updated_at_column;

DELETE FROM alembic_version WHERE alembic_version.version_num = '00000001';

DROP TABLE alembic_version;

COMMIT;

