#!/bin/bash

set -e

current_dir=$(pwd)

"$current_dir"/scripts/migrate.sh down
"$current_dir"/scripts/migrate.sh up

# fix dirty on dev mode with ./scripts/migrate.sh drop
