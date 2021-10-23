#!/bin/bash

service_name="$1"

# Exit in case of error
set -e

# handle first build as well as subsequent builds
docker exec -it "$service_name" alembic upgrade head || docker exec -it "$service_name" alembic downgrade base || exit 1
docker exec -it "$service_name" alembic downgrade base
docker exec -it "$service_name" alembic upgrade head
docker exec -it "$service_name" python3 -m initial_data.e2e # only way to keep as part of the package
