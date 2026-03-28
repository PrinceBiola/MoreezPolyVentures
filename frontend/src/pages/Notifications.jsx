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
      case 'error': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'success': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-slate-500 bg-slate-50 border-slate-100';
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
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Notifications</h2>
          <p className="text-slate-400 font-bold text-[11px] tracking-tight uppercase mt-2">Manage system alerts and operational history.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="neutral" icon={CheckCircle2} onClick={markAllRead}>Mark All Read</Button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        {['all', 'unread'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`pb-3 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${
              filter === f ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {f === 'all' ? 'All Alerts' : 'Unread Only'}
            {filter === f && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 rounded-full"></div>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        {loading ? (
          <div className="flex-1 flex items-center justify-center font-black text-slate-400 italic"><Loader size="lg" /></div>
        ) : filteredNotifs.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredNotifs.map(n => (
              <div key={n._id} className={`p-8 hover:bg-slate-50/50 transition-all flex gap-6 group items-start ${!n.isRead ? 'bg-emerald-50/5' : ''}`}>
                <div className={`w-12 h-12 rounded-md flex items-center justify-center border shrink-0 ${getStatusColor(n.type)}`}>
                   {getIcon(n.category)}
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{n.category}</span>
                      <span className="text-slate-200 opacity-50">•</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 opacity-60">
                         <Clock className="w-3 h-3" /> {new Date(n.createdAt).toLocaleString()}
                      </span>
                      {!n.isRead && <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-sm shadow-emerald-500/50"></span>}
                   </div>
                   <h4 className="text-[15px] font-black text-slate-900 tracking-tight uppercase mb-1">{n.title}</h4>
                   <p className="text-[13px] text-slate-500 font-bold leading-relaxed">{n.message}</p>
                </div>
                <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   {!n.isRead && (
                     <button onClick={() => markAsRead(n._id)} className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:translate-x-1 transition-transform">
                        Acknowledge <CheckCircle2 className="w-3.5 h-3.5" />
                     </button>
                   )}
                   <button onClick={() => deleteNotification(n._id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                <Bell className="w-8 h-8 opacity-20" />
             </div>
             <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Inbox Zero</p>
             <p className="text-[11px] text-slate-400 font-bold mt-2 uppercase">No pending alerts to display.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
