#!/bin/bash

set -e

echo "Starting build process for all packages..."

PACKAGES=(
  "packages/bench-utils"
  "packages/react"
  "packages/webjsx"
)

for package in "${PACKAGES[@]}"; do
  echo ""
  echo "========================================="
  echo "Processing $package"
  echo "========================================="
  
  cd "$package"
  
  echo "Cleaning $package..."
  npm run clean
  
  echo "Installing dependencies for $package..."
  npm install
  
  echo "Building $package..."
  npm run build
  
  cd - > /dev/null
done

echo ""
echo "========================================="
echo "All packages built successfully!"
echo "========================================="