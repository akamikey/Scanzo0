import React from 'react';
import { motion } from 'framer-motion';
import PublicNavbar from '../components/PublicNavbar';
import { ScanzoLogo } from '../components/ScanzoLogo';

import PublicFooter from '../components/PublicFooter';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-white overflow-x-hidden flex flex-col">
      <PublicNavbar />
      
      <main className="flex-grow pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-black mb-8">Terms of Service</h1>
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-slate-600 dark:text-slate-400">
            
            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
              <p>By accessing and using Scanzo, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. Description of Service</h2>
              <p>Scanzo provides a smart QR-based platform for business connection, review management, and digital presence. We reserve the right to modify or discontinue the service at any time.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3. User Responsibilities</h2>
              <p>You are responsible for maintaining the confidentiality of your account and password. You agree to notify us immediately of any unauthorized use of your account.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">4. Prohibited Activities</h2>
              <p>You may not use Scanzo for any illegal or unauthorized purpose. You agree to comply with all local laws regarding online conduct and acceptable content.</p>
            </section>
          </div>
        </motion.div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default TermsPage;
