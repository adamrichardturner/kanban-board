#!/bin/bash

# Ensure DB is up
echo "🔄 Starting Postgres in Docker..."
docker-compose up -d

# Wait a bit for DB to be ready
echo "⏳ Waiting for DB to be ready..."
until pg_isready -h localhost -p 5432 -U $POSTGRES_USER > /dev/null 2>&1; do
  sleep 1
done

# Run Prisma migrations
echo "📦 Running Prisma migrations..."
npx prisma migrate deploy

# Run seed script
echo "🌱 Seeding demo data..."
npx prisma db seed

# Start the dev server
echo "🚀 Starting Next.js app..."
npm run dev
