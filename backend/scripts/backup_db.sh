#!/bin/bash
# Phoenix Systems Automated Backup Script

# Configuration
BACKUP_DIR="./backups"
DB_NAME="inventory_system"
DB_USER="postgres"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="backup_${DB_NAME}_${TIMESTAMP}.sql"
RETENTION_DAYS=7

# Ensure backup directory exists
mkdir -p $BACKUP_DIR

echo "Starting database backup for ${DB_NAME}..."

# Perform backup
docker exec -t phoenix-db pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/$FILENAME

if [ $? -eq 0 ]; then
    echo "Backup successful: $BACKUP_DIR/$FILENAME"
else
    echo "Backup failed!"
    exit 1
fi

# Retention Policy/Cleanup
echo "Cleaning up old backups (older than ${RETENTION_DAYS} days)..."
find $BACKUP_DIR -name "backup_${DB_NAME}_*.sql" -mtime +$RETENTION_DAYS -exec rm {} \;

echo "Backup operation finalized."
