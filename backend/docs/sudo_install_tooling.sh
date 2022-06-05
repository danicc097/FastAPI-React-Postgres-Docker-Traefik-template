#!/bin/bash

set -e

VERSION="5.2" &&
  wget https://github.com/darold/pgFormatter/archive/refs/tags/v"$VERSION".tar.gz &&
  tar xzf v"$VERSION".tar.gz &&
  cd pgFormatter-"$VERSION"/ || exit 1 &&
  perl Makefile.PL &&
  make && sudo make install &&
  cd .. &&
  rm -rf pgFormatter-"$VERSION"/ &&
  rm v"$VERSION".tar.gz

sudo npm i -g json-schema-to-typescript
