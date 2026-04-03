import Razorpay from 'razorpay';
import * as dotenv from 'dotenv';
dotenv.config();

const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

async function run() {
  try {
    const order = await rzp.orders.create({
      amount: 100, // 1 INR
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        user_id: "test_user",
        plan_name: "test_plan",
        razorpay_plan_id: undefined
      }
    });
    console.log(order);
  } catch (e) {
    console.error(e);
  }
}
run();
