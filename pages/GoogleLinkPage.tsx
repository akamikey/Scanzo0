import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Loader2, CheckCircle2, AlertCircle, Edit2, Save, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import Footer from '../components/Footer';

const GoogleLinkPage: React.FC = () => {
  const { user } = useAuth();
  
  // Review Link State
  const [reviewLink, setReviewLink] = useState('');
  const [isEditingReview, setIsEditingReview] = useState(true);
  const [loadingReview, setLoadingReview] = useState(false);
  const [errorReview, setErrorReview] = useState('');
  const [successReview, setSuccessReview] = useState(false);

  // Website Link State
  const [websiteLink, setWebsiteLink] = useState('');
  const [isEditingWebsite, setIsEditingWebsite] = useState(true);
  const [loadingWebsite, setLoadingWebsite] = useState(false);
  const [errorWebsite, setErrorWebsite] = useState('');
  const [successWebsite, setSuccessWebsite] = useState(false);

  // Custom Link 1 State
  const [customLink1, setCustomLink1] = useState('');
  const [customLinkLabel1, setCustomLinkLabel1] = useState('');
  const [isEditingCustom1, setIsEditingCustom1] = useState(true);
  const [loadingCustom1, setLoadingCustom1] = useState(false);
  const [errorCustom1, setErrorCustom1] = useState('');
  const [successCustom1, setSuccessCustom1] = useState(false);

  useEffect(() => {
    if (user) {
      fetchLinks();
    }
  }, [user]);

  const fetchLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('review_link, website_link, custom_link_1, custom_link_label_1')
        .eq('owner_id', user?.id)
        .maybeSingle();
        
      if (data) {
        if (data.review_link) {
          setReviewLink(data.review_link);
          setIsEditingReview(false);
        }
        if (data.website_link) {
          setWebsiteLink(data.website_link);
          setIsEditingWebsite(false);
        }
        if (data.custom_link_1) {
          setCustomLink1(data.custom_link_1);
          setIsEditingCustom1(false);
        }
        if (data.custom_link_label_1) {
          setCustomLinkLabel1(data.custom_link_label_1);
        }
      }
    } catch (e) {
      console.error("Fetch error:", e);
    }
  };

  const ensureOwnerExists = async () => {
    if (!user) throw new Error("User not authenticated");
    
    const slug = 'business-' + Math.random().toString(36).substring(2, 8);
    const { error } = await supabase.from('owners').upsert({
      id: user.id,
      business_name: 'My Business',
      public_slug: slug
    }, { onConflict: 'id', ignoreDuplicates: true });
    
    if (error) {
        console.error("Error ensuring owner exists:", error);
        throw new Error(`Could not verify business owner profile: ${error.message}`);
    }
    
    return true;
  };

  const handleSaveReview = async () => {
    if (!user) return;
    
    if (reviewLink && !/^https?:\/\//i.test(reviewLink)) {
      setErrorReview('Review link must start with http:// or https://');
      return;
    }

    setLoadingReview(true);
    setErrorReview('');
    setSuccessReview(false);

    try {
      const ownerExists = await ensureOwnerExists();
      if (!ownerExists) throw new Error("Could not verify business owner profile.");

      // Check if record exists first to avoid unique constraint issues
      const { data: existing } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle();

      let saveError;
      if (existing) {
        const { error } = await supabase
          .from('businesses')
          .update({ review_link: reviewLink })
          .eq('owner_id', user.id);
        saveError = error;
      } else {
        const { error } = await supabase
          .from('businesses')
          .insert({ owner_id: user.id, review_link: reviewLink, website_link: websiteLink });
        saveError = error;
      }

      if (saveError) throw saveError;

      setSuccessReview(true);
      setIsEditingReview(false);
      setTimeout(() => setSuccessReview(false), 3000);
    } catch (err: any) {
      console.error("Save error:", err);
      setErrorReview(err.message || 'Failed to save review link');
    } finally {
      setLoadingReview(false);
    }
  };

  const handleSaveWebsite = async () => {
    if (!user) return;

    if (websiteLink && !/^https?:\/\//i.test(websiteLink)) {
      setErrorWebsite('Website link must start with http:// or https://');
      return;
    }

    setLoadingWebsite(true);
    setErrorWebsite('');
    setSuccessWebsite(false);

    try {
      const ownerExists = await ensureOwnerExists();
      if (!ownerExists) throw new Error("Could not verify business owner profile.");

      // Check if record exists first to avoid unique constraint issues
      const { data: existing } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle();

      let saveError;
      if (existing) {
        const { error } = await supabase
          .from('businesses')
          .update({ website_link: websiteLink })
          .eq('owner_id', user.id);
        saveError = error;
      } else {
        const { error } = await supabase
          .from('businesses')
          .insert({ 
            owner_id: user.id, 
            review_link: reviewLink, 
            website_link: websiteLink, 
            custom_link_1: customLink1,
            custom_link_label_1: customLinkLabel1
          });
        saveError = error;
      }

      if (saveError) throw saveError;

      setSuccessWebsite(true);
      setIsEditingWebsite(false);
      setTimeout(() => setSuccessWebsite(false), 3000);
    } catch (err: any) {
      console.error("Save error:", err);
      setErrorWebsite(err.message || 'Failed to save website link');
    } finally {
      setLoadingWebsite(false);
    }
  };

  const handleSaveCustom1 = async () => {
    if (!user) return;

    if (customLink1 && !/^https?:\/\//i.test(customLink1)) {
      setErrorCustom1('Link must start with http:// or https://');
      return;
    }

    setLoadingCustom1(true);
    setErrorCustom1('');
    setSuccessCustom1(false);

    try {
      const ownerExists = await ensureOwnerExists();
      if (!ownerExists) throw new Error("Could not verify business owner profile.");

      const { data: existing } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle();

      let saveError;
      if (existing) {
        const { error } = await supabase
          .from('businesses')
          .update({ 
            custom_link_1: customLink1,
            custom_link_label_1: customLinkLabel1
          })
          .eq('owner_id', user.id);
        saveError = error;
      } else {
        const { error } = await supabase
          .from('businesses')
          .insert({ 
            owner_id: user.id, 
            review_link: reviewLink, 
            website_link: websiteLink, 
            custom_link_1: customLink1,
            custom_link_label_1: customLinkLabel1
          });
        saveError = error;
      }

      if (saveError) throw saveError;

      setSuccessCustom1(true);
      setIsEditingCustom1(false);
      setTimeout(() => setSuccessCustom1(false), 3000);
    } catch (err: any) {
      console.error("Save error:", err);
      setErrorCustom1(err.message || 'Failed to save link');
    } finally {
      setLoadingCustom1(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8 pb-24">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Review & Website Links</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage the links your customers will see when they scan your QR code.</p>
      </div>
      
      {/* Review Link Card */}
      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6 relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Review Platform Link</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Where customers will leave their 5-star reviews.</p>
          </div>
          {!isEditingReview && (
            <button 
              onClick={() => setIsEditingReview(true)}
              className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-xl transition-colors flex items-center gap-2 text-sm font-bold"
            >
              <Edit2 size={16} />
              <span className="hidden sm:inline">Edit</span>
            </button>
          )}
        </div>

        <div className="space-y-2">
          <input 
            type="text" 
            value={reviewLink} 
            onChange={e => setReviewLink(e.target.value)} 
            disabled={!isEditingReview}
            placeholder="https://g.page/r/... or any review link"
            className={`w-full p-4 border rounded-2xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none transition-all ${
              !isEditingReview 
                ? 'border-transparent opacity-70 cursor-default' 
                : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500'
            }`}
          />
          {isEditingReview && <p className="text-xs text-gray-500 pl-2">Enter your Google, Yelp, or any other review page URL.</p>}
        </div>

        <AnimatePresence mode="wait">
          {errorReview && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-red-500 text-sm flex items-center gap-2">
              <AlertCircle size={16} /> {errorReview}
            </motion.div>
          )}
          {successReview && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-green-600 text-sm flex items-center gap-2 font-medium">
              <CheckCircle2 size={16} /> Link saved successfully!
            </motion.div>
          )}
        </AnimatePresence>

        {isEditingReview && (
          <button 
            onClick={handleSaveReview}
            disabled={loadingReview}
            className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loadingReview ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Save Review Link</>}
          </button>
        )}
      </div>

      {/* Website Link Card */}
      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6 relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Business Website</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your main website or social media profile.</p>
          </div>
          {!isEditingWebsite && (
            <button 
              onClick={() => setIsEditingWebsite(true)}
              className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-xl transition-colors flex items-center gap-2 text-sm font-bold"
            >
              <Edit2 size={16} />
              <span className="hidden sm:inline">Edit</span>
            </button>
          )}
        </div>

        <div className="space-y-2">
          <input 
            type="text" 
            value={websiteLink} 
            onChange={e => setWebsiteLink(e.target.value)} 
            disabled={!isEditingWebsite}
            placeholder="https://yourwebsite.com"
            className={`w-full p-4 border rounded-2xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none transition-all ${
              !isEditingWebsite 
                ? 'border-transparent opacity-70 cursor-default' 
                : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500'
            }`}
          />
          {isEditingWebsite && <p className="text-xs text-gray-500 pl-2">Must start with http:// or https://</p>}
        </div>

        <AnimatePresence mode="wait">
          {errorWebsite && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-red-500 text-sm flex items-center gap-2">
              <AlertCircle size={16} /> {errorWebsite}
            </motion.div>
          )}
          {successWebsite && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-green-600 text-sm flex items-center gap-2 font-medium">
              <CheckCircle2 size={16} /> Link saved successfully!
            </motion.div>
          )}
        </AnimatePresence>

        {isEditingWebsite && (
          <button 
            onClick={handleSaveWebsite}
            disabled={loadingWebsite}
            className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loadingWebsite ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Save Website Link</>}
          </button>
        )}
      </div>

      {/* Custom Link Card */}
      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6 relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Custom Link</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add an extra link for your customers.</p>
          </div>
          {!isEditingCustom1 && (
            <button 
              onClick={() => setIsEditingCustom1(true)}
              className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-xl transition-colors flex items-center gap-2 text-sm font-bold"
            >
              <Edit2 size={16} />
              <span className="hidden sm:inline">Edit</span>
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Link Label</label>
            <input 
              type="text" 
              value={customLinkLabel1} 
              onChange={e => setCustomLinkLabel1(e.target.value)} 
              disabled={!isEditingCustom1}
              placeholder="e.g. Follow us on Instagram"
              className={`w-full p-4 border rounded-2xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none transition-all ${
                !isEditingCustom1 
                  ? 'border-transparent opacity-70 cursor-default' 
                  : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500'
              }`}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Destination URL</label>
            <input 
              type="text" 
              value={customLink1} 
              onChange={e => setCustomLink1(e.target.value)} 
              disabled={!isEditingCustom1}
              placeholder="https://example.com"
              className={`w-full p-4 border rounded-2xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none transition-all ${
                !isEditingCustom1 
                  ? 'border-transparent opacity-70 cursor-default' 
                  : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500'
              }`}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {errorCustom1 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-red-500 text-sm flex items-center gap-2">
              <AlertCircle size={16} /> {errorCustom1}
            </motion.div>
          )}
          {successCustom1 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-green-600 text-sm flex items-center gap-2 font-medium">
              <CheckCircle2 size={16} /> Link saved successfully!
            </motion.div>
          )}
        </AnimatePresence>

        {isEditingCustom1 && (
          <button 
            onClick={handleSaveCustom1}
            disabled={loadingCustom1}
            className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loadingCustom1 ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Save Custom Link</>}
          </button>
        )}
      </div>

      {/* Educational Section */}
      <div className="bg-blue-50 dark:bg-blue-900/10 p-8 rounded-3xl border border-blue-100 dark:border-blue-900/30 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <AlertCircle size={20} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Why Google Reviews Matter?</h2>
        </div>

        <div className="grid gap-6">
          <div className="space-y-2">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Boost Local SEO
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Google reviews are a major factor in local search rankings. The more positive reviews you have, the higher your business appears on Google Maps and Search.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Build Instant Trust
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              93% of customers read online reviews before making a purchase. Google is the most trusted platform for reviews, making it your best tool for social proof.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Higher Conversion Rates
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Businesses with a 4.0 to 4.5-star rating on Google see significantly higher customer engagement and sales compared to those with no reviews.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-blue-100 dark:border-blue-900/30">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Pro Tip: While you can use any link, we highly recommend using your direct Google Review "Write a Review" link for maximum impact.
          </p>
        </div>
      </div>

      {/* Website Link Educational Section */}
      <div className="bg-indigo-50 dark:bg-indigo-900/10 p-8 rounded-3xl border border-indigo-100 dark:border-indigo-900/30 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Globe size={20} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">The Power of Your Website Link</h2>
        </div>

        <div className="grid gap-6">
          <div className="space-y-2">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              Digital Menu for Cafes & Restaurants
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              If you run a cafe or restaurant, link your online menu here. Customers can instantly browse your offerings as soon as they scan, making their experience seamless.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              Showcase Your Services
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Use this link to direct customers to your portfolio, booking page, or a specific service list. It's the first thing they see, so make it count!
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              Drive Direct Traffic
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              By placing this link on top, you encourage customers to explore your brand further, increasing the chances of repeat visits and direct bookings.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
    </div>
  );
};

export default GoogleLinkPage;

