import React from 'react';
import { useMediaStore } from '../../stores/mediaStore';
import { MonitorUp, MonitorOff } from 'lucide-react';

export const ScreenShare: React.FC = () => {
  const { screenShareOn, setScreenShareOn } = useMediaStore();

  const handleToggle = async () => {
    try {
      if (!screenShareOn) {
        // The actual stream capture is handled in useMediasoup hook via store reaction
        // but we verify support here
        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
          alert('Screen sharing is not supported in this browser.');
          return;
        }
      }
      setScreenShareOn(!screenShareOn);
    } catch (error) {
      console.error('Failed to toggle screen share:', error);
    }
  };

  if (!screenShareOn) return null;

  return (
    <div className="absolute top-4 right-4 z-50 animate-fade-in">
      <div className="glass px-4 py-2 rounded-lg flex items-center gap-3 border border-primary-500/30 shadow-lg shadow-primary-500/20">
        <div className="relative">
          <MonitorUp className="text-primary-400" size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
        </div>
        <span className="text-sm font-medium text-slate-200">You are sharing your screen</span>
        <div className="w-px h-4 bg-slate-700 mx-1"></div>
        <button 
          onClick={handleToggle}
          className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors uppercase tracking-wider"
        >
          Stop Share
        </button>
      </div>
    </div>
  );
};
