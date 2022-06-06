#!/bin/bash

set -e

mkdir ~/bin
wget https://github.com/danicc097/sqlc/releases/download/v1-custom/sqlc-dev -O ~/bin/sqlc-dev
chmod +x ~/bin/sqlc-dev
