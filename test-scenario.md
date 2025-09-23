# 🧪 ChurnGuard Test Scenario

## Fake Business: "FitnessMaster Pro"
**Business Owner:** Sarah Johnson  
**Whop Product ID:** `fitness_pro_123`  
**Dashboard URL:** `https://your-app.vercel.app/?businessId=fitness_pro_123`

---

## 👥 Fake Members & Test Scenarios

### **Member 1: Alex Thompson**
- **Whop User ID:** `user_alex_001`
- **Email:** alex.thompson@email.com
- **Name:** Alex Thompson
- **Status:** `valid` (Active)
- **Plan:** Premium Fitness ($29/month)
- **Last Active:** 2024-12-22
- **Risk Status:** ✅ Safe

### **Member 2: Maria Rodriguez**
- **Whop User ID:** `user_maria_002`
- **Email:** maria.r@email.com
- **Name:** Maria Rodriguez
- **Status:** `canceled_at_period_end` (Scheduled cancellation)
- **Plan:** Basic Fitness ($19/month)
- **Last Active:** 2024-12-20
- **Risk Status:** 🚨 **AT RISK** - Scheduled cancellation
- **ChurnGuard Action:** ✅ Cancel Rescue message sent

### **Member 3: David Chen**
- **Whop User ID:** `user_david_003`
- **Email:** david.chen@email.com
- **Name:** David Chen
- **Status:** `invalid` (Churned)
- **Plan:** Premium Fitness ($29/month)
- **Last Active:** 2024-12-15
- **Risk Status:** ❌ Churned
- **ChurnGuard Action:** ✅ Exit Survey sent, completed
- **Survey Response:** "Too expensive - found a cheaper alternative"

### **Member 4: Jessica Park**
- **Whop User ID:** `user_jessica_004`
- **Email:** jessica.park@email.com
- **Name:** Jessica Park
- **Status:** `valid` (Active)
- **Plan:** Premium Fitness ($29/month)
- **Last Active:** 2024-12-21
- **Risk Status:** ✅ Safe

### **Member 5: Michael Brown**
- **Whop User ID:** `user_michael_005`
- **Email:** mike.brown@email.com
- **Name:** Michael Brown
- **Status:** `invalid` (Churned)
- **Plan:** Basic Fitness ($19/month)
- **Last Active:** 2024-12-18
- **Risk Status:** ❌ Churned
- **ChurnGuard Action:** ✅ Exit Survey sent, completed
- **Survey Response:** "Didn't use it enough - too busy with work"

### **Member 6: Lisa Wilson**
- **Whop User ID:** `user_lisa_006`
- **Email:** lisa.wilson@email.com
- **Name:** Lisa Wilson
- **Status:** `canceled_at_period_end` (Scheduled cancellation)
- **Plan:** Premium Fitness ($29/month)
- **Last Active:** 2024-12-19
- **Risk Status:** 🚨 **AT RISK** - Scheduled cancellation
- **ChurnGuard Action:** ✅ Cancel Rescue message sent

### **Member 7: Robert Taylor**
- **Whop User ID:** `user_robert_007`
- **Email:** robert.t@email.com
- **Name:** Robert Taylor
- **Status:** `invalid` (Churned)
- **Plan:** Premium Fitness ($29/month)
- **Last Active:** 2024-12-17
- **Risk Status:** ❌ Churned
- **ChurnGuard Action:** ✅ Exit Survey sent, completed
- **Survey Response:** "Technical issues - app kept crashing"

---

## 📊 Dashboard Summary for Sarah Johnson

**Total Members:** 7  
**Active Members:** 2 (Alex, Jessica)  
**At Risk:** 2 (Maria, Lisa)  
**Canceled:** 3 (David, Michael, Robert)  
**Churned:** 3 (David, Michael, Robert)

**Churn Rate:** 42.9% (3 out of 7)

---

## 🚨 ChurnGuard Alerts

### **At-Risk Members (Action Required):**
1. **Maria Rodriguez** - Scheduled cancellation on 2024-12-20
   - 🎯 Cancel Rescue message sent
   - Status: Awaiting response

