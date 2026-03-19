import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hoverEffect?: boolean;
  onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className, delay = 0, hoverEffect = true, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={hoverEffect ? { scale: 1.02, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" } : {}}
      onClick={onClick}
      className={clsx(
        "relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl shadow-xl transition-colors duration-300",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none" />
      <div className="relative z-10 p-6 h-full">
        {children}
      </div>
    </motion.div>
  );
};

export default GlassCard;
