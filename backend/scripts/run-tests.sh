#!/bin/bash
set -e

# -s -v useful for debugging
# run a single class with -k <TestClassName>
docker exec -it backend_myapp_dev /bin/bash -c "pytest -n auto --dist loadscope $*"
