import React, { ReactNode, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ReusableSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
  maxWidth?: string;
}

export function ReusableSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
  side = "right",
  maxWidth = "w-[40%]",
}: ReusableSheetProps) {
  // Lock scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  const variants = {
    initial: {
      x: side === "right" ? "100%" : side === "left" ? "-100%" : 0,
      y: side === "top" ? "-100%" : side === "bottom" ? "100%" : 0,
    },
    animate: { x: 0, y: 0 },
    exit: {
      x: side === "right" ? "100%" : side === "left" ? "-100%" : 0,
      y: side === "top" ? "-100%" : side === "bottom" ? "100%" : 0,
    },
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 bg-black/50 z-[100] h-full"
          />
          {/* Sheet Content */}
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            transition={{ type: "spring", damping: 25, stiffness: 120, duration: 0.8 }}
            className={cn(
              "fixed bg-card shadow-2xl z-[101] flex flex-col overflow-hidden",
              side === "right" && "right-0 top-0 h-full",
              side === "left" && "left-0 top-0 h-full",
              side === "top" && "top-0 left-0 w-full",
              side === "bottom" && "bottom-0 left-0 w-full",
              // Add rounded corners and margin if requested (previous style)
              "m-4 h-[calc(100%-2rem)] rounded-lg border-none",
              maxWidth,
              className,
            )}
          >
            <div className="flex-1 flex flex-col h-full relative">
              {/* Close Button */}
              <button
                onClick={() => onOpenChange(false)}
                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-muted transition-colors z-10"
              >
                <X size={20} />
              </button>

              {(title || description) && (
                <div className="p-6 border-b shrink-0">
                  {title && (
                    <h2 className="font-bold text-brand-dark dark:text-foreground pr-8">{title}</h2>
                  )}
                  {description && (
                    <p className="text-sm text-muted-foreground mt-1">{description}</p>
                  )}
                </div>
              )}

              <div className="flex-1 overflow-y-auto">{children}</div>

              {footer && <div className="p-4 border-t bg-muted/50 mt-0 shrink-0">{footer}</div>}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
