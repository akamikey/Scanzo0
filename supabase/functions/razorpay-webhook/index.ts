import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RAZORPAY_WEBHOOK_SECRET = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    const signature = req.headers.get('x-razorpay-signature')
    const body = await req.text()

    // 1. Verify Signature
    const isValid = await verifySignature(body, signature, RAZORPAY_WEBHOOK_SECRET)
    if (!isValid) {
        console.error("Invalid Razorpay Signature")
        return new Response('Invalid signature', { status: 401 })
    }

    const payload = JSON.parse(body)
    const event = payload.event

    console.log(`Received event: ${event}`)

    if (event === 'payment.captured') {
        const payment = payload.payload.payment.entity
        const paymentId = payment.id
        const email = payment.email
        const amount = payment.amount / 100 // Razorpay sends amount in paise

        console.log(`Processing payment: ${paymentId}, Email: ${email}, Amount: ${amount}`)

        // 3. Identify Plan
        let planType = ''
        let durationDays = 0

        if (amount === 250) {
            planType = 'monthly'
            durationDays = 30
        } else if (amount === 1250) {
            planType = 'biannual' // Mapped to '6 Months' plan ID
            durationDays = 180
        } else if (amount === 2500) {
            planType = 'annual' // Mapped to 'Yearly' plan ID
            durationDays = 365
        } else {
            console.error(`Unknown amount: ${amount}`)
            // Return success to acknowledge webhook, but log error
            return new Response(JSON.stringify({ received: true, status: 'unknown_amount' }), { headers: { 'Content-Type': 'application/json' } })
        }

        // 4. Find User
        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error("Missing Supabase configuration")
        }
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        
        // Note: Listing all users is not scalable for millions of users, but works for smaller apps.
        // Ideally, we would use a database function to look up by email or store the user_id in Razorpay notes.
        const { data: { users }, error: userError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
        
        if (userError) {
            console.error("Error listing users:", userError)
            throw userError
        }
        
        const user = users.find(u => u.email === email)
        
        if (!user) {
            console.error(`User not found for email: ${email}`)
            return new Response(JSON.stringify({ received: true, status: 'user_not_found' }), { headers: { 'Content-Type': 'application/json' } })
        }

        // 5. Insert Subscription
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + durationDays)

        // Using schema inferred from AuthContext.tsx:
        // owner_id, plan_name, amount_paid, active, payment_id, end_date
        const { error: insertError } = await supabase
            .from('subscriptions')
            .insert({
                owner_id: user.id,
                plan_name: planType,
                amount_paid: amount,
                active: true,
                payment_id: paymentId,
                end_date: expiresAt.toISOString()
            })

        if (insertError) {
            console.error('Insert Error:', insertError)
            throw insertError
        }

        // 6. Update Business Subscription Status
        const { error: updateError } = await supabase
            .from('businesses')
            .update({ subscription_status: 'active' })
            .eq('owner_id', user.id)

        if (updateError) {
            console.error('Update Error:', updateError)
            // Not throwing here to avoid failing webhook if subscription was already inserted
        }
        
        console.log(`Subscription created successfully for user ${user.id} (${email}) - Plan: ${planType}`)
    }

    return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } })

  } catch (err: any) {
    console.error("Webhook Error:", err)
    return new Response(JSON.stringify({ error: err.message }), { status: 400 })
  }
})

async function verifySignature(body: string, signature: string | null, secret: string | undefined): Promise<boolean> {
    if (!signature || !secret) return false;
    
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
        "raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["verify"]
    );
    
    const signatureBytes = hexToBytes(signature);
    const bodyBytes = encoder.encode(body);
    
    return await crypto.subtle.verify("HMAC", key, signatureBytes, bodyBytes);
}

function hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
}
