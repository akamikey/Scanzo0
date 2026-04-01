import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";

// Ensure .env variables take precedence
dotenv.config({ override: true });

console.log('[Server] Starting server initialization...');

const app = express();
const PORT = 3000;

// 1. Basic Middleware
app.use(cors());

// Webhook Handler needs raw body for signature verification
app.post('/api/webhook/razorpay', express.raw({ type: 'application/json' }), async (req: any, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'scanzo123';

  if (!secret) {
    console.error('RAZORPAY_WEBHOOK_SECRET is not set. Webhook verification failed.');
    return res.status(400).json({ error: 'Webhook secret not configured' });
  }
  
  const shasum = crypto.createHmac('sha256', secret);
  shasum.update(req.body); // req.body is now a buffer
  const digest = shasum.digest('hex');

  const signature = req.headers['x-razorpay-signature'];

  if (digest === signature) {
    console.log('Webhook verified');
    
    try {
      const body = JSON.parse(req.body.toString());
      const event = body.event;
      const payload = body.payload;

      if (event === 'subscription.activated' || event === 'subscription.charged') {
        const sub = payload.subscription.entity;
        const userId = sub.notes?.user_id;
        const planId = sub.notes?.internal_plan_id;

        if (userId) {
            console.log(`[Webhook] ${event} for user ${userId}. Plan: ${planId}`);
            
            if (!supabase) {
                console.error('Supabase client not initialized - missing credentials');
                return res.status(500).json({ error: 'Server configuration error' });
            }

            const amountPaid = (sub.paid_count || 1) * 250; // Simplified
            const endDate = new Date(sub.current_end * 1000).toISOString();

            // 1. Insert into 'subscriptions' table
            const { error: subError } = await supabase
                .from('subscriptions')
                .insert({
                    owner_id: userId,
                    status: 'active',
                    current_period_end: endDate,
                    plan_id: planId || 'premium',
                    razorpay_subscription_id: sub.id
                });

            if (subError) {
                if (subError.code === '23505') { // unique violation
                    await supabase
                        .from('subscriptions')
                        .update({
                            current_period_end: endDate,
                            status: 'active',
                            razorpay_subscription_id: sub.id,
                            plan_id: planId || 'premium'
                        })
                        .eq('owner_id', userId);
                } else {
                    console.error('Error inserting into subscriptions table:', subError);
                }
            }

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
      } else if (event === 'payment.captured' || event === 'order.paid') {
        const payment = event === 'payment.captured' ? payload.payment.entity : payload.payment?.entity;
        if (!payment) return res.json({ status: 'ok' });

        const userId = payment.notes?.user_id;
        let planId = payment.notes?.plan_name || payment.notes?.plan_id;

        if (userId) {
            console.log(`[Webhook] ${event} for user ${userId}. Plan: ${planId}`);
            
            if (!supabase) {
                console.error('Supabase client not initialized - missing credentials');
                return res.status(500).json({ error: 'Server configuration error' });
            }

            // Infer plan from amount if missing
            const amount = Number(payment.amount);
            if (!planId) {
                if (amount >= 250000) { planId = 'annual'; }
                else if (amount >= 125000) { planId = 'biannual'; }
                else { planId = 'monthly'; }
            }

            const paymentDate = new Date(payment.created_at * 1000);
            if (planId === 'annual') paymentDate.setFullYear(paymentDate.getFullYear() + 1);
            else if (planId === 'biannual') paymentDate.setMonth(paymentDate.getMonth() + 6);
            else paymentDate.setMonth(paymentDate.getMonth() + 1);

            const amountPaid = amount / 100;

            const isExpired = paymentDate < new Date();
            const newStatus = isExpired ? 'expired' : 'active';

            // 1. Insert into 'subscriptions' table
            const { error: subError } = await supabase
                .from('subscriptions')
                .insert({
                    owner_id: userId,
                    status: newStatus,
                    current_period_end: paymentDate.toISOString(),
                    plan_id: planId,
                    razorpay_subscription_id: `pay_${payment.id}`
                });

            if (subError) {
                if (subError.code === '23505') { // unique violation
                    await supabase
                        .from('subscriptions')
                        .update({
                            current_period_end: paymentDate.toISOString(),
                            status: newStatus,
                            razorpay_subscription_id: `pay_${payment.id}`,
                            plan_id: planId
                        })
                        .eq('owner_id', userId);
                } else {
                    console.error('Error inserting into subscriptions table:', subError);
                }
            }

            // 2. Update 'businesses' table status
            const { error: bizError } = await supabase
                .from('businesses')
                .update({ 
                    plan_id: planId || 'premium',
                    subscription_status: newStatus
                })
                .eq('owner_id', userId);

            if (bizError) console.error('Error updating businesses table:', bizError);
        }
      } else if (event === 'subscription.cancelled' || event === 'subscription.halted') {
        const sub = payload.subscription.entity;
        const userId = sub.notes?.user_id;

        if (userId) {
            console.log(`[Webhook] ${event} for user ${userId}`);
            
            if (supabase) {
                await supabase
                    .from('subscriptions')
                    .update({ status: 'cancelled' })
                    .eq('razorpay_subscription_id', sub.id);

                await supabase
                    .from('businesses')
                    .update({ subscription_status: 'inactive' })
                    .eq('owner_id', userId);
            }
        }
      }
    } catch (err) {
      console.error('Error processing webhook payload:', err);
    }
    res.json({ status: 'ok' });
  } else {
    console.error('Webhook signature mismatch');
    res.status(400).json({ error: 'Invalid signature' });
  }
});

// JSON parser for all other routes
app.use(express.json());

// 2. Diagnostics endpoint (Absolute top, no complex logic)
app.get('/api/diagnostics', async (req, res) => {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    
    let razorpayStatus = 'not_tested';
    let razorpayError = null;

    if (keyId && keySecret) {
        try {
            const rzp = getRazorpayInstance();
            if (rzp) {
                // Try to fetch plans to test authentication
                const plans = await rzp.plans.all({ count: 1 });
                razorpayStatus = 'authenticated';
                console.log(`[Diagnostics] Razorpay authenticated successfully. Found ${plans.items.length} plans.`);
            } else {
                razorpayStatus = 'missing_keys';
                razorpayError = 'RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing or empty.';
            }
        } catch (err: any) {
            razorpayStatus = 'failed';
            razorpayError = err.error?.description || err.message;
            const statusCode = err.statusCode || (err.error ? err.error.code : 'UNKNOWN');
            console.error(`[Diagnostics] Razorpay authentication failed (Status: ${statusCode}): ${razorpayError}`);
            
            // Manual check with axios to confirm if it's a library issue
            try {
                const axios = (await import('axios')).default;
                
                // Try exactly what test_auth.ts does
                const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;
                
                try {
                    const axiosRes = await axios.get('https://api.razorpay.com/v1/plans?count=1', {
                        headers: { 'Authorization': authHeader }
                    });
                    console.log('[Diagnostics] Manual axios check SUCCEEDED.');
                    razorpayStatus = 'authenticated_manual_success';
                } catch (errManual: any) {
                    console.error('[Diagnostics] Manual axios check FAILED:', errManual.response?.data?.error?.description || errManual.message);
                    razorpayStatus = 'failed_manual';
                    razorpayError += ` (Manual check also failed: ${errManual.response?.data?.error?.description || errManual.message})`;
                }
            } catch (axiosErr: any) {
                console.error('[Diagnostics] Manual axios check error:', axiosErr.message);
            }
        }
    }

    res.json({
      status: 'ok',
      vercel: !!process.env.VERCEL,
      node: process.version,
      razorpay: {
          status: razorpayStatus,
          error: razorpayError,
          key_id: keyId ? `${keyId.substring(0, 8)}...` : 'MISSING',
          secret_prefix: keySecret ? `${keySecret.substring(0, 4)}...` : 'MISSING',
          key_type: keyId?.startsWith('rzp_live') ? 'LIVE' : keyId?.startsWith('rzp_test') ? 'TEST' : 'UNKNOWN'
      },
      env_check: {
        has_razorpay_id: !!keyId,
        has_razorpay_secret: !!keySecret,
        has_supabase_url: !!process.env.VITE_SUPABASE_URL || !!process.env.SUPABASE_URL,
        has_supabase_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        has_app_url: !!process.env.APP_URL
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: 'Diagnostics failed', message: err instanceof Error ? err.message : String(err) });
  }
});

// 3. Body Parsing
// Webhook route - needs raw body for signature verification
app.use('/api/webhook/razorpay', express.raw({ type: 'application/json' }));

// 4. Initialize Services Safely
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

let supabase: any = null;
try {
  if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http')) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[Server] Supabase client initialized');
  } else {
    console.error('[Server] Supabase credentials missing or invalid URL!');
  }
} catch (e) {
  console.error('[Server] Supabase Init Error:', e);
}

