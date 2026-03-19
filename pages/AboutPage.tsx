import React from 'react';
import { motion } from 'framer-motion';
import PublicNavbar from '../components/PublicNavbar';

import { ScanzoLogo } from '../components/ScanzoLogo';

import PublicFooter from '../components/PublicFooter';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 font-sans text-slate-900 dark:text-white overflow-x-hidden">
      <PublicNavbar />
      
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative min-h-[80vh] flex flex-col justify-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] -z-10" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">
            About <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Scanzo</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Scanzo is the ultimate reputation management platform designed to help local businesses thrive. 
            We believe that every great business deserves a 5-star rating. Our intelligent QR code system 
            filters out negative feedback privately while directing your happiest customers straight to your 
            Google Review page, ensuring your online presence reflects the true quality of your service.
          </p>
        </motion.div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default AboutPage;
