import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { ScanzoLogo } from './ScanzoLogo';
import { useTheme } from '../context/ThemeContext';

const PublicNavbar: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-50 border-b border-slate-100 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <ScanzoLogo />
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/about" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors">About</Link>
            <Link to="/how-it-works" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors">How it Works</Link>
            <Link to="/pricing" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors">Pricing</Link>
            <Link to="/features" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors">Features</Link>
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button onClick={() => navigate('/dashboard')} className="px-5 py-2 bg-blue-600 text-white rounded-full font-medium text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
              Login / Signup
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600 dark:text-slate-300">
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-white/5 p-4 space-y-4">
           <Link to="/about" className="block text-sm font-medium text-slate-600 dark:text-slate-300" onClick={() => setMobileMenuOpen(false)}>About</Link>
           <Link to="/how-it-works" className="block text-sm font-medium text-slate-600 dark:text-slate-300" onClick={() => setMobileMenuOpen(false)}>How it Works</Link>
           <Link to="/pricing" className="block text-sm font-medium text-slate-600 dark:text-slate-300" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
           <Link to="/features" className="block text-sm font-medium text-slate-600 dark:text-slate-300" onClick={() => setMobileMenuOpen(false)}>Features</Link>
           <button onClick={() => navigate('/dashboard')} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold mt-4">
              Login / Signup
           </button>
        </div>
      )}
    </nav>
  );
};

export default PublicNavbar;
