#!/bin/bash

# Configuration
# Replace these with your actual Google Cloud Project ID and desired region
PROJECT_ID="your-google-cloud-project-id"
REGION="us-central1"
BACKEND_SERVICE_NAME="gh-viewer-backend"
FRONTEND_SERVICE_NAME="gh-viewer-frontend"

echo "Deploying to Google Cloud Run Project: $PROJECT_ID in Region: $REGION"

# Ensure gcloud is configured with the right project
gcloud config set project $PROJECT_ID

echo "----------------------------------------"
echo "1. Deploying Backend"
echo "----------------------------------------"
cd backend
gcloud run deploy $BACKEND_SERVICE_NAME \
  --source . \
  --region $REGION \
  --allow-unauthenticated \
  --format="value(status.url)" > backend_url.txt

BACKEND_URL=$(cat backend_url.txt)
echo "Backend deployed at: $BACKEND_URL"
cd ..

echo "----------------------------------------"
echo "2. Deploying Frontend"
echo "----------------------------------------"
# We need to pass the backend URL to the frontend build.
# For Cloud Build to pick this up with Docker, we'd normally pass build args,
# but since Vite bakes env vars at build time, the easiest approach for source deployments
# is to write an .env file before deploying.
cd gh-viewer
echo "VITE_API_BASE=$BACKEND_URL/api" > .env.production

gcloud run deploy $FRONTEND_SERVICE_NAME \
  --source . \
  --region $REGION \
  --allow-unauthenticated \
  --port 80 \
  --format="value(status.url)" > frontend_url.txt

FRONTEND_URL=$(cat frontend_url.txt)
echo "Frontend deployed at: $FRONTEND_URL"
cd ..

echo "----------------------------------------"
echo "Deployment Complete!"
echo "Backend URL: $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo "----------------------------------------"
