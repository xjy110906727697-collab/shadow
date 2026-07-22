#!/bin/bash
set -e

APP_DIR="/var/www/shadow"
BRANCH="${1:-main}"

echo "=== Deploying hangul-study (branch: $BRANCH) ==="

cd "$APP_DIR"

echo "Pulling latest code..."
git pull origin "$BRANCH"

echo "Installing dependencies..."
npm config set registry https://registry.npmmirror.com
npm ci

echo "Generating Prisma client..."
npx prisma generate

echo "Pushing database schema..."
npx prisma db push

echo "Building application..."
npm run build

echo "Restarting PM2..."
pm2 restart hangul-study

echo "=== Deploy complete ==="
pm2 status
