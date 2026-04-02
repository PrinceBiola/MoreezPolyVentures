import React from 'react';
import { PackageSearch } from 'lucide-react';

const EmptyState = ({ 
  title = "No data found", 
  message = "Try adding a new record or adjusting your filters.", 
  icon: Icon = PackageSearch,
  action = null
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-fade-in">
      <div className="w-16 h-16 bg-neutral rounded-2xl flex items-center justify-center mb-4 border border-border-light shadow-sm text-text-muted opacity-40">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-black text-text-main uppercase tracking-tighter leading-none">{title}</h3>
      <p className="text-[11px] text-text-muted font-bold max-w-xs mx-auto mt-2 mb-6 leading-relaxed uppercase tracking-wider opacity-70">
        {message}
      </p>
      {action && action}
    </div>
  );
};

export default EmptyState;
