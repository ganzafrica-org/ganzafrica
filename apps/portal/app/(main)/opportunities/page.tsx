"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from '@workspace/ui/components/button';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@workspace/ui/components/table";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious, 
} from "@workspace/ui/components/pagination";
import { 
  Search, 
  Filter, 
  ArrowLeft,
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  ArrowRight,
  Edit,
  Trash,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";

export default function OpportunitiesPage() {
  // Sample data
  const allOpportunities = [
    { id: 1, title: "UX Researcher", location: "Rwanda", openings: 2, deadline: "June 1, 2024", created: "Feb 1, 2024" },
    { id: 2, title: "UX Researcher", location: "Burkina Faso", openings: 2, deadline: "June 1, 2024", created: "Feb 1, 2024" },
    { id: 3, title: "UX Researcher", location: "Burkina Faso", openings: 2, deadline: "June 1, 2024", created: "Feb 1, 2024" },
    { id: 4, title: "UX Researcher", location: "Burkina Faso", openings: 2, deadline: "June 1, 2024", created: "Feb 1, 2024" },
    { id: 5, title: "UX Researcher", location: "Burkina Faso", openings: 2, deadline: "June 1, 2024", created: "Feb 1, 2024" },
    { id: 6, title: "UX Researcher", location: "Rwanda", openings: 2, deadline: "June 1, 2024", created: "Feb 1, 2024" },
    { id: 7, title: "UX Researcher", location: "Rwanda", openings: 2, deadline: "June 1, 2024", created: "Feb 1, 2024" },
    { id: 8, title: "UX Researcher", location: "Rwanda", openings: 2, deadline: "June 1, 2024", created: "Feb 1, 2024" },
    { id: 9, title: "UX Researcher", location: "Rwanda", openings: 2, deadline: "June 1, 2024", created: "Feb 1, 2024" },
    { id: 10, title: "Frontend Developer", location: "Kenya", openings: 3, deadline: "June 15, 2024", created: "Feb 5, 2024" },
    { id: 11, title: "Backend Developer", location: "Nigeria", openings: 1, deadline: "June 30, 2024", created: "Feb 10, 2024" },
    { id: 12, title: "Product Manager", location: "Ghana", openings: 1, deadline: "July 15, 2024", created: "Feb 15, 2024" },
    { id: 13, title: "Data Analyst", location: "South Africa", openings: 2, deadline: "July 1, 2024", created: "Feb 20, 2024" },
    { id: 14, title: "UX Designer", location: "Rwanda", openings: 1, deadline: "June 20, 2024", created: "Feb 25, 2024" },
    { id: 15, title: "Project Manager", location: "Burkina Faso", openings: 1, deadline: "June 25, 2024", created: "Mar 1, 2024" },
    // Additional data to match 45 total entries
    // Add more items as needed to reach 45
  ];

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;
  
  // Filter opportunities based on search term
  const filteredOpportunities = allOpportunities.filter(opportunity => 
    opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opportunity.location.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Calculate pagination values
  const totalItems = filteredOpportunities.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOpportunities.slice(indexOfFirstItem, indexOfLastItem);
  
  // Action handlers
interface Opportunity {
    id: number;
    title: string;
    location: string;
    openings: number;
    deadline: string;
    created: string;
}

const handleView = (id: Opportunity['id']): void => {
    console.log(`View opportunity ${id}`);
    // Add your view logic here
};
  
const handleEdit = (id: Opportunity['id']): void => {
    console.log(`Edit opportunity ${id}`);
    // Add your edit logic here
};
  
interface DeleteHandler {
    (id: Opportunity['id']): void;
}

const handleDelete: DeleteHandler = (id) => {
    console.log(`Delete opportunity ${id}`);
    // Add your delete logic here
};
  
  // Pagination functions
interface GoToPageHandler {
    (page: number): void;
}

const goToPage: GoToPageHandler = (page) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
};
  
  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPrevPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);
  
  // Generate pagination buttons array
  const getPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 3; // Maximum number of pagination buttons to show
    
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    
    // Adjust if we're at the end
    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(i);
    }
    
    return buttons;
  };

  // Handle search input
