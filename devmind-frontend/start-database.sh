#!/bin/bash

# Start PostgreSQL database using Docker
# This script creates and starts a PostgreSQL container for DevMind

CONTAINER_NAME="devmind-postgres"
DB_NAME="devmind"
DB_USER="devmind"
DB_PASS="devmind123"
DB_PORT="5432"

echo "Starting DevMind PostgreSQL database..."

# Check if container already exists
if [ $(docker ps -a -q -f name=$CONTAINER_NAME) ]; then
    echo "Container $CONTAINER_NAME already exists. Starting it..."
    docker start $CONTAINER_NAME
else
    echo "Creating new PostgreSQL container..."
    docker run --name $CONTAINER_NAME \
        -e POSTGRES_DB=$DB_NAME \
        -e POSTGRES_USER=$DB_USER \
        -e POSTGRES_PASSWORD=$DB_PASS \
        -p $DB_PORT:5432 \
        -d postgres:15-alpine
fi

echo "Database is starting up..."
echo "Connection details:"
echo "  Host: localhost"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  Username: $DB_USER"
echo "  Password: $DB_PASS"
echo ""
echo "Connection URL: postgresql://$DB_USER:$DB_PASS@localhost:$DB_PORT/$DB_NAME"
echo ""
echo "Run 'docker logs $CONTAINER_NAME' to check the database logs."