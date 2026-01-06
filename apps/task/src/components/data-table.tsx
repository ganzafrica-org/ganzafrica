"use client";

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface Column<T> {
  id: string;
  header: string;
  accessorKey: keyof T;
  cell?: (info: { getValue: () => any; row: { original: T } }) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  className?: string;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  pageSize = 10,
  className = '',
  emptyMessage = 'No data available',
  onRowClick,
}: DataTableProps<T>): React.JSX.Element {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Calculate pagination
  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortField) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === bValue) return 0;
      
      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortField, sortDirection]);

  // Get current page data
  const currentPageData = sortedData.slice(startIndex, endIndex);
  
  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    const newPage = Math.max(1, Math.min(totalPages, page));
    setCurrentPage(newPage);
  };

  // Reset to first page when data changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  if (data.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-sm ${className}`} style={{ borderRadius: '7px' }}>
        <div className="p-8 text-center">
          <div className="text-gray-500">{emptyMessage}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm ${className}`} style={{ borderRadius: '7px' }}>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: '#e5e7eb' }}>
              {columns.map((column) => (
                <th
                  key={column.id}
                  className="text-left py-3 px-4 font-semibold"
                  style={{ 
                    color: '#374151',
                    width: column.width || 'auto'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.header}</span>
                    {column.sortable && (
                      <button
                        onClick={() => handleSort(column.id)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        style={{ borderRadius: '4px' }}
                      >
                        <div className="flex flex-col">
                          <ChevronRight 
                            className={`w-3 h-3 -mb-1 transform rotate-90 ${
                              sortField === column.id && sortDirection === 'asc' 
                                ? 'text-blue-600' 
                                : 'text-gray-400'
                            }`} 
                          />
                          <ChevronRight 
                            className={`w-3 h-3 transform rotate-90 ${
                              sortField === column.id && sortDirection === 'desc' 
                                ? 'text-blue-600' 
                                : 'text-gray-400'
                            }`} 
                          />
                        </div>
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentPageData.map((row, index) => (
              <tr
                key={index}
                className={`border-b hover:bg-gray-50 transition-colors ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
                style={{ borderColor: '#f3f4f6' }}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td key={column.id} className="py-4 px-4">
                    {column.cell ? (
                      column.cell({
                        getValue: () => row[column.accessorKey],
                        row: { original: row }
                      })
                    ) : (
                      <div className="text-sm" style={{ color: '#1f2937' }}>
                        {row[column.accessorKey]}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t bg-white" style={{ borderColor: '#e5e7eb' }}>
        <div className="text-sm text-gray-700">
          Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} entries
        </div>
          
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            {/* First Page */}
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: currentPage === 1 ? '#f9fafb' : '#ffffff',
                borderRadius: '7px',
                border: '1px solid #e5e7eb'
              }}
            >
              <ChevronsLeft className="w-4 h-4" style={{ color: '#6b7280' }} />
            </button>

            {/* Previous Page */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: currentPage === 1 ? '#f9fafb' : '#ffffff',
                borderRadius: '7px',
                border: '1px solid #e5e7eb'
              }}
            >
              <ChevronLeft className="w-4 h-4" style={{ color: '#6b7280' }} />
            </button>

            {/* Page Numbers */}
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 3) {
                pageNum = i + 1;
              } else if (currentPage <= 2) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 1) {
                pageNum = totalPages - 2 + i;
              } else {
                pageNum = currentPage - 1 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className="px-3 py-2 text-sm font-medium rounded-md transition-colors"
                  style={{
                    backgroundColor: currentPage === pageNum ? '#076297' : '#ffffff',
                    color: currentPage === pageNum ? '#ffffff' : '#374151',
                    borderRadius: '7px',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Next Page */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: currentPage === totalPages ? '#f9fafb' : '#ffffff',
                borderRadius: '7px',
                border: '1px solid #e5e7eb'
              }}
            >
              <ChevronRight className="w-4 h-4" style={{ color: '#6b7280' }} />
            </button>

            {/* Last Page */}
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: currentPage === totalPages ? '#f9fafb' : '#ffffff',
                borderRadius: '7px',
                border: '1px solid #e5e7eb'
              }}
            >
              <ChevronsRight className="w-4 h-4" style={{ color: '#6b7280' }} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default DataTable;
