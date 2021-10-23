#!/bin/bash

service_name="$1"

# Exit in case of error
set -e

docker exec -it "$service_name" alembic downgrade base # drop everything
docker exec -it "$service_name" alembic upgrade head
docker exec -it "$service_name" python3 -m initial_data.dev # only way to keep as part of the package
