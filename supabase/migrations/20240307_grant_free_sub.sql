-- Grant 1 Month Free Subscription to chennakeshava9812@gmail.com

DO $$
DECLARE
    target_user_id uuid;
BEGIN
    -- 1. Find the user ID from auth.users
    SELECT id INTO target_user_id FROM auth.users WHERE email = 'chennakeshava9812@gmail.com';

    -- 2. If user found, insert subscription
    IF target_user_id IS NOT NULL THEN
        -- Deactivate any existing active subscriptions to avoid conflicts
        UPDATE public.subscriptions 
        SET active = false 
        WHERE owner_id = target_user_id AND active = true;

        -- Insert new 1-month free subscription
        INSERT INTO public.subscriptions (
            owner_id,
            plan_name,
            amount_paid,
            active,
            start_date,
            end_date
        ) VALUES (
            target_user_id,
            'Premium Plan (Gift)',
            0.00,
            true,
            now(),
            now() + interval '1 month'
        );
        
        RAISE NOTICE 'Successfully granted 1 month free subscription to %', target_user_id;
    ELSE
        RAISE NOTICE 'User with email chennakeshava9812@gmail.com not found.';
    END IF;
END $$;
