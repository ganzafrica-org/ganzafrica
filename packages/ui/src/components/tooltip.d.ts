import * as React from "react";
interface TooltipProviderProps {
    children: React.ReactNode;
    delayDuration?: number;
    skipDelayDuration?: number;
    disableHoverableContent?: boolean;
}
declare const TooltipProvider: React.FC<TooltipProviderProps>;
interface TooltipProps {
    children: React.ReactNode;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    delayDuration?: number;
    [key: string]: any;
}
declare const Tooltip: React.FC<TooltipProps>;
interface TooltipTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
    className?: string;
}
declare const TooltipTrigger: React.ForwardRefExoticComponent<TooltipTriggerProps & React.RefAttributes<HTMLButtonElement>>;
interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
    sideOffset?: number;
    align?: "start" | "center" | "end";
    side?: "top" | "right" | "bottom" | "left";
    alignOffset?: number;
    avoidCollisions?: boolean;
    className?: string;
}
declare const TooltipContent: React.ForwardRefExoticComponent<TooltipContentProps & React.RefAttributes<HTMLDivElement>>;
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
//# sourceMappingURL=tooltip.d.ts.map