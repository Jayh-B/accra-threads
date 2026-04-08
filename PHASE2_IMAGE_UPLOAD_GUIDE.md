# Phase 2: Image Upload Guide

## Overview
This guide walks you through uploading all 39 product images to Supabase Storage using the automated script.

## Prerequisites
✅ `@supabase/supabase-js` already installed  
✅ 39 product images in `/Product Images` folder  
❌ Need: Supabase Storage bucket + Service Role Key

---

## Step 1: Create Storage Bucket in Supabase

1. Go to your **Supabase Dashboard** → **Storage**
2. Click **Create Bucket**
3. Bucket name: `products`
4. Set to **Public** (required for public image URLs)
5. Click **Create Bucket**

---

## Step 2: Get Service Role Key

1. Go to **Settings** → **API Keys** (or **Project Settings** → **API**)
2. Under **Project API keys**, copy the **service_role** (SECRET) key
3. ⚠️ **IMPORTANT**: This is secret! Never commit to git.

---

## Step 3: Update `.env.local`

Your `.env.local` should now have ALL these keys:

```env
# Public (safe in repo after Next.js build)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Private (server-side only)
SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Get values from Supabase: **Settings** → **API**

---

## Step 4: Install TypeScript & Node Types (if not already done)

```bash
npm install --save-dev tsx ts-node @types/node
```

---

## Step 5: Run the Upload Script

```bash
npx tsx scripts/upload-images.ts
```

**Expected output:**
```
Found 39 images to upload...
✅ Uploaded Accra HEAT Oversized Hoodie.jpg → accra-heat-oversized-hoodie
✅ Uploaded Accra Slide (Women's).jpg → accra-slide-womens
... (37 more)

✅ Upload Complete: 39/39 successful

📊 Image URL Mapping (for DB update):
[
  {
    "slug": "accra-heat-oversized-hoodie",
    "imageUrl": "https://YOUR-PROJECT.supabase.co/storage/v1/object/public/products/accra-heat-oversized-hoodie/...",
    "filename": "Accra HEAT Oversized Hoodie.jpg"
  },
  ...
]
```

---

## Step 6: Update Database with Image URLs

### Option A: Bulk Update via Supabase Dashboard (Recommended for testing)

1. Copy the JSON mapping output from Step 5
2. Go to **Supabase Dashboard** → **SQL Editor** → **New Query**
3. Create an UPDATE statement for each product:

```sql
UPDATE public.products 
SET images = ARRAY['https://YOUR-PROJECT.supabase.co/storage/v1/object/public/products/accra-heat-oversized-hoodie/Accra%20HEAT%20Oversized%20Hoodie.jpg']
WHERE slug = 'accra-heat-oversized-hoodie';

-- Repeat for each product...
```

### Option B: Use the seed script
Modify `scripts/seed-products.sql` with the actual URLs and run it in Supabase SQL Editor.

---

## Step 7: Verify Images in Supabase

1. **Storage** → **products** bucket
2. You should see 39 folders, each containing one image
3. Click any image → copy public URL → verify it works in browser

---

## Troubleshooting

### ❌ Error: `SUPABASE_SERVICE_ROLE_KEY not found`
→ Missing env variable. Add to `.env.local` (see Step 3)

### ❌ Error: `Failed to upload: Storage object not found`
→ Bucket doesn't exist or isn't public. Recreate in Step 1 and set to **Public**

### ❌ Error: `ENOENT: no such file or directory`
→ Script is running from wrong directory. Run from project root:
```bash
cd /path/to/accra-threads
npx tsx scripts/upload-images.ts
```

### ❌ Images uploaded but URLs don't work
→ Bucket isn't set to **Public**. Fix in Supabase Dashboard → Storage → products → Settings

---

## Next: Phase 3 — Data Layer

Once images are uploaded and DB is seeded, proceed to:
- Rewrite `src/lib/data.ts` with database types
- Create async fetchers: `fetchProducts()`, `fetchProduct(slug)`, etc.
- Connect pages to live DB data