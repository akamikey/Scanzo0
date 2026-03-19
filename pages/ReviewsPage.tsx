import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Calendar, Filter, ThumbsUp, AlertCircle, CheckCircle, Clock, Search, MessageSquare } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Review } from '../types';

type TimeFilter = 'all' | 'today' | 'week' | 'month';

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

const UserAvatar = ({ name }: { name: string }) => (
  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-[9px] font-bold text-gray-600 dark:text-gray-300">
      {name ? name.charAt(0).toUpperCase() : 'A'}
  </div>
);

interface ReviewCardProps {
  review: Review;
  isPositive: boolean;
  isResolved: boolean;
  onResolve: (id: string) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, isPositive, isResolved, onResolve }) => {
  return (
    <motion.div
      variants={itemVariants}
      layout
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02, y: -2 }}
      className={`relative p-5 rounded-2xl backdrop-blur-md border shadow-sm transition-all duration-300 group ${
           isPositive 
           ? 'bg-white/60 dark:bg-slate-800/60 border-green-100 dark:border-green-900/20' 
           : `bg-white/60 dark:bg-slate-800/60 border-red-100 dark:border-red-900/20 ${isResolved ? 'opacity-60 grayscale' : ''}`
      }`}
    >
       {/* Accent Line */}
       <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${isPositive ? 'bg-green-400' : 'bg-red-400'}`} />

       <div className="pl-4">
          <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                      <Star 
                          key={i} 
                          size={14} 
                          className={`${i < review.rating ? (isPositive ? 'text-green-500 fill-green-500' : 'text-orange-400 fill-orange-400') : 'text-gray-200 dark:text-gray-700'}`} 
                      />
                  ))}
                  <span className="ml-2 text-xs font-medium text-gray-400">
                      {new Date(review.created_at).toLocaleDateString()}
                  </span>
              </div>
              {!isPositive && (
                  <button 
                      onClick={() => onResolve(review.id)}
                      className={`text-xs px-2 py-1 rounded-full transition-colors ${
                          isResolved 
                          ? 'bg-gray-100 text-gray-500' 
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                  >
                      {isResolved ? 'Resolved' : 'Mark Resolved'}
                  </button>
              )}
          </div>

          <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed font-medium">
              "{review.feedback || review.comment}"
          </p>

          <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
              <UserAvatar name={review.name || review.customer_name || 'Anonymous'} />
              <span>{review.name || review.customer_name || 'Anonymous Guest'}</span>
              <span className="mx-1">•</span>
              <span>{new Date(review.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
       </div>
    </motion.div>
  );
};

