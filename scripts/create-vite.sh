#!/bin/bash
NAME=$1
REPO=${2:-""}

[ -z "$NAME" ] && echo "Usage: create-vite <name> [github-repo]" && exit 1

echo "🚀 Creating: $NAME"
npm create vite@latest $NAME -- --template react-ts
cd $NAME

npm install
npm install -D tailwindcss postcss autoprefixer vitest playwright
npx tailwindcss init -p

cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  server: { host: '0.0.0.0', port: 5173 }
})
EOF

git init
git add .
git commit -m "init: vite + react + typescript + tailwind"

~/.claude/scripts/gh-actions.sh .
git add .github
git commit -m "ci: add workflows"

if [ ! -z "$REPO" ] && command -v gh &> /dev/null; then
    gh repo create "$REPO" --public --source=. --remote=origin --push
    echo "✅ GitHub: https://github.com/$REPO"
fi

echo "✅ Project: $NAME"
