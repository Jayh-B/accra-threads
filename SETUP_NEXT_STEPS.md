# Accra Threads - Setup & Next Steps Guide

## 🚀 IMMEDIATE STEPS TO GET RUNNING

### Step 1: Apply Database Schemas to Supabase

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Create a **New Query** for each file below
4. Copy-paste and run each one:

```sql
-- File 1: scripts/supply-chain-schema.sql
-- Run this first - creates supply chain tables

-- File 2: scripts/inventory-rpc.sql  
-- Run this second - creates inventory functions

-- File 3: scripts/order-schema-update.sql
-- Run this third - updates orders table
```

#### Option B: Using psql CLI

```bash
# Set your database URL
export DATABASE_URL="postgresql://postgres:[password]@[host]:[port]/postgres"

# Run the scripts
psql $DATABASE_URL -f scripts/supply-chain-schema.sql
psql $DATABASE_URL -f scripts/inventory-rpc.sql
psql $DATABASE_URL -f scripts/order-schema-update.sql
```

---

### Step 2: Verify Environment Variables

Create `.env.local` in project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Payment Integration (for production)
# PAYSTACK_PUBLIC_KEY=pk_test_...
# PAYSTACK_SECRET_KEY=sk_test_...
```

Get keys from: Supabase Dashboard → Project Settings → API

---

### Step 3: Start Development Server

```bash
npm run dev
```

Access at:
- Store: http://localhost:3000
- Admin: http://localhost:3000/admin

---

### Step 4: Create Admin User

1. Sign up at `/login` 
2. Run SQL to make yourself admin:

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

---

### Step 5: Test the Complete Flow

#### A. Add Sample Inventory
```sql
-- Add stock for existing products
INSERT INTO inventory (product_id, location_type, quantity, reorder_point)
SELECT id, 'warehouse', 100, 10
FROM products 
WHERE published = true
ON CONFLICT DO NOTHING;
```

#### B. Test Customer Flow
1. Browse `/shop` - view products
2. Add items to cart
3. Checkout at `/checkout`
4. Place order → creates order + reserves inventory
5. Check `/account` - view order history
6. Track order at `/orders/AT-2025-XXXX/track`

#### C. Test Admin Flow
1. View `/admin/supply-chain` - dashboard
2. Check `/admin/supply-chain/inventory` - stock levels
3. Create PO at `/admin/supply-chain/purchase-orders`
4. View orders at `/admin/orders`

---

## 🧪 TESTING CHECKLIST

### Web Selling
- [ ] Browse products by category
- [ ] Search products
- [ ] Add to cart
- [ ] Checkout with address
- [ ] Pay with MoMo (mock)
- [ ] Receive order confirmation
- [ ] Track order

### CRM
- [ ] Register account
- [ ] View order history
- [ ] Check Cowrie Points
- [ ] Submit support ticket

### Finance
- [ ] Order includes 15% VAT
- [ ] Admin finance shows revenue
- [ ] Tax transactions listed

### Ordering System
- [ ] Product CRUD works
- [ ] Inventory updates on order
- [ ] Low stock alerts show
- [ ] Purchase orders create
- [ ] Delivery tracking works

### Supply Chain
- [ ] Suppliers visible
- [ ] Partners listed
- [ ] Marketplace listings work
- [ ] Stock movements tracked

---

## 🔧 COMMON ISSUES & FIXES

### Issue: "Failed to create order" error
**Fix**: Check inventory exists:
```sql
SELECT * FROM inventory WHERE product_id = 'your-product-id';
-- If empty, run Step 5A above
```

### Issue: "reserve_inventory" function not found
**Fix**: Re-run inventory-rpc.sql:
```bash
psql $DATABASE_URL -f scripts/inventory-rpc.sql
```

### Issue: Tables don't exist
**Fix**: Re-run all schemas in order:
1. supply-chain-schema.sql
2. inventory-rpc.sql  
3. order-schema-update.sql

### Issue: Admin pages not accessible
**Fix**: Check user role:
```sql
SELECT email, role FROM users;
-- Update if needed: UPDATE users SET role = 'admin' WHERE email = '...';
```

---

## 🚀 PRODUCTION DEPLOYMENT

### 1. Environment Setup
```bash
# Production env
NEXT_PUBLIC_SUPABASE_URL=https://your-proj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Payment (Paystack)
PAYSTACK_PUBLIC_KEY=pk_live_...
PAYSTACK_SECRET_KEY=sk_live_...

# Email (Resend/SendGrid)
RESEND_API_KEY=re_...
FROM_EMAIL=orders@accrathreads.com
```

### 2. Build & Deploy
```bash
npm run build
# Deploy to Vercel/Netlify/Railway
```

### 3. Post-Deploy
- [ ] Run migrations on production DB
- [ ] Create first admin user
- [ ] Upload product images to Supabase Storage
- [ ] Configure domain/DNS
- [ ] Set up SSL

---

## 🎯 ENHANCEMENT ROADMAP

### Phase 1 (Immediate)
- [ ] Email notifications (order confirmation, shipping)
- [ ] Paystack/MoMo integration
- [ ] Product image upload
- [ ] Order status SMS notifications

### Phase 2 (Short-term)
- [ ] Advanced analytics dashboard
- [ ] Inventory forecasting
- [ ] Supplier portal login
- [ ] Partner API integration (Jumia, Amazon)
- [ ] Returns & refunds workflow

### Phase 3 (Long-term)
- [ ] Mobile app (React Native)
- [ ] AI demand forecasting
- [ ] Multi-currency support
- [ ] International shipping
- [ ] Dropshipping integration

---

## 📞 SUPPORT

### Files Reference
- `INTEGRATED_SYSTEM_GUIDE.md` - Full system documentation
- `scripts/*.sql` - Database schemas
- `src/lib/*-data.ts` - Data layer functions
- `src/lib/*-actions.ts` - Server actions

### Need Help?
1. Check Supabase logs for SQL errors
2. Verify environment variables
3. Check browser console for frontend errors
4. Review `TODO.md` for known issues

---

## ✅ VERIFICATION SCRIPT

Run this SQL to verify everything is set up:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('suppliers', 'partners', 'inventory', 'purchase_orders', 'deliveries', 'marketplace_listings');

-- Check functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('reserve_inventory', 'release_inventory', 'fulfill_order', 'receive_inventory');

-- Check sample data
SELECT COUNT(*) as suppliers FROM suppliers;
SELECT COUNT(*) as partners FROM partners;
```

Should return: 7 tables, 4 functions, 4 suppliers, 4 partners
