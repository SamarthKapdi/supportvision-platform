import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <div className="absolute inset-0 rounded-full border-slate-700" style={{ borderWidth: 'inherit' }} />
      <div className="absolute inset-0 rounded-full border-primary-500 border-t-transparent animate-spin" style={{ borderWidth: 'inherit' }} />
    </div>
  );
};
