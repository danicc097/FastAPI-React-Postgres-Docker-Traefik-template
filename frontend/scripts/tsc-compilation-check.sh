#!/bin/bash

# Exit in case of error
set -e

SCRIPTS_DIR="$(dirname "$(readlink -f "$0")")"
printf "SCRIPTS_DIR: %s\n" "$SCRIPTS_DIR"
! "$SCRIPTS_DIR"/../.yarn/sdks/typescript/bin/tsc -p ./frontend | grep -- ' error'
