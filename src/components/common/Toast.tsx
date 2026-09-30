import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast, hideToast } = useApp();

  if (!toast || !toast.visible) return null;

  const bgStyles = {
    success: 'bg-[#4A5F29] text-white border-[#3b4c20]',
    info: 'bg-[#14200C] text-white border-[#27381b]',
    warning: 'bg-[#B45309] text-white border-[#92400e]',
    error: 'bg-[#9A4A3A] text-white border-[#7f392c]',
  }[toast.type];

  const IconComponent = {
    success: CheckCircle2,
    info: Info,
    warning: AlertCircle,
    error: AlertCircle,
  }[toast.type];

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full px-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div
        className={`flex items-center justify-between p-4 rounded-xl shadow-lg border ${bgStyles}`}
      >
        <div className="flex items-center gap-3">
          <IconComponent className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium leading-snug">{toast.message}</p>
        </div>
        <button
          onClick={hideToast}
          className="p-1 rounded-md hover:bg-white/20 transition-colors ml-3 shrink-0"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
