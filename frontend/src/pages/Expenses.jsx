import React, { useState, useEffect } from 'react';
import { transportService } from '../services/transportService';
import { 
  Plus, 
  Search, 
  Trash2,
  TrendingDown,
  Edit3,
  Filter,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import DeactivateModal from '../components/ui/DeactivateModal';
import { formatNumber, parseNumber } from '../utils/formatters';

const DEFAULT_CATEGORIES = ['Fuel', 'Maintenance', 'Toll', 'Police/Security', 'Loading', 'Driver Allowance'];

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newExpense, setNewExpense] = useState({ 
    carId: '', 
    category: '', 
    amount: '', 
    date: new Date().toISOString().split('T')[0], 
    note: '' 
  });
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [expenseToDeactivate, setExpenseToDeactivate] = useState(null);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filters, setFilters] = useState({ carId: '', category: '', startDate: '', endDate: '' });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const activeFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v));
      const [exRes, carsRes] = await Promise.all([
        transportService.getExpenses(activeFilters),
        transportService.getCars()
      ]);
      setExpenses(exRes.data);
      setCars(carsRes.data);
    } catch (err) {
      toast.error('Sync failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordExpense = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { 
        ...newExpense, 
        category: showCustomCategory ? customCategory : newExpense.category 
      };
      
      if (!payload.category) {
        toast.error('Category is required');
        return;
      }

      await transportService.addExpense(payload);
      toast.success('Expense recorded');
      setShowModal(false);
      fetchData();
      setNewExpense({ carId: '', category: '', amount: '', date: new Date().toISOString().split('T')[0], note: '' });
      setCustomCategory('');
      setShowCustomCategory(false);
    } catch (err) {
      toast.error('Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id) => {
    setExpenseToDeactivate(expenses.find(e => e._id === id));
    setShowDeactivateModal(true);
  };

  const handleConfirmDeactivate = async () => {
    if (!expenseToDeactivate) return;
    setSubmitting(true);
    try {
      await transportService.deleteExpense(expenseToDeactivate._id);
      toast.success('Expense cancelled');
      setShowDeactivateModal(false);
      setExpenseToDeactivate(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to cancel expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense({
      ...expense,
      date: new Date(expense.date).toISOString().split('T')[0],
      carId: expense.carId?._id || expense.carId
    });
    setShowEditModal(true);
  };

  const handleUpdateExpense = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await transportService.updateExpense(editingExpense._id, editingExpense);
      toast.success('Expense updated');
      setShowEditModal(false);
      fetchData();
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  const clearFilters = () => {
    setFilters({ carId: '', category: '', startDate: '', endDate: '' });
    setShowFilters(false);
  };

  const totalThisMonth = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in text-left pb-10 italic">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-all">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Monthly Expenses</p>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">₦{totalThisMonth.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-md flex items-center justify-center transition-transform group-hover:scale-110">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">Expenses</h2>
          <div className="flex w-full md:w-auto gap-3">
             <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input type="text" placeholder="Search expenses..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-md text-xs font-bold focus:bg-white focus:border-emerald-500 outline-none transition-all" />
             </div>
             <Button variant="neutral" onClick={() => setShowFilters(!showFilters)} icon={Filter}>Filters</Button>
             <Button onClick={() => setShowModal(true)} icon={Plus}>Add Expense</Button>
          </div>
        </div>

        {showFilters && (
          <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/20 flex flex-wrap gap-4 animate-in slide-in-from-top-2 duration-200">
             <div className="flex-1 min-w-[150px]">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Vehicle</label>
                <select value={filters.carId} onChange={(e) => setFilters({...filters, carId: e.target.value})} className="input-pro !py-2 !text-[11px]">
                   <option value="">All Vehicles</option>
                   {cars.map(c => <option key={c._id} value={c._id}>{c.plateNumber}</option>)}
                </select>
             </div>
             <div className="flex-1 min-w-[150px]">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Category</label>
                 <select value={filters.category} onChange={(e) => setFilters({...filters, category: e.target.value})} className="input-pro !py-2 !text-[11px]">
                   <option value="">All Categories</option>
                   {Array.from(new Set([...DEFAULT_CATEGORIES, ...expenses.map(ex => ex.category).filter(Boolean)])).sort().map(cat => (
                     <option key={cat} value={cat}>{cat}</option>
                   ))}
                </select>
             </div>
             <div className="flex-1 min-w-[120px]">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Start Date</label>
                <input type="date" value={filters.startDate} onChange={(e) => setFilters({...filters, startDate: e.target.value})} className="input-pro !py-2 !text-[11px]" />
             </div>
             <div className="flex-1 min-w-[120px]">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 block">End Date</label>
                <input type="date" value={filters.endDate} onChange={(e) => setFilters({...filters, endDate: e.target.value})} className="input-pro !py-2 !text-[11px]" />
             </div>
             <div className="flex items-end pb-1">
                <button onClick={clearFilters} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><X className="w-4 h-4" /></button>
             </div>
          </div>
        )}
        
        {loading ? (
          <div className="flex-1 flex items-center justify-center"><Loader size="lg" /></div>
        ) : expenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/10 text-[10px] uppercase font-black text-slate-400 tracking-widest">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 italic">
                {expenses.map((e) => (
                  <tr key={e._id} className="hover:bg-slate-50/20 transition-colors group">
                    <td className="px-6 py-5 text-[13px] font-black text-slate-900">{new Date(e.date).toLocaleDateString()}</td>
                    <td className="px-6 py-5 text-[11px] font-black text-blue-600/70 uppercase">{e.carId?.plateNumber || 'Fleet General'}</td>
                    <td className="px-6 py-5 text-[13px] font-bold text-slate-700 uppercase">{e.category}</td>
                    <td className="px-6 py-5 text-right font-black text-rose-500">₦{Number(e.amount).toLocaleString()}</td>
                    <td className="px-6 py-5 text-right space-x-2">
                        <button onClick={() => handleEdit(e)} className="p-2 text-slate-300 hover:text-blue-500 transition-colors"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => handleDeactivate(e._id)} className="p-2 text-slate-300 hover:text-amber-500"><Trash2 className="w-4 h-4" /></button>
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No Expenses" message="No expenses recorded." action={<Button onClick={() => setShowModal(true)} icon={Plus}>Add Expense</Button>} />
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-md w-full max-w-lg p-10 shadow-3xl animate-in zoom-in-95 duration-200">
             <h3 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-tighter">Add Expense</h3>
             <form onSubmit={handleRecordExpense} className="space-y-6">
                <div>
                   <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-widest text-left">Vehicle</label>
                   <select value={newExpense.carId} onChange={(e) => setNewExpense({...newExpense, carId: e.target.value})} className="input-pro" required>
                      <option value="">Select Vehicle...</option>
                      {cars.map(car => <option key={car._id} value={car._id}>{car.plateNumber} ({car.model})</option>)}
                   </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-widest text-left">Category</label>
                      <select 
                        value={showCustomCategory ? 'others' : newExpense.category} 
                        onChange={(e) => {
                          if (e.target.value === 'others') {
                            setShowCustomCategory(true);
                            setNewExpense({...newExpense, category: ''});
                          } else {
                            setShowCustomCategory(false);
                            setNewExpense({...newExpense, category: e.target.value});
                          }
                        }} 
                        className="input-pro" 
                        required
                      >
                         <option value="">Select Category...</option>
                         {Array.from(new Set([...DEFAULT_CATEGORIES, ...expenses.map(ex => ex.category).filter(Boolean)])).sort().map(cat => (
                           <option key={cat} value={cat}>{cat}</option>
                         ))}
                         <option value="others">OTHERS (CUSTOM)</option>
                      </select>
                   </div>
                   <div><label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-widest text-left">Amount (₦)</label>
                   <input type="text" value={formatNumber(newExpense.amount)} onChange={(e) => setNewExpense({...newExpense, amount: parseNumber(e.target.value)})} className="input-pro" placeholder="0" required /></div>
                </div>

                {showCustomCategory && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                     <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-widest text-left">Specify Custom Category</label>
                     <input 
                        type="text" 
                        value={customCategory} 
                        onChange={(e) => setCustomCategory(e.target.value)} 
                        className="input-pro border-emerald-100 bg-emerald-50/10" 
                        placeholder="e.g. Car Wash" 
                        required 
                     />
                  </div>
                )}
                <div className="flex gap-4 pt-4">
                   <Button variant="neutral" onClick={() => setShowModal(false)} className="flex-1">Discard</Button>
                   <Button type="submit" loading={submitting} className="flex-1 uppercase font-black tracking-widest">Save</Button>
                </div>
             </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-md w-full max-w-lg p-10 shadow-3xl animate-in zoom-in-95 duration-200">
             <h3 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-tighter">Edit Expense</h3>
             <form onSubmit={handleUpdateExpense} className="space-y-6">
                <div>
                   <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-widest text-left">Vehicle</label>
                   <select value={editingExpense.carId} onChange={(e) => setEditingExpense({...editingExpense, carId: e.target.value})} className="input-pro" required disabled>
                      {cars.map(car => <option key={car._id} value={car._id}>{car.plateNumber} ({car.model})</option>)}
                   </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-widest text-left">Category</label>
                      <select 
                        value={editingExpense.category} 
                        onChange={(e) => setEditingExpense({...editingExpense, category: e.target.value})} 
                        className="input-pro" 
                        required
                      >
                         <option value="">Select Category...</option>
                         {DEFAULT_CATEGORIES.map(cat => (
                           <option key={cat} value={cat}>{cat}</option>
                         ))}
                      </select>
                   </div>
                   <div><label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-widest text-left">Amount (₦)</label>
                   <input type="text" value={formatNumber(editingExpense.amount)} onChange={(e) => setEditingExpense({...editingExpense, amount: parseNumber(e.target.value)})} className="input-pro" placeholder="0" required /></div>
                </div>
                <div className="grid grid-cols-1">
                   <div><label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-widest text-left">Date</label>
                   <input type="date" value={editingExpense.date} onChange={(e) => setEditingExpense({...editingExpense, date: e.target.value})} className="input-pro" required /></div>
                </div>
                <div className="flex gap-4 pt-4">
                   <Button variant="neutral" onClick={() => setShowEditModal(false)} className="flex-1">Discard</Button>
                   <Button type="submit" loading={submitting} className="flex-1 uppercase font-black tracking-widest">Update Record</Button>
                </div>
             </form>
          </div>
        </div>
      )}

      <DeactivateModal 
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        onConfirm={handleConfirmDeactivate}
        loading={submitting}
        title="Cancel Expense"
        itemName={expenseToDeactivate ? `${expenseToDeactivate.category} (₦${Number(expenseToDeactivate.amount).toLocaleString()})` : ''}
        description="This action will cancel the expense record."
      />
    </div>
  );
};

export default Expenses;
