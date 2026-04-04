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
    weightKg: '25',
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
        name: '', description: '', grade: '', openingBal: '', reorderLevel: '5', weightKg: '25', costPrice: '', sellingPrice: '' 
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
      weightKg: item.weightKg || '25',
      costPrice: item.costPrice || '',
      sellingPrice: item.sellingPrice || ''
    });
    setEditingId(item._id);
    setIsEditing(true);
    setShowModal(true);
  };

  const openCreateModal = () => {
    setNewItem({ 
      name: '', description: '', grade: '', openingBal: '', reorderLevel: '5', weightKg: '25', costPrice: '', sellingPrice: '' 
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
        <StatCard label="Total Purchased" value={`₦${totalValue.toLocaleString()}`} icon={<TrendingUp className="text-primary" />} />
        <StatCard label="Total Products" value={inventory.length.toString()} icon={<Box className="text-primary" />} />
        <StatCard label="Low Stock Alerts" value={lowStockItems.length.toString()} icon={<AlertTriangle className="text-secondary" />} highlight={lowStockItems.length > 0} />
      </div>

      <div className="bg-white border border-border-light rounded-md shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-4 md:p-6 border-b border-border-light flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <h2 className="text-xl md:text-2xl font-black text-text-main tracking-tighter uppercase leading-none">Catalog</h2>
           <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted opacity-40" />
                <input type="text" placeholder="Search catalog..." className="w-full pl-10 pr-4 py-2 bg-neutral border border-border-light rounded-xl text-xs font-bold focus:bg-white focus:border-primary outline-none transition-all" />
              </div>
              <Button onClick={openCreateModal} icon={Plus} className="w-full sm:w-auto">Add Item</Button>
           </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center"><Loader size="lg" /></div>
        ) : inventory.length > 0 ? (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border-light bg-neutral/10 text-[10px] uppercase font-black text-text-muted tracking-widest whitespace-nowrap">
                   <th className="px-6 py-4 min-w-[220px]">Item Details</th>
                   <th className="px-6 py-4 min-w-[100px]">Category</th>
                   <th className="px-6 py-4 min-w-[150px]">Price Metrics</th>
                   <th className="px-6 py-4 min-w-[160px]">Available Stock</th>
                   <th className="px-6 py-4 text-right min-w-[100px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light italic">
                {inventory.map((item) => (
                  <tr key={item._id} className="hover:bg-neutral/20 transition-colors group">
                    <td className="px-6 py-5 text-left">
                       <p className="text-[13px] font-black text-text-main uppercase leading-tight">{item.name}</p>
                       <p className="text-[10px] font-bold text-text-muted mt-0.5 line-clamp-1">{item.description || 'No detailed description'}</p>
                       <p className="text-[9px] text-text-muted opacity-40 font-bold mt-1 uppercase tracking-tighter">SKU-{item._id.slice(-6).toUpperCase()}</p>
                    </td>
                    <td className="px-6 py-5 text-left">
                       <span className="text-[10px] font-black uppercase tracking-widest bg-neutral px-2 py-1 rounded-md text-text-muted">{item.grade || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-5 text-left">
                       <p className="text-[13px] font-black text-text-main">₦{Number(item.sellingPrice || 0).toLocaleString()}</p>
                       <p className="text-[9px] font-bold text-text-muted mt-0.5 opacity-60">Cost: ₦{Number(item.costPrice || 0).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-5 text-left">
                       <span className={`font-black tabular-nums ${(item.currentStock || 0) <= (item.reorderLevel || 5) ? 'text-secondary' : 'text-primary'}`}>
                          {item.currentStock || 0} Bags
                       </span>
                       <p className="text-[9px] font-bold text-text-muted mt-0.5 opacity-60">({item.weightKg || 1}kg conversion)</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <div className="flex justify-end gap-2">
                          <button onClick={() => handleEditClick(item)} className="p-2 text-text-muted opacity-40 hover:opacity-100 hover:text-primary transition-all"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeactivate(item._id)} className="p-2 text-text-muted opacity-40 hover:opacity-100 hover:text-secondary transition-all"><Trash2 className="w-4 h-4" /></button>
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
        <div className="fixed inset-0 bg-accent/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
             <form onSubmit={handleSubmit} className="bg-white border border-border-light rounded-2xl w-full max-w-2xl shadow-3xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] overflow-hidden text-left">
                 {/* Header */}
                 <div className="p-6 md:p-8 border-b border-border-light flex items-center justify-between shrink-0 bg-neutral/50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 text-left">
                        <Package className="w-5 h-5 md:w-6 md:h-6" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg md:text-xl font-black text-text-main uppercase tracking-tighter leading-none">{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
                        <p className="text-[8px] md:text-[9px] text-primary font-black tracking-[0.2em] uppercase mt-1.5 md:mt-2">{isEditing ? 'Change product details' : 'Basic Product Information'}</p>
                      </div>
                    </div>
                   <button type="button" onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full hover:bg-neutral flex items-center justify-center text-text-muted hover:text-text-main transition-all">
                      <Trash2 className="w-5 h-5" />
                   </button>
                </div>

                 <div className="flex-1 overflow-y-auto p-6 md:p-8 pt-6 no-scrollbar">
                   <div className="space-y-6">
                    {/* Section: Identity */}
                    <div className="space-y-6">
                       <div className="flex items-center gap-3">
                          <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                          <h4 className="text-[10px] font-black text-text-main uppercase tracking-widest text-left">Basic Details</h4>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="col-span-full">
                            <label className="text-[9px] font-black text-text-muted uppercase mb-2 block tracking-widest text-left">Product Name</label>
                            <div className="relative">
                              <Box className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted opacity-40" />
                              <input type="text" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} className="input-pro !pl-10 !py-3 bg-neutral/30 border-border-light focus:bg-white text-left" placeholder="e.g. DANGOTE CEMENT 3X" required />
                            </div>
                          </div>
                          <div className="col-span-full">
                            <label className="text-[9px] font-black text-text-muted uppercase mb-2 block tracking-widest text-left">Grade / Type</label>
                            <input type="text" value={newItem.grade} onChange={(e) => setNewItem({...newItem, grade: e.target.value})} className="input-pro !py-3 bg-neutral/30 border-border-light text-left focus:bg-white" placeholder="e.g. 42.5N / Grade A" />
                          </div>
                       </div>
                    </div>

                   {/* Section: Logistics */}
                    <div className="space-y-6">
                       <div className="flex items-center gap-3">
                          <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                          <h4 className="text-[10px] font-black text-text-main uppercase tracking-widest text-left">Stock Levels</h4>
                       </div>
                       <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                          <div className="col-span-1">
                            <label className="text-[9px] font-black text-text-muted uppercase mb-2 block tracking-widest text-left">Weight (kg)</label>
                            <input type="text" value={formatNumber(newItem.weightKg)} onChange={(e) => setNewItem({...newItem, weightKg: parseNumber(e.target.value)})} className="input-pro !py-3 bg-neutral/30 border-border-light text-left focus:bg-white" placeholder="25" />
                          </div>
                          <div className="col-span-1">
                            <label className="text-[9px] font-black text-text-muted uppercase mb-2 block tracking-widest text-left">Start Stock</label>
                            <input type="text" value={formatNumber(newItem.openingBal)} onChange={(e) => setNewItem({...newItem, openingBal: parseNumber(e.target.value)})} className="input-pro !py-3 bg-neutral/30 border-border-light font-black text-primary text-left focus:bg-white" required />
                          </div>
                          <div className="col-span-1">
                            <label className="text-[9px] font-black text-text-muted uppercase mb-2 block tracking-widest text-left">Alert Level</label>
                            <input type="text" value={formatNumber(newItem.reorderLevel)} onChange={(e) => setNewItem({...newItem, reorderLevel: parseNumber(e.target.value)})} className="input-pro !py-3 bg-neutral/30 border-border-light font-black text-secondary text-left focus:bg-white" />
                          </div>
                       </div>
                    </div>

                   {/* Section: Financials */}
                    <div className="space-y-6">
                       <div className="flex items-center gap-3">
                          <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                          <h4 className="text-[10px] font-black text-text-main uppercase tracking-widest text-left">Product Prices</h4>
                       </div>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="col-span-1">
                            <label className="text-[9px] font-black text-text-muted uppercase mb-2 block tracking-widest text-left">Cost Price (₦)</label>
                            <input type="text" value={formatNumber(newItem.costPrice)} onChange={(e) => setNewItem({...newItem, costPrice: parseNumber(e.target.value)})} className="input-pro !py-3 bg-neutral/30 border-border-light text-left focus:bg-white" placeholder="0" />
                          </div>
                          <div className="col-span-1">
                            <label className="text-[9px] font-black text-text-muted uppercase mb-2 block tracking-widest text-left">Selling Price (₦)</label>
                            <input type="text" value={formatNumber(newItem.sellingPrice)} onChange={(e) => setNewItem({...newItem, sellingPrice: parseNumber(e.target.value)})} className="input-pro !py-3 bg-primary/10 border-primary/20 font-black text-primary text-left focus:bg-white" placeholder="0" required />
                          </div>
                       </div>
                    </div>

                    {/* Section: Notes */}
                    <div className="space-y-6">
                       <div className="flex items-center gap-3">
                          <div className="w-1.5 h-4 bg-text-muted rounded-full"></div>
                          <h4 className="text-[10px] font-black text-text-main uppercase tracking-widest text-left">Audit Notes</h4>
                       </div>
                       <div className="grid grid-cols-1 gap-6">
                         <div className="col-span-1 text-left">
                            <label className="text-[9px] font-black text-text-muted uppercase mb-2 block tracking-widest">Catalog Memo / Specs</label>
                            <textarea value={newItem.description} onChange={(e) => setNewItem({...newItem, description: e.target.value})} className="input-pro h-24 resize-none bg-neutral/10 border-border-light py-3 focus:bg-white text-left" placeholder="Enter detailed product specifications..." />
                         </div>
                       </div>
                    </div>
                   </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 md:p-8 border-t border-border-light bg-neutral/80 backdrop-blur-sm shrink-0 flex flex-col md:flex-row gap-4">
                   <Button variant="neutral" onClick={() => setShowModal(false)} className="w-full md:flex-1 !py-4 font-black tracking-widest">Discard Entry</Button>
                   <Button type="submit" loading={submitting} className="w-full md:flex-2 !bg-primary hover:!bg-accent !py-4 shadow-xl shadow-primary/10 font-black tracking-widest uppercase truncate">{isEditing ? 'Save Changes' : 'Save Product'}</Button>
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
  <div className={`bg-white border rounded-md p-6 shadow-sm transition-all text-left ${highlight ? 'border-secondary/20 bg-secondary/10' : 'border-border-light'}`}>
    <div className="flex justify-between items-center mb-4">
       <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">{label}</span>
       {icon}
    </div>
    <p className={`text-3xl font-black tracking-tighter ${highlight ? 'text-secondary' : 'text-text-main'}`}>{value}</p>
  </div>
);

export default Business;
