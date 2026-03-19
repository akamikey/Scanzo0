import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, CreditCard, ShieldCheck, ArrowLeft, Zap, Sparkles, XCircle, AlertCircle } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';

const PLANS = [
  {
    id: 'monthly',
    name: 'Monthly Plan',
    price: 250,
    planId: 'plan_SBmRucECQ7R5dJ',
    features: ['Unlimited QR Scans', 'Google Redirect', 'Basic Analytics', 'Email Support'],
    color: 'from-blue-500 to-cyan-500',
    popular: false,
  },
  {
    id: 'biannual',
    name: '6 Months Plan',
    price: 1250,
    planId: 'plan_SBmc0r5xUg65iM',
    features: ['Everything for 6 months', 'Priority Support', 'Advanced Analytics', 'Save ₹250'],
    color: 'from-purple-500 to-pink-500',
    popular: true,
  },
  {
    id: 'annual',
    name: 'Yearly Plan',
    price: 2250,
    planId: 'plan_SM3t9nNkfUECGe',
    features: ['Everything for 1 year', 'Dedicated Manager', 'Custom QR Designs', 'Save ₹750'],
    color: 'from-orange-500 to-red-500',
    popular: false,
  },
];

declare global {
  interface Window {
    Razorpay: any;
  }
}

import Footer from '../components/Footer';

