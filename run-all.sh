#!/bin/bash

# Default duration is 3 seconds
DURATION=3

# Parse command line arguments
while [[ "$#" -gt 0 ]]; do
  case $1 in
  -d | --duration)
    DURATION="$2"
    shift
    ;;
  --out)
    OUT_PATH="$2"
    shift
    ;;
  *)
    echo "Unknown parameter: $1"
    exit 1
    ;;
  esac
  shift
done

# Ensure everything is built first
echo "Building packages..."
npm run build

# Run the Node.js script
if [ -n "$OUT_PATH" ]; then
  # If output path is specified
  node process-benchmarks.js --out "$OUT_PATH" --duration="$DURATION"
else
  # No output path specified
  node process-benchmarks.js --duration="$DURATION"
fi
