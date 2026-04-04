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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-text-main tracking-tighter uppercase">Dashboard</h2>
          <p className="text-text-muted font-bold text-[9px] md:text-[11px] tracking-tight mt-1 uppercase">Operational performance metrics.</p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-border-light px-3 md:px-4 py-2 rounded-md shadow-sm w-fit">
          <div className="flex items-center gap-2 md:gap-3">
             <div className="flex flex-col">
                <label className="text-[7px] md:text-[8px] font-black text-text-muted uppercase tracking-widest mb-0.5">Start</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-[10px] md:text-[11px] font-black text-text-main uppercase tracking-tight focus:outline-none cursor-pointer border-none p-0"
                />
             </div>
             <div className="w-px h-6 md:h-8 bg-neutral mx-1 md:mx-2" />
             <div className="flex flex-col">
                <label className="text-[7px] md:text-[8px] font-black text-text-muted uppercase tracking-widest mb-0.5">End</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-[10px] md:text-[11px] font-black text-text-main uppercase tracking-tight focus:outline-none cursor-pointer border-none p-0"
                />
             </div>
          </div>
          <div className="bg-neutral p-1.5 rounded-md hidden sm:block">
             <Calendar className="w-3.5 h-3.5 text-text-muted" />
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
          icon={<div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center"><DollarSign className="w-4 h-4" /></div>}
        />
        <StatCard 
          title="TOTAL EXPENSES" 
          value={`₦${metrics.totalExpenses.toLocaleString()}`} 
          trend="-2.1%" 
          isUp={false} 
          icon={<div className="w-8 h-8 rounded-md bg-secondary/10 text-secondary flex items-center justify-center"><TrendingDown className="w-4 h-4" /></div>}
        />
        <StatCard 
          title="TRANSPORT INCOME" 
          value={`₦${metrics.transportIncome.toLocaleString()}`} 
          info={`Active ${fleet.active} units`} 
          icon={<div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center"><Truck className="w-4 h-4" /></div>}
        />
        <StatCard 
          title="NET PROFIT" 
          value={`₦${metrics.netProfit.toLocaleString()}`} 
          trend="+5.7%" 
          isUp={true} 
          highlight={true}
          icon={<div className="w-8 h-8 rounded-md bg-[#375534] text-[#E3EED4] flex items-center justify-center"><TrendingUp className="w-4 h-4" /></div>}
        />
      </div>

      {/* Chart Section */}
      <div className="bg-white border border-border-light rounded-md p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-10 gap-4">
          <div>
            <h3 className="text-sm font-black text-text-main tracking-tighter uppercase">Cash Flow Analysis</h3>
            <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest mt-1">Revenue & Expenses Overview</p>
          </div>
          <div className="flex gap-4 md:gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">SALES</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-secondary" />
              <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">EXPENSES</span>
            </div>
          </div>
        </div>
        <div className="h-[300px] min-h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cashFlow} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3EED4" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 900, fill: '#6B9071' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 900, fill: '#6B9071' }} 
              />
              <Tooltip 
                cursor={{ fill: '#E3EED4' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="sales" fill="#375534" radius={[4, 4, 0, 0]} barSize={12} />
              <Bar dataKey="expenses" fill="#6B9071" opacity={0.6} radius={[4, 4, 0, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables Region */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Ledger */}
        <div className="bg-white border border-border-light rounded-md shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border-light flex justify-between items-center bg-neutral/30">
            <h3 className="text-sm font-black text-text-main tracking-tighter uppercase">Recent Sales Ledger</h3>
            <button className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline transition-all">View All</button>
          </div>
          <div className="overflow-x-auto no-scrollbar">
            <table className="table-pro">
              <thead>
                <tr>
                  <th className="!py-4 min-w-[100px]">ORDER ID</th>
                  <th className="min-w-[120px]">CLIENT</th>
                  <th className="text-right min-w-[100px]">AMOUNT</th>
                  <th className="text-center min-w-[80px]">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral">
                {recentSales.map((sale, idx) => (
                  <tr key={sale._id} className="hover:bg-neutral/50 transition-colors">
                    <td className="!py-4 text-[11px] font-black text-text-muted">#SL-{sale._id.slice(-4).toUpperCase()}</td>
                    <td className="text-text-main font-black">{sale.customerName}</td>
                    <td className="text-right font-black text-text-main">₦{(sale.totalAmount || 0).toLocaleString()}</td>
                    <td className="text-center">
                      <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-md text-[8px] font-black uppercase tracking-widest border border-primary/20">PAID</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expense Ledger */}
        <div className="bg-white border border-border-light rounded-md shadow-sm overflow-hidden flex flex-col relative">
          <div className="p-6 border-b border-border-light flex justify-between items-center bg-neutral/30">
            <h3 className="text-sm font-black text-text-main tracking-tighter uppercase">Recent Operating Expenses</h3>
            <button className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline transition-all">View All</button>
          </div>
          <div className="overflow-x-auto no-scrollbar">
            <table className="table-pro">
              <thead>
                <tr>
                  <th className="!py-4 min-w-[100px]">REF ID</th>
                  <th className="min-w-[120px]">CATEGORY</th>
                  <th className="text-right min-w-[100px]">AMOUNT</th>
                  <th className="text-right min-w-[100px]">DATE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral">
                {recentExpenses.map((expense, idx) => (
                  <tr key={expense._id} className="hover:bg-neutral/50 transition-colors">
                    <td className="!py-4 text-[11px] font-black text-text-muted">#EX-{4110 + idx}</td>
                    <td className="text-text-main font-bold">{expense.category}</td>
                    <td className="text-right font-black text-secondary">₦{expense.amount.toLocaleString()}</td>
                    <td className="text-right text-[11px] font-black text-text-muted uppercase">{new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Fleet Footer Panel */}
      <div className="bg-[#0F2A1D] rounded-md p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        {/* Watermark in mini panel */}
        <div className="absolute -bottom-8 -right-4 text-9xl font-black text-white/[0.03] select-none pointer-events-none tracking-tighter">MP</div>
        
        <div className="relative z-10 text-left">
          <h4 className="text-white font-black uppercase tracking-tighter text-lg mb-2">Transport Status</h4>
          <p className="text-[#AEC3B0] text-sm font-medium max-w-lg leading-relaxed">
            {(fleet?.total || 0) > 0 ? (
              <>
                <span className="text-secondary font-black">{Math.round(((fleet?.active || 0) / (fleet?.total || 1)) * 100)}%</span> of your fleet is currently operational. 
                {(fleet?.repairing || 0) > 0 ? ` ${(fleet?.repairing || 0)} vehicles are currently in maintenance.` : ' All vehicles are active or in transit.'} 
                No delays reported in major routes.
              </>
            ) : (
              'No fleet data detected. Status monitoring will initialize once vehicles are registered in the transport terminal.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-6 md:gap-10 items-center justify-center md:justify-end shrink-0 w-full md:w-auto">
          <FleetStat label="ACTIVE" value={fleet.total} color="text-secondary" />
          <FleetStat label="REPAIRING" value={fleet.repairing} color="text-[#6B9071]" />
          <FleetStat label="OFFLINE" value={fleet.offline} color="text-[#375534]" />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, trend, isUp, info, icon, highlight }) => (
  <div className={`border rounded-md p-6 shadow-sm transition-all ${highlight ? 'bg-[#0F2A1D] border-primary' : 'bg-white border-border-light hover:border-primary/30'}`}>
    <div className="flex justify-between items-start mb-6">
      <div className={`text-[10px] font-black uppercase tracking-widest ${highlight ? 'text-secondary' : 'text-text-muted'}`}>{title}</div>
      {icon}
    </div>
    <div className={`text-2xl font-black tracking-tighter mb-2 ${highlight ? 'text-white' : 'text-text-main'}`}>{value}</div>
    <div className="flex items-center gap-2">
      {trend && (
        <span className={`flex items-center gap-0.5 text-[10px] font-black ${highlight ? 'text-secondary' : (isUp ? 'text-primary' : 'text-secondary/80')}`}>
          {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </span>
      )}
      {info ? (
        <span className={`text-[10px] font-black uppercase flex items-center gap-1.5 focus:scale-110 cursor-default ${highlight ? 'text-neutral/60' : 'text-text-muted'}`}>
           <div className={`w-1.5 h-1.5 rounded-full ${highlight ? 'bg-secondary' : 'bg-primary'}`} />
           {info}
        </span>
      ) : (
        <span className={`text-[10px] font-black uppercase tracking-tight italic ${highlight ? 'text-secondary/40' : 'text-text-muted/40'}`}>vs last week</span>
      )}
    </div>
  </div>
);

const FleetStat = ({ label, value, color }) => (
  <div className="text-center text-left">
    <div className={`text-3xl font-black ${color} tracking-tighter mb-1`}>{String(value).padStart(2, '0')}</div>
    <div className="text-[9px] font-black text-text-muted/60 uppercase tracking-widest">{label}</div>
  </div>
);

export default Dashboard;