const SubscribePage: React.FC = () => {
  const { user, session, subscription, refreshData } = useAuth();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Animation states
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'activating' | 'success' | 'cancelled'>('idle');
  const [activePlanId, setActivePlanId] = useState<string | null>(null);

  useEffect(() => {
    const paymentId = searchParams.get('razorpay_payment_id');
    const error = searchParams.get('error');
    const planId = searchParams.get('plan');

    if (paymentId) {
      handleSuccessFlow(planId);
    } else if (error || (planId && !paymentId && searchParams.has('cancelled'))) {
      handleFailureFlow(planId);
    }
  }, [searchParams]);

  const handleSuccessFlow = async (planId: string | null) => {
    setActivePlanId(planId);
    setPaymentStatus('activating');
    
    try {
      // Attempt to restore/sync purchase immediately
      const token = session?.access_token;
      if (token) {
        await fetch('/api/restore-purchase', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (e) {
      console.error("Failed to sync purchase", e);
    }

    // Step 1 & 2: Dim background and show loader (2 seconds)
    setTimeout(() => {
      setPaymentStatus('success');
      
      // Step 3: Celebration
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#4ade80', '#ffffff']
      });

      // Refresh data to update subscription status in context
      refreshData();

      // Step 6: Return to normal after 5 seconds
      setTimeout(() => {
        setPaymentStatus('idle');
        // Clear search params without refresh
        setSearchParams({});
      }, 5000);
    }, 2500);
  };

  const handleFailureFlow = (planId: string | null) => {
    setActivePlanId(planId);
    setPaymentStatus('cancelled');
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (plan: typeof PLANS[0]) => {
    if (!user) {
        alert("Please sign in to subscribe.");
        return;
    }

    setProcessingId(plan.id);
    setPaymentStatus('idle');

    const fetchWithRetry = async (url: string, options: RequestInit, retries = 3): Promise<Response> => {
        try {
            const response = await fetch(url, options);
            return response;
        } catch (error: any) {
            if (retries > 0 && error.message?.includes('Failed to fetch')) {
                console.debug(`Retrying fetch to ${url} (${3 - retries + 1}/3)...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                return fetchWithRetry(url, options, retries - 1);
            }
            throw error;
        }
    };

    try {
        const res = await loadRazorpay();
        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            setProcessingId(null);
            return;
        }

        const response = await fetchWithRetry('/api/create-subscription', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                planId: plan.id,
                userId: user.id
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to create subscription');
        }

        // Handle redirect flow (fallback links)
        if (data.is_fallback || !data.key_id) {
            if (data.short_url) {
                // Append plan id to return URL if possible, or just redirect
                // For simplicity, we assume the return URL is configured in Razorpay dashboard
                window.location.href = data.short_url;
                return;
            } else {
                throw new Error('No payment URL received');
            }
        }

        // Handle modal flow
        const options = {
            key: data.key_id,
            subscription_id: data.id,
            name: "Scanzo",
            description: `${plan.name} Subscription`,
            handler: function (response: any) {
                // Redirect to self with success params to trigger animation
                navigate(`/subscribe?razorpay_payment_id=${response.razorpay_payment_id}&plan=${plan.id}`, { replace: true });
            },
            theme: {
                color: "#3B82F6"
            },
            modal: {
                ondismiss: function() {
                    setProcessingId(null);
                    // If they closed it, we can show the cancelled state if we want, 
                    // but usually ondismiss is just a quiet close.
                    // The prompt says "If the user clicked a plan but returned without completing payment"
                    navigate(`/subscribe?cancelled=true&plan=${plan.id}`, { replace: true });
                }
            }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();

    } catch (error: any) {
        console.error('Payment error:', error);
        setPaymentStatus('cancelled');
        setActivePlanId(plan.id);
        setProcessingId(null);
    }
  };

  return (
    <div className="space-y-8 relative pb-20 min-h-screen">
      {/* Dim Overlay */}
      <AnimatePresence>
        {(paymentStatus === 'activating' || paymentStatus === 'success') && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 pointer-events-none"
          />
        )}
      </AnimatePresence>

       <div className="flex items-center gap-4 mb-2">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-500 dark:text-gray-400">
           <ArrowLeft size={24} />
        </button>
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {subscription?.isActive ? 'Your Subscription' : 'Choose Your Plan'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {subscription?.isActive ? 'Details of your current active plan.' : 'Select a plan to unlock premium features.'}
            </p>
        </div>
      </div>

      {subscription?.isActive && paymentStatus === 'idle' ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto"
        >
          <GlassCard className="border-green-500/30 bg-green-50/50 dark:bg-green-900/10 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <ShieldCheck size={120} className="text-green-500" />
            </div>
            
            <div className="relative flex flex-col items-center text-center py-10 px-6">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <ShieldCheck size={40} />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Active Subscription</h2>
              <p className="text-green-600 dark:text-green-400 font-medium mb-6">
                You already have an active subscription
              </p>
              
              <div className="w-full grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-green-100 dark:border-green-500/10">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-1">Current Plan</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{subscription.plan || 'Premium'}</p>
                </div>
                <div className="bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-green-100 dark:border-green-500/10">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-1">Expiry Date</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {subscription.end_date ? new Date(subscription.end_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg"
              >
                Back to Dashboard
              </button>
            </div>
          </GlassCard>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto relative">
          {PLANS.map((plan) => {
            const isSelected = activePlanId === plan.id;
            const isSuccess = isSelected && paymentStatus === 'success';
            const isActivating = isSelected && paymentStatus === 'activating';
            const isCancelled = isSelected && paymentStatus === 'cancelled';

            return (
              <motion.div
                key={plan.id}
                animate={
                  isActivating || isSuccess 
                    ? { scale: 1.05, zIndex: 50 } 
                    : isCancelled 
                    ? { x: [0, -10, 10, -10, 10, 0] } 
                    : { scale: 1, zIndex: 1 }
                }
                transition={isCancelled ? { duration: 0.4 } : { type: 'spring', stiffness: 300, damping: 20 }}
                className="h-full"
              >
                <GlassCard 
                  className={`relative flex flex-col p-6 overflow-hidden h-full transition-all duration-500 ${
                      plan.popular && paymentStatus === 'idle'
                      ? 'border-blue-500/30 dark:border-blue-400/30 ring-4 ring-blue-500/10' 
                      : ''
                  } ${
                    isSuccess || isActivating
                    ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.4)] ring-4 ring-green-500/20'
                    : isCancelled
                    ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]'
                    : ''
                  }`}
                  hoverEffect={paymentStatus === 'idle'}
                >
                  {/* Status Overlays */}
                  <AnimatePresence>
                    {isActivating && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center"
                      >
                        <div className="relative">
                          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                          <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500 animate-pulse" size={24} />
                        </div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white animate-pulse">
                          ⚡ Activating Premium Access...
                        </p>
                      </motion.div>
                    )}

                    {isSuccess && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 z-30 bg-green-500/10 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center"
                      >
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', delay: 0.2 }}
                          className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-500/40"
                        >
                          <Check size={48} strokeWidth={4} />
                        </motion.div>
                        <h3 className="text-2xl font-black text-green-600 dark:text-green-400 mb-1">✨ Premium Unlocked</h3>
                        <p className="font-bold text-green-700 dark:text-green-300">✔ Subscription Activated</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {plan.popular && paymentStatus === 'idle' && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg z-20 tracking-wide">
                      BEST VALUE
                    </div>
                  )}

                  {isSuccess && (
                    <div className="absolute top-4 right-4 bg-green-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg z-40 animate-bounce">
                      ACTIVE PLAN
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                    <div className="mt-4 flex items-baseline">
                      <span className="text-4xl font-black text-gray-900 dark:text-white">₹{plan.price}</span>
                      <span className="ml-1 text-sm text-gray-500">/period</span>
                    </div>
                    
                    <div className="mt-8 space-y-4">
                      {plan.features.map((feature, i) => (
                          <div key={i} className="flex items-start gap-3">
                              <div className={`mt-1 p-0.5 rounded-full ${isSuccess ? 'bg-green-500' : 'bg-blue-500'} text-white shrink-0`}>
                                  <Check size={12} strokeWidth={3} />
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                          </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8">
                      {isCancelled ? (
                        <div className="space-y-4">
                          <div className="flex flex-col items-center text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-500/20">
                            <XCircle className="text-red-500 mb-2" size={32} />
                            <p className="text-sm font-bold text-red-600 dark:text-red-400">❌ Payment Cancelled</p>
                            <p className="text-xs text-red-500/80 dark:text-red-400/60 mt-1">Your Premium plan was not activated.</p>
                          </div>
                          <button
                              onClick={() => handlePayment(plan)}
                              className="w-full py-4 px-6 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                          >
                              <CreditCard size={20} />
                              Retry Payment
                          </button>
                        </div>
                      ) : isSuccess ? (
                        <div className="w-full py-4 px-6 rounded-2xl bg-green-500 text-white font-black shadow-xl flex items-center justify-center gap-2 border-2 border-green-400">
                          <ShieldCheck size={20} />
                          CURRENT PLAN: ACTIVE
                        </div>
                      ) : (
                        <button
                            onClick={() => handlePayment(plan)}
                            disabled={!!processingId}
                            className={`w-full py-4 px-6 rounded-2xl text-white font-bold shadow-xl transition-all transform active:scale-95 bg-gradient-to-r ${plan.color} hover:brightness-110 flex items-center justify-center gap-2 group`}
                        >
                            {processingId === plan.id ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <>
                                <Zap size={20} className="fill-current" /> 
                                Subscribe Now
                                </>
                            )}
                        </button>
                      )}
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="mt-12 text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <ShieldCheck size={16} className="text-green-500" />
            Secure 256-bit SSL Encrypted Payment
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default SubscribePage;
