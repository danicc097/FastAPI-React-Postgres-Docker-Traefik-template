#!/bin/bash

set -e

current_dir=$(pwd)

"$current_dir"/scripts/migrate.sh down
"$current_dir"/scripts/migrate.sh up

bkp_file=$(find "$current_dir"/ -name '*.gz' | grep "dump_" | sort -r | head -n 1)
gunzip -c "$bkp_file" | docker exec -i postgres_db_go_myapp_dev psql -U postgres --dbname=dbname
