"use client";

import {
  ToastProvider as ToastUIProvider,
  ToastViewport,
  ToastWithIcon,
} from "@/components/ui/toast";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
}

interface ToastContextType {
  toast: {
    success: (
      title: string,
      description?: string,
      options?: { duration?: number }
    ) => string;
    error: (
      title: string,
      description?: string,
      options?: { duration?: number }
    ) => string;
    warning: (
      title: string,
      description?: string,
      options?: { duration?: number }
    ) => string;
    info: (
      title: string,
      description?: string,
      options?: { duration?: number }
    ) => string;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((toast: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);

    // Auto remove after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, toast.duration || 5000);

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useMemo(
    () => ({
      success: (
        title: string,
        description?: string,
        options?: { duration?: number }
      ) => addToast({ title, description, type: "success", ...options }),
      error: (
        title: string,
        description?: string,
        options?: { duration?: number }
      ) => addToast({ title, description, type: "error", ...options }),
      warning: (
        title: string,
        description?: string,
        options?: { duration?: number }
      ) => addToast({ title, description, type: "warning", ...options }),
      info: (
        title: string,
        description?: string,
        options?: { duration?: number }
      ) => addToast({ title, description, type: "info", ...options }),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastUIProvider>
        {toasts.map((toastItem) => (
          <ToastWithIcon
            key={toastItem.id}
            title={toastItem.title}
            description={toastItem.description}
            type={toastItem.type}
            duration={toastItem.duration}
            onOpenChange={(open: boolean) => {
              if (!open) removeToast(toastItem.id);
            }}
          />
        ))}
        <ToastViewport />
      </ToastUIProvider>
    </ToastContext.Provider>
  );
}

export function useGlobalToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useGlobalToast must be used within a ToastProvider");
  }
  return context;
}