const getRazorpayInstance = () => {
  try {
    let key_id = (process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID)?.trim();
    let key_secret = (process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRETE || process.env.VITE_RAZORPAY_KEY_SECRET)?.trim();

    if (!key_id || !key_secret) {
      console.warn('[Server] Razorpay keys missing in environment');
      return null;
    }

    // Defensive: Strip rzp_live_ or rzp_test_ prefix from secret if user accidentally included it
    if (key_secret.startsWith('rzp_live_')) {
        key_secret = key_secret.replace('rzp_live_', '');
    } else if (key_secret.startsWith('rzp_test_')) {
        key_secret = key_secret.replace('rzp_test_', '');
    }

    // Handle different import styles for Razorpay
    const RazorpayConstructor: any = (Razorpay as any).default || Razorpay;
    
    if (typeof RazorpayConstructor !== 'function') {
        console.error('[Razorpay] Constructor is not a function. Type:', typeof RazorpayConstructor);
        return null;
    }

    const instance = new RazorpayConstructor({
      key_id: key_id,
      key_secret: key_secret,
    });
    
    return instance;
  } catch (e) {
    console.error('[Server] Razorpay Instance Creation Error:', e);
    return null;
  }
};

let startupTestResult = { status: 'not_run', error: null as string | null };

// Initial check and startup test
const runStartupTest = async () => {
    const rzp = getRazorpayInstance();
    if (rzp) {
        console.log(`[Server] Razorpay instance created. Testing authentication...`);
        try {
            const plans = await rzp.plans.all({ count: 1 });
            console.log(`[Server] Razorpay Startup Test: SUCCESS! Found ${plans.items.length} plans.`);
            startupTestResult = { status: 'success', error: null };
        } catch (err: any) {
            const errorDesc = err.error?.description || err.message || 'Unknown Error';
            console.error(`[Server] Razorpay Startup Test: FAILED! Error: ${errorDesc}`);
            console.error(`[Server] Please verify your RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in the Settings menu.`);
            startupTestResult = { status: 'failed', error: errorDesc };
        }
    } else {
        console.warn(`[Server] Razorpay keys missing or invalid in environment. Startup test skipped.`);
        startupTestResult = { status: 'missing_keys', error: 'Keys missing or invalid' };
    }
};

