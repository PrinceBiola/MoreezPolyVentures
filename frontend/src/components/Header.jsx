import React, { useState, useRef, useEffect } from 'react';
import { Search, HelpCircle, User, Bell, ChevronDown, Menu, X, Package, Truck, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationModal from './NotificationModal';
import HelpModal from './HelpModal';
import { notificationService } from '../services/notificationService';
import { dashboardService } from '../services/dashboardService';
import { useNavigate } from 'react-router-dom';

const Header = ({ toggleSidebar, isSidebarOpen }) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notificationRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

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
    if (searchQuery.trim().length < 2) {
      setSearchResults(null);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await dashboardService.globalSearch(searchQuery);
        setSearchResults(res.data);
      } catch (err) {
        console.error('Search failed');
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults(null);
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
        
        <div className="relative group flex-1" ref={searchRef}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted opacity-40 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if (searchQuery.length >= 2) setSearchResults(searchResults || { products: [], vehicles: [], sales: [] }) }}
            placeholder="Search ledger..." 
            className="w-full bg-neutral border border-border-light rounded-xl py-2 px-11 text-xs font-bold text-text-main focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-text-muted/40 shadow-sm"
          />
          
          {searchResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border-light rounded-lg shadow-xl overflow-hidden z-50">
               {isSearching ? (
                 <div className="p-4 text-center text-[10px] uppercase font-black text-text-muted tracking-widest animate-pulse">Searching...</div>
               ) : (
                 <div className="max-h-96 overflow-y-auto no-scrollbar">
                    {/* Products */}
                    {searchResults.products?.length > 0 && (
                      <div className="border-b border-border-light">
                        <div className="px-4 py-2 bg-neutral/50 text-[9px] font-black uppercase text-text-muted tracking-widest flex items-center gap-2">
                           <Package className="w-3 h-3" /> Inventory Matrix
                        </div>
                        {searchResults.products.map(p => (
                          <div 
                            key={p._id} 
                            onClick={() => { navigate('/inventory'); setSearchResults(null); setSearchQuery(''); }}
                            className="px-4 py-3 hover:bg-neutral cursor-pointer transition-colors"
                          >
                            <p className="text-xs font-black text-text-main uppercase">{p.name}</p>
                            <p className="text-[10px] text-text-muted font-bold mt-0.5">{p.currentStock > 0 ? `${p.currentStock} units` : 'Out of stock'}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Vehicles */}
                    {searchResults.vehicles?.length > 0 && (
                      <div className="border-b border-border-light">
                        <div className="px-4 py-2 bg-neutral/50 text-[9px] font-black uppercase text-text-muted tracking-widest flex items-center gap-2">
                           <Truck className="w-3 h-3" /> Fleet
                        </div>
                        {searchResults.vehicles.map(v => (
                          <div 
                            key={v._id} 
                            onClick={() => { navigate(`/transport/${v._id}`); setSearchResults(null); setSearchQuery(''); }}
                            className="px-4 py-3 hover:bg-neutral cursor-pointer transition-colors"
                          >
                            <p className="text-xs font-black text-text-main uppercase">{v.plateNumber}</p>
                            <p className="text-[10px] text-text-muted font-bold mt-0.5">{v.driverName} • {v.status}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Sales */}
                    {searchResults.sales?.length > 0 && (
                      <div className="border-b border-border-light">
                        <div className="px-4 py-2 bg-neutral/50 text-[9px] font-black uppercase text-text-muted tracking-widest flex items-center gap-2">
                           <ShoppingCart className="w-3 h-3" /> Recent Sales
                        </div>
                        {searchResults.sales.map(s => (
                          <div 
                            key={s._id} 
                            onClick={() => { navigate('/sales'); setSearchResults(null); setSearchQuery(''); }}
                            className="px-4 py-3 hover:bg-neutral cursor-pointer transition-colors flex justify-between items-center"
                          >
                            <div>
                              <p className="text-xs font-black text-text-main uppercase">{s.customerName}</p>
                              <p className="text-[10px] text-text-muted font-bold mt-0.5">{new Date(s.date).toLocaleDateString()}</p>
                            </div>
                            <p className="text-xs font-black text-secondary">₦{s.totalAmount?.toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {(!searchResults.products?.length && !searchResults.vehicles?.length && !searchResults.sales?.length) && (
                      <div className="p-6 text-center text-[10px] uppercase font-black text-text-muted tracking-widest">No matching records found.</div>
                    )}
                 </div>
               )}
            </div>
          )}
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex items-center justify-end gap-3 md:gap-6 border-t sm:border-t-0 border-border-light pt-3 sm:pt-0 w-full sm:w-auto">
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
