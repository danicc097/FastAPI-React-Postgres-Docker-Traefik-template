#!/bin/bash

set -e

project_name=$1

sudo wget -nc -O /etc/bash_completion.d/"$project_name" https://raw.githubusercontent.com/urfave/cli/master/autocomplete/bash_autocomplete && sudo chmod +x /etc/bash_completion.d/"$project_name"
