#!/bin/bash

# Region, is configurable
REGION=us-central
ACCOUNT_NUM=$(gcloud projects list | grep $GOOGLE_CLOUD_PROJECT | tr -s " " | cut -d' ' -f3)

# Enable the APIs
gcloud services enable pubsub.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable deploymentmanager.googleapis.com

# Set the correct IAM permissions
gcloud projects add-iam-policy-binding $GOOGLE_CLOUD_PROJECT --member serviceAccount:$ACCOUNT_NUM@cloudservices.gserviceaccount.com --role roles/pubsub.admin
gcloud projects add-iam-policy-binding $GOOGLE_CLOUD_PROJECT --member serviceAccount:$ACCOUNT_NUM@cloudservices.gserviceaccount.com --role roles/storage.admin

# Deploy the configuration
gcloud deployment-manager deployments create $GOOGLE_CLOUD_PROJECT-deploy --config config.yaml

# Create app to build datastore
gcloud app create --region=$REGION
# Set up datastore indices
gcloud datastore indexes create datastore/index.yaml