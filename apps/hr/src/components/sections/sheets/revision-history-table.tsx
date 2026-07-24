import React from "react";
import { RevisionEntry } from "@/types/revision";

interface RevisionHistoryTableProps {
  revisions: RevisionEntry[];
}

const HEADER_COLUMNS = [
  "Date",
  "Revision No.",
  "Description Of Revisions",
  "Name and Designation",
  "Signature",
] as const;

export function RevisionHistoryTable({ revisions }: RevisionHistoryTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-slate-300 text-sm text-slate-800">
        <thead>
          <tr className="bg-slate-50">
            {HEADER_COLUMNS.map((label) => (
              <th
                key={label}
                className="border border-slate-300 px-3 py-2.5 text-left font-bold text-slate-900"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {revisions.length === 0 ? (
            <tr>
              <td
                colSpan={HEADER_COLUMNS.length}
                className="border border-slate-300 px-3 py-6 text-center text-slate-500"
              >
                No revision records available.
              </td>
            </tr>
          ) : (
            revisions.map((entry, index) => (
              <tr key={`${entry.revisionNo}-${index}`} className="bg-white">
                <td className="border border-slate-300 px-3 py-2.5 align-top whitespace-nowrap">
                  {entry.date}
                </td>
                <td className="border border-slate-300 px-3 py-2.5 align-top text-center whitespace-nowrap">
                  {entry.revisionNo}
                </td>
                <td className="border border-slate-300 px-3 py-2.5 align-top">
                  {entry.description}
                </td>
                <td className="border border-slate-300 px-3 py-2.5 align-top">
                  {entry.nameAndDesignation}
                </td>
                <td className="border border-slate-300 px-3 py-2.5 align-top text-center min-w-[6rem]">
                  {entry.signature || "—"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
