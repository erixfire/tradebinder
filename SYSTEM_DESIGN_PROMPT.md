# TradeBinder System Design Specification

## Project Context
Building an online TradeBinder application - an e-commerce platform for Magic: The Gathering card trading and sales in the Philippines, deployed on Cloudflare Pages with D1 database backend.

## Technical Stack (Fixed Requirements)
- **Frontend:** React/Vite SPA deployed on Cloudflare Pages
- **Backend:** Cloudflare Workers for serverless API
- **Database:** Cloudflare D1 (SQLite-compatible)
- **Deployment:** Cloudflare ecosystem (Pages, Workers, D1)
- **Version Control:** GitHub repository at erixfire/tradebinder

---

## Core Features to Design

### 1. Inventory Management
- Add/update/remove MTG cards
- Bulk imports from CSV/Scryfall API
- Price tracking and updates
- Stock levels and reorder alerts
- Card condition tracking (NM, LP, MP, HP, Damaged)
- Multi-language support (English/Tagalog)

### 2. POS System
- Lightning-fast card search (<100ms)
- Shopping cart management
- Payment processing integration
- Receipt generation (digital/printable)
- Quick-add for common transactions
- Barcode/QR scanning support

### 3. Customer Portal
- User registration and authentication
- Order history and tracking
- Wishlist functionality
- Personal collection tracking
- Trade-in requests
- Notification system

### 4. Authentication
- LDAP integration option for admin users
- Local JWT-based authentication for customers
- Role-based access control (Admin, Staff, Customer)
- Session management with Cloudflare Workers
- Secure password hashing

### 5. Search & Filtering
- Real-time card name search
- Filter by: set, rarity, price range, condition, availability
- Advanced search: color, type, mana cost, artist
- Saved search preferences
- Recently viewed cards

### 6. Reporting & Analytics
- Sales analytics dashboard
- Inventory reports (stock levels, valuation)
- Customer insights (top buyers, spending patterns)
- Popular cards tracking
- Revenue reports by period

---

## Technical Requirements

### Security
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS protection
- CSRF tokens for state-changing operations
- Secure authentication with JWT
- Rate limiting on API endpoints
- Content Security Policy headers

### Performance
- Card search response time: <100ms
- Page load time: <2s on 3G connection
- Optimized image loading (lazy loading, WebP format)
- Cloudflare CDN caching strategy
- D1 database indexing for fast queries
- Worker KV for frequently accessed data

### Data Model Requirements
- Entity-relationship diagram for:
  - Cards (with Scryfall data integration)
  - Customers
  - Orders and order items
  - Transactions
  - Inventory movements
  - Wishlists
- Proper normalization (3NF minimum)
- Strategic indexes for performance
- Audit trail for critical operations

### API Design
- RESTful endpoints with proper HTTP methods
- Consistent error handling and status codes
- Pagination for list endpoints
- API versioning strategy
- Request/response validation
- CORS configuration for Cloudflare Workers

### Integration Points
- **Scryfall API:** Card data sync, pricing updates, images
- **Payment Gateways:** PayMaya, GCash, PayPal for Philippine market
- **Shipping:** Philippine postal service integration
- **Email:** Transactional emails (order confirmations, receipts)

---

## Deliverables Requested

### 1. Database Schema
- Complete D1 SQL schema with CREATE TABLE statements
- Relationships and foreign keys
- Indexes for search optimization
- Migration scripts structure
- Sample seed data

### 2. API Endpoint Specifications
```
Format for each endpoint:
- Route path
- HTTP method
- Authentication required (Y/N)
- Request parameters/body
- Response format (success/error)
- Status codes
- Example requests/responses
```

### 3. React Frontend Architecture
- Component hierarchy tree
- Page routing structure
- Shared components library
- Layout components
- Feature-specific components
- Props and state flow

### 4. State Management
- Recommend approach: Context API, Zustand, or alternative
- Global state structure
- Local vs global state decisions
- Caching strategy for API responses
- Optimistic updates pattern

### 5. Authentication Flow
- User registration flow
- Login/logout process
- Token refresh mechanism
- Protected route handling
- Role-based component rendering

### 6. Cloudflare Deployment Architecture
```
Diagram should include:
- Cloudflare Pages (React app)
- Cloudflare Workers (API routes)
- D1 Database connections
- Worker KV for caching
- CDN/edge caching
- External API integrations
```

### 7. Development Roadmap

**MVP (Phase 1 - 4 weeks)**
- Core features list
- Essential endpoints
- Basic UI components

**Phase 2 (Weeks 5-8)**
- Enhanced features
- Reporting dashboards
- Advanced search

**Phase 3 (Weeks 9-12)**
- Integrations
- Mobile optimization
- Performance tuning

**Future Enhancements**
- Mobile app (React Native)
- Advanced analytics
- AI-powered pricing suggestions
- Multi-store support

---

## Output Format Requirements

### Structured Sections
1. **Database Schema:** Full SQL with comments explaining design decisions
2. **API Documentation:** OpenAPI/Swagger-style specification
3. **Component Structure:** Tree diagram with descriptions
4. **Architecture Diagrams:** Text-based descriptions (ASCII or Mermaid syntax)
5. **Code Examples:** TypeScript/JavaScript snippets for key implementations
6. **Decision Rationale:** Pros/cons for major technical choices

### Technical Considerations
- **Cloudflare D1 Limits:** Max database size, query performance characteristics
- **Cloudflare Workers Limits:** CPU time, memory, KV storage limits
- **Scalability:** Handling growth from 100 to 10,000+ cards
- **Cost Optimization:** Efficient use of Cloudflare resources
- **Edge Computing:** Leveraging Cloudflare's global network
- **Offline Capability:** Service Worker for POS reliability

### Philippine Market Specific
- Peso (PHP) currency handling
- Local payment methods integration
- Philippine address format
- Shipping zones (Luzon, Visayas, Mindanao)
- Tax compliance (VAT)
- Mobile-first design (high mobile usage in PH)

---

## Success Criteria
- Database schema supports all features with optimal performance
- API design is RESTful, secure, and well-documented
- React architecture is modular and maintainable
- Authentication is secure and user-friendly
- Deployment leverages Cloudflare's edge network effectively
- System can handle 1000+ concurrent users
- Card search returns results in <100ms
- Mobile responsive on all screen sizes

---

## Keywords
MTG card database, Cloudflare Pages deployment, D1 database design, Cloudflare Workers API, React Vite architecture, inventory management system, POS design, e-commerce platform, edge computing, serverless architecture, JWT authentication, Scryfall integration, Philippine e-commerce, database normalization, API design patterns

---

## Next Steps
1. Review this specification
2. Generate detailed technical design
3. Create initial database migrations
4. Scaffold React project structure
5. Set up Cloudflare Workers API routes
6. Implement authentication system
7. Build core inventory features
8. Integrate Scryfall API
9. Develop POS interface
10. Deploy MVP to Cloudflare Pages
