import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Package, 
  AlertTriangle, 
  XCircle, 
  Search, 
  Filter, 
  Download, 
  ArrowRight, 
  ExternalLink,
  RefreshCw,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Box,
  Truck,
  Shield
} from 'lucide-react';
import { businessService } from '../services/businessService';
import { toast } from 'react-hot-toast';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await businessService.getProducts();
      setProducts(res.data);
    } catch (err) {
      toast.error('Failed to sync inventory');
    } finally {
      setLoading(false);
    }
  };

  // Analytics logic
  const totalProducts = products.length;
  const lowStockItems = products.filter(p => p.currentStock > 0 && p.currentStock <= (p.reorderLevel || 10));
  const outOfStockItems = products.filter(p => p.currentStock === 0);
  const criticalItems = products.filter(p => p.currentStock <= (p.reorderLevel || 10)).sort((a,b) => a.currentStock - b.currentStock);

  const handleRepairStock = async () => {
    if (!window.confirm('CRITICAL: This will recalculate all stock levels from transaction history. Proceed?')) return;
    setLoading(true);
    try {
      await businessService.repairStock();
      toast.success('Inventory Ledger Synchronized');
      fetchProducts();
    } catch (err) {
      toast.error('Audit failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader size="xl" /></div>;

  return (
    <div className="space-y-8 animate-fade-in text-left pb-10">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Inventory Overview</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Stock Levels & Tracking</p>
        </div>
        <div className="text-right">
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Last Global Sync</p>
           <p className="text-xs font-black text-slate-900 mt-1 uppercase">{new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InventoryStatCard 
          label="Total Products" 
          value={totalProducts.toLocaleString()} 
          trend="+12% vs last month" 
          isUp={true} 
          borderColor="border-slate-200"
        />
        <InventoryStatCard 
          label="Low Stock Items" 
          value={lowStockItems.length.toString().padStart(2, '0')} 
          subtext="Immediate action recommended"
          borderColor="border-amber-400"
          icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
          bg="bg-amber-50/30"
        />
        <InventoryStatCard 
          label="Out of Stock" 
          value={outOfStockItems.length.toString().padStart(2, '0')} 
          subtext="Unfulfilled line items"
          borderColor="border-rose-500"
          icon={<XCircle className="w-5 h-5 text-rose-500" />}
          bg="bg-rose-50/30"
          isCritical={true}
        />
      </div>

      {/* Product Ledger */}
      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="text-lg font-black text-slate-900 tracking-tighter uppercase">Product Ledger</h3>
          <div className="flex w-full md:w-auto gap-3">
             <button onClick={handleRepairStock} className="px-4 py-2 bg-amber-50 text-amber-600 border border-amber-200 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-amber-100 transition-all flex items-center gap-2">
                <ShieldCheck className="w-3 h-3" /> Repair Ledger
             </button>
             <button className="px-4 py-2 bg-slate-50 text-slate-600 border border-slate-100 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all">Export CSV</button>
             <button className="px-4 py-2 bg-slate-50 text-slate-600 border border-slate-100 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2">
                <Filter className="w-3 h-3" /> Filter
             </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/30">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Description / Item</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Grade</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none text-center">Opening Bal (bags)</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none text-center">Current Stock (bags)</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none text-center">(kg) Conversion</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none text-center">Reorder Lvl (bags)</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.map((p) => {
                const isOut = p.currentStock === 0;
                const isLow = p.currentStock <= (p.reorderLevel || 5);
                return (
                  <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <p className="text-[13px] font-black text-slate-900 leading-tight uppercase">{p.name}</p>
                      <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-tighter line-clamp-1">{p.description || 'No detailed memo'}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md text-slate-500">{p.grade || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <p className="text-[13px] font-bold text-slate-400 tabular-nums">{p.openingBal || 0}</p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <p className={`text-[14px] font-black ${isOut ? 'text-rose-500' : isLow ? 'text-amber-500' : 'text-emerald-600'} tabular-nums`}>
                        {p.currentStock || 0}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{p.weightKg || 1}kg / bag</p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <p className="text-[13px] font-bold text-slate-400 tabular-nums">{p.reorderLevel || 5}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-widest border ${
                        isOut ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                        isLow ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                        'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {isOut ? 'Out of Stock' : isLow ? 'Reorder' : 'In Stock'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-6 bg-slate-50/30 border-t border-slate-50 flex justify-between items-center mt-auto">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">Showing {products.length} of {products.length} entries</p>
           <div className="flex gap-2">
              <button className="p-2 border border-slate-200 rounded-md text-slate-300 hover:text-slate-900 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <button className="w-8 h-8 bg-emerald-700 text-white rounded-md text-[10px] font-black">1</button>
              <button className="w-8 h-8 border border-slate-200 rounded-md text-[10px] font-black text-slate-400">2</button>
              <button className="w-8 h-8 border border-slate-200 rounded-md text-[10px] font-black text-slate-400">3</button>
              <button className="p-2 border border-slate-200 rounded-md text-slate-300 hover:text-slate-900 transition-colors"><ChevronRight className="w-4 h-4" /></button>
           </div>
        </div>
      </div>

      {/* Critical Stock Alerts Section */}
      <div className="pt-4">
        <div className="flex items-center gap-3 mb-6">
           <div className="p-2 bg-amber-50 text-amber-600 rounded-md border border-amber-100">
              <AlertTriangle className="w-5 h-5" />
           </div>
           <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Critical Stock Alerts</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {criticalItems.length > 0 ? (
            criticalItems.slice(0, 3).map((p) => {
              const isOut = p.currentStock === 0;
              const progress = Math.min(((p.currentStock / (p.reorderLevel || 10)) * 100), 100);
              return (
                <div key={p._id} className="bg-white border border-slate-200 rounded-md p-6 shadow-sm relative overflow-hidden flex flex-col transition-all hover:border-slate-300">
                   <div className={`absolute top-0 left-0 w-1 h-full ${isOut ? 'bg-rose-500' : 'bg-amber-400'}`}></div>
                   
                   <div className="flex justify-between items-start mb-6">
                      <div className="max-w-[80%]">
                         <h4 className="text-sm font-black text-slate-900 leading-tight uppercase tracking-tight">{p.name}</h4>
                         <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-widest">SKU-{p._id.slice(-6).toUpperCase()}</p>
                      </div>
                      {isOut ? (
                         <div className="w-6 h-6 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center border border-rose-100">
                            <AlertTriangle className="w-3.5 h-3.5" />
                         </div>
                      ) : (
                         <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest group">!</div>
                      )}
                   </div>

                   <div className={`p-4 rounded-md mb-6 ${isOut ? 'bg-rose-50/50 border border-rose-100' : 'bg-amber-50/50 border border-amber-100'}`}>
                      <div className="flex justify-between items-end mb-2">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Current Status: {isOut ? 'DEPLETED' : 'LOW'}</p>
                         <p className="text-[11px] font-black text-slate-900 leading-none">{p.currentStock}/{p.reorderLevel || 10}</p>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                         <div 
                           className={`h-full transition-all duration-1000 ${isOut ? 'w-0' : 'bg-amber-400'}`}
                           style={{ width: `${isOut ? 5 : progress}%` }} 
                         ></div>
                      </div>
                   </div>

                   <div className="mt-auto flex justify-between items-center pt-2">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{isOut ? 'Depleted 48h ago' : 'Last restock 12 days ago'}</p>
                      <button className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.15em] hover:underline flex items-center gap-1.5">View Vendor</button>
                   </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-16 border-2 border-dashed border-slate-100 rounded-md flex flex-col items-center justify-center bg-slate-50/10">
               <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4 border border-emerald-100/50">
                  <ShieldCheck className="w-7 h-7" />
               </div>
               <h4 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Inventory Levels Good</h4>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mt-2 opacity-60">No items are currently below reorder levels.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InventoryStatCard = ({ label, value, trend, isUp, subtext, borderColor, icon, bg, isCritical }) => (
  <div className={`bg-white border-l-4 ${borderColor} border-t border-r border-b border-slate-200 rounded-md p-6 shadow-sm ${bg || ''} transition-all hover:translate-y-[-2px]`}>
    <div className="flex justify-between items-start mb-4">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      {icon}
    </div>
    <div className="flex items-baseline gap-3 mb-2">
       <p className={`text-4xl font-black tracking-tighter ${isCritical ? 'text-rose-500' : 'text-slate-900'}`}>{value}</p>
       {trend && (
         <p className={`text-[10px] font-black flex items-center gap-1 ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
           <TrendingUp className="w-3 h-3" /> {trend}
         </p>
       )}
    </div>
    {subtext && <p className={`text-[10px] font-black uppercase tracking-wide opacity-50 ${isCritical ? 'text-rose-400' : 'text-amber-500'}`}>{subtext}</p>}
  </div>
);

export default Inventory;
