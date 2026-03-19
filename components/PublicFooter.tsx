import React from 'react';
import { Link } from 'react-router-dom';
import { ScanzoLogo } from './ScanzoLogo';

const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-white/5 py-20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <ScanzoLogo />
            </div>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed font-medium">
              Connecting physical businesses with the digital world, one smart scan at a time.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 md:gap-24">
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-widest">Product</h4>
              <Link to="/features" className="text-slate-500 hover:text-blue-600 transition-colors font-medium">Features</Link>
              <Link to="/pricing" className="text-slate-500 hover:text-blue-600 transition-colors font-medium">Pricing</Link>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-widest">Company</h4>
              <Link to="/about" className="text-slate-500 hover:text-blue-600 transition-colors font-medium">About</Link>
              <Link to="/how-it-works" className="text-slate-500 hover:text-blue-600 transition-colors font-medium">How it Works</Link>
              <Link to="/logo" className="text-slate-500 hover:text-blue-600 transition-colors font-medium">Brand Assets</Link>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-widest">Legal</h4>
              <Link to="/privacy" className="text-slate-500 hover:text-blue-600 transition-colors font-medium">Privacy</Link>
              <Link to="/terms" className="text-slate-500 hover:text-blue-600 transition-colors font-medium">Terms</Link>
            </div>
          </div>
        </div>
        
        <div className="mt-20 pt-8 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm font-medium">© {new Date().getFullYear()} Scanzo. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-slate-400 hover:text-blue-600 transition-colors text-sm font-medium">Privacy</Link>
            <Link to="/terms" className="text-slate-400 hover:text-blue-600 transition-colors text-sm font-medium">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
