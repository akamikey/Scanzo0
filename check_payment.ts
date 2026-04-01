import Razorpay from 'razorpay';
import * as dotenv from 'dotenv';
dotenv.config();

const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

async function run() {
  try {
    const pay = await rzp.payments.fetch('pay_SXvfU4yJFwNh19');
    console.log(pay);
  } catch (e) {
    console.error(e);
  }
}
run();
