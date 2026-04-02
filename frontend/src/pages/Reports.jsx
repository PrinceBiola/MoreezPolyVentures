import React, { useState, useEffect } from 'react';
import { businessService } from '../services/businessService';
import { transportService } from '../services/transportService';
import { salesService } from '../services/salesService';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Truck, 
  Download, 
  Calendar, 
  ChevronDown,
  Filter,
  ArrowRight,
  ShieldCheck,
  Fuel,
  Wallet
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { toast } from 'react-hot-toast';
import { exportToCSV } from '../utils/csvExport';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('This Month');
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [showReportDropdown, setShowReportDropdown] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Fiscal State
  const [data, setData] = useState({
    business: [],
    transport: [],
    expenses: [],
    sales: [],
    purchases: []
  });
  const [prevData, setPrevData] = useState({
    transport: [],
    expenses: [],
    sales: []
  });

  const getDateRange = (selectedPeriod) => {
    const now = new Date();
    const start = new Date();
    const end = new Date();
    
    switch (selectedPeriod) {
      case 'This Month':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        break;
      case 'Last Month':
        start.setMonth(start.getMonth() - 1);
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setDate(0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'This Year':
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        break;
      case 'Custom Range':
        if (customStartDate) {
          const s = new Date(customStartDate);
          s.setHours(0, 0, 0, 0);
          start.setTime(s.getTime());
        }
        if (customEndDate) {
          const e = new Date(customEndDate);
          e.setHours(23, 59, 59, 999);
          end.setTime(e.getTime());
        }
        break;
      case 'All Time':
        return {};
      default:
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
    }
    
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString()
    };
  };

  useEffect(() => {
    fetchData();
  }, [period, customStartDate, customEndDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = getDateRange(period);
      
      // Calculate previous period for comparison (specifically for "This Month")
      let prevParams = {};
      if (period === 'This Month') {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const lastMonthStart = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
        const lastMonthEnd = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0, 23, 59, 59, 999);
        prevParams = { startDate: lastMonthStart.toISOString(), endDate: lastMonthEnd.toISOString() };
      }

      const promises = [
        businessService.getProducts(),
        transportService.getPayments(params),
        transportService.getExpenses(params),
        salesService.getSales(params),
        businessService.getPurchases(params)
      ];

      // Fetch previous period data if needed
      if (prevParams.startDate) {
        promises.push(transportService.getPayments(prevParams));
        promises.push(transportService.getExpenses(prevParams));
        promises.push(salesService.getSales(prevParams));
      }

      const results = await Promise.all(promises);
      const bizRes = results[0];
      const transportRes = results[1];
      const expRes = results[2];
      const salesRes = results[3];
      const purchasesRes = results[4];

      setData({
        business: bizRes?.data || [],
        transport: transportRes?.data || [],
        expenses: expRes?.data || [],
        sales: salesRes?.data || [],
        purchases: purchasesRes?.data || []
      });

      if (prevParams.startDate) {
        setPrevData({
          transport: results[5]?.data || [],
          expenses: results[6]?.data || [],
          sales: results[7]?.data || []
        });
      } else {
        setPrevData({ transport: [], expenses: [], sales: [] });
      }
    } catch (err) {
      toast.error('Sync failed');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#375534', '#6B9071', '#0F2A1D', '#8DAA91', '#4A6D4A', '#E3EED4'];

  // Calculations
  const salesRevenue = (data.sales || []).reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);
  const transportRevenue = (data.transport || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalRevenue = salesRevenue + transportRevenue;

  // Business Profit (Sales - COGS)
  const businessCOGS = (data.sales || []).reduce((acc, sale) => {
    const saleCOGS = (sale.items || []).reduce((itemAcc, item) => {
      const product = (data.business || []).find(p => p._id === (item.productId?._id || item.productId));
      const cost = product?.costPrice || 0;
      return itemAcc + (Number(item.quantitySold) * cost);
    }, 0);
    return acc + saleCOGS;
  }, 0);
  const businessProfit = salesRevenue - businessCOGS;

  // Transport Profit (Payments - Expenses)
  const transportExpensesTotal = (data.expenses || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const transportProfit = transportRevenue - transportExpensesTotal;

  // Final Metrics
  const totalExpenses = transportExpensesTotal; 
  const netProfit = businessProfit + transportProfit;

  // Previous Period Calculations
  const prevSalesRevenue = (prevData.sales || []).reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);
  const prevTransportRevenue = (prevData.transport || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const prevTotalRevenue = prevSalesRevenue + prevTransportRevenue;

  const prevBusinessCOGS = (prevData.sales || []).reduce((acc, sale) => {
    const saleCOGS = (sale.items || []).reduce((itemAcc, item) => {
      const product = (data.business || []).find(p => p._id === (item.productId?._id || item.productId));
      const cost = product?.costPrice || 0;
      return itemAcc + (Number(item.quantitySold) * cost);
    }, 0);
    return acc + saleCOGS;
  }, 0);
  const prevBusinessProfit = prevSalesRevenue - prevBusinessCOGS;
  const prevTransportExpensesTotal = (prevData.expenses || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const prevTransportProfit = prevTransportRevenue - prevTransportExpensesTotal;
  const prevNetProfit = prevBusinessProfit + prevTransportProfit;

  const calculateTrend = (curr, prev) => {
    if (!prev || prev === 0) return curr > 0 ? '+100%' : '0%';
    const diff = ((curr - prev) / prev) * 100;
    return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`;
  };

  const revenueTrend = calculateTrend(totalRevenue, prevTotalRevenue);
  const expenseTrend = calculateTrend(totalExpenses, prevTransportExpensesTotal);
  const profitTrend = calculateTrend(netProfit, prevNetProfit);

  const chartData = [
    { name: 'Week 1', revenue: totalRevenue * 0.2, expenses: totalExpenses * 0.15 },
    { name: 'Week 2', revenue: totalRevenue * 0.35, expenses: totalExpenses * 0.25 },
    { name: 'Week 3', revenue: totalRevenue * 0.22, expenses: totalExpenses * 0.30 },
    { name: 'Week 4', revenue: totalRevenue * 0.23, expenses: totalExpenses * 0.30 },
  ];

  // Expense Breakdown (Transport categories)
  const expenseCategories = (data.expenses || []).reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + (Number(curr.amount) || 0);
    return acc;
  }, {});
  
  const pieData = Object.keys(expenseCategories).map(cat => ({
    name: cat,
    value: expenseCategories[cat]
  })).sort((a, b) => b.value - a.value);

  // Report Handlers
  const handleDownloadReport = (reportType) => {
    setShowReportDropdown(false);
    
    switch (reportType) {
      case 'expenses': {
        const reportData = data.expenses.map(e => ({
          Date: new Date(e.date).toLocaleDateString(),
          Category: e.category,
          Amount: `₦${e.amount.toLocaleString()}`,
          Description: e.description || 'N/A',
          Vehicle: e.carId?.plateNumber || 'FLEET-NODE'
        }));
        exportToCSV(reportData, 'Expenses_Report');
        break;
      }
      case 'driver-sales': {
        const reportData = data.transport.map(p => ({
          Date: new Date(p.date || Date.now()).toLocaleDateString(),
          Vehicle: p.carId?.plateNumber || 'FLEET-NODE',
          Driver: p.driverName || 'N/A',
          Amount: `₦${p.amount.toLocaleString()}`,
          Description: p.paymentReason || 'N/A'
        }));
        exportToCSV(reportData, 'Vehicle_Revenue_Report');
        break;
      }
      case 'inventory': {
        const reportData = data.business.map(p => ({
          Name: p.name,
          Category: p.grade || 'N/A',
          'Cost Price': `₦${p.costPrice?.toLocaleString() || 0}`,
          'Selling Price': `₦${p.sellingPrice?.toLocaleString() || 0}`,
          'Current Stock': p.currentStock,
          'Total Value': `₦${(p.currentStock * p.costPrice || 0).toLocaleString()}`
        }));
        exportToCSV(reportData, 'Inventory_Report');
        break;
      }
      case 'sales': {
        const reportData = data.sales.map(s => ({
          Date: new Date(s.createdAt).toLocaleDateString(),
          Customer: s.customerName || 'N/A',
          'Total Amount': `₦${s.totalAmount.toLocaleString()}`,
          'Items Count': s.items.length,
          'Payment Type': s.paymentType || 'N/A'
        }));
        exportToCSV(reportData, 'Sales_Report');
        break;
      }
      case 'purchases': {
        const reportData = data.purchases.map(p => ({
          Date: new Date(p.date).toLocaleDateString(),
          Product: p.productId?.name || 'N/A',
          Quantity: p.quantity,
          'Unit Price': `₦${p.unitPrice.toLocaleString()}`,
          'Total Cost': `₦${p.totalCost.toLocaleString()}`,
          Vendor: p.vendorDetails || 'N/A'
        }));
        exportToCSV(reportData, 'Purchase_Report');
        break;
      }
      case 'summary': {
        const reportData = [
          { Metric: 'Total Revenue', Value: `₦${totalRevenue.toLocaleString()}` },
          { Metric: 'Sales Revenue', Value: `₦${salesRevenue.toLocaleString()}` },
          { Metric: 'Transport Revenue', Value: `₦${transportRevenue.toLocaleString()}` },
          { Metric: 'Total Expenses', Value: `₦${totalExpenses.toLocaleString()}` },
          { Metric: 'Business Profit', Value: `₦${businessProfit.toLocaleString()}` },
          { Metric: 'Transport Profit', Value: `₦${transportProfit.toLocaleString()}` },
          { Metric: 'Net Profit', Value: `₦${netProfit.toLocaleString()}` },
          { Metric: 'Inventory Value', Value: `₦${data.business.reduce((acc, curr) => acc + (Number(curr.currentStock) * (curr.costPrice || 0)), 0).toLocaleString()}` }
        ];
        exportToCSV(reportData, 'Business_Summary_Report');
        break;
      }
      default:
        toast.error('Invalid report type');
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader size="xl" /></div>;

  // Summary Totals
  const businessTotalUnits = (data.business || []).reduce((acc, curr) => acc + (Number(curr.currentStock) || 0), 0);
  const businessTotalRevenue = salesRevenue;
  const transportTotalIncome = transportRevenue;

  return (
    <div className="space-y-6 animate-fade-in text-left pb-10">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="flex items-center gap-6">
          <h2 className="text-3xl font-black text-text-main tracking-tighter uppercase leading-none">Reports</h2>
        </div>
        <div className="flex gap-3">
          <div className="relative">
             <button 
                onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-border-light rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-neutral transition-all"
             >
                {period} <ChevronDown className={`w-3 h-3 text-text-muted opacity-40 transition-transform ${showPeriodDropdown ? 'rotate-180' : ''}`} />
             </button>
             {showPeriodDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-border-light rounded-md shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                   {['This Month', 'Last Month', 'This Year', 'Custom Range', 'All Time'].map(p => (
                      <button 
                         key={p}
                         onClick={() => { setPeriod(p); setShowPeriodDropdown(false); }}
                         className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-neutral border-b border-border-light last:border-0"
                      >
                         {p}
                      </button>
                   ))}
                </div>
             )}
          </div>

          {period === 'Custom Range' && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
               <div className="relative group">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted opacity-50 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="date" 
                    value={customStartDate} 
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="pl-8 pr-3 py-2 bg-white border border-border-light rounded-md text-[10px] font-black uppercase tracking-widest focus:border-primary outline-none transition-all shadow-sm"
                  />
               </div>
               <span className="text-text-muted opacity-50 font-bold text-xs">to</span>
               <div className="relative group">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted opacity-50 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="date" 
                    value={customEndDate} 
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="pl-8 pr-3 py-2 bg-white border border-border-light rounded-md text-[10px] font-black uppercase tracking-widest focus:border-primary outline-none transition-all shadow-sm"
                  />
               </div>
            </div>
          )}
          <div className="flex relative">
             <button 
                onClick={() => setShowReportDropdown(!showReportDropdown)}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-l-md text-[10px] font-black uppercase tracking-widest hover:bg-accent transition-all border-r border-white/10"
             >
                Download Report
             </button>
             <button 
                onClick={() => setShowReportDropdown(!showReportDropdown)}
                className="px-3 bg-accent text-white rounded-r-md hover:opacity-90 transition-all"
             >
                <ChevronDown className={`w-4 h-4 transition-transform ${showReportDropdown ? 'rotate-180' : ''}`} />
             </button>

             {showReportDropdown && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-border-light rounded-md shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                   {[
                      { label: 'Expenses Report', type: 'expenses' },
                      { label: 'Vehicle Revenue', type: 'driver-sales' },
                      { label: 'Inventory Report', type: 'inventory' },
                      { label: 'Sales Report', type: 'sales' },
                      { label: 'Purchase Report', type: 'purchases' },
                      { label: 'Business Summary', type: 'summary' }
                   ].map(r => (
                      <button 
                         key={r.type}
                         onClick={() => handleDownloadReport(r.type)}
                         className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-neutral border-b border-border-light last:border-0"
                      >
                         {r.label}
                      </button>
                   ))}
                </div>
             )}
          </div>
        </div>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="TOTAL REVENUE" value={`₦${totalRevenue.toLocaleString()}`} trend={period === 'This Month' ? revenueTrend : null} color={totalRevenue >= prevTotalRevenue ? 'primary' : 'secondary'} />
        <StatCard label="TOTAL EXPENSES" value={`₦${totalExpenses.toLocaleString()}`} trend={period === 'This Month' ? expenseTrend : null} color={totalExpenses <= prevTransportExpensesTotal ? 'primary' : 'secondary'} />
        <StatCard label="NET PROFIT" value={`₦${netProfit.toLocaleString()}`} trend={period === 'This Month' ? profitTrend : null} color={netProfit >= prevNetProfit ? 'primary' : 'secondary'} highlight />
        <StatCard label="INVENTORY VALUE" value={`₦${(data.business || []).reduce((acc, curr) => acc + (Number(curr.currentStock) * (curr.costPrice || 0)), 0).toLocaleString()}`} color="primary" icon={<Wallet className="w-4 h-4" />} />
      </div>

      {/* Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-border-light rounded-md p-8 shadow-sm">
           <h3 className="text-sm font-black text-text-main tracking-tighter uppercase mb-8">Revenue Performance</h3>
           <div className="h-[300px] min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#375534" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#375534" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3EED4" opacity={0.5} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 9, fontWeight: 900, fill: '#6B9071'}} 
                      dy={10}
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: '900' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#375534" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" dot={{ fill: '#375534', r: 4, strokeWidth: 2, stroke: '#fff' }} />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white border border-border-light rounded-md p-8 shadow-sm">
           <h3 className="text-sm font-black text-text-main tracking-tighter uppercase mb-8">Expense Distribution</h3>
           <div className="h-[250px] relative">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                      data={pieData.length > 0 ? pieData : [{ name: 'No Data', value: 1 }]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                      {pieData.length === 0 && <Cell fill="#f1f5f9" />}
                    </Pie>
                    <Tooltip />
                 </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                 <p className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none">Operational</p>
                 <p className="text-lg font-black text-text-main mt-1">
                    {pieData.length > 0 ? '100%' : '0%'}
                 </p>
              </div>
           </div>
           <div className="flex flex-wrap justify-center gap-4 mt-4 h-[60px] overflow-y-auto no-scrollbar">
              {pieData.map((p, i) => (
                 <div key={i} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
                    <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }}></div>
                    {p.name}
                 </div>
              ))}
           </div>
        </div>
      </div>

      {/* Summary Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Business Summary */}
         <div className="bg-white border border-border-light rounded-md shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border-light flex justify-between items-center bg-neutral/50">
               <h3 className="text-[10px] font-black text-text-main uppercase tracking-[0.2em]">Business Summary</h3>
            </div>
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-neutral">
                     <th className="px-6 py-4 text-[9px] font-black text-text-muted uppercase tracking-widest">Product</th>
                     <th className="px-6 py-4 text-[9px] font-black text-text-muted uppercase tracking-widest">Stock</th>
                     <th className="px-6 py-4 text-[9px] font-black text-text-muted uppercase tracking-widest text-right">Revenue (Est)</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-neutral text-[11px] font-bold">
                  {data.business.slice(0, 4).map((p, i) => (
                     <tr key={i}>
                        <td className="px-6 py-4 text-text-main uppercase">{p.name}</td>
                        <td className="px-6 py-4 text-text-muted">{p.currentStock} Units</td>
                        <td className="px-6 py-4 text-right text-text-main tabular-nums">₦{(p.sellingPrice * p.currentStock || 0).toLocaleString()}</td>
                     </tr>
                  ))}
                  <tr className="bg-neutral/50 font-black text-[12px]">
                     <td className="px-6 py-4 uppercase text-text-main">Totals</td>
                     <td className="px-6 py-4 text-text-muted">{businessTotalUnits} Units</td>
                     <td className="px-6 py-4 text-right tabular-nums text-text-main">₦{businessTotalRevenue.toLocaleString()}</td>
                  </tr>
               </tbody>
            </table>
         </div>

         {/* Transport Summary */}
         <div className="bg-white border border-border-light rounded-md shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border-light flex justify-between items-center bg-neutral/50">
               <h3 className="text-[10px] font-black text-text-main uppercase tracking-[0.2em]">Transport Summary</h3>
            </div>
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-neutral">
                     <th className="px-6 py-4 text-[9px] font-black text-text-muted uppercase tracking-widest">Vehicle</th>
                     <th className="px-6 py-4 text-[9px] font-black text-text-muted uppercase tracking-widest">Trips</th>
                     <th className="px-6 py-4 text-[9px] font-black text-text-muted uppercase tracking-widest text-right">Income</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-neutral text-[11px] font-bold">
                  {data.transport.slice(0, 4).map((p, i) => (
                     <tr key={i}>
                        <td className="px-6 py-4 text-text-main uppercase">{p.carId?.plateNumber || 'FLEET-NODE'}</td>
                        <td className="px-6 py-4 text-text-muted">Record</td>
                        <td className="px-6 py-4 text-right text-text-main tabular-nums">₦{(p.amount || 0).toLocaleString()}</td>
                     </tr>
                  ))}
                  <tr className="bg-neutral/50 font-black text-[12px]">
                     <td className="px-6 py-4 uppercase text-text-main">Totals</td>
                     <td className="px-6 py-4 text-text-muted">{data.transport.length} Records</td>
                     <td className="px-6 py-4 text-right tabular-nums text-text-main">₦{transportTotalIncome.toLocaleString()}</td>
                  </tr>
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, trend, subValue, color, icon, highlight }) => (
  <div className={`bg-white border rounded-md p-6 shadow-sm flex flex-col justify-between group transition-all ${highlight ? 'border-primary/20' : 'border-border-light hover:border-primary/30'}`}>
    <div className="flex justify-between items-start mb-4">
       <p className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none">{label}</p>
       {icon && <div className="text-text-muted opacity-40">{icon}</div>}
    </div>
    <div>
       <h4 className={`text-2xl font-black tracking-tighter tabular-nums leading-none ${highlight ? 'text-primary' : 'text-text-main'}`}>{value}</h4>
       {trend && (
          <div className={`flex items-center gap-1.5 text-[10px] font-black mt-2 ${color === 'primary' ? 'text-primary' : 'text-secondary'}`}>
            {color === 'primary' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend}
          </div>
       )}
       {subValue && (
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-2 opacity-60 flex items-center gap-2">
             <ShieldCheck className="w-3 h-3" /> {subValue}
          </p>
       )}
    </div>
  </div>
);

export default Reports;

