"use client";

import { Check } from "lucide-react";
import { toast } from "sonner";

// Re-export error toast for convenience
export { showErrorToast } from "./error-toast";

interface SuccessToastProps {
  title?: string;
  message: string;
  duration?: number;
}

export const showSuccessToast = ({ title = "Success", message, duration = 5000 }: SuccessToastProps) => {
  return toast.custom((t) => (
    <div
      className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden relative transform transition-all duration-300"
      style={{ minWidth: "300px", maxWidth: "400px" }}
    >
      {/* Green bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-green"></div>
      
      <div className="flex items-start gap-3 p-4">
        {/* Green checkmark icon */}
        <div className="flex-shrink-0 mt-0.5">
          <Check className="h-5 w-5 text-primary-green" />
        </div>
        
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="text-base font-medium text-black mb-1">
              {title}
            </h4>
          )}
          <p className="text-sm text-gray-600">
            {message}
          </p>
        </div>
        
        <button
          onClick={() => toast.dismiss(t)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  ), {
    duration,
  });
};

