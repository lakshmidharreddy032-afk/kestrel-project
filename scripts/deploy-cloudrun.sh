#!/usr/bin/env bash
set -euo pipefail

# ========================================================
# Kestrel Finance — Direct GCP Cloud Run Deploy Script
# Usage:
#   bash scripts/deploy-cloudrun.sh
# ========================================================

PROJECT_ID="${PROJECT_ID:-$(gcloud config get-value project 2>/dev/null || echo "slabspro-slabsuser34")}"
REGION="${REGION:-asia-south1}"
SERVICE_NAME="kestrel-finance"

echo "Building and deploying $SERVICE_NAME to Google Cloud Run ($REGION) on $PROJECT_ID..."

gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --region "$REGION" \
  --project "$PROJECT_ID" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --cpu 1 \
  --memory 512Mi \
  --min-instances 0 \
  --max-instances 5

echo "✔ Deployment finished! Service URL:"
gcloud run services describe "$SERVICE_NAME" --region "$REGION" --project "$PROJECT_ID" --format "value(status.url)"
