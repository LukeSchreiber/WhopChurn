# ChurnGuard - Whop App Project Summary

## 🎯 What We're Building

**ChurnGuard** is a **Whop App** (embedded SaaS tool) that helps Whop business owners reduce member churn through automated detection, engagement, and recovery workflows.

### Core Value Proposition
- **Detects** at-risk members before they churn
- **Engages** members automatically with personalized messages
- **Recovers** canceled subscriptions with win-back campaigns
- **Analyzes** why members leave via exit surveys
- **Monitors** churn metrics in a real-time dashboard

---

## 🏗️ Architecture Overview

### App Type: Whop Embedded App
This is a **multi-tenant SaaS app** that:
- Embeds inside Whop's platform (iframe)
- Serves multiple Whop businesses simultaneously
- Each business sees only their own member data
- Integrates via Whop webhooks and API

### Tech Stack
```
Frontend:
- Next.js 15.5.3 (React 18)
- TypeScript
- Tailwind CSS (dark theme UI)
- Server-side rendering + client components

Backend:
- Next.js API Routes (serverless functions)
- PostgreSQL database (via Prisma ORM)
- Whop API integration
- Webhook signature verification

Infrastructure:
- Vercel deployment
- PostgreSQL (hosted)
- In-memory rate limiting
```

---

## 🔄 How It Works: Data Flow

### 1. Webhook Integration (Primary Data Source)
```
Whop Platform → Webhooks → ChurnGuard → Database → Dashboard
```

**Webhook Events Handled:**
- `membership_went_valid` - New member joins
- `membership_went_invalid` - Member expires/churns
- `membership_cancel_at_period_end_changed` - Member schedules cancellation
- `payment_failed` - Payment issue detected

**What Happens:**
1. Whop sends event to `/api/webhooks/whop`
2. Verify signature with `WEBHOOK_SECRET`
3. Extract member data (userId, businessId, email, status)
4. Upsert member record in PostgreSQL
5. Trigger automated actions based on event type

### 2. Automated Churn Prevention Workflows

#### Workflow A: Cancel Rescue
```
Trigger: Member schedules cancellation
Action: Send personalized Whop message
Message: Offer help, discounts, or support
Goal: Convince them to stay
```

#### Workflow B: Payment Recovery
```
Trigger: Payment fails
Action: Send billing update reminder
Message: Link to update payment method
Goal: Prevent involuntary churn
```

#### Workflow C: Exit Survey
```
Trigger: Member actually churns
Action: Send survey link via Whop message
Survey: Multiple choice + open feedback
Goal: Learn why they left
```

### 3. Dashboard (Embedded in Whop)
```
Whop Business Owner → Opens ChurnGuard → Views Dashboard
URL: /embed/dashboard/[businessId]
```

**Dashboard Shows:**
- **Stats**: Total members, Active, Canceled, At-Risk
- **At-Risk List**: Members who canceled or are inactive
- **Recent Cancellations**: Latest churned members with exit reasons
- **Quick Actions**: Message or send recovery offer

---

## 📊 Database Schema

### Member Model (Prisma)
```typescript
model Member {
  id          String   @id @default(cuid())
  whopUserId  String   @unique          // Whop's member ID
  businessId  String                    // Whop business/product ID
  email       String?  @unique
  name        String?
  
  // Status tracking
  status      String   @default("invalid")  // valid | invalid | canceled_at_period_end
  productId   String?
  planName    String?
  
  // Activity tracking
  lastActiveAt DateTime?
  lastEventId  String?  @unique
  
  // Churn detection
  isAtRisk    Boolean  @default(false)
  riskReason  String?  // "Scheduled cancellation" | "Membership expired"
  
  // Engagement tracking
  lastEmailSent DateTime?
  emailCount  Int      @default(0)
  cancelRescueSent Boolean @default(false)
  paymentRecoverySent Boolean @default(false)
  
  // Exit survey
  exitSurveyCompleted Boolean @default(false)
  exitSurveyReason String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Multi-Tenancy Strategy
- Each member record has a `businessId` field
- One deployment serves ALL Whop businesses
- Database queries filter by `businessId`
- Dashboard URL includes businessId: `/embed/dashboard/[businessId]`

---

## 🔌 API Endpoints

### Public Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/webhooks/whop` | POST | Receive Whop events |
| `/api/survey` | POST | Submit exit survey |
| `/api/health` | GET | Health check |

