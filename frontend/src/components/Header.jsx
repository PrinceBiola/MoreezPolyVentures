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
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-4 px-8 bg-white border-b border-border-light z-50 transition-all duration-500 animate-in fade-in slide-in-from-top-4 relative text-left">
      {/* Search Console */}
      <div className="relative group max-w-md w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted opacity-40 group-focus-within:text-primary transition-colors" />
        <input 
          type="text" 
          placeholder="Search industrial ledger..." 
          className="w-full bg-neutral border border-border-light rounded-xl py-2.5 pl-11 pr-4 text-sm font-bold text-text-main focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-text-muted/40 shadow-sm text-left"
        />
      </div>

      {/* Control Actions */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-text-muted">
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`hover:text-primary transition-all p-2 rounded-lg relative ${showNotifications ? 'bg-primary/10 text-primary' : ''}`}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-secondary border-2 border-white rounded-full flex items-center justify-center text-[8px] font-black text-white">
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
            className="hover:text-primary transition-colors p-1"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center gap-3 pl-6 border-l border-border-light group cursor-pointer relative text-left">
          <div className="w-9 h-9 bg-neutral rounded-xl flex items-center justify-center text-text-muted opacity-60 group-hover:bg-primary/10 group-hover:text-primary group-hover:opacity-100 transition-all border border-transparent group-hover:border-primary/20">
             <User className="w-5 h-5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-black text-text-main uppercase tracking-tighter leading-none group-hover:text-primary transition-colors">{user?.name || 'Account'}</span>
            <span className="text-[8px] font-bold text-text-muted uppercase tracking-widest mt-1 flex items-center gap-1">
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
