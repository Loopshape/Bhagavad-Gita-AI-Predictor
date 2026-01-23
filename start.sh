#!/bin/bash

# Startup Procedure for Akashic System
# 1. Build Frontend
# 2. Start Express/Node Bridge Server

echo -e "\033[0;35m[Startup] Building Neural Interface...\033[0m"
npm run build

echo -e "\033[0;36m[Startup] Igniting Express Router & AI Bridge...\033[0m"
# Check if PM2 is available (since user mentioned ~/.pm2)
if command -v pm2 &> /dev/null; then
    pm2 delete akashic-server 2>/dev/null
    pm2 start server.js --name akashic-server --interpreter node
    pm2 save
    pm2 logs akashic-server --lines 10 --nostream
else
    echo "PM2 not found, running directly with Node..."
    node server.js
fi
