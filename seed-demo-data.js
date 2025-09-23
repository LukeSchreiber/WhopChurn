// Demo data seeder for ChurnGuard testing
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedDemoData() {
  console.log('🌱 Seeding demo data for FitnessMaster Pro...');

  const businessId = 'fitness_pro_123';

  // Demo members data
  const members = [
    {
      whopUserId: 'user_alex_001',
      businessId,
      email: 'alex.thompson@email.com',
      name: 'Alex Thompson',
      status: 'valid',
      productId: 'fitness_pro_123',
      planName: 'Premium Fitness',
      lastActiveAt: new Date('2024-12-22'),
      isAtRisk: false,
    },
    {
      whopUserId: 'user_maria_002',
      businessId,
      email: 'maria.r@email.com',
      name: 'Maria Rodriguez',
      status: 'canceled_at_period_end',
      productId: 'fitness_pro_123',
      planName: 'Basic Fitness',
      lastActiveAt: new Date('2024-12-20'),
      isAtRisk: true,
      riskReason: 'Scheduled cancellation',
      cancelRescueSent: true,
    },
    {
      whopUserId: 'user_david_003',
      businessId,
      email: 'david.chen@email.com',
      name: 'David Chen',
      status: 'invalid',
      productId: 'fitness_pro_123',
      planName: 'Premium Fitness',
      lastActiveAt: new Date('2024-12-15'),
      isAtRisk: true,
      riskReason: 'Membership expired',
      exitSurveyCompleted: true,
      exitSurveyReason: 'Too expensive - found a cheaper alternative',
    },
    {
      whopUserId: 'user_jessica_004',
      businessId,
      email: 'jessica.park@email.com',
      name: 'Jessica Park',
      status: 'valid',
      productId: 'fitness_pro_123',
      planName: 'Premium Fitness',
      lastActiveAt: new Date('2024-12-21'),
      isAtRisk: false,
    },
    {
      whopUserId: 'user_michael_005',
      businessId,
      email: 'mike.brown@email.com',
      name: 'Michael Brown',
      status: 'invalid',
      productId: 'fitness_pro_123',
      planName: 'Basic Fitness',
      lastActiveAt: new Date('2024-12-18'),
      isAtRisk: true,
      riskReason: 'Membership expired',
      exitSurveyCompleted: true,
      exitSurveyReason: "Didn't use it enough - too busy with work",
      paymentRecoverySent: true,
    },
    {
      whopUserId: 'user_lisa_006',
      businessId,
      email: 'lisa.wilson@email.com',
      name: 'Lisa Wilson',
      status: 'canceled_at_period_end',
      productId: 'fitness_pro_123',
      planName: 'Premium Fitness',
      lastActiveAt: new Date('2024-12-19'),
      isAtRisk: true,
      riskReason: 'Scheduled cancellation',
      cancelRescueSent: true,
    },
    {
      whopUserId: 'user_robert_007',
      businessId,
      email: 'robert.t@email.com',
      name: 'Robert Taylor',
      status: 'invalid',
      productId: 'fitness_pro_123',
      planName: 'Premium Fitness',
      lastActiveAt: new Date('2024-12-17'),
      isAtRisk: true,
      riskReason: 'Membership expired',
      exitSurveyCompleted: true,
      exitSurveyReason: 'Technical issues - app kept crashing',
    },
  ];

  // Insert members
  for (const member of members) {
    await prisma.member.upsert({
      where: { whopUserId: member.whopUserId },
      create: member,
      update: member,
    });
    console.log(`✅ Created/updated member: ${member.name}`);
  }

  console.log('');
  console.log('🎉 Demo data seeded successfully!');
  console.log('');
  console.log('📊 Dashboard Summary:');
  console.log('- Total Members: 7');
  console.log('- Active Members: 2 (Alex, Jessica)');
  console.log('- At Risk: 4 (Maria, David, Michael, Lisa, Robert)');
  console.log('- Churned: 3 (David, Michael, Robert)');
  console.log('');
  console.log('🔗 Test your dashboard:');
  console.log('http://localhost:3000/?businessId=fitness_pro_123');
  console.log('');
  console.log('🧪 Run webhook tests:');
  console.log('./test-webhooks.sh');
}

seedDemoData()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
