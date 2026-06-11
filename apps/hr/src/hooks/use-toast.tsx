import * as React from 'react'
import { toast as sonnerToast } from 'sonner'

// Define types locally since the UI component is deprecated/missing
export interface ToastProps {
    title?: React.ReactNode
    description?: React.ReactNode
    variant?: 'default' | 'destructive'
    action?: React.ReactNode
}

function toast({ title, description, variant, action }: ToastProps) {
    const id = sonnerToast(title, {
        description,
        // Mapping Shadcn variants to Sonner styles
        className: variant === 'destructive'
            ? 'bg-destructive text-destructive-foreground'
            : '',
        action: action ? (
            <div className="ml-auto">{action}</div>
        ) : undefined,
    })

    return {
        id,
        dismiss: () => sonnerToast.dismiss(id),
        update: (props: ToastProps) =>
            sonnerToast(props.title, { id, description: props.description }),
    }
}

function useToast() {
    return {
        toast,
        dismiss: (id?: string | number) => sonnerToast.dismiss(id),
        toasts: [],
    }
}

export { useToast, toast }