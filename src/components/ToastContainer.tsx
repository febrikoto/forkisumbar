import React from 'react';
import { Match, Participant } from '../types';
import { X, Trophy, UserPlus, Info, CheckCircle2, Megaphone, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface Toast {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'info' | 'warning' | 'score' | 'register';
  timestamp: Date;
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'score':
        return <Trophy className="h-5 w-5 text-rose-400" />;
      case 'register':
        return <UserPlus className="h-5 w-5 text-amber-400" />;
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
      case 'warning':
        return <Megaphone className="h-5 w-5 text-rose-500 animate-bounce" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-indigo-400" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'score':
        return 'border-rose-500/40 shadow-rose-950/20 bg-rose-950/40';
      case 'register':
        return 'border-amber-500/40 shadow-amber-950/20 bg-amber-950/40';
      case 'success':
        return 'border-emerald-500/40 shadow-emerald-950/20 bg-emerald-950/40';
      case 'warning':
        return 'border-orange-500/40 shadow-orange-950/20 bg-orange-950/40';
      case 'info':
      default:
        return 'border-indigo-500/40 shadow-indigo-950/20 bg-indigo-950/40';
    }
  };

  return (
    <div 
      className="fixed top-4 right-4 z-[9999] w-full max-w-sm flex flex-col gap-3 pointer-events-none" 
      id="toaster-viewport"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 50, transition: { duration: 0.2 } }}
            layout
            className={`w-full p-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex gap-3 pointer-events-auto relative overflow-hidden group transition ${getBorderColor(toast.type)}`}
            id={`toast-${toast.id}`}
          >
            {/* Soft decorative light strip at the bottom */}
            <div className={`absolute bottom-0 left-0 right-0 h-0.5 opacity-65 ${
              toast.type === 'score' ? 'bg-gradient-to-r from-rose-500 to-indigo-500' :
              toast.type === 'register' ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
              toast.type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
              'bg-gradient-to-r from-indigo-500 to-cyan-500'
            }`} />

            {/* Left aligned Icon Badge */}
            <div className="shrink-0 flex items-start pt-0.5">
              <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/60 shadow-inner">
                {getIcon(toast.type)}
              </div>
            </div>

            {/* Main content body */}
            <div className="flex-1 space-y-1 pr-6">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                {toast.title}
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                {toast.description}
              </p>
              <div className="text-[9px] text-slate-500 font-mono flex items-center gap-1">
                <span>🕒 {toast.timestamp.toLocaleTimeString()}</span>
              </div>
            </div>

            {/* Manual Dismiss button */}
            <button
              onClick={() => onDismiss(toast.id)}
              className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-white bg-slate-950/20 hover:bg-slate-950/60 border border-transparent hover:border-slate-800/40 transition shrink-0 self-start"
              aria-label="Tutup notifikasi"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
