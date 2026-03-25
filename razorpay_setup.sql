-- 1. Enable Required Extensions
-- Go to Database > Extensions in Supabase Dashboard if this fails
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 2. Create Order Function (Backend Logic in SQL)
CREATE OR REPLACE FUNCTION public.is_subscription_active(p_owner_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_active boolean;
BEGIN
    SELECT active INTO v_active
    FROM public.subscriptions
    WHERE owner_id = p_owner_id
    AND end_date > now()
    ORDER BY end_date DESC
    LIMIT 1;
    
    RETURN COALESCE(v_active, false);
END;
$$;

CREATE OR REPLACE FUNCTION create_razorpay_order(p_amount numeric, p_plan_name text, p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = extensions, public
AS $$
DECLARE
  -- REPLACE THESE WITH YOUR ACTUAL RAZORPAY KEYS
  v_key_id text := 'rzp_live_STxlKmH3jUfhCg'; 
  v_key_secret text := 'QyH1Z6s0wV6N23z7XRmEe53q';
  
  v_order_response json;
  v_url text := 'https://api.razorpay.com/v1/orders';
  v_auth_header text;
  v_body json;
  v_response_status integer;
  v_response_content text;
BEGIN
  -- Basic Auth Header
  v_auth_header := 'Basic ' || encode((v_key_id || ':' || v_key_secret)::bytea, 'base64');

  -- Request Body
  v_body := json_build_object(
    'amount', p_amount,
    'currency', 'INR',
    'receipt', 'receipt_' || p_user_id,
    'notes', json_build_object('plan', p_plan_name, 'user_id', p_user_id)
  );

  -- HTTP Request to Razorpay
  SELECT status, content::text INTO v_response_status, v_response_content
  FROM http((
    'POST',
    v_url,
    ARRAY[
      http_header('Authorization', v_auth_header),
      http_header('Content-Type', 'application/json')
    ],
    'application/json',
    v_body::text
  )::http_request);

  IF v_response_status != 200 THEN
    RAISE EXCEPTION 'Razorpay Error: %', v_response_content;
  END IF;

  v_order_response := v_response_content::json;

  -- Return combined data
  RETURN json_build_object(
    'order_id', v_order_response->>'id',
    'amount', v_order_response->>'amount',
    'currency', v_order_response->>'currency',
    'key_id', v_key_id
  );
END;
$$;

-- 3. Verify Payment Function (Backend Logic in SQL)
CREATE OR REPLACE FUNCTION verify_razorpay_payment(
  p_payment_id text,
  p_order_id text,
  p_signature text,
  p_user_id uuid,
  p_plan_id text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = extensions, public
AS $$
DECLARE
  -- REPLACE THIS WITH YOUR ACTUAL RAZORPAY KEY SECRET
  v_key_secret text := 'QyH1Z6s0wV6N23z7XRmEe53q';
  
  v_generated_signature text;
  v_duration_days integer;
  v_plan_name text;
  v_amount numeric;
BEGIN
  -- Verify Signature
  v_generated_signature := encode(hmac(p_order_id || '|' || p_payment_id, v_key_secret, 'sha256'), 'hex');

  IF v_generated_signature != p_signature THEN
    RAISE EXCEPTION 'Invalid Payment Signature';
  END IF;

  -- Determine Plan Details
  IF p_plan_id = 'starter' OR p_plan_id = 'plan_SVVP7NfadsPhgb' THEN
    v_duration_days := 30;
    v_plan_name := 'Monthly';
    v_amount := 250;
  ELSIF p_plan_id = 'monthly' OR p_plan_id = 'plan_SVVP7NfadsPhgb' THEN
    v_duration_days := 30;
    v_plan_name := 'Monthly';
    v_amount := 250;
  ELSIF p_plan_id = 'biannual' OR p_plan_id = 'plan_SVVTUMhJomsRSD' THEN
    v_duration_days := 180;
    v_plan_name := '6 Months';
    v_amount := 1250;
  ELSIF p_plan_id = 'annual' OR p_plan_id = 'plan_SVVV0PIfP8o8Il' THEN
    v_duration_days := 365;
    v_plan_name := 'Yearly';
    v_amount := 2500;
  ELSE
    v_duration_days := 30;
    v_plan_name := 'Unknown';
    v_amount := 0;
  END IF;

  -- Update Subscription
  INSERT INTO subscriptions (owner_id, plan_id, status, current_period_end, amount_paid, active, razorpay_subscription_id, updated_at)
  VALUES (
    p_user_id,
    p_plan_id,
    'active',
    now() + (v_duration_days || ' days')::interval,
    v_amount,
    true,
    p_payment_id, -- Using payment_id as subscription_id for manual/one-time payments
    now()
  )
  ON CONFLICT (owner_id) DO UPDATE
  SET
    plan_id = excluded.plan_id,
    status = 'active',
    current_period_end = excluded.current_period_end,
    amount_paid = excluded.amount_paid,
    active = true,
    razorpay_subscription_id = excluded.razorpay_subscription_id,
    updated_at = now();

  RETURN json_build_object('success', true);
END;
$$;

-- 4. Manual Fix for your existing payment (Run this if you already paid)
-- Replace 'YOUR_USER_ID_HERE' with your actual User ID from Authentication tab
-- INSERT INTO subscriptions (owner_id, plan_name, amount_paid, active, end_date, payment_id)
-- VALUES ('YOUR_USER_ID_HERE', 'Monthly', 250, true, NOW() + INTERVAL '30 days', 'manual_fix_250');
