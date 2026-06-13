import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { useSession } from '../hooks/useSession';
import { useMediasoup } from '../hooks/useMediasoup';
import { useChat } from '../hooks/useChat';
import { VideoGrid } from '../components/video/VideoGrid';
import { Controls } from '../components/video/Controls';
import { ChatPanel } from '../components/chat/ChatPanel';
import { Spinner } from '../components/common/Spinner';
import { useAuthStore } from '../stores/authStore';
import { ROUTES } from '../utils/constants';
import { Users, Info } from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { ScreenShare } from '../components/video/ScreenShare';

export const VideoRoom: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuthStore();
  const [showInfo, setShowInfo] = useState(false);

  if (!sessionId) return <Navigate to={ROUTES.DASHBOARD} replace />;

  const { isConnected } = useSocket();
  const { currentSession, participants, endSession, leaveSession } = useSession(sessionId);
  const { isReady } = useMediasoup(sessionId);
  const { sendMessage } = useChat(sessionId);

  if (!isConnected || !isReady) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background-900 text-white">
        <Spinner size="lg" className="mb-6" />
        <h2 className="text-xl font-medium mb-2">Joining Session...</h2>
        <p className="text-slate-400 text-sm">Connecting to secure media servers</p>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-slate-950 overflow-hidden flex flex-col">
      {/* Top Header Overlay */}
      <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/80 to-transparent z-20 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <h2 className="text-white font-medium text-lg shadow-sm">{currentSession?.title || `Session ${sessionId.substring(0,8)}`}</h2>
          {currentSession?.isRecording && (
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-rose-500/20 text-rose-500 text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-rose-500/30 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> REC
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white text-sm">
            <Users size={16} />
            <span>{participants.length}</span>
          </div>
          <button onClick={() => setShowInfo(true)} className="p-2 bg-black/40 hover:bg-black/60 rounded-lg text-white backdrop-blur-md border border-white/10 transition-colors">
            <Info size={18} />
          </button>
        </div>
      </div>

      {/* Screen Share Overlay */}
      <ScreenShare />

      {/* Main Video Area */}
      <div className="flex-1 w-full relative z-10 p-4 pt-20 pb-28">
        <VideoGrid />
      </div>

      {/* Controls Area */}
      <Controls sessionId={sessionId} onEndCall={user?.role === 'agent' ? endSession : leaveSession} />

      {/* Chat Sidebar Overlay */}
      <ChatPanel sessionId={sessionId} sendMessage={sendMessage} />

      {/* Info Modal */}
      <Modal isOpen={showInfo} onClose={() => setShowInfo(false)} title="Session Details">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">Session ID</label>
            <p className="text-white font-mono mt-1 bg-slate-800/50 p-2 rounded border border-slate-700">{sessionId}</p>
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">Participants</label>
            <ul className="mt-2 space-y-2">
              {participants.map(p => (
                <li key={p.id} className="flex items-center gap-2 bg-slate-800/30 p-2 rounded">
                  <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-xs font-bold text-white">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-slate-200">{p.name} {p.id === user?.id ? '(You)' : ''}</span>
                  <span className="text-xs text-slate-500 capitalize ml-auto">{p.role}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};
