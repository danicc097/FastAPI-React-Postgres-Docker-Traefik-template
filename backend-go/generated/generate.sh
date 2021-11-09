#!/bin/bash
# go get github.com/deepmap/oapi-codegen/cmd/oapi-codegen

oapi-codegen -generate chi-server schema_25-10-2021.json >backend.gen.go
