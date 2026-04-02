import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { transportService } from '../services/transportService';
import { 
  ArrowLeft, 
  Truck, 
  MapPin, 
  User, 
  Calendar, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  Settings, 
  ShieldCheck,
  History,
  Activity,
  DollarSign
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';
import Loader from '../components/ui/Loader';
import Button from '../components/ui/Button';

const CarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCarDetails();
  }, [id]);

  const fetchCarDetails = async () => {
    try {
      const res = await transportService.getCarDetails(id);
      setCar(res.data);
    } catch (err) {
      toast.error('Failed to load asset intelligence');
      navigate('/transport');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader size="xl" /></div>;
  if (!car) return null;

  const totalRevenue = (car.payments || []).reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const totalExpenses = (car.expenses || []).reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const netProfit = totalRevenue - totalExpenses;

  const chartData = [...(car.payments || []), ...(car.expenses || [])]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-7)
    .map(entry => ({
      name: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: (car.payments || []).find(p => p._id === entry._id) ? Number(entry.amount) : 0,
      expense: (car.expenses || []).find(e => e._id === entry._id) ? Number(entry.amount) : 0
    }));

  return (
    <div className="space-y-8 animate-fade-in text-left pb-12 italic">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/transport')} className="p-2 bg-white border border-border-light rounded-md text-text-muted hover:text-text-main transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-3xl font-black text-text-main tracking-tighter uppercase leading-none">{car.plateNumber}</h2>
          <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-2">{car.model} <span className="opacity-30 mx-2">|</span> Operational Intelligence</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <StatItem label="REVENUE" value={`₦${totalRevenue.toLocaleString()}`} icon={<ArrowUpRight className="text-primary" />} color="primary" />
        <StatItem label="EXPENSES" value={`₦${totalExpenses.toLocaleString()}`} icon={<ArrowDownRight className="text-secondary" />} color="secondary" />
        <StatItem label="NET PROFIT" value={`₦${netProfit.toLocaleString()}`} icon={<TrendingUp className="text-primary" />} color="primary" highlight={true} />
        <StatItem label="PAYMENTS COLLECTED" value={(car.payments?.length || 0).toString()} icon={<Activity className="text-primary" />} color="primary" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
           <div className="bg-white border border-border-light rounded-md p-8 shadow-sm">
             <h4 className="text-[10px] font-black text-text-main uppercase tracking-[0.2em] mb-10 flex items-center gap-2">Performance trajectory</h4>
             <div className="h-[300px] w-full text-left">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3EED4" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#6B9071'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#6B9071'}} />
                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase'}} />
                    <Area type="monotone" dataKey="revenue" stroke="#375534" strokeWidth={3} fillOpacity={0.1} fill="#375534" />
                    <Area type="monotone" dataKey="expense" stroke="#6B9071" strokeWidth={3} fill="transparent" />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
           </div>

           <div className="bg-white border border-border-light rounded-md overflow-hidden shadow-sm">
             <div className="p-6 border-b border-border-light text-left"><h4 className="text-[10px] font-black text-text-main uppercase tracking-widest">Recent Settlements</h4></div>
             <table className="w-full text-left">
                <tbody className="divide-y divide-neutral italic">
                   {(car.payments || []).slice(0, 5).map((p, idx) => (
                     <tr key={idx}>
                        <td className="px-6 py-4 text-[13px] font-bold text-text-main">{new Date(p.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-[13px] font-black text-primary text-left">₦{Number(p.amount).toLocaleString()}</td>
                        <td className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-text-muted opacity-40 text-left">Driver Settlement</td>
                     </tr>
                   ))}
                </tbody>
             </table>
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-accent rounded-md p-8 text-white shadow-xl shadow-accent/20">
              <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">Unit Summary</h4>
              <div className="space-y-6 text-left">
                 <InfoRow label="Operator" value={car.driverName} />
                 <InfoRow label="Registration" value={car.plateNumber} />
                 <InfoRow label="Deployment" value={car.status} status={true} />
              </div>
           </div>
           <div className="bg-white border border-border-light rounded-md p-6">
              <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-6 text-left">Recent Expenses</h4>
              <div className="space-y-4">
                 {(car.expenses || []).slice(0, 4).map((e, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                       <span className="font-bold text-text-muted uppercase text-left">{e.category}</span>
                       <span className="font-black text-secondary text-left">₦{Number(e.amount).toLocaleString()}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ label, value, icon, color, highlight }) => (
  <div className={`bg-white border border-border-light rounded-md p-6 shadow-sm ${highlight ? 'ring-1 ring-primary/20' : ''}`}>
    <div className="flex justify-between items-center mb-4">
       <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">{label}</span>
       <div className={`w-8 h-8 rounded-md bg-${color}/10 flex items-center justify-center`}>{icon}</div>
    </div>
    <p className={`text-2xl font-black text-text-main tracking-tighter tabular-nums`}>{value}</p>
  </div>
);

const InfoRow = ({ label, value, status }) => (
  <div className="flex justify-between items-center py-1 border-b border-white/5 pb-3">
    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{label}</span>
    <span className={`text-[13px] font-black ${status ? 'px-2 py-0.5 bg-primary text-white rounded-md text-[9px]' : ''}`}>{value}</span>
  </div>
);

export default CarDetail;