const ReviewsPage: React.FC = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TimeFilter>('all');
  const [activeTab, setActiveTab] = useState<'resolution' | 'recent'>('resolution');
  
  // Initialize from localStorage
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(() => {
    try {
        const stored = localStorage.getItem('scanzo_resolved');
        return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch(e) { return new Set(); }
  });

  useEffect(() => {
    if (!user) return;
    
    fetchReviews();

    // Set up real-time subscription
    const channel = supabase
      .channel('reviews_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews'
        },
        () => {
          fetchReviews();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchReviews = async (retryCount = 0) => {
    if (!user) return;
    try {
      // First fetch business IDs for the user
      const { data: businesses } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id);
      
      const businessIds = businesses?.map(b => b.id) || [];
      
      if (businessIds.length === 0) {
          setLoading(false);
          return;
      }

      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .in('business_id', businessIds)
        .order('created_at', { ascending: false });

      if (error) {
          if (error.message?.includes('Failed to fetch') && retryCount < 3) {
              console.debug(`Retrying reviews fetch (${retryCount + 1}/3)...`);
              await new Promise(resolve => setTimeout(resolve, 1000));
              return fetchReviews(retryCount + 1);
          }
          throw error;
      }
      setReviews(data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const markResolved = (id: string) => {
    const newSet = new Set(resolvedIds);
    if (newSet.has(id)) {
        newSet.delete(id);
    } else {
        newSet.add(id);
    }
    setResolvedIds(newSet);
    localStorage.setItem('scanzo_resolved', JSON.stringify(Array.from(newSet)));
  };

  // --- Filtering Logic ---
  const filteredReviews = reviews.filter((r) => {
    if (filter === 'all') return true;
    const date = new Date(r.created_at);
    const now = new Date();
    
    // Reset time parts for accurate day comparison
    const dDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (filter === 'today') {
      return dDate.getTime() === nDate.getTime();
    }
    if (filter === 'week') {
      const weekAgo = new Date(nDate);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return dDate >= weekAgo;
    }
    if (filter === 'month') {
      const monthAgo = new Date(nDate);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return dDate >= monthAgo;
    }
    return true;
  });

  const positiveReviews = filteredReviews.filter(r => r.rating >= 4);
  const negativeReviews = filteredReviews.filter(r => r.rating < 4);

  return (
    <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8 pb-20"
    >
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
             Review Control <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
           </h1>
           <p className="text-gray-500 dark:text-gray-400 mt-1">Manage all valid customer experiences in one place.</p>
        </div>

        <div className="flex bg-white/50 dark:bg-slate-800/50 p-1 rounded-xl backdrop-blur-sm border border-white/20 dark:border-white/5 overflow-x-auto no-scrollbar min-w-max md:min-w-0">
            {(['all', 'today', 'week', 'month'] as TimeFilter[]).map((f) => (
                <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        filter === f 
                        ? 'bg-white dark:bg-slate-700 shadow-md text-gray-900 dark:text-white' 
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                    }`}
                >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
            ))}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 dark:border-white/10 px-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('resolution')}
          className={`px-6 py-4 text-sm font-bold transition-all relative min-w-max ${
            activeTab === 'resolution' 
              ? 'text-blue-600 dark:text-blue-400' 
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Resolution Center
          {activeTab === 'resolution' && (
            <motion.div layoutId="reviewsActiveTab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('recent')}
          className={`px-6 py-4 text-sm font-bold transition-all relative min-w-max ${
            activeTab === 'recent' 
              ? 'text-blue-600 dark:text-blue-400' 
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          All Reviews
          {activeTab === 'recent' && (
            <motion.div layoutId="reviewsActiveTab" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'resolution' ? (
          <motion.div
            key="resolution-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-100 dark:border-green-500/20 shadow-sm"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-green-600 dark:text-green-400 font-bold uppercase text-xs tracking-wider mb-1">Positive Vibes</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{positiveReviews.length}</h3>
                        </div>
                        <div className="p-3 bg-white/60 dark:bg-green-500/20 rounded-2xl text-green-500 shadow-sm">
                            <ThumbsUp size={24} />
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 border border-red-100 dark:border-red-500/20 shadow-sm"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-red-600 dark:text-red-400 font-bold uppercase text-xs tracking-wider mb-1">Needs Attention</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{negativeReviews.length}</h3>
                        </div>
                        <div className="p-3 bg-white/60 dark:bg-red-500/20 rounded-2xl text-red-500 shadow-sm relative">
                            <AlertCircle size={24} />
                            {negativeReviews.length > 0 && (
                                <span className="absolute top-0 right-0 -mt-1 -mr-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Main Content Grid */}
            {loading ? (
                 <div className="flex justify-center py-20">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                 </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-20 opacity-60">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare size={32} />
                    </div>
                    <h3 className="text-xl font-bold">No Feedback Yet</h3>
                    <p>No feedback yet from customers.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Positive Column */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2 px-1">
                            <CheckCircle size={16} className="text-green-500" />
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Positive Reviews</h3>
                        </div>
                        {positiveReviews.length > 0 ? (
                            <AnimatePresence>
                                {positiveReviews.map((review) => (
                                    <ReviewCard 
                                      key={review.id} 
                                      review={review} 
                                      isPositive={true}
                                      isResolved={resolvedIds.has(review.id)}
                                      onResolve={markResolved}
                                    />
                                ))}
                            </AnimatePresence>
                        ) : (
                            <div className="p-8 text-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl text-gray-400 text-sm">
                                No positive reviews for this period.
                            </div>
                        )}
                    </div>

                    {/* Needs Attention Column */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2 px-1">
                            <AlertCircle size={16} className="text-red-500" />
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Needs Resolution</h3>
                        </div>
                        {negativeReviews.length > 0 ? (
                            <AnimatePresence>
                                {negativeReviews.map((review) => (
                                    <ReviewCard 
                                      key={review.id} 
                                      review={review} 
                                      isPositive={false}
                                      isResolved={resolvedIds.has(review.id)}
                                      onResolve={markResolved}
                                    />
                                ))}
                            </AnimatePresence>
                        ) : (
                            <div className="p-8 text-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl text-gray-400 text-sm">
                                No issues detected! Good job.
                            </div>
                        )}
                    </div>
                </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="recent-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Recent Reviews Feed */}
            {!loading && reviews.length > 0 ? (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <MessageSquare size={20} className="text-blue-500" />
                            All Reviews
                        </h2>
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full">
                            {filteredReviews.length} Total in this period
                        </span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                        {filteredReviews.map((review) => (
                            <div 
                              key={review.id}
                              className="p-5 bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-gray-100 dark:border-white/5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-blue-50 dark:hover:bg-white/10 transition-all"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="shrink-0 mt-1">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-lg font-bold text-gray-600 dark:text-gray-300">
                                            {(review.name || review.customer_name || 'A').charAt(0)}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900 dark:text-white text-sm">{review.name || review.customer_name || 'Anonymous'}</span>
                                            <div className="flex gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={12} className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 dark:text-gray-700"} />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400">
                                            <span>{new Date(review.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm italic mt-2 leading-relaxed">"{review.feedback || review.comment || 'No feedback text provided'}"</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-500">
                                            {new Date(review.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${review.rating >= 4 ? 'bg-green-500' : 'bg-red-500'}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 opacity-60">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare size={32} />
                    </div>
                    <h3 className="text-xl font-bold">No Feedback Yet</h3>
                    <p>No feedback yet from customers.</p>
                </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
    </motion.div>
  );
};

export default ReviewsPage;