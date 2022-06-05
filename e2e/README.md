# E2E testing

## Why a separate project?

Avoid ejecting CRA from ``frontend``. GitHub copilot suggestion: _It's a pain_.

Can be used as container or directly in local env.

Example compose file:

```yaml
myapp_puppeteer:
    container_name: puppeteer_myapp_e2e
    network_mode: "host" # else it won't resolve services proxied by traefik
    build:
      context: ./e2e
      dockerfile: Dockerfile
      args:
        - HEADLESS=true
        - FRONTEND_URL=https://myapp.e2e.localhost
    command: tail -F anything # will stay up until we explicitly run tests
    depends_on:
      - myapp_frontend_e2e
      - myapp_server_e2e
```

## Running specific tests

Example:

```shell
npm run test-local:headful -- loginPage
>>> Ran all test suites matching /loginPage/i.

```

## Jest configuration

- ``--runInBand`` Run all tests serially in the current process, rather than creating a worker pool. Aim for running tests in parallel if possible.
- ``detectOpenHandles`` implies ``--runInBand``.

## Troubleshooting

If it's a timeout error, just increase render wait time first. If it fixes it consistently don't lose more time with it.

- Debug workers not being closed after tests running files individually with ``--detectOpenHandles {<stringMatcher1>, <stringMatcher2>, ...}`` to find the culprit.

- Getting literal ``"Not Found"`` error in forms instead of a detailed error message? Check the backend API endpoint is correct.

## ToDo

- Sharing ``node_modules`` between dev and e2e containers (for both frontend and e2e projects), and possibly ``.venv``.
- Tab management for different users: <https://stackoverflow.com/questions/63013903/multi-user-e2e-testing-with-puppeteer>
