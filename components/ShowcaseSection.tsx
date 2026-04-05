import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QrCode, Star, ArrowRight, 
  Coffee, Globe,
  MousePointer2, MessageSquare, Sparkles,
  Play, Pause,
  Link as LinkIcon, ShoppingBag,
  CreditCard, ShieldCheck
} from 'lucide-react';

// --- Animation Constants ---
const SCENE_DURATION = 5000;

// --- Background Particles ---
const Particles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-blue-500/20 rounded-full"
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: Math.random() * 100 + "%",
            scale: Math.random() * 2
          }}
          animate={{ 
            y: [null, Math.random() * 100 + "%"],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ 
            duration: Math.random() * 10 + 10, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />
      ))}
    </div>
  );
};

// --- Advanced Variants ---
const screenVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.9,
    filter: 'blur(4px)',
    rotateY: direction > 0 ? 25 : -25
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    rotateY: 0,
    transition: {
      x: { type: "spring", stiffness: 120, damping: 18 },
      opacity: { duration: 0.3 },
      scale: { duration: 0.4, ease: "circOut" },
      rotateY: { duration: 0.4, ease: "circOut" }
    }
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 1.1,
    filter: 'blur(4px)',
    rotateY: direction < 0 ? -25 : 25,
    transition: { duration: 0.3, ease: "circIn" }
  })
};

const floatingElement = {
  animate: {
    y: [0, -20, 0],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const PhoneMockup = ({ children, title }: { children: React.ReactNode, title: string }) => (
  <div className="relative mx-auto border-slate-800 bg-slate-900 border-[14px] rounded-[3.5rem] h-[500px] w-[250px] lg:h-[600px] lg:w-[300px] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden ring-8 ring-white/5">
    <div className="rounded-[2.5rem] overflow-hidden w-full h-full bg-slate-950 flex flex-col">
      <div className="h-7 bg-black flex items-center justify-center">
        <div className="w-20 h-4 bg-slate-900 rounded-full"></div>
      </div>
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/80 backdrop-blur-md">
        <span className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400">{title}</span>
        <div className="w-5 h-5 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
      </div>
      <div className="flex-1 overflow-hidden relative">
        {children}
      </div>
    </div>
  </div>
);

const LogicFlow = () => (
  <div className="relative w-[300px] h-[300px] lg:w-[400px] lg:h-[400px] flex items-center justify-center scale-75 lg:scale-100">
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/20 blur-[80px] rounded-full"
      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 4, repeat: Infinity }}
    />
    
    <motion.div 
      className="absolute top-[20px] left-[136px] bg-blue-600 p-6 rounded-[2.5rem] shadow-[0_0_100px_rgba(37,99,235,0.8)] z-10 border border-blue-400/30"
      animate={{ 
        scale: [1, 1.1, 1], 
        rotate: [0, 5, -5, 0],
        boxShadow: ["0 0 60px rgba(37,99,235,0.5)", "0 0 120px rgba(37,99,235,0.9)", "0 0 60px rgba(37,99,235,0.5)"]
      }}
      transition={{ duration: 5, repeat: Infinity }}
    >
      <QrCode size={80} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
    </motion.div>

    <motion.div 
      className="absolute top-[240px] left-[20px] flex flex-col items-center gap-4 z-10 w-[120px]"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
    >
      <div className="absolute -top-10 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] font-black tracking-widest shadow-[0_0_30px_rgba(16,185,129,0.5)] whitespace-nowrap">
        4-5 STARS
      </div>
      <div className="w-20 h-20 rounded-3xl bg-emerald-500 flex items-center justify-center text-white shadow-[0_0_60px_rgba(16,185,129,0.6)] border border-emerald-400/50">
        <Star size={40} fill="currentColor" className="drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
      </div>
      <span className="text-[12px] font-black text-emerald-400 uppercase tracking-[0.1em] drop-shadow-[0_0_10px_rgba(16,185,129,0.8)] text-center">Google Review</span>
    </motion.div>

    <motion.div 
      className="absolute top-[240px] right-[20px] flex flex-col items-center gap-4 z-10 w-[120px]"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5 }}
    >
      <div className="absolute -top-10 bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-[10px] font-black tracking-widest shadow-[0_0_30px_rgba(239,68,68,0.5)] whitespace-nowrap">
        1-3 STARS
      </div>
      <div className="w-20 h-20 rounded-3xl bg-red-500 flex items-center justify-center text-white shadow-[0_0_60px_rgba(239,68,68,0.6)] border border-red-400/50">
        <MessageSquare size={40} className="drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
      </div>
      <span className="text-[12px] font-black text-red-400 uppercase tracking-[0.1em] drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] text-center">Private Inbox</span>
    </motion.div>
    
    <svg className="absolute inset-0 w-full h-full -z-10" viewBox="0 0 400 400">
      <motion.path 
        d="M 200 140 L 80 250" 
        stroke="url(#grad1)" 
        strokeWidth="4" 
        strokeDasharray="8 8"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 1 }}
        style={{ filter: 'drop-shadow(0 0 10px rgba(16,185,129,0.8))' }}
      />
      <motion.path 
        d="M 200 140 L 320 250" 
        stroke="url(#grad2)" 
        strokeWidth="4" 
        strokeDasharray="8 8"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 1.5 }}
        style={{ filter: 'drop-shadow(0 0 10px rgba(239,68,68,0.8))' }}
      />
      <motion.circle r="6" fill="#10b981" style={{ filter: 'drop-shadow(0 0 15px #10b981)' }}>
        <animateMotion dur="2s" repeatCount="indefinite" path="M 200 140 L 80 250" />
      </motion.circle>
      <motion.circle r="6" fill="#ef4444" style={{ filter: 'drop-shadow(0 0 15px #ef4444)' }}>
        <animateMotion dur="2s" repeatCount="indefinite" path="M 200 140 L 320 250" />
      </motion.circle>
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

