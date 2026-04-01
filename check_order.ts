import Razorpay from 'razorpay';
import * as dotenv from 'dotenv';
dotenv.config();

const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

async function run() {
  try {
    const order = await rzp.orders.fetch('order_SXverQC7Jybc2B');
    console.log(order);
  } catch (e) {
    console.error(e);
  }
}
run();
