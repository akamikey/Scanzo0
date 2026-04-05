import Razorpay from 'razorpay';
import * as dotenv from 'dotenv';
dotenv.config();

async function testCreateSubscription() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    console.error('Keys missing');
    return;
  }

  const rzp = new (Razorpay as any)({
    key_id,
    key_secret
  });

  try {
    const planId = 'plan_SVVP7NfadsPhgb'; // Monthly
    const userId = 'test_user_id';
    const subscription = await rzp.subscriptions.create({
      plan_id: planId,
      total_count: 120,
      quantity: 1,
      customer_notify: 1,
      notes: {
        user_id: userId,
        internal_plan_id: 'monthly'
      }
    });
    console.log('Subscription created successfully:', subscription.id);
  } catch (err: any) {
    console.error('Subscription creation failed:', JSON.stringify(err, null, 2));
  }
}

testCreateSubscription();
