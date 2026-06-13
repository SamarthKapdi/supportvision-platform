import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { User } from '../../types';
import { getInitials } from '../../utils/helpers';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  user: User | null;
}

export const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen, user }) => {
  return (
    <header className="h-16 glass z-10 flex items-center justify-between px-4 sm:px-6 shadow-sm border-b border-slate-700/50 sticky top-0">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/50 transition-colors"
        >
          <Menu size={20} />
        </button>
        
        <div className="hidden md:flex relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-64 pl-10 pr-3 py-2 border border-slate-700 rounded-lg leading-5 bg-slate-800/50 text-slate-300 placeholder-slate-400 focus:outline-none focus:bg-slate-800 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all"
            placeholder="Search..."
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800/50 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-rose-500 ring-2 ring-background-900" />
        </button>
        
        <div className="flex items-center gap-3 border-l border-slate-700/50 pl-4 ml-2">
          <div className="flex flex-col items-end hidden sm:block">
            <span className="text-sm font-medium text-white">{user?.firstName} {user?.lastName}</span>
            <span className="text-xs text-slate-400 capitalize">{user?.role}</span>
          </div>
          <div className="h-9 w-9 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold text-sm shadow-md border-2 border-slate-800">
            {getInitials(user?.firstName + ' ' + user?.lastName)}
          </div>
        </div>
      </div>
    </header>
  );
};
