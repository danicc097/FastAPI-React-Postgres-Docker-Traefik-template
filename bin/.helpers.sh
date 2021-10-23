#!/bin/bash

# "shellcheck.customArgs": ["-x"],
# required for sourcing check to work properly and detect unexisting files

set -e

function docker_compose_in_env {
  local ENV
  REPO_NAME="$(basename "$(git rev-parse --show-toplevel)")"
  ENV="$(get_env_suffix "$1")"
  COMPOSE_COMMAND=$(get_compose_command "$2")
  are_you_sure "Do you want to run docker-compose $COMPOSE_COMMAND in the $ENV environment?"

  case $ENV in
  dev | e2e | prod)
    BASEDIR=$(dirname "$0")

    if [[ $(basename "$PWD") != "$REPO_NAME" ]]; then
      echo "Please run this script from the root repo's directory: '$REPO_NAME'"
      echo "Current directory: $PWD"
      exit 1
    fi

    if [ "$ENV" = "prod" ] && [[ "$COMPOSE_COMMAND" = *"up"* ]]; then
      docker-compose -f docker-compose."$ENV".yml pull
    fi

    # shellcheck disable=SC2086
    docker-compose --project-name myapp_"$ENV" -f docker-compose."$ENV".yml $COMPOSE_COMMAND

    if [ "$ENV" = "e2e" ] && [[ "$COMPOSE_COMMAND" = *"up"* ]]; then
      "${BASEDIR}"/e2e-tests "$ENV"
    fi
    ;;
  *)
    err "Unexpected environment name"
    exit 1
    ;;
  esac
}

function get_env_suffix {
  case $1 in
  dev | development) echo dev ;;
  e2e) echo e2e ;;
  prod | production) echo prod ;;
  *)
    err "Expected environment [dev]elopment|[e2e]|[prod]uction"
    exit 1
    ;;
  esac
}

function get_compose_command {
  case $1 in
  up) printf '%s' 'up -d --build' ;;
  down) printf '%s' 'down --remove-orphans' ;;
  stop) printf '%s' 'stop' ;;
  *)
    err "Expected docker compose command up|down|stop"
    exit 1
    ;;
  esac
}

function err {
  echo "[$(date +'%Y-%m-%dT%H:%M:%S%z')]: $*" >&2
}

function are_you_sure {
  local _prompt _response

  if [ "$1" ]; then _prompt="$1"; else _prompt="Are you sure"; fi
  _prompt="$_prompt [y/n] ?"

  while true; do
    read -r -p "$_prompt " _response
    case "$_response" in
    [Yy][Ee][Ss] | [Yy])
      return 0
      ;;
    [Nn][Oo] | [Nn])
      return 1
      ;;
    *) # Anything else is invalid.
      ;;
    esac
  done
}
