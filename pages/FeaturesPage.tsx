import React from 'react';
import { motion } from 'framer-motion';
import { Star, QrCode, MessageSquare, LayoutDashboard } from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';

import { ScanzoLogo } from '../components/ScanzoLogo';

import PublicFooter from '../components/PublicFooter';

const FeaturesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 font-sans text-slate-900 dark:text-white overflow-x-hidden">
      <PublicNavbar />
      
      <section className="pt-32 pb-24 bg-slate-50 dark:bg-slate-800/50 min-h-screen flex flex-col justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Features</h1>
            <p className="text-xl text-slate-500">Everything you need to manage your online reputation.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "QR Review System", icon: QrCode },
              { title: "Private Feedback", icon: MessageSquare },
              { title: "Google Review Boost", icon: Star },
              { title: "Easy Dashboard", icon: LayoutDashboard }
            ].map((feature, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 flex flex-col items-center text-center hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon size={32} />
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default FeaturesPage;
