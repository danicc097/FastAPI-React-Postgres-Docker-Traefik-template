#!/bin/bash

# global
pip install pydantic-to-typescript

rm -rf .venv
source .venv/bin/activate
python -m pip install pip-tools
pip-sync requirements-dev.txt requirements.txt