interface SearchEvent extends React.ChangeEvent<HTMLInputElement> {}

const handleSearch = (e: SearchEvent): void => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
};

  return (
    <div className="flex-1">
      {/* Header area */}
      <div className="px-6 py-4">
        {/* Header with Create button moved to right */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">Opportunities</h1>
            <p className="text-gray-500 text-sm">Opportunities</p>
          </div>
          
          {/* Action button - positioned right */}
          <Link href="/opportunities/add-opportunities" className="flex items-center px-4 py-2 bg-green-800 rounded text-sm font-medium text-white hover:bg-green-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>Create new opportunity</span>
          </Link>
        </div>

        {/* Title and search area */}
        <div className="bg-white rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6 p-4 ">
          <h2 className="text-lg font-medium">Opportunities List</h2>
          
          <div className="flex gap-2 items-center">
            {/* Search box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search" 
                value={searchTerm}
                onChange={handleSearch}
                className="pl-9 pr-4 py-2 w-64 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            {/* Filter button */}
            <Button 
              variant="outline" 
              className="border-gray-200 p-2"
            >
              <Filter className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-b-lg overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-800 py-4">#</TableHead>
                <TableHead className="font-semibold text-gray-800">Opportunity Title</TableHead>
                <TableHead className="font-semibold text-gray-800">Job Location</TableHead>
                <TableHead className="font-semibold text-gray-800">Available Openings</TableHead>
                <TableHead className="font-semibold text-gray-800">Deadline</TableHead>
                <TableHead className="font-semibold text-gray-800">Created on</TableHead>
                <TableHead className="font-semibold text-gray-800">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.length > 0 ? (
                currentItems.map((opportunity) => (
                  <TableRow key={opportunity.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <TableCell>{opportunity.id}</TableCell>
                    <TableCell className="font-medium">{opportunity.title}</TableCell>
                    <TableCell>{opportunity.location}</TableCell>
                    <TableCell>{opportunity.openings}</TableCell>
                    <TableCell>{opportunity.deadline}</TableCell>
                    <TableCell>{opportunity.created}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-gray-500 hover:text-gray-700 focus:outline-none">
                            <MoreHorizontal className="h-5 w-5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem 
                            onClick={() => handleView(opportunity.id)}
                            className="flex items-center cursor-pointer"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            <span>View</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleEdit(opportunity.id)}
                            className="flex items-center cursor-pointer"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(opportunity.id)}
                            className="flex items-center cursor-pointer text-red-600"
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                    No opportunities found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4 py-4">
          <div className="text-sm text-gray-500">
            Showing {Math.min(totalItems, 1 + indexOfFirstItem)}-{Math.min(indexOfLastItem, totalItems)} out of {totalItems} entries
          </div>

          <div className="flex items-center gap-1">
            <button 
              onClick={goToFirstPage} 
              disabled={currentPage === 1}
              className={`flex items-center justify-center h-8 w-8 rounded border ${
                currentPage === 1 ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            
            <button 
              onClick={goToPrevPage} 
              disabled={currentPage === 1}
              className={`flex items-center justify-center h-8 w-8 rounded border ${
                currentPage === 1 ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {getPaginationButtons().map(page => (
              <button 
                key={page}
                onClick={() => goToPage(page)}
                className={`flex items-center justify-center h-8 w-8 rounded border ${
                  currentPage === page 
                    ? 'bg-green-800 text-white' 
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button 
              onClick={goToNextPage} 
              disabled={currentPage === totalPages}
              className={`flex items-center justify-center h-8 w-8 rounded border ${
                currentPage === totalPages ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            
            <button 
              onClick={goToLastPage} 
              disabled={currentPage === totalPages}
              className={`flex items-center justify-center h-8 w-8 rounded border ${
                currentPage === totalPages ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}