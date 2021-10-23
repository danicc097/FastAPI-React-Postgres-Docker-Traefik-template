# CI/CD

Keep variables in ``Pipeline > Edit > Variables`` up to date.
For usage as ``process.env`` variables in react, edit ``Dockerfile.prod``:

```dockerfile
ARG REACT_APP_NEW_ENV_VAR
ENV REACT_APP_NEW_ENV_VAR=$REACT_APP_NEW_ENV_VAR
```

which require a ``--build-arg`` parameter in azure-pipelines for every new variable:
```yaml
--build-arg REACT_APP_NEW_ENV_VAR=$(REACT_APP_NEW_ENV_VAR)
```

# ToDos

Fix install-state.gz permissions:
``sudo chmod a+rw .yarn/install-state.gz``

- Rootless nginx in image
  https://developers.redhat.com/blog/2021/03/04/building-rootless-containers-for-javascript-front-ends#

# Styled Components

Usage with EUI components requires:
https://styled-components.com/docs/faqs#how-can-i-override-styles-with-higher-specificity
