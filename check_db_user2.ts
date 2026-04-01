import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function run() {
  const userId = 'f11cf2c6-9765-48ae-9a13-df3ba2c10fa6';
  const { data: subs, error: subError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('owner_id', userId);
  console.log("Subscriptions:", subs);
  console.log("Sub Error:", subError);

  const { data: business } = await supabase
    .from('businesses')
    .select('subscription_status, plan_id')
    .eq('owner_id', userId);
  console.log("Business:", business);
}
run();
