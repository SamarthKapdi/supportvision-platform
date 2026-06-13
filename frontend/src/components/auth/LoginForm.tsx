import React, { useState } from 'react';
import { Video, Mail, Lock } from 'lucide-react';
import { Button } from '../common/Button';
import { useAuth } from '../../hooks/useAuth';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoggingIn } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="w-full max-w-md p-8 glass-card animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden">
      <div className="absolute top-[-50px] left-[-50px] w-32 h-32 bg-primary-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-50px] right-[-50px] w-32 h-32 bg-secondary-500/20 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 text-center mb-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 shadow-xl mb-4 animate-float">
          <Video className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold gradient-text mb-2">Welcome Back</h2>
        <p className="text-slate-400 text-sm">Sign in to your SupportVision account</p>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-primary-500 focus:border-primary-500 text-white placeholder-slate-500 transition-all shadow-inner"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-slate-300">Password</label>
            <a href="#" className="text-xs text-primary-400 hover:text-primary-300">Forgot password?</a>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-primary-500 focus:border-primary-500 text-white placeholder-slate-500 transition-all shadow-inner"
              placeholder="••••••••"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full py-3 text-base rounded-xl font-semibold mt-4"
          isLoading={isLoggingIn}
        >
          Sign In
        </Button>
      </form>
    </div>
  );
};
