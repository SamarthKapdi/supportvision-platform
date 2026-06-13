import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/helpers'; // need cn here, wait let me write it inline or rely on tailwind-merge
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

function cnLocal(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className }) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-background-900/80 backdrop-blur-sm transition-opacity"
        onClick={(e) => e.target === overlayRef.current && onClose()}
      />
      <div className={cnLocal(
        "relative w-full max-w-lg transform overflow-hidden rounded-2xl glass shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200",
        className
      )}>
        {title && (
          <div className="flex items-center justify-between border-b border-slate-700/50 px-6 py-4">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        {!title && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
