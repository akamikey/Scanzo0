
import Razorpay from 'razorpay';
import 'dotenv/config';

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

if (!key_id || !key_secret) {
  console.error('❌ Error: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in environment variables.');
  process.exit(1);
}

const razorpay = new Razorpay({
  key_id,
  key_secret,
});

async function createTestPlan() {
  try {
    console.log('Creating Test Plan...');

    // Razorpay minimum amount for subscriptions is often higher, but let's try ₹1 (100 paise).
    // If 0.1 (10 paise) is requested, it might fail, but let's try ₹1 as it's the standard minimum for transactions.
    const testPlan = await razorpay.plans.create({
      period: 'daily',
      interval: 7, // Minimum 7 days for daily plans
      item: {
        name: 'Test Plan (₹1)',
        amount: 100, // ₹1.00 (100 paise)
        currency: 'INR',
        description: 'Test subscription for verification',
      },
    });
    console.log('✅ Test Plan ID:', testPlan.id);
    console.log('\nAdd this to your .env file:');
    console.log(`RAZORPAY_PLAN_TEST=${testPlan.id}`);

  } catch (error: any) {
    console.error('Error creating test plan:', error);
    if (error.error) {
        console.error('Razorpay Error Details:', JSON.stringify(error.error, null, 2));
    }
  }
}

createTestPlan();
