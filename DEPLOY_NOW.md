# 🚀 Quick Deployment Guide - Site Already Live!

Your frontend is already live on Cloudflare Pages! Now let's get the backend API working.

## ✅ Frontend Status: LIVE
- Your Cloudflare Pages site is deployed and working
- Accessible at: `https://tradebinder-[hash].pages.dev`
- ✨ Beautiful UI already visible!

## 🔧 Backend Setup (5 Minutes)

The backend API needs Cloudflare resources. Follow these steps:

### Step 1: Pull Latest Code
```bash
cd tradebinder
git pull origin main
```

### Step 2: Run Automated Setup
```bash
chmod +x setup.sh
./setup.sh
```

This creates:
- ✅ D1 database with ID
- ✅ KV namespace with ID  
- ✅ Updates wrangler.toml automatically

### Step 3: Initialize Database
```bash
npm run db:migrate
npm run db:seed  # Adds 200+ MTG cards
```

### Step 4: Deploy Backend API
```bash
npm run worker:deploy
```

**Your API is now live at:**
`https://tradebinder-api.YOUR-ACCOUNT.workers.dev`

### Step 5: Update Frontend API URL

1. **Go to Cloudflare Dashboard**
   - Workers & Pages → tradebinder (Pages)
   - Settings → Environment variables

2. **Add Variable:**
   ```
   Name:  VITE_API_URL
   Value: https://tradebinder-api.YOUR-ACCOUNT.workers.dev
   ```

3. **Redeploy:**
   - Settings → Builds & deployments → Retry deployment
   - OR push any change to GitHub (auto-redeploys)

## 🎯 Quick Test

```bash
# Test your live API
curl https://tradebinder-api.YOUR-ACCOUNT.workers.dev/api/health
# ✅ {"status":"ok",...}

# Test inventory
curl https://tradebinder-api.YOUR-ACCOUNT.workers.dev/api/inventory
# ✅ [{ cards... }]
```

## 🌐 Your Live URLs

**Frontend (Already Live):**
- Pages URL: `https://tradebinder-[hash].pages.dev`
- Custom domain: (add in Cloudflare Pages settings)

**Backend (After Step 4):**
- Workers URL: `https://tradebinder-api.[account].workers.dev`
- Custom domain: `api.tradebinder.com` (optional)

## 🔐 Production Security (Important!)

### Change Default Admin Password
```bash
# Login to your live site
# Email: admin@tradebinder.com
# Password: admin123 (CHANGE THIS!)

# Go to Settings → Change Password
# OR update in database:
npx wrangler d1 execute tradebinder-db --remote \
  --command "UPDATE customers SET password_hash='NEW_HASH' WHERE email='admin@tradebinder.com'"
```

### Set Production JWT Secret
```bash
# Generate NEW secret (don't use dev secret!)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Set in Cloudflare Workers
npx wrangler secret put JWT_SECRET
# Paste the generated secret
```

## 📱 Test Your Live Site

1. **Open your Cloudflare Pages URL**
2. **Click "Coming Soon" features**
3. **After backend deploy:**
   - Login: `admin@tradebinder.com` / `admin123`
   - Search cards: "Lightning Bolt"
   - Add to cart
   - Test checkout

## 🎨 Custom Domain (Optional)

### For Frontend
1. Cloudflare Pages → tradebinder → Custom domains
2. Add: `tradebinder.com`
3. ✅ Auto-configured

### For Backend
1. Workers → tradebinder-api → Triggers → Add Custom Domain  
2. Add: `api.tradebinder.com`
3. Update Pages env var: `VITE_API_URL=https://api.tradebinder.com`

## 🚨 If Something Breaks

### Frontend Issues
- Check Cloudflare Pages → Deployments → Logs
- Verify build succeeded
- Check environment variables are set

### Backend Issues
```bash
# Check logs
npx wrangler tail tradebinder-api

# Verify database exists
npx wrangler d1 list

# Test locally first
npm run worker:dev
curl http://localhost:8787/api/health
```

### Cannot Login
- Verify backend is deployed
- Check API URL in environment variables
- Check browser console for CORS errors
- Verify JWT_SECRET is set

## 📊 Monitor Your Live Site

**Analytics:**
- Cloudflare Dashboard → Analytics → Web Analytics
- Real-time visitors, page views, performance

**Logs:**
```bash
# Real-time API logs
npx wrangler tail tradebinder-api

# Pages deployment logs
# Cloudflare Dashboard → Pages → tradebinder → Deployments
```

## 🎉 You're Live!

**Frontend:** ✅ Already deployed
**Backend:** ⏳ Run steps 2-4 above
**Database:** ⏳ Run step 3 above
**Domain:** ✨ Add custom domain (optional)

**Total time: 5 minutes to full production!**

## 🆘 Need Help?

1. Check [PRODUCTION_DEPLOY.md](docs/PRODUCTION_DEPLOY.md) for detailed guide
2. Check [CLOUDFLARE_SETUP.md](docs/CLOUDFLARE_SETUP.md) for configuration
3. Review [GitHub Issues](https://github.com/erixfire/tradebinder/issues)
4. Check Cloudflare logs and error messages

---

**Next:** Run `./setup.sh` to deploy the backend! 🚀
