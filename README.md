# ChurnGuard MVP

A minimal Whop App that detects churn risk and re-engages members.

## Features

- Activity tracking via ping endpoint
- Risk detection for inactive/cancelled members
- Email nudges via Resend
- Dashboard for monitoring

## Setup

1. Copy environment variables:
```bash
cp .env.example .env
```

2. Set up database:
```bash
npm run db:generate
npm run db:push
```

3. Start development:
```bash
npm run dev
```

## API Endpoints

- `POST /api/webhooks/whop` - Handle Whop subscription events
- `GET /api/ping?memberId={id}` - Track member activity
- `POST /api/risk-scan` - Scan for at-risk members
- `GET /dashboard` - View dashboard

## Environment Variables

```
DATABASE_URL=
WHOP_API_KEY=
WEBHOOK_SECRET=
RESEND_API_KEY=
```
