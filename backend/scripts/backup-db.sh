#!/bin/bash
set -e

dumps_folder='myapp_postgres_dumps'
mkdir -p ~/$dumps_folder

# cluster-wide backups with pg_dumpall include the alembic_version table
# that will break restoring after a schema upgrade to head with a new revision number
# if we *dont* use the same migration script all the time (which is not recommended)
docker exec -t postgres_db_myapp_dev pg_dump --data-only -T alembic_version -U postgres | gzip >~/$dumps_folder/dump_"$(date +%d-%m-%Y"_"%H_%M_%S)".gz
