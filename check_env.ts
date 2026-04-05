import * as dotenv from 'dotenv';
dotenv.config();

console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'PRESENT (' + process.env.RAZORPAY_KEY_ID.substring(0, 8) + '...)' : 'MISSING');
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'PRESENT (' + process.env.RAZORPAY_KEY_SECRET.substring(0, 4) + '...)' : 'MISSING');
console.log('RAZORPAY_PLAN_MONTHLY:', process.env.RAZORPAY_PLAN_MONTHLY || 'MISSING');
console.log('RAZORPAY_PLAN_BIANNUAL:', process.env.RAZORPAY_PLAN_BIANNUAL || 'MISSING');
console.log('RAZORPAY_PLAN_ANNUAL:', process.env.RAZORPAY_PLAN_ANNUAL || 'MISSING');
