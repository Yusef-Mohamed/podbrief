$ErrorActionPreference = 'Stop'

param(
  [switch]$SkipBuild
)

# Resolve repo root when run from anywhere inside repo
$repoRoot = (Resolve-Path "$PSScriptRoot/.." ).Path
$projRoot = Join-Path $repoRoot "."
$deployCfgPath = Join-Path $repoRoot "deploy.config.local.json"

if (-not (Test-Path $deployCfgPath)) {
  throw "Missing deploy.config.local.json at repo root. See DEPLOYMENT.md."
}

$cfgRaw = Get-Content -LiteralPath $deployCfgPath -Raw
$cfg = $cfgRaw | ConvertFrom-Json

if (-not $cfg.region -or -not $cfg.bucket -or -not $cfg.cloudfrontDistributionId) {
  throw "deploy.config.local.json must include region, bucket, cloudfrontDistributionId"
}

# Ensure aws is on PATH for this session (Windows default path)
$awsDir = "C:\\Program Files\\Amazon\\AWSCLIV2"
if (Test-Path (Join-Path $awsDir "aws.exe")) {
  $env:Path = "$awsDir;" + $env:Path
}

if (-not $SkipBuild) {
  Write-Host "Building app..." -ForegroundColor Cyan
  Push-Location (Join-Path $repoRoot "podbreaf")
  npm run build
  Pop-Location
} else {
  Write-Host "Skipping build (SkipBuild passed)" -ForegroundColor Yellow
}

$dist = Join-Path $repoRoot "podbreaf/dist"
if (-not (Test-Path $dist)) {
  throw "Build output not found at $dist"
}

Write-Host "Syncing to s3://$($cfg.bucket) ..." -ForegroundColor Cyan
aws s3 sync "$dist" "s3://$($cfg.bucket)" --delete

Write-Host "Creating CloudFront invalidation..." -ForegroundColor Cyan
$inv = aws cloudfront create-invalidation --distribution-id $cfg.cloudfrontDistributionId --paths "/*" | ConvertFrom-Json
Write-Host ("Invalidation Id: {0}" -f $inv.Invalidation.Id)

Write-Host "\nEndpoints:" -ForegroundColor Cyan
$cfDomain = (aws cloudfront get-distribution --id $cfg.cloudfrontDistributionId | ConvertFrom-Json).Distribution.DomainName
Write-Host ("- CloudFront (HTTPS): https://{0}" -f $cfDomain)
Write-Host ("- S3 website (HTTP): http://{0}.s3-website-{1}.amazonaws.com" -f $cfg.bucket, $cfg.region)

Write-Host "\nDone." -ForegroundColor Green


