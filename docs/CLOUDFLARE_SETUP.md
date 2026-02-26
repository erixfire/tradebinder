# Cloudflare Setup Guide for TradeBinder

## Prerequisites

- Cloudflare account (free tier works)
- Node.js 18+ installed
- Wrangler CLI installed (`npm install -g wrangler`)

## Step-by-Step Setup

### 1. Login to Cloudflare

```bash
npx wrangler login
```

This opens a browser to authorize Wrangler with your Cloudflare account.

### 2. Create D1 Database

```bash
npx wrangler d1 create tradebinder-db
```

**Output example:**
```
✅ Successfully created DB 'tradebinder-db'

[[d1_databases]]
binding = "DB"
database_name = "tradebinder-db"
database_id = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"  # <-- Copy this!
```

**Action:** Copy the `database_id` and paste it into `wrangler.toml` line 14

### 3. Create KV Namespace (Cache)

```bash
npx wrangler kv:namespace create "TRADEBINDER-CACHE"
```

**Output example:**
```
✅ Success!
Add the following to your wrangler.toml:

[[kv_namespaces]]
binding = "CACHE"
id = "0a1b2c3d4e5f6789abcdef01234567"  # <-- Copy this!
```

**Action:** Copy the `id` and paste it into `wrangler.toml` line 23

### 4. Update wrangler.toml

**Before:**
```toml
database_id = ""  # Empty
id = ""           # Empty
```

**After:**
```toml
database_id = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"  # ✅ Your real ID
id = "0a1b2c3d4e5f6789abcdef01234567"                 # ✅ Your real ID
```

### 5. Run Database Migrations

```bash
# Local database
npm run db:migrate

# Production database (after deploying)
npm run db:migrate:remote
```

### 6. Seed Sample Data (Optional)

```bash
npm run db:seed
```

This adds:
- 200+ MTG cards
- 15 customer accounts
- 127 sample orders
- Admin user: `admin@tradebinder.com` / `admin123`

### 7. Start Development Servers

**Terminal 1 - Frontend:**
```bash
npm run dev
# Opens: http://localhost:5173
```

**Terminal 2 - Backend:**
```bash
npm run worker:dev
# Opens: http://localhost:8787
```

### 8. Test Everything Works

```bash
# Test API health
curl http://localhost:8787/api/health
# Response: {"status":"ok","timestamp":"..."}

# Test inventory endpoint
curl http://localhost:8787/api/inventory
# Response: [{ cards... }]

# Test frontend
open http://localhost:5173
# Login: admin@tradebinder.com / admin123
```

## Production Deployment

### Deploy Frontend (Cloudflare Pages)

```bash
npm run build
npm run deploy
```

**OR** connect GitHub repository:
1. Cloudflare Dashboard → Pages → Create project
2. Connect to GitHub → Select `tradebinder` repo
3. Build settings:
   - Build command: `npm run build`
   - Build output: `dist`
   - Framework: Vite

### Deploy Backend (Cloudflare Workers)

```bash
npm run worker:deploy
```

### Migrate Production Database

```bash
npm run db:migrate:remote
```

## Troubleshooting

### Error: "database_id is empty"

**Fix:** Run `npx wrangler d1 create tradebinder-db` and paste ID into `wrangler.toml`

### Error: "kv namespace id is empty"

**Fix:** Run `npx wrangler kv:namespace create TRADEBINDER-CACHE` and paste ID

### Error: "Authentication error"

**Fix:** Run `npx wrangler logout` then `npx wrangler login`

### Port 8787 already in use

**Fix:** Kill existing process: `lsof -ti:8787 | xargs kill -9`

### D1 database not found

**Fix:** Check database exists: `npx wrangler d1 list`

## Environment Variables

### Local Development (.dev.vars)

Create `.dev.vars` file:
```env
JWT_SECRET=your-local-secret
ENVIRONMENT=development
```

### Production (Cloudflare Dashboard)

1. Workers & Pages → tradebinder-api → Settings → Variables
2. Add:
   - `JWT_SECRET` (encrypt) - Generate new secret for production
   - `ENVIRONMENT` = "production"
   - `GCASH_API_KEY` (if using payments)
   - `PAYMAYA_PUBLIC_KEY` (if using payments)

## Security Checklist

- [ ] Changed default JWT_SECRET in production
- [ ] Set environment to "production" in Cloudflare
- [ ] Enabled rate limiting on API endpoints
- [ ] Updated CORS origins to your domain only
- [ ] Changed default admin password
- [ ] Enabled Cloudflare security features (firewall, DDoS)

## Resources

- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)

## Support

For issues:
1. Check [GitHub Issues](https://github.com/erixfire/tradebinder/issues)
2. Review Cloudflare logs: `npx wrangler tail tradebinder-api`
3. Check browser console for frontend errors
