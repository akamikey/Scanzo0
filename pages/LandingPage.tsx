import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import { ScanzoLogo } from '../components/ScanzoLogo';
import { Star, ArrowRight, CheckCircle2, QrCode, Globe, Layout, MessageSquare } from 'lucide-react';

import PublicFooter from '../components/PublicFooter';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

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
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">The Future of Business Connection</span>
            </div>

            <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-8 leading-[1.1]">
              One Scan. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600">Infinite Connections.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
              Scanzo is the smart QR platform that bridges the gap between your physical business and digital presence. Reviews, menus, services, and more—all in one place.
            </p>
            
            <div className="flex flex-col items-center gap-6 mb-20">
              <ScanzoLogo iconOnly className="scale-150 mb-4" />
              <motion.button 
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/dashboard')} 
                className="w-full sm:w-auto px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-lg shadow-2xl shadow-blue-500/10 flex items-center justify-center gap-2 group transition-all"
              >
                Start Growing Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>

            {/* Visual Concept: Modern UI Cards */}
            <div className="relative w-full max-w-5xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Reviews */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col items-start text-left"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                  <Star className="text-blue-600 w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">Smart Reviews</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Boost your Google ranking with automated review collection.</p>
              </motion.div>

              {/* Card 2: QR Center */}
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] shadow-2xl shadow-blue-500/30 flex flex-col items-center justify-center text-white transform md:-translate-y-12"
              >
                <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6">
                  <QrCode className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold mb-3">One Smart Scan</h3>
                <p className="text-blue-100 text-center text-sm leading-relaxed">The ultimate entry point for your customers to discover everything you offer.</p>
              </motion.div>

              {/* Card 3: Digital Presence */}
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col items-start text-left"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4">
                  <Globe className="text-indigo-600 w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">Digital Hub</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Menus, links, and services all accessible through a single, elegant interface.</p>
              </motion.div>
            </div>
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
            { name: 'Monthly', price: '₹250', delay: 0.1, features: ['Smart QR Code', 'Review Collection', 'Basic Insights'] },
            { name: '6 Months', price: '₹1250', popular: true, delay: 0.2, features: ['Everything in Monthly', 'Priority Support', 'Advanced Analytics', 'Custom Branding'] },
            { name: 'Yearly', price: '₹2250', delay: 0.3, features: ['Everything in 6 Months', '2 Months Free', 'Dedicated Account Manager', 'Early Access Features'] },
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
              <div className="flex items-baseline gap-2 mb-10">
                <span className="text-5xl font-black text-slate-900 dark:text-white">{plan.price}</span>
                <span className="text-slate-500 font-medium">/period</span>
              </div>
              
              <ul className="space-y-4 mb-10">
                {plan.features.map(feature => (
                  <li key={feature} className="flex items-center gap-3 text-slate-600 dark:text-slate-400 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/dashboard')} 
                className={`mt-auto w-full py-5 rounded-2xl font-black transition-all text-lg ${plan.popular ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'}`}
              >
                Choose {plan.name}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default LandingPage;
