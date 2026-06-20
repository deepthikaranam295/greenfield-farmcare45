# upload-to-vps.ps1
# Run this from Windows PowerShell AFTER filling in your VPS IP.
# Usage: .\scripts\upload-to-vps.ps1 -IP "123.45.67.89"

param(
    [Parameter(Mandatory=$true)]
    [string]$IP
)

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$ZipPath     = "$env:TEMP\greenfield-farm-care.tar.gz"

Write-Host "==> Packing project (excluding venv, node_modules, dist)..." -ForegroundColor Cyan

# Use tar (available in Windows 10/11)
tar -czf $ZipPath `
  --exclude="./backend/venv" `
  --exclude="./backend/__pycache__" `
  --exclude="./frontend/node_modules" `
  --exclude="./frontend/dist" `
  --exclude="./.git" `
  -C (Split-Path $ProjectRoot -Parent) `
  (Split-Path $ProjectRoot -Leaf)

Write-Host "==> Uploading to root@${IP}:/opt/ ..." -ForegroundColor Cyan
scp $ZipPath "root@${IP}:/opt/greenfield-farm-care.tar.gz"

Write-Host ""
Write-Host "✅  Upload complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Now SSH into the server and run:" -ForegroundColor Yellow
Write-Host "  ssh root@$IP"
Write-Host "  cd /opt && tar -xzf greenfield-farm-care.tar.gz && cd greenfield-farm-care"
Write-Host "  bash scripts/server-setup.sh"
