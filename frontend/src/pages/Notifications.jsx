import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  ShieldCheck, 
  AlertCircle, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Trash, 
  ChevronRight,
  Package,
  TrendingDown,
  Wrench,
  AlertTriangle,
  Info
} from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';

const Notifications = () => {
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      setNotifications(res.data);
    } catch (err) {
      toast.error('Alert sync failed');
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success('Omnichannel clear');
    } catch (err) {
      toast.error('Clearing failed');
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(notifications.filter(n => n._id !== id));
      toast.success('Alert removed');
    } catch (err) {
      toast.error('Deletion failed');
    }
  };

  const filteredNotifs = filter === 'all' 
    ? notifications 
    : notifications.filter(n => filter === 'unread' ? !n.isRead : n.isRead);

  const getStatusColor = (type) => {
    switch (type) {
      case 'error': return 'text-secondary bg-secondary/10 border-secondary/20';
      case 'success': return 'text-primary bg-primary/10 border-primary/20';
      case 'warning': return 'text-secondary bg-secondary/10 border-secondary/20';
      default: return 'text-text-muted bg-neutral border-border-light';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'inventory': return <Package className="w-4 h-4" />;
      case 'transport': return <Wrench className="w-4 h-4" />;
      case 'finance': return <ShieldCheck className="w-4 h-4" />;
      case 'maintenance': return <AlertTriangle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left pb-10 italic">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="text-left">
          <h2 className="text-2xl md:text-3xl font-black text-text-main tracking-tighter uppercase leading-none">Notifications</h2>
          <p className="text-text-muted font-bold text-[9px] md:text-[11px] tracking-tight uppercase mt-2">Manage system alerts and operational history.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="neutral" icon={CheckCircle2} onClick={markAllRead} className="w-full md:w-auto text-[10px] md:text-[11px]">Mark All Read</Button>
        </div>
      </div>

      <div className="flex gap-6 border-b border-border-light text-left overflow-x-auto no-scrollbar">
        {['all', 'unread'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`pb-3 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${
              filter === f ? 'text-primary' : 'text-text-muted hover:text-text-main'
            }`}
          >
            {f === 'all' ? 'All Alerts' : 'Unread Only'}
            {filter === f && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full"></div>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white border border-border-light rounded-md shadow-sm overflow-hidden flex flex-col min-h-[400px] text-left">
        {loading ? (
          <div className="flex-1 flex items-center justify-center font-black text-text-muted italic"><Loader size="lg" /></div>
        ) : filteredNotifs.length > 0 ? (
          <div className="divide-y divide-border-light">
            {filteredNotifs.map(n => (
              <div key={n._id} className={`p-4 md:p-8 hover:bg-neutral/50 transition-all flex flex-col sm:flex-row gap-4 md:gap-6 group items-start ${!n.isRead ? 'bg-primary/5' : ''}`}>
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-md flex items-center justify-center border shrink-0 ${getStatusColor(n.type)}`}>
                   {getIcon(n.category)}
                </div>
                <div className="flex-1 min-w-0 text-left">
                   <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-1.5">
                      <span className="text-[9px] md:text-[10px] font-black text-text-muted uppercase tracking-widest">{n.category}</span>
                      <span className="hidden md:inline text-neutral opacity-50">•</span>
                      <span className="text-[9px] md:text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5 opacity-60">
                         <Clock className="w-3 h-3" /> {new Date(n.createdAt).toLocaleString()}
                      </span>
                      {!n.isRead && <span className="w-2 h-2 bg-primary rounded-full shadow-sm shadow-primary/50"></span>}
                   </div>
                   <h4 className="text-sm md:text-[15px] font-black text-text-main tracking-tight uppercase mb-1">{n.title}</h4>
                   <p className="text-xs md:text-[13px] text-text-muted font-bold leading-relaxed">{n.message}</p>
                   
                   <div className="mt-4 flex sm:hidden items-center gap-4">
                      {!n.isRead && (
                        <button onClick={() => markAsRead(n._id)} className="text-[10px] font-black text-primary uppercase tracking-widest">
                           Mark as Read
                        </button>
                      )}
                      <button onClick={() => deleteNotification(n._id)} className="text-[10px] font-black text-secondary uppercase tracking-widest">
                         Delete
                      </button>
                   </div>
                </div>
                <div className="hidden sm:flex items-center justify-end gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   {!n.isRead && (
                     <button onClick={() => markAsRead(n._id)} className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-widest hover:translate-x-1 transition-transform">
                        Acknowledge <CheckCircle2 className="w-3.5 h-3.5" />
                     </button>
                   )}
                   <button onClick={() => deleteNotification(n._id)} className="p-2 text-text-muted opacity-40 hover:opacity-100 hover:text-secondary transition-all">
                      <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 bg-neutral rounded-full flex items-center justify-center text-text-muted mb-6">
                <Bell className="w-8 h-8 opacity-20" />
             </div>
             <p className="text-sm font-black text-text-muted uppercase tracking-widest">Inbox Zero</p>
             <p className="text-[11px] text-text-muted font-bold mt-2 uppercase">No pending alerts to display.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