runStartupTest();

// API Routes

// Configuration Constants
const getCleanPlanId = (envVar: string | undefined, fallback: string) => {
    // If env var exists and is NOT a URL, use it. Otherwise use fallback.
    if (envVar && !envVar.startsWith('http')) return envVar;
    return fallback;
};

const PLAN_CONFIG: Record<string, { id: string | undefined, total_count: number }> = {
  'monthly': { 
    id: getCleanPlanId(process.env.RAZORPAY_PLAN_MONTHLY, 'plan_SVVP7NfadsPhgb'),
    total_count: 120 // 10 years
  },
  'biannual': { 
    id: getCleanPlanId(process.env.RAZORPAY_PLAN_BIANNUAL, 'plan_SVVTUMhJomsRSD'),
    total_count: 20 // 10 years (6 months * 20 = 120 months)
  },
  'annual': { 
    id: getCleanPlanId(process.env.RAZORPAY_PLAN_ANNUAL, 'plan_SVVV0PIfP8o8Il'),
    total_count: 10 // 10 years
  },
  'test': {
    id: process.env.RAZORPAY_PLAN_TEST,
    total_count: 1 // Just 1 cycle for test
  }
};

const FALLBACK_LINKS: Record<string, string> = {
  'monthly': 'https://rzp.io/rzp/nsZoidF',
  'biannual': 'https://rzp.io/rzp/hkHwFb9S',
  'annual': 'https://rzp.io/rzp/rAkjU3k',
};

