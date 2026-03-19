import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LogoPage: React.FC = () => {
  const navigate = useNavigate();
  const accent = '#0066FF';
  const dark = '#1A1A1A';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-8">
      <button 
        onClick={() => navigate(-1)}
        className="fixed top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors font-bold"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 p-20 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-white/5 flex flex-col items-center gap-12"
      >
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black tracking-tight">Scanzo Logo</h1>
          <p className="text-slate-500 font-medium">High-resolution SVG asset</p>
        </div>

        {/* Large Logo Render */}
        <div className="relative group">
          <svg 
            width="400" 
            height="400" 
            viewBox="0 0 32 32" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-2xl"
          >
            {/* Outer Frame - Top Left */}
            <path 
              d="M4 12V6C4 4.89543 4.89543 4 6 4H12" 
              stroke={dark} 
              strokeWidth="2" 
              strokeLinecap="round" 
              className="dark:stroke-white"
            />
            {/* Outer Frame - Bottom Right */}
            <path 
              d="M20 28H26C27.1046 28 28 27.1046 28 26V20" 
              stroke={dark} 
              strokeWidth="2" 
              strokeLinecap="round" 
              className="dark:stroke-white"
            />
            
            {/* The 'S' / Scan Path */}
            <path 
              d="M10 12C10 10.8954 10.8954 10 12 10H20C21.1046 10 22 10.8954 22 12V14C22 15.1046 21.1046 16 20 16H12C10.8954 16 10 16.8954 10 18V20C10 21.1046 10.8954 22 12 22H20C21.1046 22 22 21.1046 22 20" 
              stroke={accent} 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
            
            {/* Focus Dot */}
            <circle cx="16" cy="16" r="1" fill={accent} />
          </svg>
        </div>

        <div className="flex flex-col items-center gap-4">
          <span className="text-6xl font-black tracking-tighter text-slate-900 dark:text-white">Scanzo</span>
          <div className="flex gap-4 mt-4">
            <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm font-bold">Primary: #0066FF</div>
            <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-sm font-bold">Secondary: #1A1A1A</div>
          </div>
        </div>

        <p className="text-slate-400 text-sm max-w-sm text-center italic">
          Tip: You can take a high-quality screenshot of this page or inspect the element to copy the SVG code for professional use.
        </p>
      </motion.div>
    </div>
  );
};

export default LogoPage;
