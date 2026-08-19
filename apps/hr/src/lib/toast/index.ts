import type { ReactNode } from "react";
import { toast as heroToast } from "@heroui/react";

/**
 * App-wide toast API. Delegates to @heroui/react's own module-scope
 * `toast`/`toastQueue` singleton (see node_modules/@heroui/react toast-queue.js) —
 * there is no separate queue instantiated here, so every call from anywhere in the
 * app lands in the exact same queue the mounted <ToastProvider> renders from.
 *
 * Wraps HeroUI's (message, options) shape into (title, description?) since that's
 * the call ergonomics CRUD hooks want (toast.success("Asset created")).
 */
function make(fn: (message: ReactNode, options?: { description?: ReactNode }) => string) {
  return (title: ReactNode, description?: ReactNode) =>
    fn(title, description !== undefined ? { description } : undefined);
}

export const toast = {
  success: make(heroToast.success),
  danger: make(heroToast.danger),
  warning: make(heroToast.warning),
  info: make(heroToast.info),
};
