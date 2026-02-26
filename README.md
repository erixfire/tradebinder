# TradeBinder

An online e-commerce platform for Magic: The Gathering card trading and sales in the Philippines.

## Tech Stack

- **Frontend:** React + Vite + TypeScript
- **Backend:** Cloudflare Workers
- **Database:** Cloudflare D1 (SQLite)
- **Deployment:** Cloudflare Pages
- **State Management:** Zustand

## Project Structure

```
tradebinder/
├── src/                    # React frontend source
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom hooks
│   ├── store/             # Zustand state management
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript types
│   ├── App.tsx            # Main app component
│   └── main.tsx           # Entry point
├── worker/                 # Cloudflare Workers API
│   ├── index.ts           # Worker entry point
│   ├── routes/            # API route handlers
│   ├── middleware/        # Auth, CORS, etc.
│   └── utils/             # Helper functions
├── db/                     # Database files
│   ├── schema.sql         # D1 database schema
│   └── seed.sql           # Seed data
├── public/                 # Static assets
└── docs/                   # Documentation
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Cloudflare account
- Wrangler CLI

### Installation

```bash
# Install dependencies
npm install

# Login to Cloudflare
npx wrangler login

# Create D1 database
npx wrangler d1 create tradebinder-db

# Update wrangler.toml with database_id from above command

# Create KV namespace for caching
npx wrangler kv:namespace create CACHE

# Update wrangler.toml with KV namespace id

# Run database migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed
```

### Development

```bash
# Start Vite dev server (frontend)
npm run dev

# In another terminal, start Workers dev server (API)
npm run worker:dev
```

Frontend: http://localhost:5173
API: http://localhost:8787

### Deployment

```bash
# Build frontend
npm run build

# Deploy to Cloudflare Pages
npm run deploy

# Deploy Workers API
npm run worker:deploy

# Run remote database migrations
npm run db:migrate:remote
```

## Features

- 🃏 **Inventory Management** - Add, update, and track MTG card inventory
- 📥 **CSV Import** - Bulk import from ManaBox exports (NEW!)
- 🛒 **POS System** - Quick search and checkout for in-store sales
- 👤 **Customer Portal** - User accounts, order history, wishlists
- 🔐 **Authentication** - JWT-based auth with role-based access
- 🔍 **Advanced Search** - Filter by name, set, rarity, condition, price
- 📊 **Reporting** - Sales analytics and inventory insights
- 💳 **Payment Integration** - PayMaya, GCash, PayPal support
- 📱 **Mobile Responsive** - Optimized for Philippine mobile users

## CSV Import

Bulk import your MTG card collection from ManaBox:

1. Export your collection from ManaBox as CSV
2. Login as admin/staff
3. Navigate to **Dashboard → Import CSV**
4. Upload your CSV file
5. Review import results

**Supported columns:** Name, Set code, Scryfall ID, Quantity, Condition, Purchase price, Language, and more.

See [CSV_IMPORT_GUIDE.md](./docs/CSV_IMPORT_GUIDE.md) for detailed instructions.

## API Endpoints

See [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md) for detailed endpoint specifications.

### New Endpoint

- `POST /api/inventory/import` - Bulk import inventory from CSV (admin/staff only)

## Database Schema

See [db/schema.sql](./db/schema.sql) for complete D1 database structure.

## Contributing

1. Create a feature branch
2. Make your changes
3. Test locally
4. Submit a pull request

## License

Private - All rights reserved

## Contact

For questions or issues, contact: erix.due@gmail.com
