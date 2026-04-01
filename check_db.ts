import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://senkiwubyxeozgvycwjo.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlbmtpd3VieXhlb3pndnljd2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NjQyNTMsImV4cCI6MjA4MTU0MDI1M30.97V4aCtU464P2rT6PQn57uUvDsuTpKbsF_vRW0R-3hQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  if (userError) {
    console.error("Error fetching users:", userError);
    return;
  }
  
  const user = users.users.find(u => u.email === 'chennakeshava9812@gmail.com');
  if (!user) {
    console.log("User not found");
    return;
  }
  
  console.log("User ID:", user.id);
  
  const { data: subs, error: subError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('owner_id', user.id);
    
  console.log("Subscriptions:", subs);
  console.log("Sub Error:", subError);
  
  const { data: biz, error: bizError } = await supabase
    .from('businesses')
    .select('subscription_status, plan_id')
    .eq('owner_id', user.id);
    
  console.log("Business:", biz);
}
run();
