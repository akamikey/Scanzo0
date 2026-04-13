import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Star, Globe, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SuccessOverlay: React.FC<{ rating: number, reviewLink?: string, isFeedback?: boolean }> = ({ rating, reviewLink, isFeedback }) => {
  const [showCloseMessage, setShowCloseMessage] = useState(false);

  useEffect(() => {
    if (rating >= 4 && reviewLink) {
      const timer = setTimeout(() => {
        let finalUrl = reviewLink.trim();
        if (!/^https?:\/\//i.test(finalUrl)) {
          finalUrl = 'https://' + finalUrl;
        }
        window.location.href = finalUrl;
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setShowCloseMessage(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [rating, reviewLink]);

  const title = rating >= 4 ? "Thank you for the support!" : "Feedback submitted";
  const subtitle = rating >= 4 
    ? "We're redirecting you to Google to share your experience with the world." 
    : "Your feedback helps businesses improve and grow.";

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] bg-white dark:bg-slate-900 flex items-center justify-center p-6"
    >
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="max-w-sm w-full text-center space-y-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", damping: 12, stiffness: 200 }}
          className="w-24 h-24 bg-green-100 dark:bg-green-900/20 text-green-500 rounded-full flex items-center justify-center mx-auto"
        >
          <CheckCircle2 size={64} strokeWidth={2.5} />
        </motion.div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
            {title}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {subtitle}
          </p>
        </div>

        {showCloseMessage && (
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 py-2 px-4 rounded-full inline-block"
          >
            You may now close this page.
          </motion.p>
        )}

        {rating >= 4 && (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-blue-500" size={20} />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Redirecting to Google...</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

const PublicReviewPage: React.FC = () => {
  const { slug: urlSlug, businessId: urlBusinessId, id: urlId } = useParams<{ slug?: string, businessId?: string, id?: string }>();
  const [loading, setLoading] = useState(true);
  const [links, setLinks] = useState<{ review_link?: string, website_link?: string, owner_id?: string, id?: string } | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [step, setStep] = useState<'rating' | 'feedback' | 'success'>('rating');
  const [submitting, setSubmitting] = useState(false);

  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);

  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    let subscriptionChannel: any = null;

    fetchLinks().then(() => {
      if (ownerId) {
        subscriptionChannel = supabase
          .channel(`review-public-${ownerId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'subscriptions',
              filter: `owner_id=eq.${ownerId}`
            },
            (payload) => {
              const sub = payload.new;
              const endDate = sub.current_period_end ? new Date(sub.current_period_end) : (sub.end_date ? new Date(sub.end_date) : null);
              const isStatusActive = ['active', 'authenticated', 'completed', 'trialing'].includes(sub.status);
              const isNotExpired = endDate ? endDate > new Date() : true;
              setIsExpired(!(isStatusActive && isNotExpired));
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'subscriptions',
              filter: `owner_id=eq.${ownerId}`
            },
            (payload) => {
              const sub = payload.new;
              const endDate = sub.current_period_end ? new Date(sub.current_period_end) : (sub.end_date ? new Date(sub.end_date) : null);
              const isStatusActive = ['active', 'authenticated', 'completed', 'trialing'].includes(sub.status);
              const isNotExpired = endDate ? endDate > new Date() : true;
              setIsExpired(!(isStatusActive && isNotExpired));
            }
          )
          .subscribe();
      }
    });

    return () => {
      if (subscriptionChannel) {
        supabase.removeChannel(subscriptionChannel);
      }
    };
  }, [urlSlug, urlBusinessId, urlId, ownerId]);

  const fetchLinks = async (retryCount = 0) => {
    if (!urlSlug && !urlBusinessId && !urlId) {
      setLoading(false);
      return;
    }
    
    try {
      if (urlBusinessId || urlId) {
        const targetId = urlBusinessId || urlId;
        // Fetch by business ID
        const { data: bizData, error: bizError } = await supabase
          .from('businesses')
          .select('id, owner_id, review_link, website_link')
          .eq('id', targetId)
          .maybeSingle();

        if (bizError) {
          if (bizError.message?.includes('Failed to fetch') && retryCount < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return fetchLinks(retryCount + 1);
          }
          throw bizError;
        }

        if (bizData) {
          setLinks(bizData);
          setBusinessId(bizData.id);
          setOwnerId(bizData.owner_id);

          const { data: subData } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('owner_id', bizData.owner_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          let isSubActive = false;
          if (subData) {
            const endDate = subData.current_period_end ? new Date(subData.current_period_end) : (subData.end_date ? new Date(subData.end_date) : null);
            const isStatusActive = ['active', 'authenticated', 'completed', 'trialing'].includes(subData.status);
            const isNotExpired = endDate ? endDate > new Date() : true;
            if (isStatusActive && isNotExpired) {
              isSubActive = true;
            }
          }
          setIsExpired(!isSubActive);

          // Fetch owner for business name and slug
          const { data: owner, error: ownerError } = await supabase
            .from('owners')
            .select('business_name, public_slug')
            .eq('id', bizData.owner_id)
            .maybeSingle();

          if (ownerError) throw ownerError;
          if (owner) {
            setBusinessName(owner.business_name);
            setSlug(owner.public_slug);
          }
        }
      } else if (urlSlug) {
        // Existing slug logic
        const { data: owner, error: ownerError } = await supabase
          .from('owners')
          .select('id, business_name, public_slug')
          .eq('public_slug', urlSlug)
          .maybeSingle();

        if (ownerError) {
          if (ownerError.message?.includes('Failed to fetch') && retryCount < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return fetchLinks(retryCount + 1);
          }
          throw ownerError;
        }

        if (owner) {
          setBusinessName(owner.business_name);
          setOwnerId(owner.id);
          setSlug(owner.public_slug);
          
          const { data: bizData, error: linkError } = await supabase
            .from('businesses')
            .select('id, review_link, website_link')
            .eq('owner_id', owner.id)
            .maybeSingle();
            
          if (linkError) throw linkError;

          if (bizData) {
            setLinks(bizData);
            setBusinessId(bizData.id);
            
            const { data: subData } = await supabase
              .from('subscriptions')
              .select('*')
              .eq('owner_id', owner.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            let isSubActive = false;
            if (subData) {
              const endDate = subData.current_period_end ? new Date(subData.current_period_end) : (subData.end_date ? new Date(subData.end_date) : null);
              const isStatusActive = ['active', 'authenticated', 'completed', 'trialing'].includes(subData.status);
              const isNotExpired = endDate ? endDate > new Date() : true;
              if (isStatusActive && isNotExpired) {
                isSubActive = true;
              }
            }
            setIsExpired(!isSubActive);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching public review links:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePositiveRedirect = async (selectedRating: number) => {
    if (!businessId || !ownerId) return;
    
    // 1. Save the rating intent to DB immediately
    try {
      await fetch('https://senkiwubyxeozgvycwjo.supabase.co/rest/v1/reviews', {
        method: 'POST',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlbmtpd3VieXhlb3pndnljd2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NjQyNTMsImV4cCI6MjA4MTU0MDI1M30.97V4aCtU464P2rT6PQn57uUvDsuTpKbsF_vRW0R-3hQ',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlbmtpd3VieXhlb3pndnljd2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NjQyNTMsImV4cCI6MjA4MTU0MDI1M30.97V4aCtU464P2rT6PQn57uUvDsuTpKbsF_vRW0R-3hQ',
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          rating: selectedRating,
          feedback: 'Positive review redirected to Google',
          business_id: businessId
        })
      });
    } catch (e) {
      console.error("Error logging positive intent:", e);
    }

    // 2. Show success and redirect
    setRating(selectedRating);
    setStep('success');
  };

  const handleRatingSelect = (selectedRating: number) => {
    if (isExpired) {
      alert("This business is currently inactive.");
      return;
    }
    
    if (selectedRating >= 4) {
      handlePositiveRedirect(selectedRating);
    } else {
      setRating(selectedRating);
      setStep('feedback');
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isExpired) {
      alert("This business is currently inactive.");
      return;
    }
    if (!businessId || !ownerId) {
      alert("Error: Business information missing. Please try again later.");
      return;
    }

    setSubmitting(true);
    try {
      // Send all reviews to the reviews table via fetch as requested by user
      const response = await fetch('https://senkiwubyxeozgvycwjo.supabase.co/rest/v1/reviews', {
        method: 'POST',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlbmtpd3VieXhlb3pndnljd2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NjQyNTMsImV4cCI6MjA4MTU0MDI1M30.97V4aCtU464P2rT6PQn57uUvDsuTpKbsF_vRW0R-3hQ',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlbmtpd3VieXhlb3pndnljd2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NjQyNTMsImV4cCI6MjA4MTU0MDI1M30.97V4aCtU464P2rT6PQn57uUvDsuTpKbsF_vRW0R-3hQ',
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          rating: rating,
          feedback: comment,
          business_id: businessId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        const errorMessage = errorData.message || errorData.error || errorData.description || 'Failed to submit feedback';
        throw new Error(errorMessage);
      }

      setStep('success');
    } catch (err: any) {
      console.error("Error submitting review:", err);
      alert(err.message || "Failed to submit feedback. Please try again");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F2F7]">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-500 w-12 h-12 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Loading review page...</p>
        </div>
      </div>
    );
  }

  if (!businessName && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-black p-6 text-center relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-red-400/10 dark:bg-red-900/10 rounded-full blur-[120px]" />
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-red-500/10 border border-white/50 dark:border-white/5 max-w-md w-full flex flex-col items-center"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
            className="w-24 h-24 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-inner"
          >
            <Star size={48} className="opacity-50" />
          </motion.div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">Business Not Found</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-8 text-lg">We couldn't find the business associated with this QR code.</p>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.href = '/'}
            className="w-full py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-2xl font-bold transition-all text-lg"
          >
            Go Back
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-black p-6 text-center relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-amber-400/10 dark:bg-amber-900/10 rounded-full blur-[120px]" />
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-amber-500/10 border border-white/50 dark:border-white/5 max-w-md w-full flex flex-col items-center"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
            className="w-24 h-24 bg-amber-100 dark:bg-amber-900/30 text-amber-500 rounded-full flex items-center justify-center mb-6 shadow-inner"
          >
            <AlertCircle size={48} strokeWidth={2} />
          </motion.div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">Subscription Inactive</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-8 text-lg">This business subscription is inactive. Please contact owner.</p>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.href = '/subscribe'}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 text-lg"
          >
            Subscribe Now
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-slate-950 flex flex-col items-center justify-center p-6 font-sans">
      
      <AnimatePresence>
        {step === 'success' && (
          <SuccessOverlay 
            rating={rating} 
            reviewLink={links?.review_link} 
            isFeedback={rating <= 3}
          />
        )}
      </AnimatePresence>

      <div className={`w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-blue-500/10 p-8 md:p-10 border border-white/40 dark:border-white/5 backdrop-blur-sm`}>
        <div className="text-center mb-10">
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-2">{businessName}</h1>
          <div className="h-1 w-12 bg-blue-500 mx-auto rounded-full" />
        </div>

        <>
          {step === 'rating' && (
              <div className="space-y-8 text-center">
                <h2 className="text-xl font-bold text-slate-700 dark:text-white">How was your experience?</h2>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      key={star}
                      type="button"
                      onClick={() => handleRatingSelect(star)}
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                      className="transition-all"
                    >
                      <Star
                        size={48}
                        className={`${
                          star <= (hover || rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-800'
                        } transition-colors duration-200`}
                      />
                    </motion.button>
                  ))}
                </div>
                <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">Tap a star to rate us</p>
              </div>
            )}

            {step === 'feedback' && (
              <form onSubmit={handleSubmitFeedback} className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-slate-700 dark:text-white mb-2">
                    {rating >= 4 ? "We're glad you enjoyed it!" : "We'd love to hear more"}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    {rating >= 4 
                      ? "Share a quick note about your experience." 
                      : "Your feedback helps us improve our service."}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Your Name</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Optional"
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 dark:text-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">
                      {rating >= 4 ? "Your Message (Optional)" : "Your Feedback"}
                    </label>
                    <textarea
                      required={rating < 4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={rating >= 4 
                        ? "Write a short message about your experience (optional)" 
                        : "Tell us what went wrong so we can improve."}
                      rows={4}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 dark:text-white font-medium resize-none"
                    />
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : (rating >= 4 ? 'Submit & Continue' : 'Submit Feedback')}
                </motion.button>
              </form>
            )}
          </>
      </div>

      {/* Footer Removed */}
    </div>
  );
};

export default PublicReviewPage;
