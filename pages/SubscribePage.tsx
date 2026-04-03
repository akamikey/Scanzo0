import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, CreditCard, ShieldCheck, ArrowLeft, Zap, Sparkles, XCircle, AlertCircle, RefreshCw, AlertTriangle, Globe } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { formatPrice, getCurrencyData } from '../lib/currency';
import confetti from 'canvas-confetti';
import Footer from '../components/Footer';

declare global {
  interface Window {
    Razorpay: any;
  }
  var Razorpay: any;
}

const SubscribePage: React.FC = () => {
  const { user, session, ownerData, subscription, refreshData } = useAuth();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [fallbackData, setFallbackData] = useState<{ planId: string, url: string } | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const userCountry = ownerData?.country;

  const PLANS = [
    {
      id: 'monthly',
      name: 'Monthly Plan',
      price: 250,
      planId: 'plan_SVVP7NfadsPhgb',
      savings: '',
      color: 'from-blue-500 to-cyan-500',
      popular: false,
    },
    {
      id: 'biannual',
      name: '6 Months Plan',
      price: 1250,
      planId: 'plan_SVVTUMhJomsRSD',
      savings: `Save ${formatPrice(250, userCountry)}`,
      color: 'from-purple-500 to-pink-500',
      popular: true,
    },
    {
      id: 'annual',
      name: 'Yearly Plan',
      price: 2500,
      planId: 'plan_SVVV0PIfP8o8Il',
      savings: `Save ${formatPrice(500, userCountry)}`,
      color: 'from-orange-500 to-red-500',
      popular: false,
    },
  ];

  // Animation states
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'activating' | 'success' | 'cancelled'>('idle');
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{ message: string, details?: string, help?: string, code?: string } | null>(null);

  useEffect(() => {
    const paymentId = searchParams.get('razorpay_payment_id');
    const error = searchParams.get('error');
    const planId = searchParams.get('plan');

    if (paymentId) {
      handleSuccessFlow(planId, paymentId);
    } else if (error || (planId && !paymentId && searchParams.has('cancelled'))) {
      handleFailureFlow(planId);
    }
  }, [searchParams]);

  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    console.log('[SubscribePage] Mounted');
    const checkScript = () => {
      if (typeof window.Razorpay !== 'undefined') {
        console.log('[SubscribePage] window.Razorpay is available');
        setIsScriptLoaded(true);
        return true;
      }
      return false;
    };

    if (!checkScript()) {
      console.warn('[SubscribePage] window.Razorpay is undefined on mount. Checking for script tag...');
      const script = document.querySelector('script[src*="checkout.razorpay.com"]');
      if (script) {
        console.log('[SubscribePage] Razorpay script tag found, waiting for load...');
        script.addEventListener('load', () => {
          console.log('[SubscribePage] Razorpay script loaded successfully');
          setIsScriptLoaded(true);
        });
        script.addEventListener('error', () => console.error('[SubscribePage] Razorpay script failed to load'));
      } else {
        console.error('[SubscribePage] Razorpay script tag NOT found in document');
      }
    }

    // Periodic check just in case
    const interval = setInterval(() => {
      if (checkScript()) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSuccessFlow = async (planId: string | null, paymentId?: string) => {
    setActivePlanId(planId);
    setPaymentStatus('activating');
    setErrorDetails(null);
    
    let isSuccess = false;
    let errorMessage = 'Payment verification failed. Please contact support if you were charged.';
    try {
      // Attempt to restore/sync purchase immediately
      const token = session?.access_token;
      if (token) {
        const res = await fetch('/api/restore-purchase', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ paymentId, planId })
        });
        if (res.ok) {
          isSuccess = true;
        } else {
          const errorData = await res.json().catch(() => ({}));
          errorMessage = errorData.error || errorMessage;
          console.error("Failed to sync purchase:", errorData);
        }
      }
    } catch (e) {
      console.error("Failed to sync purchase", e);
    }

    // Step 1 & 2: Dim background and show loader (2 seconds)
    setTimeout(() => {
      if (isSuccess) {
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
      } else {
        setPaymentStatus('cancelled');
        setErrorDetails({ message: errorMessage });
        setSearchParams({});
      }
    }, 2500);
  };

  const handleFailureFlow = (planId: string | null) => {
    setActivePlanId(planId);
    setPaymentStatus('cancelled');
  };

  const openPayment = async (planId: string) => {
    if (!user) {
        alert("Please sign in to subscribe.");
        return;
    }

    const plan = PLANS.find(p => p.id === planId || p.planId === planId);
    if (!plan) return;

    const currencyData = getCurrencyData(plan.price, userCountry);

    setProcessingId(plan.id);
    setPaymentStatus('idle');
    setErrorDetails(null);
    setActivePlanId(plan.id);

    if (typeof window.Razorpay === 'undefined') {
        console.error('[Payment] Razorpay script not found');
        setProcessingId(null);
        setPaymentStatus('cancelled');
        setErrorDetails({ message: 'Payment gateway not loaded. Please refresh or check your connection.' });
        return;
    }

    try {
      const token = session?.access_token;
      console.log(`[Payment] Initiating order for plan: ${plan.id}, price: ${currencyData.amount} ${currencyData.currency}`);
      
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ 
          amount: currencyData.amount, 
          currency: currencyData.currency,
          planId: plan.id, 
          razorpayPlanId: plan.planId,
          userId: user.id 
        })
      });

      console.log(`[Payment] Create order response status: ${res.status}`);
      
      const contentType = res.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error('[Payment] Non-JSON response:', text);
        throw new Error(`Server returned an unexpected response (${res.status}). Please try again.`);
      }

      console.log('[Payment] Create order response data:', data);

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      if (data.order_id) {
        const options = {
          key: data.key_id || 'rzp_live_STxlKmH3jUfhCg', // Fallback to live key
          name: "Scanzo",
          description: `Subscription for ${plan.name}`,
          image: "https://scanzo.in/logo.png",
          order_id: data.order_id,
          handler: function (response: any) {
            console.log('[Payment] Success response:', response);
            setProcessingId(null);
            handleSuccessFlow(plan.id, response.razorpay_payment_id);
          },
          prefill: {
            name: user.email?.split('@')[0] || 'User',
            email: user.email || '',
          },
          theme: {
            color: "#10b981"
          },
          modal: {
            ondismiss: function() {
              console.log('[Payment] Modal dismissed');
              setProcessingId(null);
              setPaymentStatus('cancelled');
              setErrorDetails({ message: 'Payment cancelled' });
            }
          }
        };

        console.log('[Payment] Initializing Razorpay');
        
        if (typeof window.Razorpay === 'undefined') {
          console.error('[Payment] window.Razorpay is undefined at initialization time');
          throw new Error('Razorpay script not loaded. Please check your connection.');
        }

        const rzp = new window.Razorpay(options);
        
        rzp.on('payment.failed', function (response: any) {
          console.error('[Payment] Failed event:', response.error);
          setProcessingId(null);
          setPaymentStatus('cancelled');
          setErrorDetails({ 
            message: response.error.description || 'Payment failed. Please try again',
            code: response.error.code
          });
        });

        console.log('[Payment] Calling rzp.open()');
        rzp.open();
      } else {
        console.error('[Payment] No order_id in response data');
        throw new Error('Failed to create payment order');
      }
    } catch (error: any) {
      console.error('[Payment] Error in openPayment:', error);
      setProcessingId(null);
      setPaymentStatus('cancelled');
      setErrorDetails({ 
        message: error.message || 'Something went wrong',
        code: error.code || 'CLIENT_ERROR'
      });
    }
  };

  const [isRestoring, setIsRestoring] = useState(false);

  const handleRestorePurchase = async () => {
    setIsRestoring(true);
    try {
      await handleSuccessFlow(null);
    } finally {
      setIsRestoring(false);
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex flex-col items-center justify-center p-6 text-center"
          >
            {paymentStatus === 'activating' && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white animate-pulse" size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white tracking-tight">
                    {isRestoring ? 'Restoring Purchase...' : 'Activating Premium...'}
                  </h3>
                  <p className="text-white/80 font-medium animate-pulse">
                    Please wait while we verify your account ⚡
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
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

      {errorDetails && !activePlanId && (
        <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-500/20 flex items-start gap-3">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="text-sm font-bold text-red-800 dark:text-red-200">Verification Failed</h3>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errorDetails.message}</p>
          </div>
        </div>
      )}

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
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Account Activated</h2>
              <p className="text-green-600 dark:text-green-400 font-medium mb-6">
                Your account is activated and premium features are unlocked.
              </p>
              
              <div className="w-full grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-green-100 dark:border-green-500/10">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-1">Current Plan</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{subscription.plan || 'Premium'}</p>
                </div>
                <div className="bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-green-100 dark:border-green-500/10">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-1">Valid Until</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {subscription.end_date ? new Date(subscription.end_date).toLocaleDateString() : 'N/A'}
                  </p>
                  {subscription.end_date && (
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                      {Math.max(0, Math.ceil((new Date(subscription.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days remaining
                    </p>
                  )}
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
                        <h3 className="text-2xl font-black text-green-600 dark:text-green-400 mb-1">Subscription Activated 🎉</h3>
                        <p className="font-bold text-green-700 dark:text-green-300">Your plan is now active</p>
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
                      <span className="text-4xl font-black text-gray-900 dark:text-white">{formatPrice(plan.price, userCountry)}</span>
                      <span className="ml-1 text-sm text-gray-500">/period</span>
                    </div>
                    
                    <div className="mt-8 space-y-4">
                      {plan.savings && (
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-500/20">
                              <Sparkles className="text-green-600 dark:text-green-400" size={18} />
                              <span className="text-sm font-bold text-green-700 dark:text-green-300">{plan.savings}</span>
                          </div>
                      )}
                      <div className="flex items-start gap-3">
                          <div className={`mt-1 p-0.5 rounded-full ${isSuccess ? 'bg-green-500' : 'bg-blue-500'} text-white shrink-0`}>
                              <Check size={12} strokeWidth={3} />
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-300">Full Premium Access</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                      {isCancelled ? (
                        <div className="space-y-4">
                          <div className="flex flex-col items-center text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-500/20">
                            <XCircle className="text-red-500 mb-2" size={32} />
                            <p className="text-sm font-bold text-red-600 dark:text-red-400">
                              {errorDetails?.message || "Payment cancelled"}
                            </p>
                          </div>
                          <button
                              onClick={() => openPayment(plan.planId)}
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
                            onClick={() => openPayment(plan.planId)}
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
            Secure Payment
        </div>
        
        {!subscription?.isActive && (
          <button 
            onClick={handleRestorePurchase}
            disabled={isRestoring || paymentStatus === 'activating'}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center gap-2 mx-auto mt-4 disabled:opacity-50"
          >
            {isRestoring || paymentStatus === 'activating' ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
            Already paid? Restore Purchase
          </button>
        )}
      </div>

      {/* Footer */}
    </div>
  );
};

export default SubscribePage;
