
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = 'https://senkiwubyxeozgvycwjo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlbmtpd3VieXhlb3pndnljd2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NjQyNTMsImV4cCI6MjA4MTU0MDI1M30.97V4aCtU464P2rT6PQn57uUvDsuTpKbsF_vRW0R-3hQ';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspect() {
  const { data, error } = await supabase.from('reviews').select('*').limit(1);
  if (data && data.length > 0) {
    console.log('reviews columns:', Object.keys(data[0]));
  } else {
    console.log('No reviews found to inspect columns');
    // Try to insert a dummy review to see if it fails and what columns it expects
    const { error: insertError } = await supabase.from('reviews').insert({ rating: 5 });
    console.log('Insert error (might reveal missing columns):', insertError);
  }
}

inspect();
