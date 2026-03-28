import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ShieldCheck, Send } from 'lucide-react';
import Button from '../components/ui/Button';

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      toast.success(res.message || 'Reset link sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] overflow-hidden font-sans relative">
      {/* Header Logo */}
      <div className="pt-12 flex justify-center animate-in fade-in duration-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white border border-slate-100 rounded-sm flex items-center justify-center shadow-sm overflow-hidden">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-sm font-black text-slate-900 tracking-tighter uppercase">Moreez Manager</h1>
        </div>
      </div>

      {/* Main Form Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-white border border-slate-200 rounded-sm p-10 shadow-xl relative">
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-2 leading-none">Reset your password</h3>
            <p className="text-xs text-slate-400 font-bold mb-8 leading-relaxed">
              Enter your email address to receive a reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="group text-left">
                <label className="text-[9px] font-black text-slate-400 uppercase mb-2.5 block tracking-widest">Corporate Email Address</label>
                <div className="relative">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-sm py-3 px-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                    placeholder="name@moreez.com"
                    required
                  />
                </div>
              </div>

              <Button type="submit" loading={loading} className="w-full !py-4 !bg-emerald-600 hover:!bg-emerald-700 !rounded-sm text-[12px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100">
                Send Reset Link
              </Button>
            </form>

            <Link 
              to="/login"
              className="mt-8 flex items-center justify-center gap-2 w-full text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to login
            </Link>
          </div>
        </div>
      </div>

      {/* Corner Watermark */}
      <div className="absolute bottom-16 right-16 text-[120px] font-black text-slate-200 select-none pointer-events-none opacity-20 tracking-tighter">
        ML-04
      </div>

      {/* Footer Area */}
      <div className="p-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center bg-white">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 md:mb-0">
          © 2026 MOREEZ LOGISTICS. ALL RIGHTS RESERVED.
        </p>
        <div className="flex gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <button className="hover:text-slate-900 transition-colors">Privacy Policy</button>
          <button className="hover:text-slate-900 transition-colors">Terms of Service</button>
          <button className="hover:text-slate-900 transition-colors">Help Center</button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
