#!/bin/bash

echo "⏳ Applying custom SQL from database/sql/after-init.sql..."

# Ensure DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL is not set"
  exit 1
fi

# Apply custom SQL to database
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f database/sql/after-init.sql

echo "✅ Custom SQL applied successfully."
