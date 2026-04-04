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
  TrendingUp,
  Box,
  Truck,
  Shield,
  ShieldCheck
} from 'lucide-react';
import { businessService } from '../services/businessService';
import { toast } from 'react-hot-toast';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    grade: ''
  });

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

  // Sync logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(filters.search.toLowerCase());
    const matchesGrade = !filters.grade || p.grade === filters.grade;
    
    let matchesStatus = true;
    if (filters.status === 'low') {
      matchesStatus = p.currentStock > 0 && p.currentStock <= (p.reorderLevel || 10);
    } else if (filters.status === 'out') {
      matchesStatus = p.currentStock === 0;
    } else if (filters.status === 'in') {
      matchesStatus = p.currentStock > (p.reorderLevel || 10);
    }

    return matchesSearch && matchesGrade && matchesStatus;
  });

  const grades = [...new Set(products.map(p => p.grade).filter(Boolean))];

  // Analytics logic
  const totalProducts = products.length;
  const lowStockItems = products.filter(p => p.currentStock > 0 && p.currentStock <= (p.reorderLevel || 10));
  const outOfStockItems = products.filter(p => p.currentStock === 0);
  const criticalItems = products.filter(p => p.currentStock <= (p.reorderLevel || 10)).sort((a,b) => a.currentStock - b.currentStock);


  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader size="xl" /></div>;

  return (
    <div className="space-y-8 animate-fade-in text-left pb-10">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-text-main tracking-tighter uppercase leading-none">Inventory Overview</h2>
          <p className="text-[9px] md:text-[10px] text-text-muted font-bold uppercase tracking-widest mt-2 px-1 border-l-2 border-primary/20 ml-0.5">Stock Levels & Tracking Console</p>
        </div>
        <div className="text-left md:text-right border-l md:border-l-0 md:border-r border-border-light pl-4 md:pl-0 md:pr-4 py-1">
           <p className="text-[8px] md:text-[9px] font-black text-text-muted uppercase tracking-widest opacity-60">System Synchronized</p>
           <p className="text-[10px] md:text-xs font-black text-text-main mt-1 uppercase tracking-tight">{new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InventoryStatCard 
          label="Total Products" 
          value={totalProducts.toLocaleString()} 
          trend="+12% vs last month" 
          isUp={true} 
          borderColor="border-border-light"
        />
        <InventoryStatCard 
          label="Low Stock Items" 
          value={lowStockItems.length.toString().padStart(2, '0')} 
          subtext="Immediate action recommended"
          borderColor="border-secondary"
          icon={<AlertTriangle className="w-5 h-5 text-secondary" />}
          bg="bg-secondary/10"
        />
        <InventoryStatCard 
          label="Out of Stock" 
          value={outOfStockItems.length.toString().padStart(2, '0')} 
          subtext="Unfulfilled line items"
          borderColor="border-accent"
          icon={<XCircle className="w-5 h-5 text-accent" />}
          bg="bg-accent/10"
          isCritical={true}
        />
      </div>

      {/* Product Ledger */}
      <div className="bg-white border border-border-light rounded-md shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-4 md:p-6 border-b border-border-light flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-xl md:text-2xl font-black text-text-main tracking-tighter uppercase leading-none">Product Ledger</h3>
            <p className="text-[9px] md:text-[10px] text-text-muted font-bold uppercase tracking-widest mt-2 border-l-2 border-primary/20 pl-2">Inventory Management & Tracking</p>
          </div>
          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
             <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted opacity-40" />
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 bg-neutral border border-border-light rounded-xl text-xs font-bold focus:bg-white focus:border-primary outline-none transition-all" 
                />
             </div>
             <div className="flex gap-3 w-full sm:w-auto">
                 <Button 
                   variant={showFilters ? 'primary' : 'neutral'}
                   onClick={() => setShowFilters(!showFilters)}
                   icon={Filter}
                   className="flex-1 sm:flex-none"
                 >
                   Filters
                 </Button>
             </div>
          </div>
        </div>
        
        {showFilters && (
          <div className="px-4 md:px-6 py-4 border-b border-border-light bg-neutral/20 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in slide-in-from-top-2 duration-200">
             <div className="col-span-1">
                <label className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-2 block text-left">Status</label>
                <select 
                  value={filters.status} 
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-border-light rounded-md text-[11px] font-black focus:border-primary outline-none transition-all"
                >
                   <option value="all">All Levels</option>
                   <option value="in">In Stock</option>
                   <option value="low">Low Stock</option>
                   <option value="out">Out of Stock</option>
                </select>
             </div>
             <div className="col-span-1">
                <label className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-2 block text-left">Grade / Type</label>
                <select 
                  value={filters.grade} 
                  onChange={(e) => setFilters({...filters, grade: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-border-light rounded-md text-[11px] font-black focus:border-primary outline-none transition-all"
                >
                   <option value="">All Grades</option>
                   {grades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
             </div>
             <div className="col-span-1 flex items-end">
                <button 
                  onClick={() => setFilters({ search: '', status: 'all', grade: '' })}
                  className="w-full py-2 text-[10px] font-black text-secondary uppercase tracking-widest hover:bg-secondary/10 rounded-md transition-all border border-secondary/20"
                >
                   Reset Filters
                </button>
             </div>
          </div>
        )}
        
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border-light bg-neutral/30">
                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest leading-none text-left min-w-[200px]">Description / Item</th>
                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest leading-none text-left min-w-[100px]">Grade</th>
                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest leading-none text-center min-w-[120px]">Opening Bal</th>
                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest leading-none text-center min-w-[120px]">Current Stock</th>
                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest leading-none text-center min-w-[120px]">KG Conv.</th>
                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest leading-none text-center min-w-[120px]">Reorder Lvl</th>
                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest leading-none text-left min-w-[100px]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filteredProducts.map((p) => {
                const isOut = p.currentStock === 0;
                const isLow = p.currentStock <= (p.reorderLevel || 10);
                return (
                  <tr key={p._id} className="hover:bg-neutral/50 transition-colors">
                    <td className="px-6 py-5">
                      <p className="text-[13px] font-black text-text-main leading-tight uppercase">{p.name}</p>
                      <p className="text-[9px] text-text-muted font-bold mt-1 uppercase tracking-tighter line-clamp-1">{p.description || 'No detailed memo'}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-neutral px-2 py-1 rounded-md text-text-muted">{p.grade || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <p className="text-[13px] font-bold text-text-muted tabular-nums">{p.openingBal || 0}</p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <p className={`text-[14px] font-black ${isOut ? 'text-accent' : isLow ? 'text-secondary' : 'text-primary'} tabular-nums`}>
                        {p.currentStock || 0}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <p className="text-[11px] font-black text-text-muted/60 uppercase tracking-widest">{p.weightKg || 1}kg / bag</p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <p className="text-[13px] font-bold text-text-muted/40 tabular-nums">{p.reorderLevel || 10}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-widest border ${
                        isOut ? 'bg-accent/10 text-accent border-accent/20' : 
                        isLow ? 'bg-secondary/10 text-secondary border-secondary/20' : 
                        'bg-primary/10 text-primary border-primary/20'
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
         <div className="p-4 md:p-6 bg-neutral/30 border-t border-border-light flex flex-col sm:flex-row gap-4 justify-between items-center mt-auto">
            <p className="text-[9px] md:text-[10px] font-black text-text-muted uppercase tracking-widest opacity-60">Showing {products.length} entries</p>
            <div className="flex gap-2">
               <button className="p-2 border border-border-light rounded-md text-text-muted hover:text-text-main bg-white transition-colors"><ChevronLeft className="w-3.5 h-3.5" /></button>
               <button className="w-8 h-8 bg-accent text-white rounded-md text-[10px] font-black">1</button>
               <button className="w-8 h-8 border border-border-light bg-white rounded-md text-[10px] font-black text-text-muted">2</button>
               <button className="w-8 h-8 border border-border-light bg-white rounded-md text-[10px] font-black text-text-muted">3</button>
               <button className="p-2 border border-border-light rounded-md text-text-muted hover:text-text-main bg-white transition-colors"><ChevronRight className="w-3.5 h-3.5" /></button>
            </div>
         </div>
      </div>

      {/* Critical Stock Alerts Section */}
      <div className="pt-4">
        <div className="flex items-center gap-3 mb-6">
           <div className="p-2 bg-secondary/10 text-secondary rounded-md border border-secondary/20">
              <AlertTriangle className="w-5 h-5" />
           </div>
           <h3 className="text-xl font-black text-text-main tracking-tighter uppercase">Critical Stock Alerts</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {criticalItems.length > 0 ? (
            criticalItems.slice(0, 3).map((p) => {
              const isOut = p.currentStock === 0;
              const progress = Math.min(((p.currentStock / (p.reorderLevel || 10)) * 100), 100);
              return (
                <div key={p._id} className="bg-white border border-border-light rounded-md p-6 shadow-sm relative overflow-hidden flex flex-col transition-all hover:border-primary/30">
                   <div className={`absolute top-0 left-0 w-1 h-full ${isOut ? 'bg-accent' : 'bg-secondary'}`}></div>
                   
                   <div className="flex justify-between items-start mb-6">
                      <div className="max-w-[80%]">
                         <h4 className="text-sm font-black text-text-main leading-tight uppercase tracking-tight">{p.name}</h4>
                         <p className="text-[9px] text-text-muted font-bold mt-1 uppercase tracking-widest">SKU-{p._id.slice(-6).toUpperCase()}</p>
                      </div>
                      {isOut ? (
                         <div className="w-6 h-6 bg-accent/10 text-accent rounded-full flex items-center justify-center border border-accent/20">
                            <AlertTriangle className="w-3.5 h-3.5" />
                         </div>
                      ) : (
                         <div className="text-[10px] font-black text-secondary uppercase tracking-widest group">!</div>
                      )}
                   </div>

                   <div className={`p-4 rounded-md mb-6 ${isOut ? 'bg-accent/10 border border-accent/20' : 'bg-secondary/10 border border-secondary/20'}`}>
                      <div className="flex justify-between items-end mb-2">
                         <p className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-none">Current Status: {isOut ? 'DEPLETED' : 'LOW'}</p>
                         <p className="text-[11px] font-black text-text-main leading-none">{p.currentStock}/{p.reorderLevel || 10}</p>
                      </div>
                      <div className="w-full h-1.5 bg-neutral rounded-full overflow-hidden">
                         <div 
                           className={`h-full transition-all duration-1000 ${isOut ? 'w-0' : 'bg-secondary'}`}
                           style={{ width: `${isOut ? 5 : progress}%` }} 
                         ></div>
                      </div>
                   </div>

                   <div className="mt-auto flex justify-between items-center pt-2">
                      <p className="text-[9px] font-black text-text-muted uppercase tracking-widest italic">{isOut ? 'Depleted 48h ago' : 'Last restock 12 days ago'}</p>
                      <button className="text-[9px] font-black text-primary uppercase tracking-[0.15em] hover:underline flex items-center gap-1.5">View Vendor</button>
                   </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-16 border-2 border-dashed border-neutral rounded-md flex flex-col items-center justify-center bg-neutral/10">
               <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 border border-primary/20">
                  <ShieldCheck className="w-7 h-7" />
               </div>
               <h4 className="text-sm font-black text-text-main uppercase tracking-tighter">Inventory Levels Good</h4>
               <p className="text-[10px] text-text-muted font-bold uppercase tracking-[0.15em] mt-2 opacity-60">No items are currently below reorder levels.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InventoryStatCard = ({ label, value, trend, isUp, subtext, borderColor, icon, bg, isCritical }) => (
  <div className={`bg-white border-l-4 ${borderColor} border-t border-r border-b border-border-light rounded-md p-6 shadow-sm ${bg || ''} transition-all hover:translate-y-[-2px]`}>
    <div className="flex justify-between items-start mb-4">
      <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{label}</p>
      {icon}
    </div>
    <div className="flex items-baseline gap-3 mb-2">
       <p className={`text-4xl font-black tracking-tighter ${isCritical ? 'text-accent' : 'text-text-main'}`}>{value}</p>
       {trend && (
         <p className={`text-[10px] font-black flex items-center gap-1 ${isUp ? 'text-primary' : 'text-secondary'}`}>
           <TrendingUp className="w-3 h-3" /> {trend}
         </p>
       )}
    </div>
    {subtext && <p className={`text-[10px] font-black uppercase tracking-wide opacity-50 ${isCritical ? 'text-accent' : 'text-secondary'}`}>{subtext}</p>}
  </div>
);

export default Inventory;
