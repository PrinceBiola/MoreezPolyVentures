import React from 'react';
import { ShieldAlert } from 'lucide-react';
import Button from './Button';

const DeactivateModal = ({ isOpen, onClose, onConfirm, title, description, loading, itemName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white border border-slate-100 rounded-md w-full max-w-sm p-10 shadow-3xl animate-in zoom-in-95 duration-200 text-center">
        <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
           <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tighter uppercase">{title || 'Confirm Deactivation'}</h3>
        <p className="text-xs font-bold text-slate-500 mb-8 lowercase leading-relaxed">
          {description || `Confirming deactivation of `}
          {itemName && <span className="text-slate-900 font-black">{itemName}</span>}
          {description ? '' : '. This record will be archived.'}
        </p>
        <div className="flex gap-4">
           <Button variant="neutral" onClick={onClose} className="flex-1 uppercase font-black">Cancel</Button>
           <Button onClick={onConfirm} loading={loading} className="flex-1 bg-amber-500 hover:bg-amber-600 uppercase font-black tracking-widest text-white border-none shadow-lg shadow-amber-500/20">Deactivate</Button>
        </div>
      </div>
    </div>
  );
};

export default DeactivateModal;
