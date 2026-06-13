import React, { useEffect, useRef } from 'react';
import { MicOff, VideoOff, User } from 'lucide-react';

interface VideoTileProps {
  stream: MediaStream | null;
  name: string;
  isLocal?: boolean;
  isScreenShare?: boolean;
  cameraOff?: boolean;
  muted?: boolean;
  isSpeaking?: boolean;
}

export const VideoTile: React.FC<VideoTileProps> = ({
  stream,
  name,
  isLocal,
  isScreenShare,
  cameraOff,
  muted,
  isSpeaking,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div 
      className={`relative w-full h-full min-h-[200px] max-h-[calc(100vh-200px)] rounded-2xl overflow-hidden glass-card transition-all duration-300
        ${isSpeaking ? 'ring-2 ring-primary-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'ring-1 ring-slate-700/50'}
        ${isScreenShare ? 'col-span-full md:col-span-2 row-span-2' : ''}
      `}
    >
      {stream && !cameraOff ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={`w-full h-full object-cover ${isLocal && !isScreenShare ? 'scale-x-[-1]' : ''}`}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800/80">
          <div className="h-24 w-24 rounded-full bg-slate-700 flex items-center justify-center mb-4">
            <User size={40} className="text-slate-400" />
          </div>
          <VideoOff size={24} className="text-slate-500" />
        </div>
      )}

      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
        <div className="bg-background-900/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/50 text-sm font-medium text-white shadow-lg">
          {name} {isLocal && '(You)'}
        </div>
        {muted && (
          <div className="bg-rose-500/80 backdrop-blur-md p-1.5 rounded-lg shadow-lg">
            <MicOff size={16} className="text-white" />
          </div>
        )}
      </div>
    </div>
  );
};
