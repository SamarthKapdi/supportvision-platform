import React from 'react';
import { FileText, Download } from 'lucide-react';
import { ChatMessage as IChatMessage, MessageType } from '../../types';
import { formatTime } from '../../utils/helpers'; // need to add formatTime to helpers, will use date-fns inline here
import { format } from 'date-fns';

interface Props {
  message: IChatMessage;
  isOwn: boolean;
}

export const ChatMessage: React.FC<Props> = ({ message, isOwn }) => {
  if (message.type === MessageType.SYSTEM) {
    return (
      <div className="flex justify-center my-2">
        <span className="bg-slate-800/50 text-slate-400 text-xs px-3 py-1 rounded-full backdrop-blur-sm">
          {message.content}
        </span>
      </div>
    );
  }

  const time = message.timestamp ? format(new Date(message.timestamp), 'h:mm a') : '';

  return (
    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} mb-4`}>
      <span className="text-xs text-slate-400 mb-1 ml-1">{isOwn ? 'You' : message.senderName}</span>
      
      <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${
        isOwn 
          ? 'bg-gradient-to-br from-primary-600 to-primary-500 text-white rounded-tr-sm shadow-md' 
          : 'bg-slate-800 border border-slate-700/50 text-slate-200 rounded-tl-sm shadow-sm'
      }`}>
        
        {message.type === MessageType.FILE ? (
          <div className="flex items-center gap-3 bg-black/20 p-2 rounded-lg">
            <div className="p-2 bg-white/10 rounded-md">
              <FileText size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{message.fileName}</p>
              <a 
                href={message.fileUrl} 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-primary-200 hover:text-white flex items-center gap-1 mt-1 transition-colors"
              >
                <Download size={12} /> Download
              </a>
            </div>
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
        )}
        
      </div>
      <span className="text-[10px] text-slate-500 mt-1 mr-1">{time}</span>
    </div>
  );
};
