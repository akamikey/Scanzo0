import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://senkiwubyxeozgvycwjo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlbmtpd3VieXhlb3pndnljd2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NjQyNTMsImV4cCI6MjA4MTU0MDI1M30.97V4aCtU464P2rT6PQn57uUvDsuTpKbsF_vRW0R-3hQ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { error } = await supabase.rpc('exec_sql', { sql: `
    DROP POLICY IF EXISTS "Users can view their own businesses" ON public.businesses;
    CREATE POLICY "Public can view businesses" ON public.businesses FOR SELECT USING (true);
  `});
  console.log("Error:", error);
}
run();
