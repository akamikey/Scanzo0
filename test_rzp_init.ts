import Razorpay from 'razorpay';
import * as dotenv from 'dotenv';
dotenv.config();

const getRazorpayInstance = () => {
  try {
    let key_id = (process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID)?.trim();
    let key_secret = (process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRETE || process.env.VITE_RAZORPAY_KEY_SECRET)?.trim();

    if (!key_id || !key_secret) {
      console.warn('[Server] Razorpay keys missing in environment');
      return null;
    }

    const RazorpayConstructor: any = (Razorpay as any).default || Razorpay;
    
    console.log('Razorpay type:', typeof Razorpay);
    console.log('Razorpay.default type:', typeof (Razorpay as any).default);
    console.log('RazorpayConstructor type:', typeof RazorpayConstructor);

    if (typeof RazorpayConstructor !== 'function') {
        console.error('[Razorpay] Constructor is not a function. Type:', typeof RazorpayConstructor);
        return null;
    }

    const instance = new RazorpayConstructor({
      key_id: key_id,
      key_secret: key_secret,
    });
    
    return instance;
  } catch (e) {
    console.error('[Server] Razorpay Instance Creation Error:', e);
    return null;
  }
};

const rzp = getRazorpayInstance();
if (rzp) {
    console.log('Razorpay instance created successfully');
} else {
    console.log('Failed to create Razorpay instance');
}
