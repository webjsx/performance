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

# Start the React dev server
(cd packages/react && npm run preview) &
REACT_PID=$!

# Start the WebJSX dev server
(cd packages/webjsx && npm run preview -- --port 4174) &
WEBJSX_PID=$!

# Wait for servers to start
sleep 2

# Run the Node.js script
if [ -n "$OUT_PATH" ]; then
  # If output path is specified
  node process-benchmarks.js --out "$OUT_PATH" --duration="$DURATION"
else
  # No output path specified
  node process-benchmarks.js --duration="$DURATION"
fi

# Kill the dev servers
kill $REACT_PID
kill $WEBJSX_PID
