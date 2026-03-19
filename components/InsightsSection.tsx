import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

interface InsightsSectionProps {
  businessId: string | null;
}

const InsightsSection: React.FC<InsightsSectionProps> = ({ businessId }) => {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!businessId) return;

    const fetchReviews = async () => {
      setLoading(true);
      const { data: reviews, error } = await supabase
        .from("reviews")
        .select("rating, created_at")
        .eq("business_id", businessId);

      if (error) {
        console.error("Error fetching reviews:", error);
        setLoading(false);
        return;
      }

      if (!reviews || reviews.length === 0) {
        setData([]);
        setLoading(false);
        return;
      }

      // Process data: Group by week
      const weeklyData: { [key: string]: { reviews: number, totalRating: number } } = {};
      reviews.forEach(review => {
        const date = new Date(review.created_at);
        const week = `${date.getFullYear()}-W${Math.ceil((date.getDate() + date.getDay()) / 7)}`;
        if (!weeklyData[week]) {
          weeklyData[week] = { reviews: 0, totalRating: 0 };
        }
        weeklyData[week].reviews += 1;
        weeklyData[week].totalRating += review.rating;
      });

      const processedData = Object.keys(weeklyData).sort().map(week => ({
        name: week,
        reviews: weeklyData[week].reviews,
        rating: weeklyData[week].totalRating / weeklyData[week].reviews
      }));

      setData(processedData);
      setLoading(false);
    };

    fetchReviews();
  }, [businessId]);

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
  if (!data || data.length === 0) return <div className="p-10 text-center text-gray-500">No analytics data yet</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Weekly Review Volume</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.2)" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip cursor={{ fill: 'rgba(128,128,128,0.1)' }} />
              <Bar dataKey="reviews" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Rating Trend</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.2)" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 5]} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="rating" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default InsightsSection;
