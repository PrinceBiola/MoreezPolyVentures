import React, { useState, useRef, useEffect } from 'react';
import { Search, HelpCircle, User, Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationModal from './NotificationModal';
import HelpModal from './HelpModal';
import { notificationService } from '../services/notificationService';

const Header = () => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notificationRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      setNotifications(res.data);
    } catch (err) {
      console.error('Notification sync failed');
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Action failed');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-4 px-8 bg-white border-b border-slate-100 z-50 transition-all duration-500 animate-in fade-in slide-in-from-top-4 relative">
      {/* Search Console */}
      <div className="relative group max-w-md w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
        <input 
          type="text" 
          placeholder="Search industrial ledger..." 
          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300 shadow-sm"
        />
      </div>

      {/* Control Actions */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-slate-400">
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`hover:text-emerald-600 transition-all p-2 rounded-lg relative ${showNotifications ? 'bg-emerald-50 text-emerald-600' : ''}`}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-rose-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] font-black text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </button>
            {showNotifications && (
              <NotificationModal 
                notifications={notifications} 
                onClose={() => setShowNotifications(false)} 
                onMarkAsRead={markAsRead}
              />
            )}
          </div>
          <button 
            onClick={() => setShowHelp(true)}
            className="hover:text-emerald-600 transition-colors p-1"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center gap-3 pl-6 border-l border-slate-200 group cursor-pointer relative">
          <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all border border-transparent group-hover:border-emerald-100">
             <User className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-slate-900 uppercase tracking-tighter leading-none group-hover:text-emerald-600 transition-colors">{user?.name || 'Account'}</span>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1">
              {user?.role || 'Operator'} <ChevronDown className="w-2.5 h-2.5 opacity-40" />
            </span>
          </div>
        </div>
      </div>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </header>
  );
};

export default Header;
