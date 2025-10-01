# ChurnGuard - Quick Setup Guide

## ✅ Issues Fixed

### 1. Tailwind CSS Not Loading ✅
**Problem:** `layout.tsx` was not importing `globals.css`, causing Tailwind classes to not apply.

**Fix:** Added `import './globals.css'` to `src/app/layout.tsx`

**Result:** Tailwind styles will now load properly, even inside Whop iframes.

---

### 2. Data Showing as 0 ✅
**Problem:** No visibility into why data wasn't loading (database empty vs API error).

**Fix:** Added comprehensive logging and error handling:
- Console logs in the dashboard component
- Server-side logs in all API routes
- Helpful error message when database is empty
- Error details for debugging

**Result:** You can now see exactly what's happening via browser console and server logs.

---

## 🚀 Deployment Steps

### 1. Set Environment Variables

Create a `.env` file (or set in Vercel):

```bash
# Database (Required)
DATABASE_URL="postgresql://user:password@host:5432/churnguard"

# Whop API (Required for messaging features)
WHOP_API_KEY="your_whop_api_key"

# Webhook Security (Required)
WEBHOOK_SECRET="your_webhook_secret"

# App URL (Auto-set on Vercel, manual for local)
VERCEL_URL="your-app.vercel.app"
```

### 2. Deploy to Vercel

```bash
# Install dependencies
npm install

# Build and test locally
npm run build
npm run dev

# Deploy to Vercel
vercel --prod
```

### 3. Configure Whop Webhooks

1. Go to [Whop Developer Portal](https://whop.com/developers)
2. Add webhook endpoint:
   ```
   https://your-app.vercel.app/api/webhooks/whop
   ```
3. Set webhook secret (same as `WEBHOOK_SECRET` in your env)
4. Subscribe to these events:
   - `membership_went_valid`
   - `membership_went_invalid`
   - `membership_cancel_at_period_end_changed`
   - `payment_failed`

### 4. Get Your Business ID

The `businessId` comes from Whop webhook payloads. To find it:

**Option A: From Webhook Logs**
- Trigger a test webhook event
- Check server logs for:
  ```
  [whop] Processed membership_went_valid for user_xyz in business biz_123abc
  ```
- The business ID is `biz_123abc`

**Option B: From Database**
- After webhooks fire, check your database:
  ```sql
  SELECT DISTINCT "businessId" FROM "Member";
  ```

### 5. Embed in Whop

Use this URL format for your Whop embed:
```
https://your-app.vercel.app/embed/dashboard/YOUR_BUSINESS_ID
```

Replace `YOUR_BUSINESS_ID` with the actual ID from step 4.

---

## 🔍 Testing & Verification

### After Deployment:

1. **Check Tailwind is working:**
   - Visit: `https://your-app.vercel.app/embed/dashboard/YOUR_BUSINESS_ID`
   - Should see dark theme with colored stat cards
   - If still looks like raw HTML, hard refresh (Cmd+Shift+R)

2. **Check Data is Loading:**
   - Open browser DevTools → Console
   - Look for logs:
     ```
     [ChurnGuard] Loading dashboard for businessId: YOUR_BUSINESS_ID
     [ChurnGuard] Stats loaded: { total: X, active: Y, ... }
     ```

3. **If Stats Still Show 0:**
   - Check console for error message
   - It will say: "No member data found. Make sure Whop webhooks are configured..."
   - Copy the webhook URL from the error message
   - Configure webhooks in Whop (Step 3 above)
   - Trigger a test event or wait for real member activity

4. **Check Server Logs:**
   - Vercel: Go to your deployment → Functions → Logs
   - Look for:
     ```
     [Dashboard API] Stats for YOUR_BUSINESS_ID: { total: X, ... }
     ```

---

## 🐛 Debugging

If something isn't working:

1. **Read the logs first:**
   - Browser console: `[ChurnGuard]` prefix
   - Server logs: `[Dashboard API]`, `[At-Risk API]`, `[whop]` prefixes

2. **Common issues:**
   - **Styles not loading:** Hard refresh browser, check `layout.tsx` imports `globals.css`
   - **Data is 0:** Database is empty, configure webhooks
   - **businessId mismatch:** URL param doesn't match database value
   - **Webhook errors:** Check `WEBHOOK_SECRET` matches between Whop and your app

3. **See full debugging guide:**
   - Read `DEBUGGING.md` for comprehensive troubleshooting

---

## 📊 Understanding the Data Flow

```
Whop Event (member joins/cancels)
    ↓
Whop Webhook → /api/webhooks/whop
    ↓
Verify signature with WEBHOOK_SECRET
    ↓
Extract businessId from event payload
    ↓
Save/Update member in PostgreSQL database
    ↓
Dashboard loads → /api/dashboard?businessId=XXX
    ↓
Query database for stats
    ↓
Display in UI
```

**Key Point:** The dashboard doesn't call Whop API directly. It reads from your database, which is populated by webhooks. This means:
- ✅ Fast performance (no external API calls)
- ✅ Works even if Whop API is down
- ⚠️ Requires webhooks to be configured
- ⚠️ businessId in URL must match businessId in database

---

## 🎯 Next Steps

After everything is working:

1. **Customize the messages:**
   - Edit `/api/webhooks/whop/route.ts`
   - Update cancel rescue, payment recovery, and exit survey messages

2. **Add your branding:**
   - Update colors in Tailwind classes
   - Modify `src/app/embed/dashboard/[companyId]/page.tsx`

3. **Monitor churn:**
   - Watch the dashboard for at-risk members
   - Use the "Message" and "Recover" buttons
   - Track exit survey responses

4. **Scale:**
   - The app is multi-tenant by design (businessId field)
   - Can handle multiple Whop businesses in one deployment
   - Each business sees only their own data

---

## 📝 Support

- **Debugging Guide:** See `DEBUGGING.md`
- **Environment Variables:** See `env.example`
- **Logs:** Check browser console and Vercel function logs

Good luck! 🚀

