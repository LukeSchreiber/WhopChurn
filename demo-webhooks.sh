#!/bin/bash

# ChurnGuard Demo Script
# Shows the webhook functionality in action

echo "🎭 ChurnGuard Demo - Webhook Simulation"
echo "========================================"
echo ""

# Set the local URL
APP_URL="http://localhost:3001"

echo "🚀 Starting ChurnGuard Demo..."
echo "📊 Dashboard: $APP_URL/embedded/dashboard?businessId=fitness_pro_123"
echo ""

# Function to send webhook with proper signature
send_webhook() {
    local event_type=$1
    local event_id=$2
    local member_id=$3
    local member_name=$4
    local member_email=$5
    
    echo "📤 Sending $event_type for $member_name..."
    
    # Create the payload
    local payload=$(cat <<EOF
{
    "type": "$event_type",
    "id": "$event_id",
    "data": {
        "membership": {"id": "$member_id"},
        "user": {"email": "$member_email", "name": "$member_name"},
        "product": {"id": "fitness_pro_123", "name": "FitnessMaster Pro"}
    }
}
EOF
)
    
    # Create signature (simplified for demo)
    local signature="t=$(date +%s),v1=demo_signature"
    
    # Send the webhook
    curl -s -X POST "$APP_URL/api/webhooks/whop" \
        -H "Content-Type: application/json" \
        -H "x-whop-signature: $signature" \
        -d "$payload" \
        -w "Status: %{http_code}\n" | head -1
    
    echo ""
}

# Demo 1: New member signs up
echo "🎯 Demo 1: New Member Signs Up"
echo "-------------------------------"
send_webhook "membership_went_valid" "demo_signup_001" "user_new_member" "Alex Johnson" "alex.j@email.com"
echo "✅ Alex Johnson is now an active member!"
echo ""

# Demo 2: Member schedules cancellation (Cancel Rescue)
echo "🎯 Demo 2: Member Schedules Cancellation (Cancel Rescue)"
echo "-------------------------------------------------------"
send_webhook "membership_cancel_at_period_end_changed" "demo_cancel_001" "user_maria_002" "Maria Rodriguez" "maria.r@email.com"
echo "🚨 Maria scheduled cancellation → ChurnGuard sends rescue message!"
echo ""

# Demo 3: Payment fails (Payment Recovery)
echo "🎯 Demo 3: Payment Fails (Payment Recovery)"
echo "-------------------------------------------"
send_webhook "payment_failed" "demo_payment_001" "user_michael_005" "Michael Brown" "mike.brown@email.com"
echo "💳 Michael's payment failed → ChurnGuard sends recovery message!"
echo ""

# Demo 4: Member actually cancels (Exit Survey)
echo "🎯 Demo 4: Member Actually Cancels (Exit Survey)"
echo "------------------------------------------------"
send_webhook "membership_went_invalid" "demo_churn_001" "user_david_003" "David Chen" "david.chen@email.com"
echo "📝 David canceled → ChurnGuard sends exit survey!"
echo ""

echo "🎉 Demo Complete!"
echo "=================="
echo ""
echo "📊 Check the updated dashboard:"
echo "$APP_URL/embedded/dashboard?businessId=fitness_pro_123"
echo ""
echo "📝 Test the exit survey:"
echo "$APP_URL/survey?memberId=user_david_003&businessId=fitness_pro_123"
echo ""
echo "💡 What just happened:"
echo "- ChurnGuard detected a new member signup"
echo "- Sent automatic rescue message to canceling member"
echo "- Sent payment recovery message for failed payment"
echo "- Sent exit survey to churned member"
echo "- All data updated in real-time on the dashboard"
echo ""
echo "🚀 This is ChurnGuard in action - proactive churn prevention!"
