# Fix: CSV Import 404 Error

## Problem
The `/api/inventory/import` endpoint returns 404 even though the code exists in `worker/index.ts`.

## Root Causes
1. ❌ **Empty `database_id` in wrangler.toml** - Worker can't access D1 database
2. ⚠️ **Worker not redeployed** - Latest code not live on Cloudflare

## Solution

### Step 1: Configure D1 Database

```bash
# Create D1 database (if not already created)
npx wrangler d1 create tradebinder-db
```

You'll get output like:
```
✅ Successfully created DB 'tradebinder-db'
Database ID: abc123-def456-ghi789-jkl012
```

### Step 2: Update wrangler.toml

Edit `wrangler.toml` line 19, replace empty string with your database ID:

```toml
[[d1_databases]]
binding = "DB"
database_name = "tradebinder-db"
database_id = "abc123-def456-ghi789-jkl012"  # <-- PASTE YOUR ID HERE
```

### Step 3: Run Database Migrations

```bash
# Apply schema to remote D1 database
npx wrangler d1 execute tradebinder-db --remote --file=db/schema.sql

# Optional: Seed with test data
npx wrangler d1 execute tradebinder-db --remote --file=db/seed.sql
```

### Step 4: Deploy Worker

```bash
# Deploy the worker with updated config
npx wrangler deploy
```

You should see:
```
✨ Successfully deployed tradebinder-api to https://tradebinder-api.erix-due.workers.dev
```

### Step 5: Test the Endpoint

```bash
# Test health endpoint
curl https://tradebinder-api.erix-due.workers.dev/api/health

# Should return:
# {"status":"ok","timestamp":"2026-02-26T...","environment":"development"}
```

## Verify CSV Import Works

1. Login at `https://tradebinder.pages.dev/login`
2. Use: `admin@tradebinder.com` / `admin123`
3. Navigate to `/inventory/import`
4. Upload a test CSV

## Quick Test CSV

Create `test.csv`:

```csv
Name,Set code,Set name,Scryfall ID,Collector number,Foil,Rarity,Quantity,Condition,Purchase price,Language
Lightning Bolt,LEA,Limited Edition Alpha,test-bolt-123,1,normal,common,4,Near Mint,0.50,en
Black Lotus,LEA,Limited Edition Alpha,test-lotus-456,2,normal,rare,1,Near Mint,250.00,en
```

## If Still Getting 404

### Check Deployment Status
```bash
wrangler deployments list
```

### Check Worker Logs
```bash
wrangler tail
```

### Force Redeploy
```bash
# Clear any caches
wrangler deploy --force
```

### Verify Route in Production

Visit your worker URL directly:
```
https://tradebinder-api.erix-due.workers.dev/api/health
```

If this returns 404, the worker itself isn't deployed properly.

## Alternative: Local Development

If production issues persist, develop locally:

```bash
# Terminal 1: Start frontend
npm run dev

# Terminal 2: Start worker locally
npx wrangler dev

# Create local D1 database
npx wrangler d1 execute tradebinder-db --local --file=db/schema.sql
```

Then update `.env`:
```
VITE_API_URL=http://localhost:8787
```

Frontend will use local worker at `http://localhost:8787`.

## Need Help?

If you're still seeing 404:

1. Share the output of `npx wrangler deployments list`
2. Share the contents of your `wrangler.toml` (with database_id)
3. Check browser console for the exact URL being called
