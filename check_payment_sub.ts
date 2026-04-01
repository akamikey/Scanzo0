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
    console.log("Payment:", pay);
    if (pay.order_id) {
      const order = await rzp.orders.fetch(pay.order_id);
      console.log("Order:", order);
    }
  } catch (e) {
    console.error(e);
  }
}
run();
