#!/bin/bash

# SIG Maps V2 - Database Backup Script
# Usage: ./backup-database.sh [list|restore|clean]

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups"
CONTAINER_NAME="sig-maps-postgres-prod"
DB_NAME="sig_maps_v2"
DB_USER="sigmaps_prod_user"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/sigmaps_${DB_NAME}_${TIMESTAMP}.sql.gz"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Function: List backups
list_backups() {
    echo -e "${BLUE}Available backups:${NC}"
    echo ""

    if [ -z "$(ls -A $BACKUP_DIR 2>/dev/null)" ]; then
        echo -e "${YELLOW}No backups found${NC}"
        return 0
    fi

    for file in "$BACKUP_DIR"/*.sql.gz; do
        if [ -f "$file" ]; then
            size=$(du -h "$file" | cut -f1)
            date=$(stat -c %y "$file" | cut -d'.' -f1)
            filename=$(basename "$file")
            echo -e "  ${GREEN}✓${NC} $filename"
            echo -e "    Size: $size"
            echo -e "    Date: $date"
            echo ""
        fi
    done
}

# Function: Create backup
create_backup() {
    if [ ! "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
        echo -e "${RED}Error: PostgreSQL container is not running${NC}"
        echo "Please start the database: docker-compose -f docker-compose.prod.yml up -d postgres"
        exit 1
    fi

    echo -e "${YELLOW}Creating backup...${NC}"
    echo "  • Database: $DB_NAME"
    echo "  • Output: $BACKUP_FILE"
    echo ""

    # Load password from .env.production
    if [ -f ".env.production" ]; then
        export PGPASSWORD=$(grep POSTGRES_PASSWORD .env.production | cut -d'=' -f2)
    else
        echo -e "${YELLOW}Warning: .env.production not found. You may need to set PGPASSWORD${NC}"
    fi

    # Create backup
    docker exec "$CONTAINER_NAME" pg_dump -h localhost -U "$DB_USER" -d "$DB_NAME" --format=plain --no-owner --no-acl | gzip > "$BACKUP_FILE"

    if [ $? -eq 0 ]; then
        size=$(du -h "$BACKUP_FILE" | cut -f1)
        echo -e "${GREEN}✓ Backup created successfully${NC}"
        echo "  • Size: $size"
        echo "  • Location: $BACKUP_FILE"

        # Keep only last 7 backups
        echo ""
        echo -e "${YELLOW}Cleaning old backups (keeping last 7)...${NC}"
        ls -t "$BACKUP_DIR"/*.sql.gz 2>/dev/null | tail -n +8 | xargs -r rm -v
        echo -e "${GREEN}✓ Old backups cleaned${NC}"
    else
        echo -e "${RED}✗ Backup failed${NC}"
        rm -f "$BACKUP_FILE"
        exit 1
    fi
}

# Function: Restore backup
restore_backup() {
    BACKUP_FILE="$1"

    if [ -z "$BACKUP_FILE" ]; then
        echo -e "${RED}Error: Please specify a backup file${NC}"
        echo "Usage: ./backup-database.sh restore <backup-file>"
        echo ""
        list_backups
        exit 1
    fi

    if [ ! -f "$BACKUP_FILE" ]; then
        echo -e "${RED}Error: Backup file not found: $BACKUP_FILE${NC}"
        exit 1
    fi

    if [ ! "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
        echo -e "${RED}Error: PostgreSQL container is not running${NC}"
        echo "Please start the database: docker-compose -f docker-compose.prod.yml up -d postgres"
        exit 1
    fi

    echo -e "${YELLOW}Restoring backup...${NC}"
    echo "  • From: $BACKUP_FILE"
    echo "  • Database: $DB_NAME"
    echo ""
    echo -e "${RED}⚠️  WARNING: This will replace the current database!${NC}"
    echo -e "Press Ctrl+C to cancel, or Enter to continue..."
    read

    # Load password from .env.production
    if [ -f ".env.production" ]; then
        export PGPASSWORD=$(grep POSTGRES_PASSWORD .env.production | cut -d'=' -f2)
    else
        echo -e "${YELLOW}Warning: .env.production not found. You may need to set PGPASSWORD${NC}"
    fi

    # Drop and recreate database
    echo "  • Dropping existing database..."
    docker exec -i "$CONTAINER_NAME" psql -h localhost -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;" > /dev/null 2>&1
    docker exec -i "$CONTAINER_NAME" psql -h localhost -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;" > /dev/null 2>&1

    # Restore backup
    echo "  • Restoring from backup..."
    gunzip < "$BACKUP_FILE" | docker exec -i "$CONTAINER_NAME" psql -h localhost -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Database restored successfully${NC}"
    else
        echo -e "${RED}✗ Restore failed${NC}"
        exit 1
    fi
}

# Function: Clean old backups
clean_backups() {
    echo -e "${YELLOW}Cleaning old backups...${NC}"
    echo ""

    if [ -z "$(ls -A $BACKUP_DIR 2>/dev/null)" ]; then
        echo -e "${YELLOW}No backups to clean${NC}"
        return 0
    fi

    # Keep last 3 backups
    ls -t "$BACKUP_DIR"/*.sql.gz 2>/dev/null | tail -n +4 | while read file; do
        echo -e "  ${RED}✗${NC} Deleting $(basename $file)"
        rm "$file"
    done

    echo ""
    echo -e "${GREEN}✓ Old backups cleaned${NC}"
    list_backups
}

# Main menu
case "${1:-backup}" in
    list)
        list_backups
        ;;
    restore)
        restore_backup "$2"
        ;;
    clean)
        clean_backups
        ;;
    backup|"")
        create_backup
        ;;
    *)
        echo "Usage: $0 [list|restore|clean]"
        echo ""
        echo "Commands:"
        echo "  backup   - Create a new backup (default)"
        echo "  list     - List all available backups"
        echo "  restore  - Restore a backup (requires filename)"
        echo "  clean    - Remove old backups"
        echo ""
        echo "Examples:"
        echo "  $0                    # Create backup"
        echo "  $0 list              # List backups"
        echo "  $0 restore backup.sql.gz"
        echo "  $0 clean             # Clean old backups"
        exit 1
        ;;
esac
