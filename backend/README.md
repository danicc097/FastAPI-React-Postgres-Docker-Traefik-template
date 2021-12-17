# Backend
## Things to be aware of

Database transactions bug:
 - https://github.com/encode/databases/issues/403

## Important notes

``POSTGRES_SERVER`` must be equal to the name of the Postgres service in ``compose.yml`` files to resolve the correct host. Each container in Docker is a separate host, which means that we can't reach the Postgres host
from service ``server`` using localhost or ``$HOSTNAME`` (container id). We have to use the hostname of the Postgres container,
which by default is the name of the service defined in a ``compose.yml`` file

Note: ``psql`` requires the ``postgresql-client`` package, which is only included by default in the postgres image. We don't really need it in ``server`` for the time being.

More info about the postgres docker image at <https://hub.docker.com/_/postgres?tab=description>

## CI/CD

``.env.ci`` should be as close as possible to production.

### Python specifics

- We can make functions accept keyword arguments only with ``*``, which indicates all parameters after it must be passed as keywords arguments

```python
fn(self, *, keyword_arg: type, ...)
```

## Using pytest-xdist

If tests start taking more than 2 minutes to run, consider using ``pytest-xdist``. Worker names are available as env var ``PYTEST_XDIST_WORKER``, making it easy to create test databases.

```python
DB_NAME = f"{POSTGRES_DB}_test_{pytest_worker}"
```

Tests must be run with the appropiate ``dist`` flag depending on tests themselves and how they modify the ``app`` state or database data, if they do.
See <https://github.com/pytest-dev/pytest-xdist> and benchmark those to figure out which one yields the fastest results depending on ``-n NUM_WORKERS``. A good place to start is ``-n MACHINE_CORE_COUNT``.


(VM Cores: 4) Run ``benchmark-pytest-xdist 15 4 loadscope``. Even with tests that take just a few seconds, there's improvement.
```log
[2021-11-22T18:42:40+0100]: Average time spent for 15 runs with 1 workers: 21.20s
[2021-11-22T18:47:22+0100]: Average time spent for 15 runs with 2 workers: 16.86s
[2021-11-22T18:51:27+0100]: Average time spent for 15 runs with 3 workers: 14.40s
[2021-11-22T18:55:40+0100]: Average time spent for 15 runs with 4 workers: 14.93s
```

## Software recommendations

- DBeaver for Postgres. Dead-simple query testing and debugging and even allows using ``:param`` syntax in its SQL console. Can be changed to any other character in Window>Preferences>Editors>SQLEditor>SQL Processing > Named parameter prefix
