import Razorpay from 'razorpay';
import * as dotenv from 'dotenv';
dotenv.config();

const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

async function run() {
  try {
    const links = await rzp.paymentLink.all();
    console.log(links);
  } catch (e) {
    console.error(e);
  }
}
run();
