#!/usr/bin/env bash
set -euo pipefail

input="$1"
output="$2"

tippecanoe --force \
  -z12 -Z4 --no-simplification-of-shared-nodes --simplification=9 \
  --layer=prefecture \
  -o "$output" "$input"
