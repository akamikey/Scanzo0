import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = 'https://senkiwubyxeozgvycwjo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlbmtpd3VieXhlb3pndnljd2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NjQyNTMsImV4cCI6MjA4MTU0MDI1M30.97V4aCtU464P2rT6PQn57uUvDsuTpKbsF_vRW0R-3hQ';

async function main() {
  try {
    const response = await axios.get(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });
    
    const schema = response.data;
    console.log('--- Schema for private_reviews ---');
    if (schema.definitions && schema.definitions.private_reviews) {
      console.log('private_reviews properties:', Object.keys(schema.definitions.private_reviews.properties));
    } else {
      console.log('private_reviews not found in schema definitions.');
    }

    console.log('\n--- Schema for reviews ---');
    if (schema.definitions && schema.definitions.reviews) {
      console.log('reviews properties:', Object.keys(schema.definitions.reviews.properties));
    } else {
      console.log('reviews not found in schema definitions.');
    }
  } catch (error: any) {
    console.error('Error fetching schema:', error.message);
  }
}

main();
