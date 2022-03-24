# FastAPI-React-Postgres-Docker-Traefik-template

[![Build Status](https://dev.azure.com/danicc097/devops-tests/_apis/build/status/danicc097.FastAPI-React-Postgres-Docker-Traefik-template?branchName=dev)](https://dev.azure.com/danicc097/devops-tests/_build/latest?definitionId=5&branchName=dev) ![Size](https://github-size-badge.herokuapp.com/danicc097/FastAPI-React-Postgres-Docker-Traefik-template.svg)

## Table of contents  <!-- omit in toc -->

- [FastAPI-React-Postgres-Docker-Traefik-template](#fastapi-react-postgres-docker-traefik-template)
  - [Dev setup](#dev-setup)
    - [Root dir setup](#root-dir-setup)
    - [Backend dev setup](#backend-dev-setup)
    - [Frontend dev setup](#frontend-dev-setup)
    - [E2E dev setup](#e2e-dev-setup)
    - [Traefik setup](#traefik-setup)
  - [VSCode optional setup](#vscode-optional-setup)
    - [Fix postgres VSCode extension on Ubuntu 20.04](#fix-postgres-vscode-extension-on-ubuntu-2004)
  - [Azure pipelines](#azure-pipelines)
    - [Some quirks](#some-quirks)
  - [Docker](#docker)
    - [Building image from compose file](#building-image-from-compose-file)
  - [Troubleshooting](#troubleshooting)
    - [Pyndatic validation](#pyndatic-validation)
    - [Traefik](#traefik)
    - [Environment files](#environment-files)
    - [Backend tests suddenly fail](#backend-tests-suddenly-fail)
    - [E2E testing](#e2e-testing)

## Dev setup

### Root dir setup

Create ``.env`` from template.

### Backend dev setup

```bash
cd backend && virtualenv .venv
pipenv install --dev
mkdir logs
# ensure container user id is the same
# now _only_ the container user will be able to write to logs
sudo chown --recursive 1500:1500 logs/
```

Create ``.env`` from template.

### Frontend dev setup

Note: frontend uses Yarn Zero-Installs.

```bash
cd frontend && yarn
sudo npm -g install openapi-typescript # precommit hook
```

Create ``.env.development`` and ``.env.production`` from template. Ensure ports are matched in root folder's ``.env`` for compose file's correct env injection.

### E2E dev setup

```bash
cd e2e && npm install
```

### Traefik setup

Create certificates with ``mkcert``. For ``linux`` desktop:

```bash
mkdir traefik/certificates
cd traefik/certificates
sudo apt install libnss3-tools
wget https://github.com/FiloSottile/mkcert/releases/download/v1.4.3/mkcert-v1.4.3-linux-amd64 -O mkcert
chmod +x mkcert
sudo mv mkcert /usr/bin/
source ~/.bashrc
mkcert --cert-file localhost.pem --key-file localhost-key.pem  "dev.localhost" "*.dev.localhost" "prod.localhost" "*.prod.localhost" "testing.localhost" "*.testing.localhost" "wiki.localhost"
mkcert --install
```

## VSCode optional setup

### Fix postgres VSCode extension on Ubuntu 20.04

```bash
wget http://mirrors.kernel.org/ubuntu/pool/main/libf/libffi/libffi6_3.2.1-8_amd64.deb
sudo apt install ./libffi6_3.2.1-8_amd64.deb
rm ./libffi6_3.2.1-8_amd64.deb

```

## Azure pipelines

### Some quirks

- Variables named "\*secret\*" in ``.env*`` files are ignored, and ``SECRET_KEY=something`` in ``variables:`` key won't be parsed either for whatever reason and will yield ``SECRET_KEY=``. They have to be set in Azure Devops and mapped in pipeline tasks with the ``env:`` key.

## Docker

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

## Troubleshooting

### Pyndatic validation

Fastapi won't give a meaningful error when the response model typing in a route does not match the return value.
```py
    if errors:
    >               raise ValidationError(errors, field.type_)
    E               pydantic.error_wrappers.ValidationError: <unprintable ValidationError object>

/usr/local/lib/python3.9/site-packages/fastapi/routing.py:138: ValidationError
```

We should always look into the ``response_model`` of the route first of all to ensure it's correct

### Traefik

- Ensure different routers ``traefik.http.routers.<my-router>`` are used for different environments. Else we get a 404 when the service container is actually running

### Environment files

- ``.env`` in the root folder is read automatically by compose files and are available as ``${ENV_VAR}``. Note for CI there's no root ``.env.ci`` to be checked out by azure. They're defined inside ``variables`` instead in ``azure-pipelines.yml``.
  Env vars inside the root env are only useful for stuff read via ``os.environ``, but we must have a .env{.ci, .e2e} for backend (``app.core.config``) regardless of environment. Setting os.environ is not enough.
  Apart from that, frontend ``.env.*`` files defined by CRA (see link below) are required.
  E.g. ``FRONTEND_PORT_E2E`` in ``.env`` must match ``PORT`` in ``frontend/.env.development`` so that Traefik exposes the correct port for E2E tests after we ``yarn start``, which uses ``PORT`` from the environment. Regarding priority of environment files when using CRA: [Check this](https://create-react-app.dev/docs/adding-custom-environment-variables#adding-development-environment-variables-in-env)

### Backend tests suddenly fail

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

### E2E testing

- The whole E2E test suite is run without ``TESTING=1`` to mimic production. We could also run ``pytest`` inside the container in any case.
