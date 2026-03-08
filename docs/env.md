# Frontend Environment & Deployment

This document explains how to configure environment variables for Cloudflare Pages deployments (staging and production).

## Environment variables (set in Cloudflare Pages dashboard)
- NEXT_PUBLIC_API_URL — Full API base URL including `/api/v1` (e.g. `https://crm-api-staging.adibasyraaf.com/api/v1`)
- NEXT_PUBLIC_APP_URL — Base URL of the frontend (e.g. `https://staging.yourdomain.com`)

## Example (staging) — do NOT commit secrets
```
NEXT_PUBLIC_API_URL=https://crm-api-staging.adibasyraaf.com/api/v1
NEXT_PUBLIC_APP_URL=https://staging.yourdomain.com
```

## Example (production)
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com
```

## Notes
- Cloudflare Pages stores env vars securely per Pages project.
- Do not commit `.env` files with secrets into the repository. Use the `docs/` files as templates or copy into your local `.env.local` for development.
- To deploy from GitHub Actions, ensure the `wrangler` action uses a `CLOUDFLARE_API_TOKEN` secret with `Pages` write permissions and `CLOUDFLARE_ACCOUNT_ID`.
