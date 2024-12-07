#!/bin/sh

# Function to create an s3 bucket
create_s3_bucket() {
    local BUCKET_NAME=$1
    local BUCKET_NAME_TMP=$2
    awslocal s3api create-bucket --bucket "${BUCKET_NAME}" --region eu-west-1
    awslocal s3api create-bucket --bucket "${BUCKET_NAME_TMP}" --region eu-west-1
}

echo "++ Creating S3 bucket now..."

# Create bucket
create_s3_bucket "resize-cluster-resize-primary-image" "resize-cluster-resize-tmp-image"

echo "++ S3 bucket creation finished..."