"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUp, 
  ArrowDown,
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  ArrowRight,
  Eye,
  Edit,
  Trash,
  Plus,
  Briefcase,
  UserPlus,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";

const TeamsPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  
  // States for data and UI
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamTypes, setTeamTypes] = useState<Array<{ id: number; name: string }>>([]);
  
  // States for pagination and filtering
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalTeams, setTotalTeams] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('sort_order');
  const [sortOrder, setSortOrder] = useState('asc');
  // Reorder mode (UI-only), local order per page
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [orderedIds, setOrderedIds] = useState<number[]>([]);
  
  // State to store team type counts
  const [tabCounts, setTabCounts] = useState<Record<string, number>>({
    all: 0
  });

  // Add state to track if tab counts are loaded
  const [tabCountsLoaded, setTabCountsLoaded] = useState(false);

  // State for dropdown menu
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  
  // State for delete confirmation dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<number | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Normalize image URL so it works on host even if saved with localhost
  const getImageUrl = (url?: string) => {
    if (!url) return "/api/placeholder/100/100";
    try {
      const base = (apiClient.defaults?.baseURL || '').replace(/\/$/, '');
      if (!base) return url;
      const apiOrigin = new URL(base).origin;
      if (url.startsWith('/')) return `${apiOrigin}${url}`;
      if (/^https?:\/\/localhost[:/]/i.test(url)) {
        const u = new URL(url);
        return `${apiOrigin}${u.pathname}${u.search}${u.hash}`;
      }
      return url;
    } catch {
      return url;
    }
  };
  
  // Function to toggle dropdown menu
  const toggleMenu = (id: number) => {
    if (openMenuId === id) {
      setOpenMenuId(null);
    } else {
      setOpenMenuId(id);
    }
  };

  // Function to handle action click
  const handleAction = async (action: 'view' | 'delete' | 'update', teamId: number) => {
    setOpenMenuId(null); // Close the menu
    
    switch(action) {
      case 'view':
        router.push(`/teams/${teamId}`);
        break;
      case 'delete':
        setTeamToDelete(teamId);
        setIsDeleteDialogOpen(true);
        break;
      case 'update':
        router.push(`/teams/edit/${teamId}`);
        break;
      default:
        break;
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!teamToDelete) return;

    try {
      await apiClient.delete(`/teams/${teamToDelete}`);
      
      // Close dialog and reset state
      setIsDeleteDialogOpen(false);
      setTeamToDelete(null);
      
      // Show success toast
      toast.success('Team member deleted successfully');
      
      // Trigger refresh by updating refreshTrigger
      setRefreshTrigger(prev => prev + 1);
      
      // Adjust page if needed (if we deleted the last item on the page)
      if (teams.length === 1 && page > 1) {
        setPage(page - 1);
      }
    } catch (error: any) {
      console.error('Error deleting team:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete team member');
      setIsDeleteDialogOpen(false);
      setTeamToDelete(null);
    }
  };

  const goToPage = (newPage: number) => {
    setPage(newPage);
  };

  const getRowNumber = (index: number) => {
    return ((page - 1) * limit) + index + 1;
  };

  const menuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && event.target instanceof Node && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  // Load team types from backend for dynamic tabs
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await apiClient.get('/team-types');
        const types: Array<{ id: number; name: string }> = res.data?.teamTypes || [];
        setTeamTypes(types);
      } catch (error: any) {
        // If this fails, tabs will show only 'All'
      }
    };
    fetchTypes();
  }, []);

  // Handle search input change with debounce
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value: string = e.target.value;
    setSearchTerm(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setPage(1); // Reset to first page when searching
    }, 500); // 500ms debounce
  };
  
  // Handle search submission
  interface SearchSubmitEvent extends React.FormEvent<HTMLFormElement> {}

  const handleSearchSubmit = (e: SearchSubmitEvent): void => {
    e.preventDefault();
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    setPage(1);
  };

  // Handle sort changes
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setSortBy(e.target.value);
    setPage(1); // Reset to first page when sorting changes
  };

  // Handle order changes
  const handleOrderChange = (): void => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    setPage(1); // Reset to first page when order changes
  };
  
  // Get team type ID from tab name
  const getTeamTypeIdFromTab = (tabName: string): number | undefined => {
    if (tabName === 'all') return undefined;
    const parsed = parseInt(tabName, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  };

  // Fetch tab counts
  const fetchTabCounts = async () => {
    try {
      // Fetch all teams to get accurate counts - use a high limit to get all teams
      const response = await apiClient.get('/teams', { 
        params: { limit: 1000, page: 1 } // Get up to 1000 teams to count properly
      });
      
      // Get the total count from the response pagination
      const allCount = parseInt(response.data.pagination?.total) || 0;
      
      // Prepare counts object starting with the total count for 'all'
      const countsByType: Record<string, number> = {
        all: allCount
      };
      
      // If we have teams data, count by team type
      if (response.data.teams && Array.isArray(response.data.teams)) {
        // Initialize counts for all team types to 0
        teamTypes.forEach(type => {
          countsByType[String(type.id)] = 0;
        });
        
        // Count teams by team_type.id
        response.data.teams.forEach((team: any) => {
          const typeId = team.team_type?.id;
          if (typeId) {
            const key = String(typeId);
            countsByType[key] = (countsByType[key] || 0) + 1;
          }
        });
      }
      
      setTabCounts(countsByType);
      setTabCountsLoaded(true);
    } catch (error: any) {
      console.error('Error fetching tab counts:', error);
      // Use default values in case of error
      setTabCounts({
        all: 0
      });
      setTabCountsLoaded(true);
      const errorMessage = (error as any)?.response?.data?.message || 'Failed to load team counts';
      toast.error(errorMessage);
    }
  };

  // Fetch teams from API with dependency on relevant state changes
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        
        // Build query params
        const params: {[key: string]: any} = {
          page,
          limit,
          sort_by: sortBy,
          sort_order: sortOrder
        };
        
        // Add optional filters if they exist
        if (searchTerm) params.search = searchTerm;
        
        // Map UI tab to API type filter
        if (activeTab !== 'all') {
          params.team_type_id = getTeamTypeIdFromTab(activeTab);
        }
        
        console.log('Fetching teams with params:', params);
        
        // Make API request with apiClient
        const response = await apiClient.get('/teams', { params });
        
        console.log('API response:', response.data);
        
        if (response.data) {
          const fetched = response.data.teams || [];
          setTeams(fetched);
          // Initialize/merge local order from storage
          try {
            const key = getOrderStorageKey();
            const saved = JSON.parse(localStorage.getItem(key) || '[]');
            if (Array.isArray(saved)) {
              // Keep only IDs present in fetched page
              const presentIds = new Set(fetched.map((t: any) => t.id));
              const filteredSaved = saved.filter((id: number) => presentIds.has(id));
              const missing = fetched.map((t: any) => t.id).filter((id: number) => !filteredSaved.includes(id));
              setOrderedIds([...filteredSaved, ...missing]);
            } else {
              setOrderedIds(fetched.map((t: any) => t.id));
            }
          } catch {
            setOrderedIds(fetched.map((t: any) => t.id));
          }
          
          // Extract pagination info
          const pagination = response.data.pagination || {};
          setTotalTeams(parseInt(pagination.total) || 0);
          setTotalPages(pagination.pages || 1);
          
          // Update tab counts with the total from this response
          if (!tabCountsLoaded) {
            // Update the 'all' count with the current total
            setTabCounts(prev => ({
              ...prev,
              all: parseInt(pagination.total) || 0
            }));
          }
        }
        
        // Fetch detailed tab counts if not already loaded
        if (!tabCountsLoaded) {
          fetchTabCounts();
        }
      } catch (error: any) {
        console.error('Error fetching teams:', error);
        setTeams([]);
        toast.error(error?.response?.data?.message || 'Failed to load teams');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeams();
  }, [page, limit, searchTerm, sortBy, sortOrder, activeTab, tabCountsLoaded, teamTypes, refreshTrigger]);

  // Helpers for local ordering
  const getOrderStorageKey = (): string => {
    return `teamsOrder:v1:page=${page}:limit=${limit}:tab=${activeTab}:sort=${sortBy}:${sortOrder}:search=${searchTerm || ''}`;
  };

  const persistOrder = (ids: number[]) => {
    try {
      localStorage.setItem(getOrderStorageKey(), JSON.stringify(ids));
    } catch {}
  };

  const displayedTeams = (() => {
    if (!orderedIds.length) return teams;
    const byId: { [key: number]: any } = {};
    teams.forEach((t: any) => { byId[t.id] = t; });
    const ordered = orderedIds.map(id => byId[id]).filter(Boolean);
    const remaining = teams.filter((t: any) => !orderedIds.includes(t.id));
    return [...ordered, ...remaining];
  })();

  const handleDragStart = (id: number) => setDraggingId(id);
  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
    if (isReorderMode) e.preventDefault();
  };
  const handleDrop = (targetId: number) => {
    if (!isReorderMode || draggingId === null || draggingId === targetId) return;
    const ids = [...orderedIds];
    const from = ids.indexOf(draggingId);
    const to = ids.indexOf(targetId);
    if (from === -1 || to === -1) return;
    ids.splice(from, 1);
    ids.splice(to, 0, draggingId);
    setOrderedIds(ids);
    persistOrder(ids);
    setDraggingId(null);
  };

  const moveRow = (id: number, direction: 'up' | 'down') => {
    const ids = [...orderedIds];
    const index = ids.indexOf(id);
    if (index === -1) return;
    const newIndex = direction === 'up' ? Math.max(0, index - 1) : Math.min(ids.length - 1, index + 1);
    if (newIndex === index) return;
    ids.splice(index, 1);
    ids.splice(newIndex, 0, id);
    setOrderedIds(ids);
    persistOrder(ids);
  };

  const moveToPosition = (id: number, positionOneBased: number) => {
    const pos = Math.max(1, Math.min(orderedIds.length, positionOneBased));
    const ids = [...orderedIds];
    const index = ids.indexOf(id);
    if (index === -1) return;
    ids.splice(index, 1);
    ids.splice(pos - 1, 0, id);
    setOrderedIds(ids);
    persistOrder(ids);
  };

  // Persist order to backend (convert to 1-based sort_order)
  const saveOrderToBackend = async () => {
    try {
      const orders = orderedIds.map((id, idx) => ({ id, sort_order: idx + 1 }));
      await apiClient.post('/teams/reorder', { orders });
      toast.success('Order saved');
      // Also set current sort to custom for consistent viewing
      setSortBy('sort_order');
      setSortOrder('asc');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to save order');
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Get team type name from team object
  const getTeamTypeName = (team: any) => {
    return team.team_type?.name || 'Unknown';
  };

  // Get background and text color based on team type
  const getTeamTypeStyle = (team: any) => {
    if (!team.team_type) return 'bg-gray-100 text-gray-800';
    
    const typeName = team.team_type.name?.toLowerCase() || '';
    
    if (typeName.includes('leadership')) {
      return 'bg-blue-100 text-blue-800';
    } else if (typeName.includes('technical')) {
      return 'bg-green-100 text-green-800';
    } else if (typeName.includes('support')) {
      return 'bg-purple-100 text-purple-800';
    }
    
    return 'bg-gray-100 text-gray-800';
  };

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPage(1); // Reset to first page when changing tabs
  };

  // Generate tabs based on team types found in the data
  const renderTabs = () => {
    const tabs: Array<{ id: string; label: string }> = [
      { id: 'all', label: 'All' }
    ];

    // Dynamic tabs based on fetched team types (IDs as tab ids, like news page does)
    teamTypes.forEach((t) => {
      tabs.push({ id: String(t.id), label: t.name });
    });

    return tabs.map(tab => (
      <button
        key={tab.id}
        onClick={() => handleTabChange(tab.id)}
        className={`py-3 px-4 text-sm font-medium relative ${
          activeTab === tab.id
            ? 'border-b-2 border-green-700 text-green-700'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        {tab.label}
        <span className={`ml-2 ${
          tab.id === 'all' ? 'bg-gray-200 text-gray-800' : 'bg-green-50 text-green-700'
        } px-2 py-0.5 rounded text-xs font-medium`}>
          {tabCounts[tab.id] || 0}
        </span>
      </button>
    ));
  };
  
  // Sort options component
  const SortOptions = () => {
    const sortOptions = [
      { value: 'created_at', label: 'Creation Date' },
      { value: 'name', label: 'Name' },
      { value: 'team_type_id', label: 'Team Type' },
      { value: 'sort_order', label: 'Custom Order' },
    ];

    return (
      <div className="flex items-center space-x-2">
        <label className="text-sm text-gray-600">Sort by:</label>
        <select
          value={sortBy}
          onChange={handleSortChange}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded p-2"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleOrderChange}
          className="p-2 border border-gray-300 rounded"
          title={sortOrder === 'desc' ? 'Sort Ascending' : 'Sort Descending'}
        >
          {sortOrder === 'desc' ? 
            <ArrowUp className="w-4 h-4" /> : 
            <ArrowDown className="w-4 h-4" />}
        </button>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-full">
      {/* Header with title and buttons */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Team Members</h1>
          <p className="text-gray-500 text-sm">Team Management</p>
        </div>
        <div className="flex space-x-3">
          <div className="flex items-center gap-2">
            <button
              className={`flex items-center px-4 py-2 border rounded text-sm font-medium ${isReorderMode ? 'border-green-700 text-green-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              onClick={async () => {
                if (isReorderMode) {
                  await saveOrderToBackend();
                }
                setIsReorderMode(!isReorderMode);
              }}
              title="Reorder team members and save to database"
            >
              {isReorderMode ? 'Save Order' : 'Reorder'}
            </button>
          </div>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50">
            <ArrowUp className="w-4 h-4 mr-2" />
            Import Team
          </button>
          <Link href="/teams/add-team" className="flex items-center px-4 py-2 bg-green-700 rounded text-sm font-medium text-white hover:bg-green-800">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Team Member
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className='bg-white'>
        <div className="flex border-b border-gray-200 mb-6 bg-white">
          {renderTabs()}
        </div>

        {/* Team list title */}
        <h2 className="text-lg font-bold mb-4">
          {activeTab === 'all'
            ? 'All Team Members'
            : `${teamTypes.find(t => String(t.id) === activeTab)?.name || 'Team'} Team`}
        </h2>

        {/* Search and filter */}
        <div className="flex justify-between mb-4">
          <SortOptions />
          <div className="flex">
            <div className="relative w-64">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-500" />
              </div>
              <form onSubmit={handleSearchSubmit}>
                <input 
                  type="text" 
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded block w-full pl-10 p-2.5" 
                  placeholder="Search team members"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </form>
            </div>
            <button 
              className="ml-2 p-2.5 bg-green-700 text-white rounded"
              onClick={() => {
                // Open a filter modal or expand filter options
              }}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Teams list view */}
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
            <p className="mt-2 text-gray-600">Loading team members...</p>
          </div>
        ) : teams.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No team members found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding a new team member.</p>
            <div className="mt-6">
              <Link href="/teams/add-team" 
                className="inline-flex items-center px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-md hover:bg-green-800">
                <Plus className="mr-2 h-5 w-5" aria-hidden="true" />
                Add Team Member
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Added Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {displayedTeams.map((team, index) => (
                  <tr
                    key={team.id}
                    className={`hover:bg-gray-50 ${isReorderMode ? 'cursor-move' : ''}`}
                    draggable={isReorderMode}
                    onDragStart={() => handleDragStart(team.id)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(team.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getRowNumber(index)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-10 w-10 rounded-full overflow-hidden">
                        <img 
                          src={getImageUrl(team.photo_url)} 
                          alt={team.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{team.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{team.position}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTeamTypeStyle(team)}`}>
                        {getTeamTypeName(team)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(team.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="relative flex items-center justify-end gap-2">
                        {isReorderMode && (
                          <div className="flex items-center gap-1 mr-2">
                            <button
                              className="p-1 border rounded hover:bg-gray-50"
                              onClick={() => moveRow(team.id, 'up')}
                              title="Move up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              className="p-1 border rounded hover:bg-gray-50"
                              onClick={() => moveRow(team.id, 'down')}
                              title="Move down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              min={1}
                              max={displayedTeams.length}
                              className="w-14 p-1 border rounded text-sm"
                              defaultValue={index + 1}
                              onBlur={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val)) moveToPosition(team.id, val);
                              }}
                              title="Move to position"
                            />
                          </div>
                        )}
                        <button 
                          className="text-gray-400 hover:text-gray-500 focus:outline-none"
                          onClick={() => toggleMenu(team.id)}
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                        
                        {openMenuId === team.id && (
                          <div ref={menuRef} className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <button
                              onClick={() => handleAction('view', team.id)}
                              className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View details
                            </button>
                            <button
                              onClick={() => handleAction('update', team.id)}
                              className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleAction('delete', team.id)}
                              className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash className="w-4 h-4 mr-2" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {teams.length > 0 && (
          <div className="flex items-center justify-between py-3">
            <div className="text-sm text-gray-500">
              Showing {teams.length > 0 ? ((page - 1) * limit) + 1 : 0} to {Math.min(page * limit, totalTeams)} out of {totalTeams} team members
            </div>
            <div className="flex items-center space-x-1">
              <button 
                className="p-2 text-gray-500 rounded hover:bg-gray-100"
                onClick={() => goToPage(1)}
                disabled={page === 1}
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button 
                className="p-2 text-gray-500 rounded hover:bg-gray-100"
                onClick={() => goToPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {/* Display page numbers */}
              {[...Array(Math.min(totalPages, 3))].map((_, index) => {
                const pageNumber = page <= 2 ? index + 1 : page - 1 + index;
                if (pageNumber <= totalPages) {
                  return (
                    <button 
                      key={pageNumber}
                      onClick={() => goToPage(pageNumber)}
                      className={`p-2 w-8 h-8 rounded-md ${
                        pageNumber === page
                          ? 'bg-green-700 text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      } flex items-center justify-center`}
                    >
                      {pageNumber}
                    </button>
                  );
                }
                return null;
              })}
              
              <button 
                className="p-2 text-gray-500 rounded hover:bg-gray-100"
                onClick={() => goToPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button 
                className="p-2 text-gray-500 rounded hover:bg-gray-100"
                onClick={() => goToPage(totalPages)}
                disabled={page === totalPages}
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Delete Team Member
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this team member? This action cannot be undone and will permanently delete the team member and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsDeleteDialogOpen(false);
              setTeamToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#b91c1c')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
            >
              Delete Team Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TeamsPage;