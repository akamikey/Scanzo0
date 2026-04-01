import Razorpay from 'razorpay';
import * as dotenv from 'dotenv';
dotenv.config();

const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

async function run() {
  try {
    const payments = await rzp.payments.all({ count: 20 });
    payments.items.forEach(p => {
      console.log(`ID: ${p.id}, Amount: ${p.amount}, Status: ${p.status}, Notes: ${JSON.stringify(p.notes)}`);
    });
  } catch (e) {
    console.error(e);
  }
}
run();
