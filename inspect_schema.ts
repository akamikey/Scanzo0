
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = 'https://senkiwubyxeozgvycwjo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlbmtpd3VieXhlb3pndnljd2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NjQyNTMsImV4cCI6MjA4MTU0MDI1M30.97V4aCtU464P2rT6PQn57uUvDsuTpKbsF_vRW0R-3hQ';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspectTable(tableName: string) {
  console.log(`\n--- Inspecting ${tableName} table ---`);
  const { data, error } = await supabase.from(tableName).select('*').limit(1);
  if (error) {
    console.error(`Error fetching from ${tableName}:`, error.message);
  } else if (data && data.length > 0) {
    console.log(`${tableName} columns:`, Object.keys(data[0]));
  } else {
    console.log(`No rows in ${tableName}. Trying to insert a dummy row...`);
    // Try to insert something to see if it fails with column info
    const { error: insertError } = await supabase.from(tableName).insert({ 
      business_id: '00000000-0000-0000-0000-000000000000',
      rating: 5,
      phone: '1234567890',
      feedback: 'Test'
    });
    if (insertError) {
      console.log(`Insert error:`, insertError.message);
      if (insertError.message.includes('column') && insertError.message.includes('does not exist')) {
        console.log('One of the columns tried does not exist.');
      }
    } else {
      console.log('Insert successful! Columns are likely correct.');
    }
  }
}

async function main() {
  await inspectTable('reviews');
  await inspectTable('private_reviews');
  await inspectTable('businesses');
  await inspectTable('owners');
  await inspectTable('business_pages');
}

main();
