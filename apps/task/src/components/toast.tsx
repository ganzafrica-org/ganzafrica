"use client";

import React, { useEffect, useState } from "react";
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    iconColor: "text-green-600",
    titleColor: "text-green-800",
    messageColor: "text-green-700",
  },
  error: {
    icon: AlertCircle,
    bgColor: "bg-white",
    borderColor: "border-gray-200",
    iconColor: "text-red-600",
    titleColor: "text-red-600",
    messageColor: "text-black",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    iconColor: "text-yellow-600",
    titleColor: "text-yellow-800",
    messageColor: "text-yellow-700",
  },
  info: {
    icon: Info,
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    iconColor: "text-blue-600",
    titleColor: "text-blue-800",
    messageColor: "text-blue-700",
  },
};

export function Toast({ id, type, title, message, duration = 5000, onClose }: ToastProps): React.JSX.Element {
  const [isVisible, setIsVisible] = useState(false);
  const config = toastConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    // Show toast with animation
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto-hide toast
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300); // Wait for animation to complete
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [id, duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300);
  };

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div
        className={`
          ${config.bgColor} ${config.borderColor} border rounded-lg shadow-lg p-4 relative
        `}
      >
        <div className="flex items-start gap-3">
          <Icon className={`w-5 h-5 mt-0.5 ${config.iconColor}`} />
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-medium ${config.titleColor}`}>
              {title}
            </h4>
            <p className={`text-sm ${config.messageColor} mt-1`}>
              {message}
            </p>
          </div>
          <button
            onClick={handleClose}
            className={`p-1 hover:bg-gray-100 rounded-full transition-colors ${type === 'error' ? 'text-red-600 hover:text-red-700' : config.iconColor}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500 rounded-b-lg"></div>
      </div>
    </div>
  );
}

// Toast container component
interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type: ToastType;
    title: string;
    message: string;
    duration?: number;
  }>;
  onRemoveToast: (id: string) => void;
}

export function ToastContainer({ toasts, onRemoveToast }: ToastContainerProps): React.JSX.Element {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={onRemoveToast}
        />
      ))}
    </div>
  );
}

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    type: ToastType;
    title: string;
    message: string;
    duration?: number;
  }>>([]);

  const addToast = (toast: Omit<typeof toasts[0], 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (title: string, message: string, duration?: number) => {
    addToast({ type: "success", title, message, duration });
  };

  const showError = (title: string, message: string, duration?: number) => {
    addToast({ type: "error", title, message, duration });
  };

  const showWarning = (title: string, message: string, duration?: number) => {
    addToast({ type: "warning", title, message, duration });
  };

  const showInfo = (title: string, message: string, duration?: number) => {
    addToast({ type: "info", title, message, duration });
  };

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}
