#!/bin/bash
set -e

dumps_folder='myapp_postgres_dumps_prod'
last_bkp_file=$(find ~/$dumps_folder/ -type f -name '*.gz' | grep dump_ | tail -n 1)

docker exec -it backend_myapp_prod /bin/bash -c "alembic downgrade base"
gunzip -c "$last_bkp_file" | docker exec -i postgres_db_myapp_prod psql -U postgres
docker exec -it backend_myapp_prod /bin/bash -c "alembic upgrade head"
