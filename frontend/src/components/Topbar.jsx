import React from 'react';
import { Bell, User, Calendar, Search } from 'lucide-react';

const Topbar = ({ title }) => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h2>
        <div className="h-6 w-px bg-gray-200 mx-2" />
        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 uppercase tracking-tighter">
          <Calendar className="w-4 h-4" />
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative group hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search reports..." 
            className="bg-gray-50 border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all w-64"
          />
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
          
          <div className="h-8 w-px bg-gray-200 mx-2" />
          
          <button className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm group-hover:bg-primary group-hover:text-white transition-all">
              A
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-black text-gray-900 uppercase tracking-tighter leading-none">Admin</p>
              <p className="text-[10px] text-gray-500 font-medium">Owner</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
