import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
// import { createServer as createViteServer } from 'vite'; // Use dynamic import instead
import 'dotenv/config';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Initialize Supabase Admin Client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://senkiwubyxeozgvycwjo.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlbmtpd3VieXhlb3pndnljd2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NjQyNTMsImV4cCI6MjA4MTU0MDI1M30.97V4aCtU464P2rT6PQn57uUvDsuTpKbsF_vRW0R-3hQ';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase credentials. Webhooks may fail.');
}

const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_live_SM4JPqCFdqdZ4X',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'VIvR1Uk5Hvq0FtHxnf85TXhg',
});

app.use(cors());

// Webhook route - needs raw body for signature verification
app.use('/api/webhook/razorpay', bodyParser.raw({ type: 'application/json' }));
app.use(bodyParser.json());

// API Routes

// Configuration Constants
const getCleanPlanId = (envVar: string | undefined, fallback: string) => {
    // If env var exists and is NOT a URL, use it. Otherwise use fallback.
    if (envVar && !envVar.startsWith('http')) return envVar;
    return fallback;
};

const PLAN_CONFIG: Record<string, { id: string | undefined, total_count: number }> = {
  'monthly': { 
    id: getCleanPlanId(process.env.RAZORPAY_PLAN_MONTHLY, 'plan_SBmRucECQ7R5dJ'),
    total_count: 60 // 5 years
  },
  'biannual': { 
    id: getCleanPlanId(process.env.RAZORPAY_PLAN_BIANNUAL, 'plan_SBmc0r5xUg65iM'),
    total_count: 10 // 5 years
  },
  'annual': { 
    id: getCleanPlanId(process.env.RAZORPAY_PLAN_ANNUAL, 'plan_SM3t9nNkfUECGe'),
    total_count: 5 // 5 years
  },
  'test': {
    id: process.env.RAZORPAY_PLAN_TEST,
    total_count: 1 // Just 1 cycle for test
  }
};

const FALLBACK_LINKS: Record<string, string> = {
  'monthly': 'https://rzp.io/rzp/nZnTHmQ',
  'biannual': 'https://rzp.io/rzp/MT7xfzg',
  'annual': 'https://rzp.io/rzp/XGJVvxe',
};

// 1. Create Subscription Link
app.post('/api/create-subscription', async (req, res) => {
  try {
    const { planId, userId } = req.body;

    if (!planId || !userId) {
      return res.status(400).json({ error: 'Missing planId or userId' });
    }

    const planConfig = PLAN_CONFIG[planId];

    if (!planConfig) {
      return res.status(400).json({ error: 'Invalid Plan ID configuration' });
    }

    const razorpayPlanId = planConfig.id;

    // Helper to return fallback response
    const returnFallback = () => {
        if (FALLBACK_LINKS[planId]) {
            console.log(`Using fallback link for plan ${planId}`);
            return res.json({
                id: 'fallback_' + Date.now(),
                short_url: FALLBACK_LINKS[planId],
                status: 'created',
                is_fallback: true
            });
        }
        return res.status(500).json({ 
            error: `Server configuration error: Plan ID for '${planId}' is missing and no fallback link available.` 
        });
    };

    // If no Razorpay Plan ID is configured, use fallback link immediately
    if (!razorpayPlanId || 
        razorpayPlanId.includes('plan_monthly_id') || 
        razorpayPlanId.includes('plan_biannual_id') || 
        razorpayPlanId.includes('plan_annual_id')) {
      
      console.log(`No valid Razorpay Plan ID configured for '${planId}', using fallback link.`);
      return returnFallback();
    }

    console.log(`Creating subscription for user ${userId} with plan ${razorpayPlanId}`);

    try {
      // Create Subscription
      const subscription = await razorpay.subscriptions.create({
        plan_id: razorpayPlanId,
        total_count: planConfig.total_count,
        quantity: 1,
        customer_notify: 1,
        notes: {
          user_id: userId,
          internal_plan_id: planId
        }
      });

      res.json({
        id: subscription.id,
        short_url: subscription.short_url,
        status: subscription.status,
        key_id: process.env.RAZORPAY_KEY_ID // Send public key to frontend
      });
    } catch (apiError: any) {
      const errorDesc = apiError.error?.description || apiError.message;
      console.warn(`Razorpay Subscription API failed for plan ${planId} (${razorpayPlanId}). Error: ${errorDesc}`);
      
      // If the error is about invalid ID, definitely use fallback
      if (errorDesc.includes('id provided does not exist') || errorDesc.includes('The id provided does not exist')) {
          console.log('Invalid Plan ID detected. Switching to fallback.');
          return returnFallback();
      }
      
      // For other errors, also try fallback
      return returnFallback();
    }

  } catch (error: any) {
    console.error('Error creating subscription:', JSON.stringify(error, null, 2));
    const errorMessage = error.error?.description || error.message || 'Failed to create subscription';
    res.status(500).json({ error: errorMessage });
  }
});

