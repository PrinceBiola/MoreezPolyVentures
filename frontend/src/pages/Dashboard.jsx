import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TrendingUp, TrendingDown, DollarSign, Truck, 
  ArrowUpRight, ArrowDownRight, Download, Search, 
  Settings, Bell, HelpCircle, User, Calendar
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import Loader from '../components/ui/Loader';
import { dashboardService } from '../services/dashboardService';

import { useDashboardStats } from '../hooks/useApi';

const Dashboard = () => {
  // Date states initialized to current month
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const { data, isLoading, isError } = useDashboardStats(startDate, endDate);

  if (isLoading && !data) return <div className="h-full flex items-center justify-center"><Loader size="xl" /></div>;
  if (isError || !data) return <div className="p-10 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Failed to synchronize system metrics. Check connection.</div>;

  const { metrics, fleet, recentSales, recentExpenses, cashFlow } = data;

  return (
    <div className="space-y-6 animate-fade-in pb-12 font-sans text-left">
      {/* Main Title Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Dashboard</h2>
          <p className="text-slate-400 font-bold text-[11px] tracking-tight mt-1.5 uppercase">Operational performance for selected period.</p>
        </div>
        <div className="flex items-center gap-4 bg-white border border-slate-200 px-4 py-2 rounded-md shadow-sm">
          <div className="flex items-center gap-3">
             <div className="flex flex-col">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Start Date</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-[11px] font-black text-slate-700 uppercase tracking-tight focus:outline-none cursor-pointer border-none p-0"
                />
             </div>
             <div className="w-px h-8 bg-slate-100 mx-2" />
             <div className="flex flex-col">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">End Date</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-[11px] font-black text-slate-700 uppercase tracking-tight focus:outline-none cursor-pointer border-none p-0"
                />
             </div>
          </div>
          <div className="bg-slate-50 p-1.5 rounded-md">
             <Calendar className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="TOTAL SALES" 
          value={`₦${metrics.totalSales.toLocaleString()}`} 
          trend="+12.4%" 
          isUp={true} 
          icon={<div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center"><DollarSign className="w-4 h-4" /></div>}
        />
        <StatCard 
          title="TOTAL EXPENSES" 
          value={`₦${metrics.totalExpenses.toLocaleString()}`} 
          trend="-2.1%" 
          isUp={false} 
          icon={<div className="w-8 h-8 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center"><TrendingDown className="w-4 h-4" /></div>}
        />
        <StatCard 
          title="NET PROFIT" 
          value={`₦${metrics.netProfit.toLocaleString()}`} 
          trend="+5.7%" 
          isUp={true} 
          icon={<div className="w-8 h-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center"><TrendingUp className="w-4 h-4" /></div>}
        />
        <StatCard 
          title="TRANSPORT INCOME" 
          value={`₦${metrics.transportIncome.toLocaleString()}`} 
          info={`Active ${fleet.active} units`} 
          icon={<div className="w-8 h-8 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center"><Truck className="w-4 h-4" /></div>}
        />
      </div>

      {/* Chart Section */}
      <div className="bg-white border border-slate-200 rounded-md p-8 shadow-sm">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tighter uppercase">Cash Flow Analysis</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Revenue & Expenses Overview</p>
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">SALES</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">EXPENSES</span>
            </div>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cashFlow} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 900, fill: '#cbd5e1' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 900, fill: '#cbd5e1' }} 
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
              <Bar dataKey="expenses" fill="#f87171" opacity={0.4} radius={[4, 4, 0, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables Region */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Ledger */}
        <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-sm font-black text-slate-900 tracking-tighter uppercase">Recent Sales Ledger</h3>
            <button className="text-[9px] font-black text-emerald-600 uppercase tracking-widest hover:underline transition-all">View All</button>
          </div>
          <table className="table-pro">
            <thead>
              <tr>
                <th className="!py-4">ORDER ID</th>
                <th>CLIENT</th>
                <th className="text-right">AMOUNT</th>
                <th className="text-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentSales.map((sale, idx) => (
                <tr key={sale._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="!py-4 text-[11px] font-black text-slate-400">#SL-{sale._id.slice(-4).toUpperCase()}</td>
                  <td className="text-slate-900 font-black">{sale.customerName}</td>
                  <td className="text-right font-black text-slate-900">₦{(sale.totalAmount || 0).toLocaleString()}</td>
                  <td className="text-center">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[8px] font-black uppercase tracking-widest border border-emerald-100">PAID</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Expense Ledger */}
        <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden flex flex-col relative">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-sm font-black text-slate-900 tracking-tighter uppercase">Recent Operating Expenses</h3>
            <button className="text-[9px] font-black text-emerald-600 uppercase tracking-widest hover:underline transition-all">View All</button>
          </div>
          <table className="table-pro">
            <thead>
              <tr>
                <th className="!py-4">REF ID</th>
                <th>CATEGORY</th>
                <th className="text-right">AMOUNT</th>
                <th className="text-right">DATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentExpenses.map((expense, idx) => (
                <tr key={expense._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="!py-4 text-[11px] font-black text-slate-400">#EX-{4110 + idx}</td>
                  <td className="text-slate-900 font-bold">{expense.category}</td>
                  <td className="text-right font-black text-rose-500">₦{expense.amount.toLocaleString()}</td>
                  <td className="text-right text-[11px] font-black text-slate-400 uppercase">{new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="absolute bottom-6 right-6 w-10 h-10 bg-emerald-600 text-white rounded-md shadow-xl shadow-emerald-200 flex items-center justify-center hover:bg-emerald-700 transition-all active:scale-[0.95]">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Fleet Footer Panel */}
      <div className="bg-[#0f172a] rounded-md p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        {/* Watermark in mini panel */}
        <div className="absolute -bottom-8 -right-4 text-9xl font-black text-white/[0.03] select-none pointer-events-none tracking-tighter">MM</div>
        
        <div className="relative z-10 text-left">
          <h4 className="text-white font-black uppercase tracking-tighter text-lg mb-2">Transport Status</h4>
          <p className="text-slate-400 text-sm font-medium max-w-lg leading-relaxed">
            {fleet.total > 0 ? (
              <>
                <span className="text-emerald-500 font-black">{Math.round((fleet.active / fleet.total) * 100)}%</span> of your fleet is currently operational. 
                {fleet.repairing > 0 ? ` ${fleet.repairing} vehicles are currently in maintenance.` : ' All vehicles are active or in transit.'} 
                No delays reported in major routes.
              </>
            ) : (
              'No fleet data detected. Status monitoring will initialize once vehicles are registered in the transport terminal.'
            )}
          </p>
        </div>

        <div className="flex gap-10 items-center shrink-0">
          <FleetStat label="ACTIVE" value={fleet.total} color="text-emerald-500" />
          <FleetStat label="REPAIRING" value={fleet.repairing} color="text-amber-500" />
          <FleetStat label="OFFLINE" value={fleet.offline} color="text-rose-500" />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, trend, isUp, info, icon }) => (
  <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-6">
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</div>
      {icon}
    </div>
    <div className="text-2xl font-black text-slate-900 tracking-tighter mb-2">{value}</div>
    <div className="flex items-center gap-2">
      {trend && (
        <span className={`flex items-center gap-0.5 text-[10px] font-black ${isUp ? 'text-emerald-600' : 'text-rose-500'}`}>
          {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </span>
      )}
      {info ? (
        <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1.5 focus:scale-110 cursor-default">
           <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
           {info}
        </span>
      ) : (
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-tight italic">vs last week</span>
      )}
    </div>
  </div>
);

const FleetStat = ({ label, value, color }) => (
  <div className="text-center">
    <div className={`text-3xl font-black ${color} tracking-tighter mb-1`}>{String(value).padStart(2, '0')}</div>
    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</div>
  </div>
);

export default Dashboard;
