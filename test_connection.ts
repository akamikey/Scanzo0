import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

dotenv.config({ override: true });

const test = async () => {
    console.log('--- Connection Test ---');
    
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    
    console.log(`Supabase URL: ${supabaseUrl}`);
    
    if (supabaseUrl && supabaseKey) {
        try {
            const supabase = createClient(supabaseUrl, supabaseKey);
            const { data, error } = await supabase.from('owners').select('count', { count: 'exact', head: true });
            if (error) {
                console.error(`Supabase Error: ${error.message}`);
            } else {
                console.log(`Supabase Connection: SUCCESS (Count: ${data})`);
            }
        } catch (err: any) {
            console.error(`Supabase Exception: ${err.message}`);
        }
    } else {
        console.warn('Supabase credentials missing');
    }
    
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    
    if (keyId && keySecret) {
        try {
            const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;
            const response = await axios.get('https://api.razorpay.com/v1/plans?count=1', {
                headers: { 'Authorization': authHeader }
            });
            console.log(`Razorpay Connection: SUCCESS (Status: ${response.status})`);
        } catch (err: any) {
            console.error(`Razorpay Error: ${err.response?.data?.error?.description || err.message}`);
        }
    } else {
        console.warn('Razorpay credentials missing');
    }
    
    console.log('--- Test Complete ---');
};

test();