### Dashboard API (Used by embedded app)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/dashboard?businessId=X` | GET | Get member stats |
| `/api/at-risk?businessId=X` | GET | List at-risk members |
| `/api/recent-cancels?businessId=X` | GET | List recent cancellations |

### Action Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/actions/message` | POST | Send message to member |
| `/api/actions/recover` | POST | Send recovery offer |

---

## 🎨 User Interface

### Embedded Dashboard (`/embed/dashboard/[companyId]/page.tsx`)
**Design:** Dark theme (bg-gray-900) with colored stat cards

**Layout:**
```
┌─────────────────────────────────────────┐
│ ChurnGuard Dashboard                     │
│ Business: biz_123                        │
├─────────────────────────────────────────┤
│ [Total: 150] [Active: 120] [Canceled: 20] [At-Risk: 10] │
├─────────────────────────────────────────┤
│ 🚨 At-Risk Members    │ 📋 Recent Cancels │
│ ┌─────────────────┐  │ ┌────────────────┐ │
│ │ John Doe        │  │ │ Jane Smith     │ │
│ │ "Scheduled..."  │  │ │ "Too expensive"│ │
│ │ [Message] btn   │  │ │ [Recover] btn  │ │
│ └─────────────────┘  │ └────────────────┘ │
└─────────────────────────────────────────┘
```

**Key Features:**
- Real-time stats
- Actionable member lists
- One-click messaging
- Exit survey responses displayed

### Exit Survey Page (`/survey/page.tsx`)
**URL:** `/survey?memberId=X&businessId=Y`

**Features:**
- Multiple choice reasons (8 common options)
- Optional open-ended feedback
- Clean, simple form
- Stores response in database
- Shows thank you confirmation

---

## 🔐 Security & Infrastructure

### Webhook Security
- HMAC SHA-256 signature verification
- Timing-safe comparison to prevent timing attacks
- Secret stored in environment variables
- Rejects invalid/missing signatures

### Rate Limiting
- In-memory rate limiter (50 req/min for webhooks)
- Per-IP tracking
- Returns 429 with rate limit headers
- Auto-cleanup of expired entries

### CORS & Embedding
- `X-Frame-Options: ALLOWALL` - Allows iframe embedding
- `Content-Security-Policy: frame-ancestors https://*.whop.com` - Only Whop can embed
- CORS helper for Whop domains only

### Environment Variables
```
DATABASE_URL         - PostgreSQL connection
WHOP_API_KEY         - For sending messages
WEBHOOK_SECRET       - Webhook signature verification
VERCEL_URL          - App domain (auto-set on Vercel)
```

---

## 🚀 Key Features Breakdown

### 1. Automatic Churn Detection
- **Trigger:** Webhook events
- **Logic:** Flags members with status `canceled_at_period_end` or `invalid`
- **Storage:** `isAtRisk` boolean + `riskReason` text

### 2. Smart Messaging
- **Platform:** Uses Whop's messaging API
- **Timing:** Sends immediately when event detected
- **Deduplication:** Tracks if message already sent (`cancelRescueSent`, etc.)
- **Customizable:** Messages are in webhook handler

### 3. Exit Survey Collection
- **Trigger:** Sent when member churns
- **Format:** Survey link via Whop message
- **Questions:** 8 pre-defined reasons + open feedback
- **Storage:** Saves to `exitSurveyReason` field
- **Display:** Shows in "Recent Cancellations" list

### 4. Real-Time Dashboard
- **Embedded:** Loads inside Whop iframe
- **Performance:** Fetches from own database (not Whop API)
- **Multi-tenant:** Filters by businessId automatically
- **Actions:** Message at-risk members, send recovery offers

