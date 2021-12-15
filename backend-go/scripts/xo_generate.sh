#!/bin/bash
set -e

# shellcheck disable=SC2035
xo schema pgsql://postgres:password@localhost:5432/dbname?sslmode=disable -e *.created_at -e *.updated_at -e *.deleted_at
