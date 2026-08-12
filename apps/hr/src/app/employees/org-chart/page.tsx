"use client";

import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { OrganizationChart } from "primereact/organizationchart";
import type { TreeNode } from "primereact/treenode";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrgTree, useUnresolvedManagers } from "@/hooks/useOrg";
import { useAuth } from "@/hooks/useAuth";
import type { OrgTreeNode } from "@/types/api";
import "primereact/resources/themes/lara-light-green/theme.css";
import "primereact/resources/primereact.min.css";

// MOD-02 §5: above this many nodes, default everything below the root level to collapsed
// (primereact's built-in expand/collapse) rather than rendering the full sprawl at once.
const COLLAPSE_THRESHOLD = 150;

function countNodes(nodes: OrgTreeNode[]): number {
  return nodes.reduce((sum, n) => sum + 1 + countNodes(n.children), 0);
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase() || "NA";
}

function toTreeNode(node: OrgTreeNode, depth: number, collapseDeep: boolean): TreeNode {
  return {
    key: node.id,
    label: node.job_title ?? undefined,
    expanded: collapseDeep ? depth === 0 : true,
    data: {
      id: node.id,
      name: node.name,
      role: node.job_title ?? node.department ?? "—",
      avatar: initials(node.name),
    },
    children: node.children.map((c) => toTreeNode(c, depth + 1, collapseDeep)),
  };
}

const nodeTemplate = (node: TreeNode, onSelect: (id: string) => void) => {
  const data = node.data as { id: string; name: string; role: string; avatar: string };
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(data.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect(data.id);
      }}
      className="p-4 rounded-lg bg-white dark:bg-slate-300 shadow-sm min-w-[200px] cursor-pointer hover:ring-2 hover:ring-brand-accent"
    >
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-full bg-brand-dark flex items-center justify-center text-white font-bold text-default">
          {data.avatar}
        </div>
        <div className="text-center">
          <div className="font-bold text-slate-900 text-default">{data.name}</div>
          <div className="text-small font-semibold text-brand-accent uppercase tracking-wider">
            {data.role}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function OrgChartPage() {
  const router = useRouter();
  const { roles } = useAuth();
  const canManage = roles.includes("hr") || roles.includes("admin");
  const { data: tree, isLoading, isError } = useOrgTree();
  const { data: unresolved } = useUnresolvedManagers(canManage);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
            .p-organizationchart .p-organizationchart-line-down {
                background: #cbd5e1;
            }
            .p-organizationchart .p-organizationchart-line-left,
            .p-organizationchart .p-organizationchart-line-right,
            .p-organizationchart .p-organizationchart-line-top {
                border-color: #cbd5e1;
            }
        `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const treeNodes = useMemo<TreeNode[]>(() => {
    if (!tree) return [];
    const collapseDeep = countNodes(tree) > COLLAPSE_THRESHOLD;
    return tree.map((n) => toTreeNode(n, 0, collapseDeep));
  }, [tree]);

  const onSelectEmployee = (id: string) => router.push(`/employees?employee=${id}`);

  return (
    <div className="min-h-screen p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-big font-bold text-slate-900 dark:text-white">Organization Chart</h1>
          {canManage && !!unresolved?.length && (
            <Link
              href="/employees/org-chart/unresolved"
              className="text-sm font-medium text-brand-accent hover:underline"
            >
              {unresolved.length} unresolved manager{unresolved.length === 1 ? "" : "s"}
            </Link>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg p-8 overflow-auto shadow-sm flex justify-center min-h-[100%]">
          {isLoading && (
            <div className="w-full max-w-md space-y-4">
              <Skeleton className="h-24 w-full mx-auto" />
              <div className="flex gap-4 justify-center">
                <Skeleton className="h-24 w-40" />
                <Skeleton className="h-24 w-40" />
              </div>
            </div>
          )}

          {isError && (
            <div className="flex items-center justify-center py-12 text-red-500">
              Failed to load the organization chart. Please try again.
            </div>
          )}

          {!isLoading && !isError && treeNodes.length === 0 && (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              No org structure yet.
            </div>
          )}

          {!isLoading && !isError && treeNodes.length > 0 && (
            <OrganizationChart
              value={treeNodes}
              nodeTemplate={(node) => nodeTemplate(node, onSelectEmployee)}
              className="company-org-chart"
            />
          )}
        </div>
      </div>
    </div>
  );
}
