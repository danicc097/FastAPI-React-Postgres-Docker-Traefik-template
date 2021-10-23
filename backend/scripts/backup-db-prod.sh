#!/bin/bash
set -e

dumps_folder='myapp_postgres_dumps_prod'
mkdir -p ~/$dumps_folder
# access by given container_name in compose
# cluster-wide backups with pg_dumpall
docker exec -t postgres_db_myapp_prod pg_dumpall -c -U postgres | gzip >~/$dumps_folder/dump_"$(date +%d-%m-%Y"_"%H_%M_%S)".gz
