import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Star, Globe, Building2, ChevronRight, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ScanLandingPage() {
  const { slug } = useParams<{ slug: string }>();
  const [businessName, setBusinessName] = useState('Business');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [reviewLink, setReviewLink] = useState<string | null>(null);
  const [websiteLink, setWebsiteLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let subscriptionChannel: any = null;

    const fetchBusinessData = async () => {
      if (!slug) {
        setError("Invalid QR Code");
        setLoading(false);
        return;
      }
      
      try {
        // 1. Get owner info from slug
        const { data: owner, error: ownerError } = await supabase
          .from('owners')
          .select('id, business_name')
          .eq('public_slug', slug)
          .maybeSingle();

        if (ownerError) throw ownerError;
        if (!owner) {
          setError("Business not found");
          setLoading(false);
          return;
        }

        setBusinessName(owner.business_name);
        
        // 2. Get logo and links
        const [pageRes, linksRes] = await Promise.all([
          supabase.from('business_pages').select('logo_url').eq('owner_id', owner.id).maybeSingle(),
          supabase.from('businesses').select('review_link, website_link').eq('owner_id', owner.id).maybeSingle()
        ]);

        if (pageRes.data?.logo_url) setLogoUrl(pageRes.data.logo_url);
        if (linksRes.data) {
          setReviewLink(linksRes.data.review_link);
          setWebsiteLink(linksRes.data.website_link);
        }

        // 3. Initial Subscription Check
        const checkSubscription = async () => {
          const { data: biz } = await supabase
            .from('businesses')
            .select('subscription_status')
            .eq('owner_id', owner.id)
            .maybeSingle();

          const isSubActive = biz?.subscription_status === 'active';
          setIsExpired(!isSubActive);
        };

        await checkSubscription();

        // 4. Real-time Subscription Updates
        subscriptionChannel = supabase
          .channel(`business-${owner.id}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'businesses',
              filter: `owner_id=eq.${owner.id}`
            },
            (payload) => {
              const newStatus = payload.new.subscription_status;
              setIsExpired(newStatus !== 'active');
            }
          )
          .subscribe();

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
  }, [slug]);

  const handleRedirect = (url: string | null) => {
    if (!url) return;
    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }
    window.location.href = finalUrl;
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#F2F2F7] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-slate-500 font-medium animate-pulse">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[100dvh] bg-[#F2F2F7] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
          <AlertCircle size={40} />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">{error}</h1>
        <button 
          onClick={() => navigate('/')}
          className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold mt-4"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-[100dvh] bg-[#F2F2F7] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-6">
          <AlertCircle size={40} />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Business Inactive</h1>
        <p className="text-slate-500 max-w-xs mx-auto">This business is currently inactive. Please contact the owner.</p>
        <button 
          onClick={() => navigate('/')}
          className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold mt-8"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#F2F2F7] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Premium Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-400/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8 relative z-10"
      >
        <div className="text-center">
          <div className="w-24 h-24 rounded-3xl bg-white shadow-xl mx-auto mb-6 overflow-hidden p-1">
            <div className="w-full h-full rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center">
              {logoUrl ? (
                <img src={logoUrl} alt={businessName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-500">
                  <Building2 size={40} />
                </div>
              )}
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{businessName}</h1>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Website Card (Explore) - Now on Top */}
          {!websiteLink ? (
            <div className="p-6 bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm rounded-3xl text-center">
              <p className="text-slate-500 font-medium italic">Business website not set yet.</p>
            </div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRedirect(websiteLink)}
              className="cursor-pointer p-6 bg-white/90 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl text-left flex items-center gap-5 group transition-all"
            >
              <div className="w-14 h-14 bg-blue-100 text-blue-500 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm">
                <Globe size={28} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-lg">Explore Here</h3>
                <p className="text-sm text-slate-500">Visit our website or menu</p>
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-slate-500 transition-all" />
            </motion.div>
          )}

          {/* Review Card - Now below Explore */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/r/${slug}`)}
            className="cursor-pointer p-6 bg-white/90 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl text-left flex items-center gap-5 group transition-all"
          >
            <div className="w-14 h-14 bg-amber-100 text-amber-500 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm">
              <Star size={28} className="fill-current" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-800 text-lg">Leave a Review</h3>
              <p className="text-sm text-slate-500">Tell us about your experience</p>
            </div>
            <ChevronRight className="text-slate-300 group-hover:text-slate-500 transition-all" />
          </motion.div>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="mt-20 pb-12 flex flex-col items-center justify-center border-t border-gray-100 dark:border-white/5 pt-12 relative z-10">
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
}
