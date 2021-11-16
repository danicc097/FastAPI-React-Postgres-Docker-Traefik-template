#!/bin/bash

# Exit in case of error
set -e

REPO_NAME="$(basename "$(git rev-parse --show-toplevel)")"
if [[ $(basename "$PWD") != "$REPO_NAME" ]]; then
  echo "Please run this script from the root repo's directory: '$REPO_NAME'"
  echo "Current directory: $PWD"
  exit 1
fi

SCRIPTS_DIR="$(dirname "$(readlink -f "$0")")"
SCHEMA_OUT="$(dirname "$SCRIPTS_DIR")/src/types/schema.ts"

# edit /etc/hosts and traefik accordingly
wget --no-check-certificate -O "$SCRIPTS_DIR"/openapi.json https://myapp-backend.dev.localhost/openapi.json

openapi-typescript "$SCRIPTS_DIR"/openapi.json --output "$SCHEMA_OUT"
# prepend linter disable
echo "/* eslint-disable */" | cat - "$SCHEMA_OUT" >/tmp/out && mv /tmp/out "$SCHEMA_OUT"
echo "Wrote schema changes to $SCHEMA_OUT"
