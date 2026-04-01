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
    const link = links.payment_links.find((l: any) => l.order_id === 'order_SXverQC7Jybc2B');
    console.log(link);
  } catch (e) {
    console.error(e);
  }
}
run();
