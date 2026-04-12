import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Star, Building2, ChevronRight, AlertCircle, Lock, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ScanLandingPage() {
  const { slug, id } = useParams<{ slug?: string, id?: string }>();
  const [businessName, setBusinessName] = useState('Business');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [reviewLink, setReviewLink] = useState<string | null>(null);
  const [websiteLink, setWebsiteLink] = useState<string | null>(null);
  const [customLink, setCustomLink] = useState<string | null>(null);
  const [customLinkLabel, setCustomLinkLabel] = useState<string | null>(null);
  const [businessSlug, setBusinessSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let subscriptionChannel: any = null;

    const fetchBusinessData = async () => {
      if (!slug && !id) {
        setError("Invalid QR Code");
        setLoading(false);
        return;
      }
      
      try {
        let ownerId = '';
        let bizName = '';
        let bizSlug = '';

        if (id) {
          // 1. Get business info from ID
          const { data: biz, error: bizError } = await supabase
            .from('businesses')
            .select('owner_id, review_link, website_link, custom_link_1, custom_link_label_1, subscription_status')
            .eq('id', id)
            .maybeSingle();

          if (bizError) throw bizError;
          if (!biz) {
            setError("Business not found");
            setLoading(false);
            return;
          }

          ownerId = biz.owner_id;
          setReviewLink(biz.review_link);
          setWebsiteLink(biz.website_link);
          setCustomLink(biz.custom_link_1);
          setCustomLinkLabel(biz.custom_link_label_1);

          // Get owner info
          const { data: owner } = await supabase
            .from('owners')
            .select('business_name, public_slug')
            .eq('id', ownerId)
            .maybeSingle();

          if (owner) {
            bizName = owner.business_name;
            bizSlug = owner.public_slug;
          }
        } else if (slug) {
          // 1. Get owner info from slug
          const { data: owner, error: ownerError } = await supabase
            .from('owners')
            .select('id, business_name, public_slug')
            .eq('public_slug', slug)
            .maybeSingle();

          if (ownerError) throw ownerError;
          if (!owner) {
            setError("Business not found");
            setLoading(false);
            return;
          }

          ownerId = owner.id;
          bizName = owner.business_name;
          bizSlug = owner.public_slug;
          
          // 2. Get links and subscription
          const { data: biz } = await supabase
            .from('businesses')
            .select('review_link, website_link, custom_link_1, custom_link_label_1, subscription_status')
            .eq('owner_id', ownerId)
            .maybeSingle();

          if (biz) {
            setReviewLink(biz.review_link);
            setWebsiteLink(biz.website_link);
            setCustomLink(biz.custom_link_1);
            setCustomLinkLabel(biz.custom_link_label_1);
          }
        }

        setBusinessName(bizName);
        setBusinessSlug(bizSlug);
        
        // 3. Get logo
        const { data: pageData } = await supabase
          .from('business_pages')
          .select('logo_url')
          .eq('owner_id', ownerId)
          .maybeSingle();

        if (pageData?.logo_url) setLogoUrl(pageData.logo_url);

        // 4. Fetch subscription data
        const { data: subData, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('owner_id', ownerId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (subError || !subData) {
          setIsExpired(true);
        } else {
          const sub = subData;
          const endDate = sub.current_period_end ? new Date(sub.current_period_end) : (sub.end_date ? new Date(sub.end_date) : null);
          const now = new Date();
          
          const isStatusActive = ['active', 'authenticated', 'completed', 'trialing'].includes(sub.status);
          const isNotExpired = endDate ? endDate > now : true;
          
          if (isStatusActive && isNotExpired) {
            setIsExpired(false);
          } else {
            setIsExpired(true);
          }
        }

      } catch (err) {
        console.error("Error fetching business data:", err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();

    return () => {
      if (subscriptionChannel) {
        supabase.removeChannel(subscriptionChannel);
      }
    };
  }, [slug, id]);

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#F2F2F7] dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-3xl shadow-xl flex items-center justify-center mb-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[100dvh] bg-[#F2F2F7] dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        {/* Ambient Background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-red-400/10 dark:bg-red-900/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-orange-400/10 dark:bg-orange-900/10 rounded-full blur-[120px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-red-500/10 border border-white/50 dark:border-white/5 max-w-md w-full flex flex-col items-center"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
            className="w-24 h-24 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-inner"
          >
            <AlertCircle size={48} strokeWidth={2} />
          </motion.div>
          
          <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">
            Oops!
          </h1>
          
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
            {error}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-[100dvh] bg-[#F2F2F7] dark:bg-slate-950 flex flex-col items-center p-6 relative overflow-hidden font-sans ${isExpired ? 'pt-24 justify-start' : 'justify-center'}`}>
      {/* Inactive Banner */}
      {isExpired && (
        <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white py-4 px-6 text-center font-bold z-[100] shadow-lg flex items-center justify-center gap-2 text-base animate-pulse">
          <AlertCircle size={20} />
          <span>Business currently inactive, contact owner</span>
        </div>
      )}
      
      {/* Premium Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-400/10 dark:bg-blue-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-400/10 dark:bg-purple-900/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8 relative z-10"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">{businessName}</h1>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Review Card */}
          <motion.div
            whileHover={!isExpired ? { scale: 1.02, y: -4 } : {}}
            whileTap={!isExpired ? { scale: 0.98 } : {}}
            onClick={() => {
              if (isExpired) return;
              if (id) navigate(`/review/${id}`);
              else if (slug) navigate(`/r/${slug}`);
            }}
            className={`p-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/40 dark:border-white/5 shadow-xl rounded-3xl text-left flex items-center gap-5 group transition-all ${
              isExpired ? 'opacity-60 grayscale cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all shadow-sm ${
              isExpired ? 'bg-gray-200 dark:bg-slate-800 text-gray-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-500 group-hover:bg-amber-500 group-hover:text-white'
            }`}>
              {isExpired ? <Lock size={24} /> : <Star size={28} className="fill-current" />}
            </div>
            <div className="flex-1">
              <h3 className={`font-bold text-lg ${isExpired ? 'text-slate-400' : 'text-slate-800 dark:text-white'}`}>
                {isExpired ? 'Reviews Locked' : 'Leave a Review'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isExpired ? 'Business inactive' : 'Tell us about your experience'}
              </p>
            </div>
            {!isExpired ? (
              <ChevronRight className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-all" />
            ) : (
              <Lock size={16} className="text-slate-300 dark:text-slate-600" />
            )}
          </motion.div>

          {/* Custom Link Card */}
          {customLink && (
            <motion.div
              whileHover={!isExpired ? { scale: 1.02, y: -4 } : {}}
              whileTap={!isExpired ? { scale: 0.98 } : {}}
              onClick={() => {
                if (isExpired) return;
                window.location.href = customLink.startsWith('http') ? customLink : `https://${customLink}`;
              }}
              className={`p-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/40 dark:border-white/5 shadow-xl rounded-3xl text-left flex items-center gap-5 group transition-all ${
                isExpired ? 'opacity-60 grayscale cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all shadow-sm ${
                isExpired ? 'bg-gray-200 dark:bg-slate-800 text-gray-400' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white'
              }`}>
                {isExpired ? <Lock size={24} /> : <ExternalLink size={28} />}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold text-lg ${isExpired ? 'text-slate-400' : 'text-slate-800 dark:text-white'}`}>
                  {isExpired ? 'Link Locked' : (customLinkLabel || 'Custom Link')}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {isExpired ? 'Business inactive' : 'Visit our external link'}
                </p>
              </div>
              {!isExpired ? (
                <ChevronRight className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-all" />
              ) : (
                <Lock size={16} className="text-slate-300 dark:text-slate-600" />
              )}
            </motion.div>
          )}

        </div>
      </motion.div>

      {/* Footer Removed */}
    </div>
  );
}
