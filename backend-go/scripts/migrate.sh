#!/bin/bash

set -e

# when dockerizing go backend, localhost -> backend container service name

current_dir=$(pwd)

"$current_dir"/scripts/migrate -path internal/postgres/migrations/ -database postgres://postgres:password@localhost:5432/dbname?sslmode=disable "$1"
