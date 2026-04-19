import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { salesService } from '../services/salesService';
import { businessService } from '../services/businessService';
import { 
  Plus, 
  ShoppingCart, 
  Zap, 
  ArrowRight, 
  User, 
  Calendar, 
  Receipt,
  Search,
  Filter,
  Eye,
  Download,
  Shield,
  Info,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Wallet,
  Activity,
  Trash2,
  Box
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import DeactivateModal from '../components/ui/DeactivateModal';
import { formatNumber, parseNumber } from '../utils/formatters';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
const getLocalDatetime = () => {
    const now = new Date();
    // Adjust to local timezone explicitly before slicing to maintain local hours
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const [newSale, setNewSale] = useState({ 
    date: getLocalDatetime(), 
    customerName: '', 
    items: [{ productId: '', quantitySold: '', salesPrice: '' }] 
  });
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [saleToDeactivate, setSaleToDeactivate] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [filters, setFilters] = useState({ 
    startDate: '', 
    endDate: '', 
    search: '' 
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const fetchParams = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        customerName: filters.search
      };
      const [sRes, pRes] = await Promise.all([
        salesService.getSales(fetchParams),
        businessService.getProducts()
      ]);
      setSales(sRes.data);
      setProducts(pRes.data);
    } catch (err) {
      toast.error('Failed to sync with server');
    } finally {
      setLoading(false);
    }
  };

  const addLineItem = () => {
    setNewSale(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantitySold: '', salesPrice: '' }]
    }));
  };

  const removeLineItem = (index) => {
    if (newSale.items.length === 1) return;
    const updated = [...newSale.items];
    updated.splice(index, 1);
    setNewSale(prev => ({ ...prev, items: updated }));
  };

  const updateItem = (index, field, value) => {
    const updated = [...newSale.items];
    updated[index][field] = value;
    
    if (field === 'productId') {
      const product = products.find(p => p._id === value);
      if (product) {
        updated[index].salesPrice = product.sellingPrice || '';
      }
    }
    
    setNewSale(prev => ({ ...prev, items: updated }));
  };

  const totalPayable = newSale.items.reduce((acc, item) => {
    const prodInfo = products.find(p => p._id === item.productId);
    const kg = prodInfo ? (Number(item.quantitySold || 0) * (prodInfo.weightKg || 1)) : 0;
    return acc + (kg * Number(item.salesPrice || 0));
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; // Prevent double-click firing

    if (!newSale.customerName.trim()) {
      toast.error('Strategic Stop: Customer name is absolutely required.');
      return;
    }

    if (newSale.items.some(item => !item.productId || Number(item.quantitySold) <= 0 || Number(item.salesPrice) <= 0)) {
      toast.error('Strategic Stop: Invalid item data detected. Ensure no zero-values or missing products exist.');
      return;
    }

    setSubmitting(true);
    try {
      // Create a cloned payload ensuring numeric coercion
      const safePayload = {
        date: new Date(newSale.date).toISOString(), // Output guaranteed strict ISO
        customerName: newSale.customerName.trim(),
        items: newSale.items.map(i => ({
          productId: i.productId,
          quantitySold: Number(i.quantitySold),
          salesPrice: Number(i.salesPrice)
        }))
      };

      await salesService.recordSale(safePayload);
      toast.success('Batch finalized successfully');
      setShowModal(false);
      fetchData();
      setNewSale({ 
        date: getLocalDatetime(), 
        customerName: '', 
        items: [{ productId: '', quantitySold: '', salesPrice: '' }] 
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transaction failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id) => {
    setSaleToDeactivate(sales.find(s => s._id === id));
    setShowDeactivateModal(true);
  };

  const handleViewClick = (sale) => {
    setSelectedSale(sale);
    setShowViewModal(true);
  };

  const handleConfirmDeactivate = async () => {
    if (!saleToDeactivate || submitting) return; // Double-click shield
    setSubmitting(true);
    try {
      await salesService.deleteSale(saleToDeactivate._id);
      toast.success('Transaction voided/deactivated');
      setShowDeactivateModal(false);
      setSaleToDeactivate(null);
      fetchData();
    } catch (err) {
      toast.error('Deactivation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const todayRevenue = sales.filter(s => new Date(s.date).toDateString() === new Date().toDateString()).reduce((acc, s) => acc + (s.totalAmount || 0), 0);
  const weekRevenue = sales.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
  const monthRevenue = sales.reduce((acc, s) => acc + (s.totalAmount || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in text-left pb-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard 
          label="Today" 
          value={`₦${todayRevenue.toLocaleString()}`} 
          icon={<Calendar className="w-5 h-5" />} 
          iconBg="bg-primary/10 text-primary"
        />
        <SummaryCard 
          label="This Week" 
          value={`₦${(weekRevenue).toLocaleString()}`} 
          icon={<Activity className="w-5 h-5" />} 
          iconBg="bg-secondary/10 text-secondary"
        />
        <SummaryCard 
          label="This Month" 
          value={`₦${(monthRevenue).toLocaleString()}`} 
          icon={<Wallet className="w-5 h-5" />} 
          iconBg="bg-primary/10 text-primary"
        />
      </div>

      <div className="bg-white border border-border-light rounded-md shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-4 md:p-6 border-b border-border-light flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-xl md:text-2xl font-black text-text-main tracking-tighter uppercase leading-none">Sales Ledger</h3>
            <p className="text-[9px] md:text-[10px] text-text-muted font-bold uppercase tracking-widest mt-2 border-l-2 border-primary/20 pl-2">Transaction History & Records</p>
          </div>
          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
             <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted opacity-40" />
                <input 
                  type="text" 
                  placeholder="Search records..." 
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
                 <Button 
                   onClick={() => setShowModal(true)}
                   icon={Plus}
                   className="flex-1 sm:flex-none shadow-lg shadow-primary/20"
                 >
                   Start Sale
                 </Button>
             </div>
          </div>
        </div>

        {showFilters && (
          <div className="px-4 md:px-6 py-5 bg-neutral/50 border-b border-border-light animate-in slide-in-from-top-2 duration-200">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-text-muted uppercase block tracking-widest text-left">Start Date</label>
                   <input 
                     type="date" 
                     value={filters.startDate}
                     onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                     className="w-full px-3 py-2 bg-white border border-border-light rounded-md text-xs font-bold focus:border-primary outline-none transition-all shadow-sm"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-text-muted uppercase block tracking-widest text-left">End Date</label>
                   <input 
                     type="date" 
                     value={filters.endDate}
                     onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                     className="w-full px-3 py-2 bg-white border border-border-light rounded-md text-xs font-bold focus:border-primary outline-none transition-all shadow-sm"
                   />
                </div>
                <div className="sm:col-span-2 lg:col-span-1">
                   <button 
                     onClick={() => setFilters({ startDate: '', endDate: '', search: '' })}
                     className="w-full h-[38px] text-[10px] font-black text-secondary uppercase tracking-widest hover:bg-secondary/10 rounded-md transition-all border border-secondary/20"
                   >
                      Reset All Filters
                   </button>
                </div>
             </div>
          </div>
        )}
        
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader size="lg" />
          </div>
        ) : sales.length > 0 ? (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border-light bg-neutral/10 uppercase tracking-widest text-left">
                  <th className="px-6 py-4 text-[10px] font-black text-text-muted leading-none min-w-[120px]">Date & Time</th>
                  <th className="px-6 py-4 text-[10px] font-black text-text-muted leading-none min-w-[140px]">Transaction ID</th>
                  <th className="px-6 py-4 text-[10px] font-black text-text-muted leading-none min-w-[180px]">Main Product</th>
                  <th className="px-6 py-4 text-[10px] font-black text-text-muted leading-none text-right min-w-[120px]">Total Amount</th>
                  <th className="px-6 py-4 text-[10px] font-black text-text-muted leading-none text-center min-w-[100px]">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-text-muted leading-none text-right min-w-[100px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {sales.map((s, idx) => (
                  <tr key={s._id} className="hover:bg-neutral/30 transition-colors group">
                    <td className="px-6 py-5">
                      <p className="text-[13px] font-black text-text-main">{new Date(s.date).toLocaleDateString()}</p>
                      <p className="text-[10px] text-text-muted font-bold mt-1 uppercase italic tracking-tighter">Verified Entry</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-[11px] font-black text-primary/70 hover:text-primary cursor-pointer uppercase tracking-tight transition-colors">TXN-{s._id.slice(-5).toUpperCase()}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-[13px] font-bold text-text-main">{s.items?.[0]?.productId?.name || 'Multiple Items'}</p>
                      {s.items?.length > 1 && (
                        <p className="text-[10px] text-primary/60 font-black mt-1 uppercase tracking-tighter">+{s.items.length - 1} more items</p>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <p className="text-[15px] font-black text-text-main tabular-nums">₦{(s.totalAmount || 0).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-md text-[8px] font-black uppercase tracking-widest">Completed</span>
                    </td>
                    <td className="px-6 py-5 text-right flex justify-end gap-2">
                       <button 
                         onClick={() => handleViewClick(s)}
                         className="p-2 text-text-muted/40 hover:text-primary transition-colors"
                       >
                          <Eye className="w-4 h-4" />
                       </button>
                       <button onClick={() => handleDeactivate(s._id)} className="p-2 text-text-muted/40 hover:text-secondary transition-colors">
                           <Trash2 className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState 
            title="Terminal Clear" 
            message="No sales recorded. Open the checkout tool to start."
            action={<Button onClick={() => setShowModal(true)} icon={Zap}>Open Checkout</Button>}
          />
        )}

        <div className="p-6 border-t border-border-light bg-neutral/30 flex justify-between items-center">
          <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest opacity-60">Showing {sales.length} transactions</p>
          <div className="flex gap-2">
             <button className="px-4 py-2 border border-border-light rounded-md text-[10px] font-black text-text-muted hover:bg-white hover:text-text-main transition-all uppercase tracking-widest">Previous</button>
             <button className="w-8 h-8 bg-primary text-white rounded-md text-[10px] font-black">1</button>
             <button className="px-4 py-2 border border-border-light rounded-md text-[10px] font-black text-text-muted hover:bg-white hover:text-text-main transition-all uppercase tracking-widest">Next</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <Link to="/reports" className="flex gap-4 group cursor-pointer hover:bg-white hover:shadow-sm p-4 -m-4 rounded-md transition-all border border-transparent hover:border-border-light text-left">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-md flex items-center justify-center shrink-0">
             <Info className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-black text-text-main tracking-tight uppercase">Need to export data?</h4>
            <p className="text-xs text-text-muted font-bold mt-1 leading-relaxed opacity-70">Generate professional CSV or PDF reports for tax or inventory audits.</p>
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-3 flex items-center gap-2">Go to Reports <ArrowRight className="w-3 h-3" /></p>
          </div>
        </Link>
        
        <Link to="/reports" className="flex gap-4 group cursor-pointer hover:bg-white hover:shadow-sm p-4 -m-4 rounded-md transition-all border border-transparent hover:border-border-light text-left">
          <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-md flex items-center justify-center shrink-0">
             <Shield className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-black text-text-main tracking-tight uppercase">Audit Logs</h4>
            <p className="text-xs text-text-muted font-bold mt-1 leading-relaxed opacity-70">Secure transaction history with Manager ID and timestamping.</p>
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-3 flex items-center gap-2">View Audit Log <ArrowRight className="w-3 h-3" /></p>
          </div>
        </Link>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-[#0F2A1D]/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 text-left">
          <form onSubmit={handleSubmit} className="bg-white/95 border border-white/20 rounded-2xl w-full max-w-4xl shadow-2xl shadow-accent/20 animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] overflow-hidden">
             {/* Header */}
             <div className="p-8 border-b border-border-light flex items-center justify-between shrink-0 bg-neutral/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-text-main uppercase tracking-tighter leading-none">Sales Form</h3>
                    <p className="text-[9px] text-primary font-black tracking-[0.2em] uppercase mt-2">Create New Receipt</p>
                  </div>
                </div>
                <button type="button" onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full hover:bg-neutral flex items-center justify-center text-text-muted hover:text-text-main transition-all">
                   <Trash2 className="w-5 h-5" />
                </button>
             </div>

             {/* Main Interface Content */}
             <div className="flex-1 overflow-y-auto p-8 pt-6 no-scrollbar bg-white/50">
                <div className="space-y-10">
                   {/* Meta Section */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                     <div className="space-y-4">
                        <label className="text-[9px] font-black text-text-muted uppercase tracking-widest block text-left">Customer Name</label>
                        <div className="relative">
                           <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted opacity-50" />
                           <input type="text" value={newSale.customerName} onChange={(e) => setNewSale({...newSale, customerName: e.target.value})} className="input-pro !pl-10 !py-3 bg-neutral/30 border-border-light focus:bg-white" placeholder="Enter name or ID..." required />
                        </div>
                     </div>
                     <div className="space-y-4">
                        <label className="text-[9px] font-black text-text-muted uppercase tracking-widest block text-left">Sale Date</label>
                        <div className="relative">
                           <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted opacity-50 outline-none" />
                           <input type="datetime-local" value={newSale.date} onChange={(e) => setNewSale({...newSale, date: e.target.value})} className="input-pro !pl-10 !py-3 bg-neutral/30 border-border-light focus:bg-white" required />
                        </div>
                     </div>
                   </div>

                   {/* Line Items Section */}
                   <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-border-light pb-4">
                         <div className="flex items-center gap-3">
                            <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                            <h4 className="text-[10px] font-black text-text-main uppercase tracking-widest">Products Sold</h4>
                         </div>
                         <button type="button" onClick={addLineItem} className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all flex items-center gap-2">
                           <Plus className="w-3.5 h-3.5" /> Add New Row
                         </button>
                      </div>

                      <div className="space-y-4">
                         {newSale.items.map((item, idx) => {
                           const prodInfo = products.find(p => p._id === item.productId);
                           const kg = prodInfo ? (Number(item.quantitySold || 0) * (prodInfo.weightKg || 1)) : 0;
                           
                           return (
                             <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end group animate-in slide-in-from-right-2 duration-300 bg-neutral/10 sm:bg-transparent p-4 sm:p-0 rounded-xl">
                                <div className="col-span-full sm:col-span-4">
                                   <label className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-2 block text-left sm:hidden">Product</label>
                                   {idx === 0 && <label className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-2 hidden sm:block text-left">Product</label>}
                                   <div className="relative">
                                      <Box className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted opacity-50 pointer-events-none" />
                                      <select value={item.productId} onChange={(e) => updateItem(idx, 'productId', e.target.value)} className="input-pro !pl-10 !text-xs !py-3 bg-neutral/30 border-border-light appearance-none focus:bg-white outline-none">
                                         <option value="">Choose Asset...</option>
                                         {products.map(p => <option key={p._id} value={p._id}>{p.name} ({p.grade})</option>)}
                                      </select>
                                   </div>
                                </div>
                                <div className="col-span-full sm:col-span-2">
                                   <label className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-2 block text-left sm:hidden">Quantity</label>
                                   {idx === 0 && <label className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-2 hidden sm:block text-left">Quantity</label>}
                                   <input type="text" value={formatNumber(item.quantitySold)} onChange={(e) => updateItem(idx, 'quantitySold', parseNumber(e.target.value))} className="input-pro !text-xs !py-3 bg-neutral/30 border-border-light font-black text-text-main" placeholder="0" />
                                </div>
                                <div className="col-span-full sm:col-span-2">
                                   <label className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-2 block text-left sm:hidden">Total Weight</label>
                                   {idx === 0 && <label className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-2 hidden sm:block text-left">Total Weight</label>}
                                   <div className="input-pro !text-xs !py-3 bg-neutral/50 border-border-light text-text-muted/60 cursor-not-allowed font-bold italic truncate">
                                      {kg.toLocaleString()}
                                   </div>
                                </div>
                                <div className="col-span-full sm:col-span-3">
                                   <label className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-2 block text-left sm:hidden">Price/KG (₦)</label>
                                   {idx === 0 && <label className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-2 hidden sm:block text-right">Price/KG (₦)</label>}
                                   <input type="text" value={formatNumber(item.salesPrice)} onChange={(e) => updateItem(idx, 'salesPrice', parseNumber(e.target.value))} className="input-pro !text-xs !py-3 bg-primary/10 border-primary/20 text-right font-black text-primary focus:bg-white outline-none" placeholder="0.00" />
                                </div>
                                <div className="col-span-full sm:col-span-1 flex items-center justify-end sm:justify-center pb-2">
                                   <button type="button" onClick={() => removeLineItem(idx)} className="w-10 h-10 rounded-full hover:bg-secondary/10 text-text-muted hover:text-secondary transition-all flex items-center justify-center">
                                      <Trash2 className="w-4 h-4" />
                                   </button>
                                </div>
                             </div>
                           );
                         })}
                      </div>
                   </div>
                   </div>
                </div>

                {/* Footer Calculations & Actions */}
                <div className="p-8 border-t border-border-light bg-neutral/80 backdrop-blur-sm shrink-0">
                   <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-6">
                      <div className="flex gap-10 text-left">
                         <div>
                            <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Total Items</p>
                            <p className="text-xl font-black text-text-main leading-none">{newSale.items.length} <span className="text-[10px] uppercase opacity-50">Units</span></p>
                         </div>
                         <div>
                            <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Total Weight</p>
                            <p className="text-xl font-black text-text-main leading-none">
                               {newSale.items.reduce((acc, item) => {
                                  const prod = products.find(p => p._id === item.productId);
                                  return acc + (Number(item.quantitySold || 0) * (prod?.weightKg || 0));
                               }, 0).toLocaleString()} <span className="text-xs text-text-muted uppercase">kg</span>
                            </p>
                         </div>
                      </div>
                      <div className="text-left sm:text-right">
                         <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Grand Total</p>
                         <p className="text-3xl md:text-4xl font-black text-primary tracking-tighter shadow-primary/5 drop-shadow-sm leading-none">₦{totalPayable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      </div>
                   </div>
                   <div className="flex gap-4">
                      <Button variant="neutral" onClick={() => setShowModal(false)} className="flex-1 !py-4 font-black tracking-widest">Discard Batch</Button>
                      <Button type="submit" disabled={submitting} loading={submitting} className="flex-2 !py-4 !bg-primary hover:!bg-accent shadow-xl shadow-primary/10 font-black tracking-widest uppercase disabled:opacity-50 disabled:cursor-not-allowed">Submit Sale</Button>
                   </div>
                </div>
             </form>
          </div>
        )}
      {showViewModal && selectedSale && (
        <div className="fixed inset-0 bg-[#0F2A1D]/40 backdrop-blur-md z-[110] flex items-center justify-center p-4 text-left">
           <div className="bg-white/95 border border-white/20 rounded-2xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh] overflow-hidden">
              <div className="p-6 border-b border-border-light flex items-center justify-between bg-neutral/50">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary text-white rounded-lg flex items-center justify-center shadow-lg">
                       <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                       <h3 className="text-lg font-black text-text-main uppercase tracking-tighter leading-none">Sale Details</h3>
                       <p className="text-[9px] text-primary font-black tracking-widest uppercase mt-1">TXN-{selectedSale._id.slice(-8).toUpperCase()}</p>
                    </div>
                 </div>
                 <button onClick={() => setShowViewModal(false)} className="w-8 h-8 rounded-full hover:bg-neutral flex items-center justify-center text-text-muted hover:text-text-main transition-all">
                    <Plus className="w-5 h-5 rotate-45" />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                 <div className="grid grid-cols-2 gap-8 mb-10 pb-8 border-b border-neutral">
                    <div>
                       <label className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1.5 block">Customer Name</label>
                       <p className="text-base font-black text-text-main">{selectedSale.customerName}</p>
                    </div>
                    <div>
                       <label className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1.5 block">Sale Date</label>
                       <p className="text-base font-black text-text-main">{new Date(selectedSale.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                       <div className="w-1 h-4 bg-primary rounded-full"></div>
                       <h4 className="text-[10px] font-black text-text-main uppercase tracking-widest">Products Included</h4>
                    </div>
                    
                    <div className="space-y-3">
                       {selectedSale.items.map((item, idx) => (
                          <div key={idx} className="bg-neutral/30 border border-border-light/50 rounded-xl p-4 flex items-center justify-between group hover:bg-primary/10 transition-colors">
                             <div className="flex items-center gap-4">
                                <div className="w-8 h-8 bg-white border border-border-light rounded-lg flex items-center justify-center text-text-muted">
                                   <Box className="w-4 h-4" />
                                </div>
                                <div>
                                   <p className="text-xs font-black text-text-main uppercase tracking-tight">{item.productId?.name || 'Unknown Asset'}</p>
                                   <p className="text-[9px] text-text-muted font-bold uppercase mt-0.5 tracking-widest">{item.productId?.grade || 'N/A GRADE'}</p>
                                </div>
                             </div>
                             <div className="flex gap-8 text-right">
                                <div>
                                   <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-0.5">Quantity</p>
                                   <p className="text-xs font-black text-text-main">{item.quantitySold} Bags <span className="text-[10px] text-text-muted font-bold">/ {item.qtyKg?.toLocaleString()}kg</span></p>
                                </div>
                                <div>
                                   <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-0.5">Unit Price (Per KG)</p>
                                   <p className="text-xs font-black text-primary">₦{item.salesPrice?.toLocaleString()}</p>
                                </div>
                                <div className="min-w-[80px]">
                                   <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-0.5">Subtotal</p>
                                   <p className="text-xs font-black text-text-main">₦{((item.qtyKg || 0) * item.salesPrice).toLocaleString()}</p>
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="p-8 border-t border-border-light bg-neutral/80 flex items-center justify-between">
                 <div>
                    <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Total Amount</p>
                    <p className="text-3xl font-black text-primary tracking-tighter tabular-nums leading-none">₦{selectedSale.totalAmount?.toLocaleString()}</p>
                 </div>
                 <Button onClick={() => setShowViewModal(false)} variant="neutral" className="px-8 !py-3 font-black tracking-widest">Close</Button>
              </div>
           </div>
        </div>
      )}
      <DeactivateModal 
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        onConfirm={handleConfirmDeactivate}
        loading={submitting}
        title="Void Sale"
        itemName={saleToDeactivate ? `TXN-${saleToDeactivate._id.slice(-5).toUpperCase()}` : ''}
        description="Voiding this sale will return the stock to inventory. This action cannot be undone."
      />
    </div>
  );
};

const SummaryCard = ({ label, value, icon, iconBg }) => (
  <div className="bg-white border border-border-light rounded-md p-6 shadow-sm flex items-center justify-between group hover:border-primary/40 transition-all">
    <div>
      <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-text-main tracking-tighter">{value}</p>
    </div>
    <div className={`w-12 h-12 ${iconBg} rounded-md flex items-center justify-center transition-transform group-hover:scale-110`}>
      {icon}
    </div>
  </div>
);

export default Sales;
