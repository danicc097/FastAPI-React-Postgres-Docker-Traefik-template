#!/bin/bash

set -e

# when dockerizing go backend, localhost -> backend container service name

migrate -path internal/postgres/migrations/ -database postgres://postgres:password@localhost:5432/dbname?sslmode=disable "$1"
