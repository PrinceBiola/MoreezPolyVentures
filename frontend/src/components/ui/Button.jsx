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
    primary: "bg-primary hover:bg-accent text-white shadow-primary/20 hover:shadow-md",
    secondary: "bg-secondary hover:bg-primary text-white shadow-secondary/20 hover:shadow-md",
    neutral: "bg-neutral border border-border-light hover:bg-neutral/80 text-text-muted hover:text-text-main",
    danger: "bg-secondary/20 border border-secondary/30 hover:bg-secondary hover:text-white text-secondary shadow-sm hover:shadow-md outline-none focus:ring-4 focus:ring-secondary/10",
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
