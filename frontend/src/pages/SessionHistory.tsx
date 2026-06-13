import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter } from 'lucide-react';
import { sessionApi } from '../services/api';
import { SessionList } from '../components/session/SessionList';
import { SessionStatus } from '../types';
import { Spinner } from '../components/common/Spinner';

export const SessionHistory: React.FC = () => {
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['agentHistory'],
    queryFn: () => sessionApi.getSessionHistory().then(res => res.data),
  });

  const completedSessions = sessions?.filter(s => s.status === SessionStatus.COMPLETED) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Session History</h1>
          <p className="text-slate-400">Review your past support sessions and recordings.</p>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg bg-slate-800/50 text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all"
            placeholder="Search by ID or title..."
          />
        </div>
        <button className="p-2 border border-slate-700 rounded-lg bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-2">
          <Filter size={18} />
          <span className="hidden sm:inline text-sm">Filter</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <SessionList sessions={completedSessions} emptyMessage="No past sessions found." />
      )}
    </div>
  );
};
