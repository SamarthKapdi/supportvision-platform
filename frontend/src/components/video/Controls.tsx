import React, { useState } from 'react';
import { Mic, MicOff, Video, VideoOff, MonitorUp, MessageSquare, Settings, PhoneOff, Circle } from 'lucide-react';
import { useMediaStore } from '../../stores/mediaStore';
import { useChatStore } from '../../stores/chatStore';
import { useRecording } from '../../hooks/useRecording';
import { DeviceSelector } from './DeviceSelector';
import { Modal } from '../common/Modal';

interface ControlsProps {
  sessionId: string;
  onEndCall: () => void;
}

export const Controls: React.FC<ControlsProps> = ({ sessionId, onEndCall }) => {
  const { micOn, cameraOn, screenShareOn, setMicOn, setCameraOn, setScreenShareOn } = useMediaStore();
  const { isOpen, setIsOpen, unreadCount } = useChatStore();
  const { isRecording, toggleRecording } = useRecording(sessionId);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 glass px-6 py-3 rounded-full shadow-2xl z-40">
      <button
        onClick={() => setMicOn(!micOn)}
        className={`p-3 rounded-full transition-all ${!micOn ? 'bg-rose-500/20 text-rose-500 hover:bg-rose-500/30' : 'bg-slate-700/50 text-white hover:bg-slate-600'}`}
      >
        {micOn ? <Mic size={22} /> : <MicOff size={22} />}
      </button>

      <button
        onClick={() => setCameraOn(!cameraOn)}
        className={`p-3 rounded-full transition-all ${!cameraOn ? 'bg-rose-500/20 text-rose-500 hover:bg-rose-500/30' : 'bg-slate-700/50 text-white hover:bg-slate-600'}`}
      >
        {cameraOn ? <Video size={22} /> : <VideoOff size={22} />}
      </button>

      <div className="w-px h-8 bg-slate-700/50 mx-1"></div>

      <button
        onClick={() => setScreenShareOn(!screenShareOn)}
        className={`p-3 rounded-full transition-all ${screenShareOn ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-slate-700/50 text-white hover:bg-slate-600'}`}
      >
        <MonitorUp size={22} />
      </button>

      <button
        onClick={toggleRecording}
        className={`p-3 rounded-full transition-all flex items-center justify-center ${isRecording ? 'bg-rose-500/20 text-rose-500 animate-pulse' : 'bg-slate-700/50 text-white hover:bg-slate-600'}`}
      >
        <Circle size={22} className={isRecording ? 'fill-rose-500' : ''} />
      </button>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-3 rounded-full transition-all ${isOpen ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-slate-700/50 text-white hover:bg-slate-600'}`}
      >
        <MessageSquare size={22} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm border-2 border-background-900">
            {unreadCount}
          </span>
        )}
      </button>

      <button
        onClick={() => setShowSettings(true)}
        className="p-3 rounded-full bg-slate-700/50 text-white hover:bg-slate-600 transition-all"
      >
        <Settings size={22} />
      </button>

      <div className="w-px h-8 bg-slate-700/50 mx-1"></div>

      <button
        onClick={onEndCall}
        className="p-3 px-6 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-medium shadow-lg shadow-rose-500/30 transition-all flex items-center gap-2"
      >
        <PhoneOff size={20} />
        <span className="hidden sm:inline">End Call</span>
      </button>

      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Device Settings">
        <DeviceSelector />
      </Modal>
    </div>
  );
};
