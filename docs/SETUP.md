# TradeBinder Setup Guide

## Initial Setup

### 1. Install Dependencies

```bash
cd tradebinder
npm install
```

### 2. Configure Cloudflare

#### Login to Cloudflare
```bash
npx wrangler login
```

#### Create D1 Database
```bash
npx wrangler d1 create tradebinder-db
```

Copy the `database_id` from output and update `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "tradebinder-db"
database_id = "<paste-database-id-here>"
```

#### Create KV Namespace
```bash
npx wrangler kv:namespace create CACHE
```

Copy the `id` from output and update `wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "CACHE"
id = "<paste-kv-id-here>"
```

### 3. Generate JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Update `wrangler.toml`:
```toml
[vars]
JWT_SECRET = "<paste-generated-secret-here>"
```

### 4. Initialize Database

```bash
# Run migrations locally
npm run db:migrate

# Seed with sample data (optional)
npm run db:seed
```

### 5. Start Development Servers

```bash
# Terminal 1: Frontend (Vite)
npm run dev

# Terminal 2: Backend (Workers)
npm run worker:dev
```

- Frontend: http://localhost:5173
- API: http://localhost:8787

## Deployment

### 1. Build Frontend

```bash
npm run build
```

### 2. Deploy to Cloudflare Pages

#### Option A: Using Wrangler
```bash
npm run deploy
```

#### Option B: Connect GitHub Repository
1. Go to Cloudflare Dashboard → Pages
2. Click "Create a project"
3. Connect to GitHub → Select `tradebinder` repo
4. Build settings:
   - Build command: `npm run build`
   - Build output: `dist`
   - Framework preset: Vite

### 3. Deploy Workers API

```bash
npm run worker:deploy
```

### 4. Run Remote Database Migrations

```bash
npm run db:migrate:remote
```

### 5. Configure Custom Domain (Optional)

1. Cloudflare Dashboard → Pages → Your project
2. Custom domains → Add custom domain
3. Follow DNS setup instructions

## Environment Variables

### Development (.dev.vars)

Create `.dev.vars` file in root:
```
JWT_SECRET=your-dev-secret
ENVIRONMENT=development
```

### Production

Set in Cloudflare Dashboard:
1. Workers & Pages → tradebinder-api → Settings → Variables
2. Add:
   - `JWT_SECRET` (secret)
   - `ENVIRONMENT` = "production"

## Troubleshooting

### Database Connection Issues
```bash
# Check D1 database status
npx wrangler d1 info tradebinder-db

# Execute SQL directly
npx wrangler d1 execute tradebinder-db --local --command "SELECT * FROM cards LIMIT 5"
```

### Worker Deployment Fails
```bash
# Check wrangler configuration
npx wrangler whoami

# View deployment logs
npx wrangler tail tradebinder-api
```

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
```

## Next Steps

1. Review [SYSTEM_DESIGN_PROMPT.md](../SYSTEM_DESIGN_PROMPT.md)
2. Implement authentication system
3. Build inventory management features
4. Integrate Scryfall API
5. Create POS interface
6. Add payment gateway integration

## Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [D1 Database Docs](https://developers.cloudflare.com/d1/)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
