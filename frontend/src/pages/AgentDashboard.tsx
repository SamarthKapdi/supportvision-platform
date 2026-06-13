import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Users, Clock, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { sessionApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { SessionList } from '../components/session/SessionList';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { InviteLink } from '../components/session/InviteLink';
import { SessionStatus } from '../types';

export const AgentDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [createdSessionInvite, setCreatedSessionInvite] = useState<string | null>(null);

  const { data: sessions, refetch } = useQuery({
    queryKey: ['agentSessions'],
    queryFn: () => sessionApi.getSessionHistory().then(res => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (title: string) => sessionApi.createSession({ title }),
    onSuccess: (res) => {
      setCreatedSessionInvite(res.data.inviteToken);
      refetch();
      toast.success('Session created successfully');
    },
    onError: () => {
      toast.error('Failed to create session');
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionTitle.trim()) return;
    createMutation.mutate(newSessionTitle);
  };

  const activeSessions = sessions?.filter(s => s.status === SessionStatus.ACTIVE || s.status === SessionStatus.WAITING) || [];
  const recentSessions = sessions?.filter(s => s.status === SessionStatus.COMPLETED).slice(0, 3) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Welcome back, {user?.firstName}</h1>
          <p className="text-slate-400">Here's an overview of your support sessions.</p>
        </div>
        <Button 
          onClick={() => { setIsModalOpen(true); setCreatedSessionInvite(null); setNewSessionTitle(''); }} 
          icon={<Plus size={18} />}
          size="lg"
        >
          New Session
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center gap-4 border-t-4 border-t-primary-500">
          <div className="p-3 bg-primary-500/10 rounded-lg text-primary-500">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Active Sessions</p>
            <p className="text-2xl font-bold text-white">{activeSessions.length}</p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4 border-t-4 border-t-emerald-500">
          <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Total Completed</p>
            <p className="text-2xl font-bold text-white">{sessions?.filter(s => s.status === SessionStatus.COMPLETED).length || 0}</p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4 border-t-4 border-t-secondary-500">
          <div className="p-3 bg-secondary-500/10 rounded-lg text-secondary-500">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Avg Duration</p>
            <p className="text-2xl font-bold text-white">14m</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <SessionList sessions={activeSessions} title="Active & Waiting Sessions" emptyMessage="No active sessions right now." />
        <SessionList sessions={recentSessions} title="Recent History" emptyMessage="No past sessions." />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Session">
        {!createdSessionInvite ? (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Session Title / Customer Name</label>
              <input
                type="text"
                value={newSessionTitle}
                onChange={(e) => setNewSessionTitle(e.target.value)}
                placeholder="e.g., Network Troubleshooting for Acme Corp"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-primary-500 focus:border-primary-500 transition-all"
                required
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50 mt-6">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" isLoading={createMutation.isPending}>Create Session</Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-lg flex gap-3 items-center border border-emerald-500/20">
              <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle size={16} className="text-emerald-500" />
              </div>
              <p className="text-sm font-medium">Session created successfully!</p>
            </div>
            <InviteLink inviteToken={createdSessionInvite} />
          </div>
        )}
      </Modal>
    </div>
  );
};

// Quick fix for CheckCircle missing
import { CheckCircle } from 'lucide-react';
