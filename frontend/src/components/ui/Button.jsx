import React from 'react';
import Loader from './Loader';

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  loading = false, 
  disabled = false, 
  className = '',
  icon: Icon = null,
  ...props
}) => {
  const baseClasses = "inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[11px] py-2.5 px-5 rounded-lg transition-all shadow-sm active:scale-[0.98]";
  
  const variants = {
    primary: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100 hover:shadow-md",
    secondary: "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-100 hover:shadow-md",
    neutral: "bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900",
    danger: "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-100 hover:shadow-md outline-none focus:ring-4 focus:ring-rose-100",
  };

  return (
    <button
      {...props}
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={`${baseClasses} ${variants[variant] || variants.primary} ${className} ${ (loading || disabled) ? 'opacity-60 cursor-not-allowed grayscale-[0.5]' : '' }`}
    >
      {loading ? (
        <Loader size="sm" className="text-current" />
      ) : (
        <>
          {Icon && <Icon className="w-3.5 h-3.5" />}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
