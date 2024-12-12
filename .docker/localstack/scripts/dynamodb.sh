#!/bin/sh

# Function to create a DynamoDB table
create_dynamodb_table() {
    local TABLE_NAME=$1
    awslocal dynamodb create-table \
        --table-name "${TABLE_NAME}" \
        --attribute-definitions \
            AttributeName=id,AttributeType=S \
        --key-schema \
            AttributeName=id,KeyType=HASH \
        --provisioned-throughput \
            ReadCapacityUnits=5,WriteCapacityUnits=5 \
        --region us-east-1

    echo "Created DynamoDB table: ${TABLE_NAME}"
}

echo "++ Creating DynamoDB tables now..."

# Create tables
create_dynamodb_table "image_metadata"

echo "++ DynamoDB tables creation finished..." 