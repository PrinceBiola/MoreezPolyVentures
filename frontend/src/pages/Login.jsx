import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, AlertCircle, HelpCircle, ShieldAlert } from 'lucide-react';
import Button from '../components/ui/Button';
import { useEffect } from 'react';

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('System Access Granted');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f8fafc] overflow-hidden font-sans">
      {/* Left Panel - Dark Navy Branding */}
      <div className="hidden lg:flex w-[38%] bg-[#0f172a] p-16 flex-col justify-between relative overflow-hidden">
        {/* Decorative Watermark or Background Element */}
        <div className="absolute -bottom-20 -left-20 text-[300px] font-black text-white/[0.03] select-none pointer-events-none tracking-tighter">
          MM
        </div>

        <div className="relative z-10 transition-all duration-700 animate-in slide-in-from-left-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white rounded-sm flex items-center justify-center shadow-lg overflow-hidden">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-xl font-black text-white tracking-tighter uppercase">Moreez Manager</h1>
          </div>

          <div className="mt-20">
            <h2 className="text-5xl font-black text-white leading-[1.1] tracking-tighter mb-8 max-w-md">
              Your business, <br />
              <span className="text-emerald-500">fully in control.</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed max-w-sm font-medium">
              Precision logistics and enterprise-grade asset management. Engineered for high-stakes transport environments.
            </p>
          </div>
        </div>

        <div className="relative z-10 text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
          SYSTEM VERSION 4.8.2 // INDUSTRIAL LEDGER PROTOCOL
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        {/* Corner Watermark */}
        <div className="absolute bottom-12 right-12 text-8xl font-black text-slate-200 select-none pointer-events-none opacity-40">
          MM
        </div>

        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700">
          <div className="bg-white border border-slate-200 rounded-[2rem] p-12 shadow-2xl relative">
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-2 leading-none">Account Login</h3>
            <p className="text-sm text-slate-400 font-bold mb-10 leading-relaxed">
              Enter your credentials to access the management dashboard.
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="group text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block tracking-widest ">Corporate Email Address</label>
                <div className="relative">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-sm py-4 px-5 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300"
                    placeholder="name@company.com"
                    required
                  />
                </div>
              </div>

              <div className="group text-left">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ">Access Password</label>
                  <Link 
                    to="/forgot-password"
                    className="text-[9px] font-black text-amber-600 hover:text-amber-700 uppercase tracking-widest transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-sm py-4 px-5 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {/* Security Warning Box */}
              <div className="bg-slate-50 border border-slate-100 rounded-sm p-4 flex gap-3 text-left">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-500 leading-normal font-bold">
                  Unauthorized access to this Industrial system is strictly prohibited and monitored under secure ledger protocols.
                </p>
              </div>

              <Button type="submit" loading={loading} className="w-full !py-5 !bg-emerald-600 hover:!bg-emerald-700 !rounded-sm text-md shadow-xl shadow-emerald-100">
                <Lock className="w-4 h-4 mr-1 opacity-60" />
                Authenticate Access
              </Button>
            </form>
          </div>

          <div className="mt-10 flex items-center justify-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <button className="hover:text-slate-600 transition-colors">Contact Technical Support</button>
            <span className="opacity-30">/</span>
            <button className="hover:text-slate-600 transition-colors">Security Policy</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
