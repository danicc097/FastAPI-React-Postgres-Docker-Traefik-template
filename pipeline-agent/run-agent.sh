#!/bin/bash
# TODO cache for yarn
# https://github.com/yarnpkg/berry/discussions/2621
# https://stackoverflow.com/questions/65958925/caching-node-modules-in-azure-pipelines-takes-longer-than-installing-them

docker run \
  -e AZP_URL="$AZP_URL" \
  -e AZP_TOKEN="$AZP_TOKEN" \
  -e AZP_AGENT_NAME=mydockeragent \
  -v /var/run/docker.sock:/run/docker.sock \
  -v "$(which docker)":/bin/docker \
  -v "$(which docker-compose)":/bin/docker-compose \
  --restart unless-stopped \
  dockeragent:latest
