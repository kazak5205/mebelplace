#!/bin/bash

# MebelPlace Database Migration Script
# Применяет полную миграцию базы данных

set -e

echo "🚀 Starting MebelPlace database migration..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-mebelplace_prod}
DB_USER=${DB_USER:-mebelplace}
DB_PASSWORD=${DB_PASSWORD:-mebelplace123}

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if PostgreSQL is available
if ! command -v psql &> /dev/null; then
    log_error "PostgreSQL client (psql) not found!"
    exit 1
fi

# Test database connection
log_info "Testing database connection..."
export PGPASSWORD="$DB_PASSWORD"
if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    log_error "Cannot connect to database!"
    log_info "Please check your database configuration:"
    log_info "  Host: $DB_HOST"
    log_info "  Port: $DB_PORT"
    log_info "  Database: $DB_NAME"
    log_info "  User: $DB_USER"
    exit 1
fi

log_info "Database connection successful!"

# Apply migration
log_info "Applying database migration..."
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f complete-migration.sql; then
    log_info "✅ Database migration completed successfully!"
else
    log_error "❌ Database migration failed!"
    exit 1
fi

# Verify tables were created
log_info "Verifying tables..."
TABLE_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')

if [ "$TABLE_COUNT" -ge 26 ]; then
    log_info "✅ $TABLE_COUNT tables created successfully!"
else
    log_warn "⚠️  Only $TABLE_COUNT tables found (expected 26+)"
fi

# Show created tables
log_info "Created tables:"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"

log_info "🎉 Migration completed successfully!"
log_info "You can now start the backend server."

exit 0
