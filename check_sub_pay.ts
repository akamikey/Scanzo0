import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function run() {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('razorpay_subscription_id', 'pay_pay_SXvfU4yJFwNh19');
  console.log(data, error);
}
run();
