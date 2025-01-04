#!/bin/bash

# Default values
DURATION=3
FRAMEWORK=""
TEST=""
PIDS=()

# Function to cleanup processes more aggressively
cleanup() {
  echo "Cleaning up processes..."

  # Kill all running vite processes
  pkill -f "vite"

  # Kill our tracked processes and their children
  for pid in "${PIDS[@]}"; do
    # Kill child processes first
    pkill -P $pid 2>/dev/null
    # Kill the parent process
    kill -TERM $pid 2>/dev/null
  done

  # Final sweep for any remaining vite processes
  pkill -9 -f "vite" 2>/dev/null
}

# Set up trap for script termination
trap cleanup EXIT INT TERM

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

# Kill any existing vite processes before starting
pkill -f "vite" 2>/dev/null
sleep 1

# Start servers based on framework filter
if [ -z "$FRAMEWORK" ] || [ "$FRAMEWORK" = "react" ]; then
  (cd packages/react && npm run preview) &
  PIDS+=($!)
  REACT_PID=${PIDS[-1]}
fi

if [ -z "$FRAMEWORK" ] || [ "$FRAMEWORK" = "webjsx" ]; then
  (cd packages/webjsx && npm run preview -- --port 4174) &
  PIDS+=($!)
  WEBJSX_PID=${PIDS[-1]}
fi

# Wait for servers to start
sleep 2

# Build the arguments string, properly quoting the test parameter
ARGS=""
[ -n "$FRAMEWORK" ] && ARGS="$ARGS --framework $FRAMEWORK"
[ -n "$TEST" ] && ARGS="$ARGS --test \"$TEST\""
[ -n "$OUT_PATH" ] && ARGS="$ARGS --out \"$OUT_PATH\""
[ -n "$DURATION" ] && ARGS="$ARGS --duration=$DURATION"

# Use eval to properly handle the quoted arguments
eval "node process-benchmarks.js $ARGS"
