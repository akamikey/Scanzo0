import React from 'react';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  variant?: 'light' | 'dark';
}

export const ScanzoLogo: React.FC<LogoProps> = ({ 
  className = '', 
  iconOnly = false, 
  variant 
}) => {
  const accent = '#0066FF';
  
  // If variant is provided, use it. Otherwise, use Tailwind's dark mode classes.
  const textColorClass = variant === 'dark' 
    ? 'text-slate-900' 
    : variant === 'light' 
    ? 'text-white' 
    : 'text-slate-900 dark:text-white';

  return (
    <div className={`flex items-center gap-2 ${textColorClass} ${className}`}>
      {/* Icon: A smart, stylized 'S' that doubles as a scan frame */}
      <svg 
        width="32" 
        height="32" 
        viewBox="0 0 32 32" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Outer Frame - Top Left */}
        <path 
          d="M4 12V6C4 4.89543 4.89543 4 6 4H12" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
        />
        {/* Outer Frame - Bottom Right */}
        <path 
          d="M20 28H26C27.1046 28 28 27.1046 28 26V20" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
        />
        
        {/* The 'S' / Scan Path */}
        <path 
          d="M10 12C10 10.8954 10.8954 10 12 10H20C21.1046 10 22 10.8954 22 12V14C22 15.1046 21.1046 16 20 16H12C10.8954 16 10 16.8954 10 18V20C10 21.1046 10.8954 22 12 22H20C21.1046 22 22 21.1046 22 20" 
          stroke={accent} 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        
        {/* Focus Dot */}
        <circle cx="16" cy="16" r="1.5" fill={accent} />
      </svg>

      {!iconOnly && (
        <span 
          className="text-xl font-bold tracking-tight"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Scanzo
        </span>
      )}
    </div>
  );
};
