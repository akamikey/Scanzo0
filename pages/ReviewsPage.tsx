import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, Loader2, AlertCircle, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Review } from '../types';

const ReviewsPage: React.FC = () => {
  const { user, handleAuthError } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [counts, setCounts] = useState({ positive: 0, negative: 0 });

  useEffect(() => {
    if (user) {
      fetchReviews();
    }
  }, [user, selectedRating]);

  const fetchReviews = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch business IDs for the user
      const { data: businesses, error: bError } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id);
      
      if (bError) throw bError;
      const businessIds = businesses?.map(b => b.id) || [];

      if (businessIds.length === 0) {
        setReviews([]);
        setCounts({ positive: 0, negative: 0 });
        setLoading(false);
        return;
      }

      // 2. Fetch All Reviews for Counts (Positive/Negative)
      // We need all reviews to calculate the top section counts
      const { data: allReviews, error: allErr } = await supabase
        .from('reviews')
        .select('rating')
        .in('business_id', businessIds);
      
      if (allErr) throw allErr;

      if (allReviews) {
        const positive = allReviews.filter(r => r.rating >= 4).length;
        const negative = allReviews.filter(r => r.rating <= 3).length;
        setCounts({ positive, negative });
      }

      // 3. Fetch Filtered Reviews for the List
      let query = supabase
        .from('reviews')
        .select('*')
        .in('business_id', businessIds)
        .order('created_at', { ascending: false });

      if (selectedRating !== null) {
        query = query.eq('rating', selectedRating);
      }

      const { data, error } = await query;
      if (error) throw error;

      setReviews(data || []);
    } catch (err) {
      const handled = await handleAuthError(err);
      if (!handled) {
        console.error('Error fetching reviews:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ rating, size = 16, className = "" }: { rating: number, size?: number, className?: string }) => (
    <div className={`flex gap-0.5 ${className}`}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 dark:text-gray-700"}
        />
      ))}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-20"
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reviews Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Monitor and filter your customer feedback.</p>
      </div>

      {/* Top Section: Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Positive Reviews</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{counts.positive}</h3>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                <TrendingUp size={12} />
                Rating 4 or 5
              </p>
            </div>
            <div className="p-4 bg-green-100 dark:bg-green-500/20 rounded-2xl text-green-600 dark:text-green-400">
              <CheckCircle2 size={28} />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Negative Reviews</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{counts.negative}</h3>
              <p className="text-xs text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                <TrendingDown size={12} />
                Rating 3 or below
              </p>
            </div>
            <div className="p-4 bg-red-100 dark:bg-red-500/20 rounded-2xl text-red-600 dark:text-red-400">
              <AlertCircle size={28} />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Star Filter Row */}
      <div className="flex flex-wrap items-center gap-4 bg-white/50 dark:bg-slate-800/50 p-4 rounded-2xl backdrop-blur-sm border border-white/20 dark:border-white/5">
        <span className="text-sm font-bold text-gray-700 dark:text-gray-300 mr-2">Filter by Rating:</span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedRating(null)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              selectedRating === null
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600'
            }`}
          >
            All
          </button>
          {[5, 4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => setSelectedRating(rating)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                selectedRating === rating
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600'
              }`}
            >
              <div className="flex">
                {[...Array(rating)].map((_, i) => (
                  <Star key={i} size={14} className="fill-current" />
                ))}
              </div>
              <span>{rating} Star</span>
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-gray-500 animate-pulse">Fetching reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 bg-white/30 dark:bg-white/5 rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
            <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">No reviews found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {selectedRating ? `No ${selectedRating}-star reviews yet.` : "You haven't received any reviews yet."}
            </p>
            {selectedRating && (
              <button
                onClick={() => setSelectedRating(null)}
                className="mt-4 text-blue-600 font-bold hover:underline"
              >
                Clear filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {reviews.map((review) => (
                <motion.div
                  key={review.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative p-6 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/20 dark:border-white/5 rounded-3xl shadow-sm hover:shadow-xl hover:bg-white dark:hover:bg-slate-800 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
                        {(review.name || review.customer_name || 'A').charAt(0).toUpperCase()}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-900 dark:text-white">
                            {review.name || review.customer_name || 'Anonymous Guest'}
                          </span>
                          <StarRating rating={review.rating} />
                        </div>
                        <p className={`text-sm leading-relaxed ${
                          review.feedback === 'Positive review redirected to Google' 
                            ? 'text-blue-500 font-bold' 
                            : 'text-gray-600 dark:text-gray-300 italic'
                        }`}>
                          {review.feedback === 'Positive review redirected to Google' 
                            ? '✨ Redirected to Google Review' 
                            : `"${review.feedback || review.comment || review.message || 'No comment provided'}"`}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        {new Date(review.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(review.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ReviewsPage;
