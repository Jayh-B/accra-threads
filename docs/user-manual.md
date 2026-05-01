# Accra Threads - User Manual

## Table of Contents
1. [Admin Guide](#admin-guide)
2. [Customer Guide](#customer-guide)
3. [Technical Documentation](#technical-documentation)

---

# Admin Guide

## 1. Managing Products

### Adding a New Product
1. Navigate to **Admin > Products > Add New**
2. Fill in product details:
   - Name, SKU, Category
   - Price and Sale Price (optional)
   - Description and Tags
   - Gender (Men/Women/Unisex)
3. Upload product images (up to 5 images)
4. Add color variants with hex codes
5. Add size variants with stock quantities
6. Set featured/published status
7. Click **Save Product**

### Editing Products
1. Go to **Admin > Products > All Products**
2. Search or filter to find the product
3. Click the product name to edit
4. Update fields as needed
5. Click **Save Changes**

### Managing Inventory
1. Navigate to **Admin > Supply Chain > Inventory**
2. View current stock levels
3. Low stock items are highlighted in red
4. Click **Reorder** to create purchase order
5. Update quantities after receiving stock

## 2. Processing Orders

### Viewing Orders
1. Go to **Admin > Orders > All Orders**
2. Use tabs to filter by status:
   - Pending (awaiting confirmation)
   - Processing (being prepared)
   - Shipped (in transit)
   - Delivered (completed)

### Processing an Order
1. Click on order to view details
2. Review items and customer information
3. Click **Confirm Order** to accept
4. Click **Mark Processing** when preparing
5. Add tracking information when shipping
6. Click **Mark Delivered** when completed

### Order Status Flow
```
pending → confirmed → processing → shipped → delivered
                ↓
            cancelled (if needed)
```

## 3. Managing Inventory

### Current Stock View
- Navigate to **Admin > Supply Chain > Inventory**
- View all products with current quantities
- Filter by location (warehouse, store)
- Search by product name or SKU

### Stock Movements
- Click **View History** on any product
- See all stock changes with dates
- Track reason for each movement

### Reorder Points
- Products below reorder point show alert
- Click **Create PO** to order more
- System suggests quantity based on sales velocity

## 4. Finance Reports

### Dashboard Overview
1. Go to **Admin > Finance > Overview**
2. View key metrics:
   - Total Revenue
   - Orders Count
   - Average Order Value
   - VAT Collected

### Sales Reports
1. Navigate to **Admin > Finance > Reports**
2. Select date range
3. Choose report type:
   - Sales Summary
   - Product Performance
   - Category Breakdown
   - Payment Methods
4. Click **Generate Report**
5. Export to CSV or PDF

### VAT Compliance
- VAT is automatically calculated at 15%
- View VAT collected by period
- Export for tax filing

## 5. Managing Suppliers/Partners

### Suppliers
1. Go to **Admin > Supply Chain > Suppliers**
2. View all suppliers
3. Click **Add Supplier** for new ones
4. Edit supplier details:
   - Contact information
   - Payment terms
   - Lead times
   - Product catalog

### Purchase Orders
1. Navigate to **Admin > Supply Chain > Purchase Orders**
2. Click **Create PO**
3. Select supplier
4. Add items and quantities
5. Submit to supplier
6. Track PO status

## 6. Customer Management

### Viewing Customers
1. Go to **Admin > Customers > All Customers**
2. Search by name or email
3. Filter by order history
4. View customer 360 profile

### Customer Timeline
1. Click on customer name
2. View complete timeline:
   - All orders
   - Communications
   - Support tickets
   - Feedback
3. Filter by event type

### Sending Communications
1. Open customer detail page
2. Go to **Communications** tab
3. Click **Send Message**
4. Choose type: Email, SMS, or Call
5. Select template or compose message
6. Preview and send

### Adding Notes
1. Go to **Notes** tab
2. Click **Add Note**
3. Select category (VIP, Complaint, Follow-up)
4. Write note content
5. Save note (internal only)

## 7. Support Tickets

### Viewing Tickets
1. Navigate to **Admin > Support > Tickets**
2. Tickets sorted by priority
3. Filter by status (open, pending, resolved)

### Responding to Tickets
1. Click on ticket to open
2. View customer message
3. Write response
4. Update status as needed
5. Assign to team member if required

---

# Customer Guide

## 1. Creating an Account

### Registration
1. Click **Join Free** or navigate to `/login?mode=register`
2. Enter your email address
3. Create a password (minimum 8 characters)
4. Enter your full name
5. Click **Create Account**
6. Verify email if required

### Profile Setup
1. Log in to your account
2. Go to **Account > Profile**
3. Add phone number
4. Add delivery addresses
5. Set preferences

## 2. Browsing and Purchasing

### Finding Products
1. Browse by category using top navigation
2. Use search bar for specific items
3. Apply filters (price, size, color)
4. Sort by price, popularity, or newest

### Product Details
1. Click product image to view details
2. See available sizes and colors
3. Check stock availability
4. Read customer reviews
5. View size guide

### Adding to Cart
1. Select size (required)
2. Select color
3. Adjust quantity
4. Click **Add to Cart**
5. Continue shopping or view cart

### Shopping Cart
1. Click cart icon to view items
2. Adjust quantities
3. Remove items if needed
4. Apply promo code
5. Click **Proceed to Checkout**

## 3. Checkout Process

### Delivery Information
1. Enter or select delivery address
2. Confirm contact details
3. Select delivery method:
   - Standard (1-2 days, Accra)
   - Express (same day, Accra)
   - Nationwide (2-5 days)

### Payment
1. Choose payment method:
   - Mobile Money (MTN, Vodafone, AirtelTigo)
   - Card Payment (Visa, Mastercard)
2. Enter payment details
3. Review order summary
4. Click **Pay Now**

### Order Confirmation
1. View order confirmation page
2. Order number displayed
3. Email confirmation sent
4. Track order in account

## 4. Tracking Orders

### Viewing Orders
1. Log in to account
2. Go to **My Orders**
3. See all orders with status
4. Click order for details

### Order Status Meanings
- **Pending**: Order received, awaiting confirmation
- **Confirmed**: Order accepted, preparing items
- **Processing**: Items being packed
- **Shipped**: In transit with courier
- **Delivered**: Successfully delivered
- **Cancelled**: Order cancelled

### Tracking Information
1. Open order details
2. View tracking number
3. Click tracking link
4. See real-time location

## 5. Downloading Invoices

### From Account
1. Go to **My Orders**
2. Find completed order
3. Click **Download Invoice**
4. PDF opens in new tab
5. Save or print

### From Email
1. Open order confirmation email
2. Click **View Invoice** link
3. Download PDF

## 6. Leaving Feedback

### After Purchase
1. Receive feedback request email (7 days after delivery)
2. Click feedback link
3. Rate your experience
4. Rate product quality
5. Rate delivery
6. Write review
7. Submit feedback

### Benefits
- Earn Cowrie Points
- Get 10% discount code
- Help other customers

---

# Technical Documentation

## System Architecture

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Styling**: CSS Modules + Global CSS
- **State**: React Context (Cart, Wishlist, Auth)
- **UI Components**: Custom components

### Backend
- **API**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage (images)

### Third-Party Services
- **Payments**: Paystack (Ghana)
- **Email**: SendGrid/Resend
- **SMS**: Twilio or Africa's Talking

## Database Schema

### Core Tables
```
- products: Product catalog
- orders: Customer orders
- order_items: Line items
- users: Customer profiles
- inventory: Stock tracking
- suppliers: Supplier information
- purchase_orders: PO management
- customer_communications: CRM messages
- customer_feedback: Reviews/ratings
- invoices: Billing records
```

### Key Relationships
```
orders → users (customer)
orders → order_items → products
purchase_orders → suppliers
inventory → products
```

## API Endpoints

### Public APIs
```
GET /api/products - List products
GET /api/products/[slug] - Product details
POST /api/orders - Create order
GET /api/orders/[id] - Order status
```

### Admin APIs
```
GET /api/admin/orders - List all orders
PUT /api/admin/orders/[id] - Update order
GET /api/admin/customers - List customers
POST /api/admin/communications - Send message
```

### Authentication
```
POST /auth/login - User login
POST /auth/register - Registration
POST /auth/logout - Logout
```

## Integration Points

### Payment Integration
```javascript
// Paystack initialization
const response = await paystack.initialize({
  email: customer.email,
  amount: order.total * 100, // in pesewas
  currency: 'GHS',
  callback_url: '/payment/verify'
});
```

### Email Triggers
- Order confirmation → Immediate
- Shipping update → On shipment
- Delivery confirmation → On delivery
- Feedback request → 7 days after delivery
- Abandoned cart → 24 hours after

### Inventory Webhooks
- Stock update triggers search reindex
- Low stock triggers admin alert
- PO receipt updates availability

## Security Measures

### Authentication
- JWT tokens with refresh
- Row Level Security (RLS) on all tables
- Role-based access control

### Data Protection
- PII encrypted at rest
- HTTPS everywhere
- PCI DSS compliance for payments

### Admin Access
- Two-factor authentication (optional)
- IP whitelisting capability
- Activity logging

## Deployment

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PAYSTACK_SECRET_KEY=
RESEND_API_KEY=
```

### Build Process
```bash
npm install
npm run build
# Deploy to Vercel/Railway/Netlify
```

### Database Migrations
```bash
# Run all schema files in order
psql $DATABASE_URL -f scripts/create-schema.sql
psql $DATABASE_URL -f scripts/supply-chain-schema.sql
psql $DATABASE_URL -f scripts/crm-schema.sql
```

## Monitoring & Logging

### Error Tracking
- Console errors logged to service
- API error responses tracked
- Failed payment attempts monitored

### Performance Monitoring
- Page load times
- API response times
- Database query performance

### Business Metrics
- Orders per day
- Revenue trends
- Customer acquisition
- Cart abandonment rate

## Troubleshooting

### Common Issues
1. **Images not loading**
   - Check Supabase storage bucket permissions
   - Verify image URLs in database

2. **Orders not creating**
   - Check inventory exists for products
   - Verify RLS policies allow inserts

3. **Emails not sending**
   - Verify API keys configured
   - Check email template validity

4. **Payment failures**
   - Check Paystack keys
   - Verify webhook endpoints

### Support Contacts
- Technical: dev@accrathreads.com
- Business: admin@accrathreads.com
- Emergencies: +233-XX-XXX-XXXX
