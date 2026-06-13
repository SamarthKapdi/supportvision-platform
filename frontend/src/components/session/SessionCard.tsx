import React from 'react';
import { Calendar, Clock, Users, ChevronRight } from 'lucide-react';
import { Session, SessionStatus } from '../../types';
import { Badge } from '../common/Badge';
import { formatDate, formatDuration } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

interface Props {
  session: Session;
}

export const SessionCard: React.FC<Props> = ({ session }) => {
  const navigate = useNavigate();

  const getStatusBadge = (status: SessionStatus) => {
    switch (status) {
      case SessionStatus.ACTIVE: return <Badge variant="success">Active</Badge>;
      case SessionStatus.WAITING: return <Badge variant="warning">Waiting</Badge>;
      case SessionStatus.COMPLETED: return <Badge variant="default">Completed</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const handleJoin = () => {
    navigate(ROUTES.ROOM.replace(':sessionId', session.id));
  };

  return (
    <div className="glass-card p-5 group hover:-translate-y-1 hover:shadow-primary-500/10 transition-all duration-300 cursor-pointer" onClick={handleJoin}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-primary-400 transition-colors">{session.title}</h3>
          <p className="text-xs text-slate-400">ID: {session.id.substring(0, 8)}...</p>
        </div>
        {getStatusBadge(session.status)}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5 text-sm text-slate-300">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-slate-500" />
          <span>{formatDate(session.createdAt).split(' ')[0]}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-slate-500" />
          <span>{session.status === SessionStatus.ACTIVE ? 'Ongoing' : '00:00'}</span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-700/50 pt-4">
        <div className="flex -space-x-2">
          <div className="w-8 h-8 rounded-full bg-primary-500 border-2 border-slate-800 flex items-center justify-center text-xs font-bold text-white z-10">A</div>
          {session.customerId && (
            <div className="w-8 h-8 rounded-full bg-secondary-500 border-2 border-slate-800 flex items-center justify-center text-xs font-bold text-white z-0">C</div>
          )}
        </div>
        <button className="text-primary-400 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
          Join <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