### 5. Comprehensive Logging
- **Client-side:** Browser console with `[ChurnGuard]` prefix
- **Server-side:** API logs with `[Dashboard API]`, `[whop]` prefixes
- **Error handling:** Detailed error messages with suggestions
- **Debugging:** Shows webhook URL and businessId mismatches

---

## 📈 Business Logic

### Member Lifecycle States
```
NEW → VALID → CANCELED_AT_PERIOD_END → INVALID
        ↑                                   ↓
        └──────── Payment Recovered ────────┘
```

### Churn Prevention Strategy
1. **Proactive:** Catch cancellations before they finalize
2. **Reactive:** Win back churned members
3. **Educational:** Learn from exit surveys
4. **Automated:** No manual intervention needed

### Multi-Business Support
- Each Whop business gets their own dashboard view
- `businessId` extracted from webhook payload
- Common fields: `product.id`, `plan.id`, `organization.id`
- All queries filter by businessId
- Secure: Members can't see other businesses' data

---

## 🧪 Development & Deployment

### Local Development
```bash
# Setup
npm install
cp env.example .env
# Configure DATABASE_URL, WEBHOOK_SECRET, etc.

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to DB

# Run
npm run dev          # http://localhost:3000
```

### Testing
```bash
# Test embed URL
http://localhost:3000/embed/dashboard/YOUR_BUSINESS_ID

# Test webhook (use ngrok for local)
ngrok http 3000
# Configure Whop webhook → https://abc123.ngrok.io/api/webhooks/whop
```

### Production Deployment
```bash
# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard
# Configure Whop webhooks to point to production URL
```

---

## 🎯 User Flows

### Flow 1: New Member Joins
```
1. Member subscribes on Whop
2. Whop sends "membership_went_valid" webhook
3. ChurnGuard creates member record (status: "valid")
4. Business owner sees +1 in "Active" stat
```

### Flow 2: Member Schedules Cancellation
```
1. Member clicks "Cancel" on Whop
2. Whop sends "membership_cancel_at_period_end_changed" webhook
3. ChurnGuard:
   - Updates status to "canceled_at_period_end"
   - Sets isAtRisk = true
   - Sends rescue message via Whop API
   - Marks cancelRescueSent = true
4. Dashboard shows member in "At-Risk" list
5. Business owner can click "Message" to follow up
```

### Flow 3: Member Actually Churns
```
1. Cancellation period ends
2. Whop sends "membership_went_invalid" webhook
3. ChurnGuard:
   - Updates status to "invalid"
   - Sends exit survey link
4. Member clicks survey link
5. Fills out survey on /survey page
6. ChurnGuard saves exitSurveyReason
7. Dashboard shows cancellation reason in "Recent Cancellations"
```

### Flow 4: Business Owner Monitors Dashboard
```
1. Owner opens Whop business dashboard
2. Clicks ChurnGuard app
3. Embedded dashboard loads at /embed/dashboard/[businessId]
4. Sees:
   - Total members: 150
   - Active: 120
   - Canceled: 20
   - At-Risk: 10
5. Clicks "Message" on at-risk member
6. Sends custom message via Whop
```

---

## 🔍 Important Implementation Details

### businessId Extraction (Critical!)
```typescript
// From webhook payload, in priority order:
const businessId =
  payload?.data?.product?.id ??      // Usually this one
  payload?.data?.plan?.id ??         // Or this
  payload?.data?.organization?.id ?? // Rarely this
  payload?.data?.company?.id ??      // Fallback
  null;
```

**Why it matters:**
- This ID must match the `[companyId]` in the embed URL
- If mismatch: Dashboard shows 0 data
- Each Whop business has different ID structure

### Webhook Signature Verification
```typescript
// Supports two formats (timestamp-based and raw)
const candidateTs = hmacHex(secret, `${timestamp}.${rawBody}`);
const candidateRaw = hmacHex(secret, rawBody);

// Accept either format (Whop docs unclear which they use)
if (matchTs || matchRaw) return { ok: true };
```

