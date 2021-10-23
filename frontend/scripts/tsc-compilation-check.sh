#!/bin/bash

# Exit in case of error
set -e

SCRIPTS_DIR="$(dirname "$(readlink -f "$0")")"
! "$SCRIPTS_DIR"/../node_modules/.bin/tsc -p ./frontend | grep -- ' error'
