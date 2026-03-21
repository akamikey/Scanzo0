import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface ChartData {
  name: string;
  reviews: number;
  rating: number;
}

const Insights: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    if (!user) return;
    fetchInsightsData();
  }, [user]);

  const fetchInsightsData = async () => {
    try {
      // 1. Fetch business IDs for the user
      const { data: businesses } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user?.id);
      
      const businessIds = businesses?.map(b => b.id) || [];

      if (businessIds.length === 0) {
        setLoading(false);
        return;
      }

      // 2. Fetch reviews from the last 7 days (both public and private)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const [reviewsRes, privateRes] = await Promise.all([
        supabase
          .from('reviews')
          .select('rating, created_at')
          .in('business_id', businessIds)
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: true }),
        supabase
          .from('private_reviews')
          .select('rating, created_at')
          .in('business_id', businessIds)
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: true })
      ]);

      if (reviewsRes.error) throw reviewsRes.error;
      if (privateRes.error) throw privateRes.error;

      const allReviews = [...(reviewsRes.data || []), ...(privateRes.data || [])];

      // 3. Process data for the last 7 days
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const last7Days: ChartData[] = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayName = days[d.getDay()];
        const dateStr = d.toISOString().split('T')[0];

        const dayReviews = allReviews?.filter(r => r.created_at.startsWith(dateStr)) || [];
        const avgRating = dayReviews.length > 0 
          ? dayReviews.reduce((acc, curr) => acc + curr.rating, 0) / dayReviews.length 
          : 0;

        last7Days.push({
          name: dayName,
          reviews: dayReviews.length,
          rating: Number(avgRating.toFixed(1))
        });
      }

      setChartData(last7Days);
    } catch (err) {
      console.error("Error fetching insights:", err);
    } finally {
      setLoading(false);
    }
  };

  // Custom Tooltip to avoid portal issues
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 border border-white/10 rounded-xl p-3 shadow-xl backdrop-blur-md z-50">
          <p className="text-gray-300 text-xs mb-1">{label}</p>
          <p className="text-white font-bold text-sm">
            {payload[0].value} {payload[0].name === 'reviews' ? 'Reviews' : 'Rating'}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 relative"
      >
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="lg:hidden p-2 -ml-2 text-gray-500 dark:text-gray-400">
             <ArrowLeft size={24} />
          </button>
          <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Insights</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Deep dive into your business performance.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard hoverEffect={false}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Weekly Review Volume</h3>
            <div className="h-64 w-full relative touch-pan-y">
              <ResponsiveContainer width="100%" height="100%" debounce={50}>
                <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    content={<CustomTooltip />} 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    wrapperStyle={{ outline: 'none' }} 
                  />
                  <Bar dataKey="reviews" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} animationDuration={1500} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard hoverEffect={false}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Rating Trend</h3>
            <div className="h-64 w-full relative touch-pan-y">
               <ResponsiveContainer width="100%" height="100%" debounce={50}>
                <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 5]} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    content={<CustomTooltip />} 
                    wrapperStyle={{ outline: 'none' }}
                  />
                  <Line type="monotone" dataKey="rating" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} animationDuration={1500} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Footer */}
      </motion.div>
  );
};

export default Insights;
