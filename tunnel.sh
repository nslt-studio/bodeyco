#!/bin/bash

PORT=5173

./cloudflared tunnel --url http://localhost:$PORT 2>&1 | while IFS= read -r line; do
  echo "$line"
  if [[ "$line" =~ https://[a-zA-Z0-9\-]+\.trycloudflare\.com ]]; then
    URL="${BASH_REMATCH[0]}"
    echo ""
    echo "========================================"
    echo "  URL Webflow (balise <script>) :"
    echo "  $URL/src/main.js"
    echo "========================================"
    echo ""
  fi
done
