#!/bin/bash

set -e

ENV=$1

REPO_NAME="$(basename "$(git rev-parse --show-toplevel)")"
if [[ $(basename "$PWD") != "$REPO_NAME" ]]; then
  echo "Please run this script from the root repo's directory: '$REPO_NAME'"
  echo "Current directory: $PWD"
  exit 1
fi

function generate_schema {
  if [[ $(openapi-typescript "$SCRIPTS_DIR"/openapi.json --output "$SCHEMA_OUT" 2>&1) = *"error"* ]]; then
    echo "Error generating schema from $SCRIPTS_DIR/openapi.json - Rerun the script, this is a common issue"
    exit 1
  fi
}

source "$PWD/bin/.helpers.sh"

SCRIPTS_DIR="$(dirname "$(readlink -f "$0")")"
SCHEMA_OUT="$(dirname "$SCRIPTS_DIR")/src/types/schema.ts"
SCHEMA_OUT_E2E="$(dirname "$SCRIPTS_DIR")/../e2e/__tests__/types/schema.ts"
BACKEND_DIR="$SCRIPTS_DIR"/../../backend
E2E_DIR="$SCRIPTS_DIR"/../../e2e
echo "Backend dir: $BACKEND_DIR"

until [ "$(docker exec backend_myapp_dev /bin/bash -c 'echo ready')" = "ready" ]; do
  printf 'Waiting for dev container for start for E2E...\n'
  sleep 5
done

FRONTEND_URL_E2E="https://myapp.e2e.localhost"
FRONTEND_URL_DEV="https://myapp.dev.localhost"
OPENAPI_URL="$FRONTEND_URL_DEV/api/openapi.json"
sleep 1
until [ "$(curl -s -k -o /dev/null -w "%{http_code}" "$FRONTEND_URL_E2E")" == "200" ] &&
  [ "$(curl -s -k -o /dev/null -w "%{http_code}" $OPENAPI_URL)" == "200" ]; do
  printf 'Waiting for dev backend and E2E frontend to be ready...\n'
  sleep 2
done

wget --timeout=5 --retry-connrefused --tries=5 --no-check-certificate -O "$SCRIPTS_DIR"/openapi.json $OPENAPI_URL

retry 6 generate_schema

echo "/* eslint-disable */" | cat - "$SCHEMA_OUT" >/tmp/out && mv /tmp/out "$SCHEMA_OUT"
echo "Wrote schema changes to $SCHEMA_OUT"
cp "$SCHEMA_OUT" "$SCHEMA_OUT_E2E"

echo "Generating initial data types..."
cd "$BACKEND_DIR"
cd initial_data
pydantic2ts --module models.py --output initialData.ts
mv initialData.ts "$(dirname "$SCHEMA_OUT")"
cp "$(dirname "$SCHEMA_OUT")"/initialData.ts "$(dirname "$SCHEMA_OUT_E2E")"
echo "Wrote initial data types to $(dirname "$SCHEMA_OUT")/initialData.ts"

if [ "$ENV" = "e2e" ]; then
  ../../bin/initial-data "$ENV"
  cp "$BACKEND_DIR"/initial_data/e2e.json "$E2E_DIR"/__tests__/initialData/e2e.json
fi
