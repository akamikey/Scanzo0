import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://senkiwubyxeozgvycwjo.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlbmtpd3VieXhlb3pndnljd2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NjQyNTMsImV4cCI6MjA4MTU0MDI1M30.97V4aCtU464P2rT6PQn57uUvDsuTpKbsF_vRW0R-3hQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { error } = await supabase.rpc('exec_sql', { sql: `
    DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.subscriptions;
    CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = owner_id);
    
    DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.subscriptions;
    CREATE POLICY "Users can update own subscriptions" ON public.subscriptions FOR UPDATE USING (auth.uid() = owner_id);
  `});
  console.log("Error:", error);
}
run();
