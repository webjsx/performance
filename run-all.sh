#!/bin/bash

# Default values
DURATION=3
FRAMEWORK=""
TEST=""

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
  -f | --framework)
    FRAMEWORK="$2"
    shift
    ;;
  -t | --test)
    TEST="$2"
    shift
    ;;
  *)
    echo "Unknown parameter: $1"
    exit 1
    ;;
  esac
  shift
done

# Start servers based on framework filter
if [ -z "$FRAMEWORK" ] || [ "$FRAMEWORK" = "react" ]; then
  (cd packages/react && npm run preview) &
  REACT_PID=$!
fi

if [ -z "$FRAMEWORK" ] || [ "$FRAMEWORK" = "webjsx" ]; then
  (cd packages/webjsx && npm run preview -- --port 4174) &
  WEBJSX_PID=$!
fi

# Wait for servers to start
sleep 2

# Run the Node.js script with all parameters
ARGS=""
[ -n "$FRAMEWORK" ] && ARGS="$ARGS --framework $FRAMEWORK"
[ -n "$TEST" ] && ARGS="$ARGS --test $TEST"
[ -n "$OUT_PATH" ] && ARGS="$ARGS --out \"$OUT_PATH\""
[ -n "$DURATION" ] && ARGS="$ARGS --duration=$DURATION"

node process-benchmarks.js $ARGS

# Kill any running servers
[ -n "$REACT_PID" ] && kill $REACT_PID
[ -n "$WEBJSX_PID" ] && kill $WEBJSX_PID
