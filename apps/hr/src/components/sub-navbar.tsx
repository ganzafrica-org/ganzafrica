"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SubNavItem {
  label: string;
  href: string;
}

const subNavConfig: Record<string, SubNavItem[]> = {
  "/employees": [
    { label: "People", href: "/employees" },
    { label: "Org Chart", href: "/employees/org-chart" },
    { label: "Onboarding", href: "/employees/onboarding" },
    { label: "Time Off", href: "/employees/time-off" },
    { label: "Performance", href: "/employees/performance" },
    { label: "Department", href: "/employees/department" },
  ],
  "/assets-register": [{ label: "Documents", href: "/assets-register/documents" }],
  "/payroll": [
    { label: "ViewEmployeeContents", href: "/payroll" },
    { label: "Payruns", href: "/payroll/payruns" },
    { label: "Compliance", href: "/payroll/compliance" },
    { label: "Taxes", href: "/payroll/taxes" },
  ],
  "/settings": [
    { label: "Organization", href: "/settings/organization" },
    { label: "Policies", href: "/settings/policies" },
    { label: "Roles", href: "/settings/roles" },
    { label: "Time Off", href: "/settings/timeoff" },
  ],
};

export function SubNavbar() {
  const pathname = usePathname();

  // Find the base path that has sub-navigation
  const basePaths = Object.keys(subNavConfig);
  const activeBase = basePaths.find((base) => pathname === base || pathname.startsWith(base + "/"));

  if (!activeBase) return null;

  const items = subNavConfig[activeBase];

  return (
    <div className="w-full max-w-[80%] flex justify-center items-center self-center bg-brand-dark">
      <div className="bg-brand-dark mx-auto max-w-full border border-slate-300 px-6 py-2 rounded-lg flex items-center gap-6 overflow-x-auto no-scrollbar mb-5">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-4 py-2 text-xs font-medium rounded-full transition-all duration-200",
                isActive
                  ? "text-[#134e48] bg-[#00df82]"
                  : "text-white/70 hover:text-white hover:bg-white/10",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
