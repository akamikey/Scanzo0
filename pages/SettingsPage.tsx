import React, { useState, useEffect } from 'react';
// Refresh
import GlassCard from '../components/GlassCard';
import { Shield, CreditCard, ArrowLeft, Sparkles, LogOut, Lock, X, Check, Loader2, History, KeyRound, Mail, ArrowRight, ChevronRight, ShieldCheck, Building2, Edit2, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

import Footer from '../components/Footer';

const SettingsPage: React.FC = () => {
  const { user, ownerData, subscription, refreshData, signOut } = useAuth();
  
  // Business Details State
  const [businessName, setBusinessName] = useState(ownerData?.business_name || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [hasSavedName, setHasSavedName] = useState(false);

  // Modal States
  const [activeModal, setActiveModal] = useState<'none' | 'billing' | 'security'>('none');
  
  // Security Flow State
  const [secStep, setSecStep] = useState<1 | 2 | 3>(1); // 1: Send OTP, 2: Verify OTP, 3: New Pass
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [secLoading, setSecLoading] = useState(false);
  const [secError, setSecError] = useState<string | null>(null);

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
      console.error("Error saving business name:", err);
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

  // --- Security Logic ---
  const resetSecurityState = () => {
      setActiveModal('none');
      setSecStep(1); setOtp(''); setNewPassword(''); setSecError(null);
  };

  const handleSendOtp = async () => {
      setSecLoading(true); setSecError(null);
      try {
          const { error } = await supabase.auth.signInWithOtp({ email: user.email });
          if (error) throw error;
          setSecStep(2);
      } catch (err: any) { setSecError(err.message); } 
      finally { setSecLoading(false); }
  };

  const handleVerifyOtp = async () => {
      setSecLoading(true); setSecError(null);
      try {
          const { error } = await supabase.auth.verifyOtp({ email: user.email, token: otp, type: 'email' });
          if (error) throw error;
          setSecStep(3);
      } catch (err: any) { setSecError("Invalid OTP code."); } 
      finally { setSecLoading(false); }
  };

  const handleUpdatePassword = async () => {
      setSecLoading(true); setSecError(null);
      try {
          const { error } = await supabase.auth.updateUser({ password: newPassword });
          if (error) throw error;
          alert("Password updated!");
          resetSecurityState();
      } catch (err: any) { setSecError(err.message); } 
      finally { setSecLoading(false); }
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
            <div className="flex items-center gap-2">
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
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
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
                        "px-4 py-3 rounded-xl font-bold flex items-center gap-2 transition-all",
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
            </div>
            <p className="text-[10px] text-gray-400 mt-2">
              This name will be displayed on your QR code and review pages.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Account Actions Grid */}
      <GlassCard className="space-y-0 p-0 overflow-hidden">
         
         {/* Security */}
         <div 
            onClick={() => setActiveModal('security')}
            className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
         >
              <div className="flex items-center gap-4">
                 <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                    <Shield size={18} />
                 </div>
                 <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Security</h4>
                 </div>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
         </div>
         
         {/* Sign Out */}
         <button 
             onClick={handleSignOut} 
             className="w-full flex items-center justify-between p-5 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors cursor-pointer border-t border-gray-100 dark:border-white/5 group text-left"
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
                    onClick={activeModal === 'security' ? undefined : () => setActiveModal('none')}
                  />
                  
                  {/* Security Modal (OTP Flow) */}
                  {activeModal === 'security' && (
                    <motion.div 
                        key="security-modal"
                        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                        className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-white/20 rounded-3xl shadow-2xl p-8"
                    >
                         <button onClick={resetSecurityState} className="absolute right-4 top-4 p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full">
                                <X size={20} className="text-gray-500" />
                         </button>

                         <div className="flex flex-col items-center text-center mb-6">
                             <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 text-orange-600 rounded-full flex items-center justify-center mb-4">
                                 {secStep === 1 && <Mail size={32} />}
                                 {secStep === 2 && <KeyRound size={32} />}
                                 {secStep === 3 && <Lock size={32} />}
                             </div>
                             <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                 {secStep === 1 && "Reset Password"}
                                 {secStep === 2 && "Verify OTP"}
                                 {secStep === 3 && "Set New Password"}
                             </h2>
                             <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                 {secStep === 1 && `Send a verification code to ${user.email}`}
                                 {secStep === 2 && "Enter the 6-digit code sent to your email."}
                                 {secStep === 3 && "Create a secure password for your account."}
                             </p>
                         </div>

                         {secError && (
                             <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-xs text-center border border-red-100">
                                 {secError}
                             </div>
                         )}

                         <div className="space-y-4">
                             {/* STEP 1: Send OTP */}
                             {secStep === 1 && (
                                 <button 
                                     onClick={handleSendOtp}
                                     disabled={secLoading}
                                     className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                 >
                                     {secLoading ? <Loader2 className="animate-spin" /> : <>Send OTP <ArrowRight size={18} /></>}
                                 </button>
                             )}

                             {/* STEP 2: Verify OTP */}
                             {secStep === 2 && (
                                 <>
                                     <input 
                                        type="text" 
                                        placeholder="123456"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0,6))}
                                        className="w-full text-center text-2xl tracking-[0.5em] font-bold p-4 rounded-xl bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/10 outline-none focus:border-blue-500"
                                     />
                                     <button 
                                         onClick={handleVerifyOtp}
                                         disabled={secLoading || otp.length < 6}
                                         className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                     >
                                         {secLoading ? <Loader2 className="animate-spin" /> : <>Verify Code <ArrowRight size={18} /></>}
                                     </button>
                                     <button onClick={() => setSecStep(1)} className="w-full text-xs text-gray-400 hover:text-gray-600">Resend Code</button>
                                 </>
                             )}

                             {/* STEP 3: New Password */}
                             {secStep === 3 && (
                                 <>
                                     <input 
                                        type="password" 
                                        placeholder="New Password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full p-4 rounded-xl bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/10 outline-none focus:border-blue-500"
                                     />
                                     <button 
                                         onClick={handleUpdatePassword}
                                         disabled={secLoading || newPassword.length < 6}
                                         className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                                     >
                                         {secLoading ? <Loader2 className="animate-spin" /> : <>Update Password <Check size={18} /></>}
                                     </button>
                                 </>
                             )}
                         </div>
                    </motion.div>
                  )}
              </motion.div>
          )}
      </AnimatePresence>

      {/* Footer */}
      <Footer />
    </motion.div>
  );
};

export default SettingsPage;