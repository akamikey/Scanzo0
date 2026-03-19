
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://senkiwubyxeozgvycwjo.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlbmtpd3VieXhlb3pndnljd2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NjQyNTMsImV4cCI6MjA4MTU0MDI1M30.97V4aCtU464P2rT6PQn57uUvDsuTpKbsF_vRW0R-3hQ';

console.log('Using key:', supabaseServiceKey.substring(0, 10) + '...');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const userId = '7eede4b1-eb52-423b-bdfa-ce12faf0653a'; // The user ID from previous turn

async function activate() {
    console.log(`Activating user ${userId}...`);

    // 1. Update businesses table
    const { data: bizData, error: bizError } = await supabase
        .from('businesses')
        .update({ 
            subscription_status: 'active',
        })
        .eq('owner_id', userId)
        .select();

    if (bizError) {
        console.error('Error updating businesses:', bizError);
    } else {
        console.log('Businesses update result:', bizData);
    }

    // 2. Insert into subscriptions table
    // We try to insert with minimal columns that we know exist
    const { error: subError } = await supabase
        .from('subscriptions')
        .upsert({
            owner_id: userId,
            active: true,
            end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        }, { onConflict: 'owner_id' }); // Assuming owner_id might be unique or we want to update existing

    if (subError) {
        console.error('Error updating subscriptions:', subError);
        
        // If error is about missing column, we can try again
        if (subError.message.includes('razorpay_subscription_id')) {
             console.log("Retrying with razorpay_subscription_id...");
        }
    } else {
        console.log('Successfully updated subscriptions table.');
    }
}

activate();
