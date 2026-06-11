"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

const config: Record<ToastType, { icon: React.ElementType; wrap: string; icon_: string }> = {
  success: { icon: CheckCircle2, wrap: "bg-emerald-50 border-emerald-200 text-emerald-900", icon_: "text-emerald-500" },
  error:   { icon: XCircle,      wrap: "bg-red-50 border-red-200 text-red-900",             icon_: "text-red-500" },
  info:    { icon: Info,         wrap: "bg-blue-50 border-blue-200 text-blue-900",           icon_: "text-blue-500" },
  warning: { icon: AlertTriangle,wrap: "bg-amber-50 border-amber-200 text-amber-900",        icon_: "text-amber-500" },
};

function ToastCard({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const { icon: Icon, wrap, icon_ } = config[item.type];

  return (
    <div className={cn(
      "flex items-start gap-3 pl-4 pr-3 py-3 rounded-xl border shadow-lg",
      "min-w-[260px] max-w-[380px] pointer-events-auto",
      wrap
    )}>
      <Icon size={16} className={cn("shrink-0 mt-0.5", icon_)} />
      <p className="text-sm font-medium flex-1 leading-snug">{item.message}</p>
      <button onClick={onClose} className="shrink-0 opacity-50 hover:opacity-100 transition-opacity mt-0.5">
        <X size={13} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = `t-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
        {toasts.map((item) => (
          <ToastCard key={item.id} item={item} onClose={() => remove(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext).toast;
}
