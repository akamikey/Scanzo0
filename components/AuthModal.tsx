import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Building, Link as LinkIcon, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ScanzoLogo } from './ScanzoLogo';
import { toast } from 'sonner';
import clsx from 'clsx';

import { COUNTRIES } from '../lib/countries';

interface AuthModalProps {
  isOpen: boolean;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen }) => {
  // Default to LOGIN mode. This fixes the issue where returning users see the "Business Name" field (Sign Up form) by default.
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [reviewLink, setReviewLink] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success('Welcome back!');
        navigate('/dashboard');
      } else {
        const { error, needsEmailVerification } = await signUp(email, password, businessName, reviewLink);
        if (error) throw error;
        
        if (needsEmailVerification) {
          setVerificationSent(true);
        } else {
          toast.success('Welcome to Scanzo! Your account has been created.');
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden my-8"
        >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600" />
        
        <button 
          onClick={() => navigate('/')}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-white/10 z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="flex flex-col items-center mb-6 text-center">
            <Link to="/" className="mb-4 hover:opacity-80 transition-opacity">
              <ScanzoLogo iconOnly />
            </Link>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isLogin ? 'Welcome Back' : 'Get Started'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isLogin ? 'Enter your credentials to access your dashboard.' : 'Start collecting reviews in minutes.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {verificationSent ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Check your email</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                We've sent a verification link to <strong>{email}</strong>. Please click the link to verify your account before logging in.
              </p>
              <button
                onClick={() => {
                  setVerificationSent(false);
                  setIsLogin(true);
                }}
                className="w-full py-3 px-4 mt-4 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-900 dark:text-white font-semibold rounded-xl transition-colors"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
              <>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Business Name"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
                  />
                </div>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="url"
                    placeholder="Google Review Link (Optional)"
                    value={reviewLink}
                    onChange={(e) => setReviewLink(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
                  />
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                placeholder="Email Address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] leading-tight">
              <p className="font-bold uppercase mb-1">⚠️ Important Security Note:</p>
              <p>Your password can only be created once. If you lose it, your account access will be gone forever. Please use a password you know and store it securely.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all transform active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 dark:text-blue-400 font-medium hover:underline focus:outline-none"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
          </>
          )}
        </div>
      </motion.div>
      </div>
    </div>
  );
};

export default AuthModal;