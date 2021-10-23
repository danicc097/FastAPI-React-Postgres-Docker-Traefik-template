# CI

.env.ci should be as close as possible to production.

# Important notes

POSTGRES_SERVER must be equal to the name of the Postgres service in compose.yml files

Each container in Docker is a separate host, which means that we can't reach Postgres
from server using localhost or $HOSTNAME (container id), we have to use the hostname of the Postgres container,
which by default is the name of the service defined in the Docker Compose file

NOte: ``psql`` requires the ``postgresql-client`` package, which is only included by default in the postgres image

```bash
PGPASSWORD=$POSTGRES_PASSWORD psql -h db_ci -U $POSTGRES_USER --dbname=$POSTGRES_DB
```

More info about the postgres docker image at <https://hub.docker.com/_/postgres?tab=description>

# Using pytest-xdist

If tests start taking more than 2 minutes to run, consider using ``pytest-xdist``. Worker names are available as env var ``PYTEST_XDIST_WORKER``, making it easy to create test databases.

```python
DB_NAME = f"{POSTGRES_DB}_test_{pytest_worker}"
```

Tests must be run with the appropiate ``dist`` flag depending on overhead. See https://github.com/pytest-dev/pytest-xdist
benchmark those to figure out which one yields the fastest results depending on ``-n NUM_WORKERS``. A good place to start is ``-n MACHINE_CORE_COUNT``.

VM Cores: 4
| n workers | Average test run (s) |
| --------- | -------------------- |
| 1         | 116                  |
| 2         | 99                   |
| 4         | 66                   |
| 6         | 52                   |
| 8         | 54                   |
| 10        | 52                   |
