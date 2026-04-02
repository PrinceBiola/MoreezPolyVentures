import React from 'react';
import { 
  X, 
  LayoutDashboard, 
  Briefcase, 
  Package, 
  Truck, 
  PieChart, 
  Settings,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

const HelpModal = ({ onClose }) => {
  const sections = [
    {
      title: 'Dashboard Overview',
      icon: <LayoutDashboard className="w-5 h-5 text-primary" />,
      content: 'The central hub for real-time monitoring. View total revenue, expenses, and net profit at a glance. The visualization charts show performance trends for the selected period.'
    },
    {
      title: 'Business & Sales Management',
      icon: <Briefcase className="w-5 h-5 text-primary" />,
      content: 'Manage your product catalog and record sales transactions. Use the Sales module to track customer orders, quantities sold, and total invoice amounts.'
    },
    {
      title: 'Inventory Control',
      icon: <Package className="w-5 h-5 text-secondary" />,
      content: 'Track stock levels across all products. Set reorder points to receive notifications when stock is low. Monitor opening balances versus current stock availability.'
    },
    {
      title: 'Transport & Fleet Logistics',
      icon: <Truck className="w-5 h-5 text-primary" />,
      content: 'Complete oversight of your fleet. Manage vehicles and drivers, record transport-related income (Driver Sales), and track operational expenses per vehicle.'
    },
    {
      title: 'Reporting & Analytics',
      icon: <PieChart className="w-5 h-5 text-secondary" />,
      content: 'Generate and export detailed reports in CSV format. Choose from Expenses, Driver Sales, Inventory, and Purchase reports for deep financial audits.'
    },
    {
      title: 'System Settings',
      icon: <Settings className="w-5 h-5 text-text-muted opacity-40" />,
      content: 'Configure your company profile, managing administrative details, and system preferences to tailor the platform to your operational needs.'
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-accent/60 backdrop-blur-sm animate-in fade-in transition-all text-left">
      <div 
        className="bg-white w-full max-w-4xl max-h-[85vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-8 border-b border-border-light flex justify-between items-center bg-neutral/50">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
               <HelpCircle className="w-6 h-6" />
            </div>
            <div className="text-left">
               <h2 className="text-2xl font-black text-text-main tracking-tighter uppercase leading-none">System Help & Documentation</h2>
               <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-2">Operational Protocol // Version 4.8.2</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-neutral rounded-xl transition-all text-text-muted hover:text-text-main"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            {sections.map((section, index) => (
              <div key={index} className="flex gap-6 group hover:bg-neutral/50 p-4 rounded-2xl transition-all border border-transparent hover:border-border-light text-left">
                <div className="shrink-0">
                  <div className="w-12 h-12 bg-white border border-border-light rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    {section.icon}
                  </div>
                </div>
                <div className="text-left">
                  <h3 className="text-[12px] font-black text-text-main uppercase tracking-widest mb-3">{section.title}</h3>
                  <p className="text-sm text-text-muted font-medium leading-relaxed opacity-70">
                    {section.content}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Notice */}
          <div className="mt-12 bg-accent rounded-2xl p-8 flex items-center gap-6 relative overflow-hidden text-left">
             <div className="absolute -right-10 -bottom-10 text-[100px] font-black text-white/[0.03] select-none pointer-events-none">
                MM
             </div>
             <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center text-white shrink-0 shadow-lg shadow-secondary/20">
                <AlertCircle className="w-6 h-6" />
             </div>
             <div className="text-left">
                <p className="text-white text-sm font-bold tracking-tight">Need technical assistance?</p>
                <p className="text-text-muted text-xs font-medium mt-1 uppercase tracking-widest leading-relaxed opacity-60">Contact your system administrator for account permissions and security adjustments.</p>
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border-light bg-neutral/30 flex justify-center">
           <button 
              onClick={onClose}
              className="px-12 py-3 bg-accent text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-accent/20"
           >
              Dismiss
           </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
