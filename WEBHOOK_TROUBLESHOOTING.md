# Webhook Troubleshooting Guide

## Problem: "No member data found"

If you're seeing this error on your ChurnGuard dashboard, it means no webhooks have been received yet. Follow this guide to diagnose and fix the issue.

---

## Quick Fix: Test with Mock Data

If you just want to see the dashboard working immediately:

1. **Navigate to the debug page:**
   ```
   https://p92zydiiursnnusw4y0r.apps.whop.com/test/webhook-debug
   ```

2. **Enter your Business ID:**
   - The Business ID from your screenshot is: `biz_kOK0VZBOoPrSIW`

3. **Click "Create Test Members"**
   - This will create 3 test members (1 active, 1 canceled, 1 expired)

4. **Refresh your dashboard**
   - Go back to your dashboard and you should see the test data

5. **Clean up test data** (optional):
   - Return to the debug page and click "Clear Test Members"

---

## Permanent Fix: Configure Webhooks

### Step 1: Find Your Webhook Settings in Whop

1. Log into [Whop Developer Dashboard](https://whop.com/developers)
2. Select your app/business
3. Go to **Settings** → **Webhooks** (or similar section)

### Step 2: Add Webhook Endpoint

Configure a webhook with these settings:

**Webhook URL:**
```
https://p92zydiiursnnusw4y0r.apps.whop.com/api/webhooks/whop
```

**Required Events:**
- ✅ `membership_went_valid` - When a user becomes a member
- ✅ `membership_went_invalid` - When a membership expires
- ✅ `membership_cancel_at_period_end_changed` - When a user schedules cancellation
- ✅ `payment_failed` - When a payment fails

**Webhook Secret:**
- Make sure this matches your `WEBHOOK_SECRET` in `.env.local`
- If you don't have a webhook secret set, generate one and update both:
  - Whop webhook settings
  - Your `.env.local` file

### Step 3: Test Webhook Delivery

1. **Check webhook status:**
   ```
   https://p92zydiiursnnusw4y0r.apps.whop.com/api/webhook-test
   ```
   This will show if your database is connected and if any members exist.

2. **Trigger a test webhook from Whop:**
   - Most webhook configurations have a "Send Test Event" button
   - Click it to send a test webhook to your app

3. **Verify webhook received:**
   - Check your app logs (in Vercel dashboard or wherever you're hosting)
   - Look for log messages like: `[whop] Processed membership_went_valid for user_xxx`

4. **Check dashboard again:**
   - If webhook was successful, you should now see data on your dashboard

---

## Understanding the Data Flow

```
┌─────────────┐
│  Whop Event │  (User subscribes, cancels, etc.)
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  Webhook Endpoint   │  /api/webhooks/whop
│  - Verifies signature
│  - Parses payload
│  - Extracts businessId
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Database (Prisma)  │  Upserts Member record
│  - whopUserId
│  - businessId       │  ← This is the key!
│  - status
│  - isAtRisk
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Dashboard Query    │  /api/dashboard?businessId=xxx
│  Filters by businessId
└─────────────────────┘
```

**The Critical Field: `businessId`**

Your webhook must include the business/product/company ID in the payload. The app looks for it in this order:
1. `payload.data.product.id`
2. `payload.data.plan.id`
3. `payload.data.organization.id`
4. `payload.data.company.id`

Make sure your webhooks include one of these fields!

---

## Common Issues & Solutions

### Issue 1: "Invalid signature" errors in logs

**Cause:** Webhook secret mismatch

**Solution:**
1. Check your Whop webhook configuration
2. Copy the webhook secret
3. Update `.env.local`:
   ```bash
   WEBHOOK_SECRET="your_actual_secret_here"
   ```
4. Restart your app (or redeploy if on Vercel)

### Issue 2: Webhooks received but wrong businessId

**Cause:** Viewing dashboard with wrong business ID

**Solution:**
1. Check what business ID is actually in the database:
   ```
   https://p92zydiiursnnusw4y0r.apps.whop.com/api/webhook-test
   ```
2. Note the `businessId` values shown
3. Update your dashboard URL to match:
   ```
   /embed/dashboard/{correct_business_id}
   ```

### Issue 3: No webhooks received at all

**Possible causes & solutions:**

✅ **Check webhook URL is correct:**
   - Must be: `https://p92zydiiursnnusw4y0r.apps.whop.com/api/webhooks/whop`
   - Common mistake: forgetting `/api/webhooks/whop` path

✅ **Verify app is deployed and running:**
   ```bash
   curl https://p92zydiiursnnusw4y0r.apps.whop.com/api/health
   ```
   Should return `{"status":"ok"}`

✅ **Check Whop webhook logs:**
   - In Whop dashboard, check webhook delivery logs
   - Look for failed deliveries or errors

✅ **Verify webhook secret is set:**
   - Check your `.env.local` has `WEBHOOK_SECRET`
   - Make sure it matches Whop's configuration

### Issue 4: Data for wrong business showing up

**Cause:** Multiple businesses using same app

**Solution:**
- The app is multi-tenant by design
- Each business has its own `businessId`
- Make sure you're viewing the correct dashboard:
  ```
  /embed/dashboard/{your_business_id}
  ```

---

## Debugging Tools

### Tool 1: Webhook Test Endpoint

**URL:** `/api/webhook-test`

**GET:** Check system status
```bash
curl https://p92zydiiursnnusw4y0r.apps.whop.com/api/webhook-test
```

**POST:** Create test data
```bash
curl -X POST https://p92zydiiursnnusw4y0r.apps.whop.com/api/webhook-test \
  -H "Content-Type: application/json" \
  -d '{"businessId":"biz_kOK0VZBOoPrSIW"}'
```

**POST:** Clear test data
```bash
curl -X POST https://p92zydiiursnnusw4y0r.apps.whop.com/api/webhook-test \
  -H "Content-Type: application/json" \
  -d '{"businessId":"biz_kOK0VZBOoPrSIW","action":"clear"}'
```

### Tool 2: Webhook Debug Page

**URL:** `/test/webhook-debug`

Visual interface for:
- Checking system status
- Creating test members
- Clearing test data
- Viewing database contents

### Tool 3: Dashboard API

**URL:** `/api/dashboard?businessId=xxx`

Direct API endpoint that shows what the dashboard sees:
```bash
curl "https://p92zydiiursnnusw4y0r.apps.whop.com/api/dashboard?businessId=biz_kOK0VZBOoPrSIW"
```

Returns:
```json
{
  "total": 0,
  "active": 0,
  "canceled": 0,
  "churned": 0
}
```

---

## Next Steps

1. **Deploy these new debugging tools:**
   ```bash
   git add .
   git commit -m "Add webhook debugging tools"
   git push
   ```

2. **Wait for deployment to complete**

3. **Use the debug page:**
   - Go to: `https://p92zydiiursnnusw4y0r.apps.whop.com/test/webhook-debug`
   - Check system status
   - Create test data if needed

4. **Configure webhooks in Whop:**
   - Follow "Permanent Fix" section above

5. **Test with real data:**
   - Create a test membership in Whop
   - Watch for webhook delivery
   - Check dashboard updates

---

## Still Having Issues?

If you've followed this guide and still seeing problems:

1. **Check application logs** (Vercel dashboard → Logs)
2. **Look for error messages** in browser console
3. **Verify database is accessible** (check connection string in .env.local)
4. **Test webhook endpoint directly:**
   ```bash
   curl -X POST https://p92zydiiursnnusw4y0r.apps.whop.com/api/webhooks/whop \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```
   (This will fail signature check but confirms endpoint is reachable)

---

## Environment Variables Checklist

Make sure these are set in your `.env.local`:

```bash
# Required
DATABASE_URL="postgresql://..."          # ✅ Configured
WEBHOOK_SECRET="your_secret"             # ✅ Configured
WHOP_API_KEY="whop_..."                  # ✅ Configured

# Optional but recommended
VERCEL_URL="p92zydiiursnnusw4y0r.apps.whop.com"
NEXT_PUBLIC_WHOP_APP_ID="app_..."
NEXT_PUBLIC_WHOP_COMPANY_ID="biz_..."
```

---

## Summary

The most common reason for "No member data found" is:
- ❌ Webhooks not configured in Whop dashboard
- ❌ Webhook URL incorrect
- ❌ Webhook secret mismatch
- ❌ Wrong business ID in dashboard URL

**Quick test:** Use the debug page to create test members and verify the dashboard works!

