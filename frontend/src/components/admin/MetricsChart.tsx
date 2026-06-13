import React from 'react';
import { Users, Clock, Video, Activity } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  isPositive?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, isPositive }) => (
  <div className="glass-card p-6">
    <div className="flex items-center justify-between mb-4">
      <h4 className="text-slate-400 font-medium">{title}</h4>
      <div className="p-2 rounded-lg bg-slate-800/50 text-slate-300">
        {icon}
      </div>
    </div>
    <div className="flex items-end gap-3">
      <h2 className="text-3xl font-bold text-white">{value}</h2>
      {trend && (
        <span className={`text-sm font-medium mb-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
          {trend}
        </span>
      )}
    </div>
  </div>
);

export const MetricsChart: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Sessions" value="1,248" icon={<Video size={20} />} trend="+12.5%" isPositive />
        <StatCard title="Active Users" value="86" icon={<Users size={20} />} trend="+5.2%" isPositive />
        <StatCard title="Avg Duration" value="18m 42s" icon={<Clock size={20} />} trend="-1.2%" />
        <StatCard title="Platform Load" value="42%" icon={<Activity size={20} />} trend="+8.1%" />
      </div>

      <div className="glass-card p-6 min-h-[300px] flex items-center justify-center">
        <div className="text-center text-slate-400">
          <Activity size={48} className="mx-auto mb-4 opacity-50" />
          <p>Detailed charts would render here.</p>
          <p className="text-sm">In a real app, integrate Recharts or Chart.js</p>
        </div>
      </div>
    </div>
  );
};
