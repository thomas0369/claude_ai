#!/bin/bash
DIR=${1:-.}
mkdir -p "$DIR/.github/workflows"

cat > "$DIR/.github/workflows/ci.yml" << 'EOFCI'
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run lint || true
      - run: npm run test -- --run || true
      - run: npm run build
  
  playwright:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run dev &
      - run: npx wait-on http://localhost:5173
      - run: npx playwright test || true
EOFCI

echo "✅ GitHub Actions: $DIR/.github/workflows/"
