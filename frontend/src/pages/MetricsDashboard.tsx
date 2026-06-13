import React from 'react';
import { MetricsChart } from '../components/admin/MetricsChart';
import { ExternalLink } from 'lucide-react';
import { Button } from '../components/common/Button';

export const MetricsDashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Metrics Dashboard</h1>
          <p className="text-slate-400">Detailed system analytics and performance metrics.</p>
        </div>
        <Button variant="secondary" icon={<ExternalLink size={16} />}>
          Open Grafana
        </Button>
      </div>

      <MetricsChart />
    </div>
  );
};
