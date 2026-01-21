import React from "react";
import { X, AlertCircle } from "lucide-react";

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onConfirm?: () => void;
  confirmText?: string;
  showCancel?: boolean;
}

export function ErrorModal({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
  confirmText = "OK",
  showCancel = false,
}: ErrorModalProps): React.JSX.Element | null {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white shadow-2xl w-[500px]"
        style={{ borderRadius: '7px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between" style={{ borderColor: '#e5e7eb', borderRadius: '7px 7px 0 0' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-full" style={{ backgroundColor: '#FEE2E2' }}>
              <AlertCircle className="w-5 h-5" style={{ color: '#DC2626' }} />
            </div>
            <h3 className="text-lg font-semibold" style={{ color: '#1f2937' }}>{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            style={{ borderRadius: '7px' }}
          >
            <X className="w-5 h-5" style={{ color: '#6b7280' }} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <p className="text-sm" style={{ color: '#6b7280' }}>{message}</p>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex justify-end space-x-3" style={{ borderColor: '#e5e7eb', borderRadius: '0 0 7px 7px' }}>
          {showCancel && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              style={{ borderRadius: '7px' }}
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => {
              if (onConfirm) {
                onConfirm();
              }
              onClose();
            }}
            className="px-4 py-2 text-white rounded-md transition-colors"
            style={{ 
              backgroundColor: confirmText.toLowerCase().includes('delete') ? '#dc2626' : '#076297', 
              borderRadius: '7px' 
            }}
            onMouseEnter={(e) => {
              if (confirmText.toLowerCase().includes('delete')) {
                e.currentTarget.style.backgroundColor = '#b91c1c';
              }
            }}
            onMouseLeave={(e) => {
              if (confirmText.toLowerCase().includes('delete')) {
                e.currentTarget.style.backgroundColor = '#dc2626';
              }
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

