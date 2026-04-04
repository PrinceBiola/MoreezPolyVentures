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
    <div className="min-h-screen flex flex-col bg-neutral overflow-hidden font-sans relative">
      {/* Header Logo */}
      <div className="pt-12 flex justify-center animate-in fade-in duration-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white border border-border-light rounded-sm flex items-center justify-center shadow-sm overflow-hidden">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-sm font-black text-text-main tracking-tighter uppercase">Moreez Poly</h1>
        </div>
      </div>

      {/* Main Form Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm animate-in fade-in zoom-in-95 duration-500 px-4">
          <div className="bg-white border border-border-light rounded-2xl md:rounded-sm p-8 md:p-10 shadow-xl relative">
            <h3 className="text-xl md:text-2xl font-black text-text-main tracking-tighter mb-2 leading-none">Reset your password</h3>
            <p className="text-xs text-text-muted font-bold mb-8 leading-relaxed text-left">
              Enter your email address to receive a reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="group text-left">
                <label className="text-[9px] font-black text-text-muted uppercase mb-2.5 block tracking-widest text-left">Corporate Email Address</label>
                <div className="relative">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-neutral/30 border border-border-light rounded-sm py-3 px-4 text-sm font-bold text-text-main focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                    placeholder="name@moreezpoly.com"
                    required
                  />
                </div>
              </div>

              <Button type="submit" loading={loading} className="w-full !py-4 !bg-primary hover:!bg-accent !rounded-sm text-[12px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                Send Reset Link
              </Button>
            </form>

            <Link 
              to="/login"
              className="mt-8 flex items-center justify-center gap-2 w-full text-[10px] font-black text-text-muted hover:text-text-main uppercase tracking-widest transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to login
            </Link>
          </div>
        </div>
      </div>

      {/* Corner Watermark */}
      <div className="absolute bottom-16 right-16 text-[120px] font-black text-primary select-none pointer-events-none opacity-5 tracking-tighter">
        ML-04
      </div>

      {/* Footer Area */}
      <div className="p-6 md:p-8 border-t border-border-light flex flex-col md:flex-row justify-between items-center bg-white gap-6">
        <p className="text-[9px] md:text-[10px] font-black text-text-muted uppercase tracking-widest text-center md:text-left">
          © 2026 MOREEZ LOGISTICS. ALL RIGHTS RESERVED.
        </p>
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-[9px] md:text-[10px] font-black text-text-muted uppercase tracking-widest">
          <button className="hover:text-text-main transition-colors">Privacy</button>
          <button className="hover:text-text-main transition-colors">Terms</button>
          <button className="hover:text-text-main transition-colors">Help</button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
