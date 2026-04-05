import React, { useState, useEffect } from 'react';
// Refresh
import GlassCard from '../components/GlassCard';
import { Shield, CreditCard, ArrowLeft, LogOut, X, Check, Loader2, History, Mail, ArrowRight, ChevronRight, ShieldCheck, Building2, Edit2, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

import Footer from '../components/Footer';

const SettingsPage: React.FC = () => {
  const { user, ownerData, subscription, refreshData, signOut, handleAuthError } = useAuth();
  
  // Business Details State
  const [businessName, setBusinessName] = useState(ownerData?.business_name || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [hasSavedName, setHasSavedName] = useState(false);

  // Modal States
  const [activeModal, setActiveModal] = useState<'none' | 'billing'>('none');
  
  const navigate = useNavigate();

  // Sync state when ownerData loads and refresh on mount
  useEffect(() => {
    const initData = async () => {
        if (user?.id) {
            try {
                await refreshData();
            } catch (err) {
                console.error("Data refresh failed silently:", err);
            }
        }
    };
    initData();
  }, [user?.id]);

  useEffect(() => {
    if (ownerData?.business_name) {
      setBusinessName(ownerData.business_name);
    }
  }, [ownerData?.business_name]);

  // --- Handlers ---
  
  const handleSaveName = async () => {
    if (!user?.id) return;
    setIsSavingName(true);
    try {
      const { error } = await supabase
        .from('owners')
        .update({ business_name: businessName })
        .eq('id', user.id);
      
      if (error) throw error;
      
      await refreshData();
      setHasSavedName(true);
      setIsEditingName(false);
      
      // Reset "Saved" status after 3 seconds
      setTimeout(() => setHasSavedName(false), 3000);
    } catch (err) {
      const handled = await handleAuthError(err);
      if (!handled) {
        console.error("Error saving business name:", err);
      }
    } finally {
      setIsSavingName(false);
    }
  };
  
  const handleSignOut = async () => {
      try {
        await signOut();
        navigate('/');
      } catch (error) {
        console.error("Sign out error:", error);
      }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto space-y-4 relative pb-24"
    >
       
       <div className="flex items-center gap-4 mb-2">
        <button onClick={() => navigate(-1)} className="lg:hidden p-2 -ml-2 text-gray-500 dark:text-gray-400">
           <ArrowLeft size={24} />
        </button>
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage business details and account security.</p>
        </div>
      </div>

      {/* Business Details Section */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
            <Building2 size={18} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Business Details</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
              Business Name
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => {
                    setBusinessName(e.target.value);
                    setHasSavedName(false);
                  }}
                  disabled={!isEditingName || isSavingName}
                  className={clsx(
                    "w-full p-3 rounded-xl bg-gray-50 dark:bg-black/20 border transition-all outline-none",
                    isEditingName 
                      ? "border-blue-500 ring-2 ring-blue-500/10" 
                      : "border-gray-200 dark:border-white/10 text-gray-500"
                  )}
                  placeholder="Enter business name"
                />
              </div>
              
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => {
                    setIsEditingName(true);
                    setHasSavedName(false);
                  }}
                  className={clsx(
                    "p-3 rounded-xl transition-colors",
                    isEditingName 
                      ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600" 
                      : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"
                  )}
                  title="Edit Name"
                >
                  <Edit2 size={18} />
                </button>

                {(isEditingName || hasSavedName) && (
                  <button
                    onClick={handleSaveName}
                    disabled={isSavingName || !businessName.trim() || hasSavedName}
                    className={clsx(
                      "px-4 py-3 rounded-xl font-bold flex items-center gap-2 transition-all flex-1 sm:flex-none justify-center",
                      hasSavedName 
                        ? "bg-green-500 text-white cursor-default" 
                        : "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    )}
                  >
                    {isSavingName ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : hasSavedName ? (
                      <>
                        <Check size={18} />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        <span>Save</span>
                      </>
                    )}
                  </button>
                )}

                {isEditingName && !hasSavedName && (
                  <button
                    onClick={() => {
                      setIsEditingName(false);
                      setBusinessName(ownerData?.business_name || '');
                    }}
                    className="p-3 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">
              This name will be displayed on your QR code and review pages.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Account Details Section */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
            <Shield size={18} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Account Details</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
              Email Address
            </label>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10">
              <Mail size={18} className="text-gray-400" />
              <span className="text-gray-600 dark:text-gray-300 font-medium">
                {user?.email || 'No email available'}
              </span>
            </div>
            <p className="text-[10px] text-red-500/70 dark:text-red-400/50 mt-2 font-medium">
              Security Notice: Password recovery is not supported. Please ensure your credentials are saved securely, as account access cannot be restored if the password is lost.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Account Actions Grid */}
      <GlassCard className="space-y-0 p-0 overflow-hidden">
         
         {/* Sign Out */}
         <button 
             onClick={handleSignOut} 
             className="w-full flex items-center justify-between p-5 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors cursor-pointer group text-left"
         >
              <div className="flex items-center gap-4">
                 <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
                    <LogOut size={18} />
                 </div>
                 <div>
                    <h4 className="font-semibold text-red-600 dark:text-red-400 text-sm">Sign Out</h4>
                 </div>
              </div>
         </button>
      </GlassCard>

      {/* --- MODALS --- */}
      <AnimatePresence>
          {activeModal !== 'none' && (
              <motion.div 
                  key="modal-overlay"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                  <div 
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={() => setActiveModal('none')}
                  />
              </motion.div>
          )}
      </AnimatePresence>

      {/* Footer */}
      <Footer />
    </motion.div>
  );
};

export default SettingsPage;