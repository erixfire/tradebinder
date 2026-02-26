#!/bin/bash

# TradeBinder Cloudflare Setup Script
# Automates D1 and KV namespace creation

set -e  # Exit on error

echo "🚀 TradeBinder Cloudflare Setup"
echo "================================"
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Check if logged in
echo "📝 Checking Cloudflare authentication..."
if ! npx wrangler whoami &> /dev/null; then
    echo "🔐 Please login to Cloudflare:"
    npx wrangler login
fi

echo "✅ Authenticated successfully"
echo ""

# Backup current wrangler.toml
echo "💾 Backing up wrangler.toml..."
cp wrangler.toml wrangler.toml.backup

# Create temporary minimal config for D1 creation
cat > wrangler.toml.temp << 'EOF'
name = "tradebinder-api"
main = "worker/index.ts"
compatibility_date = "2026-02-26"

[[d1_databases]]
binding = "DB"
database_name = "tradebinder-db"
database_id = ""
EOF

cp wrangler.toml.temp wrangler.toml

# Create D1 Database
echo "📦 Creating D1 Database..."
D1_OUTPUT=$(npx wrangler d1 create tradebinder-db 2>&1)
echo "$D1_OUTPUT"

# Extract database_id using grep and sed
DATABASE_ID=$(echo "$D1_OUTPUT" | grep -o 'database_id = "[^"]*"' | sed 's/database_id = "\(.*\)"/\1/' | head -1)

if [ -z "$DATABASE_ID" ]; then
    echo "❌ Failed to extract database_id. Please create manually."
    mv wrangler.toml.backup wrangler.toml
    rm -f wrangler.toml.temp
    exit 1
fi

echo "✅ D1 Database created: $DATABASE_ID"
echo ""

# Create KV Namespace
echo "📦 Creating KV Namespace..."
KV_OUTPUT=$(npx wrangler kv:namespace create "TRADEBINDER-CACHE" 2>&1)
echo "$KV_OUTPUT"

# Extract KV id
KV_ID=$(echo "$KV_OUTPUT" | grep -o 'id = "[^"]*"' | sed 's/id = "\(.*\)"/\1/' | head -1)

if [ -z "$KV_ID" ]; then
    echo "❌ Failed to extract KV namespace id. Please create manually."
    mv wrangler.toml.backup wrangler.toml
    rm -f wrangler.toml.temp
    exit 1
fi

echo "✅ KV Namespace created: $KV_ID"
echo ""

# Generate final wrangler.toml with real IDs
echo "⚙️  Generating final wrangler.toml..."

cat > wrangler.toml << EOF
name = "tradebinder-api"
main = "worker/index.ts"
compatibility_date = "2026-02-26"

# ============================================
# CLOUDFLARE D1 DATABASE
# ============================================
[[d1_databases]]
binding = "DB"
database_name = "tradebinder-db"
database_id = "$DATABASE_ID"  # Auto-configured ✅

# ============================================
# CLOUDFLARE KV CACHE
# ============================================
[[kv_namespaces]]
binding = "CACHE"
id = "$KV_ID"  # Auto-configured ✅

# ============================================
# ENVIRONMENT VARIABLES
# ============================================
[vars]
ENVIRONMENT = "development"
JWT_SECRET = "65de7410be32309fba0e6ad8df62be4aa33d639e7a7ea40394a80bf375730e6f"  # Change for production!
SCRYFALL_API_URL = "https://api.scryfall.com"
EOF

rm -f wrangler.toml.temp wrangler.toml.backup

echo "✅ Configuration complete!"
echo ""
echo "📋 Summary:"
echo "   D1 Database ID: $DATABASE_ID"
echo "   KV Namespace ID: $KV_ID"
echo ""
echo "🎯 Next steps:"
echo "   1. npm run db:migrate       # Initialize database"
echo "   2. npm run db:seed          # Add sample data (optional)"
echo "   3. npm run worker:dev       # Start backend API"
echo "   4. npm run dev              # Start frontend (new terminal)"
echo ""
echo "🌐 Access your app:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:8787"
echo ""
echo "✨ Setup complete! Happy coding!"
