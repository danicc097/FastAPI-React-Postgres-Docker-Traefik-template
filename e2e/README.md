# E2E myapp testing

## Why a separate project?

Avoid ejecting CRA from ``frontend``. GitHub copilot suggestion: _It's a pain_.

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

- Debug workers not being closed after tests running files individually with ``--detectOpenHandles {<stringMatcher1>, <stringMatcher2>, ...}`` to find the culprit.

- Getting literal ``"Not Found"`` error in forms instead of a detailed error message? Check the backend API endpoint is correct.

## References to check

- <https://github.com/davidjgoss/cucumber-puppeteer-typescript-starter>
- PO Model: <https://javascript.plainenglish.io/end-to-end-testing-using-jest-and-puppeteer-page-object-model-with-typescript-7fbd099f1b42>
- <https://ohadstoller.medium.com/how-to-write-e2e-tests-in-page-object-model-using-jest-and-puppeteer-f678e65330af>

## ToDo

- Tab management for different users: https://stackoverflow.com/questions/63013903/multi-user-e2e-testing-with-puppeteer
- 
