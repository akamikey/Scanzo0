import React from 'react';
import { motion } from 'framer-motion';
import ShowcaseSection from '../components/ShowcaseSection';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DemoPage: React.FC = () => {
  const navigate = useNavigate();
  const [isCleanMode, setIsCleanMode] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Recording Header */}
      {!isCleanMode && (
        <motion.div 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="p-6 flex items-center justify-between border-b border-white/5 bg-slate-900/50 backdrop-blur-xl z-[100]"
        >
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all font-bold text-sm"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCleanMode(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/20"
            >
              Enter Clean Mode
            </button>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Recording Mode</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Demo Content */}
      <div className="flex-1 relative">
        {isCleanMode && (
          <button 
            onClick={() => setIsCleanMode(false)}
            className="fixed top-4 right-4 z-[200] p-2 bg-white/10 hover:bg-white/20 rounded-full text-white/50 hover:text-white transition-all backdrop-blur-md opacity-0 hover:opacity-100"
            title="Exit Clean Mode (Esc)"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <ShowcaseSection />
      </div>

      {/* Recording Footer */}
      {!isCleanMode && (
        <div className="p-8 text-center bg-slate-950 border-t border-white/5">
          <p className="text-slate-500 text-xs font-medium tracking-widest uppercase">
            Scanzo Demo Recording • 4K High Definition • 60 FPS
          </p>
        </div>
      )}
    </div>
  );
};

export default DemoPage;
