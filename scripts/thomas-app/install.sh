#!/bin/bash

# Thomas App Installation Script
# Installs all dependencies and sets up the testing framework

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Thomas App Installation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check Node.js version
echo "🔍 Checking Node.js version..."
NODE_VERSION=$(node --version | sed 's/v//' | cut -d. -f1)

if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Error: Node.js 18+ required (you have v$NODE_VERSION)"
  echo "   Install from: https://nodejs.org/"
  exit 1
fi

echo "✅ Node.js v$(node --version) detected"
echo ""

# Install npm dependencies
echo "📥 Installing npm dependencies..."
cd ~/.claude/scripts/thomas-app
npm install

echo ""
echo "🎭 Installing Playwright browsers..."
npx playwright install chromium --with-deps

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Installation Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 Quick Start:"
echo ""
echo "  # Test your application"
echo "  /thomas-app"
echo ""
echo "  # Quick scan (2 minutes)"
echo "  /thomas-app --quick"
echo ""
echo "  # Deep scan with AI agent reviews (15-20 minutes)"
echo "  /thomas-app --deep"
echo ""
echo "📖 Documentation:"
echo "  ~/.claude/scripts/thomas-app/README.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
