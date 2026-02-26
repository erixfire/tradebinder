# Production Deployment Guide

## Prerequisites

- ✅ Local development working
- ✅ Cloudflare account (free tier works)
- ✅ GitHub repository connected
- ✅ Domain name (optional)

## 🚀 Deploy to Cloudflare Pages

### Option 1: Automatic GitHub Deployment (Recommended)

#### Step 1: Connect Repository to Cloudflare Pages

1. **Login to Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com
   - Navigate to **Workers & Pages**

2. **Create Pages Project**
   - Click **Create application** → **Pages** → **Connect to Git**
   - Select **GitHub** → Authorize Cloudflare
   - Choose repository: **erixfire/tradebinder**
   - Click **Begin setup**

3. **Configure Build Settings**
   ```
   Project name:        tradebinder
   Production branch:   main
   Framework preset:    Vite
   Build command:       npm run build
   Build output:        dist
   Root directory:      /
   Node version:        18
   ```

4. **Add Environment Variables**
   - Click **Environment variables** (advanced)
   - Add:
     ```
     NODE_VERSION = 18
     VITE_API_URL = https://tradebinder-api.YOUR-ACCOUNT.workers.dev
     ```

5. **Save and Deploy**
   - Click **Save and Deploy**
   - ✅ First deployment starts automatically!
   - Your site will be live at: `https://tradebinder-XXX.pages.dev`

#### Step 2: Configure GitHub Secrets (For Actions)

1. Go to GitHub repository settings
2. **Secrets and variables** → **Actions** → **New repository secret**
3. Add these secrets:
   ```
   CLOUDFLARE_API_TOKEN     = <your-api-token>
   CLOUDFLARE_ACCOUNT_ID    = <your-account-id>
   ```

**Get API Token:**
- Cloudflare Dashboard → My Profile → API Tokens → Create Token
- Use template: "Edit Cloudflare Workers"
- Permissions: Account - Cloudflare Pages (Edit)

**Get Account ID:**
- Cloudflare Dashboard → Workers & Pages → Account ID (right sidebar)

### Option 2: Manual Wrangler Deploy

```bash
# Build frontend
npm run build

# Deploy to Pages
npx wrangler pages deploy dist --project-name=tradebinder
```

## 🔧 Deploy Workers API

### Step 1: Create Production Resources

```bash
# Create production D1 database
npx wrangler d1 create tradebinder-db-production
# Copy database_id

# Create production KV namespace
npx wrangler kv:namespace create "TRADEBINDER-CACHE" --env production
# Copy id
```

### Step 2: Update Production Config

**Edit `wrangler.production.toml`** → Paste your production IDs

### Step 3: Set Production Secrets

```bash
# Generate NEW production JWT secret (NEVER use dev secret!)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Set in Cloudflare
npx wrangler secret put JWT_SECRET --env production
# Paste the generated secret

# Add payment gateway secrets (if using)
npx wrangler secret put GCASH_API_KEY --env production
npx wrangler secret put PAYMAYA_SECRET_KEY --env production
```

### Step 4: Migrate Production Database

```bash
# Run migrations on production D1
npx wrangler d1 execute tradebinder-db-production \
  --remote \
  --file=./db/schema.sql

# Seed production data (optional - or add real data via UI)
npx wrangler d1 execute tradebinder-db-production \
  --remote \
  --file=./db/seed.sql
```

### Step 5: Deploy Workers API

```bash
# Deploy to production
npx wrangler deploy --config wrangler.production.toml

# Test production API
curl https://tradebinder-api.YOUR-ACCOUNT.workers.dev/api/health
```

## 🌐 Custom Domain Setup

### For Frontend (Cloudflare Pages)

1. Cloudflare Dashboard → Pages → **tradebinder** → **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain: `tradebinder.com` or `www.tradebinder.com`
4. Click **Activate domain**
5. ✅ DNS records auto-configured if domain is on Cloudflare

### For API (Cloudflare Workers)

1. Cloudflare Dashboard → Workers → **tradebinder-api** → **Triggers**
2. Click **Add Custom Domain**
3. Enter: `api.tradebinder.com`
4. Click **Add Custom Domain**
5. ✅ DNS records auto-configured

**Update frontend API URL:**
- Edit Pages environment variable:
  ```
  VITE_API_URL = https://api.tradebinder.com
  ```

## 🔒 Production Security Checklist

- [ ] Changed default admin password
- [ ] Generated NEW JWT_SECRET for production
- [ ] Set all secrets via `wrangler secret put` (NOT in code)
- [ ] Updated CORS to only allow your domain
- [ ] Enabled Cloudflare WAF rules
- [ ] Set up rate limiting
- [ ] Enabled HTTPS only (automatic on Cloudflare)
- [ ] Configured proper cache headers
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Enabled Cloudflare Analytics
- [ ] Tested all payment integrations in sandbox
- [ ] Backed up production database

## 📊 Monitoring & Logs

### View Worker Logs (Real-time)
```bash
npx wrangler tail tradebinder-api --env production
```

### View Pages Deployment Logs
- Cloudflare Dashboard → Pages → tradebinder → Deployments
- Click on any deployment → View logs

### Analytics
- Cloudflare Dashboard → Analytics → Web Analytics
- Real-time visitors, page views, performance metrics

## 🔄 Continuous Deployment

With GitHub Actions configured:

```bash
# Any push to main auto-deploys!
git add .
git commit -m "Update feature X"
git push origin main
# ✅ Auto-deploys to https://tradebinder.pages.dev
```

## 🚨 Rollback Procedure

### Rollback Frontend
1. Cloudflare Dashboard → Pages → tradebinder → Deployments
2. Find previous working deployment
3. Click **...** → **Rollback to this deployment**

### Rollback Workers API
```bash
# Deploy previous version
git checkout <previous-commit>
npx wrangler deploy --config wrangler.production.toml
```

## 💾 Backup Strategy

### Backup Production Database
```bash
# Export production data
npx wrangler d1 export tradebinder-db-production \
  --remote \
  --output=backup-$(date +%Y%m%d).sql
```

### Automated Backups (Cron)
Add to `wrangler.production.toml`:
```toml
[triggers]
crons = ["0 3 * * *"]  # Daily at 3 AM
```

## 📈 Performance Optimization

- ✅ Cloudflare CDN enabled (automatic)
- ✅ Brotli compression enabled
- ✅ HTTP/3 enabled
- ✅ Edge caching configured
- ✅ Image optimization via Cloudflare
- ✅ Minified JS/CSS bundles

## 🎯 Post-Deployment Testing

```bash
# Health checks
curl https://tradebinder.pages.dev
curl https://api.tradebinder.com/api/health

# Test login
curl -X POST https://api.tradebinder.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tradebinder.com","password":"YOUR-NEW-PASSWORD"}'

# Test inventory
curl https://api.tradebinder.com/api/inventory
```

## 📱 Mobile Testing

- Test on real devices (iOS/Android)
- Use Cloudflare's mobile preview
- Check performance on 3G/4G networks
- Verify responsive design breakpoints

## 🎉 You're Live!

**Frontend:** https://tradebinder.pages.dev (or your custom domain)
**API:** https://tradebinder-api.YOUR-ACCOUNT.workers.dev (or api.yourdomain.com)

**Next Steps:**
1. Add real MTG inventory
2. Configure payment gateways
3. Test complete checkout flow
4. Share with first customers!
5. Monitor analytics and logs

## 📞 Support Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [D1 Database Docs](https://developers.cloudflare.com/d1/)
- [GitHub Issues](https://github.com/erixfire/tradebinder/issues)
