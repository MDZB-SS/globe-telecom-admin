import React from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <div className={`animate-in fade-in duration-500 slide-in-from-bottom-4 ${className}`}>
      {children}
    </div>
  );
}