2. **Lisa Wilson** - Scheduled cancellation on 2024-12-19
   - 🎯 Cancel Rescue message sent
   - Status: Awaiting response

---

## 📋 Recent Cancellations (Last 10)

1. **David Chen** - Canceled: 2024-12-15
   - 💬 Reason: "Too expensive - found a cheaper alternative"

2. **Michael Brown** - Canceled: 2024-12-18
   - 💬 Reason: "Didn't use it enough - too busy with work"

3. **Robert Taylor** - Canceled: 2024-12-17
   - 💬 Reason: "Technical issues - app kept crashing"

---

## 📊 Exit Survey Results

**Why members are leaving:**
- **"Too expensive"** - 1 member (David)
- **"Didn't use it enough"** - 1 member (Michael)
- **"Technical issues"** - 1 member (Robert)

---

## 🎯 ChurnGuard Actions Taken

### **Cancel Rescue Messages:**
- ✅ Sent to Maria Rodriguez (scheduled cancellation)
- ✅ Sent to Lisa Wilson (scheduled cancellation)

### **Exit Surveys:**
- ✅ Sent to David Chen (completed)
- ✅ Sent to Michael Brown (completed)
- ✅ Sent to Robert Taylor (completed)

### **Payment Recovery:**
- None triggered (no payment failures in this scenario)

---

## 💡 Business Insights for Sarah

**Key Issues Identified:**
1. **Pricing concerns** - 33% of churn due to cost
2. **Usage issues** - 33% didn't use the product enough
3. **Technical problems** - 33% had app issues

**Recommendations:**
1. Consider pricing adjustments or discounts
2. Improve onboarding to increase usage
3. Fix technical issues and improve app stability
4. Follow up with at-risk members (Maria & Lisa)

---

## 🧪 How to Test This Scenario

### **1. Test Dashboard:**
```
URL: https://your-app.vercel.app/?businessId=fitness_pro_123
Expected: Shows 7 total members, 2 active, 2 at-risk, 3 churned
```

### **2. Test Webhook Events:**
Send these test webhook events to simulate the scenario:

```bash
# Maria schedules cancellation
curl -X POST https://your-app.vercel.app/api/webhooks/whop \
  -H "Content-Type: application/json" \
  -d '{
    "type": "membership_cancel_at_period_end_changed",
    "id": "event_maria_cancel",
    "data": {
      "membership": {"id": "user_maria_002"},
      "user": {"email": "maria.r@email.com", "name": "Maria Rodriguez"},
      "product": {"id": "fitness_pro_123", "name": "FitnessMaster Pro"}
    }
  }'

# David actually cancels
curl -X POST https://your-app.vercel.app/api/webhooks/whop \
  -H "Content-Type: application/json" \
  -d '{
    "type": "membership_went_invalid",
    "id": "event_david_churn",
    "data": {
      "membership": {"id": "user_david_003"},
      "user": {"email": "david.chen@email.com", "name": "David Chen"},
      "product": {"id": "fitness_pro_123", "name": "FitnessMaster Pro"}
    }
  }'
```

### **3. Test Survey:**
```
URL: https://your-app.vercel.app/survey?memberId=user_david_003&businessId=fitness_pro_123
Expected: Shows exit survey form
```

---

## 🎭 Demo Script for Sales

**"Meet Sarah Johnson, owner of FitnessMaster Pro..."**

*"Sarah was losing 43% of her members to churn. With ChurnGuard, she now:"*

1. **Automatically rescues** members who try to cancel (Maria & Lisa)
2. **Collects feedback** from those who leave (David, Michael, Robert)
3. **Identifies patterns** - pricing, usage, and technical issues
4. **Takes action** based on real data instead of guessing

*"ChurnGuard saved Sarah from losing 2 members and gave her insights to improve her product."*

---

## 💰 Revenue Impact

**Before ChurnGuard:**
- Lost 3 members = $67/month in lost revenue
- No insights on why members left
- No way to prevent cancellations

**After ChurnGuard:**
- Potentially saved 2 members = $58/month recovered
- Clear insights on churn reasons
- Automated retention system in place

**ROI:** ChurnGuard pays for itself by saving just 1-2 members per month!
