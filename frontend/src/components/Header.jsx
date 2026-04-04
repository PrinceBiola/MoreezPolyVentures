import React, { useState, useRef, useEffect } from 'react';
import { Search, HelpCircle, User, Bell, ChevronDown, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationModal from './NotificationModal';
import HelpModal from './HelpModal';
import { notificationService } from '../services/notificationService';

const Header = ({ toggleSidebar, isSidebarOpen }) => {
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
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 px-4 md:px-8 bg-white border-b border-border-light z-50 transition-all duration-300 relative text-left">
      {/* Search & Menu Toggle */}
      <div className="flex items-center gap-4 w-full sm:max-w-md">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 hover:bg-neutral rounded-lg text-text-muted transition-colors"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        
        <div className="relative group flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted opacity-40 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search ledger..." 
            className="w-full bg-neutral border border-border-light rounded-xl py-2 px-11 text-xs font-bold text-text-main focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-text-muted/40 shadow-sm"
          />
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-4 md:gap-6 border-t sm:border-t-0 border-border-light pt-3 sm:pt-0">
        <div className="flex items-center gap-2 md:gap-4 text-text-muted">
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`hover:text-primary transition-all p-2 rounded-lg relative ${showNotifications ? 'bg-primary/10 text-primary' : ''}`}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-secondary border-2 border-white rounded-full flex items-center justify-center text-[7px] font-black text-white">
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
        
        <div className="flex items-center gap-2 md:gap-3 pl-4 md:pl-6 border-l border-border-light group cursor-pointer relative text-left">
          <div className="w-8 h-8 md:w-9 md:h-9 bg-neutral rounded-lg md:rounded-xl flex items-center justify-center text-text-muted opacity-60 group-hover:bg-primary/10 group-hover:text-primary transition-all">
             <User className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] md:text-[11px] font-black text-text-main uppercase tracking-tighter leading-none">{user?.name?.split(' ')[0] || 'User'}</span>
            <span className="text-[7px] md:text-[8px] font-bold text-text-muted uppercase tracking-widest mt-1 flex items-center gap-1">
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
