import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldAlert, Activity } from 'lucide-react';
import { sessionApi } from '../../services/api';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { formatRelativeTime } from '../../utils/helpers';
import { toast } from 'react-hot-toast';

export const LiveSessions: React.FC = () => {
  const { data: sessions, isLoading, refetch } = useQuery({
    queryKey: ['adminLiveSessions'],
    queryFn: () => sessionApi.getAdminLiveSessions().then(res => res.data),
    refetchInterval: 10000,
  });

  const handleForceEnd = async (id: string) => {
    try {
      await sessionApi.forceEndSession(id);
      toast.success('Session force ended');
      refetch();
    } catch (error) {
      toast.error('Failed to end session');
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-400">Loading live sessions...</div>;

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-6 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/20">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Activity size={20} className="text-emerald-500" />
          Active Live Sessions
        </h3>
        <Badge variant="success">{sessions?.length || 0} Online</Badge>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/40 text-slate-400 text-sm">
              <th className="px-6 py-4 font-medium">Session</th>
              <th className="px-6 py-4 font-medium">Started</th>
              <th className="px-6 py-4 font-medium">Agent</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {sessions?.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No active sessions at the moment.</td>
              </tr>
            ) : (
              sessions?.map(session => (
                <tr key={session.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{session.title}</div>
                    <div className="text-xs text-slate-500 font-mono mt-1">{session.id}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    {session.startedAt ? formatRelativeTime(session.startedAt) : 'Just now'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    {session.agentId}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => handleForceEnd(session.id)}
                      icon={<ShieldAlert size={14} />}
                    >
                      Force End
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