// 2. Webhook Handler
app.post('/api/webhook/razorpay', async (req: any, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '123456';

  if (process.env.RAZORPAY_WEBHOOK_SECRET === undefined) {
      console.warn('Warning: RAZORPAY_WEBHOOK_SECRET is not set. Using default secret "123456". Ensure this matches your Razorpay Dashboard setting.');
  }
  
  const shasum = crypto.createHmac('sha256', secret);
  shasum.update(req.body); // req.body is buffer due to bodyParser.raw
  const digest = shasum.digest('hex');

  if (digest === req.headers['x-razorpay-signature']) {
    console.log('Webhook verified');
    
    try {
      const body = JSON.parse(req.body.toString());
      const event = body.event;
      const payload = body.payload;

      if (event === 'subscription.activated') {
        const sub = payload.subscription.entity;
        const userId = sub.notes?.user_id;
        const planId = sub.notes?.internal_plan_id;

        if (userId) {
            console.log(`Activating subscription for user ${userId}`);
            
            if (!supabase) {
                console.error('Supabase client not initialized - missing credentials');
                return res.status(500).json({ error: 'Server configuration error' });
            }

            // 1. Insert into 'subscriptions' table
            // We use insert because razorpay_subscription_id column doesn't exist
            // and we want to keep history. AuthContext picks the latest active one.
            const endDate = new Date(sub.current_end * 1000).toISOString();
            
            const { error: subError } = await supabase
                .from('subscriptions')
                .insert({
                    owner_id: userId,
                    status: 'active',
                    current_period_end: endDate,
                    plan_id: planId,
                    amount_paid: sub.item?.amount ? sub.item.amount / 100 : 0,
                    razorpay_subscription_id: sub.id
                });

            if (subError) console.error('Error inserting into subscriptions table:', subError);

            // 2. Update 'businesses' table status
            const { error: bizError } = await supabase
                .from('businesses')
                .update({ 
                    plan_id: planId || 'premium',
                    subscription_status: 'active'
                })
                .eq('owner_id', userId);

            if (bizError) console.error('Error updating businesses table:', bizError);
        }
      }
      
      // Handle other events like subscription.charged, subscription.cancelled etc.

      res.json({ status: 'ok' });
    } catch (err) {
      console.error('Error processing webhook payload:', err);
      res.status(500).json({ error: 'Processing failed' });
    }
  } else {
    console.log('Invalid signature');
    res.status(400).json({ error: 'Invalid signature' });
  }
});

