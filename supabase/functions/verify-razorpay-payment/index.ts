
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import crypto from 'https://deno.land/std@0.177.0/node/crypto.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      subscription_id,
      plan_name
    } = await req.json()
    
    const authHeader = req.headers.get('Authorization')!
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // Verify signature
    const shasum = crypto.createHmac('sha256', Deno.env.get('RAZORPAY_KEY_SECRET')!)
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`)
    const digest = shasum.digest('hex')

    if (digest !== razorpay_signature) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Update subscription
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        razorpay_payment_id,
        expires_at: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
      })
      .eq('id', subscription_id)

    if (subscriptionError) throw subscriptionError

    // Update user's profile with new plan
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ plan: plan_name })
      .eq('id', user.id)

    if (profileError) throw profileError

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
