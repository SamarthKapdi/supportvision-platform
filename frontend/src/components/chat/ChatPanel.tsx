import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Paperclip } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import { ChatMessage } from './ChatMessage';
import { FileUpload } from './FileUpload';

interface ChatPanelProps {
  sessionId: string;
  sendMessage: (content: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ sessionId, sendMessage }) => {
  const { isOpen, setIsOpen, messages, markRead } = useChatStore();
  const { user } = useAuthStore();
  const [input, setInput] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      markRead();
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [isOpen, messages, markRead]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
  };

  return (
    <>
      <div 
        className={`fixed inset-y-0 right-0 w-80 sm:w-96 glass-panel transform transition-transform duration-300 ease-in-out z-40 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <h3 className="text-lg font-semibold text-white">Chat</h3>
          <button onClick={() => setIsOpen(false)} className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm">
              <p>No messages yet.</p>
              <p>Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <ChatMessage key={msg.id || idx} message={msg} isOwn={msg.senderId === user?.id} />
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-700/50 bg-slate-900/40 backdrop-blur-md">
          {showUpload ? (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Share File</span>
                <button onClick={() => setShowUpload(false)} className="text-slate-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>
              <FileUpload sessionId={sessionId} onComplete={() => setShowUpload(false)} />
            </div>
          ) : null}

          <form onSubmit={handleSend} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowUpload(!showUpload)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Paperclip size={20} />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg py-2.5 px-4 text-white text-sm focus:ring-primary-500 focus:border-primary-500 transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send size={18} className="translate-x-[-1px] translate-y-[1px]" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
