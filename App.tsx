import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link, useNavigate, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import QrCodePage from './pages/QrCodePage';
import SettingsPage from './pages/SettingsPage';
import Insights from './pages/Insights';
import GoogleLinkPage from './pages/GoogleLinkPage';
import ReviewsPage from './pages/ReviewsPage';
import PublicReviewPage from './pages/PublicReviewPage';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import HowItWorksPage from './pages/HowItWorksPage';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import SubscribePage from './pages/SubscribePage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import LogoPage from './pages/LogoPage';
import PublicBusinessPage from './pages/PublicBusinessPage';
import ScanLandingPage from './pages/ScanLandingPage';
import AuthModal from './components/AuthModal';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Home, BarChart2, QrCode, CreditCard, Settings, Star, Sparkles, Link as LinkIcon } from 'lucide-react';
import clsx from 'clsx';

// Automatically scroll main content to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    const main = document.querySelector('main');
    if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
};

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

// Bottom Navigation Component for Mobile (Block Layout)
const BottomNav = () => {
  const location = useLocation();
  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/reviews', icon: Star, label: 'Reviews' },
    { path: '/insights', icon: BarChart2, label: 'Insights' },
    { path: '/qr-code', icon: QrCode, label: 'QR' },
    { path: '/google-link', icon: LinkIcon, label: 'Link' },
    { path: '/subscribe', icon: CreditCard, label: 'Pricing' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  // Hide on public review pages AND landing page AND public business pages
  if (location.pathname.startsWith('/r/') || location.pathname.startsWith('/b/') || location.pathname === '/' || ['/about', '/how-it-works', '/features', '/pricing', '/privacy', '/terms'].includes(location.pathname)) return null;

  return (
    <div className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-gray-200 dark:border-white/10 pb-safe pt-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center px-2 pb-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className="flex flex-col items-center justify-center flex-1 py-1 active:scale-90 transition-transform min-w-0"
            >
              <div className={clsx(
                "p-1.5 rounded-xl transition-all duration-300 mb-1",
                isActive 
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30" 
                  : "text-gray-500 dark:text-gray-400"
              )}>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={clsx(
                  "text-[10px] font-medium leading-none transition-colors",
                   isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
              )}>
                   {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  );
};

const LoginWrapper = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-white overflow-x-hidden flex flex-col relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] -z-10" />
      <AuthModal isOpen={true} />
    </div>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><AboutPage /></PageWrapper>} />
        <Route path="/how-it-works" element={<PageWrapper><HowItWorksPage /></PageWrapper>} />
        <Route path="/features" element={<PageWrapper><FeaturesPage /></PageWrapper>} />
        <Route path="/pricing" element={<PageWrapper><PricingPage /></PageWrapper>} />
        <Route path="/privacy" element={<PageWrapper><PrivacyPage /></PageWrapper>} />
        <Route path="/terms" element={<PageWrapper><TermsPage /></PageWrapper>} />
        <Route path="/logo" element={<PageWrapper><LogoPage /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><LoginWrapper /></PageWrapper>} />
        <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
        <Route path="/reviews" element={<PageWrapper><ReviewsPage /></PageWrapper>} />
        <Route path="/insights" element={<PageWrapper><Insights /></PageWrapper>} />
        <Route path="/qr-code" element={<PageWrapper><QrCodePage /></PageWrapper>} />
        <Route path="/google-link" element={<PageWrapper><GoogleLinkPage /></PageWrapper>} />
        <Route path="/subscribe" element={<PageWrapper><SubscribePage /></PageWrapper>} />
        <Route path="/settings" element={<PageWrapper><SettingsPage /></PageWrapper>} />
        
        {/* Public Routes */}
        <Route path="/scan/:slug" element={<ScanLandingPage />} />
        <Route path="/r/:slug" element={<PublicReviewPage />} />
        <Route path="/b/:slug" element={<PublicBusinessPage />} />
        
        <Route path="/qr/:id" element={<ScanLandingPage />} />
        <Route path="/q/:id" element={<ScanLandingPage />} />
        <Route path="/review/:id" element={<PublicReviewPage />} />
        
        {/* Catch-all redirect to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

const Layout = () => {
  const { user, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  // Define protected routes that REQUIRE authentication
  const protectedRoutes = ['/dashboard', '/reviews', '/insights', '/qr-code', '/google-link', '/subscribe', '/settings'];
  const isProtectedRoute = protectedRoutes.some(path => location.pathname.startsWith(path));
  
  // Define landing/info pages that are public
  const isLandingPage = location.pathname === '/' || ['/about', '/how-it-works', '/features', '/pricing', '/privacy', '/terms', '/logo', '/login'].includes(location.pathname);
  
  // Define direct public access routes (QR scans, reviews, etc)
  const isPublicDirectRoute = location.pathname.startsWith('/scan/') || 
                               location.pathname.startsWith('/r/') || 
                               location.pathname.startsWith('/b/') ||
                               location.pathname.startsWith('/qr/') ||
                               location.pathname.startsWith('/q/') ||
                               location.pathname.startsWith('/review/');
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-900">
         <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If it's a public route or landing page, render it directly without dashboard layout or auth checks
  if (isPublicDirectRoute || isLandingPage) {
     // Redirect logged-in users from landing page or login page to dashboard
     if (user && (location.pathname === '/' || location.pathname === '/login')) {
        return <Navigate to="/dashboard" replace />;
     }

     return (
        <>
           <ScrollToTop />
           <AnimatedRoutes />
        </>
     );
  }

  // Redirect to login if trying to access a protected route without being logged in
  if (isProtectedRoute && !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen w-full bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 relative overflow-hidden flex">
      <ScrollToTop />

      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/20 blur-[100px] dark:bg-purple-900/20 mix-blend-multiply dark:mix-blend-normal"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/20 blur-[100px] dark:bg-blue-900/20 mix-blend-multiply dark:mix-blend-normal"></div>
        <div className="absolute top-[20%] right-[20%] w-[300px] h-[300px] rounded-full bg-pink-500/20 blur-[100px] dark:bg-pink-900/20 mix-blend-multiply dark:mix-blend-normal"></div>
      </div>

      {/* Desktop Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Column */}
      <div className={`flex-1 flex flex-col h-full relative z-10 transition-all duration-300 ${user ? 'lg:pl-64' : ''}`}>
        <Header 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        />

        {/* Scrollable Main Content Area - Content happens ABOVE the nav bar */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth custom-scrollbar relative pb-20 lg:pb-0">
           <div className="p-4 md:p-6 w-full max-w-7xl mx-auto min-h-full">
              <AnimatedRoutes />
           </div>
        </main>
        
        {/* Mobile Nav - Fixed at Bottom */}
        {user && (
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
                <BottomNav />
            </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="*" element={<Layout />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;