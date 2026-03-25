import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Star, MessageSquare, ArrowRight, QrCode, Zap } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Review } from '../types';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const Dashboard: React.FC = () => {
  const { user, ownerData, subscription } = useAuth();
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({ total: 0, avg: "0.0", positive: 0, negative: 0 });
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    fetchDashboardData();

    // Set up real-time subscription for both public and private reviews
    const reviewsChannel = supabase
      .channel('dashboard_reviews')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews'
        },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    const privateReviewsChannel = supabase
      .channel('dashboard_private_reviews')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'private_reviews'
        },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(reviewsChannel);
      supabase.removeChannel(privateReviewsChannel);
    };
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
        // 1. Fetch business IDs for the user
        const { data: businesses } = await supabase
            .from('businesses')
            .select('id')
            .eq('owner_id', user.id);
        
        const businessIds = businesses?.map(b => b.id) || [];

        // 2. Fetch All Reviews (Public and Private)
        // We fetch reviews that belong to one of the user's businesses.
        // Both public and private reviews are fetched by business_id (owner_id column missing in both schemas).
        let reviewsQuery = supabase.from('reviews').select('*');
        let privateQuery = supabase.from('private_reviews').select('*');

        if (businessIds.length > 0) {
            reviewsQuery = reviewsQuery.in('business_id', businessIds);
            privateQuery = privateQuery.in('business_id', businessIds);
        } else {
            // If no businesses, no reviews can be found by business_id
            reviewsQuery = reviewsQuery.eq('id', '00000000-0000-0000-0000-000000000000'); // Dummy filter
            privateQuery = privateQuery.eq('id', '00000000-0000-0000-0000-000000000000'); // Dummy filter
        }

        const [reviewsRes, privateRes] = await Promise.all([
            reviewsQuery.order('created_at', { ascending: false }),
            privateQuery.order('created_at', { ascending: false })
        ]);

        if (reviewsRes.error) throw reviewsRes.error;
        if (privateRes.error) throw privateRes.error;

        // Combine and sort
        const allReviews = [
            ...(reviewsRes.data || []),
            ...(privateRes.data || [])
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        if (allReviews) {
            // Set reviews for the list
            setRecentReviews(allReviews as any);

            // Calculate stats
            const totalCount = allReviews.length;
            const totalSum = allReviews.reduce((acc, curr) => acc + curr.rating, 0);
            const avgRating = totalCount > 0 ? (totalSum / totalCount).toFixed(1) : "0.0";
            const positive = allReviews.filter(r => r.rating >= 4).length;
            const negative = allReviews.filter(r => r.rating <= 3).length;
            
            setStats({ total: totalCount, avg: avgRating, positive, negative });

            // Generate AI Insights if there are reviews
            if (totalCount > 0) {
                generateAIInsights(allReviews);
            }
        }

    } catch (err) {
        console.error("Error loading dashboard:", err);
    } finally {
        setLoading(false);
    }
  };

  const generateAIInsights = async (reviews: Review[]) => {
    if (reviews.length === 0) return;
    
    setAnalyzing(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
        const model = "gemini-3-flash-preview";
        
        const reviewTexts = reviews
            .slice(0, 20) // Analyze last 20 reviews
            .map(r => `Rating: ${r.rating}, Feedback: ${r.feedback || r.comment || r.message}`)
            .join('\n');

        const prompt = `You are a professional business analyst. Analyze the following customer reviews and provide a structured summary with:
1. **Overall Sentiment**: A one-sentence summary of the general customer mood.
2. **Key Strengths**: 2-3 bullet points on what customers love.
3. **Areas for Improvement**: 2-3 bullet points on what needs attention.
4. **Actionable Advice**: One specific recommendation for the business owner.

Keep it professional, concise, and constructive.

Reviews:
${reviewTexts}`;

        const result = await ai.models.generateContent({
            model,
            contents: [{ parts: [{ text: prompt }] }]
        });

        if (result.text) {
            setInsights(result.text);
        }
    } catch (err) {
        console.error("Error generating AI insights:", err);
        setInsights("Unable to generate insights at this time.");
    } finally {
        setAnalyzing(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6" 
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Welcome back to <strong>{ownerData?.business_name || 'Scanzo'}</strong>.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/qr-code">
             <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 flex items-center gap-2">
               <QrCode size={16} /> Get QR Code
             </button>
          </Link>
        </div>
      </div>

      {/* Subscription Status Card */}
      <GlassCard delay={0.05} className={`border-l-4 ${subscription?.isActive ? 'border-l-green-500' : 'border-l-red-500'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${subscription?.isActive ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'}`}>
              <Zap size={24} className={subscription?.isActive ? 'fill-green-500' : ''} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {subscription?.isActive ? 'Active Subscription' : 'Subscription Inactive'}
                </h3>
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${subscription?.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {subscription?.isActive ? 'Premium' : 'Free'}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {subscription?.isActive ? (
                  <>
                    Plan: <span className="font-semibold text-gray-700 dark:text-gray-200">{subscription.plan}</span> • 
                    Expires on: <span className="font-semibold text-gray-700 dark:text-gray-200">{new Date(subscription.end_date!).toLocaleDateString()}</span>
                  </>
                ) : (
                  subscription?.status === 'expired' 
                    ? 'Your subscription has expired. Renew to continue using premium features.'
                    : 'Upgrade to a premium plan to unlock all features.'
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {subscription?.isActive ? (
              <div className="text-right hidden md:block">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Status</p>
                <p className="text-sm font-bold text-green-600">Operational</p>
              </div>
            ) : (
              <Link to="/subscribe">
                <button className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center gap-2">
                  Subscribe Now <ArrowRight size={16} />
                </button>
              </Link>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard delay={0.1} className="flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-green-100 dark:bg-green-500/20 rounded-lg text-green-600 dark:text-green-400">
              <TrendingUp size={20} />
            </div>
          </div>
          <div>
             <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Positive Reviews</h3>
             <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.positive}</p>
          </div>
        </GlassCard>

        <GlassCard delay={0.2} className="flex flex-col justify-between h-32">
           <div className="flex justify-between items-start">
            <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-lg text-red-600 dark:text-red-400">
              <Star size={20} />
            </div>
          </div>
          <div>
             <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Negative Reviews</h3>
             <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.negative}</p>
          </div>
        </GlassCard>

        <GlassCard delay={0.3} className="flex flex-col justify-between h-32">
           <div className="flex justify-between items-start">
            <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400">
              <MessageSquare size={20} />
            </div>
          </div>
          <div>
             <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Reviews</h3>
             <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
          </div>
        </GlassCard>

        <GlassCard delay={0.4} className="flex flex-col justify-between h-32">
           <div className="flex justify-between items-start">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-500/20 rounded-lg text-yellow-600 dark:text-yellow-400">
              <Star size={20} />
            </div>
          </div>
          <div>
             <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Avg. Rating</h3>
             <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.avg}</p>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Feedback List */}
        <div className="lg:col-span-2">
            <GlassCard delay={0.5} className="h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Feedback</h3>
              </div>
              
              {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading reviews...</div>
              ) : recentReviews.length === 0 ? (
                  <div className="text-center py-10">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                          <MessageSquare className="text-gray-400" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400">No feedback yet from customers.</p>
                      <p className="text-sm text-gray-400">Scan your QR code to test!</p>
                  </div>
              ) : (
                  <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                    {recentReviews.map((review) => (
                      <div key={review.id} className="group p-4 rounded-2xl bg-white/50 dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-white/10 transition-colors border border-transparent hover:border-blue-100 dark:hover:border-white/10">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-lg font-bold text-gray-600 dark:text-gray-300">
                              {(review.name || review.customer_name || 'A').charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{review.name || review.customer_name || 'Anonymous'}</h4>
                              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <span>{new Date(review.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={14} className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"} />
                            ))}
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                          "{review.feedback || review.comment || review.message || 'No feedback text provided'}"
                        </p>
                      </div>
                    ))}
                  </div>
              )}
            </GlassCard>
        </div>

        {/* Quick Actions / Integration Status */}
        <div className="lg:col-span-1 space-y-6">
           <GlassCard delay={0.6} className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none">
              <h3 className="text-lg font-bold mb-2">Internal Rating</h3>
              <div className="flex items-end gap-2 mb-4">
                 <span className="text-5xl font-bold">{stats.avg}</span>
                 <div className="flex flex-col mb-1.5">
                   <div className="flex">
                      {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} className={i < Math.round(parseFloat(stats.avg)) ? "text-yellow-300 fill-yellow-300" : "text-blue-400"} />
                        ))}
                   </div>
                   <span className="text-xs text-blue-100">Based on {stats.total} reviews</span>
                 </div>
              </div>
           </GlassCard>

           <GlassCard delay={0.7} className="overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-purple-100 dark:bg-purple-500/20 rounded-lg text-purple-600 dark:text-purple-400">
                  <Zap size={18} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Insights</h3>
              </div>
              
              {analyzing ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                </div>
              ) : insights ? (
                <div className="text-sm text-gray-600 dark:text-gray-300 prose dark:prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{insights}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  Collect more reviews to unlock AI-powered insights.
                </p>
              )}
           </GlassCard>
        </div>
      </div>

      {/* Footer */}
    </motion.div>
  );
};

export default Dashboard;