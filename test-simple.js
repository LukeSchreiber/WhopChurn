// Simple test script for ChurnGuard demo
require('dotenv').config({ path: '.env.local' });
const crypto = require('crypto');

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'test_secret_123';
const APP_URL = 'http://localhost:3001';

function createSignature(body) {
  const timestamp = Math.floor(Date.now() / 1000);
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  hmac.update(timestamp + '.' + body);
  const signature = hmac.digest('hex');
  return `t=${timestamp},v1=${signature}`;
}

async function testWebhook(eventType, eventId, data) {
  const payload = {
    type: eventType,
    id: eventId,
    data: data
  };
  
  const body = JSON.stringify(payload);
  const signature = createSignature(body);
  
  console.log(`\n🧪 Testing ${eventType}...`);
  
  try {
    const response = await fetch(`${APP_URL}/api/webhooks/whop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-whop-signature': signature,
      },
      body: body,
    });
    
    const result = await response.text();
    console.log(`✅ Status: ${response.status}`);
    console.log(`📝 Response: ${result}`);
    
    return response.status === 200;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting ChurnGuard Demo Tests...\n');
  
  // Test 1: Cancel Rescue - Maria schedules cancellation
  await testWebhook('membership_cancel_at_period_end_changed', 'demo_maria_cancel', {
    membership: { id: 'user_maria_002' },
    user: { email: 'maria.r@email.com', name: 'Maria Rodriguez' },
    product: { id: 'fitness_pro_123', name: 'FitnessMaster Pro' }
  });
  
  // Test 2: Exit Survey - David cancels
  await testWebhook('membership_went_invalid', 'demo_david_churn', {
    membership: { id: 'user_david_003' },
    user: { email: 'david.chen@email.com', name: 'David Chen' },
    product: { id: 'fitness_pro_123', name: 'FitnessMaster Pro' }
  });
  
  // Test 3: Payment Recovery - Michael's payment fails
  await testWebhook('payment_failed', 'demo_michael_payment', {
    membership: { id: 'user_michael_005' },
    user: { email: 'mike.brown@email.com', name: 'Michael Brown' },
    product: { id: 'fitness_pro_123', name: 'FitnessMaster Pro' }
  });
  
  // Test 4: Cancel Rescue - Lisa schedules cancellation
  await testWebhook('membership_cancel_at_period_end_changed', 'demo_lisa_cancel', {
    membership: { id: 'user_lisa_006' },
    user: { email: 'lisa.wilson@email.com', name: 'Lisa Wilson' },
    product: { id: 'fitness_pro_123', name: 'FitnessMaster Pro' }
  });
  
  // Test 5: Exit Survey - Robert cancels
  await testWebhook('membership_went_invalid', 'demo_robert_churn', {
    membership: { id: 'user_robert_007' },
    user: { email: 'robert.t@email.com', name: 'Robert Taylor' },
    product: { id: 'fitness_pro_123', name: 'FitnessMaster Pro' }
  });
  
  // Test 6: Active member - Jessica renews
  await testWebhook('membership_went_valid', 'demo_jessica_renew', {
    membership: { id: 'user_jessica_004' },
    user: { email: 'jessica.park@email.com', name: 'Jessica Park' },
    product: { id: 'fitness_pro_123', name: 'FitnessMaster Pro' }
  });
  
  console.log('\n🎉 Demo tests completed!');
  console.log('\n📊 Check your dashboard at:');
  console.log(`${APP_URL}/?businessId=fitness_pro_123`);
  console.log('\n💡 Expected results:');
  console.log('- Cancel rescue messages sent to Maria & Lisa');
  console.log('- Exit surveys sent to David & Robert');
  console.log('- Payment recovery sent to Michael');
  console.log('- Jessica marked as active');
}

runTests().catch(console.error);
