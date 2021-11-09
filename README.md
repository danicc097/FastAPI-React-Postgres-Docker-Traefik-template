
[![Build Status](https://dev.azure.com/danicc097/devops-tests/_apis/build/status/danicc097.FastAPI-React-Postgres-Docker-Traefik-template?branchName=dev)](https://dev.azure.com/danicc097/devops-tests/_build/latest?definitionId=5&branchName=dev)

# Backend dev setup

```bash
cd backend && virtualenv .venv
pipenv install --dev
# ensure container user id is the same
# now _only_ the container user will be able to write to logs
sudo chown 1500:1500 logs/
```

# Frontend dev setup

```bash
cd frontend && yarn
```

# VSCode optional setup

## Fix postgres VSCode exntension on Ubuntu 20.04

```bash
wget http://mirrors.kernel.org/ubuntu/pool/main/libf/libffi/libffi6_3.2.1-8_amd64.deb
sudo apt install ./libffi6_3.2.1-8_amd64.deb
rm ./libffi6_3.2.1-8_amd64.deb

```

# Azure pipelines

## Some quirks

- Variables named "\*secret\*" in ``.env*`` files are ignored, and ``SECRET_KEY=something`` in ``variables:`` key won't be parsed either for whatever reason and will yield ``SECRET_KEY=``. They have to be set in Azure Devops and mapped in pipeline tasks with the ``env:`` key.

# Docker

## Persistent image env vars

### Building image from compose file

If ``ENV_VAR`` is set as an azure pipeline variable at top level, it's available as ``${ENV_VAR}`` in compose.

``docker-compose.ci.yml``:

```yaml
build:
  context: ./frontend
  dockerfile: Dockerfile.ci
  args:
  - "ENV_VAR=ENV_VAR"
  - "ENV_VAR=${AZURE_VARIABLE_ENV_VAR}"
```

``Dockerfile.ci``:

```dockerfile
# env in compose is not automatically added to build context
# we have to explicitly tell it is an ARG to the build context
ARG ENV_VAR
ENV PERSISTENT_ENV_VAR $ENV_VAR
```

# Troubleshooting

## Traefik

- Ensure different routers ``traefik.http.routers.<my-router>`` are used for different environments. Else we get a 404 when the service container is actually running

## Environment files

- ``.env`` in the root folder is read automatically by compose files and are available as ``${ENV_VAR}``. Note for CI there's no root ``.env.ci`` to be checked out by azure. They're defined inside ``variables`` instead.
  Env vars inside the root env are only useful for stuff read via ``os.environ``, but we must have a .env{.ci, .e2e} for backend (``app.core.config``) regardless of environment. Setting os.environ is not enough.
  Apart from that, frontend ``.env.*`` files defined by CRA (see link below) are required.
  E.g. ``FRONTEND_PORT_E2E`` in ``.env`` and ``frontend/.env.development`` must match so that Traefik exposes the correct port.

  Regarding priority when using CRA: [Check this](https://create-react-app.dev/docs/adding-custom-environment-variables#adding-development-environment-variables-in-env)

## Backend tests suddenly fail

- Ensure the correct models are passed to json payloads for **create** operations. These are usually named ``<ModelName>Create`` or similar since we do not set the ``id``, ``created_at`` and similar fields ourselves. Those fields are contained in ``<ModelName>Public``, ``<ModelName>`` or however we define them and are one-sided, exclusively returned by the API.

- Ensure state wasn't changed in the session by any new tests. e.g. a new test for admins that verifies users makes unverified test users for posterior cases be verified and cause the test to fail. The test state is driven by the fixture scope of ``apply_migrations``. If setting that fixture's scope to ``function`` doesn't fix anything, then a mistake was likely made in the code itself.

- Ensure you run whole classes or modules first and see if they pass, to make sure it's not a test state problem. Running ``-k`` with test functions might cause some tests to fail if they're badly written and require state created by previous tests in the scope. **All tests should pass by themselves**.

- As of now, only a single ``httpx`` client can be used to make requests in tests at a time, else since there is more than one connection to the database, it prevents running migrations at the end of the test. Presumably due to using more than one ``AsyncClient`` between each migration (defined by the migration fixture scope)
```python
  E       sqlalchemy.exc.OperationalError: (psycopg2.errors.ObjectInUse) database "postgres_test" is being accessed by other users
  E       DETAIL:  There are 2 other sessions using the database.
```
Fixed by executing the following in a different engine (important) before dropping the testing database in the main migrations function:
```sql
select pg_terminate_backend(pid) from pg_stat_activity where datname=<DATABASE_NAME>;
```

## E2E testing

- The whole E2E test suite is run without ``TESTING=1`` to mimic production. We could also run ``pytest`` inside the container in any case.

