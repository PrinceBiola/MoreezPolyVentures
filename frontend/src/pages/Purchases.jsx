import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { businessService } from '../services/businessService';
import { 
  Plus, 
  ShoppingBag, 
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
  Truck,
  Box,
  Trash2,
  Package
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import DeactivateModal from '../components/ui/DeactivateModal';
import { formatNumber, parseNumber } from '../utils/formatters';

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newPurchase, setNewPurchase] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    productId: '', 
    quantityPurchased: '', 
    costPerBag: '' 
  });
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [purchaseToDeactivate, setPurchaseToDeactivate] = useState(null);
  const [filters, setFilters] = useState({ 
    startDate: '', 
    endDate: '', 
    productId: '' 
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
        productId: filters.productId
      };
      const [pRes, prodRes] = await Promise.all([
        businessService.getPurchases(fetchParams),
        businessService.getProducts()
      ]);
      setPurchases(pRes.data);
      setProducts(prodRes.data);
    } catch (err) {
      toast.error('Failed to load transaction data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await businessService.recordPurchase(newPurchase);
      toast.success('Inflow recorded successfully');
      setShowModal(false);
      fetchData();
      setNewPurchase({ 
        date: new Date().toISOString().split('T')[0], 
        productId: '', 
        quantityPurchased: '', 
        costPerBag: '' 
      });
    } catch (err) {
      toast.error('Failed to post transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleView = (purchase) => {
    setSelectedPurchase(purchase);
    setShowViewModal(true);
  };

  const handleDeactivate = async (id) => {
    setPurchaseToDeactivate(purchases.find(p => p._id === id));
    setShowDeactivateModal(true);
  };

  const handleConfirmDeactivate = async () => {
    if (!purchaseToDeactivate) return;
    setSubmitting(true);
    try {
      await businessService.deletePurchase(purchaseToDeactivate._id);
      toast.success('Inflow record voided/deactivated');
      setShowDeactivateModal(false);
      setPurchaseToDeactivate(null);
      fetchData();
    } catch (err) {
      toast.error('Deactivation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const todayCost = purchases.filter(p => new Date(p.date).toDateString() === new Date().toDateString()).reduce((acc, p) => acc + (p.quantityPurchased * p.costPerBag), 0);
  const weekCost = purchases.reduce((acc, p) => acc + (p.quantityPurchased * p.costPerBag), 0);
  const monthCost = purchases.reduce((acc, p) => acc + (p.quantityPurchased * p.costPerBag), 0);
  const inventoryValue = weekCost; // Aligning with the statistical summary logic

  return (
    <div className="space-y-8 animate-fade-in text-left pb-10">
      <div className="grid grid-cols-1 rounded-md md:grid-cols-3 gap-6">
        <SummaryCard 
          label="Today Purchases" 
          value={`₦${todayCost.toLocaleString()}`} 
          icon={<Truck className="w-5 h-5" />} 
          iconBg="bg-primary/10 text-primary"
        />
        <SummaryCard 
          label="This Week" 
          value={`₦${(weekCost).toLocaleString()}`} 
          icon={<Box className="w-5 h-5" />} 
          iconBg="bg-secondary/10 text-secondary"
        />
        <SummaryCard 
          label="Total Purchased" 
          value={inventoryValue.toLocaleString()} 
          icon={<Package className="text-primary" />} 
          iconBg="bg-primary/10 text-primary" 
        />
      </div>

      <div className="bg-white border border-border-light rounded-md shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-6 border-b border-border-light flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="text-lg font-black text-text-main tracking-tighter uppercase">Purchase Ledger</h3>
          <div className="flex w-full md:w-auto gap-3">
             <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted opacity-40" />
                <input 
                  type="text" 
                  placeholder="Filter shipments..." 
                  className="w-full pl-10 pr-4 py-2 bg-neutral border border-border-light rounded-md text-xs font-bold focus:bg-white focus:border-primary outline-none transition-all" 
                />
             </div>
             <Button 
               variant={showFilters ? 'primary' : 'neutral'} 
               icon={Filter} 
               onClick={() => setShowFilters(!showFilters)}
               className="!py-2 shadow-none"
             >
               {showFilters ? 'Hide Filters' : 'Filters'}
             </Button>
             <Button onClick={() => setShowModal(true)} icon={Plus}>New Purchase</Button>
          </div>
        </div>

        {showFilters && (
          <div className="px-6 py-4 bg-neutral border-b border-border-light animate-in slide-in-from-top-2 duration-200">
             <div className="flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[150px]">
                   <label className="text-[9px] font-black text-text-muted uppercase mb-2 block tracking-widest text-left">Start Date</label>
                   <input 
                     type="date" 
                     value={filters.startDate}
                     onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                     className="w-full px-3 py-2 bg-white border border-border-light rounded-md text-xs font-bold focus:border-primary outline-none transition-all"
                   />
                </div>
                <div className="flex-1 min-w-[150px]">
                   <label className="text-[9px] font-black text-text-muted uppercase mb-2 block tracking-widest text-left">End Date</label>
                   <input 
                     type="date" 
                     value={filters.endDate}
                     onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                     className="w-full px-3 py-2 bg-white border border-border-light rounded-md text-xs font-bold focus:border-primary outline-none transition-all"
                   />
                </div>
                <div className="flex-1 min-w-[150px]">
                   <label className="text-[9px] font-black text-text-muted uppercase mb-2 block tracking-widest text-left">Product</label>
                   <select 
                     value={filters.productId}
                     onChange={(e) => setFilters({...filters, productId: e.target.value})}
                     className="w-full px-3 py-2 bg-white border border-border-light rounded-md text-xs font-bold focus:border-primary outline-none transition-all appearance-none"
                   >
                     <option value="">All Products</option>
                     {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                   </select>
                </div>
                <button 
                  onClick={() => setFilters({ startDate: '', endDate: '', productId: '' })}
                  className="px-4 py-2 text-[10px] font-black text-secondary uppercase tracking-widest hover:bg-secondary/10 rounded-md transition-all h-[34px]"
                >
                   Reset
                </button>
             </div>
          </div>
        )}
        
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader size="lg" />
          </div>
        ) : purchases.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border-light bg-neutral/10">
                  <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest leading-none">Date & Time</th>
                  <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest leading-none">Shipment ID</th>
                  <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest leading-none">Product Asset</th>
                  <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest leading-none text-center">Tonnage (KG)</th>
                  <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest leading-none text-right">Total Cost (₦)</th>
                  <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest leading-none text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {purchases.map((p, idx) => (
                  <tr key={p._id} className="hover:bg-neutral/30 transition-colors group">
                    <td className="px-6 py-5">
                      <p className="text-[13px] font-black text-text-main">{new Date(p.date).toLocaleDateString()}</p>
                      <p className="text-[10px] text-text-muted font-bold mt-1">14:32 PM</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-[11px] font-black text-primary/70 hover:text-primary cursor-pointer uppercase tracking-tight transition-colors">SHP-{p._id.slice(-5).toUpperCase()}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-[13px] font-bold text-text-main font-black">{p.productId?.name || 'Inventory Item'}</p>
                      <p className="text-[10px] text-primary font-black mt-1 uppercase tracking-tighter">Verified Load</p>
                    </td>
                    <td className="px-6 py-5 text-center">
                       <p className="text-[13px] font-black text-text-main">{(p.qtyKg || 0).toLocaleString()}</p>
                       <p className="text-[10px] text-text-muted font-bold mt-1 uppercase tracking-tighter">{p.quantityPurchased} Bags</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <p className="text-[15px] font-black text-text-main tabular-nums leading-none">₦{(p.quantityPurchased * p.costPerBag).toLocaleString()}</p>
                      <p className="text-[10px] text-text-muted font-bold mt-1 uppercase tracking-tighter">Unit: ₦{p.costPerBag.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <button onClick={() => handleView(p)} className="p-2 text-text-muted opacity-40 hover:opacity-100 hover:text-text-main transition-all">
                          <Eye className="w-4 h-4" />
                       </button>
                       <button onClick={() => handleDeactivate(p._id)} className="p-2 text-text-muted opacity-40 hover:opacity-100 hover:text-secondary transition-all">
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
            title="Zero Inflow" 
            message="Your acquisition log is empty. Records show up here once you post a new load."
            action={<Button onClick={() => setShowModal(true)} icon={Plus}>Post First Load</Button>}
          />
        )}

        <div className="p-6 border-t border-border-light bg-neutral/30 flex justify-between items-center">
          <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest opacity-60">
            Showing 1-{purchases.length} of {purchases.length} shipments
          </p>
          <div className="flex gap-2">
             <button className="px-4 py-2 border border-border-light rounded-md text-[10px] font-black text-text-muted hover:bg-white hover:text-text-main transition-all uppercase tracking-widest">Previous</button>
             <button className="w-8 h-8 bg-accent text-white rounded-md text-[10px] font-black">1</button>
             <button className="px-4 py-2 border border-border-light rounded-md text-[10px] font-black text-text-muted hover:bg-white hover:text-text-main transition-all uppercase tracking-widest">Next</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <Link to="/reports" className="flex gap-4 group cursor-pointer hover:bg-white hover:shadow-sm p-4 -m-4 rounded-md transition-all border border-transparent hover:border-border-light">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-md flex items-center justify-center shrink-0">
             <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-text-main tracking-tight uppercase">Supply Chain Auditing</h4>
            <p className="text-xs text-text-muted font-bold mt-1 leading-relaxed">Cross-reference vendor invoices with warehouse arrival logs for internal compliance.</p>
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-3 flex items-center gap-2">Audit Supply Chain <ArrowRight className="w-3 h-3" /></p>
          </div>
        </Link>
        
        <Link to="/inventory" className="flex gap-4 group cursor-pointer hover:bg-white hover:shadow-sm p-4 -m-4 rounded-md transition-all border border-transparent hover:border-border-light">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-md flex items-center justify-center shrink-0">
             <Activity className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-text-main tracking-tight uppercase">Inventory Valuation</h4>
            <p className="text-xs text-text-muted font-bold mt-1 leading-relaxed">Real-time assessment of warehouse asset value based on latest procurement costs.</p>
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-3 flex items-center gap-2">View Valuation <ArrowRight className="w-3 h-3" /></p>
          </div>
        </Link>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-accent/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 text-left">
          <form onSubmit={handleSubmit} className="bg-white border border-border-light rounded-2xl w-full max-w-4xl shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] overflow-hidden">
             <div className="p-8 border-b border-border-light flex items-center justify-between shrink-0 bg-neutral/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-text-main uppercase tracking-tighter leading-none">Purchase Form</h3>
                    <p className="text-[9px] text-primary font-black tracking-[0.2em] uppercase mt-2">Purchase Form</p>
                  </div>
                </div>
                <button type="button" onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full hover:bg-neutral flex items-center justify-center text-text-muted hover:text-text-main transition-all">
                   <Trash2 className="w-5 h-5" />
                </button>
             </div>

             <div className="flex-1 overflow-y-auto p-8 pt-6 no-scrollbar bg-white/50">
                <div className="space-y-10">
                   <div className="space-y-6">
                      <div className="flex items-center gap-3">
                         <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                         <h4 className="text-[10px] font-black text-text-main uppercase tracking-widest text-left">Shipment Identity</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-6 text-left">
                         <div className="col-span-1">
                           <label className="text-[9px] font-black text-text-muted uppercase mb-2 block tracking-widest">Arrival Date</label>
                           <div className="relative">
                           </div>
                         </div>
                         <div className="col-span-1">
                           <label className="text-[9px] font-black text-text-muted/40 uppercase mb-2 block tracking-widest">Destination Hub</label>
                           <div className="relative text-left">
                             <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/30" />
                             <input type="text" className="input-pro !pl-10 !py-3 bg-neutral border-border-light italic opacity-60" placeholder="Central Depot" disabled />
                           </div>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6 text-left">
                      <div className="flex items-center gap-3">
                         <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                         <h4 className="text-[10px] font-black text-text-main uppercase tracking-widest">Asset Allocation</h4>
                      </div>
                      <div className="space-y-4">
                         <label className="text-[9px] font-black text-text-muted uppercase mb-2 block tracking-widest">Primary Inventory Item</label>
                         <div className="relative">
                            <Box className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted opacity-40 pointer-events-none" />
                            <select 
                               value={newPurchase.productId} 
                               onChange={(e) => {
                                 const pId = e.target.value;
                                 const prod = products.find(p => p._id === pId);
                                 setNewPurchase({
                                   ...newPurchase, 
                                   productId: pId,
                                   costPerBag: prod ? prod.costPrice : ''
                                 });
                               }} 
                               className="input-pro !pl-10 !py-3.5 bg-neutral border-border-light appearance-none focus:bg-white transition-all outline-none" 
                               required
                             >
                               <option value="">Choose Asset...</option>
                               {products.map(p => <option key={p._id} value={p._id}>{p.name} ({p.grade})</option>)}
                            </select>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6 border-b border-neutral pb-8 text-left">
                      <div className="flex items-center gap-3">
                         <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                         <h4 className="text-[10px] font-black text-text-main uppercase tracking-widest">Procurement Metrics</h4>
                      </div>
                      <div className="grid grid-cols-3 gap-6">
                         <div className="col-span-1">
                           <label className="text-[9px] font-black text-text-muted uppercase mb-2 block tracking-widest">Qty (Bags)</label>
                           <input type="text" value={formatNumber(newPurchase.quantityPurchased)} onChange={(e) => setNewPurchase({...newPurchase, quantityPurchased: parseNumber(e.target.value)})} className="input-pro !py-3 bg-neutral border-border-light text-primary font-black" placeholder="0" required />
                         </div>
                         <div className="col-span-1">
                           <label className="text-[9px] font-black text-text-muted uppercase mb-2 block tracking-widest">Conversion (KG)</label>
                           <div className="input-pro !py-3 bg-neutral/50 border-border-light text-text-muted font-bold italic tracking-tighter overflow-hidden truncate">
                              {products.find(p => p._id === newPurchase.productId) ? (Number(newPurchase.quantityPurchased || 0) * (products.find(p => p._id === newPurchase.productId).weightKg || 1)).toLocaleString() : '0'}kg
                           </div>
                         </div>
                         <div className="col-span-1">
                           <label className="text-[9px] font-black text-text-muted uppercase mb-2 block tracking-widest">Cost/Bag (₦)</label>
                           <input type="text" value={formatNumber(newPurchase.costPerBag)} onChange={(e) => setNewPurchase({...newPurchase, costPerBag: parseNumber(e.target.value)})} className="input-pro !py-3 bg-neutral border-border-light font-black" placeholder="0" required />
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="p-8 border-t border-border-light bg-neutral/80 backdrop-blur-sm shrink-0 flex items-center justify-between gap-6 text-left">
                <div className="hidden sm:block">
                   <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Total Transaction Value</p>
                   <p className="text-3xl font-black text-text-main tracking-tighter leading-none">₦{(Number(newPurchase.quantityPurchased || 0) * Number(newPurchase.costPerBag || 0)).toLocaleString()}</p>
                </div>
                <div className="flex gap-4 flex-1 sm:flex-none">
                   <Button variant="neutral" onClick={() => setShowModal(false)} className="flex-1 px-8 !py-4 font-black tracking-widest">Discard</Button>
                   <Button type="submit" loading={submitting} className="flex-2 !bg-primary hover:!bg-accent !py-4 px-10 shadow-xl shadow-primary/10 font-black tracking-widest uppercase">Validate Entry</Button>
                </div>
             </div>
          </form>
        </div>
      )}
      <DeactivateModal 
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        onConfirm={handleConfirmDeactivate}
        loading={submitting}
        title="Void Purchase"
        itemName={purchaseToDeactivate ? `SHP-${purchaseToDeactivate._id.slice(-5).toUpperCase()}` : ''}
        description="Voiding record "
      />

      {/* View Shipment Modal */}
      {showViewModal && selectedPurchase && (
        <div className="fixed inset-0 bg-accent/40 backdrop-blur-md z-[110] flex items-center justify-center p-4 text-left">
           <div className="bg-white border border-border-light rounded-3xl w-full max-w-2xl shadow-3xl animate-in zoom-in-95 duration-300 overflow-hidden">
              {/* Header */}
              <div className="p-8 border-b border-border-light flex items-center justify-between bg-neutral/30">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                       <Eye className="w-6 h-6" />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-text-main uppercase tracking-tighter leading-none">Shipment Details</h3>
                       <p className="text-[10px] text-primary font-black tracking-[0.2em] uppercase mt-2">SHP-{selectedPurchase._id.slice(-5).toUpperCase()}</p>
                    </div>
                 </div>
                 <button onClick={() => setShowViewModal(false)} className="w-10 h-10 rounded-full hover:bg-white flex items-center justify-center text-text-muted hover:text-text-main transition-all border border-transparent hover:border-border-light">
                    <Trash2 className="w-5 h-5" />
                 </button>
              </div>

              {/* Content */}
              <div className="p-10 space-y-10">
                 {/* Identity Grid */}
                 <div className="grid grid-cols-2 gap-10">
                    <div>
                       <label className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-3 block opacity-60">Arrival Information</label>
                       <p className="text-sm font-black text-text-main uppercase tracking-tight">{new Date(selectedPurchase.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                       <p className="text-[10px] text-text-muted font-bold mt-1 uppercase tracking-widest">Central Logistic Hub</p>
                    </div>
                    <div>
                       <label className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-3 block opacity-60">Inventory Line</label>
                       <p className="text-sm font-black text-text-main uppercase tracking-tight">{selectedPurchase.productId?.name || 'N/A'}</p>
                       <p className="text-[10px] text-primary font-black mt-1 uppercase tracking-widest">{selectedPurchase.productId?.grade || 'Standard Grade'}</p>
                    </div>
                 </div>

                 {/* Metrics Grid */}
                 <div className="bg-neutral rounded-2xl p-8 border border-border-light grid grid-cols-3 gap-8">
                    <div>
                       <label className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-2 block">Quantity</label>
                       <p className="text-2xl font-black text-text-main tracking-tighter tabular-nums leading-none">{selectedPurchase.quantityPurchased} <span className="text-[10px] text-text-muted font-bold">Bags</span></p>
                    </div>
                    <div>
                       <label className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-2 block">Net Weight</label>
                       <p className="text-2xl font-black text-primary tracking-tighter tabular-nums leading-none">{(selectedPurchase.qtyKg || 0).toLocaleString()} <span className="text-[10px] text-primary opacity-50 font-bold">KG</span></p>
                    </div>
                    <div>
                       <label className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-2 block">Unit Cost</label>
                       <p className="text-2xl font-black text-text-main tracking-tighter tabular-nums leading-none">₦{selectedPurchase.costPerBag?.toLocaleString()}</p>
                    </div>
                 </div>

                 {/* Financial Summary */}
                 <div className="pt-6 border-t border-border-light flex items-center justify-between">
                    <div>
                       <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Total Transaction Value</p>
                       <p className="text-3xl font-black text-text-main tracking-tighter tabular-nums leading-none">₦{(selectedPurchase.quantityPurchased * selectedPurchase.costPerBag).toLocaleString()}</p>
                    </div>
                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center shadow-inner border border-primary/20">
                       <Receipt className="w-6 h-6" />
                    </div>
                 </div>
              </div>

              {/* Footer */}
              <div className="p-8 bg-neutral border-t border-border-light/50 flex gap-4">
                 <button onClick={() => window.print()} className="flex-1 px-6 py-4 bg-white border border-border-light rounded-xl text-[11px] font-black uppercase tracking-widest text-text-muted hover:bg-white hover:text-text-main transition-all flex items-center justify-center gap-3">
                    <Download className="w-4 h-4 opacity-40" /> Print Manifest
                 </button>
                 <button onClick={() => setShowViewModal(false)} className="flex-1 px-6 py-4 bg-accent text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-accent/10 hover:bg-accent/90 transition-all">
                    Close Details
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ label, value, icon, iconBg }) => (
  <div className="bg-white border border-border-light rounded-sm p-6 shadow-sm flex items-center justify-between group hover:border-primary/20 transition-all">
    <div>
      <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1 text-left">{label}</p>
      <p className="text-2xl font-black text-text-main tracking-tighter">{value}</p>
    </div>
    <div className={`w-12 h-12 ${iconBg} rounded-sm flex items-center justify-center transition-transform group-hover:scale-110`}>
      {icon}
    </div>
  </div>
);

export default Purchases;