// 1. Create Subscription Link
app.post('/api/create-subscription', async (req, res) => {
  try {
    const { planId, userId } = req.body || {};
    console.log(`[API] Create Subscription Request - Plan: ${planId}, User: ${userId}`);

    if (!planId || !userId) {
      console.warn('[API] Missing planId or userId in request body');
      return res.status(400).json({ error: 'Missing planId or userId' });
    }

    const planConfig = PLAN_CONFIG[planId];

    if (!planConfig) {
      return res.status(400).json({ error: 'Invalid Plan ID configuration' });
    }

    let razorpayPlanId = planConfig.id;

    // If the configured ID is actually a URL, move it to fallback links
    if (razorpayPlanId && razorpayPlanId.startsWith('http')) {
        console.log(`Detected URL in Plan ID for ${planId}. Using as fallback link.`);
        FALLBACK_LINKS[planId] = razorpayPlanId;
        razorpayPlanId = undefined;
    }

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

    const rzp = getRazorpayInstance();

    if (!rzp) {
        console.log(`[API] Razorpay instance could not be created (missing keys). Using fallback for ${planId}.`);
        return returnFallback();
    }

    const keyId = (process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || 'MISSING').trim();
    try {
      console.log(`[API] Creating subscription for user ${userId} with plan ${razorpayPlanId} using Key ID: ${keyId.substring(0, 8)}...`);
      console.log(`[API] Params: plan_id=${razorpayPlanId}, total_count=${planConfig.total_count}, quantity=1, customer_notify=1`);

      const subscription = await rzp.subscriptions.create({
        plan_id: razorpayPlanId,
        total_count: planConfig.total_count,
        quantity: 1,
        customer_notify: 1,
        // Removed start_at to see if it resolves 500 error
        notes: {
          user_id: userId,
          internal_plan_id: planId
        }
      });

      console.log(`[API] Subscription created successfully: ${subscription.id}`);

      res.json({
        id: subscription.id,
        short_url: subscription.short_url,
        status: subscription.status,
        key_id: process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID
      });
    } catch (apiError: any) {
      console.error('[API] Razorpay Subscription API Error:', apiError);
      const errorDesc = apiError.error?.description || apiError.message || 'Unknown Razorpay Error';
      const keyPrefix = (process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || 'MISSING').trim().substring(0, 8) + '...';
      console.warn(`[API] Razorpay Subscription API failed for plan ${planId} (${razorpayPlanId}) using key ${keyPrefix}. Error: ${errorDesc}`);
      
      // If the error is about invalid ID, definitely use fallback
      if (typeof errorDesc === 'string' && (errorDesc.includes('id provided does not exist') || errorDesc.includes('The id provided does not exist'))) {
          // If the user is trying to use their own plan ID, return an error instead of falling back to our links
          const configuredPlanIds = Object.values(PLAN_CONFIG).map(p => p.id).filter(Boolean);
          if (!configuredPlanIds.includes(razorpayPlanId)) {
              return res.status(500).json({ 
                  error: `Razorpay Subscription API failed: The provided plan ID (${razorpayPlanId}) does not exist in your Razorpay account.` 
              });
          }
          console.log('Invalid Plan ID detected. Switching to fallback.');
          return returnFallback();
      }
      
      // If authentication fails, it's likely a mismatch between keys and plan ID
      if (typeof errorDesc === 'string' && (errorDesc.includes('Authentication failed') || errorDesc.includes('Unauthorized'))) {
          const configuredPlanIds = Object.values(PLAN_CONFIG).map(p => p.id).filter(Boolean);
          const isFallbackPlan = configuredPlanIds.includes(razorpayPlanId);
          const keyId = process.env.RAZORPAY_KEY_ID || 'MISSING';
          
          console.error(`[API] Razorpay Authentication Failed!`);
          console.error(`- Plan ID: ${razorpayPlanId}`);
          console.error(`- Key ID: ${keyId.substring(0, 8)}...`);
          console.error(`- Key Type: ${keyId.startsWith('rzp_live') ? 'LIVE' : keyId.startsWith('rzp_test') ? 'TEST' : 'UNKNOWN'}`);
          console.error(`- Secret Length: ${process.env.RAZORPAY_KEY_SECRET?.length || 0}`);

          if (isFallbackPlan) {
              console.warn(`[API] Authentication failed for fallback plan. Switching to fallback link.`);
              return returnFallback();
          }
          
          return res.status(401).json({ 
              error: `Razorpay Authentication Failed`,
              details: `The Key ID or Key Secret provided is invalid for your Razorpay account. Please verify your credentials in the Settings menu.`,
              help: `Ensure you are using LIVE keys for LIVE plans and TEST keys for TEST plans. Your current Key ID starts with ${keyId.substring(0, 8)}.`,
              debug: {
                  key_prefix: keyId.substring(0, 8),
                  plan_id: razorpayPlanId
              }
          });
      }
      
      // For other errors, also try fallback
      return returnFallback();
    }
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    const errorMessage = error.error?.description || error.message || 'Failed to create subscription';
    res.status(500).json({ error: errorMessage });
  }
});

