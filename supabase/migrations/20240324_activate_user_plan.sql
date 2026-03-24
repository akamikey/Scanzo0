-- Activate 250rs monthly plan for chennakeshava9812@gmail.com
DO $$
DECLARE
    v_owner_id UUID;
BEGIN
    -- 1. Find the owner ID from auth.users
    SELECT id INTO v_owner_id FROM auth.users WHERE email = 'chennakeshava9812@gmail.com';

    IF v_owner_id IS NOT NULL THEN
        -- 2. Update businesses table
        UPDATE public.businesses 
        SET subscription_status = 'active', 
            updated_at = now()
        WHERE owner_id = v_owner_id;

        -- 3. Upsert into subscriptions table
        INSERT INTO public.subscriptions (
            owner_id, 
            plan_id, 
            status, 
            current_period_end, 
            amount_paid, 
            active, 
            updated_at
        )
        VALUES (
            v_owner_id, 
            'monthly_250', 
            'active', 
            now() + interval '1 month', 
            250, 
            true, 
            now()
        )
        ON CONFLICT (owner_id) DO UPDATE
        SET plan_id = EXCLUDED.plan_id,
            status = EXCLUDED.status,
            current_period_end = EXCLUDED.current_period_end,
            amount_paid = EXCLUDED.amount_paid,
            active = EXCLUDED.active,
            updated_at = now();
            
        RAISE NOTICE 'Plan activated for owner %', v_owner_id;
    ELSE
        RAISE NOTICE 'Owner with email chennakeshava9812@gmail.com not found';
    END IF;
END $$;
