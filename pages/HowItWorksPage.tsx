import React from 'react';
import { motion } from 'framer-motion';
import { Star, QrCode, TrendingUp } from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';

import { ScanzoLogo } from '../components/ScanzoLogo';

import PublicFooter from '../components/PublicFooter';

const HowItWorksPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 font-sans text-slate-900 dark:text-white overflow-x-hidden">
      <PublicNavbar />
      
      <section className="pt-32 pb-24 bg-slate-50 dark:bg-slate-800/50 min-h-screen flex flex-col justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">How it Works</h1>
            <p className="text-xl text-slate-500">Three simple steps to boost your reputation.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "Step 1",
                title: "Create your review QR code.",
                icon: QrCode
              },
              {
                step: "Step 2",
                title: "Customers scan and leave feedback.",
                icon: Star
              },
              {
                step: "Step 3",
                title: "Happy customers go to Google review page.",
                icon: TrendingUp
              }
            ].map((item, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                key={i} 
                className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 text-center relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-50" />
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <item.icon size={32} />
                </div>
                <div className="text-sm font-bold text-blue-500 uppercase tracking-wider mb-2">{item.step}</div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">{item.title}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default HowItWorksPage;
