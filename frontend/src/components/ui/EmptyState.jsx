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
      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100 shadow-sm text-gray-300">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter">{title}</h3>
      <p className="text-[11px] text-gray-400 font-bold max-w-xs mx-auto mt-1 mb-6 leading-relaxed uppercase tracking-wider">
        {message}
      </p>
      {action && action}
    </div>
  );
};

export default EmptyState;
