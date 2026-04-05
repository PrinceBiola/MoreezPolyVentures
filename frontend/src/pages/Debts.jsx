import React, { useState, useEffect } from 'react';
import { debtService } from '../services/debtService';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  DollarSign, 
  MoreVertical,
  Plus,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Target
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import { formatNumber, parseNumber } from '../utils/formatters';

const Debts = () => {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('Debtor'); // 'Debtor' or 'Creditor'
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({ id: null, amount: '', note: '' });
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Active');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState(null);
  
  const [newRecord, setNewRecord] = useState({
    type: 'Debtor',
    name: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: 'Pending'
  });

  useEffect(() => {
    fetchDebts();
  }, [activeTab, statusFilter]);

  const fetchDebts = async () => {
    setLoading(true);
    try {
      const res = await debtService.getDebts({ 
        type: activeTab, 
        status: statusFilter, 
        search: search 
      });
      setDebts(res.data.data);
    } catch (err) {
      toast.error('Sync failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await debtService.createDebt(newRecord);
      toast.success('Record synchronized');
      setShowModal(false);
      fetchDebts();
      setNewRecord({
        type: activeTab,
        name: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
        status: 'Pending'
      });
    } catch (err) {
      toast.error('Record failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSettle = async (id) => {
    try {
      await debtService.settleDebt(id);
      toast.success('Balance updated');
      fetchDebts();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await debtService.recordPayment(paymentData.id, {
        amount: parseNumber(paymentData.amount),
        note: paymentData.note
      });
      toast.success('Payment recorded');
      setShowPaymentModal(false);
      setPaymentData({ id: null, amount: '', note: '' });
      fetchDebts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Erase this record from history?')) return;
    try {
      await debtService.deleteDebt(id);
      toast.success('Record purged');
      fetchDebts();
    } catch (err) {
      toast.error('Purge failed');
    }
  };

  const totalOutstanding = debts.reduce((acc, curr) => {
    if (curr.status === 'Settled') return acc;
    return acc + (curr.amount - (curr.amountPaid || 0));
  }, 0);

  return (
    <div className="space-y-6 animate-fade-in text-left pb-10">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-left">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-text-main tracking-tighter uppercase leading-none">Debtors & Creditors</h2>
          <p className="text-[9px] md:text-[10px] text-text-muted font-bold uppercase tracking-widest mt-2 md:mt-3 border-l-2 border-primary/20 pl-2">Balance Ledger & Collections</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
           <Button icon={Plus} onClick={() => { setNewRecord({...newRecord, type: activeTab}); setShowModal(true); }} className="w-full md:w-auto">Record Balance</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
         <div className="bg-white border border-border-light rounded-md p-6 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Total {activeTab}s</p>
               <p className="text-2xl font-black text-text-main tracking-tighter tabular-nums">₦{totalOutstanding.toLocaleString()}</p>
            </div>
            <div className={`w-12 h-12 ${activeTab === 'Debtor' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'} rounded-md flex items-center justify-center`}>
               <Users className="w-5 h-5" />
            </div>
         </div>
         <div className="bg-white border border-border-light rounded-md p-6 shadow-sm flex items-center justify-between opacity-60">
            <div>
               <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Settled this Month</p>
               <p className="text-2xl font-black text-text-main tracking-tighter tabular-nums">₦0.00</p>
            </div>
            <div className="w-12 h-12 bg-neutral text-text-muted rounded-md flex items-center justify-center">
               <CheckCircle2 className="w-5 h-5" />
            </div>
         </div>
         <div className="bg-white border border-border-light rounded-md p-6 shadow-sm flex items-center justify-between border-dashed">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-accent text-white rounded-full flex items-center justify-center shadow-lg">
                  <ShieldCheck className="w-5 h-5" />
               </div>
               <div className="text-left">
                  <p className="text-[10px] font-black text-text-main uppercase tracking-widest">Global Audit</p>
                  <p className="text-[9px] text-text-muted font-bold uppercase mt-0.5">Status: Synchronized</p>
               </div>
            </div>
         </div>
      </div>

      {/* Main Ledger Section */}
      <div className="bg-white border border-border-light rounded-md shadow-sm overflow-hidden flex flex-col min-h-[500px] text-left">
         <div className="border-b border-border-light flex flex-col md:flex-row items-stretch md:items-center">
            {/* Tabs */}
            <div className="flex border-b md:border-b-0 md:border-r border-border-light divide-x divide-border-light">
               {['Debtor', 'Creditor'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 md:flex-none px-6 md:px-8 py-4 md:py-5 text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-primary border-b-2 border-b-primary' : 'bg-neutral text-text-muted hover:bg-neutral hover:text-text-main'}`}
                  >
                    {tab}s
                  </button>
               ))}
            </div>

            {/* Filters */}
            <div className="flex-1 p-4 flex flex-col md:flex-row gap-4 items-center justify-between bg-neutral/30">
               <div className="relative w-full md:w-64 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted opacity-40 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search ledger..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && fetchDebts()}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-border-light rounded-md text-[11px] font-black uppercase tracking-widest focus:border-primary outline-none transition-all shadow-sm"
                  />
               </div>

               <div className="flex items-center gap-4">
                  <div className="flex bg-white p-1 rounded-md border border-border-light shadow-sm overflow-x-auto">
                     {['Active', 'Settled'].map(s => (
                        <button
                          key={s}
                          onClick={() => setStatusFilter(s)}
                          className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${statusFilter === s ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:text-text-main'}`}
                        >
                          {s}
                        </button>
                     ))}
                  </div>
               </div>
            </div>
         </div>

         {loading ? (
            <div className="flex-1 flex items-center justify-center p-20">
               <Loader size="xl" />
            </div>
         ) : debts.length > 0 ? (
            <div className="overflow-x-auto no-scrollbar">
               <table className="w-full text-left">
                   <thead>
                      <tr className="border-b border-border-light bg-neutral/10 whitespace-nowrap">
                         <th className="px-6 md:px-8 py-4 md:py-5 text-[10px] font-black text-text-muted uppercase tracking-widest leading-none text-left min-w-[250px]">Subject / Identity</th>
                         <th className="px-6 md:px-8 py-4 md:py-5 text-[10px] font-black text-text-muted uppercase tracking-widest leading-none text-center min-w-[150px]">Reference Date</th>
                         <th className="px-6 md:px-8 py-4 md:py-5 text-[10px] font-black text-text-muted uppercase tracking-widest leading-none text-right min-w-[150px]">Outstanding Bal</th>
                         <th className="px-6 md:px-8 py-4 md:py-5 text-[10px] font-black text-text-muted uppercase tracking-widest leading-none text-right min-w-[150px]">Actions</th>
                      </tr>
                   </thead>
                  <tbody className="divide-y divide-border-light">
                     {debts.map(item => (
                        <React.Fragment key={item._id}>
                           <tr className={`group transition-colors ${expandedId === item._id ? 'bg-neutral/30' : 'hover:bg-neutral/30'}`}>
                              <td className="px-6 md:px-8 py-4 md:py-6">
                                 <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${['Pending', 'Partially Paid'].includes(item.status) ? 'bg-neutral text-text-muted/60 shadow-inner' : 'bg-primary/10 text-primary shadow-inner'}`}>
                                       {['Pending', 'Partially Paid'].includes(item.status) ? <Clock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                    </div>
                                    <div className="min-w-0 flex flex-col items-start cursor-pointer" onClick={() => setExpandedId(expandedId === item._id ? null : item._id)}>
                                       <div className="flex items-center gap-2">
                                          <p className="text-[13px] font-black text-text-main leading-none uppercase truncate">{item.name}</p>
                                          {item.status === 'Partially Paid' && <span className="text-[8px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Part Paid</span>}
                                       </div>
                                       <p className="text-[10px] text-text-muted font-bold mt-2 uppercase tracking-tighter truncate opacity-70 italic">{item.description || 'No memo'}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 md:px-8 py-4 md:py-6 text-center">
                                 <p className="text-[11px] font-black text-text-main/80 uppercase tabular-nums">{new Date(item.date).toLocaleDateString()}</p>
                                 {item.dueDate && (
                                    <p className="text-[9px] text-secondary font-black mt-1 uppercase tracking-tighter">Due: {new Date(item.dueDate).toLocaleDateString()}</p>
                                 )}
                              </td>
                              <td className="px-6 md:px-8 py-4 md:py-6 text-right">
                                 <p className={`text-[16px] font-black tabular-nums leading-none ${activeTab === 'Debtor' ? 'text-primary' : 'text-secondary'}`}>₦{(item.amount - (item.amountPaid || 0)).toLocaleString()}</p>
                                 {(item.amountPaid > 0) && <p className="text-[9px] text-text-muted font-bold mt-1 uppercase tracking-tighter">Total: ₦{item.amount.toLocaleString()}</p>}
                              </td>
                           <td className="px-6 md:px-8 py-4 md:py-6 text-right">
                               <div className="flex flex-col sm:flex-row items-center justify-end gap-2 text-left">
                                  {item.paymentHistory?.length > 0 && (
                                     <button 
                                       onClick={() => { setHistoryData(item); setShowHistoryModal(true); }}
                                       className="w-full sm:w-auto px-4 py-2 bg-neutral text-text-main border border-border-light rounded-md text-[9px] font-black uppercase tracking-widest hover:bg-white hover:border-primary transition-all shadow-sm whitespace-nowrap"
                                     >
                                        History
                                     </button>
                                  )}
                                  {['Pending', 'Partially Paid'].includes(item.status) && (
                                     <>
                                      <button 
                                        onClick={() => { setPaymentData({ id: item._id, amount: '', note: '' }); setShowPaymentModal(true); }}
                                        className="w-full sm:w-auto px-4 py-2 bg-secondary/10 text-secondary border border-secondary/20 rounded-md text-[9px] font-black uppercase tracking-widest hover:bg-secondary hover:text-white transition-all shadow-sm whitespace-nowrap"
                                      >
                                         Part Pay
                                      </button>
                                      <button 
                                        onClick={() => handleSettle(item._id)}
                                        className="w-full sm:w-auto px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-md text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm"
                                      >
                                         Settle
                                      </button>
                                     </>
                                  )}
                                  <button 
                                    onClick={() => handleDelete(item._id)}
                                    className="p-2 text-text-muted/40 hover:text-secondary hover:bg-secondary/5 rounded-md transition-all"
                                  >
                                     <Trash2 className="w-4 h-4" />
                                  </button>
                               </div>
                            </td>
                        </tr>
                        {expandedId === item._id && item.paymentHistory?.length > 0 && (
                           <tr className="bg-neutral/10 border-b border-border-light">
                              <td colSpan="4" className="p-4 md:p-6">
                                 <div className="bg-white rounded-md border border-border-light p-4 shadow-inner">
                                    <p className="text-[10px] font-black text-text-neutral uppercase tracking-widest mb-3 text-text-muted">Payment History Log</p>
                                    <div className="space-y-2">
                                       {item.paymentHistory.map((ph, idx) => (
                                          <div key={idx} className="flex justify-between items-center bg-neutral/30 px-4 py-3 rounded-md text-[11px] font-black uppercase tracking-tighter">
                                             <div className="flex items-center gap-3">
                                                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                                                <span className="text-text-main/80">{new Date(ph.date).toLocaleDateString()}</span>
                                                {ph.note && <span className="text-[9px] text-text-muted opacity-70 ml-2 italic normal-case">- {ph.note}</span>}
                                             </div>
                                             <span className="text-secondary tabular-nums">₦{ph.amount.toLocaleString()}</span>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              </td>
                           </tr>
                        )}
                        </React.Fragment>
                     ))}
                  </tbody>
               </table>
            </div>
         ) : (
            <div className="flex-1">
               <EmptyState 
                  title={`Zero ${activeTab} Records`} 
                  message={`Your ${activeTab} ledger is currently clear. No pending balances detected for this category.`}
                  action={<Button variant="neutral" onClick={() => setShowModal(true)}>Record Manual Balance</Button>}
               />
            </div>
         )}
      </div>

      {/* Record Entry Modal */}
      {showModal && (
          <div className="fixed inset-0 bg-accent/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
             <div className="bg-white border border-border-light rounded-2xl w-full max-w-2xl shadow-3xl animate-in zoom-in-95 duration-300 overflow-hidden text-left">
                <div className="p-6 md:p-8 border-b border-border-light flex items-center justify-between shrink-0 bg-neutral/50">
                  <div className="flex items-center gap-4">
                     <div className={`w-10 h-10 md:w-12 md:h-12 ${activeTab === 'Debtor' ? 'bg-primary' : 'bg-secondary'} text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 text-left`}>
                        <UserPlus className="w-5 h-5 md:w-6 md:h-6" />
                     </div>
                     <div className="text-left">
                        <h3 className="text-xl font-black text-text-main uppercase tracking-tighter leading-none">Record {activeTab}</h3>
                        <p className="text-[10px] text-text-muted font-black tracking-[0.2em] uppercase mt-2">Balance Entry Form</p>
                     </div>
                  </div>
                  <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full hover:bg-neutral flex items-center justify-center transition-all">
                     <Trash2 className="w-4 h-4 text-text-muted opacity-40 hover:opacity-100" />
                  </button>
               </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 md:space-y-8 text-left no-scrollbar">
                  <div className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-full">
                           <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 block text-left">Subject Identity</label>
                           <div className="relative group">
                              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted opacity-40 group-focus-within:text-primary transition-colors text-left" />
                              <input 
                                type="text" 
                                required
                                value={newRecord.name}
                                onChange={(e) => setNewRecord({...newRecord, name: e.target.value})}
                                className="w-full pl-10 pr-4 py-3 bg-neutral/30 border border-border-light rounded-xl text-sm font-black uppercase tracking-tight focus:bg-white focus:border-primary outline-none transition-all shadow-inner text-left" 
                                placeholder="Enter identity..."
                              />
                           </div>
                        </div>
                        <div>
                           <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 block text-left">Principal Amount (₦)</label>
                           <div className="relative group">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted opacity-40 group-focus-within:text-primary transition-colors text-left" />
                              <input 
                                type="text" 
                                required
                                value={formatNumber(newRecord.amount)}
                                onChange={(e) => setNewRecord({...newRecord, amount: parseNumber(e.target.value)})}
                                className="w-full pl-10 pr-4 py-3.5 bg-neutral border border-border-light rounded-xl text-sm font-black uppercase tracking-tight focus:bg-white focus:border-primary outline-none transition-all shadow-inner text-left" 
                                placeholder="0.00"
                              />
                           </div>
                        </div>
                        <div>
                           <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 block text-left">Balance Date</label>
                           <div className="relative group">
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted opacity-40 group-focus-within:text-primary transition-colors text-left" />
                              <input 
                                type="date" 
                                value={newRecord.date}
                                onChange={(e) => setNewRecord({...newRecord, date: e.target.value})}
                                className="w-full pl-10 pr-4 py-3 bg-neutral/30 border border-border-light rounded-xl text-[11px] font-black uppercase tracking-tight focus:bg-white focus:border-primary outline-none transition-all shadow-inner text-left" 
                              />
                           </div>
                        </div>
                        <div className="col-span-full">
                           <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 block text-left">Memo / Context</label>
                           <textarea 
                             value={newRecord.description}
                             onChange={(e) => setNewRecord({...newRecord, description: e.target.value})}
                             className="w-full px-4 py-3 bg-neutral/30 border border-border-light rounded-xl text-sm font-bold focus:bg-white focus:border-primary outline-none transition-all shadow-inner min-h-[80px] italic text-text-main text-left" 
                             placeholder="Provide context for this balance..."
                           />
                        </div>
                     </div>
                  </div>

                  <div className="pt-6 border-t border-border-light flex gap-4">
                     <Button variant="neutral" onClick={() => setShowModal(false)} type="button" className="flex-1 !py-4 font-black">Discard</Button>
                     <Button type="submit" loading={submitting} className={`flex-[2] !py-4 font-black uppercase tracking-widest ${activeTab === 'Debtor' ? '!bg-primary hover:!bg-accent' : '!bg-secondary hover:!bg-accent'}`}>Commit to Ledger</Button>
                  </div>
               </form>
            </div>
         </div>
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && (
          <div className="fixed inset-0 bg-accent/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
             <div className="bg-white border border-border-light rounded-2xl w-full max-w-sm shadow-3xl animate-in zoom-in-95 duration-300 overflow-hidden text-left">
                <div className="p-6 border-b border-border-light flex items-center justify-between shrink-0 bg-neutral/50">
                  <div className="text-left">
                     <h3 className="text-xl font-black text-text-main uppercase tracking-tighter leading-none">Record Part Payment</h3>
                     <p className="text-[10px] text-text-muted font-black tracking-[0.2em] uppercase mt-2">Update Balance</p>
                  </div>
                  <button onClick={() => setShowPaymentModal(false)} className="w-8 h-8 rounded-full hover:bg-neutral flex items-center justify-center transition-all">
                     <Trash2 className="w-4 h-4 text-text-muted opacity-40 hover:opacity-100" />
                  </button>
               </div>

                <form onSubmit={handlePayment} className="p-6 space-y-6 text-left">
                   <div>
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 block text-left">Payment Amount (₦)</label>
                      <div className="relative group">
                         <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted opacity-40 group-focus-within:text-primary transition-colors text-left" />
                         <input 
                           type="text" 
                           required
                           value={formatNumber(paymentData.amount)}
                           onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                           className="w-full pl-10 pr-4 py-3 bg-neutral border border-border-light rounded-xl text-sm font-black uppercase tracking-tight focus:bg-white focus:border-primary outline-none transition-all shadow-inner text-left" 
                           placeholder="0.00"
                         />
                      </div>
                   </div>
                   <div>
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3 block text-left">Note (Optional)</label>
                      <input 
                        type="text" 
                        value={paymentData.note}
                        onChange={(e) => setPaymentData({...paymentData, note: e.target.value})}
                        className="w-full px-4 py-3 bg-neutral/30 border border-border-light rounded-xl text-sm font-bold focus:bg-white focus:border-primary outline-none transition-all shadow-inner text-left" 
                        placeholder="e.g. First Installment"
                      />
                   </div>

                  <div className="pt-4 border-t border-border-light flex gap-4">
                     <Button type="submit" loading={submitting} className="w-full !py-4 font-black uppercase tracking-widest !bg-secondary hover:!bg-accent">Submit Payment</Button>
                  </div>
               </form>
            </div>
         </div>
      )}

      {/* History Modal */}
      {showHistoryModal && historyData && (
          <div className="fixed inset-0 bg-accent/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
             <div className="bg-white border border-border-light rounded-2xl w-full max-w-lg shadow-3xl animate-in zoom-in-95 duration-300 overflow-hidden text-left flex flex-col max-h-[80vh]">
                <div className="p-6 border-b border-border-light flex items-center justify-between shrink-0 bg-neutral/50">
                  <div className="text-left">
                     <h3 className="text-xl font-black text-text-main uppercase tracking-tighter leading-none">Payment History</h3>
                     <p className="text-[10px] text-text-muted font-black tracking-[0.2em] uppercase mt-2">{historyData.name} - Total: ₦{historyData.amount.toLocaleString()}</p>
                  </div>
                  <button onClick={() => { setShowHistoryModal(false); setHistoryData(null); }} className="w-8 h-8 rounded-full hover:bg-neutral flex items-center justify-center transition-all">
                     <Trash2 className="w-4 h-4 text-text-muted opacity-40 hover:opacity-100" />
                  </button>
               </div>

               <div className="p-6 overflow-y-auto flex-1 no-scrollbar space-y-3">
                   {historyData.paymentHistory?.length > 0 ? (
                       historyData.paymentHistory.map((ph, idx) => (
                           <div key={idx} className="flex justify-between items-center bg-neutral/30 px-5 py-4 rounded-xl border border-border-light">
                              <div className="flex flex-col text-left">
                                 <span className="text-[12px] font-black text-text-main uppercase tracking-widest">{new Date(ph.date).toLocaleDateString()} {new Date(ph.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                 {ph.note && <span className="text-[10px] text-text-muted mt-1 italic font-bold">Memo: {ph.note}</span>}
                              </div>
                              <span className="text-[16px] font-black text-secondary tabular-nums">₦{ph.amount.toLocaleString()}</span>
                           </div>
                       ))
                   ) : (
                       <div className="text-center py-6">
                           <p className="text-[11px] font-black text-text-muted uppercase tracking-widest">No previous payments recorded.</p>
                       </div>
                   )}
               </div>

               <div className="p-5 border-t border-border-light shrink-0 bg-neutral/10 flex justify-between items-center">
                   <div className="text-left">
                       <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Remaining Balance</p>
                       <p className="text-[18px] font-black text-primary tabular-nums leading-none">₦{(historyData.amount - (historyData.amountPaid || 0)).toLocaleString()}</p>
                   </div>
                   <Button variant="neutral" onClick={() => { setShowHistoryModal(false); setHistoryData(null); }} className="!py-3 font-black">Close Log</Button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default Debts;
