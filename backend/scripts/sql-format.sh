#!/bin/bash

set -e

REPO_NAME="$(basename "$(git rev-parse --show-toplevel)")"
if [[ $(basename "$PWD") != "$REPO_NAME" ]]; then
  echo "Please run this script from the root repo's directory: '$REPO_NAME'"
  echo "Current directory: $PWD"
  exit 1
fi

cd backend

QUERIES_DIR="./app/db/repositories/queries"
pg_format \
  --spaces 2 \
  --wrap-limit 88 \
  --function-case 2 \
  --keyword-case 1 \
  --placeholder "sqlc\\.arg\\(:?[^)]*\\)" \
  --inplace \
  $(find "$QUERIES_DIR" -maxdepth 1 -name '*.sql' | tr '\n' ' ')
python3 scripts/alignment/align.py "$QUERIES_DIR"
