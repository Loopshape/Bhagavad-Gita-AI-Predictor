#!/bin/bash

# Akashic AI Hybrid Executor
# Bridges Bash -> Node.js (ESM) -> Python3

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_BRIDGE="$BASE_DIR/node_bridge.js"

# Ensure we're in the right place
cd "$BASE_DIR/.." || exit 1

# Check dependencies
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed."
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo "Error: Python3 is not installed."
    exit 1
fi

# Initialize DB Schema
# Using the bridge to call python 'init' command
INIT_RES=$(node "$NODE_BRIDGE" init)

# If arguments provided, pass to bridge
if [ "$#" -gt 0 ]; then
    node "$NODE_BRIDGE" "$@"
else
    echo -e "\033[0;32m[System] DB Schema Verified.\033[0m"
    echo "$INIT_RES"
fi