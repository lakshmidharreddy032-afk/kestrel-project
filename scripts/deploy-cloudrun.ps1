# ========================================================
# Kestrel Finance — Direct GCP Cloud Run Deploy (PowerShell)
# Usage:
#   .\scripts\deploy-cloudrun.ps1 -ProjectId "slabspro-slabsuser34"
# ========================================================

param(
    [string]$ProjectId = "slabspro-slabsuser34",
    [string]$Region = "asia-south1",
    [string]$ServiceName = "kestrel-finance"
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Deploying $ServiceName to Google Cloud Run ($Region)" -ForegroundColor Cyan
Write-Host " Target Project: $ProjectId" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

gcloud run deploy $ServiceName `
    --source . `
    --region $Region `
    --project $ProjectId `
    --platform managed `
    --allow-unauthenticated `
    --port 8080 `
    --cpu 1 `
    --memory 512Mi `
    --min-instances 0 `
    --max-instances 5

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✔ Deployment Successful! Service URL:" -ForegroundColor Green
    gcloud run services describe $ServiceName --region $Region --project $ProjectId --format "value(status.url)"
} else {
    Write-Host "`n✖ Deployment failed. Check gcloud credentials and permissions." -ForegroundColor Red
}
