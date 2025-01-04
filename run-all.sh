#!/bin/bash

# Run the Node.js script with the output path if provided
if [ "$1" = "--out" ]; then
  node process-benchmarks.js "$2"
else
  node process-benchmarks.js
fi
