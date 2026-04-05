import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import { ScanzoLogo } from '../components/ScanzoLogo';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../lib/currency';
import { Star, ArrowRight, CheckCircle2, QrCode, Globe, Layout, MessageSquare, Printer, Building2, Smile, Frown, ShieldAlert, BarChart2, Play, X } from 'lucide-react';

import PublicFooter from '../components/PublicFooter';
import ShowcaseSection from '../components/ShowcaseSection';

interface LandingPageProps {
  isDark?: boolean;
  toggleTheme?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ isDark, toggleTheme }) => {
  const navigate = useNavigate();
  const { user, ownerData } = useAuth();

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

  const userCountry = ownerData?.country;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-white overflow-x-hidden flex flex-col">
      
      <PublicNavbar />

      {/* Hero Section - Modern Startup Style */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] -z-10" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-500/20 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Scanzo is here</span>
            </div>

            <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-8 leading-[1.1]">
              Scan. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600">Dominate.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
              The ultimate QR operating system for physical businesses. Route reviews, showcase menus, and capture leads—all from a single scan.
            </p>
            
            <div className="flex flex-col items-center gap-6 mb-16">
              <ScanzoLogo iconOnly className="scale-150 mb-4" />
              <motion.button 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGetStarted} 
                className="w-full sm:w-auto px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-lg shadow-2xl shadow-blue-500/10 flex items-center justify-center gap-2 group transition-all"
              >
                start with scanzo
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>

            {/* Showcase Section integrated directly here */}
            <div className="w-full mt-12 mb-20 rounded-[3rem] overflow-hidden shadow-2xl shadow-blue-500/10 border border-slate-200 dark:border-slate-800">
              <ShowcaseSection />
            </div>

            {/* Visual Concept: Modern UI Cards */}
            <div className="relative w-full max-w-5xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Reviews Dashboard */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col items-start text-left"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                  <Star className="text-blue-600 w-6 h-6 fill-current" />
                </div>
                <h3 className="text-lg font-bold mb-2">Smart Review Routing</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Automatically filter 5-star reviews to Google, while keeping negative feedback private.</p>
              </motion.div>

              {/* Card 2: QR Center */}
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] shadow-2xl shadow-blue-500/30 flex flex-col items-center justify-center text-white transform md:-translate-y-12"
              >
                <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6">
                  <BarChart2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold mb-3">5.0 Deep Analytics</h3>
                <p className="text-blue-100 text-center text-sm leading-relaxed">Track scans, clicks, and customer sentiment in real-time.</p>
              </motion.div>

              {/* Card 3: Digital Presence */}
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col items-start text-left"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4">
                  <QrCode className="text-indigo-600 w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">Your Digital Hub</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">One link for your menu, booking system, social media, and contact info.</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Smart Review Routing Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-[1.1] mb-6">
            How the magic happens.
          </h2>
          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Stop losing customers to bad public reviews. Capture them privately, and amplify the happy ones.
          </p>
        </div>

        {/* Visual Flow Diagram */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connecting Lines (Desktop) */}
          <div className="hidden md:block absolute top-[120px] left-1/2 -translate-x-1/2 w-[60%] h-px bg-gradient-to-r from-green-500 via-slate-200 dark:via-slate-700 to-red-500 z-0" />
          <div className="hidden md:block absolute top-[120px] left-[20%] w-px h-[60px] bg-green-500 z-0" />
          <div className="hidden md:block absolute top-[120px] right-[20%] w-px h-[60px] bg-red-500 z-0" />

          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {/* Step 1: Customer Scans */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center space-y-4 md:col-start-2"
            >
              <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-100 dark:border-blue-800 flex items-center justify-center shadow-xl shadow-blue-500/10 relative">
                <span className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">1</span>
                <QrCode className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Customer Scans</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">They scan your custom QR code and rate their experience.</p>
              </div>
            </motion.div>

            {/* Spacer for grid alignment */}
            <div className="hidden md:block col-span-3 h-8" />

            {/* Step 2A: Happy Customer */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center text-center space-y-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-green-100 dark:border-green-900/30 shadow-xl shadow-green-500/5 relative"
            >
              <span className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-green-600 text-white font-bold flex items-center justify-center text-sm">2A</span>
              <div className="flex gap-1 mb-2">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />)}
              </div>
              <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-2">
                <Smile className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">4-5 Stars</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Happy customers are instantly redirected to Google.</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 w-full justify-center">
                  <Globe size={16} className="text-blue-500" /> Google Reviews
                </div>
              </div>
            </motion.div>

            {/* Step 2B: Unhappy Customer */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center text-center space-y-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-red-100 dark:border-red-900/30 shadow-xl shadow-red-500/5 md:col-start-3 relative"
            >
              <span className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-sm">2B</span>
              <div className="flex gap-1 mb-2">
                {[1,2].map(i => <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />)}
                {[3,4,5].map(i => <Star key={i} className="w-6 h-6 text-slate-200 dark:text-slate-700" />)}
              </div>
              <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-2">
                <Frown className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">1-3 Stars</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Unhappy customers are caught in a private feedback loop.</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 w-full justify-center">
                  <ShieldAlert size={16} className="text-red-500" /> Private Form
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Reviews Dashboard Feature Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold text-sm">
              <Star className="w-4 h-4 fill-current" />
              NEW: REVIEWS DASHBOARD
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-[1.1]">
              Master Your <br />
              <span className="text-blue-600">Online Reputation.</span>
            </h2>
            <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed">
              Our new Reviews Dashboard gives you total control over customer feedback. Track your growth, filter by rating, and respond to your customers instantly.
            </p>
            <ul className="space-y-4">
              {[
                'Real-time positive & negative review tracking',
                'One-click star rating filters',
                'Detailed feedback history with timestamps',
                'Mobile-responsive management on the go'
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-bold">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Mock Dashboard UI */}
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/5">
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded-full" />
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-24 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-900/30 p-4">
                    <div className="h-3 w-12 bg-green-200 dark:bg-green-800 rounded-full mb-2" />
                    <div className="h-6 w-8 bg-green-600 rounded-lg" />
                  </div>
                  <div className="h-24 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/30 p-4">
                    <div className="h-3 w-12 bg-red-200 dark:bg-red-800 rounded-full mb-2" />
                    <div className="h-6 w-8 bg-red-600 rounded-lg" />
                  </div>
                </div>
                <div className="space-y-3">
                  {[1, 2].map(i => (
                    <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-white/5">
                      <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded-full mb-2" />
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Decorative blobs */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
          </motion.div>
        </div>
      </section>

      {/* QR Poster Feature Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] my-12">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-2 md:order-1 relative"
          >
            {/* Mock QR Poster UI */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[3rem] shadow-2xl border border-white/10 flex flex-col items-center text-center aspect-[3/4] justify-center max-w-sm mx-auto transform -rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/20 mb-6 flex items-center justify-center">
                <Building2 className="text-white/50" size={24} />
              </div>
              <h3 className="text-3xl font-black text-white mb-2">Your Business</h3>
              <p className="text-slate-400 text-sm mb-8">Scan to explore our services</p>
              <div className="bg-white p-4 rounded-3xl shadow-2xl mb-8 relative group">
                <div className="absolute -inset-4 bg-white/5 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <QrCode className="w-32 h-32 text-slate-900 relative z-10" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-300 text-xs justify-center font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/50" /> View Menu / Website
                </div>
                <div className="flex items-center gap-3 text-slate-300 text-xs justify-center font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/50" /> Leave Feedback
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8 order-1 md:order-2"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold text-sm">
              <Printer className="w-4 h-4" />
              PREMIUM BRANDING
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-[1.1]">
              Beautiful, Custom <br />
              <span className="text-indigo-600">QR Posters.</span>
            </h2>
            <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed">
              Generate stunning, Apple-quality QR posters instantly. Upload your logo, customize your business name, and print high-resolution marketing materials that look professional and premium.
            </p>
            <ul className="space-y-4">
              {[
                'Minimalist, premium design aesthetic',
                'Upload your own business logo',
                'High-resolution print-ready downloads',
                'No app branding or watermarks'
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-bold">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6"
          >
            Built for Modern Businesses
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto"
          >
            Scanzo empowers local businesses to thrive in a digital-first world.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: '☕', label: 'Cafes' },
            { icon: '🍽', label: 'Restaurants' },
            { icon: '💇', label: 'Salons' },
            { icon: '🏋️', label: 'Gyms' },
            { icon: '🛍', label: 'Retail Stores' },
            { icon: '🧁', label: 'Bakeries' },
            { icon: '🧴', label: 'Spas' },
            { icon: '🏨', label: 'Hotels' },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white dark:bg-slate-900 p-10 rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 flex flex-col items-center text-center group transition-all hover:shadow-2xl hover:shadow-blue-500/5"
            >
              <span className="text-5xl mb-6 group-hover:scale-110 transition-transform">{item.icon}</span>
              <span className="text-lg font-bold text-slate-800 dark:text-white">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">Simple, Growth-Focused Pricing</h2>
          <p className="text-xl text-slate-500 dark:text-slate-400">Invest in your business reputation with Scanzo.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {[
            { name: 'Monthly', price: 250, delay: 0.1, savings: '' },
            { name: '6 Months', price: 1250, popular: true, delay: 0.2, savings: `Save ${formatPrice(250, userCountry)}` },
            { name: 'Yearly', price: 2500, delay: 0.3, savings: `Save ${formatPrice(500, userCountry)}` },
          ].map((plan) => (
            <motion.div 
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: plan.delay }}
              className={`p-10 rounded-[2.5rem] border ${plan.popular ? 'border-2 border-blue-500 shadow-2xl shadow-blue-500/10 transform md:-translate-y-6' : 'border-slate-200 dark:border-slate-800'} bg-white dark:bg-slate-900 flex flex-col relative`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                  Most Popular
                </div>
              )}
              <h3 className={`text-xl font-black mb-4 ${plan.popular ? 'text-blue-600' : 'text-slate-500'}`}>{plan.name}</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-black text-slate-900 dark:text-white">{formatPrice(plan.price, userCountry)}</span>
                <span className="text-slate-500 font-medium">/period</span>
              </div>
              
              {plan.savings && (
                <p className="text-emerald-600 dark:text-emerald-400 font-bold mb-6 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  {plan.savings}
                </p>
              )}

              <div className="mb-10">
                <p className="text-slate-600 dark:text-slate-400 font-medium">Full Premium Access</p>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleChoosePlan} 
                className={`mt-auto w-full py-5 rounded-2xl font-black transition-all text-lg ${plan.popular ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'}`}
              >
                Choose {plan.name}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Security Warning Section */}
      <section className="py-16 px-4 bg-amber-50 dark:bg-amber-900/10 border-y border-amber-100 dark:border-amber-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-bold text-sm mb-6">
            ⚠️ CRITICAL SECURITY NOTICE
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6">Your Password is Your Only Key</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            At Scanzo, we prioritize absolute security. Your password can only be created <strong>once</strong>. 
            If you lose or forget it, your account access will be <strong>lost forever</strong>. 
            We do not provide password recovery services to ensure your business data remains exclusively yours. 
            Please use a password you know and store it safely.
          </p>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default LandingPage;
