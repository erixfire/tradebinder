# TradeBinder API Documentation

Base URL: `https://tradebinder-api.your-subdomain.workers.dev/api`

All endpoints return JSON responses.

## Authentication

Protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Health Check

**GET** `/health`

Check API status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-26T15:00:00Z"
}
```

---

## Cards

### Search Cards

**GET** `/cards/search?q={query}&set={set}&rarity={rarity}`

Search for MTG cards.

**Query Parameters:**
- `q` (string): Card name search
- `set` (string, optional): Filter by set code
- `rarity` (string, optional): Filter by rarity
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Results per page (default: 20)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Lightning Bolt",
      "set_code": "LEA",
      "rarity": "common",
      "image_url": "https://..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

---

## Inventory

### Get Inventory

**GET** `/inventory`

Get current inventory with stock levels.

**Auth Required:** Yes

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "card_id": 1,
      "card_name": "Lightning Bolt",
      "condition": "NM",
      "quantity": 10,
      "sell_price": 100.00
    }
  ]
}
```

---

## Authentication

### Login

**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "customer"
  }
}
```

---

## Orders

### Create Order

**POST** `/orders`

Create a new order.

**Auth Required:** Yes

**Request Body:**
```json
{
  "items": [
    {
      "inventory_id": 1,
      "quantity": 2
    }
  ],
  "payment_method": "gcash",
  "shipping_address": {
    "address": "123 Main St",
    "city": "Iloilo City",
    "region": "Western Visayas"
  }
}
```

**Response:**
```json
{
  "order_id": 1,
  "order_number": "ORD-20260226-0001",
  "total": 200.00,
  "status": "pending"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

*More endpoints will be documented as features are implemented.*
