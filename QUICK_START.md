# TradeBinder Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Clone & Install

```bash
git clone https://github.com/erixfire/tradebinder.git
cd tradebinder
npm install
```

### Step 2: Cloudflare Setup (One-time)

```bash
# Login to Cloudflare
npx wrangler login

# Create D1 database
npx wrangler d1 create tradebinder-db
# Copy the database_id from output

# Create KV namespace
npx wrangler kv:namespace create "TRADEBINDER-CACHE"
# Copy the id from output
```

### Step 3: Update Configuration

**Edit `wrangler.toml`** - Paste your IDs:

```toml
database_id = "PASTE_D1_ID_HERE"  # Line 14
id = "PASTE_KV_ID_HERE"            # Line 23
```

### Step 4: Initialize Database

```bash
npm run db:migrate
npm run db:seed  # Adds 200+ MTG cards + demo data
```

### Step 5: Start Both Servers

**Terminal 1 - Frontend:**
```bash
npm run dev
```
✅ Opens: http://localhost:5173

**Terminal 2 - Backend:**
```bash
npm run worker:dev
```
✅ Opens: http://localhost:8787

### Step 6: Login & Explore

1. Open http://localhost:5173
2. Login with:
   - **Email:** admin@tradebinder.com
   - **Password:** admin123
3. Explore:
   - 📦 Inventory (342 MTG cards)
   - 🛒 POS Checkout
   - 👥 Customers (15 accounts)
   - 📊 Reports & Analytics

## 🎮 Test Features

```bash
# Search inventory
curl "http://localhost:8787/api/inventory/search?q=Lightning"

# Get all cards
curl http://localhost:8787/api/inventory

# Health check
curl http://localhost:8787/api/health
```

## 📦 What's Included

- ✅ 200+ real MTG cards (Scryfall data)
- ✅ Full inventory management
- ✅ POS checkout system
- ✅ Customer portal
- ✅ Sales reporting
- ✅ Authentication (JWT)
- ✅ Philippine payment integration points
- ✅ Mobile responsive

## 🚀 Deploy to Production

```bash
# One command deploys everything
npm run deploy:full
```

Creates:
- Frontend: `https://tradebinder-[hash].pages.dev`
- API: `https://tradebinder-api.[account].workers.dev`
- Database: Production D1 with your data

## 📚 Documentation

- [Full Setup Guide](docs/CLOUDFLARE_SETUP.md)
- [API Documentation](docs/API_DOCUMENTATION.md)
- [System Design](SYSTEM_DESIGN_PROMPT.md)

## 🆘 Troubleshooting

**Error: "database_id is empty"**
```bash
npx wrangler d1 create tradebinder-db
# Copy ID to wrangler.toml line 14
```

**Error: "Port 8787 in use"**
```bash
lsof -ti:8787 | xargs kill -9
npm run worker:dev
```

**Can't login?**
- Default: `admin@tradebinder.com` / `admin123`
- Check backend is running on port 8787

## 💡 Next Steps

1. ✅ Customize branding (colors, logo)
2. ✅ Add your real MTG inventory
3. ✅ Configure payment gateways (GCash/PayMaya)
4. ✅ Deploy to production
5. ✅ Set up custom domain

## 🎉 You're Ready!

Your complete MTG card trading platform is now running locally.

**Happy trading!** 🃏💰
