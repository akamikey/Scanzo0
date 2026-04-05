import Razorpay from 'razorpay';
import * as dotenv from 'dotenv';
dotenv.config();

async function testCreateOrder() {
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
    const amount = 250;
    const userId = 'test_user_id';
    const order = await rzp.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${String(userId).substring(0, 8)}`,
      notes: {
        user_id: userId,
        plan_name: 'monthly'
      }
    });
    console.log('Order created successfully:', order.id);
  } catch (err: any) {
    console.error('Order creation failed:', JSON.stringify(err, null, 2));
  }
}

testCreateOrder();
