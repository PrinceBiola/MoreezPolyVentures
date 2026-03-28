import React, { useState, useEffect } from 'react';
import { transportService } from '../services/transportService';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Truck, 
  User, 
  Trash2, 
  ChevronRight, 
  Edit2, 
  Clock, 
  Wrench, 
  AlertOctagon, 
  CheckCircle2,
  Search
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import DeactivateModal from '../components/ui/DeactivateModal';

const Transport = () => {
  const [cars, setCars] = useState([]);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingCar, setSubmittingCar] = useState(false);
  
  const [showCarModal, setShowCarModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [carToDeactivate, setCarToDeactivate] = useState(null);
  
  const [newCar, setNewCar] = useState({ model: '', driverName: '', plateNumber: '', status: 'Active' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = searchTerm ? { search: searchTerm } : {};
      const [carsRes, paymentsRes, expensesRes] = await Promise.all([
        transportService.getCars(params),
        transportService.getPayments(),
        transportService.getExpenses()
      ]);
      setCars(carsRes.data);
      setPayments(paymentsRes.data);
      setExpenses(expensesRes.data);
    } catch (err) {
      toast.error('Fleet sync failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = (car) => {
    setCarToDeactivate(car);
    setShowDeactivateModal(true);
  };

  const handleConfirmDeactivate = async () => {
    if (!carToDeactivate) return;
    setSubmittingCar(true);
    try {
      await transportService.deleteCar(carToDeactivate._id);
      toast.success('Vehicle deactivated');
      setShowDeactivateModal(false);
      setCarToDeactivate(null);
      fetchData();
    } catch (err) {
      toast.error('Deactivation failed');
    } finally {
      setSubmittingCar(false);
    }
  };

  const getVehiclePerformance = (carId) => {
    const vehiclePayments = payments.filter(p => (p.carId?._id === carId || p.carId === carId));
    const vehicleExpenses = expenses.filter(e => (e.carId?._id === carId || e.carId === carId));

    const revenue = vehiclePayments.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const costs = vehicleExpenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const net = revenue - costs;

    return { revenue, costs, net };
  };

  const handleAddCar = async (e) => {
    e.preventDefault();
    setSubmittingCar(true);
    try {
      await transportService.addCar(newCar);
      toast.success('Vehicle added');
      setShowCarModal(false);
      fetchData();
      setNewCar({ model: '', driverName: '', plateNumber: '', status: 'Active' });
    } catch (err) {
      toast.error('Failed to add vehicle');
    } finally {
      setSubmittingCar(false);
    }
  };

  const handleUpdateCar = async (e) => {
    e.preventDefault();
    setSubmittingCar(true);
    try {
      await transportService.updateCar(editingCar._id, editingCar);
      toast.success('Vehicle updated');
      setShowEditModal(false);
      setEditingCar(null);
      fetchData();
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setSubmittingCar(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!carToDelete) return;
    setSubmittingCar(true);
    try {
      await transportService.deleteCar(carToDelete._id);
      toast.success('Asset removed from fleet');
      setShowDeleteModal(false);
      setCarToDelete(null);
      fetchData();
    } catch (err) {
      toast.error('Decommissioning failed');
    } finally {
      setSubmittingCar(false);
    }
  };

  const getStatusUI = (status) => {
    switch (status) {
      case 'Active': return { icon: <CheckCircle2 className="w-3 h-3" />, bg: 'bg-emerald-50 text-emerald-600 border-emerald-100', label: 'Active' };
      case 'Maintenance': return { icon: <Wrench className="w-3 h-3" />, bg: 'bg-slate-100 text-slate-500 border-slate-200', label: 'Maintenance' };
      case 'Impounded': return { icon: <AlertOctagon className="w-3 h-3" />, bg: 'bg-rose-50 text-rose-600 border-rose-100', label: 'Impounded' };
      default: return { icon: <CheckCircle2 className="w-3 h-3" />, bg: 'bg-emerald-50 text-emerald-600 border-emerald-100', label: 'Active' };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-sm text-left pb-10 italic">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Vehicles</h2>
          <p className="text-slate-400 font-bold text-[11px] uppercase tracking-tight mt-2">Manage and monitor your logistics fleet.</p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
           <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                type="text" 
                placeholder="Search fleet..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-md text-xs font-bold focus:border-emerald-500 outline-none transition-all italic" 
              />
           </div>
           <Button onClick={() => setShowCarModal(true)} icon={Plus}>Add Vehicle</Button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader size="lg" /></div>
      ) : cars.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars.map(car => {
            const performance = getVehiclePerformance(car._id);
            const statusUI = getStatusUI(car.status || 'Active');
            
            return (
              <div key={car._id} className="bg-white border border-slate-200 rounded-md p-6 shadow-sm hover:shadow-md transition-all group flex flex-col relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                   <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">{car.plateNumber}</h3>
                   <div className="flex items-center gap-1">
                      <button 
                        onClick={() => { setEditingCar({...car}); setShowEditModal(true); }}
                        className="p-2 text-slate-300 hover:text-blue-500 transition-colors"
                      >
                         <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeactivate(car)}
                        className="p-2 text-slate-300 hover:text-amber-500 transition-colors"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
                  {car.model} <span className="opacity-30 mx-1.5">·</span> {car.driverName}
                </p>
                
                <div className="bg-slate-50 rounded-md p-4 mb-6 grid grid-cols-3 gap-2 border border-slate-100/50">
                   <div className="text-left border-r border-slate-200/50">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 opacity-70">Revenue</p>
                      <p className="text-[13px] font-black text-slate-900 tabular-nums">₦{performance.revenue.toLocaleString()}</p>
                   </div>
                   <div className="text-left border-r border-slate-200/50 px-2">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 opacity-70">Costs</p>
                      <p className="text-[13px] font-black text-slate-900 tabular-nums">₦{performance.costs.toLocaleString()}</p>
                   </div>
                   <div className="text-right px-2">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 opacity-70">Net</p>
                      <p className={`text-[13px] font-black tabular-nums ${performance.net >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                         ₦{performance.net.toLocaleString()}
                      </p>
                   </div>
                </div>

                <div className="mt-auto flex justify-between items-center">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${statusUI.bg} rounded-md text-[9px] font-black uppercase tracking-widest border`}>
                    {statusUI.icon}
                    {statusUI.label}
                  </span>
                  <Link 
                    to={`/transport/${car._id}`}
                    className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:translate-x-1 transition-transform"
                  >
                     View Details <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState 
          title="No Vehicles" 
          message="No active vehicles found."
          icon={Truck}
          action={<Button onClick={() => setShowCarModal(true)} icon={Plus}>Add Vehicle</Button>}
        />
      )}

      {showCarModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-md w-full max-w-lg p-10 shadow-3xl animate-in zoom-in-95 duration-200 text-left">
            <h3 className="text-xl font-black text-slate-900 mb-8 tracking-tighter uppercase flex items-center gap-3 leading-none">
               Add Vehicle
            </h3>
            <form onSubmit={handleAddCar} className="space-y-6">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-widest text-left">Model Name</label>
                <input type="text" value={newCar.model} onChange={(e) => setNewCar({...newCar, model: e.target.value})} className="input-pro" placeholder="e.g. TOYOTA HIACE" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-widest text-left">Operator</label>
                  <input type="text" value={newCar.driverName} onChange={(e) => setNewCar({...newCar, driverName: e.target.value})} className="input-pro" required />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-widest text-left">Plate Number</label>
                  <input type="text" value={newCar.plateNumber} onChange={(e) => setNewCar({...newCar, plateNumber: e.target.value})} className="input-pro" required />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <Button variant="neutral" onClick={() => setShowCarModal(false)} className="flex-1 uppercase font-black">Discard</Button>
                <Button type="submit" loading={submittingCar} className="flex-1 uppercase font-black tracking-widest">Register</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingCar && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-md w-full max-w-lg p-10 shadow-3xl animate-in zoom-in-95 duration-200 text-left">
            <h3 className="text-xl font-black text-slate-900 mb-8 tracking-tighter uppercase flex items-center gap-3 leading-none">
               Edit Vehicle
            </h3>
            <form onSubmit={handleUpdateCar} className="space-y-6">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-widest text-left">Model Name</label>
                <input type="text" value={editingCar.model} onChange={(e) => setEditingCar({...editingCar, model: e.target.value})} className="input-pro" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-widest text-left">Operator</label>
                  <input type="text" value={editingCar.driverName} onChange={(e) => setEditingCar({...editingCar, driverName: e.target.value})} className="input-pro" required />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-widest text-left">Plate Number</label>
                  <input type="text" value={editingCar.plateNumber} onChange={(e) => setEditingCar({...editingCar, plateNumber: e.target.value})} className="input-pro" required />
                </div>
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-widest text-left">Operational Status</label>
                <select 
                  value={editingCar.status} 
                  onChange={(e) => setEditingCar({...editingCar, status: e.target.value})} 
                  className="input-pro" 
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Impounded">Impounded</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <Button variant="neutral" onClick={() => setShowEditModal(false)} className="flex-1 uppercase font-black">Cancel</Button>
                <Button type="submit" loading={submittingCar} className="flex-1 uppercase font-black tracking-widest">Update</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeactivateModal 
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        onConfirm={handleConfirmDeactivate}
        loading={submittingCar}
        title="Deactivate Vehicle"
        itemName={carToDeactivate?.plateNumber}
      />
    </div>
  );
};

export default Transport;
