import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  X, 
  Clock, 
  ChevronRight,
  Package,
  Wrench,
  ShieldCheck,
  Info
} from 'lucide-react';

const NotificationModal = ({ notifications, onClose, onMarkAsRead }) => {
  const getIcon = (category) => {
    switch (category) {
      case 'inventory': return <Package className="w-4 h-4 text-secondary" />;
      case 'transport': return <Wrench className="w-4 h-4 text-primary" />;
      case 'finance': return <ShieldCheck className="w-4 h-4 text-primary" />;
      default: return <Info className="w-4 h-4 text-text-muted opacity-40" />;
    }
  };

  return (
    <div className="absolute right-0 mt-3 w-80 bg-white border border-border-light rounded-md shadow-2xl z-[100] animate-in slide-in-from-top-2 duration-200 text-left">
      <div className="p-4 border-b border-border-light flex justify-between items-center bg-neutral/30">
        <h4 className="text-[10px] font-black text-text-main uppercase tracking-widest flex items-center gap-2">
          <Bell className="w-3.5 h-3.5" /> Recent Alerts
        </h4>
        <button onClick={onClose} className="p-1 hover:bg-neutral rounded-md text-text-muted">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto divide-y divide-neutral italic">
        {notifications.length > 0 ? (
          notifications.slice(0, 5).map((n) => (
            <div 
              key={n._id} 
              className={`p-4 hover:bg-neutral/50 transition-colors cursor-pointer group relative text-left ${!n.isRead ? 'bg-primary/5' : ''}`}
              onClick={() => {
                onMarkAsRead(n._id);
                onClose();
              }}
            >
              <div className="flex gap-3 text-left">
                <div className="mt-0.5">{getIcon(n.category)}</div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-[11px] font-black text-text-main uppercase tracking-tight line-clamp-1">{n.title}</p>
                  <p className="text-[10px] text-text-muted font-bold mt-0.5 line-clamp-2">{n.message}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="w-2.5 h-2.5 text-text-muted opacity-30" />
                    <span className="text-[8px] font-black text-text-muted opacity-40 uppercase tracking-widest">
                       {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                {!n.isRead && <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1"></div>}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-text-muted opacity-40">
            <Bell className="w-6 h-6 mx-auto mb-2 opacity-20" />
            <p className="text-[9px] font-black uppercase tracking-widest leading-none">No Alerts</p>
          </div>
        )}
      </div>

      <Link 
        to="/notifications" 
        onClick={onClose}
        className="p-3 bg-neutral flex items-center justify-center gap-1.5 border-t border-border-light text-[10px] font-black text-primary uppercase tracking-widest hover:bg-primary/10 transition-all rounded-b-md text-left"
      >
        View All Registry <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
};

export default NotificationModal;
