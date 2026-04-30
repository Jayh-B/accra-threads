-- ============================================================================
-- Quick verification and fix for orders not showing in admin
-- ============================================================================

-- Check if orders exist
SELECT COUNT(*) as total_orders FROM orders;

-- Check recent orders
SELECT id, order_number, status, payment_status, created_at, customer_email 
FROM orders 
ORDER BY created_at DESC 
LIMIT 10;

-- Check if RLS is enabled
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname = 'orders';

-- Check RLS policies
SELECT polname, polcmd, polpermissive 
FROM pg_policies 
WHERE tablename = 'orders';
