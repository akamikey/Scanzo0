import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function run() {
  const userId = '7eede4b1-eb52-423b-bdfa-ce12faf0653a'; // chennakeshava9812@gmail.com
  const paymentId = 'pay_SXvfU4yJFwNh19';
  const planId = 'monthly';
  
  const paymentDate = new Date(1774981135 * 1000); // 2026-03-31T18:18:55Z
  paymentDate.setMonth(paymentDate.getMonth() + 1); // Expiry date
  
  const newStatus = 'active';

  // Insert into subscriptions
  const { error: subError } = await supabase
    .from('subscriptions')
    .insert({
      owner_id: userId,
      status: newStatus,
      plan_id: planId,
      current_period_end: paymentDate.toISOString(),
      razorpay_subscription_id: `pay_${paymentId}`
    });

  if (subError) {
    console.error("Error inserting subscription:", subError);
    if (subError.code === '23505') {
      await supabase
        .from('subscriptions')
        .update({
          current_period_end: paymentDate.toISOString(),
          status: newStatus
        })
        .eq('razorpay_subscription_id', `pay_${paymentId}`);
    }
  } else {
    console.log("Subscription inserted successfully");
  }

  // Update businesses
  const { error: updateError } = await supabase
    .from('businesses')
    .update({ 
      subscription_status: newStatus,
      plan_id: planId 
    })
    .eq('owner_id', userId);

  if (updateError) {
    console.error("Error updating business:", updateError);
  } else {
    console.log("Business updated successfully");
  }
}
run();
