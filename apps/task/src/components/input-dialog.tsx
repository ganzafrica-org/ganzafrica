"use client";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface InputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: string) => void;
  title: string;
  label: string;
  placeholder?: string;
  submitText?: string;
  cancelText?: string;
  defaultValue?: string;
}

/**
 * Reusable Input Dialog Component
 *
 * @example
 * <InputDialog
 *   open={showDialog}
 *   onOpenChange={setShowDialog}
 *   onSubmit={handleSubmit}
 *   title="Add Label"
 *   label="Label Name"
 *   placeholder="e.g., Bug, Feature"
 *   submitText="Add Label"
 * />
 */
export function InputDialog({
  open,
  onOpenChange,
  onSubmit,
  title,
  label,
  placeholder = "",
  submitText = "Submit",
  cancelText = "Cancel",
  defaultValue = "",
}: InputDialogProps): React.JSX.Element | null {
  const [inputValue, setInputValue] = useState(defaultValue);

  useEffect(() => {
    if (open) {
      setInputValue(defaultValue);
    }
  }, [open, defaultValue]);

  if (!open) return null;

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onSubmit(inputValue.trim());
      setInputValue("");
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setInputValue("");
    onOpenChange(false);
  };

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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mb-4">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">{label}</label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            style={{ borderRadius: "7px", border: "1px solid #e5e7eb" }}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
            autoFocus
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={!inputValue.trim()}
            className="flex-1 px-4 py-2 font-medium text-sm transition"
            style={{
              backgroundColor: inputValue.trim() ? "#076297" : "#e5e7eb",
              color: inputValue.trim() ? "#ffffff" : "#9ca3af",
              borderRadius: "7px",
              cursor: inputValue.trim() ? "pointer" : "not-allowed",
            }}
            onMouseEnter={(e) => {
              if (inputValue.trim()) {
                e.currentTarget.style.backgroundColor = "#054a73";
              }
            }}
            onMouseLeave={(e) => {
              if (inputValue.trim()) {
                e.currentTarget.style.backgroundColor = "#076297";
              }
            }}
          >
            {submitText}
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2 font-medium text-sm transition"
            style={{ backgroundColor: "#f3f4f6", color: "#374151", borderRadius: "7px" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e5e7eb")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