// 3. Restore Purchase Endpoint
app.post('/api/restore-purchase', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing authorization header' });

  const token = authHeader.split(' ')[1];
  
  // Verify user
  const { data: { user }, error: userError } = await supabase!.auth.getUser(token);

  if (userError || !user || !user.email) {
      return res.status(401).json({ error: 'Invalid token or user not found' });
  }

  const email = user.email;
  console.log(`Restoring purchase for ${email} (${user.id})`);

  let foundValidPayment = false;
  let planId = 'starter'; // Default fallback
  let paymentDate = new Date();
  let amountPaid = 250;
  let razorpayId = '';
  let isSubscription = false;

  try {
      // 1. Check Subscriptions
      const subscriptions = await razorpay.subscriptions.all({ count: 50 });
      for (const sub of subscriptions.items) {
          if ((sub.notes && sub.notes.user_id === user.id) || 
              (sub.notes && sub.notes.email === email)) {
              
              if (sub.status === 'active' || sub.status === 'authenticated') {
                  foundValidPayment = true;
                  isSubscription = true;
                  razorpayId = sub.id;
                  if (sub.plan_id.includes('monthly') || sub.plan_id === PLAN_CONFIG['monthly'].id) planId = 'monthly';
                  else if (sub.plan_id.includes('annual') || sub.plan_id === PLAN_CONFIG['annual'].id) planId = 'annual';
                  else if (sub.plan_id.includes('biannual') || sub.plan_id === PLAN_CONFIG['biannual'].id) planId = 'biannual';
                  else if (sub.plan_id.includes('test') || sub.plan_id === PLAN_CONFIG['test']?.id) planId = 'test';
                  else planId = 'starter';
                  
                  if (sub.current_end) {
                      paymentDate = new Date(sub.current_end * 1000);
                  }
                  break;
              }
          }
      }

      // 2. Check Payments (Fallback)
      if (!foundValidPayment) {
          const payments = await razorpay.payments.all({ count: 50 });
          for (const pay of payments.items) {
              if ((pay.email === email || pay.contact === email) && pay.status === 'captured') {
                  foundValidPayment = true;
                  isSubscription = false;
                  razorpayId = pay.id;
                  // Infer plan from amount (paise)
                  const amount = Number(pay.amount);
                  if (amount >= 225000) { planId = 'annual'; amountPaid = 2250; }
                  else if (amount >= 125000) { planId = 'biannual'; amountPaid = 1250; }
                  else { planId = 'starter'; amountPaid = 250; }
                  
                  paymentDate = new Date(pay.created_at * 1000);
                  // Add duration
                  if (planId === 'annual') paymentDate.setFullYear(paymentDate.getFullYear() + 1);
                  else if (planId === 'biannual') paymentDate.setMonth(paymentDate.getMonth() + 6);
                  else paymentDate.setMonth(paymentDate.getMonth() + 1);
                  
                  break;
              }
          }
      }

      if (foundValidPayment) {
          console.log(`Found valid payment for ${email}. Activating... End Date: ${paymentDate.toISOString()}`);
          
          if (!supabase) {
              return res.status(500).json({ error: 'Server configuration error: Supabase client missing' });
          }

          // 1. Insert into subscriptions (using admin client to bypass RLS)
          // We use insert to ensure we have the latest subscription info
          const { error: subError } = await supabase
              .from('subscriptions')
              .insert({
                  owner_id: user.id,
                  status: 'active',
                  plan_id: planId,
                  amount_paid: amountPaid,
                  current_period_end: paymentDate.toISOString(),
                  razorpay_subscription_id: isSubscription ? razorpayId : null,
                  razorpay_payment_id: !isSubscription ? razorpayId : null
              });

          if (subError) {
              console.error("Error inserting subscription:", subError);
              // Continue to update business even if subscription log fails, as business status is critical for access
          }

          // 2. Update Business Status (using admin client)
          const { error: updateError } = await supabase
              .from('businesses')
              .update({ 
                  subscription_status: 'active',
                  plan_id: planId 
              })
              .eq('owner_id', user.id);

          if (updateError) {
              console.error("Error updating business:", updateError);
              return res.status(500).json({ error: 'Failed to update business status. Please contact support.' });
          }

          return res.json({ success: true, message: 'Subscription activated successfully' });
      } else {
          return res.status(404).json({ error: 'No active payment found for this email. If you paid recently, please wait a few minutes and try again.' });
      }

  } catch (err: any) {
      console.error("Error in restore-purchase:", err);
      return res.status(500).json({ error: 'Internal server error checking payment status: ' + err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Vite Middleware (for Development)
// We check if we are in production OR if dist exists and we want to serve it
// Static File Serving Logic
// We prioritize serving from 'dist' if it exists, as that is the production build.
import fs from 'fs';

const distPath = path.join(__dirname, 'dist');
const distExists = fs.existsSync(distPath);

console.log(`[Server] Environment: ${process.env.NODE_ENV}`);
console.log(`[Server] Dist Path: ${distPath}`);
console.log(`[Server] Dist Exists: ${distExists}`);

const isProduction = process.env.NODE_ENV === 'production' || process.env.npm_lifecycle_event === 'start';

// Force production mode serving if dist exists AND we are in production mode
if (distExists && isProduction) {
  console.log('[Server] Serving static files from dist folder...');
  
  // Serve static assets
  app.use(express.static(distPath));

  // SPA Fallback for all non-API routes
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
         res.sendFile(indexPath);
      } else {
         console.error(`[Server] Error: index.html not found at ${indexPath}`);
         res.status(500).send('<h1>Application Error</h1><p>Application build found but index.html is missing. Please run npm run build.</p>');
      }
    }
  });
} else if (!process.env.VERCEL) {
  console.log('[Server] Starting Vite Dev Server...');
  try {
      // Dynamic import for Vite
      const viteModule = await import('vite');
      const vite = await viteModule.createServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
  } catch (e) {
      console.error('[Server] Failed to start Vite Dev Server:', e);
      app.get('*', (req, res) => {
          res.status(500).send('<h1>Application Error</h1><p>Failed to start development server. Please check logs.</p>');
      });
  }
}

// Global Fallback for unmatched routes (should be caught by above logic, but just in case)
app.use((req, res) => {
    res.status(404).send('<h1>404 Not Found</h1><p>The requested URL was not found on this server (Express fallback).</p>');
});

// For Vercel deployment, we export the app and only listen if not in a serverless environment
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    
    // Diagnostic Logging
    console.log('--- Razorpay Configuration Diagnostics ---');
    console.log(`Key ID Present: ${!!process.env.RAZORPAY_KEY_ID} (Using: ${process.env.RAZORPAY_KEY_ID ? 'Custom Env Var' : 'Default Fallback'})`);
    console.log(`Key Secret Present: ${!!process.env.RAZORPAY_KEY_SECRET}`);
    console.log(`Plan Monthly: ${PLAN_CONFIG['monthly'].id} (${process.env.RAZORPAY_PLAN_MONTHLY ? 'Custom' : 'Default'})`);
    console.log(`Plan Biannual: ${PLAN_CONFIG['biannual'].id} (${process.env.RAZORPAY_PLAN_BIANNUAL ? 'Custom' : 'Default'})`);
    console.log(`Plan Annual: ${PLAN_CONFIG['annual'].id} (${process.env.RAZORPAY_PLAN_ANNUAL ? 'Custom' : 'Default'})`);
    console.log(`Webhook URL: ${process.env.APP_URL || 'https://<YOUR_APP_URL>'}/api/webhook/razorpay`);
    console.log('------------------------------------------');
  });
}

export default app;
