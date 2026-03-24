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

  const title = isFeedback 
    ? "Thank you for helping this business improve ❤️" 
    : "Thank you for supporting this business ❤️";

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] bg-white flex items-center justify-center p-6"
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
          className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto"
        >
          <CheckCircle2 size={64} strokeWidth={2.5} />
        </motion.div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-800 leading-tight">
            {title}
          </h2>
          <p className="text-slate-500 font-medium">
            Your feedback helps businesses improve and grow.
          </p>
        </div>

        {showCloseMessage && (
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-bold text-blue-600 bg-blue-50 py-2 px-4 rounded-full inline-block"
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
  const { slug: urlSlug, businessId: urlBusinessId } = useParams<{ slug?: string, businessId?: string }>();
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
              event: 'UPDATE',
              schema: 'public',
              table: 'businesses',
              filter: `owner_id=eq.${ownerId}`
            },
            (payload) => {
              const newStatus = payload.new.subscription_status;
              setIsExpired(newStatus !== 'active');
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
  }, [urlSlug, urlBusinessId, ownerId]);

  const fetchLinks = async () => {
    if (!urlSlug && !urlBusinessId) {
      setLoading(false);
      return;
    }
    
    try {
      if (urlBusinessId) {
        // Fetch by business ID
        const { data: bizData, error: bizError } = await supabase
          .from('businesses')
          .select('id, owner_id, review_link, website_link, subscription_status')
          .eq('id', urlBusinessId)
          .maybeSingle();

        if (bizError) throw bizError;

        if (bizData) {
          setLinks(bizData);
          setBusinessId(bizData.id);
          setOwnerId(bizData.owner_id);
          setIsExpired(bizData.subscription_status !== 'active');

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

        if (ownerError) throw ownerError;

        if (owner) {
          setBusinessName(owner.business_name);
          setOwnerId(owner.id);
          setSlug(owner.public_slug);
          
          const { data: bizData, error: linkError } = await supabase
            .from('businesses')
            .select('id, review_link, website_link, subscription_status')
            .eq('owner_id', owner.id)
            .maybeSingle();
            
          if (linkError) throw linkError;

          if (bizData) {
            setLinks(bizData);
            setBusinessId(bizData.id);
            setIsExpired(bizData.subscription_status !== 'active');
          }
        }
      }
    } catch (err) {
      console.error("Error fetching public review links:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSelect = (selectedRating: number) => {
    if (isExpired) {
      alert("This business is currently inactive.");
      return;
    }
    setRating(selectedRating);
    // Always show feedback form first, even for 4-5 stars
    setStep('feedback');
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isExpired) {
      alert("This business is currently inactive.");
      return;
    }
    if (!businessId) {
      alert("Error: Business information missing. Please try again later.");
      return;
    }

    setSubmitting(true);
    try {
      const targetTable = rating >= 4 ? 'reviews' : 'private_reviews';
      
      const insertData: any = {
        business_id: businessId,
        rating: rating,
        feedback: comment,
        created_at: new Date().toISOString()
      };

      // Only add name if it's the public reviews table (private_reviews doesn't have it)
      if (targetTable === 'reviews') {
        insertData.name = customerName || 'Customer';
      } else {
        // For private reviews, prepend name to feedback
        insertData.feedback = `From: ${customerName || 'Anonymous'}\n\n${comment}`;
      }

      const { error } = await supabase
        .from(targetTable)
        .insert([insertData]);

      if (error) throw error;
      setStep('success');
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("Failed to submit feedback. Please try again.");
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
      <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
          <Star size={40} className="opacity-50" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Business Not Found</h1>
        <p className="text-slate-500 max-w-xs mb-8">We couldn't find the business associated with this QR code.</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center justify-center p-6 font-sans">
      {/* Inactive Banner */}
      {isExpired && (
        <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white py-3 px-6 text-center font-bold z-[100] shadow-lg flex items-center justify-center gap-2 text-sm">
          <AlertCircle size={18} />
          <span>Business Inactive - Reviews Temporarily Disabled</span>
        </div>
      )}
      
      <AnimatePresence>
        {step === 'success' && (
          <SuccessOverlay 
            rating={rating} 
            reviewLink={links?.review_link} 
            isFeedback={rating <= 3}
          />
        )}
      </AnimatePresence>

      <div className={`w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-blue-500/10 p-8 md:p-10 border border-white/40 backdrop-blur-sm ${isExpired ? 'opacity-75 pointer-events-none grayscale' : ''}`}>
        <div className="text-center mb-10">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-2">{businessName}</h1>
          <div className="h-1 w-12 bg-blue-500 mx-auto rounded-full" />
        </div>

        {isExpired ? (
          <div className="text-center space-y-4 py-8">
            <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-700">Reviews Disabled</h2>
            <p className="text-slate-500">This business is currently inactive. Please check back later.</p>
            <button 
              onClick={() => window.location.href = `/b/${slug}`}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold mt-4 pointer-events-auto"
            >
              View Business Profile
            </button>
          </div>
        ) : (
          <>
            {step === 'rating' && (
              <div className="space-y-8 text-center">
                <h2 className="text-xl font-bold text-slate-700">How was your experience?</h2>
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
                          star <= (hover || rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                        } transition-colors duration-200`}
                      />
                    </motion.button>
                  ))}
                </div>
                <p className="text-slate-400 text-sm font-medium">Tap a star to rate us</p>
              </div>
            )}

            {step === 'feedback' && (
              <form onSubmit={handleSubmitFeedback} className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-slate-700 mb-2">
                    {rating >= 4 ? "We're glad you enjoyed it!" : "We'd love to hear more"}
                  </h2>
                  <p className="text-slate-500 text-sm">
                    {rating >= 4 
                      ? "Share a quick note about your experience." 
                      : "Your feedback helps us improve our service."}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Your Name</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Optional"
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
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
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 font-medium resize-none"
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
        )}
      </div>

      {/* Footer */}
      <div className="mt-20 pb-12 flex flex-col items-center justify-center border-t border-gray-100 dark:border-white/5 pt-12">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <div className="w-4 h-4 border-2 border-white rounded-sm rotate-45" />
          </div>
          <span className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">Scanzo</span>
        </div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Powered by Scanzo</p>
      </div>
    </div>
  );
};

export default PublicReviewPage;
