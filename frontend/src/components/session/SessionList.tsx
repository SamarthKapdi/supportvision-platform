import React from 'react';
import { SessionCard } from './SessionCard';
import { Session } from '../../types';

interface Props {
  sessions: Session[];
  title?: string;
  emptyMessage?: string;
}

export const SessionList: React.FC<Props> = ({ 
  sessions, 
  title, 
  emptyMessage = "No sessions found." 
}) => {
  return (
    <div className="w-full">
      {title && <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">{title}</h2>}
      
      {sessions.length === 0 ? (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-slate-400 text-center border-dashed border-2">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-lg font-medium text-slate-300">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sessions.map(session => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
};
