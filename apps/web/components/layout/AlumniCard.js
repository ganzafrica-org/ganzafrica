import React from "react";
import { cn } from "@/lib/utils";
export const AlumniCard = ({ children, className, }) => {
    return (<div className={cn("rounded-lg shadow-lg bg-white", className)}>
      {children}
    </div>);
};
