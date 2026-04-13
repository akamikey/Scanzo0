import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorage() {
  const buckets = ['business-logos', 'business-gallery'];
  
  for (const bucketName of buckets) {
    console.log(`Checking bucket: ${bucketName}`);
    const { data, error } = await supabase.storage.getBucket(bucketName);
    
    if (error && error.message.includes('not found')) {
      console.log(`Creating bucket: ${bucketName}`);
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });
      if (createError) console.error(`Error creating bucket ${bucketName}:`, createError);
      else console.log(`Bucket ${bucketName} created successfully`);
    } else if (error) {
      console.error(`Error checking bucket ${bucketName}:`, error);
    } else {
      console.log(`Bucket ${bucketName} already exists`);
    }
  }
}

setupStorage();
