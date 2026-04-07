import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  QrCode, 
  Star, 
  Menu as MenuIcon, 
  MessageSquare, 
  Share2, 
  CreditCard, 
  ArrowRight, 
  Play, 
  Pause, 
  Coffee, 
  CheckCircle2, 
  Globe, 
  Smartphone,
  ChevronRight,
  ShieldCheck,
  Zap,
  Instagram,
  Phone,
  ExternalLink
} from 'lucide-react';

const SCENE_DURATION = 5000;

const PhoneMockup = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`relative w-[200px] h-[420px] sm:w-[220px] sm:h-[450px] bg-slate-900 rounded-[2.2rem] sm:rounded-[2.5rem] border-[5px] sm:border-[6px] border-slate-800 shadow-2xl overflow-hidden ${className}`}>
    {/* Notch */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 sm:w-24 sm:h-5 bg-slate-800 rounded-b-xl z-20" />
    {/* Screen Content */}
    <div className="h-full w-full bg-white dark:bg-slate-950 overflow-y-auto custom-scrollbar">
      {children}
    </div>
  </div>
);

const ParticlesBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-blue-400/40 rounded-full"
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: Math.random() * 100 + "%",
            opacity: Math.random() * 0.5 + 0.2,
            scale: Math.random() * 0.5 + 0.5
          }}
          animate={{ 
            y: [null, "-120%"],
            opacity: [null, 0],
            x: [null, (Math.random() - 0.5) * 50 + "%"]
          }}
          transition={{ 
            duration: Math.random() * 15 + 10, 
            repeat: Infinity, 
            ease: "linear",
            delay: Math.random() * 10
          }}
        />
      ))}
      {/* Dynamic Lighting Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,41,59,0)_0%,rgba(2,6,23,1)_100%)]" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05)_0%,transparent_70%)]" />
    </div>
  );
};

export const ShowcaseSection = () => {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const scenes = [
    { id: 'hero-os', title: 'Hero OS' },
    { id: 'one-qr', title: 'One QR' },
    { id: 'routing', title: 'Intelligent Routing' },
    { id: 'links', title: 'Custom Links' },
    { id: 'testimonials', title: 'Testimonials' },
    { id: 'branding', title: 'Branding' },
    { id: 'cta', title: 'CTA' },
  ];

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentScene((prev) => (prev + 1) % scenes.length);
      }, SCENE_DURATION);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, scenes.length]);

  const nextScene = () => setCurrentScene((prev) => (prev + 1) % scenes.length);
  const prevScene = () => setCurrentScene((prev) => (prev - 1 + scenes.length) % scenes.length);

  const renderScene = () => {
    switch (scenes[currentScene].id) {
      case 'hero-os':
        return (
          <div className="flex flex-col items-center justify-center h-full px-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-lg bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600" />
              <div className="flex flex-col items-center text-center">
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="bg-white p-5 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.3)] mb-8"
                >
                  <QrCode className="w-16 h-16 text-slate-900" />
                </motion.div>
                <div className="w-16 h-16 rounded-2xl bg-blue-600/20 flex items-center justify-center mb-6">
                  <Zap className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-3xl sm:text-4xl font-black tracking-tighter mb-4 text-white">Scanzo OS</h3>
                <p className="text-slate-400 text-sm sm:text-lg mb-8 max-w-md leading-relaxed">
                  The all-in-one operating system for your physical business presence. 
                  One scan, infinite possibilities.
                </p>
                <button 
                  onClick={handleGetStarted}
                  className="px-10 py-4 bg-white text-slate-900 rounded-xl font-black text-lg shadow-xl hover:scale-105 transition-transform"
                >
                  Get Started
                </button>
              </div>
            </motion.div>
          </div>
        );

      case 'one-qr':
        return (
          <div className="relative flex items-center justify-center h-full w-full">
            <div className="relative scale-[0.85] sm:scale-100">
              {/* Central QR */}
              <motion.div 
                animate={{ 
                  scale: [1, 1.05, 1],
                  boxShadow: ["0 0 20px rgba(59,130,246,0.2)", "0 0 40px rgba(59,130,246,0.4)", "0 0 20px rgba(59,130,246,0.2)"]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="bg-white p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] z-10 relative"
              >
                <QrCode className="w-16 h-16 sm:w-20 sm:h-20 text-slate-900" />
              </motion.div>

              {/* Orbiting Icons */}
              {[
                { icon: Star, label: 'Reviews', color: 'text-yellow-400' },
                { icon: MenuIcon, label: 'Menu', color: 'text-emerald-400' },
                { icon: MessageSquare, label: 'Feedback', color: 'text-blue-400' },
                { icon: Share2, label: 'Socials', color: 'text-purple-400' },
                { icon: CreditCard, label: 'Payments', color: 'text-pink-400' },
              ].map((item, i) => {
                const angle = (i * 360) / 5;
                const radius = 120;
                return (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2"
                    initial={{ x: 0, y: 0, opacity: 0 }}
                    animate={{ 
                      x: Math.cos((angle * Math.PI) / 180) * radius,
                      y: Math.sin((angle * Math.PI) / 180) * radius,
                      opacity: 1
                    }}
                    transition={{ delay: i * 0.1, duration: 0.8, type: "spring" }}
                  >
                    <div className="relative -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                      <motion.div 
                        whileHover={{ scale: 1.2 }}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-900/80 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl mb-1"
                      >
                        <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${item.color}`} />
                      </motion.div>
                      <span className="text-white text-[7px] sm:text-[8px] font-bold tracking-widest uppercase opacity-50">{item.label}</span>
                      
                      {/* Animated Line to Center */}
                      <svg className="absolute top-1/2 left-1/2 -z-10 w-[120px] h-[120px] pointer-events-none" style={{ transform: 'translate(-50%, -50%)' }}>
                        <motion.line
                          x1="60" y1="60"
                          x2={60 - Math.cos((angle * Math.PI) / 180) * radius}
                          y2={60 - Math.sin((angle * Math.PI) / 180) * radius}
                          stroke="rgba(255,255,255,0.15)"
                          strokeWidth="1"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1.5, delay: 0.5 }}
                        />
                      </svg>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className="absolute bottom-4 sm:bottom-6 text-center px-4">
              <h2 className="text-xl sm:text-2xl md:text-4xl font-black tracking-tighter text-white mb-1">One QR. Infinite possibilities.</h2>
              <p className="text-slate-400 text-[10px] sm:text-sm">Consolidate your entire digital presence into a single touchpoint. Menus, social links, and payments.</p>
            </div>
          </div>
        );

      case 'routing':
        return (
          <div className="flex flex-col items-center justify-center h-full w-full max-w-6xl px-4">
            <div className="relative w-full aspect-[21/9] sm:aspect-[21/8] bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-6 sm:p-16 overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/15 to-transparent pointer-events-none" />
              <svg className="w-full h-full" viewBox="0 0 800 300">
                <defs>
                  <filter id="glow-large">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>

                {/* Paths */}
                <path id="emeraldPathLarge" d="M 400 30 Q 400 150 100 200" fill="none" stroke="transparent" />
                <path id="redPathLarge" d="M 400 30 Q 400 150 700 200" fill="none" stroke="transparent" />

                {/* Animated Particles */}
                {[...Array(6)].map((_, i) => (
                  <circle key={`e-${i}`} r="5" fill="#10b981" filter="url(#glow-large)">
                    <animateMotion dur="2s" repeatCount="indefinite" begin={`${i * 0.4}s`}>
                      <mpath href="#emeraldPathLarge" />
                    </animateMotion>
                  </circle>
                ))}
                {[...Array(6)].map((_, i) => (
                  <circle key={`r-${i}`} r="5" fill="#ef4444" filter="url(#glow-large)">
                    <animateMotion dur="2s" repeatCount="indefinite" begin={`${i * 0.4}s`}>
                      <mpath href="#redPathLarge" />
                    </animateMotion>
                  </circle>
                ))}

                {/* Drawn Lines */}
                <motion.path 
                  d="M 400 60 L 400 120 L 100 180" 
                  fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="8,8" opacity="0.5"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }}
                />
                <motion.path 
                  d="M 400 60 L 400 120 L 700 180" 
                  fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray="8,8" opacity="0.5"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }}
                />

                {/* Nodes */}
                <foreignObject x="340" y="0" width="120" height="120">
                  <div className="flex flex-col items-center">
                    <motion.div 
                      animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="bg-white p-4 rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                    >
                      <QrCode className="w-12 h-12 text-slate-900" />
                    </motion.div>
                  </div>
                </foreignObject>

                <foreignObject x="20" y="190" width="160" height="140">
                  <div className="flex flex-col items-center">
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className="bg-emerald-500/20 border border-emerald-500/50 p-5 rounded-3xl backdrop-blur-md shadow-[0_0_40px_rgba(16,185,129,0.4)]"
                    >
                      <Globe className="w-10 h-10 text-emerald-400" />
                    </motion.div>
                    <span className="text-emerald-400 text-sm font-black mt-3 uppercase tracking-widest">Google Review</span>
                  </div>
                </foreignObject>

                <foreignObject x="620" y="190" width="160" height="140">
                  <div className="flex flex-col items-center">
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className="bg-red-500/20 border border-red-500/50 p-5 rounded-3xl backdrop-blur-md shadow-[0_0_40px_rgba(239,68,68,0.4)]"
                    >
                      <MessageSquare className="w-10 h-10 text-red-400" />
                    </motion.div>
                    <span className="text-red-400 text-sm font-black mt-3 uppercase tracking-widest">Private Inbox</span>
                  </div>
                </foreignObject>
              </svg>
            </div>
            <div className="mt-10 text-center">
              <h2 className="text-3xl sm:text-5xl font-black tracking-tighter text-white mb-3">Intelligent Routing.</h2>
              <p className="text-slate-400 text-base sm:text-xl max-w-3xl mx-auto leading-relaxed">
                The most powerful feature. Automatically send 5-star reviews to Google, 
                while capturing negative feedback privately to protect your reputation.
              </p>
            </div>
          </div>
        );

      case 'links':
        return (
          <div className="flex flex-col items-center justify-center h-full px-4">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-xl bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl"
            >
              <div className="flex flex-col items-center mb-10">
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(37,99,235,0.4)]"
                >
                  <Coffee className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-2xl font-black text-white">The Daily Grind</h3>
                <p className="text-slate-400 text-sm">Artisan Coffee & Pastries</p>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Official Website', icon: Globe, desc: 'Your main digital home' },
                  { label: 'Digital Menu', icon: MenuIcon, desc: 'Contactless ordering' },
                  { label: 'Order Online', icon: Smartphone, desc: 'Quick pickup & delivery' },
                  { label: 'Custom Link', icon: ExternalLink, desc: 'Any destination you want' },
                ].map((link, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between hover:bg-blue-600 hover:border-blue-500 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20">
                        <link.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <span className="block font-bold text-white text-base">{link.label}</span>
                        <span className="block text-slate-500 text-xs group-hover:text-blue-100">{link.desc}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-slate-500 group-hover:text-white" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <div className="mt-8 text-center">
              <h2 className="text-2xl sm:text-4xl font-black tracking-tighter text-white mb-2">Custom Link Hub.</h2>
              <p className="text-slate-400 text-sm sm:text-lg">Your entire digital ecosystem, beautifully organized and accessible from a single scan.</p>
            </div>
          </div>
        );

      case 'testimonials':
        return (
          <div className="relative flex items-center justify-center h-full w-full max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
              {[
                { 
                  name: "Sarah Chen", 
                  role: "Cafe Owner", 
                  quote: "Scanzo transformed how we handle reviews. Our rating went from 4.2 to 4.8.",
                  delay: 0,
                  pos: "md:translate-y-0"
                },
                { 
                  name: "Marcus Thorne", 
                  role: "Gym Manager", 
                  quote: "The custom QR posters look incredible. It's the first thing members notice.",
                  delay: 0.2,
                  pos: "md:translate-y-6"
                }
              ].map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: t.delay, duration: 0.8 }}
                  className={`p-6 bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl ${t.pos} max-w-[240px]`}
                >
                  <div className="flex gap-0.5 mb-3">
                    {[1,2,3,4,5].map(star => <Star key={star} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}
                  </div>
                  <p className="text-white text-sm font-medium leading-relaxed mb-4 italic">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600" />
                    <div>
                      <h4 className="text-white text-xs font-bold">{t.name}</h4>
                      <p className="text-slate-500 text-[10px]">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'branding':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="relative">
              <motion.div 
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="bg-white p-8 rounded-[2.5rem] shadow-[0_0_40px_rgba(255,255,255,0.1)] relative"
              >
                <QrCode className="w-32 h-32 text-slate-900" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-2 rounded-xl shadow-2xl border-2 border-white">
                  <Coffee className="w-8 h-8 text-blue-600" />
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute -right-8 top-0 bg-emerald-500 text-white px-4 py-2 rounded-xl font-black text-[10px] shadow-2xl flex items-center gap-1"
              >
                <CheckCircle2 size={14} /> NO WATERMARKS
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute -left-8 bottom-0 bg-blue-600 text-white px-4 py-2 rounded-xl font-black text-[10px] shadow-2xl flex items-center gap-1"
              >
                <ShieldCheck size={14} /> CUSTOM LOGO
              </motion.div>
            </div>
            <div className="mt-12 text-center">
              <h2 className="text-2xl md:text-4xl font-black tracking-tighter text-white mb-2">Your Brand. Front & Center.</h2>
              <p className="text-slate-400 text-sm">Professional branding that builds trust with every scan.</p>
            </div>
          </div>
        );

      case 'cta':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <motion.div 
              animate={{ rotateY: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="relative group cursor-pointer scale-[0.85] sm:scale-100"
            >
              <div className="absolute inset-0 bg-blue-600 rounded-[2rem] blur-[40px] opacity-50 group-hover:opacity-80 transition-opacity" />
              <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl relative z-10">
                <QrCode className="w-24 h-24 sm:w-40 sm:h-40 text-slate-900" />
              </div>
            </motion.div>
            <div className="mt-8 sm:mt-12 text-center px-4">
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tighter text-white mb-4 sm:mb-6">Ready to dominate?</h2>
              <button 
                onClick={handleGetStarted}
                className="px-8 py-3 sm:px-10 sm:py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-lg sm:text-xl shadow-2xl shadow-blue-500/40 transition-all flex items-center gap-2 group mx-auto"
              >
                Start <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section className="relative min-h-[550px] sm:min-h-[650px] bg-slate-950 py-8 sm:py-16 overflow-hidden flex flex-col items-center justify-center rounded-[1.5rem] sm:rounded-[3rem] my-4 sm:my-12 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-3xl">
      <ParticlesBackground />
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 h-[500px] sm:h-[600px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScene}
            initial={{ opacity: 0, scale: 0.95, rotateY: 20, filter: "blur(5px)" }}
            animate={{ opacity: 1, scale: 1, rotateY: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.05, rotateY: -20, filter: "blur(5px)" }}
            transition={{ 
              duration: 0.6, 
              ease: [0.22, 1, 0.36, 1] 
            }}
            className="w-full h-full"
          >
            {renderScene()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls & Navigation */}
      <div className="relative z-20 mt-6 flex flex-col items-center gap-4">
        {/* Navigation Dots */}
        <div className="flex items-center gap-2">
          {scenes.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentScene(i);
                setIsPlaying(false);
              }}
              className="group relative h-1 w-8 bg-slate-800 rounded-full overflow-hidden"
            >
              <motion.div 
                className="absolute inset-0 bg-blue-500"
                initial={{ x: "-100%" }}
                animate={{ x: currentScene === i ? "0%" : currentScene > i ? "100%" : "-100%" }}
                transition={{ duration: 0.5 }}
              />
              {currentScene === i && isPlaying && (
                <motion.div 
                  className="absolute inset-0 bg-white/30"
                  initial={{ x: "-100%" }}
                  animate={{ x: "0%" }}
                  transition={{ duration: SCENE_DURATION / 1000, ease: "linear" }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Play/Pause Toggle */}
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </button>
      </div>
    </section>
  );
};
