import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import { ScanzoLogo } from '../components/ScanzoLogo';
import { useAuth } from '../context/AuthContext';
import { Star, ArrowRight, CheckCircle2, QrCode, Globe, Layout, MessageSquare, Printer, Building2, ShieldAlert, Zap, BarChart3, Smartphone } from 'lucide-react';

import PublicFooter from '../components/PublicFooter';

interface LandingPageProps {
  isDark?: boolean;
  toggleTheme?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ isDark, toggleTheme }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleChoosePlan = () => {
    if (user) {
      navigate('/subscribe');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] font-sans text-slate-900 dark:text-white overflow-x-hidden flex flex-col selection:bg-blue-500/30">
      
      <PublicNavbar />

      {/* Hero Section - Ultra Modern */}
      <section className="relative pt-32 pb-32 overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2], rotate: [0, 45, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-600/30 blur-[120px] mix-blend-screen" 
          />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2], rotate: [0, -45, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-600/30 blur-[120px] mix-blend-screen" 
          />
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-purple-600/30 blur-[120px] mix-blend-screen" 
          />
          {/* Grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            {/* Pill Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md mb-8 hover:bg-white/80 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-sm font-medium text-slate-700 dark:text-blue-200">Scanzo 2.0 is here</span>
              <ArrowRight className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            </motion.div>

            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-8 leading-[0.9] text-slate-900 dark:text-white">
              Scan. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 dark:from-white dark:via-blue-100 dark:to-blue-600">
                Dominate.
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light tracking-wide">
              The ultimate QR operating system for physical businesses. Route reviews, showcase menus, and capture leads—all from a single scan.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-20 w-full justify-center">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetStarted} 
                className="w-full sm:w-auto px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-full font-bold text-lg flex items-center justify-center gap-2 group transition-all hover:shadow-[0_0_40px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-8 py-4 bg-white/50 dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-white/80 dark:hover:bg-white/10 transition-all backdrop-blur-md"
              >
                View Demo
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-20 -mt-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          {/* Bento Box 1: Smart Routing */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-black rounded-[2rem] border border-slate-200 dark:border-white/10 p-8 relative overflow-hidden group shadow-xl shadow-slate-200/50 dark:shadow-none"
          >
            <div className="absolute inset-0 bg-blue-50 dark:bg-blue-500/5 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/10 transition-colors" />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center mb-6 border border-blue-200 dark:border-blue-500/30">
                  <Zap className="text-blue-600 dark:text-blue-400 w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Smart Review Routing</h3>
                <p className="text-slate-600 dark:text-slate-400 max-w-md text-lg">Automatically filter 5-star reviews to Google, while keeping negative feedback private.</p>
              </div>
              <div className="flex gap-4 items-end">
                <div className="bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 backdrop-blur-md flex items-center gap-3 shadow-sm">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-slate-900 dark:text-white">5.0</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <Globe className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                </div>
              </div>
            </div>
            {/* Decorative glow */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-400/20 dark:bg-blue-600/30 blur-[80px] rounded-full" />
          </motion.div>

          {/* Bento Box 2: Analytics */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-black rounded-[2rem] border border-slate-200 dark:border-white/10 p-8 relative overflow-hidden group shadow-xl shadow-slate-200/50 dark:shadow-none"
          >
            <div className="absolute inset-0 bg-purple-50 dark:bg-purple-500/5 group-hover:bg-purple-100 dark:group-hover:bg-purple-500/10 transition-colors" />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center mb-6 border border-purple-200 dark:border-purple-500/30">
                  <BarChart3 className="text-purple-600 dark:text-purple-400 w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Deep Analytics</h3>
                <p className="text-slate-600 dark:text-slate-400">Track scans, clicks, and customer sentiment in real-time.</p>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-400/20 dark:bg-purple-600/30 blur-[60px] rounded-full" />
          </motion.div>

          {/* Bento Box 3: QR Generation */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-black rounded-[2rem] border border-slate-200 dark:border-white/10 p-8 relative overflow-hidden group flex items-center justify-center shadow-xl shadow-slate-200/50 dark:shadow-none"
          >
            <div className="absolute inset-0 bg-emerald-50 dark:bg-emerald-500/5 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/10 transition-colors" />
            <div className="relative z-10 text-center flex flex-col items-center">
              <div className="w-24 h-24 bg-white dark:bg-white rounded-2xl p-2 shadow-[0_0_30px_rgba(16,185,129,0.1)] dark:shadow-[0_0_30px_rgba(16,185,129,0.2)] mb-6 group-hover:scale-110 transition-transform duration-500 border border-slate-100 dark:border-none">
                <QrCode className="w-full h-full text-slate-900 dark:text-black" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Custom QR Codes</h3>
            </div>
          </motion.div>

          {/* Bento Box 4: Digital Hub */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2 bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-black rounded-[2rem] border border-slate-200 dark:border-white/10 p-8 relative overflow-hidden group shadow-xl shadow-slate-200/50 dark:shadow-none"
          >
            <div className="absolute inset-0 bg-orange-50 dark:bg-orange-500/5 group-hover:bg-orange-100 dark:group-hover:bg-orange-500/10 transition-colors" />
            <div className="relative z-10 h-full flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center mb-6 border border-orange-200 dark:border-orange-500/30">
                  <Smartphone className="text-orange-600 dark:text-orange-400 w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Your Digital Hub</h3>
                <p className="text-slate-600 dark:text-slate-400 text-lg">One link for your menu, booking system, social media, and contact info.</p>
              </div>
              <div className="w-48 h-64 bg-slate-50 dark:bg-black rounded-[2rem] border-4 border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-2xl transform rotate-6 group-hover:rotate-0 transition-transform duration-500">
                {/* Mock Phone UI */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-slate-200 dark:bg-slate-900 rounded-full" />
                <div className="mt-10 px-4 flex flex-col gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 mx-auto" />
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto" />
                  <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-xl mt-4" />
                  <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
                </div>
              </div>
            </div>
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-orange-400/20 dark:bg-orange-600/20 blur-[80px] rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* 3D Flow Section - The "Aha!" Moment */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
        <div className="text-center mb-24">
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter mb-6">
            How the magic <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500">happens.</span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-light">
            Stop losing customers to bad public reviews. Capture them privately, and amplify the happy ones.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Animated Flow Lines */}
          <div className="hidden md:block absolute top-[100px] left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-white/20 to-transparent">
            <motion.div 
              animate={{ x: ["0%", "100%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-24 h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative z-10">
            {/* Step 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center space-y-6"
            >
              <div className="w-32 h-32 rounded-[2.5rem] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-xl flex items-center justify-center shadow-xl shadow-slate-200/50 dark:shadow-2xl relative group">
                <div className="absolute inset-0 bg-blue-100 dark:bg-blue-500/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Mobile%20Phone.png" alt="Scan" className="w-20 h-20 object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div>
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold mb-3 border border-blue-200 dark:border-blue-500/30">1</div>
                <h3 className="font-bold text-2xl text-slate-900 dark:text-white mb-2">Customer Scans</h3>
                <p className="text-slate-600 dark:text-slate-400">They scan your custom QR code and rate their experience.</p>
              </div>
            </motion.div>

            {/* Step 2A */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center text-center space-y-6"
            >
              <div className="w-32 h-32 rounded-[2.5rem] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-xl flex items-center justify-center shadow-xl shadow-slate-200/50 dark:shadow-2xl relative group">
                <div className="absolute inset-0 bg-green-100 dark:bg-green-500/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Star-Struck.png" alt="Happy" className="w-20 h-20 object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div>
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 font-bold mb-3 border border-green-200 dark:border-green-500/30">2A</div>
                <h3 className="font-bold text-2xl text-slate-900 dark:text-white mb-2">4-5 Stars</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">Happy customers are instantly redirected to Google.</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full text-sm font-bold text-slate-900 dark:text-white shadow-sm">
                  <Globe size={16} className="text-blue-500 dark:text-blue-400" /> Google Reviews
                </div>
              </div>
            </motion.div>

            {/* Step 2B */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-col items-center text-center space-y-6"
            >
              <div className="w-32 h-32 rounded-[2.5rem] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-xl flex items-center justify-center shadow-xl shadow-slate-200/50 dark:shadow-2xl relative group">
                <div className="absolute inset-0 bg-red-100 dark:bg-red-500/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Disappointed%20Face.png" alt="Unhappy" className="w-20 h-20 object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div>
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 font-bold mb-3 border border-red-200 dark:border-red-500/30">2B</div>
                <h3 className="font-bold text-2xl text-slate-900 dark:text-white mb-2">1-3 Stars</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">Unhappy customers are caught in a private feedback loop.</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full text-sm font-bold text-slate-900 dark:text-white shadow-sm">
                  <ShieldAlert size={16} className="text-red-500 dark:text-red-400" /> Private Form
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Dark Mode Premium */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter mb-6">One price. <br/><span className="text-slate-500">Infinite value.</span></h2>
        </div>

        <div className="max-w-md mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative p-[1px] rounded-[3rem] bg-gradient-to-b from-slate-200 dark:from-white/20 to-slate-100 dark:to-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-purple-500/20 blur-2xl -z-10 rounded-[3rem]" />
            <div className="bg-white/90 dark:bg-black/80 backdrop-blur-2xl p-12 rounded-[3rem] flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-bold text-sm mb-8 border border-slate-200 dark:border-white/10">
                PRO PLAN
              </div>
              <div className="flex items-start gap-2 mb-8">
                <span className="text-3xl font-bold text-slate-400 mt-2">₹</span>
                <span className="text-8xl font-black text-slate-900 dark:text-white tracking-tighter">250</span>
                <span className="text-xl text-slate-500 font-medium self-end mb-3">/mo</span>
              </div>
              
              <ul className="space-y-5 mb-12 w-full text-left">
                {[
                  'Unlimited Scans',
                  'Smart Review Routing',
                  'Custom QR Posters',
                  'Deep Analytics Dashboard',
                  'Priority Support'
                ].map((item) => (
                  <li key={item} className="flex items-center gap-4 text-slate-700 dark:text-slate-300 text-lg">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleChoosePlan} 
                className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-full font-bold text-xl hover:shadow-[0_0_40px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all"
              >
                Get Started Now
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default LandingPage;