const scenes = [
  {
    id: "hero",
    title: "SCANZO",
    subtitle: "The Operating System for Physical Businesses",
    description: "Beautiful, responsive, and built for speed. Your business deserves a digital home that works as hard as you do.",
    visual: (
      <div className="relative w-full h-full flex items-center justify-center">
        <motion.div 
          className="relative z-10"
          initial={{ rotateY: -30, rotateX: 15 }}
          animate={{ rotateY: 0, rotateX: 0 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
        >
          <PhoneMockup title="Scanzo OS">
            <div className="h-full w-full bg-slate-950 p-6 space-y-8 overflow-hidden">
              <motion.div 
                className="h-48 w-full bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[2.5rem] flex items-center justify-center relative overflow-hidden"
                animate={{ background: ["linear-gradient(to bottom right, #2563eb, #3730a3)", "linear-gradient(to bottom right, #3b82f6, #4338ca)", "linear-gradient(to bottom right, #2563eb, #3730a3)"] }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                <QrCode size={100} className="text-white/20" />
                <motion.div 
                  className="absolute inset-0 bg-white/10"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
              <div className="space-y-4">
                <div className="h-10 w-3/4 bg-white/10 rounded-full" />
                <div className="h-5 w-full bg-white/5 rounded-full" />
                <div className="h-5 w-5/6 bg-white/5 rounded-full" />
              </div>
              <motion.div 
                className="h-16 w-full bg-blue-600 rounded-2xl shadow-xl shadow-blue-600/30 flex items-center justify-center font-black uppercase tracking-widest text-sm"
              >
                Get Started
              </motion.div>
              <div className="grid grid-cols-2 gap-5">
                <div className="h-32 bg-white/5 rounded-[2rem]" />
                <div className="h-32 bg-white/5 rounded-[2rem]" />
              </div>
            </div>
          </PhoneMockup>
        </motion.div>
        <motion.div 
          className="absolute right-0 lg:-right-4 top-1/4 bg-white/5 backdrop-blur-3xl p-6 lg:p-8 rounded-[2rem] border border-white/10 shadow-2xl z-20"
          variants={floatingElement}
          animate="animate"
        >
          <MousePointer2 className="text-blue-500 mb-2 lg:mb-3" size={32} />
          <div className="text-[10px] lg:text-[12px] font-black uppercase tracking-[0.3em] text-blue-400">High Conversion</div>
        </motion.div>
      </div>
    )
  },
  {
    id: "one-qr",
    title: "ONE QR CODE",
    subtitle: "Infinite Possibilities for Your Business.",
    description: "One scan does it all. Reviews, Menus, Feedback, Socials, and Payments. Simplify your customer journey with a single touchpoint.",
    visual: (
      <div className="relative w-full h-full flex items-center justify-center">
        <motion.div 
          className="bg-white p-10 rounded-[3rem] shadow-[0_0_100px_rgba(255,255,255,0.1)] relative z-20"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <QrCode size={120} className="text-black" />
        </motion.div>
        
        {[
          { icon: Star, label: "Reviews", color: "text-amber-400", angle: 0 },
          { icon: Coffee, label: "Menu", color: "text-blue-400", angle: 72 },
          { icon: MessageSquare, label: "Feedback", color: "text-red-400", angle: 144 },
          { icon: Globe, label: "Socials", color: "text-emerald-400", angle: 216 },
          { icon: CreditCard, label: "Payments", color: "text-purple-400", angle: 288 },
        ].map((item, i) => {
          return (
          <motion.div
            key={i}
            className="absolute flex flex-col items-center gap-2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
            }}
            style={{
              transform: `rotate(${item.angle}deg) translateX(min(35vw, 220px)) rotate(-${item.angle}deg)`
            }}
            transition={{ delay: 0.5 + i * 0.2, type: "spring" }}
          >
            <div className={`w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center ${item.color} shadow-xl`}>
              <item.icon size={24} className="lg:w-8 lg:h-8" />
            </div>
            <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-white/50">{item.label}</span>
          </motion.div>
        )})}
        
        <svg className="absolute inset-0 w-full h-full -z-10 pointer-events-none">
          {[0, 72, 144, 216, 288].map((angle, i) => {
            return (
              <g key={i} style={{ transformOrigin: '50% 50%', transform: `translate(50%, 50%) rotate(${angle}deg)` }}>
                <motion.line
                  x1="0" y1="0"
                  x2="180" y2="0"
                  stroke="white"
                  strokeWidth="1"
                  strokeOpacity="0.1"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 1 + i * 0.2, duration: 1 }}
                />
              </g>
            );
          })}
        </svg>
      </div>
    )
  },
  {
    id: "logic",
    title: "Intelligent Routing",
    subtitle: "Protect your reputation automatically.",
    description: "We automatically route happy customers to Google, while negative feedback stays private, giving you the chance to make it right.",
    visual: (
      <div className="w-full h-full flex items-center justify-center scale-110">
        <LogicFlow />
      </div>
    )
  },
  {
    id: "custom-links",
    title: "ANY LINK YOU WANT",
    subtitle: "Your Website. Your Menu. Your Rules.",
    description: "Redirect scanners anywhere. Link your custom website, digital menus, booking pages, or promotional offers instantly.",
    visual: (
      <div className="relative w-full h-full flex items-center justify-center">
        <motion.div 
          className="relative z-10"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <PhoneMockup title="Custom Destination">
            <div className="p-5 space-y-6 h-full bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                transition={{ duration: 10, repeat: Infinity }}
              />
              <div className="w-20 h-20 bg-blue-500 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/50 z-10 mb-2">
                <LinkIcon size={40} className="text-white" />
              </div>
              <div className="w-3/4 h-4 bg-white/20 rounded-full z-10" />
              <div className="w-1/2 h-3 bg-white/10 rounded-full z-10 mb-8" />
              
              <div className="w-full space-y-4 z-10">
                {[
                  { icon: Globe, text: "Your Website", color: "bg-blue-500" },
                  { icon: Coffee, text: "Digital Menu", color: "bg-amber-500" },
                  { icon: ShoppingBag, text: "Online Store", color: "bg-emerald-500" }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    className="w-full bg-white/10 backdrop-blur-md p-4 rounded-2xl flex items-center gap-4 border border-white/5 shadow-xl"
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1 + i * 0.2 }}
                  >
                    <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center shadow-lg`}>
                      <item.icon size={20} className="text-white" />
                    </div>
                    <div className="h-3 w-32 bg-white/20 rounded-full" />
                  </motion.div>
                ))}
              </div>
            </div>
          </PhoneMockup>
        </motion.div>
      </div>
    )
  },
  {
    id: "testimonials",
    title: "LOVED BY OWNERS",
    subtitle: "Real Feedback from Real Businesses.",
    description: "See how Scanzo is transforming operations, saving time, and driving growth for businesses just like yours.",
    visual: (
      <div className="relative w-full h-full flex flex-col items-center justify-center gap-6">
        {[
          { name: "Sarah J.", role: "Cafe Owner", text: "Scanzo completely changed how we handle feedback. Our Google Reviews skyrocketed in just one month!", delay: 0 },
          { name: "Mike T.", role: "Gym Manager", text: "The custom QR codes with our logo look incredibly professional. Members love how easy it is to use.", delay: 0.2 },
          { name: "Elena R.", role: "Restaurant Owner", text: "Filtering out the 1-3 star reviews to our private inbox saved us from several PR disasters. A lifesaver!", delay: 0.4 }
        ].map((testimonial, i) => (
          <motion.div
            key={i}
            className="bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-2xl w-full max-w-lg relative overflow-hidden"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 + testimonial.delay, type: "spring", damping: 20 }}
            whileHover={{ scale: 1.02, x: -10 }}
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
                {testimonial.name.charAt(0)}
              </div>
              <div>
                <div className="font-black text-white">{testimonial.name}</div>
                <div className="text-[10px] text-blue-400 uppercase tracking-widest font-bold">{testimonial.role}</div>
              </div>
              <div className="ml-auto flex gap-1">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={14} className="text-amber-400" fill="currentColor" />
                ))}
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed italic">"{testimonial.text}"</p>
          </motion.div>
        ))}
      </div>
    )
  },
  {
    id: "branding",
    title: "100% YOUR BRAND",
    subtitle: "No Watermarks. Completely Yours.",
    description: "We stay out of your way. Upload your own logo, customize colors, and make the QR code a seamless part of your brand identity.",
    visual: (
      <div className="relative w-full h-full flex items-center justify-center">
        <motion.div 
          className="bg-white p-12 rounded-[3.5rem] shadow-[0_0_120px_rgba(255,255,255,0.15)] relative z-20 flex items-center justify-center"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <QrCode size={180} className="text-black" />
          
          <motion.div 
            className="absolute inset-0 m-auto w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl border-[6px] border-white overflow-hidden"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, type: "spring", damping: 15 }}
          >
            <motion.div
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }}
            >
              <Coffee size={40} className="text-amber-600" />
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute top-1/4 right-10 lg:right-20 bg-blue-600 text-white px-6 py-3 rounded-full font-black tracking-[0.2em] text-xs shadow-[0_0_30px_rgba(37,99,235,0.5)] border border-blue-400/50 z-30"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.5, type: "spring" }}
        >
          NO WATERMARKS
        </motion.div>
        
        <motion.div
          className="absolute bottom-1/4 left-10 lg:left-20 bg-emerald-600 text-white px-6 py-3 rounded-full font-black tracking-[0.2em] text-xs shadow-[0_0_30px_rgba(16,185,129,0.5)] border border-emerald-400/50 z-30"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.8, type: "spring" }}
        >
          CUSTOM LOGO
        </motion.div>
      </div>
    )
  },
  {
    id: "cta",
    title: "GET STARTED",
    subtitle: (
      <span className="flex items-center flex-wrap gap-3">
        Join <span className="text-white bg-blue-600 px-4 py-1 rounded-xl shadow-[0_0_30px_rgba(37,99,235,0.8)]">1 MILLION+</span> Users.
      </span>
    ) as any,
    description: "Already 1 Million+ users are using Scanzo to dominate their local market. Claim your custom QR code today.",
    visual: (
      <div className="flex flex-col items-center gap-16">
        <motion.div 
          className="relative"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute inset-0 bg-blue-500 blur-[150px] opacity-30" />
          <QrCode size={220} className="text-white relative z-10" />
          <motion.div 
            className="absolute -inset-10 border-2 border-dashed border-blue-500/30 rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      </div>
    )
  }
];

const ShowcaseSection: React.FC = () => {
  const [currentScene, setCurrentScene] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentScene((prev) => (prev + 1) % scenes.length);
    }, SCENE_DURATION);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const scene = scenes[currentScene];

  return (
    <section 
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
      className="relative min-h-[90vh] bg-slate-950 text-white flex flex-col items-center justify-center overflow-hidden py-24"
    >
      <Particles />
      
      {/* Cinematic Overlays */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay" />
        <div className="absolute inset-0 shadow-[inset_0_0_400px_rgba(0,0,0,0.9)]" />
      </div>

      {/* Main Stage */}
      <div className="relative w-full h-full max-w-[1600px] mx-auto flex flex-col lg:flex-row items-center px-8 lg:px-16 gap-8 lg:gap-20 z-10">
        {/* Left Side: Visuals */}
        <div className="flex-1 w-full h-[45vh] lg:h-full flex items-center justify-center order-2 lg:order-1">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={scene.id}
              custom={direction}
              variants={screenVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full h-full flex items-center justify-center"
            >
              {scene.visual}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Side: Text */}
        <div className="flex-1 space-y-8 lg:space-y-12 text-left order-1 lg:order-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={scene.id}
              initial={{ opacity: 0, x: 100, filter: 'blur(10px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -100, filter: 'blur(10px)' }}
              transition={{ duration: 0.6, ease: "circOut" }}
              className="space-y-6 lg:space-y-10"
            >
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
                <Sparkles size={18} className="text-blue-500" />
                <span className="text-[12px] font-black text-blue-500 uppercase tracking-[0.4em]">Feature Showcase</span>
              </div>
              <h2 className="text-5xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.85] uppercase italic">
                {scene.title}
              </h2>
              <h3 className="text-2xl lg:text-4xl font-bold text-blue-500 tracking-tight leading-tight">
                {scene.subtitle}
              </h3>
              <p className="text-lg lg:text-2xl text-slate-400 max-w-2xl leading-relaxed font-medium">
                {scene.description}
              </p>
              
              <div className="flex items-center gap-8 pt-8">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all pointer-events-auto active:scale-90 border border-white/10"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <div className="flex gap-3">
                  {scenes.map((s, i) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setDirection(i > currentScene ? 1 : -1);
                        setCurrentScene(i);
                      }}
                      className={`h-1.5 rounded-full transition-all duration-500 ${i === currentScene ? 'w-12 bg-blue-500' : 'w-3 bg-white/10 hover:bg-white/20'}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Background Ambient Gradients */}
      <div className="absolute inset-0 -z-10">
        <motion.div 
          className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,_var(--tw-gradient-stops))] from-blue-600/15 via-transparent to-transparent"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,_var(--tw-gradient-stops))] from-purple-600/15 via-transparent to-transparent"
          animate={{ 
            scale: [1.3, 1, 1.3],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />
      </div>
    </section>
  );
};

export default ShowcaseSection;
