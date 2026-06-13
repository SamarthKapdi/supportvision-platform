import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, PlayCircle, Film } from 'lucide-react';
import { recordingApi } from '../../services/api';
import { formatFileSize, formatDuration, formatDate } from '../../utils/helpers';
import { Badge } from '../common/Badge';

export const RecordingLibrary: React.FC = () => {
  const { data: recordings, isLoading } = useQuery({
    queryKey: ['adminRecordings'],
    queryFn: () => recordingApi.getAdminRecordings().then(res => res.data),
  });

  if (isLoading) return <div className="p-8 text-center text-slate-400">Loading library...</div>;

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-6 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/20">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Film size={20} className="text-primary-500" />
          Recording Library
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {recordings?.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            No recordings found.
          </div>
        ) : (
          recordings?.map(rec => (
            <div key={rec.id} className="border border-slate-700/50 rounded-xl overflow-hidden bg-slate-800/30 group hover:border-slate-600 transition-colors">
              <div className="h-32 bg-slate-900 relative flex items-center justify-center">
                <PlayCircle size={40} className="text-white/50 group-hover:text-primary-400 group-hover:scale-110 transition-all cursor-pointer" />
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-xs text-white font-mono">
                  {formatDuration(rec.duration)}
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-white truncate pr-2">Session: {rec.sessionId.substring(0,8)}</h4>
                  <Badge variant={rec.status === 'completed' ? 'success' : 'warning'}>{rec.status}</Badge>
                </div>
                <div className="text-xs text-slate-400 space-y-1 mb-4">
                  <p>{formatDate(rec.createdAt)}</p>
                  <p>{formatFileSize(rec.sizeBytes)}</p>
                </div>
                <a 
                  href={rec.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 bg-slate-700/50 hover:bg-slate-700 text-sm font-medium text-white rounded-lg transition-colors"
                >
                  <Download size={16} /> Download
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
