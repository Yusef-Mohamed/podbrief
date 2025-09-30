## Deploying podbreaf to AWS (S3 + CloudFront)

This app is deployed as a static SPA to an S3 bucket fronted by CloudFront with HTTPS.

### Prerequisites

- AWS CLI v2 installed and on PATH
- Valid AWS credentials (`aws sts get-caller-identity` works)
- Node 18+ and pnpm/npm/yarn

### One-time setup (already done)

- S3 bucket: `prodbrief-298929199615` (region: `us-west-2`)
- CloudFront distribution ID: `E2TRHBE70KNWS5`
- CloudFront domain: `https://d2ie2xmilv45xc.cloudfront.net`
- Bucket is private; access is granted via CloudFront Origin Access Control (OAC)

These values are referenced by the local deploy config below.

### Local deploy config

Create a file at `deploy.config.local.json` using the sample provided.

```json
{
  "region": "us-west-2",
  "bucket": "prodbrief-298929199615",
  "cloudfrontDistributionId": "E2TRHBE70KNWS5"
}
```

Notes:

- This file is ignored by git. Do not commit credentials or environment-specific IDs elsewhere.

### Deploy steps (manual)

1. Build the app

```bash
npm run build
```

2. Sync to S3 and invalidate CloudFront cache

```bash
# Windows PowerShell (from repo root)
powershell -ExecutionPolicy Bypass -File podbreaf/scripts/deploy.ps1

# Optional: skip rebuild if you already ran `npm run build`
powershell -ExecutionPolicy Bypass -File podbreaf/scripts/deploy.ps1 -SkipBuild
```

The script will:

- Read `deploy.config.local.json`
- Upload `podbreaf/dist` to S3 (delete removed files)
- Create a CloudFront invalidation for `/*`

### Deploy via npm script

From the `podbreaf` folder:

```bash
npm run deploy
```

The script prints both endpoints at the end:

- CloudFront (HTTPS): recommended for production and deep links
- S3 website (HTTP): will show 404 status on deep links but still load the SPA

### Redeploying new versions

- Make changes, then:
  - `npm run build`
  - `npm run deploy`
- CloudFront invalidation typically completes in a few minutes; full propagation can take longer.

### Troubleshooting

- If `aws` is not found, ensure AWS CLI v2 is installed and open a new terminal.
- If access is denied from S3, ensure you are accessing via CloudFront domain (bucket is private).
- If updates don’t reflect, wait for invalidation to complete or force-refresh your browser.
