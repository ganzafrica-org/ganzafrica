"use client";
import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";
const TooltipContext = React.createContext({
    open: false,
    setOpen: () => { },
    delayDuration: 700,
    skipDelayDuration: 300,
    disableHoverableContent: false,
});
const TooltipProvider = ({ children, delayDuration = 700, skipDelayDuration = 300, disableHoverableContent = false }) => {
    return (<TooltipContext.Provider value={{
            open: false,
            setOpen: () => { },
            delayDuration,
            skipDelayDuration,
            disableHoverableContent,
        }}>
            {children}
        </TooltipContext.Provider>);
};
const Tooltip = ({ children, open, defaultOpen, onOpenChange, delayDuration, ...props }) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen || false);
    const openState = open !== undefined ? open : isOpen;
    const timer = React.useRef(null);
    const handleOpenChange = (open) => {
        setIsOpen(open);
        onOpenChange?.(open);
    };
    const contextValue = React.useMemo(() => ({
        open: openState,
        setOpen: handleOpenChange,
        delayDuration: delayDuration || 700,
        skipDelayDuration: props.skipDelayDuration || 300,
        disableHoverableContent: props.disableHoverableContent || false,
    }), [openState, handleOpenChange, delayDuration, props.skipDelayDuration, props.disableHoverableContent]);
    return (<TooltipContext.Provider value={contextValue}>
            {children}
        </TooltipContext.Provider>);
};
const TooltipTrigger = React.forwardRef(({ className, asChild = false, ...props }, ref) => {
    const { open, setOpen, delayDuration } = React.useContext(TooltipContext);
    const triggerRef = React.useRef(null);
    const mergedRef = useMergedRef(triggerRef, ref);
    const handleMouseEnter = React.useCallback(() => {
        const timer = setTimeout(() => {
            setOpen(true);
        }, delayDuration);
        return () => clearTimeout(timer);
    }, [setOpen, delayDuration]);
    const handleMouseLeave = React.useCallback(() => {
        setOpen(false);
    }, [setOpen]);
    if (asChild) {
        // Handle asChild logic - in a real implementation this would clone the child element
        // For simplicity, we'll just render a button with the props
        return React.cloneElement(props.children, {
            ref: mergedRef,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onFocus: () => setOpen(true),
            onBlur: () => setOpen(false),
            "data-tooltip-trigger": "true",
        });
    }
    return (<button type="button" ref={mergedRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} data-tooltip-trigger="true" {...props} className={cn(className)}/>);
});
TooltipTrigger.displayName = "TooltipTrigger";
const TooltipContent = React.forwardRef(({ className, sideOffset = 4, align = "center", side = "top", alignOffset = 0, avoidCollisions = true, ...props }, ref) => {
    const { open } = React.useContext(TooltipContext);
    const [position, setPosition] = React.useState({ top: 0, left: 0 });
    const contentRef = React.useRef(null);
    const mergedRef = useMergedRef(contentRef, ref);
    React.useEffect(() => {
        if (!open || !contentRef.current)
            return;
        const trigger = contentRef.current.parentElement?.querySelector('[data-tooltip-trigger="true"]');
        if (!trigger)
            return;
        const triggerRect = trigger.getBoundingClientRect();
        const contentRect = contentRef.current.getBoundingClientRect();
        let top = 0;
        let left = 0;
        // Calculate position based on side
        switch (side) {
            case "top":
                top = triggerRect.top - contentRect.height - sideOffset;
                left = triggerRect.left + (triggerRect.width / 2) - (contentRect.width / 2);
                break;
            case "bottom":
                top = triggerRect.bottom + sideOffset;
                left = triggerRect.left + (triggerRect.width / 2) - (contentRect.width / 2);
                break;
            case "left":
                top = triggerRect.top + (triggerRect.height / 2) - (contentRect.height / 2);
                left = triggerRect.left - contentRect.width - sideOffset;
                break;
            case "right":
                top = triggerRect.top + (triggerRect.height / 2) - (contentRect.height / 2);
                left = triggerRect.right + sideOffset;
                break;
        }
        // Apply alignment
        if (side === "top" || side === "bottom") {
            if (align === "start") {
                left = triggerRect.left + alignOffset;
            }
            else if (align === "end") {
                left = triggerRect.right - contentRect.width - alignOffset;
            }
        }
        else if (side === "left" || side === "right") {
            if (align === "start") {
                top = triggerRect.top + alignOffset;
            }
            else if (align === "end") {
                top = triggerRect.bottom - contentRect.height - alignOffset;
            }
        }
        // Avoid collisions with viewport boundaries if needed
        if (avoidCollisions) {
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            // Ensure the tooltip stays within the viewport
            if (left < 0)
                left = 4;
            if (top < 0)
                top = 4;
            if (left + contentRect.width > viewportWidth) {
                left = viewportWidth - contentRect.width - 4;
            }
            if (top + contentRect.height > viewportHeight) {
                top = viewportHeight - contentRect.height - 4;
            }
        }
        setPosition({ top, left });
    }, [open, side, align, sideOffset, alignOffset, avoidCollisions]);
    if (!open)
        return null;
    return (<div ref={mergedRef} role="tooltip" style={{
            position: 'absolute',
            top: `${position.top}px`,
            left: `${position.left}px`,
            zIndex: 50,
        }} className={cn("z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)} {...props}/>);
});
TooltipContent.displayName = "TooltipContent";
// Utility function to merge refs
function useMergedRef(...refs) {
    return React.useCallback((value) => {
        for (const ref of refs) {
            if (typeof ref === "function") {
                ref(value);
            }
            else if (ref != null) {
                ref.current = value;
            }
        }
    }, [refs]);
}
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
