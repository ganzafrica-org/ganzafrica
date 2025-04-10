"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft,
  Upload,
  X,
  Check,
  Plus,
  AlertCircle,
  Loader,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui"
import { Button } from "@workspace/ui"

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  role: 'Fellow' | 'Alumni' | 'Employee' | 'Admin';
  gender: string;
  nationality: string;
  dateOfBirth: string;
  phone: string;
  status: 'active' | 'inactive';
  avatar?: string;
  emergencyContact: {
    name: string;
    email: string;
    phone: string;
    relation: string;
  };
}

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Omit<User, 'id'>) => void;
  editUser?: User;
  position?: { x: number; y: number };
}

const UserDialog: React.FC<UserDialogProps> = ({ isOpen, onClose, onSave, editUser, position }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<Omit<User, 'id'>>({
    firstName: '',
    lastName: '',
    email: '',
    title: '',
    role: 'Fellow',
    gender: '',
    nationality: '',
    dateOfBirth: '',
    phone: '',
    status: 'active',
    avatar: '',
    emergencyContact: {
      name: '',
      email: '',
      phone: '',
      relation: ''
    }
  });
  
  useEffect(() => {
    if (editUser) {
      setFormData({
        firstName: editUser.firstName,
        lastName: editUser.lastName,
        email: editUser.email,
        title: editUser.title,
        role: editUser.role,
        gender: editUser.gender,
        nationality: editUser.nationality,
        dateOfBirth: editUser.dateOfBirth,
        phone: editUser.phone,
        status: editUser.status,
        avatar: editUser.avatar,
        emergencyContact: editUser.emergencyContact
      });
    }
  }, [editUser]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('emergency_')) {
      const field = name.replace('emergency_', '');
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.dateOfBirth || !formData.gender || !formData.title || !formData.role || !formData.nationality) {
        setError('Please fill in all required fields');
        return;
      }
      setCurrentStep(2);
      setError('');
      return;
    }

    if (!formData.emergencyContact.name || !formData.emergencyContact.email || !formData.emergencyContact.phone || !formData.emergencyContact.relation) {
      setError('Please fill in all emergency contact fields');
      return;
    }

    setIsSubmitting(true);
    try {
      onSave(formData);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        title: '',
        role: 'Fellow',
        gender: '',
        nationality: '',
        dateOfBirth: '',
        phone: '',
        status: 'active',
        avatar: '',
        emergencyContact: {
          name: '',
          email: '',
          phone: '',
          relation: ''
        }
      });
      setCurrentStep(1);
      onClose();
    } catch (err) {
      setError('Failed to save user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const prevStep = () => {
    setCurrentStep(1);
    setError('');
  };

  const getPositionStyles = (): React.CSSProperties => {
    return {
      position: 'fixed',
      right: '115px',
      top: '135px',
      maxHeight: '80vh',
      width: 'calc(100% - 60px)',
      maxWidth: '1000px',
      overflowY: 'auto'
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div 
        ref={modalRef} 
        className="bg-white rounded-lg shadow-lg w-full overflow-hidden flex flex-col" 
        style={getPositionStyles()}
      >
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {editUser ? 'Edit User' : 'Add New User'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {currentStep === 1 ? 'Personal Information' : 'Emergency Contact'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          {error && (
            <div className="px-6 pt-4">
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="p-6">
            {currentStep === 1 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                      required
                    >
                      <option value="Fellow">Fellow</option>
                      <option value="Alumni">Alumni</option>
                      <option value="Employee">Employee</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                      required
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 mb-1">
                      Nationality <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="nationality"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                      required
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="emergency_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Contact Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="emergency_name"
                      name="emergency_name"
                      value={formData.emergencyContact.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="emergency_relation" className="block text-sm font-medium text-gray-700 mb-1">
                      Relationship <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="emergency_relation"
                      name="emergency_relation"
                      value={formData.emergencyContact.relation}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="emergency_email" className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Contact Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="emergency_email"
                      name="emergency_email"
                      value={formData.emergencyContact.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="emergency_phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Contact Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="emergency_phone"
                      name="emergency_phone"
                      value={formData.emergencyContact.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>

        <div className="p-6 border-t border-gray-200 sticky bottom-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`h-2.5 w-2.5 rounded-full ${currentStep === 1 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
              <div className={`h-2.5 w-2.5 rounded-full ${currentStep === 2 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            </div>
            
            <div className="flex items-center space-x-3">
              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors flex items-center"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </button>
              )}
              
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-green-700 rounded-lg text-white hover:bg-green-800 font-medium transition-colors flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : currentStep === 1 ? (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  'Submit'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      firstName: 'Tinashe',
      lastName: 'Chigwende',
      email: 'example@ganzafrica.org',
      title: 'Junior Analyst',
      role: 'Fellow',
      status: 'active',
      gender: 'male',
      nationality: 'Zimbabwean',
      dateOfBirth: '1995-01-15',
      phone: '+1234567890',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      emergencyContact: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+0987654321',
        relation: 'Brother'
      }
    }
  ]);
  
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const [dialogPosition, setDialogPosition] = useState<{ x: number; y: number } | undefined>();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setOpenActionMenu(null);
      }
    };

    if (openActionMenu !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openActionMenu]);

  const handleAddUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: (users.length + 1).toString()
    };
    setUsers([...users, newUser]);
    setShowUserDialog(false);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowUserDialog(true);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  const handleViewUser = (userId: string) => {
    // Implement view user functionality
    console.log('Viewing user:', userId);
  };

  const handleAddUserClick = (event: React.MouseEvent) => {
    setDialogPosition({ x: event.clientX, y: event.clientY });
    setShowUserDialog(true);
  };

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'Fellow':
        return 'text-green-700 bg-green-50';
      case 'Alumni':
        return 'text-purple-700 bg-purple-50';
      case 'Employee':
        return 'text-orange-700 bg-orange-50';
      case 'Admin':
        return 'text-red-700 bg-red-50';
      default:
        return 'text-gray-700 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ marginLeft: '30px', marginTop: '10px' }}>
      <UserDialog
        isOpen={showUserDialog}
        onClose={() => {
          setShowUserDialog(false);
          setEditingUser(undefined);
          setDialogPosition(undefined);
        }}
        onSave={handleAddUser}
        editUser={editingUser}
        position={dialogPosition}
      />

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">Manage users</h1>
            <p className="text-sm text-gray-500">Manage users</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 text-green-700 bg-white border border-green-700 rounded-md hover:bg-green-50">
              Import users
            </button>
            <button
              onClick={handleAddUserClick}
              className="px-4 py-2 text-white bg-green-700 rounded-md hover:bg-green-800"
            >
              Add user
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="p-6">
        <div className="bg-white rounded-lg shadow">
          {/* Search and filter */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-md">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.avatar ? (
                          <img className="h-8 w-8 rounded-full" src={user.avatar} alt="" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-500">
                              {user.firstName.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{`${user.firstName} ${user.lastName}`}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewUser(user.id)}>
                            View user
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            Edit user
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            Delete user
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Showing 10 out of 45 entries
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50">
                <ChevronsLeft className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-1">
                <button className="px-3 py-1 text-white bg-green-700 rounded">1</button>
                <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded">2</button>
                <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded">3</button>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <ChevronRight className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <ChevronsRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;