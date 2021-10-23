#!/bin/bash

set -e

dumps_folder='myapp_postgres_dumps'
last_bkp_file=$(find ~/$dumps_folder/ -name '*.gz' | grep dump_ | sort -r | head -n 1)
# ensure last_bkp_file is not null
if [ -z "$last_bkp_file" ]; then
  echo "No dump_* file found in $dumps_folder"
  exit 1
fi
# updated schema downgrade function won't work on old schema
# docker exec -it backend_myapp_dev /bin/bash -c "alembic downgrade base"
printf "\n Restoring file:"
echo "$last_bkp_file"
# must get rid of everything, including alembic_version which won't be restored and needs to be updated
docker exec -it backend_myapp_dev /bin/bash -c "alembic downgrade base"
docker exec -it backend_myapp_dev /bin/bash -c "alembic upgrade head"
gunzip -c "$last_bkp_file" | docker exec -i postgres_db_myapp_dev psql -U postgres
