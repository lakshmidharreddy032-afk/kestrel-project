#!/usr/bin/env bash
set -euo pipefail

# ========================================================
# Kestrel Finance — GCP Cloud Run Bootstrap Script
# Enables required APIs, creates Artifact Registry & Service Account
# ========================================================

PROJECT_ID="${PROJECT_ID:-$(gcloud config get-value project 2>/dev/null || echo "slabspro-slabsuser34")}"
REGION="asia-south1"
REPO_OWNER="lakshmidharreddy032-afk"
REPO_NAME="kestrel-project"
SA_NAME="github-kestrel-deployer"
POOL_NAME="github-actions-pool"
PROVIDER_NAME="github-provider-kestrel"
ARTIFACT_REPO="kestrel"

echo "=========================================================="
echo " Bootstrapping GCP for Kestrel Finance on $PROJECT_ID"
echo "=========================================================="

# 1. Enable required APIs
echo "1) Enabling GCP APIs..."
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  iam.googleapis.com \
  iamcredentials.googleapis.com \
  cloudresourcemanager.googleapis.com \
  --project="$PROJECT_ID"

# 2. Artifact Registry
echo "2) Ensuring Artifact Registry '$ARTIFACT_REPO' exists in $REGION..."
gcloud artifacts repositories describe "$ARTIFACT_REPO" --location="$REGION" --project="$PROJECT_ID" >/dev/null 2>&1 || \
  gcloud artifacts repositories create "$ARTIFACT_REPO" \
    --repository-format=docker \
    --location="$REGION" \
    --project="$PROJECT_ID"

# 3. Create Service Account
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
echo "3) Creating Service Account '$SA_NAME'..."
gcloud iam service-accounts describe "$SA_EMAIL" --project="$PROJECT_ID" >/dev/null 2>&1 || \
  gcloud iam service-accounts create "$SA_NAME" \
    --display-name="GitHub Actions Kestrel Deployer" \
    --project="$PROJECT_ID"

# 4. Grant IAM Roles
echo "4) Granting Cloud Run Admin & Artifact Registry Writer roles..."
for ROLE in roles/run.admin roles/artifactregistry.writer roles/iam.serviceAccountUser; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="$ROLE" >/dev/null
done

# 5. Create Key for GitHub Actions
KEY_FILE="gcp-key-${PROJECT_ID}.json"
echo "5) Generating Service Account key for GitHub Secret..."
gcloud iam service-accounts keys create "$KEY_FILE" \
  --iam-account="$SA_EMAIL" \
  --project="$PROJECT_ID"

echo "=========================================================="
echo "✔ GCP Setup Complete!"
echo "To enable automated CI/CD deployment, add this secret to:"
echo "https://github.com/${REPO_OWNER}/${REPO_NAME}/settings/secrets/actions"
echo ""
echo "Secret Name: GCP_CREDENTIALS_JSON"
echo "Secret Value: Contents of $(pwd)/${KEY_FILE}"
echo "=========================================================="
