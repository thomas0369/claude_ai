#!/bin/bash
URL=$1

[ -z "$URL" ] && echo "Usage: deploy-monitor <url>" && exit 1

echo "🚀 Deployment Monitor"
echo "====================="
echo ""
echo "Checking: $URL"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL")

if [ "$STATUS" -eq 200 ]; then
    echo "✅ Site live ($STATUS)"
else
    echo "❌ Error ($STATUS)"
fi

echo ""
echo "Running Lighthouse..."
npx lighthouse "$URL" --only-categories=performance --quiet 2>/dev/null || echo "Lighthouse failed"

echo ""
echo "✅ Monitor complete"
