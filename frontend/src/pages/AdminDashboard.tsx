import React, { useState } from 'react';
import { Activity, Shield, Users, BarChart3 } from 'lucide-react';
import { LiveSessions } from '../components/admin/LiveSessions';
import { MetricsChart } from '../components/admin/MetricsChart';
import { useAuthStore } from '../stores/authStore';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'live' | 'metrics'>('live');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
            <Shield className="text-primary-500" />
            Admin Panel
          </h1>
          <p className="text-slate-400">System overview and live session management.</p>
        </div>
      </div>

      <div className="flex border-b border-slate-700/50">
        <button 
          className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'live' ? 'border-primary-500 text-primary-400' : 'border-transparent text-slate-400 hover:text-white hover:border-slate-600'}`}
          onClick={() => setActiveTab('live')}
        >
          <div className="flex items-center gap-2">
            <Activity size={18} /> Live Sessions
          </div>
        </button>
        <button 
          className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'metrics' ? 'border-primary-500 text-primary-400' : 'border-transparent text-slate-400 hover:text-white hover:border-slate-600'}`}
          onClick={() => setActiveTab('metrics')}
        >
          <div className="flex items-center gap-2">
            <BarChart3 size={18} /> System Metrics
          </div>
        </button>
      </div>

      <div className="mt-6">
        {activeTab === 'live' ? <LiveSessions /> : <MetricsChart />}
      </div>
    </div>
  );
};
