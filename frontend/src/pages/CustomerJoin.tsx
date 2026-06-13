import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Video, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { sessionApi } from '../services/api';
import { Button } from '../components/common/Button';
import { Spinner } from '../components/common/Spinner';
import { useAuthStore } from '../stores/authStore';
import { ROUTES } from '../utils/constants';

export const CustomerJoin: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user, setAuth } = useAuthStore();
  
  const [name, setName] = useState('');
  const [hasPermissions, setHasPermissions] = useState(false);

  const { data: session, isLoading, error } = useQuery({
    queryKey: ['sessionByToken', token],
    queryFn: () => sessionApi.getSessionByInviteToken(token!).then(res => res.data),
    enabled: !!token,
    retry: false,
  });

  const joinMutation = useMutation({
    mutationFn: (data: { name: string }) => sessionApi.joinSession(session!.id, data),
    onSuccess: (res: any) => {
      // If customer is joining, API creates a temporary token for them
      if (res.data.token && res.data.user) {
        setAuth(res.data.user, res.data.token);
      }
      navigate(ROUTES.ROOM.replace(':sessionId', session!.id));
    },
    onError: () => toast.error('Failed to join session'),
  });

  useEffect(() => {
    // Automatically use existing auth if logged in as customer
    if (isAuthenticated && user?.role === 'customer' && user.firstName) {
      setName(`${user.firstName} ${user.lastName}`.trim());
    }
  }, [isAuthenticated, user]);

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop them right away, just wanted permission
      setHasPermissions(true);
      toast.success('Permissions granted');
    } catch (err) {
      toast.error('Camera/Mic permission is required to join');
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!hasPermissions) {
      toast.error('Please grant media permissions first');
      return;
    }
    joinMutation.mutate({ name });
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background-900"><Spinner /></div>;
  if (error || !session) return <div className="min-h-screen flex items-center justify-center bg-background-900 text-white">Invalid or expired invite link.</div>;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background-900 animated-gradient-bg p-4 relative">
      <div className="w-full max-w-md p-8 glass-card animate-in fade-in zoom-in-95 duration-500 z-10">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 shadow-xl mb-4">
            <Video className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Join Support Session</h2>
          <p className="text-slate-400 text-sm">You've been invited to <span className="text-white font-medium">{session.title}</span></p>
        </div>

        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Your Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-primary-500 focus:border-primary-500 transition-all shadow-inner"
              placeholder="John Doe"
              disabled={isAuthenticated && user?.role === 'customer'}
            />
          </div>

          <div className={`p-4 rounded-xl border ${hasPermissions ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'} flex items-start gap-3 transition-colors`}>
            <ShieldCheck className={hasPermissions ? 'text-emerald-500 mt-0.5' : 'text-amber-500 mt-0.5'} size={20} />
            <div>
              <p className={`text-sm font-medium ${hasPermissions ? 'text-emerald-400' : 'text-amber-400'}`}>
                {hasPermissions ? 'Permissions granted' : 'Permissions required'}
              </p>
              <p className="text-xs text-slate-400 mt-1">We need access to your camera and microphone for the support call.</p>
              {!hasPermissions && (
                <button type="button" onClick={requestPermissions} className="mt-3 text-xs font-semibold bg-amber-500 text-white px-3 py-1.5 rounded-lg hover:bg-amber-600 transition-colors shadow-sm">
                  Allow Access
                </button>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full py-3 text-base rounded-xl font-semibold"
            disabled={!hasPermissions || !name.trim()}
            isLoading={joinMutation.isPending}
          >
            Join Session
          </Button>
        </form>
      </div>
    </div>
  );
};
