import React from 'react';
import { Link } from 'react-router-dom';
import { ScanzoLogo } from './ScanzoLogo';

const Footer: React.FC = () => {
  return (
    <footer className="mt-20 pb-12 flex flex-col items-center justify-center border-t border-gray-100 dark:border-white/5 pt-12 relative z-10">
      <div className="flex items-center gap-2 mb-2">
        <ScanzoLogo />
      </div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
        Powered by Scanzo
      </p>
      
      <div className="flex gap-4 mt-6">
        <Link to="/privacy" className="text-[10px] font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">Privacy</Link>
        <Link to="/terms" className="text-[10px] font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">Terms</Link>
      </div>

      <p className="text-slate-500 text-[10px] mt-4">
        © {new Date().getFullYear()} Scanzo. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
