import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('owner_id', '7eede4b1-eb52-423b-bdfa-ce12faf0653a')
    .order('created_at', { ascending: false });
  console.log("All subs:", data, error);
}
run();
