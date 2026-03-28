import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  BarChart3, 
  Bell, 
  Settings, 
  LogOut,
  User,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  ShoppingBag,
  ShoppingCart,
  ClipboardList,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [view, setView] = useState('main'); // 'main', 'business', 'transport'

  // Auto-switch view based on current path on mount/reload
  useEffect(() => {
    const path = location.pathname;
    if (['/business', '/purchases', '/sales', '/inventory'].some(p => path.startsWith(p))) {
      setView('business');
    } else if (['/transport', '/payments', '/expenses'].some(p => path.startsWith(p))) {
      setView('transport');
    } else {
      setView('main');
    }
  }, [location.pathname]);

  const menus = {
    main: [
      { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', type: 'link', path: '/dashboard' },
      { id: 'business_view', icon: Package, label: 'Business', type: 'menu' },
      { id: 'transport_view', icon: Truck, label: 'Transport', type: 'menu' },
      { id: 'reports', icon: BarChart3, label: 'Reports', type: 'link', path: '/reports' },
    ],
    business: [
      { id: 'business', icon: Package, label: 'Products', path: '/business' },
      { id: 'purchases', icon: ShoppingBag, label: 'Purchases', path: '/purchases' },
      { id: 'sales', icon: ShoppingCart, label: 'Sales', path: '/sales' },
      { id: 'inventory', icon: ClipboardList, label: 'Inventory', path: '/inventory' },
    ],
    transport: [
      { id: 'transport', icon: Truck, label: 'Vehicles', path: '/transport' },
      { id: 'payments', icon: CreditCard, label: 'Driver Payments', path: '/payments' },
      { id: 'expenses', icon: ShieldCheck, label: 'Expenses', path: '/expenses' },
    ]
  };

  const renderMenuItems = () => {
    if (view === 'main') {
      return (
        <div className="space-y-1">
          <h3 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 opacity-50">Main Navigation</h3>
          {menus.main.map((item) => (
            item.type === 'menu' ? (
              <button
                key={item.id}
                onClick={() => setView(item.id.replace('_view', ''))}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all duration-300 group"
              >
                <item.icon className="w-4 h-4 text-slate-400 group-hover:text-slate-900" />
                <span className="font-black text-[11px] uppercase tracking-widest">{item.label}</span>
                <ChevronRight className="ml-auto w-3.5 h-3.5 text-slate-300 group-hover:text-slate-900 transition-transform" />
              </button>
            ) : (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => `
                  w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-300 group
                  ${isActive ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                `}
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-900'}`} />
                    <span className="font-black text-[11px] uppercase tracking-widest">{item.label}</span>
                  </>
                )}
              </NavLink>
            )
          ))}
        </div>
      );
    }

    const subMenuItems = menus[view];
    const viewTitle = view.charAt(0).toUpperCase() + view.slice(1);

    return (
      <div className="space-y-1">
        <button 
          onClick={() => setView('main')}
          className="flex items-center gap-2 px-4 py-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700 transition-colors mb-4"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Main
        </button>
        <h3 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 opacity-50">{viewTitle} Hub</h3>
        {subMenuItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) => `
              w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-300 group
              ${isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
            `}
          >
             {({ isActive }) => (
                <>
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-900'}`} />
                  <span className="font-black text-[11px] uppercase tracking-widest">{item.label}</span>
                </>
             )}
          </NavLink>
        ))}
      </div>
    );
  };

  return (
    <div className="w-64 h-screen bg-white flex flex-col sticky top-0 overflow-hidden border-r border-slate-200 shadow-sm">
      {/* Brand Header */}
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-md flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <ShieldCheck className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 leading-none tracking-tighter uppercase">Moreez Manager</h1>
            <p className="text-[7px] text-emerald-500 font-black tracking-[0.2em] uppercase mt-1.5">v4.0 Standard</p>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-100/80 mb-6"></div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-8 overflow-y-auto no-scrollbar">
        {renderMenuItems()}
        
        {/* System Settings */}
        {view === 'main' && (
          <div className="pt-8 mt-8 border-t border-slate-100/50 space-y-1">
             <h3 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 opacity-50">System</h3>
             <NavLink to="/notifications" className={({ isActive }) => `
                w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all font-black text-[11px] uppercase tracking-widest group
                ${isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
             `}>
                {({ isActive }) => (
                  <>
                    <Bell className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-900'}`} />
                    <span>Notifications</span>
                    {isActive && <div className="ml-auto w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-sm shadow-emerald-500/50"></div>}
                  </>
                )}
             </NavLink>
             <NavLink to="/settings" className={({ isActive }) => `
                w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all font-black text-[11px] uppercase tracking-widest group
                ${isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
             `}>
                {({ isActive }) => (
                  <>
                    <Settings className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-900'}`} />
                    <span>Settings</span>
                  </>
                )}
             </NavLink>
          </div>
        )}
      </nav>

      {/* User Footer */}
      {user && (
        <div className="p-6 border-t border-slate-200 bg-slate-50/30">
          <div className="flex items-center gap-4 px-4 py-3 bg-white border border-slate-200 rounded-md shadow-sm mb-4">
            <div className="w-9 h-9 bg-emerald-50 rounded-md flex items-center justify-center text-emerald-600 border border-emerald-100">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-[10px] font-black text-slate-900 uppercase truncate leading-none">{user.name}</p>
               <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 truncate">{user.role || 'Fleet Operator'}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 px-4 py-2 text-slate-400 hover:text-rose-500 font-black text-[9px] uppercase tracking-widest transition-all group"
          >
            <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
