import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import { useAuth } from '../context/AuthContext';
import { ScanzoLogo } from '../components/ScanzoLogo';
import PublicFooter from '../components/PublicFooter';

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/subscribe');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 font-sans text-slate-900 dark:text-white overflow-x-hidden">
      <PublicNavbar />
      
      <section className="pt-32 pb-24 min-h-screen flex flex-col justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Pricing</h1>
            <p className="text-xl text-slate-500">Simple and transparent pricing for your business.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Monthly */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-8 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col"
            >
              <h3 className="text-lg font-bold text-slate-500 mb-2">Monthly</h3>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-bold">₹250</span>
              </div>
              <button onClick={handleGetStarted} className="mt-auto w-full py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Get Started
              </button>
            </motion.div>

            {/* 6 Months */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-8 rounded-3xl border-2 border-blue-500 bg-white dark:bg-slate-900 relative shadow-2xl shadow-blue-500/10 transform md:-translate-y-4 flex flex-col"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                Popular
              </div>
              <h3 className="text-lg font-bold text-blue-600 mb-2">6 Months</h3>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-bold">₹1250</span>
              </div>
              <button onClick={handleGetStarted} className="mt-auto w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-colors">
                Get Started
              </button>
            </motion.div>

            {/* Yearly */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-8 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col"
            >
              <h3 className="text-lg font-bold text-slate-500 mb-2">Yearly</h3>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-bold">₹2250</span>
              </div>
              <button onClick={handleGetStarted} className="mt-auto w-full py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Get Started
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default PricingPage;
