
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { User } from '@supabase/supabase-js';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Plan {
  name: string;
  price: number;
}

export const useRazorpay = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const loadScript = (src: string) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (plan: Plan) => {
    setLoading(true);
    
    if (!user || !session) {
      toast({ title: "Authentication Error", description: "Please sign in to subscribe.", variant: "destructive" });
      setLoading(false);
      return;
    }

    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!res) {
      toast({ title: "Error", description: "Razorpay SDK failed to load. Are you online?", variant: "destructive" });
      setLoading(false);
      return;
    }

    try {
      const { data: keyData, error: keyError } = await supabase.functions.invoke('get-razorpay-key');
      if (keyError) throw keyError;
      const { keyId } = keyData;
      
      const { data: orderData, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
        body: { planName: plan.name, amount: plan.price },
      });

      if (orderError) throw orderError;
      
      const { order, subscription } = orderData;

      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Agrezy',
        description: `Subscription for ${plan.name} Plan`,
        order_id: order.id,
        handler: async function (response: any) {
          const { data: verificationData, error: verificationError } = await supabase.functions.invoke('verify-razorpay-payment', {
            body: {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              subscription_id: subscription.id,
              plan_name: plan.name,
            },
          });

          if (verificationError) throw verificationError;

          if (verificationData.success) {
            toast({ title: "Payment Successful!", description: `You have successfully subscribed to the ${plan.name} plan.` });
             window.location.reload();
          } else {
            throw new Error('Payment verification failed.');
          }
        },
        prefill: {
          name: user.user_metadata?.full_name || 'Valued Customer',
          email: user.email,
        },
        theme: {
          color: '#3399cc',
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error: any) {
      console.error("Payment failed", error);
      toast({
        title: "Payment Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return { handlePayment, loading };
};
