import React, { useState, useEffect } from 'react';
import { transportService } from '../services/transportService';
import { 
  Plus,   Search, 
   Trash2,
   TrendingUp,
   CreditCard,
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

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newPayment, setNewPayment] = useState({ 
    carId: '', 
    amount: '', 
    date: new Date().toISOString().split('T')[0], 
    note: '' 
  });
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [paymentToDeactivate, setPaymentToDeactivate] = useState(null);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [filters, setFilters] = useState({ carId: '', startDate: '', endDate: '' });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const activeFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v));
      const [payRes, carsRes] = await Promise.all([
        transportService.getPayments(activeFilters),
        transportService.getCars()
      ]);
      setPayments(payRes.data);
      setCars(carsRes.data);
    } catch (err) {
      toast.error('Sync failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await transportService.addPayment(newPayment);
      toast.success('Payment recorded');
      setShowModal(false);
      fetchData();
      setNewPayment({ carId: '', amount: '', date: new Date().toISOString().split('T')[0], note: '' });
    } catch (err) {
      toast.error('Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id) => {
    setPaymentToDeactivate(payments.find(p => p._id === id));
    setShowDeactivateModal(true);
  };

  const handleConfirmDeactivate = async () => {
    if (!paymentToDeactivate) return;
    setSubmitting(true);
    try {
      await transportService.deletePayment(paymentToDeactivate._id);
      toast.success('Payment cancelled');
      setShowDeactivateModal(false);
      setPaymentToDeactivate(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to cancel payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (payment) => {
    setEditingPayment({
      ...payment,
      date: new Date(payment.date).toISOString().split('T')[0],
      carId: payment.carId?._id || payment.carId
    });
    setShowEditModal(true);
  };

  const handleUpdatePayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await transportService.updatePayment(editingPayment._id, editingPayment);
      toast.success('Payment updated');
      setShowEditModal(false);
      fetchData();
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  const clearFilters = () => {
    setFilters({ carId: '', startDate: '', endDate: '' });
    setShowFilters(false);
  };

  const totalCollected = payments.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in text-left pb-10 italic">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-border-light rounded-md p-6 shadow-sm flex items-center justify-between group hover:border-primary/20 transition-all">
          <div>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Total Payments</p>
            <p className="text-3xl font-black text-text-main tracking-tighter">₦{totalCollected.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-md flex items-center justify-center transition-transform group-hover:scale-110">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-border-light rounded-md shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-4 md:p-6 border-b border-border-light flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-xl md:text-2xl font-black text-text-main tracking-tighter uppercase leading-none">Driver Payments</h2>
          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
             <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted opacity-40" />
                <input type="text" placeholder="Search payments..." className="w-full pl-10 pr-4 py-2 bg-neutral border border-border-light rounded-xl text-xs font-bold focus:bg-white focus:border-primary outline-none transition-all" />
             </div>
             <div className="flex gap-3 w-full sm:w-auto">
                <Button variant="neutral" onClick={() => setShowFilters(!showFilters)} icon={Filter} className="flex-1 sm:flex-none">Filters</Button>
                <Button onClick={() => setShowModal(true)} icon={Plus} className="flex-1 sm:flex-none">Record</Button>
             </div>
          </div>
        </div>

        {showFilters && (
          <div className="px-4 md:px-6 py-4 border-b border-border-light bg-neutral/20 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in slide-in-from-top-2 duration-200">
             <div className="col-span-1">
                <label className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-2 block text-left">Vehicle</label>
                <select value={filters.carId} onChange={(e) => setFilters({...filters, carId: e.target.value})} className="input-pro !py-2 !text-[11px] bg-white border-border-light focus:border-primary transition-all">
                   <option value="">All Vehicles</option>
                   {cars.map(c => <option key={c._id} value={c._id}>{c.plateNumber}</option>)}
                </select>
             </div>
             <div className="col-span-1">
                <label className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-2 block text-left">Start Date</label>
                <input type="date" value={filters.startDate} onChange={(e) => setFilters({...filters, startDate: e.target.value})} className="input-pro !py-2 !text-[11px] bg-white border-border-light focus:border-primary transition-all" />
             </div>
             <div className="col-span-1 flex gap-2">
                <div className="flex-1">
                   <label className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-2 block text-left">End Date</label>
                   <input type="date" value={filters.endDate} onChange={(e) => setFilters({...filters, endDate: e.target.value})} className="input-pro !py-2 !text-[11px] bg-white border-border-light focus:border-primary transition-all" />
                </div>
                <div className="flex items-end pb-0.5">
                   <button onClick={clearFilters} className="p-2 text-text-muted opacity-40 hover:opacity-100 hover:text-secondary transition-all"><X className="w-4 h-4" /></button>
                </div>
             </div>
          </div>
        )}
        
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-20"><Loader size="lg" /></div>
        ) : payments.length > 0 ? (
          <div className="overflow-x-auto no-scrollbar italic">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-neutral uppercase tracking-widest text-[10px] font-black text-text-muted opacity-60 whitespace-nowrap">
                   <th className="px-6 py-4 min-w-[120px]">Date</th>
                   <th className="px-6 py-4 min-w-[150px]">Vehicle</th>
                   <th className="px-6 py-4 min-w-[150px]">Operator</th>
                   <th className="px-6 py-4 text-right min-w-[150px]">Received</th>
                   <th className="px-6 py-4 text-right min-w-[100px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-neutral/20 transition-colors group">
                    <td className="px-6 py-5 text-[13px] font-black text-text-main">{new Date(p.date).toLocaleDateString()}</td>
                    <td className="px-6 py-5 text-[11px] font-black text-primary/70 uppercase">{p.carId?.plateNumber || 'Unit N/A'}</td>
                    <td className="px-6 py-5 text-[11px] font-bold text-text-muted uppercase">{p.driver || 'Anonymous'}</td>
                    <td className="px-6 py-5 text-right font-black text-text-main">₦{Number(p.amount).toLocaleString()}</td>
                    <td className="px-6 py-5 text-right space-x-2">
                       <button onClick={() => handleEdit(p)} className="p-2 text-text-muted opacity-40 hover:opacity-100 hover:text-primary transition-all"><Edit3 className="w-4 h-4" /></button>
                       <button onClick={() => handleDeactivate(p._id)} className="p-2 text-text-muted opacity-40 hover:opacity-100 hover:text-secondary"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No Payments" message="No payments recorded." action={<Button onClick={() => setShowModal(true)} icon={Plus}>Record Payment</Button>} />
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-accent/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-border-light rounded-2xl w-full max-w-lg p-6 md:p-10 shadow-3xl animate-in zoom-in-95 duration-200 text-left">
             <h3 className="text-xl font-black text-text-main mb-8 uppercase tracking-tighter text-left leading-none">Record Payment</h3>
             <form onSubmit={handleRecordPayment} className="space-y-6">
                <div>
                   <label className="text-[9px] font-black text-text-muted uppercase mb-2 block tracking-widest text-left">Vehicle</label>
                   <select value={newPayment.carId} onChange={(e) => setNewPayment({...newPayment, carId: e.target.value})} className="input-pro bg-neutral/30 border-border-light focus:bg-white transition-all" required>
                      <option value="">Select Vehicle...</option>
                      {cars.map(car => <option key={car._id} value={car._id}>{car.plateNumber} ({car.model})</option>)}
                   </select>
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="text-[9px] font-black text-text-muted uppercase mb-2 block tracking-widest text-left">Amount (₦)</label>
                    <input type="text" value={formatNumber(newPayment.amount)} onChange={(e) => setNewPayment({...newPayment, amount: parseNumber(e.target.value)})} className="input-pro bg-neutral/30 border-border-light focus:bg-white text-primary font-black !py-3" placeholder="0" required /></div>
                    <div><label className="text-[9px] font-black text-text-muted uppercase mb-2 block tracking-widest text-left">Date</label>
                    <input type="date" value={newPayment.date} onChange={(e) => setNewPayment({...newPayment, date: e.target.value})} className="input-pro bg-neutral/30 border-border-light focus:bg-white !py-3" required /></div>
                 </div>
                <div className="flex gap-4 pt-4">
                   <Button variant="neutral" onClick={() => setShowModal(false)} className="flex-1">Discard</Button>
                   <Button type="submit" loading={submitting} className="flex-1 uppercase font-black tracking-widest">Save</Button>
                </div>
             </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-accent/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-left">
          <div className="bg-white border border-border-light rounded-md w-full max-w-lg p-10 shadow-3xl animate-in zoom-in-95 duration-200">
             <h3 className="text-xl font-black text-text-main mb-8 uppercase tracking-tighter">Edit Payment</h3>
             <form onSubmit={handleUpdatePayment} className="space-y-6">
                <div>
                   <label className="text-[9px] font-black text-text-muted uppercase mb-2 block tracking-widest text-left">Vehicle</label>
                   <select value={editingPayment.carId} onChange={(e) => setEditingPayment({...editingPayment, carId: e.target.value})} className="input-pro bg-neutral/30 border-border-light opacity-60" required disabled>
                      {cars.map(car => <option key={car._id} value={car._id}>{car.plateNumber} ({car.model})</option>)}
                   </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div><label className="text-[9px] font-black text-text-muted uppercase mb-2 block tracking-widest text-left">Amount (₦)</label>
                   <input type="text" value={formatNumber(editingPayment.amount)} onChange={(e) => setEditingPayment({...editingPayment, amount: parseNumber(e.target.value)})} className="input-pro bg-neutral/30 border-border-light text-primary font-black" placeholder="0" required /></div>
                   <div><label className="text-[9px] font-black text-text-muted uppercase mb-2 block tracking-widest text-left">Date</label>
                   <input type="date" value={editingPayment.date} onChange={(e) => setEditingPayment({...editingPayment, date: e.target.value})} className="input-pro bg-neutral/30 border-border-light" required /></div>
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
        title="Cancel Payment"
        itemName={paymentToDeactivate ? `₦${Number(paymentToDeactivate.amount).toLocaleString()} from ${paymentToDeactivate.driver}` : ''}
        description="This action will cancel the payment record."
      />
    </div>
  );
};

export default Payments;
