import React, { useState, useEffect } from 'react';
import { businessService } from '../services/businessService';
import { 
  Plus, 
  Search, 
  Trash2, 
  Package, 
  ArrowUpRight, 
  TrendingUp, 
  AlertTriangle,
  History,
  Box,
  Edit3
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import DeactivateModal from '../components/ui/DeactivateModal';
import { formatNumber, parseNumber } from '../utils/formatters';

const Business = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newItem, setNewItem] = useState({ 
    name: '', 
    description: '',
    grade: '', 
    openingBal: '', 
    reorderLevel: '5', 
    weightKg: '50',
    costPrice: '',
    sellingPrice: '' 
  });
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [itemToDeactivate, setItemToDeactivate] = useState(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await businessService.getInventory();
      setInventory(res.data);
    } catch (err) {
      toast.error('Inventory sync failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing) {
        await businessService.updateProduct(editingId, newItem);
        toast.success('Product updated successfully');
      } else {
        await businessService.addInventoryItem(newItem);
        toast.success('New product catalogued');
      }
      setShowModal(false);
      setIsEditing(false);
      setEditingId(null);
      fetchInventory();
      setNewItem({ 
        name: '', description: '', grade: '', openingBal: '', reorderLevel: '5', weightKg: '50', costPrice: '', sellingPrice: '' 
      });
    } catch (err) {
      toast.error(isEditing ? 'Update failed' : 'Provisioning failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (item) => {
    setNewItem({
      name: item.name || '',
      description: item.description || '',
      grade: item.grade || '',
      openingBal: item.openingBal || '',
      reorderLevel: item.reorderLevel || '5',
      weightKg: item.weightKg || '50',
      costPrice: item.costPrice || '',
      sellingPrice: item.sellingPrice || ''
    });
    setEditingId(item._id);
    setIsEditing(true);
    setShowModal(true);
  };

  const openCreateModal = () => {
    setNewItem({ 
      name: '', description: '', grade: '', openingBal: '', reorderLevel: '5', weightKg: '50', costPrice: '', sellingPrice: '' 
    });
    setIsEditing(false);
    setEditingId(null);
    setShowModal(true);
  };

  const handleDeactivate = async (id) => {
    setItemToDeactivate(inventory.find(item => item._id === id));
    setShowDeactivateModal(true);
  };

  const handleConfirmDeactivate = async () => {
    if (!itemToDeactivate) return;
    setSubmitting(true);
    try {
      await businessService.deleteInventoryItem(itemToDeactivate._id);
      toast.success('Asset deactivated');
      setShowDeactivateModal(false);
      setItemToDeactivate(null);
      fetchInventory();
    } catch (err) {
      toast.error('Deactivation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const lowStockItems = inventory.filter(item => (item.currentStock || 0) < 10);
  const totalValue = inventory.reduce((acc, curr) => acc + ((curr.sellingPrice || 0) * (curr.currentStock || 0)), 0);

  return (
    <div className="space-y-8 animate-fade-in text-left pb-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Purchased" value={`₦${totalValue.toLocaleString()}`} icon={<TrendingUp className="text-emerald-500" />} />
        <StatCard label="Total Products" value={inventory.length.toString()} icon={<Box className="text-emerald-500" />} />
        <StatCard label="Low Stock Alerts" value={lowStockItems.length.toString()} icon={<AlertTriangle className="text-amber-500" />} highlight={lowStockItems.length > 0} />
      </div>

      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">Catalog</h2>
           <div className="flex w-full md:w-auto gap-3">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input type="text" placeholder="Search catalog..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-md text-xs font-bold focus:bg-white focus:border-emerald-500 outline-none transition-all" />
              </div>
              <Button onClick={openCreateModal} icon={Plus}>Add Item</Button>
           </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center"><Loader size="lg" /></div>
        ) : inventory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/10 text-[10px] uppercase font-black text-slate-400 tracking-widest">
                  <th className="px-6 py-4">Item Details</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Available Stock</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 italic">
                {inventory.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/20 transition-colors group">
                    <td className="px-6 py-5">
                       <p className="text-[13px] font-black text-slate-900 uppercase leading-tight">{item.name}</p>
                       <p className="text-[10px] font-bold text-slate-400 mt-0.5 line-clamp-1">{item.description || 'No detailed description'}</p>
                       <p className="text-[9px] text-slate-300 font-bold mt-1 uppercase tracking-tighter">SKU-{item._id.slice(-6).toUpperCase()}</p>
                    </td>
                    <td className="px-6 py-5">
                       <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md text-slate-500">{item.grade || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-5">
                       <p className="text-[13px] font-black text-slate-900">₦{Number(item.sellingPrice || 0).toLocaleString()}</p>
                       <p className="text-[9px] font-bold text-slate-400 mt-0.5">Cost: ₦{Number(item.costPrice || 0).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-5">
                       <span className={`font-black tabular-nums ${(item.currentStock || 0) <= (item.reorderLevel || 5) ? 'text-rose-500' : 'text-emerald-600'}`}>
                          {item.currentStock || 0} Bags
                       </span>
                       <p className="text-[9px] font-bold text-slate-400 mt-0.5">({item.weightKg || 1}kg conversion)</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <div className="flex justify-end gap-2">
                          <button onClick={() => handleEditClick(item)} className="p-2 text-slate-300 hover:text-emerald-500 transition-colors"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeactivate(item._id)} className="p-2 text-slate-300 hover:text-amber-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Catalog Empty" message="No inventory items registered." action={<Button onClick={openCreateModal} icon={Plus}>Add Item</Button>} />
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
             <form onSubmit={handleSubmit} className="bg-white/95 border border-white/20 rounded-2xl w-full max-w-2xl shadow-2xl shadow-slate-900/20 animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-8 border-b border-slate-100/50 flex items-center justify-between shrink-0 bg-slate-50/50">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                       <Package className="w-6 h-6" />
                     </div>
                     <div>
                       <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
                       <p className="text-[9px] text-emerald-500 font-black tracking-[0.2em] uppercase mt-2">{isEditing ? 'Change product details' : 'Basic Product Information'}</p>
                     </div>
                   </div>
                   <button type="button" onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all">
                      <Trash2 className="w-5 h-5" />
                   </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 pt-6 no-scrollbar">
                   <div className="space-y-10">
                   {/* Section: Identity */}
                   <div className="space-y-6">
                      <div className="flex items-center gap-3">
                         <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                         <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Basic Details</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                         <div className="col-span-2">
                           <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Product Name</label>
                           <div className="relative">
                             <Box className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                             <input type="text" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} className="input-pro !pl-10 !py-3.5 bg-slate-50 border-slate-100 focus:bg-white" placeholder="e.g. DANGOTE CEMENT 3X" required />
                           </div>
                         </div>
                         <div className="col-span-2">
                           <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Grade / Type</label>
                           <input type="text" value={newItem.grade} onChange={(e) => setNewItem({...newItem, grade: e.target.value})} className="input-pro !py-3 bg-slate-50 border-slate-200" placeholder="e.g. 42.5N / Grade A" />
                         </div>
                      </div>
                   </div>

                   {/* Section: Logistics */}
                   <div className="space-y-6">
                      <div className="flex items-center gap-3">
                         <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                         <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Stock Levels</h4>
                      </div>
                      <div className="grid grid-cols-3 gap-6">
                         <div className="col-span-1">
                           <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Weight per Bag (kg)</label>
                           <input type="text" value={formatNumber(newItem.weightKg)} onChange={(e) => setNewItem({...newItem, weightKg: parseNumber(e.target.value)})} className="input-pro !py-3 bg-slate-50 border-slate-200" placeholder="50" />
                         </div>
                         <div className="col-span-1">
                           <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Starting Stock (Bags)</label>
                           <input type="text" value={formatNumber(newItem.openingBal)} onChange={(e) => setNewItem({...newItem, openingBal: parseNumber(e.target.value)})} className="input-pro !py-3 bg-slate-50 border-slate-200 font-black text-emerald-600" required />
                         </div>
                         <div className="col-span-1">
                           <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Low Stock Alert Level</label>
                           <input type="text" value={formatNumber(newItem.reorderLevel)} onChange={(e) => setNewItem({...newItem, reorderLevel: parseNumber(e.target.value)})} className="input-pro !py-3 bg-slate-50 border-slate-200 font-black text-rose-500" />
                         </div>
                      </div>
                   </div>

                   {/* Section: Financials */}
                   <div className="space-y-6">
                      <div className="flex items-center gap-3">
                         <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                         <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Product Prices</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                         <div className="col-span-1">
                           <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Cost Price (₦)</label>
                           <input type="text" value={formatNumber(newItem.costPrice)} onChange={(e) => setNewItem({...newItem, costPrice: parseNumber(e.target.value)})} className="input-pro !py-3 bg-slate-50 border-slate-200" placeholder="0" />
                         </div>
                         <div className="col-span-1">
                           <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Selling Price (₦)</label>
                           <input type="text" value={formatNumber(newItem.sellingPrice)} onChange={(e) => setNewItem({...newItem, sellingPrice: parseNumber(e.target.value)})} className="input-pro !py-3 bg-emerald-50/50 border-emerald-200 font-black text-emerald-700" placeholder="0" required />
                         </div>
                      </div>
                   </div>

                   {/* Section: Notes */}
                   <div className="space-y-6">
                      <div className="flex items-center gap-3">
                         <div className="w-1.5 h-4 bg-slate-400 rounded-full"></div>
                         <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Audit Notes</h4>
                      </div>
                      <div className="grid grid-cols-1 gap-6">
                        <div className="col-span-1">
                           <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Catalog Memo / Specs</label>
                           <textarea value={newItem.description} onChange={(e) => setNewItem({...newItem, description: e.target.value})} className="input-pro h-24 resize-none bg-slate-50 border-slate-200 py-3" placeholder="Enter detailed product specifications..." />
                        </div>
                      </div>
                   </div>
                   </div>
                </div>

                {/* Footer Actions */}
                <div className="p-8 border-t border-slate-100 bg-slate-50/80 backdrop-blur-sm shrink-0 flex gap-4">
                   <Button variant="neutral" onClick={() => setShowModal(false)} className="flex-1 !py-4 font-black tracking-widest">Discard {isEditing ? 'Changes' : 'Entry'}</Button>
                   <Button type="submit" loading={submitting} className="flex-2 !bg-emerald-600 hover:!bg-emerald-700 !py-4 shadow-xl shadow-emerald-900/10 font-black tracking-widest uppercase truncate">{isEditing ? 'Save Changes' : 'Save Product'}</Button>
                </div>
             </form>
          </div>
        )}

      <DeactivateModal 
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        onConfirm={handleConfirmDeactivate}
        loading={submitting}
        title="Deactivate Asset"
        itemName={itemToDeactivate?.name}
        description="Archiving asset "
      />
    </div>
  );
};

const StatCard = ({ label, value, icon, highlight }) => (
  <div className={`bg-white border rounded-md p-6 shadow-sm transition-all ${highlight ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200'}`}>
    <div className="flex justify-between items-center mb-4">
       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
       {icon}
    </div>
    <p className={`text-3xl font-black tracking-tighter ${highlight ? 'text-amber-600' : 'text-slate-900'}`}>{value}</p>
  </div>
);

export default Business;
