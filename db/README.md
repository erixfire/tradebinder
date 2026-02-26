# TradeBinder Database

## Cloudflare D1 Database Setup

### Initial Setup

1. Create D1 database:
```bash
npm run db:create
```

2. Copy the database ID from output and update `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "tradebinder-db"
database_id = "YOUR_DATABASE_ID_HERE"
```

3. Run migrations (local development):
```bash
npm run db:migrate
```

4. Seed sample data:
```bash
npm run db:seed
```

5. Deploy to production:
```bash
npm run db:migrate:prod
```

## Database Schema

### Tables Overview

#### users
Stores user accounts (customers, staff, admins)
- Authentication via email/username + password hash
- Role-based access control
- Philippine phone number support

#### cards
MTG card master data synced from Scryfall API
- Unique identification via scryfall_id
- Price tracking (USD and PHP)
- Full card metadata

#### inventory
Stock management for physical cards
- Multiple conditions per card (NM, LP, MP, HP, DMG)
- Location tracking for warehouse management
- Real-time quantity updates

#### orders
Customer order management
- Unique order numbers
- Multiple statuses and payment tracking
- Philippine shipping address format

#### order_items
Line items for each order
- Links to inventory for stock deduction
- Price at time of purchase

#### wishlists
Customer wish lists with price alerts
- Max price notifications
- Unique constraint per user-card pair

#### collections
User's personal card collections
- Track owned cards separately from store inventory
- Acquisition price tracking

#### sessions
JWT session management
- Token validation
- IP and user agent tracking
- Automatic expiration

#### audit_logs
Complete audit trail
- All critical operations logged
- Before/after values for changes
- User and timestamp tracking

## Indexes

Optimized indexes for:
- Fast card name search
- User email/username lookup
- Order history queries
- Inventory availability checks
- Session token validation

## Performance Notes

- Card search: <100ms via indexed name lookup
- User auth: <50ms via indexed email/username
- Order history: <200ms via indexed user_id + created_at
- Inventory check: <50ms via indexed card_id + quantity

## Migration Management

Migrations are in `db/migrations/` with numbered prefixes:
- `0001_initial_schema.sql` - Base schema
- Future migrations: `0002_add_feature.sql`, etc.

Always test locally before production deployment.
