import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, BarChart2, QrCode, Settings, CreditCard, X, LogOut, Bot, Star, ShieldCheck, Sparkles, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';
import { ScanzoLogo } from './ScanzoLogo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/ai-assistant', label: 'AI Coach', icon: Sparkles },
  { path: '/qr-code', label: 'QR Code', icon: QrCode },
  { path: '/google-link', label: 'Google Link', icon: LinkIcon },
  { path: '/insights', label: 'Insights', icon: BarChart2 },
  { path: '/subscribe', label: 'Subscribe', icon: CreditCard },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    onClose();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border-r border-white/20 shadow-2xl">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScanzoLogo />
        </div>
        <button 
          onClick={onClose} 
          className="lg:hidden p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label="Close Sidebar"
        >
          <X size={20} className="text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={clsx(
                "flex items-center px-4 py-3 rounded-xl transition-all duration-200 group font-medium",
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-500/20"
                  : "text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-gray-200"
              )}
            >
              <item.icon
                className={clsx(
                  "w-5 h-5 mr-3 transition-transform duration-200",
                  isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 group-hover:scale-110"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 dark:border-white/10">
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center w-full px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium group"
        >
          <LogOut className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 w-64 z-50">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={onClose}
          />
          
          {/* Drawer */}
          <div className="absolute inset-y-0 left-0 w-72 h-full z-10 transition-transform duration-300">
             <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;