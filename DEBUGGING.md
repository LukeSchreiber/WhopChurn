# ChurnGuard Debugging Guide

## Common Issues & Solutions

### Issue 1: Tailwind Styles Not Loading (Raw HTML Look)

**Symptoms:**
- Dashboard looks unstyled (raw HTML)
- Tailwind classes not applying
- Works on direct URL but breaks in Whop iframe

**Solution:**
✅ **FIXED** - Added `import './globals.css'` to `src/app/layout.tsx`

**Verification:**
1. Check that `src/app/layout.tsx` imports `./globals.css`
2. Rebuild the app: `npm run build`
3. Test both on direct URL and inside Whop iframe
4. Check browser console for any CSS loading errors

---

### Issue 2: All Stats Showing 0

**Symptoms:**
- Total Members: 0
- Active: 0
- Canceled: 0
- At-Risk: 0

**Root Causes:**
1. **Database is empty** (webhooks not configured)
2. **Wrong businessId** (URL param doesn't match database)
3. **Webhooks not firing** from Whop

**Solution Steps:**

#### Step 1: Check Console Logs
Open browser DevTools Console and look for:
```
[ChurnGuard] Loading dashboard for businessId: YOUR_BUSINESS_ID
[ChurnGuard] Stats loaded: { total: 0, active: 0, canceled: 0, churned: 0 }
```

If you see "No member data found", proceed to Step 2.

#### Step 2: Verify Webhook Configuration

1. **Get your webhook URL:**
   - Production: `https://your-app.vercel.app/api/webhooks/whop`
   - Local dev: Use ngrok or similar to expose localhost

2. **Configure in Whop Dashboard:**
   - Go to Whop Developer Portal
   - Add webhook endpoint: `https://your-app.vercel.app/api/webhooks/whop`
   - Set webhook secret in `.env` as `WEBHOOK_SECRET`
   - Subscribe to events:
     - `membership_went_valid`
     - `membership_went_invalid`
     - `membership_cancel_at_period_end_changed`
     - `payment_failed`

3. **Test webhook:**
   - Trigger a test event from Whop
   - Check server logs for:
     ```
     [whop] sig OK
     [whop] Processed membership_went_valid for user_xyz in business biz_123
     ```

#### Step 3: Check Database

Connect to your database and run:
```sql
-- Check if any members exist
SELECT COUNT(*) FROM "Member";

-- Check members for specific business
SELECT * FROM "Member" WHERE "businessId" = 'YOUR_BUSINESS_ID';

-- Check all unique businessIds
SELECT DISTINCT "businessId" FROM "Member";
```

If `businessId` doesn't match what's in the URL, you have a mismatch.

#### Step 4: Understand businessId Mapping

The webhook extracts `businessId` from Whop events in this priority:
1. `payload.data.product.id`
2. `payload.data.plan.id`
3. `payload.data.organization.id`
4. `payload.data.company.id`

**Action:** Log the actual businessId from a webhook:
- Check server logs when webhook fires
- Compare with the `companyId` in your embed URL
- They must match!

---

### Issue 3: Debugging API Calls

**Server-side logs** (check Vercel logs or terminal):
```
[Dashboard API] Request received for businessId: biz_123
[Dashboard API] Stats for biz_123: { total: 5, active: 3, canceled: 1, churned: 1 }
[At-Risk API] Found 2 at-risk members for biz_123
[Recent Cancels API] Found 1 recent cancellations for biz_123
```

**Client-side logs** (browser console):
```
[ChurnGuard] Loading dashboard for businessId: biz_123
[ChurnGuard] API responses - stats: 200, risk: 200, cancels: 200
[ChurnGuard] Stats loaded: { total: 5, active: 3, canceled: 1, churned: 1 }
[ChurnGuard] At-risk members: 2
[ChurnGuard] Recent cancels: 1
```

---

## Environment Variables Checklist

Required in `.env` (or Vercel Environment Variables):

- [x] `DATABASE_URL` - PostgreSQL connection string
- [x] `WHOP_API_KEY` - For sending messages to members
- [x] `WEBHOOK_SECRET` - For verifying Whop webhooks
- [x] `VERCEL_URL` - Your app's domain (auto-set on Vercel)

---

## Testing Checklist

### Local Development
- [ ] Run `npm run dev`
- [ ] Visit `http://localhost:3000/embed/dashboard/YOUR_BUSINESS_ID`
- [ ] Check browser console for `[ChurnGuard]` logs
- [ ] Check terminal for `[Dashboard API]` logs

### Production (Vercel)
- [ ] Deploy to Vercel
- [ ] Set all environment variables
- [ ] Configure Whop webhooks pointing to your Vercel URL
- [ ] Test direct URL: `https://your-app.vercel.app/embed/dashboard/YOUR_BUSINESS_ID`
- [ ] Test inside Whop iframe
- [ ] Check Vercel logs for API calls

### Webhook Testing
- [ ] Webhook endpoint is publicly accessible
- [ ] Webhook secret matches between Whop and your app
- [ ] Test event triggers successfully
- [ ] Check server logs for webhook processing
- [ ] Verify data appears in database

---

## Common Error Messages

### "No member data found"
- Database is empty
- Webhooks not configured or not firing
- See Issue 2 above

### "Missing businessId"
- URL is missing the `companyId` parameter
- Should be: `/embed/dashboard/YOUR_BUSINESS_ID`

### "Invalid businessId format"
- businessId contains invalid characters
- Must match: `/^[a-zA-Z0-9_-]+$/`

### "Network error loading dashboard"
- API endpoint is not responding
- Check if server is running
- Check browser console for CORS errors

---

## Next Steps After Fixes

1. **Rebuild and redeploy:**
   ```bash
   npm run build
   vercel --prod
   ```

2. **Clear browser cache:**
   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
   - Or open in incognito mode

3. **Verify Tailwind is working:**
   - Dashboard should have dark theme (bg-gray-900)
   - Stats cards should have colored numbers (blue, green, yellow, red)

4. **Verify data is loading:**
   - Stats should show actual numbers
   - At-risk members should appear if any exist
   - Recent cancellations should appear if any exist

5. **Monitor logs:**
   - Keep browser console open
   - Keep server logs visible
   - Watch for any errors or warnings

---

## Support

If issues persist:
1. Check all environment variables are set correctly
2. Verify database connection works
3. Test webhook with Whop's webhook testing tool
4. Check Vercel deployment logs
5. Verify the embed URL matches the database businessId

Remember: The app requires **both** webhooks to populate data **and** correct businessId mapping to display it!

