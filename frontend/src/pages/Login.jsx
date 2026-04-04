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
    <div className="min-h-screen flex bg-neutral overflow-hidden font-sans">
      {/* Left Panel - Dark Forest Branding */}
      <div className="hidden lg:flex w-[38%] bg-accent p-16 flex-col justify-between relative overflow-hidden">
        {/* Decorative Watermark or Background Element */}
        <div className="absolute -bottom-20 -left-20 text-[300px] font-black text-white/[0.03] select-none pointer-events-none tracking-tighter">
          MP
        </div>

        <div className="relative z-10 transition-all duration-700 animate-in slide-in-from-left-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white rounded-sm flex items-center justify-center shadow-lg overflow-hidden">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-xl font-black text-white tracking-tighter uppercase">Moreez Poly</h1>
          </div>

          <div className="mt-20">
            <h2 className="text-5xl font-black text-white leading-[1.1] tracking-tighter mb-8 max-w-md">
              Your business, <br />
              <span className="text-primary">fully in control.</span>
            </h2>
            <p className="text-white/60 text-lg leading-relaxed max-w-sm font-medium">
              Precision logistics and enterprise-grade asset management. Engineered for high-stakes transport environments.
            </p>
          </div>
        </div>

        <div className="relative z-10 text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">
          SYSTEM VERSION 4.8.2 // INDUSTRIAL LEDGER PROTOCOL
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        {/* Corner Watermark */}
        <div className="absolute bottom-12 right-12 text-6xl md:text-8xl font-black text-primary select-none pointer-events-none opacity-5">
          MP
        </div>

        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700 px-4 md:px-0">
          <div className="bg-white border border-border-light rounded-[1.5rem] md:rounded-[2rem] p-8 md:p-12 shadow-3xl relative">
            <h3 className="text-2xl md:text-3xl font-black text-text-main tracking-tighter mb-2 leading-none">Account Login</h3>
            <p className="text-sm text-text-muted font-bold mb-8 md:min-h-[40px] leading-relaxed">
              Enter your credentials to access the management dashboard.
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="group text-left">
                <label className="text-[10px] font-black text-text-muted uppercase mb-3 block tracking-widest ">Corporate Email Address</label>
                <div className="relative">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-neutral/30 border border-border-light rounded-sm py-4 px-5 text-sm font-bold text-text-main focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-text-muted opacity-60"
                    placeholder="name@company.com"
                    required
                  />
                </div>
              </div>

              <div className="group text-left">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ">Access Password</label>
                  <Link 
                    to="/forgot-password"
                    className="text-[9px] font-black text-secondary hover:text-accent uppercase tracking-widest transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-neutral/30 border border-border-light rounded-sm py-4 px-5 text-sm font-bold text-text-main focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {/* Security Warning Box */}
              <div className="bg-neutral/50 border border-border-light rounded-sm p-4 flex gap-3 text-left">
                <AlertCircle className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                <p className="text-[10px] text-text-muted leading-normal font-bold">
                  Unauthorized access to this Industrial system is strictly prohibited and monitored under secure ledger protocols.
                </p>
              </div>

              <Button type="submit" loading={loading} className="w-full !py-4 md:!py-5 !bg-primary hover:!bg-accent !rounded-sm text-sm md:text-md shadow-xl shadow-primary/20 flex items-center justify-center">
                <Lock className="w-4 h-4 mr-2 opacity-60" />
                Authenticate Access
              </Button>
            </form>
          </div>

          <div className="mt-10 flex items-center justify-center gap-4 text-[10px] font-black text-text-muted uppercase tracking-widest">
            <button className="hover:text-text-main transition-colors">Contact Technical Support</button>
            <span className="opacity-30">/</span>
            <button className="hover:text-text-main transition-colors">Security Policy</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
