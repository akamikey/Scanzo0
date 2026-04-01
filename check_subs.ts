import Razorpay from 'razorpay';
import * as dotenv from 'dotenv';
dotenv.config();

const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

async function run() {
  try {
    const subs = await rzp.subscriptions.all({ count: 10 });
    subs.items.forEach(s => {
      console.log(`ID: ${s.id}, Plan: ${s.plan_id}, Status: ${s.status}, Notes: ${JSON.stringify(s.notes)}`);
    });
  } catch (e) {
    console.error(e);
  }
}
run();
