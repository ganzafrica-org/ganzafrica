"use client";

import { X } from "lucide-react";
import { toast } from "sonner";

interface ErrorToastProps {
  title?: string;
  message: string;
  duration?: number;
}

export const showErrorToast = ({ title = "Error", message, duration = 5000 }: ErrorToastProps) => {
  return toast.custom(
    (t) => (
      <div
        className="bg-white border-2 border-red-600 rounded-lg shadow-lg relative transform transition-all duration-300"
        style={{ minWidth: "300px", maxWidth: "400px", overflow: "hidden" }}
      >
        <div className="flex items-start gap-3 p-4 pb-6">
          {/* Red X icon - made brighter */}
          <div className="flex-shrink-0 mt-0.5">
            <X className="h-5 w-5" style={{ color: "#dc2626" }} />
          </div>

          <div className="flex-1 min-w-0">
            {title && <h4 className="text-base font-medium text-black mb-1">{title}</h4>}
            <p className="text-sm text-gray-600">{message}</p>
          </div>

          <button
            onClick={() => toast.dismiss(t)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {/* Red bottom bar - made thicker and brighter, positioned at the very bottom */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: "5px",
            backgroundColor: "#ef4444",
            zIndex: 10,
          }}
        ></div>
      </div>
    ),
    {
      duration,
    },
  );
};