### Deduplication
```typescript
// Prevent processing same webhook twice
const dupe = await prisma.member.findFirst({ 
  where: { lastEventId: eventId } 
});
if (dupe) return "ok (duplicate)";
```

---

## 🐛 Common Issues & Solutions

### Issue: Data shows 0
**Cause:** Database empty (webhooks not configured)
**Solution:** 
- Configure Whop webhooks
- Check businessId matches
- See server logs for mismatches

### Issue: Styles not loading
**Cause:** Missing CSS import
**Solution:** ✅ Fixed - `layout.tsx` now imports `globals.css`

### Issue: Messages not sending
**Cause:** Missing `WHOP_API_KEY`
**Solution:** Set environment variable in Vercel

---

## 🎓 How to Explain This to Another AI

> "We're building **ChurnGuard**, a Whop-embedded analytics and retention tool. It's a multi-tenant SaaS app that helps Whop business owners reduce customer churn.
> 
> **How it works:** Whop sends us webhooks when members join, cancel, or have payment issues. We store this in PostgreSQL (keyed by `businessId`) and display a real-time dashboard embedded in Whop's UI. When we detect churn risk (cancellations, payment failures), we automatically send personalized messages via Whop's API and collect exit surveys.
>
> **Tech:** Next.js 15 + TypeScript + Tailwind + Prisma + PostgreSQL. Serverless on Vercel. Multi-tenant architecture using businessId for isolation.
>
> **Key files:**
> - `/api/webhooks/whop/route.ts` - Webhook handler (main business logic)
> - `/embed/dashboard/[companyId]/page.tsx` - Embedded dashboard UI
> - `/prisma/schema.prisma` - Member data model
> - `/lib/whop.ts` - Whop API integration
>
> **Important:** The app doesn't directly fetch Whop API for member data. It builds its own database from webhooks, then queries that for the dashboard. This makes it fast and resilient."

---

## 📚 File Structure Reference

```
/Users/luke/Whopapp/
├── prisma/
│   └── schema.prisma              # Database schema
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── webhooks/whop/route.ts     # Main webhook handler
│   │   │   ├── dashboard/route.ts         # Stats API
│   │   │   ├── at-risk/route.ts           # At-risk list API
│   │   │   ├── recent-cancels/route.ts    # Cancellations API
│   │   │   ├── survey/route.ts            # Exit survey submission
│   │   │   ├── actions/
│   │   │   │   ├── message/route.ts       # Send message action
│   │   │   │   └── recover/route.ts       # Send recovery action
│   │   │   └── health/route.ts            # Health check
│   │   ├── embed/dashboard/[companyId]/page.tsx  # Embedded dashboard
│   │   ├── survey/page.tsx                # Exit survey form
│   │   ├── layout.tsx                     # Root layout (imports CSS!)
│   │   └── globals.css                    # Tailwind styles
│   └── lib/
│       ├── db.ts                          # Prisma client
│       ├── whop.ts                        # Whop API helpers
│       ├── cors.ts                        # CORS middleware
│       └── rate-limit.ts                  # Rate limiting
├── next.config.ts                         # CSP headers for iframe
├── tailwind.config.ts                     # Tailwind setup
├── package.json                           # Dependencies
├── SETUP_GUIDE.md                         # Deployment guide
├── DEBUGGING.md                           # Troubleshooting
└── PROJECT_SUMMARY.md                     # This file!
```

---

## 🚀 What Makes This Special

1. **Proactive, not reactive** - Catches churn before it happens
2. **Automated workflows** - No manual intervention needed
3. **Embedded experience** - Lives inside Whop, no context switching
4. **Multi-tenant by design** - One app serves unlimited businesses
5. **Fast dashboard** - Queries own DB, not external APIs
6. **Exit survey intelligence** - Learns why customers leave
7. **Production-ready** - Logging, rate limiting, security built-in

This is a complete, production-ready Whop app that provides immediate value to any Whop business owner concerned about retention! 🎉

