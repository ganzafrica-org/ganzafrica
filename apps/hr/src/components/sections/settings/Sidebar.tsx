"use client";

import { useState, useMemo } from "react";
import {
  ShieldCheck,
  Building2,
  Users,
  FileText,
  CalendarOff,
  ClipboardList,
  Search,
} from "lucide-react";
import { NavItem } from "./NavItem";

const SETTINGS_ITEMS = [
  {
    id: "roles",
    icon: ShieldCheck,
    label: "Roles & Permissions",
    subtitle: "Manage access levels and permission sets.",
  },
  {
    id: "entities",
    icon: Building2,
    label: "Entities",
    subtitle: "Legal entities, branches, and org structure.",
  },
  {
    id: "groups",
    icon: Users,
    label: "Groups",
    subtitle: "Team groupings and reporting hierarchies.",
  },
  {
    id: "policies",
    icon: FileText,
    label: "Policies",
    subtitle: "Attendance, leave, and compliance policies.",
  },
  {
    id: "timeoff",
    icon: CalendarOff,
    label: "Time Off",
    subtitle: "Leave types, accrual rules, and balances.",
  },
  {
    id: "onboarding",
    icon: ClipboardList,
    label: "Onboarding",
    subtitle: "Checklists, documents, and new-hire flows.",
  },
];

interface SidebarProps {
  activeSection: string;
  onSectionChange: (id: string) => void;
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return SETTINGS_ITEMS;

    const query = searchQuery.toLowerCase();
    return SETTINGS_ITEMS.filter(
      (item) =>
        item.label.toLowerCase().includes(query) || item.subtitle.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  const handleNavClick = (id: string) => {
    onSectionChange(id);
    setSearchQuery("");
  };

  return (
    <div className="w-full max-w-xs border-r border-neutral-200 py-4 pr-4 my-5 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mb-6">
        <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Settings
        </div>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-600"
            size={16}
          />
          <input
            type="text"
            placeholder="Search settings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-3 py-2 text-sm placeholder-neutral-400 focus:border-amber-600 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:placeholder-neutral-500 dark:focus:border-amber-600"
          />
        </div>
      </div>

      <nav className="space-y-1">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              subtitle={item.subtitle}
              isActive={activeSection === item.id}
              onClick={() => handleNavClick(item.id)}
            />
          ))
        ) : (
          <div className="px-4 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
            No settings found
          </div>
        )}
      </nav>
    </div>
  );
}
