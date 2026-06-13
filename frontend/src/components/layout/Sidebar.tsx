import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, History, Settings, Users, Video, BarChart3, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { Role } from '../../types';
import { ROUTES } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  role?: Role;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, role }) => {
  const { logout } = useAuth();

  const agentLinks = [
    { to: ROUTES.DASHBOARD, icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: ROUTES.HISTORY, icon: <History size={20} />, label: 'History' },
  ];

  const adminLinks = [
    { to: ROUTES.ADMIN, icon: <Video size={20} />, label: 'Live Sessions' },
    { to: ROUTES.METRICS, icon: <BarChart3 size={20} />, label: 'Metrics' },
    { to: '/admin/recordings', icon: <History size={20} />, label: 'Recordings' },
  ];

  const links = role === Role.ADMIN ? adminLinks : agentLinks;

  return (
    <div className={cn(
      "relative flex flex-col h-full glass-panel transition-all duration-300 ease-in-out border-r border-slate-700/50",
      isOpen ? "w-64" : "w-20"
    )}>
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-700/50">
        {isOpen ? (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 shadow-lg glow-hover">
              <Video className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">SupportVision</span>
          </div>
        ) : (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 shadow-lg">
            <Video className="h-5 w-5 text-white" />
          </div>
        )}
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 border border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700 z-10 transition-colors"
      >
        {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      <nav className="flex-1 space-y-2 py-6 px-3 overflow-y-auto overflow-x-hidden">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 group",
              isActive 
                ? "bg-primary-500/10 text-primary-400 border border-primary-500/20" 
                : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
            )}
          >
            <div className={cn(
              "flex-shrink-0 transition-transform duration-200",
              isOpen && "group-hover:scale-110"
            )}>
              {link.icon}
            </div>
            {isOpen && <span className="font-medium truncate">{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700/50">
        <button
          onClick={logout}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors",
            !isOpen && "justify-center"
          )}
        >
          <LogOut size={20} />
          {isOpen && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};
