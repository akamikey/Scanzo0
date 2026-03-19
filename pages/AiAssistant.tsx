import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, MessageSquare, TrendingUp, ArrowRight, Loader2, Lightbulb, Bot, ThumbsUp, ThumbsDown, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { GoogleGenAI, Type } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import Footer from '../components/Footer';

const AiAssistant: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reviewsData, setReviewsData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    growthTrend: '+0%',
    positiveCount: 0,
    negativeCount: 0
  });
  const [analyzingReviews, setAnalyzingReviews] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{
    sentiment: string;
    complaints: string[];
    highlights: string[];
    suggestions: string[];
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    
    fetchData();

    // Set up real-time subscription
    const channel = supabase
      .channel('scanzo_coach_reviews')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews'
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch business IDs for the user
      const { data: businesses } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id);
      
      const businessIds = businesses?.map(b => b.id) || [];

      if (businessIds.length === 0) {
          setLoading(false);
          return;
      }

      // 2. Fetch reviews for stats and analysis
      const { data: reviews } = await supabase
        .from('reviews')
        .select('id, rating, feedback, created_at, name')
        .in('business_id', businessIds)
        .order('created_at', { ascending: false });

      if (reviews && reviews.length > 0) {
        setReviewsData(reviews);
        const total = reviews.length;
        const avg = reviews.reduce((acc, curr) => acc + curr.rating, 0) / total;
        const positive = reviews.filter(r => r.rating >= 4).length;
        const negative = reviews.filter(r => r.rating <= 3).length;
        
        setStats({
          averageRating: Number(avg.toFixed(1)),
          totalReviews: total,
          growthTrend: '',
          positiveCount: positive,
          negativeCount: negative
        });

        // Analyze all reviews for the business
        analyzeAllReviews(reviews);
      } else {
        setStats({
          averageRating: 0,
          totalReviews: 0,
          growthTrend: '',
          positiveCount: 0,
          negativeCount: 0
        });
        setAiAnalysis(null);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeAllReviews = async (allReviews: any[], retryCount = 0) => {
    if (!allReviews.length) return;
    setAnalyzingReviews(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const reviewsText = allReviews.map(r => `Rating: ${r.rating}, Feedback: ${r.feedback || 'No text'}`).join('\n');
      
      const prompt = `Analyze the following customer reviews for a business and provide insights in a structured format.
      
      Reviews:
      ${reviewsText}
      
      Analyze:
      1. Customer Sentiment: Summarize if customers are mostly happy or unhappy.
      2. Common Complaints: List repeated problems mentioned in reviews.
      3. Positive Highlights: List what customers liked most.
      4. Action Suggestions: Give simple business improvements based on feedback.
      
      Return the response as a JSON object with these keys: "sentiment", "complaints" (array), "highlights" (array), "suggestions" (array).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sentiment: { type: Type.STRING },
              complaints: { type: Type.ARRAY, items: { type: Type.STRING } },
              highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["sentiment", "complaints", "highlights", "suggestions"]
          }
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        setAiAnalysis(parsed);
      }
    } catch (error: any) {
      if (error.message?.includes('Failed to fetch') && retryCount < 3) {
          console.debug(`Retrying AI analysis (${retryCount + 1}/3)...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          return analyzeAllReviews(allReviews, retryCount + 1);
      }
      console.error("Error analyzing reviews:", error);
    } finally {
      setAnalyzingReviews(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6 pb-24">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 p-8 md:p-10 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-sm font-medium mb-4">
            <Sparkles size={16} />
            AI Coach Dashboard
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">AI Business Coach</h1>
          <p className="text-blue-100 text-lg max-w-xl">
            Your personal business strategist analyzing customer feedback in real-time.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Insight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                <Star size={24} className="fill-current" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Rating</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageRating}</h3>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                <MessageSquare size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Reviews</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalReviews}</h3>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-500 shrink-0">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Positive</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.positiveCount}</h3>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                <TrendingUp size={24} className="rotate-180" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Negative</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.negativeCount}</h3>
              </div>
            </div>
          </motion.div>
        </div>

        {/* AI Coach Analysis Sections */}
        {analyzingReviews && !aiAnalysis ? (
          <GlassCard className="p-12 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="animate-spin text-blue-500" size={48} />
            <p className="text-gray-500 font-medium animate-pulse">AI Coach is analyzing your reviews...</p>
          </GlassCard>
        ) : aiAnalysis ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Sentiment */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <MessageSquare size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Customer Sentiment</h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {aiAnalysis.sentiment}
              </p>
            </GlassCard>

            {/* Common Complaints */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400">
                  <AlertTriangle size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Common Complaints</h2>
              </div>
              <ul className="space-y-2">
                {aiAnalysis.complaints.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </GlassCard>

            {/* Positive Highlights */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400">
                  <Star size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Positive Highlights</h2>
              </div>
              <ul className="space-y-2">
                {aiAnalysis.highlights.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </GlassCard>

            {/* Action Suggestions */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Lightbulb size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Action Suggestions</h2>
              </div>
              <ul className="space-y-2">
                {aiAnalysis.suggestions.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </GlassCard>
          </div>

          {/* Recent Feedback Section */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <MessageSquare size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Feedback</h2>
              </div>
            </div>
            
            <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
              {reviewsData.length > 0 ? (
                reviewsData.map((review) => (
                  <div key={review.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={14} 
                              className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-300 dark:text-gray-600"} 
                            />
                          ))}
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {review.name || review.customer_name || 'Anonymous'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                      "{review.feedback || review.comment || 'No feedback provided'}"
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No feedback yet from customers.
                </div>
              )}
            </div>
          </GlassCard>
        </>
        ) : (
          <GlassCard className="p-12 text-center text-gray-500">
            No reviews yet to analyze. Start collecting feedback to get AI insights!
          </GlassCard>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AiAssistant;
