import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();

const test = () => {
  try {
    console.log('Razorpay type:', typeof Razorpay);
    const RazorpayConstructor: any = (Razorpay as any).default || Razorpay;
    console.log('RazorpayConstructor type:', typeof RazorpayConstructor);
    
    const key_id = process.env.RAZORPAY_KEY_ID || 'test_id';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'test_secret';
    
    const instance = new RazorpayConstructor({
      key_id,
      key_secret
    });
    console.log('Instance created successfully');
  } catch (e) {
    console.error('Error:', e);
  }
};

test();
