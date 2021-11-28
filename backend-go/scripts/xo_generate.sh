set -e

xo schema pgsql://postgres:password@localhost:5432/dbname?sslmode=disable