// 1.5 Create Order
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, planId, razorpayPlanId, userId } = req.body || {};
    console.log(`[API] Create Order Request - Amount: ${amount}, Plan: ${planId}, RazorpayPlan: ${razorpayPlanId}, User: ${userId}`);

    if (!amount || !userId) {
      console.warn('[API] Missing amount or userId in request body');
      return res.status(400).json({ error: 'Missing amount or userId' });
    }

    const rzp = getRazorpayInstance();
    if (!rzp) {
      console.error('[API] Razorpay instance missing - check environment variables');
      return res.status(500).json({ error: 'Razorpay configuration missing on server' });
    }

    console.log('[API] Calling rzp.orders.create...');
    const order = await rzp.orders.create({
      amount: Math.round(amount * 100), // Convert to paise and ensure integer
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${userId.substring(0, 8)}`,
      notes: {
        user_id: userId,
        plan_name: planId,
        razorpay_plan_id: razorpayPlanId
      }
    });

    console.log('[API] Order created successfully:', order.id);

    res.json({
      order_id: order.id,
      key_id: process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_STxlKmH3jUfhCg',
      amount: order.amount,
      currency: order.currency
    });
  } catch (err: any) {
    console.error('[API] Razorpay Create Order Error:', err);
    res.status(500).json({ 
      error: err.error?.description || err.message || 'Unknown Error',
      details: err.message,
      code: err.code
    });
  }
});

// 3. Restore Purchase Endpoint
app.post('/api/restore-purchase', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing authorization header' });

  const token = authHeader.split(' ')[1];
  const { paymentId, planId: requestedPlanId } = req.body || {};
  
  // Verify user
  const { data: { user }, error: userError } = await supabase!.auth.getUser(token);

  if (userError || !user || !user.email) {
      return res.status(401).json({ error: 'Invalid token or user not found' });
  }

  const email = user.email;
  console.log(`Restoring purchase for ${email} (${user.id}), paymentId: ${paymentId}`);

  let foundValidPayment = false;
  let planId = requestedPlanId || 'monthly'; // Default fallback
  let paymentDate = new Date();
  let amountPaid = 250;
  let razorpayId = '';
  let isSubscription = false;

  try {
      const rzp = getRazorpayInstance();
      if (!rzp) {
          console.error('[Restore] Razorpay instance missing - cannot fetch subscriptions');
          return res.status(500).json({ error: 'Razorpay configuration missing' });
      }

      // 0. Check specific payment if provided
      if (paymentId) {
          try {
              const pay = await rzp.payments.fetch(paymentId);
              if (pay && pay.status === 'captured') {
                  // Verify the payment belongs to this user
                  const isOwner = pay.notes?.user_id === user.id || pay.email === email || pay.contact === email;
                  // Allow fallback match for payment links created in dashboard without user_id
                  const isFallbackMatch = !pay.notes?.user_id && (pay.email === 'test@gmail.com' || pay.contact === '+918971671595');
                  
                  if (isOwner || isFallbackMatch) {
                      foundValidPayment = true;
                      isSubscription = false;
                      razorpayId = pay.id;
                      const amount = Number(pay.amount);
                      if (amount >= 250000) { planId = 'annual'; amountPaid = 2500; }
                      else if (amount >= 125000) { planId = 'biannual'; amountPaid = 1250; }
                      else { planId = 'monthly'; amountPaid = 250; }
                      
                      paymentDate = new Date(pay.created_at * 1000);
                      if (planId === 'annual') paymentDate.setFullYear(paymentDate.getFullYear() + 1);
                      else if (planId === 'biannual') paymentDate.setMonth(paymentDate.getMonth() + 6);
                      else paymentDate.setMonth(paymentDate.getMonth() + 1);
                  } else {
                      console.warn(`[Restore] Payment ${paymentId} does not belong to user ${user.id}`);
                  }
              }
          } catch (e) {
              console.error(`[Restore] Failed to fetch specific payment ${paymentId}:`, e);
          }
      }

      // 1. Check Subscriptions
      if (!foundValidPayment) {
          const subscriptions = await rzp.subscriptions.all({ count: 50 });
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
                      else planId = 'monthly';
                      
                      if (sub.current_end) {
                          paymentDate = new Date(sub.current_end * 1000);
                      }
                      break;
                  }
              }
          }
      }

      // 2. Check Payments (Fallback)
      if (!foundValidPayment) {
          const payments = await rzp.payments.all({ count: 50 });
          for (const pay of payments.items) {
              if ((pay.notes?.user_id === user.id || pay.email === email || pay.contact === email) && pay.status === 'captured') {
                  foundValidPayment = true;
                  isSubscription = false;
                  razorpayId = pay.id;
                  // Infer plan from amount (paise)
                  const amount = Number(pay.amount);
                  if (amount >= 250000) { planId = 'annual'; amountPaid = 2500; }
                  else if (amount >= 125000) { planId = 'biannual'; amountPaid = 1250; }
                  else { planId = 'monthly'; amountPaid = 250; }
                  
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

          const isExpired = paymentDate < new Date();
          const newStatus = isExpired ? 'expired' : 'active';

          // 1. Insert into subscriptions (using admin client to bypass RLS)
          // We use insert to ensure we have the latest subscription info and avoid missing unique constraint errors
          const { error: subError } = await supabase
              .from('subscriptions')
              .insert({
                  owner_id: user.id,
                  status: newStatus,
                  plan_id: planId,
                  current_period_end: paymentDate.toISOString(),
                  razorpay_subscription_id: isSubscription ? razorpayId : `pay_${razorpayId}`
              });

          if (subError) {
              if (subError.code === '23505') { // unique violation
                  await supabase
                      .from('subscriptions')
                      .update({
                          current_period_end: paymentDate.toISOString(),
                          status: newStatus,
                          razorpay_subscription_id: isSubscription ? razorpayId : `pay_${razorpayId}`,
                          plan_id: planId
                      })
                      .eq('owner_id', user.id);
              } else {
                  console.error("Error inserting subscription:", subError);
              }
              // Continue to update business even if subscription log fails, as business status is critical for access
          }

          // 2. Update Business Status (using admin client)
          const { error: updateError } = await supabase
              .from('businesses')
              .update({ 
                  subscription_status: newStatus,
                  plan_id: planId 
              })
              .eq('owner_id', user.id);

          if (updateError) {
              console.error("Error updating business:", updateError);
              return res.status(500).json({ error: 'Failed to update business status. Please contact support.' });
          }

          if (isExpired) {
              return res.status(400).json({ error: 'Found a payment, but the subscription has already expired.' });
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
  res.json({ 
    status: 'ok',
    vercel: !!process.env.VERCEL,
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    lifecycle: process.env.npm_lifecycle_event
  });
});

// Diagnostic logging endpoint
app.post('/api/diagnostics', express.json(), (req, res) => {
  console.error('CLIENT_ERROR:', JSON.stringify(req.body, null, 2));
  res.status(200).json({ status: 'logged' });
});

// Global Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('[Global Error Handler]', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message,
    path: req.path
  });
});

// Vite Middleware (for Development)
// We check if we are in production OR if dist exists and we want to serve it
// Static File Serving Logic
// We prioritize serving from 'dist' if it exists, as that is the production build.
const distPath = path.join(process.cwd(), 'dist');
const distExists = fs.existsSync(distPath);

console.log(`[Server] Environment: ${process.env.NODE_ENV}`);
console.log(`[Server] Vercel: ${!!process.env.VERCEL}`);
console.log(`[Server] Dist Path: ${distPath}`);
console.log(`[Server] Dist Exists: ${distExists}`);

const isProduction = process.env.NODE_ENV === 'production' || process.env.npm_lifecycle_event === 'start';

// Force production mode serving if dist exists AND we are in production mode
if (distExists && isProduction && !process.env.VERCEL) {
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
} else {
  console.log('[Server] Running in Vercel Serverless mode. Static files served by Vercel.');
}

// Global Fallback for unmatched routes (should be caught by above logic, but just in case)
app.use((req, res) => {
    res.status(404).send('<h1>404 Not Found</h1><p>The requested URL was not found on this server (Express fallback).</p>');
});

// For Vercel deployment, we export the app and only listen if not in a serverless environment
if (!process.env.VERCEL) {
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
