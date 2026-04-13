import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Loader2, CheckCircle2, AlertCircle, Edit2, Save, Globe, Sparkles, Image as ImageIcon, Plus, Trash2, Upload, Link as LinkIcon } from 'lucide-react';
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

  // Custom Link 1 State
  const [customLink1, setCustomLink1] = useState('');
  const [customLinkLabel1, setCustomLinkLabel1] = useState('');
  const [customLinkType, setCustomLinkType] = useState<'link' | 'gallery'>('link');
  const [customLinkImages, setCustomLinkImages] = useState<string[]>([]);
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
        .select('review_link, custom_link_1, custom_link_label_1')
        .eq('owner_id', user?.id)
        .maybeSingle();
        
      if (data) {
        if (data.review_link) {
          setReviewLink(data.review_link);
          setIsEditingReview(false);
        }
        if (data.custom_link_1) {
          if (data.custom_link_1.startsWith('gallery:')) {
            setCustomLinkType('gallery');
            const images = data.custom_link_1.replace('gallery:', '').split(',').filter(Boolean);
            setCustomLinkImages(images);
            setCustomLink1('');
          } else {
            setCustomLinkType('link');
            setCustomLink1(data.custom_link_1);
            setCustomLinkImages([]);
          }
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
          .insert({ owner_id: user.id, review_link: reviewLink });
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


  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;
    
    if (customLinkImages.length >= 10) {
      setErrorCustom1('Maximum 10 images allowed');
      return;
    }

    setLoadingCustom1(true);
    setErrorCustom1('');

    try {
      const file = files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/custom-gallery/${fileName}`;

      console.log(`Attempting upload to business-gallery: ${filePath}`);

      const { error: uploadError } = await supabase.storage
        .from('business-gallery')
        .upload(filePath, file);

      if (uploadError) {
        console.error("Supabase Storage Error:", uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('business-gallery')
        .getPublicUrl(filePath);

      setCustomLinkImages(prev => [...prev, publicUrl]);
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorCustom1(err.message || 'Failed to upload image');
    } finally {
      setLoadingCustom1(false);
    }
  };

  const removeImage = (index: number) => {
    setCustomLinkImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveCustom1 = async () => {
    if (!user) return;

    // Enforce "one or the other" rule
    if (customLinkType === 'gallery' && customLink1.trim() !== '') {
      setErrorCustom1("Please clear the Website Link URL before saving a Photo Gallery.");
      return;
    }
    if (customLinkType === 'link' && customLinkImages.length > 0) {
      setErrorCustom1("Please remove all Gallery Images before saving a Website Link.");
      return;
    }

    if (customLinkType === 'link' && customLink1 && !/^https?:\/\//i.test(customLink1)) {
      setErrorCustom1('Link must start with http:// or https://');
      return;
    }

    if (customLinkType === 'gallery' && customLinkImages.length === 0) {
      setErrorCustom1('Please upload at least one image');
      return;
    }

    setLoadingCustom1(true);
    setErrorCustom1('');
    setSuccessCustom1(false);

    try {
      const ownerExists = await ensureOwnerExists();
      if (!ownerExists) throw new Error("Could not verify business owner profile.");

      const finalLinkValue = customLinkType === 'gallery' 
        ? `gallery:${customLinkImages.join(',')}` 
        : customLink1;

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
            custom_link_1: finalLinkValue,
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
            custom_link_1: finalLinkValue,
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Review & Custom Links</h1>
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

      {/* Custom Link Card */}
      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6 relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Custom Link</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add an extra link or a photo gallery for your customers.</p>
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

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Link Label</label>
            <input 
              type="text" 
              value={customLinkLabel1} 
              onChange={e => setCustomLinkLabel1(e.target.value)} 
              disabled={!isEditingCustom1}
              placeholder="e.g. Follow us on Instagram or View our Menu"
              className={`w-full p-4 border rounded-2xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none transition-all ${
                !isEditingCustom1 
                  ? 'border-transparent opacity-70 cursor-default' 
                  : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500'
              }`}
            />
          </div>

          {isEditingCustom1 && (
            <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-2xl w-fit">
              <button
                onClick={() => setCustomLinkType('link')}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                  customLinkType === 'link' 
                    ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <LinkIcon size={16} />
                Website Link
              </button>
              <button
                onClick={() => setCustomLinkType('gallery')}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                  customLinkType === 'gallery' 
                    ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <ImageIcon size={16} />
                Photo Gallery
              </button>
            </div>
          )}

          {customLinkType === 'link' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Destination URL</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={customLink1} 
                    onChange={e => setCustomLink1(e.target.value)} 
                    disabled={!isEditingCustom1}
                    placeholder="https://example.com"
                    className={`w-full p-4 pr-12 border rounded-2xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none transition-all ${
                      !isEditingCustom1 
                        ? 'border-transparent opacity-70 cursor-default' 
                        : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500'
                    }`}
                  />
                  {isEditingCustom1 && customLink1 && (
                    <button 
                      onClick={() => setCustomLink1('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>

              {customLinkImages.length > 0 && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-2xl flex items-start gap-3 shadow-sm">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800 dark:text-amber-200">
                    <p className="font-bold">Action Required: Gallery images exist</p>
                    <p className="opacity-90">You cannot save a website link while you have gallery images. Please remove them first.</p>
                    <button 
                      onClick={() => setCustomLinkImages([])}
                      className="mt-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg font-bold text-xs hover:bg-amber-200 transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 size={12} /> Remove All Images
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {customLink1.trim() !== '' && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800 dark:text-amber-200">
                    <p className="font-bold">Warning: Website link exists</p>
                    <p>You must clear the Website Link URL before you can save this gallery.</p>
                    <button 
                      onClick={() => {
                        setCustomLink1('');
                        setCustomLinkType('gallery');
                      }}
                      className="mt-2 text-amber-700 dark:text-amber-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Clear Website Link
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Gallery Photos (Max 10)</label>
                {isEditingCustom1 && customLinkImages.length > 0 && (
                  <button 
                    onClick={() => {
                      if (window.confirm("Are you sure you want to remove all photos?")) {
                        setCustomLinkImages([]);
                      }
                    }}
                    className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 size={12} /> Clear All
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {customLinkImages.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group border border-gray-100 dark:border-gray-700">
                    <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                    {isEditingCustom1 && (
                      <button 
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-black/90 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
                
                {isEditingCustom1 && customLinkImages.length < 10 && (
                  <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all cursor-pointer group">
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Plus size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Add Photo</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      disabled={loadingCustom1}
                    />
                  </label>
                )}
              </div>
              
              {!isEditingCustom1 && customLinkImages.length === 0 && (
                <p className="text-sm text-gray-500 italic">No photos added to gallery.</p>
              )}
            </div>
          )}
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

      {/* Custom Link Educational Section */}
      <div className="bg-purple-50 dark:bg-purple-900/10 p-8 rounded-3xl border border-purple-100 dark:border-purple-900/30 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <Sparkles size={20} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">How to use your Custom Link?</h2>
        </div>

        <div className="grid gap-6">
          <div className="space-y-2">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              Digital Menu (Cafes & Restaurants)
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Link your PDF menu or website menu. Customers can scan at their table and browse your food instantly without waiting for a physical menu.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              Booking Page (Salons & Services)
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Direct customers to your Calendly or booking software. Turn a simple visit into a repeat appointment by making it easy to book their next session.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              Instagram & Social Media
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Link your Instagram profile with a label like "Follow us for Updates." It's the best way to turn one-time visitors into long-term followers.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              WhatsApp Support
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Use a WhatsApp "wa.me" link so customers can chat with you directly for inquiries or complaints, keeping your service personal and fast.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
    </div>
  );
};

export default GoogleLinkPage;

