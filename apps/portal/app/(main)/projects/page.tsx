"use client";

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUp, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  ArrowRight 
} from 'lucide-react';
import Link from 'next/link';

const ProjectsPage = () => {
  // State for the active tab
  const [activeTab, setActiveTab] = useState('completed');
  
  // Mock data for the projects - exact match from screenshot
  const projects = [
    { id: 1, name: 'Climate Adaptation Project', category: 'Food system', lead: 'Mukamana Fransine', location: 'Kigali', created: 'June 1, 2024', status: 'completed' },
    { id: 2, name: 'Climate Adaptation Project', category: 'Climate adaptation', lead: 'Mukamana Fransine', location: 'Musanze', created: 'June 1, 2024', status: 'completed' },
    { id: 3, name: 'Climate Adaptation Project', category: 'Data & Evidence', lead: 'Mukamana Fransine', location: 'Kigali', created: 'June 1, 2024', status: 'completed' },
    { id: 4, name: 'Climate Adaptation Project', category: 'Climate adaptation', lead: 'Mukamana Fransine', location: 'Kigali', created: 'June 1, 2024', status: 'pending' },
    { id: 5, name: 'Climate Adaptation Project', category: 'Food system', lead: 'Mukamana Fransine', location: 'Musanze', created: 'June 1, 2024', status: 'pending' },
    { id: 6, name: 'Climate Adaptation Project', category: 'Climate adaptation', lead: 'Mukamana Fransine', location: 'Musanze', created: 'June 1, 2024', status: 'pending' },
    { id: 7, name: 'Climate Adaptation Project', category: 'Food system', lead: 'Mukamana Fransine', location: 'Musanze', created: 'June 1, 2024', status: 'in-progress' },
    { id: 8, name: 'Climate Adaptation Project', category: 'Food system', lead: 'Mukamana Fransine', location: 'Musanze', created: 'June 1, 2024', status: 'in-progress' },
    { id: 9, name: 'Climate Adaptation Project', category: 'Climate adaptation', lead: 'Mukamana Fransine', location: 'Musanze', created: 'June 1, 2024', status: 'in-progress' },
  ];

  // Filter projects based on the active tab
  const getFilteredProjects = () => {
    switch (activeTab) {
      case 'all':
        return projects;
      case 'in-progress':
        return projects.filter(project => project.status === 'in-progress');
      case 'completed':
        return projects.filter(project => project.status === 'completed');
      case 'pending':
        return projects.filter(project => project.status === 'pending');
      default:
        return projects;
    }
  };

  const tabCounts = {
    all: 12,
    'in-progress': 3,
    completed: 3,
    pending: 3
  };

  return (
    <div className="p-6 max-w-full">
      {/* Header with title and buttons */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-gray-500 text-sm">Projects List</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50">
            <ArrowUp className="w-4 h-4 mr-2" />
            Import Projects
          </button>
          <Link href="/projects/add-project" className="flex items-center px-4 py-2 bg-green-700 rounded text-sm font-medium text-white hover:bg-green-800">
            Add Project
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>

      {/*  Tabs - */}
      <div className='bg-white'>
      <div className="flex border-b border-gray-200 mb-6 bg-white">
        <button
          onClick={() => setActiveTab('all')}
          className={`py-3 px-4 text-sm font-medium relative ${
            activeTab === 'all'
              ? 'border-b-2 border-green-700 text-green-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          All
          <span className="ml-2 bg-gray-200 px-2 py-0.5 rounded text-xs font-medium">12</span>
        </button>
        <button
          onClick={() => setActiveTab('in-progress')}
          className={`py-3 px-4 text-sm font-medium relative ${
            activeTab === 'in-progress'
              ? 'border-b-2 border-green-700 text-green-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          In progress
          <span className="ml-2 bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs font-medium">3</span>
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`py-3 px-4 text-sm font-medium relative ${
            activeTab === 'completed'
              ? 'border-b-2 border-green-700 text-green-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Completed
          <span className="ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium">3</span>
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`py-3 px-4 text-sm font-medium relative ${
            activeTab === 'pending'
              ? 'border-b-2 border-green-700 text-green-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Pending
          <span className="ml-2 bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-xs font-medium">3</span>
        </button>
      </div>

      {/* Project list title */}
      <h2 className="text-lg font-bold mb-4">List of {activeTab === 'all' ? '' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Projects</h2>

      {/* Search and filter -  */}
      <div className="flex justify-end mb-4">
        <div className="relative w-64">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-500" />
          </div>
          <input 
            type="text" 
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded block w-full pl-10 p-2.5" 
            placeholder="Search"
          />
        </div>
        <button className="ml-2 p-2.5 bg-green-700 text-white rounded">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Projects table -  */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project name</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Lead</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created at</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {getFilteredProjects().map((project) => (
              <tr key={project.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.id}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{project.name}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{project.category}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {project.id === 9 ? (
                    <span className="border border-purple-500 border-dashed py-0.5 px-1 rounded">
                      {project.lead}
                    </span>
                  ) : (
                    project.lead
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{project.location}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{project.created}</td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {project.status === 'completed' && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      • Completed
                    </span>
                  )}
                  {project.status === 'pending' && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                      • Pending
                    </span>
                  )}
                  {project.status === 'in-progress' && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                      • In Progress
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button className="text-gray-500 hover:text-gray-700">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination -  */}
      <div className="flex items-center justify-between py-3">
        <div className="text-sm text-gray-500">
          Showing 10 out of 45 entries
        </div>
        <div className="flex items-center space-x-1">
          <button className="p-2 text-gray-500 rounded hover:bg-gray-100">
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-500 rounded hover:bg-gray-100">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="p-2 w-8 h-8 rounded-md bg-green-700 text-white flex items-center justify-center">
            1
          </button>
          <button className="p-2 w-8 h-8 rounded-md hover:bg-gray-100 text-gray-700 flex items-center justify-center">
            2
          </button>
          <button className="p-2 w-8 h-8 rounded-md hover:bg-gray-100 text-gray-700 flex items-center justify-center">
            3
          </button>
          <button className="p-2 text-gray-500 rounded hover:bg-gray-100">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-500 rounded hover:bg-gray-100">
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ProjectsPage;