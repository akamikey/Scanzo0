import React, { useRef, useState, useEffect } from 'react';
// Refresh
import { Moon, Sun, Search, LogOut, ArrowLeft, Loader2, Camera, Upload, Trash2, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface HeaderProps {
  toggleSidebar: () => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDark, toggleTheme, toggleSidebar }) => {
  const { user, ownerData, signOut, refreshData, subscription } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const [uploading, setUploading] = useState(false);
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  const isHome = location.pathname === '/';

  useEffect(() => {
    if (user?.id) {
        const stored = localStorage.getItem(`avatar_${user.id}`);
        if (stored) setLocalAvatar(stored);
    }
  }, [user?.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUploadClick = () => {
    setShowMenu(false);
    fileInputRef.current?.click();
  };

  const handleRemoveAvatar = async () => {
    setShowMenu(false);
    if (!user) return;
    
    if (!window.confirm("Are you sure you want to remove your profile picture?")) return;

    setUploading(true);
    try {
        const { error } = await supabase
            .from('owners')
            .update({ avatar_url: null })
            .eq('id', user.id);
        
        if (error) {
            console.warn("DB Remove warning:", error.message);
        }

        localStorage.removeItem(`avatar_${user.id}`);
        setLocalAvatar(null);
        await refreshData();
        
    } catch (error: any) {
        console.error("Error removing avatar:", error);
        alert("Failed to remove profile picture");
    } finally {
        setUploading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    const file = event.target.files[0];

    if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
    }

    setUploading(true);
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        let finalUrl = '';
        let usedLocalStorage = false;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, { upsert: true });

        if (uploadError) {
             console.warn("Storage upload failed. Falling back to Base64/Local.", uploadError.message);
             const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
             });

             if (file.size < 1024 * 1024) {
                 finalUrl = base64;
             } else {
                 localStorage.setItem(`avatar_${user?.id}`, base64);
                 setLocalAvatar(base64);
                 usedLocalStorage = true;
             }
        } else {
             const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
             finalUrl = data.publicUrl;
        }

        if (!usedLocalStorage) {
            const { error: updateError } = await supabase
                .from('owners')
                .update({ avatar_url: finalUrl })
                .eq('id', user?.id);

            if (updateError) {
                console.warn("DB Update failed (Using Local Storage Fallback):", updateError.message);
                const base64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.readAsDataURL(file);
                });
                localStorage.setItem(`avatar_${user?.id}`, base64);
                setLocalAvatar(base64);
            } else {
                localStorage.removeItem(`avatar_${user?.id}`);
                setLocalAvatar(null);
                await refreshData();
            }
        } else {
             alert("Image saved to browser cache (Storage bucket missing).");
        }
        
    } catch (error: any) {
        console.error("Upload process error:", error);
        alert(`Failed to update profile picture: ${error.message || "Unknown error"}`);
    } finally {
        setUploading(false);
    }
  };

  const handleSignOut = async () => {
    // Immediate feedback and navigation
    await signOut();
    navigate('/');
  };

  const displayAvatar = localAvatar || ownerData?.avatar_url || `https://ui-avatars.com/api/?name=${user?.email || 'User'}&background=random`;
  
  // Calculate remaining days
  const getRemainingDays = () => {
    if (!subscription?.isActive || !subscription?.end_date) return null;
    const end = new Date(subscription.end_date);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const remainingDays = getRemainingDays();

  // Determine Plan Name logic
  const planDisplay = subscription?.isActive 
    ? (subscription.plan && subscription.plan.toLowerCase().includes('plan') 
        ? subscription.plan 
        : `${subscription.plan || 'Premium'} Plan`)
    : 'Free Plan';

  return (
    <header className="sticky top-0 z-30 px-4 py-4 md:px-6">
      <div className="relative mx-auto rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-white/20 shadow-lg backdrop-blur-xl flex items-center justify-between p-3">
        
        <div className="flex items-center gap-3">
          <button 
             onClick={toggleSidebar}
             className="lg:hidden p-2 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 transition-colors"
          >
             <Menu size={20} />
          </button>

          {!isHome && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 transition-colors flex items-center gap-2 group"
              title="Go Back"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          )}

          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/30 dark:bg-black/20 border border-white/10 w-64">
             <Search size={16} className="text-gray-400" />
             <input 
                type="text" 
                placeholder="Search reviews..." 
                className="bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 w-full"
             />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                {user?.email || 'My Account'}
            </span>
            <div className="flex items-center gap-2">
                {remainingDays !== null && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                        {remainingDays} days left
                    </span>
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    {planDisplay}
                </span>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-white/50 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors"
          >
            <motion.div
              initial={false}
              animate={{ rotate: isDark ? 180 : 0 }}
            >
              {isDark ? <Moon size={20} /> : <Sun size={20} />}
            </motion.div>
          </button>
            
          {user && (
            <button 
                type="button"
                onClick={handleSignOut}
                title="Sign Out"
                className="p-2 rounded-full hover:bg-red-500/10 text-red-500 transition-colors hidden md:block cursor-pointer"
            >
                <LogOut size={20} />
            </button>
          )}

          {/* Profile Picture (Interactive) */}
          <div className="relative" ref={menuRef}>
            <button 
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400 p-0.5 shadow-md hover:scale-105 transition-transform cursor-pointer"
                title="Profile Settings"
            >
                <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden relative">
                    {uploading ? (
                        <Loader2 className="animate-spin text-indigo-600" size={20} />
                    ) : (
                        <img 
                            src={displayAvatar} 
                            alt="Profile" 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                        />
                    )}
                </div>
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 p-2 z-50 overflow-hidden"
                >
                  <div className="px-3 py-2 border-b border-gray-50 dark:border-white/5 mb-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Business Logo</p>
                  </div>
                  
                  <button
                    onClick={handleUploadClick}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <Upload size={18} className="text-blue-500" />
                    Upload Logo
                  </button>

                  {(localAvatar || ownerData?.avatar_url) && (
                    <button
                      onClick={handleRemoveAvatar}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                      <Trash2 size={18} />
                      Remove Logo
                    </button>
                  )}

                  <div className="h-px bg-gray-50 dark:bg-white/5 my-1" />

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors md:hidden"
                  >
                    <LogOut size={18} className="text-red-500" />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;