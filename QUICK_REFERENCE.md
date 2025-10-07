# ChurnGuard - Quick Reference

## 30-Second Pitch
ChurnGuard is a **Whop-embedded retention tool** that automatically detects at-risk members, sends recovery messages, and collects exit surveys. It reduces churn for Whop business owners through automated workflows and real-time analytics.

## What It Does
1. ✅ **Detects** at-risk members (cancellations, payment failures)
2. ✅ **Engages** automatically via Whop messages
3. ✅ **Recovers** churned members with win-back campaigns
4. ✅ **Analyzes** exit survey data to understand why members leave
5. ✅ **Monitors** churn metrics in embedded dashboard

## How It Works
```
Whop Webhooks → ChurnGuard Database → Auto-Messages + Dashboard
```

1. **Whop sends webhooks** when members join/cancel/fail payment
2. **We store data** in PostgreSQL (keyed by businessId)
3. **We auto-send messages** when churn risk detected
4. **Dashboard shows stats** embedded in Whop's UI

## Tech Stack
- **Frontend:** Next.js 15 + React + TypeScript + Tailwind
- **Backend:** Next.js API Routes + PostgreSQL + Prisma ORM
- **Hosting:** Vercel (serverless)
- **Integration:** Whop Webhooks + Whop Messaging API

## Architecture Type
**Multi-tenant SaaS App**
- One deployment serves all Whop businesses
- Each business has unique `businessId`
- Data isolated by businessId
- Dashboard URL: `/embed/dashboard/[businessId]`

## Key Files

### Webhook Handler (Main Logic)
`/src/app/api/webhooks/whop/route.ts`
- Receives Whop events
- Verifies signatures
- Updates database
- Triggers auto-messages

### Dashboard UI
`/src/app/embed/dashboard/[companyId]/page.tsx`
- Embedded in Whop
- Shows stats + at-risk members
- Action buttons (Message, Recover)

### Database Schema
`/prisma/schema.prisma`
```typescript
Member {
  whopUserId, businessId, email, name,
  status, isAtRisk, riskReason,
  exitSurveyCompleted, exitSurveyReason,
  cancelRescueSent, paymentRecoverySent
}
```

### API Endpoints
- `POST /api/webhooks/whop` - Receive events
- `GET /api/dashboard?businessId=X` - Get stats
- `GET /api/at-risk?businessId=X` - List at-risk
- `GET /api/recent-cancels?businessId=X` - List cancels
- `POST /api/actions/message` - Send message
- `POST /api/survey` - Submit exit survey

## Automated Workflows

### 1. Cancel Rescue
**Trigger:** Member schedules cancellation
**Action:** Send personalized message offering help/discount
**Goal:** Convince them to stay

### 2. Payment Recovery
**Trigger:** Payment fails
**Action:** Send billing update reminder
**Goal:** Prevent involuntary churn

### 3. Exit Survey
**Trigger:** Member churns
**Action:** Send survey link
**Goal:** Learn why they left

## Data Flow

```
┌─────────────┐
│ Whop Event  │
└──────┬──────┘
       │ webhook
       ↓
┌─────────────────┐
│ Verify Signature│
└──────┬──────────┘
       │
       ↓
┌─────────────────┐
│ Extract Data    │
│ - whopUserId    │
│ - businessId    │
│ - status        │
└──────┬──────────┘
       │
       ↓
┌─────────────────┐
│ Upsert Database │
│ (PostgreSQL)    │
└──────┬──────────┘
       │
       ↓
┌─────────────────┐
│ Trigger Actions │
│ - Send message  │
│ - Mark at-risk  │
└─────────────────┘
       │
       ↓
┌─────────────────┐
│ Dashboard Shows │
│ Updated Stats   │
└─────────────────┘
```

## Environment Variables
```bash
DATABASE_URL          # PostgreSQL connection
WHOP_API_KEY          # For sending messages
WEBHOOK_SECRET        # Webhook verification
VERCEL_URL           # App domain (auto-set)
```

## Deployment
```bash
# Local
npm install
npm run db:push
npm run dev

# Production
vercel --prod
# Set env vars in Vercel
# Configure Whop webhooks
```

## Why It's Special
1. **Proactive** - Catches churn before it happens
2. **Automated** - Zero manual work
3. **Embedded** - Lives inside Whop
4. **Multi-tenant** - Scalable to unlimited businesses
5. **Fast** - Queries own DB, not external APIs
6. **Smart** - Learns from exit surveys

## Current Status
✅ Tailwind CSS fixed (loads in iframe)
✅ Comprehensive logging added
✅ Error handling improved
✅ Multi-tenant architecture working
✅ Webhook integration complete
✅ Auto-messaging implemented
✅ Exit surveys collecting data
✅ Dashboard showing real-time stats

## Next Steps for Growth
- [ ] Add email notifications (Resend integration)
- [ ] Add predictive churn scoring (ML model)
- [ ] Add A/B testing for messages
- [ ] Add Slack/Discord integration
- [ ] Add custom message templates
- [ ] Add analytics graphs (churn trends over time)

