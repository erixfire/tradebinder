# Trading Engine API Documentation

## Overview
ManaVault PH Trading Engine supports:
- **P2P Trading**: User-to-user card trades with value balancing
- **Store Buy-Back**: Sell cards to the store for cash or credit
- **Escrow Service**: Secure trades with store verification
- **Payment Integration**: GCash/PayMaya via PayMongo/Xendit

## Database Schema

See `database/schema.sql` for complete schema.

Key tables:
- `trade_offers` - All trade transactions
- `trade_items` - Cards in each trade
- `store_credit_ledger` - Transaction history (audit trail)
- `trade_binder` - Public tradeable collections
- `wishlist` - Cards users want
- `buyback_config` - Store buyback rates

## API Endpoints

### Trade Binder

#### GET /api/trade-binder/:userId
Get a user's trade binder

**Response:**
```json
{
  "binder": [
    {
      "id": 123,
      "card_id": 456,
      "card_name": "Sheoldred, the Apocalypse",
      "condition": "NM",
      "quantity": 1,
      "market_price": 4500.00,
      "adjusted_value": 4500.00,
      "for_trade": true
    }
  ]
}
```

#### POST /api/trade-binder
Add card to trade binder

**Request:**
```json
{
  "card_id": 456,
  "condition": "NM",
  "quantity": 1,
  "minimum_value_php": 4000.00
}
```

### P2P Trading

#### POST /api/trades/create
Create a trade offer

**Request:**
```json
{
  "offer_type": "P2P",
  "to_user_id": 789,
  "offering": [
    {
      "card_id": 123,
      "condition": "NM",
      "market_price": 4500.00,
      "quantity": 1
    }
  ],
  "requesting": [
    {
      "card_id": 456,
      "condition": "LP",
      "market_price": 3200.00,
      "quantity": 1
    }
  ],
  "cash_topup_amount": 0,
  "escrow_enabled": false
}
```

**Response:**
```json
{
  "trade_offer_id": 1001,
  "status": "PENDING",
  "balance": {
    "offering_value": 4500.00,
    "requesting_value": 2880.00,
    "difference": -1620.00,
    "is_balanced": false,
    "cash_topup_required": 0
  }
}
```

#### POST /api/trades/:id/accept
Accept a trade offer

**Request:**
```json
{
  "payment_method": "GCASH",
  "payment_reference": "GC-12345678"
}
```

#### POST /api/trades/:id/counter
Make a counter-offer

**Request:**
```json
{
  "offering": [...],
  "requesting": [...]
}
```

### Store Buy-Back

#### POST /api/buyback/quote
Get buyback quote

**Request:**
```json
{
  "cards": [
    {
      "card_id": 123,
      "condition": "NM",
      "market_price": 4500.00,
      "quantity": 1
    }
  ],
  "payment_type": "STORE_CREDIT"
}
```

**Response:**
```json
{
  "total": 3150.00,
  "breakdown": [
    {
      "card_id": 123,
      "card_name": "Sheoldred, the Apocalypse",
      "condition": "NM",
      "market_price": 4500.00,
      "condition_multiplier": 1.00,
      "adjusted_value": 4500.00,
      "buyback_value": 3150.00,
      "buyback_percentage": 70.00
    }
  ]
}
```

#### POST /api/buyback/complete
Complete buyback transaction

**Request:**
```json
{
  "quote_id": "temp-12345",
  "payment_type": "STORE_CREDIT",
  "cards": [...]
}
```

**Response:**
```json
{
  "transaction_id": 5001,
  "amount": 3150.00,
  "payment_type": "STORE_CREDIT",
  "new_balance": 8150.00,
  "ledger_entry_id": 6001
}
```

### Store Credit Ledger

#### GET /api/store-credit/balance
Get current balance

**Response:**
```json
{
  "balance": 8150.00,
  "user_id": 123
}
```

#### GET /api/store-credit/history
Get transaction history

**Response:**
```json
{
  "transactions": [
    {
      "id": 6001,
      "transaction_type": "TRADE_IN",
      "amount": 3150.00,
      "balance_after": 8150.00,
      "reference_id": 5001,
      "reason": "Buyback: Sheoldred, the Apocalypse (NM)",
      "created_at": "2026-02-26T21:00:00Z"
    }
  ]
}
```

### Wishlist Matching

#### GET /api/trade-binder/matches
Find cards that match your wishlist

**Response:**
```json
{
  "matches": [
    {
      "wishlist_item_id": 789,
      "card_name": "The One Ring",
      "available_from": [
        {
          "user_id": 456,
          "username": "MTGTrader_Manila",
          "verified_trader": true,
          "rating": 4.8,
          "condition": "LP",
          "asking_price": 8100.00
        }
      ]
    }
  ]
}
```

### Payment Integration

#### POST /api/payments/create
Create payment for cash top-up

**Request:**
```json
{
  "trade_offer_id": 1001,
  "amount": 1620.00,
  "payment_method": "GCASH",
  "return_url": "https://app.manavault.ph/trades/1001"
}
```

**Response:**
```json
{
  "payment_id": 7001,
  "checkout_url": "https://paymongo.com/checkout/...",
  "status": "PENDING"
}
```

## Condition Multipliers

| Condition | Multiplier | Store Credit | Cash |
|-----------|------------|--------------|------|
| NM (Near Mint) | 100% | 70% | 60% |
| LP (Lightly Played) | 90% | 60% | 50% |
| MP (Moderately Played) | 75% | 45% | 35% |
| HP (Heavily Played) | 50% | 30% | 25% |
| DMG (Damaged) | 25% | 15% | 10% |

## Trade Value Calculation

```typescript
adjustedValue = marketPrice * conditionMultiplier
storeCreditValue = adjustedValue * storeCreditPercent
cashValue = adjustedValue * cashPercent
```

## Verified Trader Badge

Users earn "Verified Trader" status when:
- 10+ successful trades
- Average rating ≥ 4.0 stars
- No unresolved disputes

## Escrow Workflow

1. User A creates trade with `escrow_enabled: true`
2. User B accepts
3. Both users ship cards to store
4. Store verifies condition matches declared
5. Store forwards cards to recipients
6. Trade marked as `COMPLETED`

## WebSocket Events

Real-time trade updates:

```javascript
ws.on('trade.offer_received', (data) => {
  // New trade offer
});

ws.on('trade.accepted', (data) => {
  // Trade accepted
});

ws.on('payment.completed', (data) => {
  // Payment successful
});
```

## Error Codes

- `TRADE_001`: Insufficient inventory
- `TRADE_002`: User blocked
- `TRADE_003`: Value imbalance too large
- `PAYMENT_001`: Payment failed
- `PAYMENT_002`: Insufficient store credit
