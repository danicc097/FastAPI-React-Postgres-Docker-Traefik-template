#!/bin/bash

# Exit in case of error
set -e

SCRIPTS_DIR="$(dirname "$(readlink -f "$0")")"

REPO_NAME="$(basename "$(git rev-parse --show-toplevel)")"
if [[ $(basename "$PWD") != "$REPO_NAME" ]]; then
  echo "Please run this script from the root repo's directory: '$REPO_NAME'"
  echo "Current directory: $PWD"
  exit 1
fi

! "$SCRIPTS_DIR"/../.yarn/sdks/typescript/bin/tsc -p ./frontend | grep -- ' error'
