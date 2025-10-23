#!/bin/sh

# MebelPlace MVP Startup Script

echo "🚀 Starting MebelPlace MVP..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL..."
until pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done
echo "✅ PostgreSQL is ready"

# Initialize database
echo "🗄️ Initializing database..."
cd /app/server
node -e "
const { initDatabase } = require('./config/database');
initDatabase().then(() => {
  console.log('✅ Database initialized');
}).catch(err => {
  console.error('❌ Database initialization failed:', err);
  process.exit(1);
});
"

# Start services with supervisor
echo "🔧 Starting services..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf

