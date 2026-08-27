"use client";

import type { ToastContentValue } from "@heroui/react";
import { Toast, ToastContent, ToastDescription, ToastIndicator, ToastTitle } from "@heroui/react";

export function AppToastProvider() {
  return (
    <Toast.Provider placement="bottom">
      {({ toast: toastItem }) => {
        const content = toastItem.content as ToastContentValue;
        return (
          <Toast
            className="rounded-xl border border-border"
            toast={toastItem}
            variant={content.variant}
          >
            <ToastContent>
              <div className="flex items-center gap-2">
                <ToastIndicator variant={content.variant} />
                <div className="flex flex-col pe-6">
                  {content.title ? <ToastTitle>{content.title}</ToastTitle> : null}
                  {content.description ? (
                    <ToastDescription>{content.description}</ToastDescription>
                  ) : null}
                </div>
              </div>
            </ToastContent>
            <Toast.CloseButton className="absolute end-2 top-1/2 -translate-y-1/2 border-none bg-transparent opacity-100 [&>svg]:size-4" />
          </Toast>
        );
      }}
    </Toast.Provider>
  );
}
