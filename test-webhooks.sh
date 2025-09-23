#!/bin/bash

# ChurnGuard Test Script
# Simulates webhook events for FitnessMaster Pro business

APP_URL="https://your-app.vercel.app"  # Replace with your actual Vercel URL

echo "🧪 Testing ChurnGuard with FitnessMaster Pro scenario..."
echo ""

# Test 1: Maria schedules cancellation (Cancel Rescue)
echo "1. Testing Cancel Rescue - Maria schedules cancellation"
curl -X POST "$APP_URL/api/webhooks/whop" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "membership_cancel_at_period_end_changed",
    "id": "event_maria_cancel_001",
    "data": {
      "membership": {"id": "user_maria_002"},
      "user": {"email": "maria.r@email.com", "name": "Maria Rodriguez"},
      "product": {"id": "fitness_pro_123", "name": "FitnessMaster Pro"}
    }
  }' \
  -w "\nHTTP Status: %{http_code}\n"
echo ""

# Test 2: David actually cancels (Exit Survey)
echo "2. Testing Exit Survey - David cancels"
curl -X POST "$APP_URL/api/webhooks/whop" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "membership_went_invalid",
    "id": "event_david_churn_001",
    "data": {
      "membership": {"id": "user_david_003"},
      "user": {"email": "david.chen@email.com", "name": "David Chen"},
      "product": {"id": "fitness_pro_123", "name": "FitnessMaster Pro"}
    }
  }' \
  -w "\nHTTP Status: %{http_code}\n"
echo ""

# Test 3: Michael's payment fails (Payment Recovery)
echo "3. Testing Payment Recovery - Michael's payment fails"
curl -X POST "$APP_URL/api/webhooks/whop" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment_failed",
    "id": "event_michael_payment_001",
    "data": {
      "membership": {"id": "user_michael_005"},
      "user": {"email": "mike.brown@email.com", "name": "Michael Brown"},
      "product": {"id": "fitness_pro_123", "name": "FitnessMaster Pro"}
    }
  }' \
  -w "\nHTTP Status: %{http_code}\n"
echo ""

# Test 4: Lisa schedules cancellation (Cancel Rescue)
echo "4. Testing Cancel Rescue - Lisa schedules cancellation"
curl -X POST "$APP_URL/api/webhooks/whop" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "membership_cancel_at_period_end_changed",
    "id": "event_lisa_cancel_001",
    "data": {
      "membership": {"id": "user_lisa_006"},
      "user": {"email": "lisa.wilson@email.com", "name": "Lisa Wilson"},
      "product": {"id": "fitness_pro_123", "name": "FitnessMaster Pro"}
    }
  }' \
  -w "\nHTTP Status: %{http_code}\n"
echo ""

# Test 5: Robert cancels (Exit Survey)
echo "5. Testing Exit Survey - Robert cancels"
curl -X POST "$APP_URL/api/webhooks/whop" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "membership_went_invalid",
    "id": "event_robert_churn_001",
    "data": {
      "membership": {"id": "user_robert_007"},
      "user": {"email": "robert.t@email.com", "name": "Robert Taylor"},
      "product": {"id": "fitness_pro_123", "name": "FitnessMaster Pro"}
    }
  }' \
  -w "\nHTTP Status: %{http_code}\n"
echo ""

# Test 6: Jessica stays active (No action needed)
echo "6. Testing Active Member - Jessica renews"
curl -X POST "$APP_URL/api/webhooks/whop" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "membership_went_valid",
    "id": "event_jessica_renew_001",
    "data": {
      "membership": {"id": "user_jessica_004"},
      "user": {"email": "jessica.park@email.com", "name": "Jessica Park"},
      "product": {"id": "fitness_pro_123", "name": "FitnessMaster Pro"}
    }
  }' \
  -w "\nHTTP Status: %{http_code}\n"
echo ""

echo "✅ Test completed! Check your dashboard at:"
echo "Dashboard: $APP_URL/?businessId=fitness_pro_123"
echo ""
echo "Expected results:"
echo "- 6 total members"
echo "- 2 active members (Alex, Jessica)"
echo "- 2 at-risk members (Maria, Lisa)"
echo "- 2 churned members (David, Robert)"
echo "- 1 payment recovery sent (Michael)"
echo "- 2 cancel rescue messages sent (Maria, Lisa)"
echo "- 2 exit surveys sent (David, Robert)"
