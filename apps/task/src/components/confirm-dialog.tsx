"use client";
import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  icon?: React.ReactNode;
}

/**
 * Reusable Confirmation Dialog Component
 * 
 * @example
 * <ConfirmDialog
 *   open={showConfirm}
 *   onOpenChange={setShowConfirm}
 *   onConfirm={handleDelete}
 *   title="Delete Task"
 *   description="Are you sure you want to delete this task?"
 *   confirmText="Yes, Delete"
 *   variant="danger"
 * />
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  icon,
}: ConfirmDialogProps): React.JSX.Element | null {
  if (!open) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconBg: '#fee2e2',
          iconColor: '#dc2626',
          buttonBg: '#dc2626',
          buttonHoverBg: '#b91c1c',
        };
      case 'warning':
        return {
          iconBg: '#fef3c7',
          iconColor: '#f59e0b',
          buttonBg: '#f59e0b',
          buttonHoverBg: '#d97706',
        };
      case 'info':
        return {
          iconBg: '#dbeafe',
          iconColor: '#3b82f6',
          buttonBg: '#3b82f6',
          buttonHoverBg: '#2563eb',
        };
      default:
        return {
          iconBg: '#fee2e2',
          iconColor: '#dc2626',
          buttonBg: '#dc2626',
          buttonHoverBg: '#b91c1c',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div 
        className="bg-white rounded-xl p-6 w-96 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: styles.iconBg }}
          >
            {icon || <AlertTriangle className="w-6 h-6" style={{ color: styles.iconColor }} />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-gray-700 mb-6">{description}</p>
        <div className="flex gap-3">
          <button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="flex-1 px-4 py-2 font-medium text-sm transition"
            style={{ backgroundColor: styles.buttonBg, color: '#ffffff', borderRadius: '7px' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = styles.buttonHoverBg)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = styles.buttonBg)}
          >
            {confirmText}
          </button>
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 px-4 py-2 font-medium text-sm transition"
            style={{ backgroundColor: '#f3f4f6', color: '#374151', borderRadius: '7px' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e5e7eb')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}

