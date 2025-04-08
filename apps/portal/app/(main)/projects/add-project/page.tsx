"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader, Calendar, X, UserPlus } from 'lucide-react';
import MultipleSelector, { Option } from '@workspace/ui/components/multiple-selector';

// New imports for date picker
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface FormData {
  projectName: string;
  projectLead: string;
  dateRange: string;
  projectOverview: string;
  projectGoals: string;
  expectedOutcomes: string;
  teamMembers: TeamMember[];
  files: File[];
}

// Define memberData object that was missing
const memberData = {
  '1': { name: 'Mukamana Fransine', email: 'mukamana@example.com', role: 'Developer' },
  '2': { name: 'John Doe', email: 'john@example.com', role: 'Designer' },
  '3': { name: 'Jane Smith', email: 'jane@example.com', role: 'Project Manager' },
  '4': { name: 'Alex Johnson', email: 'alex@example.com', role: 'Backend Developer' },
  '5': { name: 'Maria Garcia', email: 'maria@example.com', role: 'Frontend Developer' },
  '6': { name: 'Robert Wilson', email: 'robert@example.com', role: 'UX Designer' },
};

const ProjectForm: React.FC = () => {
  const router = useRouter();
  
  // States for form data
  const [formData, setFormData] = useState<FormData>({
    projectName: '',
    projectLead: '',
    dateRange: '',
    projectOverview: '',
    projectGoals: '',
    expectedOutcomes: '',
    teamMembers: [],
    files: []
  });

  // New state variables for the date picker
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Team member options in the format expected by MultipleSelector
  const teamMemberOptions: Option[] = [
    { label: 'Mukamana Fransine (Developer)', value: '1' },
    { label: 'John Doe (Designer)', value: '2' },
    { label: 'Jane Smith (Project Manager)', value: '3' },
    { label: 'Alex Johnson (Backend Developer)', value: '4' },
    { label: 'Maria Garcia (Frontend Developer)', value: '5' },
    { label: 'Robert Wilson (UX Designer)', value: '6' },
  ];
  
  const [selectedTeamOptions, setSelectedTeamOptions] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Update dateRange string when start or end date changes
  useEffect(() => {
    if (startDate && endDate) {
      const formatDate = (date: Date) => {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = String(date.getFullYear()).slice(2);
        return `${month}/${day}/${year}`;
      };

      const dateRangeStr = `${formatDate(startDate)}-${formatDate(endDate)}`;
      
      setFormData(prev => ({
        ...prev,
        dateRange: dateRangeStr
      }));
    }
  }, [startDate, endDate]);

  // Handle parsing date range string into Date objects
  useEffect(() => {
    if (formData.dateRange) {
      const parts = formData.dateRange.split('-');
      if (parts.length === 2) {
        try {
          const [startStr, endStr] = parts;
          
          // Parse dates in format mm/dd/yy
          const parseDate = (dateStr: string) => {
            const [month, day, year] = dateStr.split('/').map(Number);
            // Assume 20xx for years less than 50, 19xx for years greater than 50
            const fullYear = year < 50 ? 2000 + year : 1900 + year;
            return new Date(fullYear, month - 1, day);
          };
          
          const newStartDate = parseDate(startStr);
          const newEndDate = parseDate(endStr);
          
          if (!isNaN(newStartDate.getTime()) && !isNaN(newEndDate.getTime())) {
            setStartDate(newStartDate);
            setEndDate(newEndDate);
          }
        } catch (err) {
          console.error('Error parsing date range:', err);
        }
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // For date range, you could add validation here
    if (name === 'dateRange') {
      // Optional: validate date range format (mm/dd/yy-mm/dd/yy)
      const dateRangePattern = /^\d{2}\/\d{2}\/\d{2}-\d{2}\/\d{2}\/\d{2}$/;
      if (value && !dateRangePattern.test(value)) {
        setError('Please use the format mm/dd/yy-mm/dd/yy for date range');
      } else {
        setError('');
      }
    }
  };

  // Update team members when selection changes
  const handleTeamMemberChange = (options: Option[]) => {
    setSelectedTeamOptions(options);
    
    // Convert selected options to team members
    const members = options.map(option => {
      const data = memberData[option.value as keyof typeof memberData];
      if (data) {
        return {
          id: option.value,
          name: data.name,
          email: data.email,
          role: data.role
        };
      }
      return null;
    }).filter(Boolean) as TeamMember[];
    
    // Update form data
    setFormData({
      ...formData,
      teamMembers: members
    });
  };

  const handleRemoveMember = (id: string) => {
    // Remove from selectedTeamOptions
    setSelectedTeamOptions(prev => prev.filter(option => option.value !== id));
    
    // Remove from formData
    setFormData({
      ...formData,
      teamMembers: formData.teamMembers.filter(member => member.id !== id)
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      // Validate each file
      const validFiles = filesArray.filter(file => {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        
        // Check file type - only allow images and videos
        if (!isImage && !isVideo) {
          setError(`File "${file.name}" is not a supported file type. Please upload only images or videos.`);
          return false;
        }
        
        // Check file size (limit to 10MB)
        if (file.size > 10 * 1024 * 1024) {
          setError(`File "${file.name}" exceeds the 10MB size limit.`);
          return false;
        }
        
        return true;
      });
      
      // If there are valid files, add them to the form data
      if (validFiles.length > 0) {
        setFormData({
          ...formData,
          files: [...formData.files, ...validFiles]
        });
        
        // Clear any previous error if successful
        if (validFiles.length === filesArray.length) {
          setError('');
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Here you would normally submit to your API
      console.log('Submitting form data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success - redirect or show success message
      alert('Project created successfully!');
      // router.push('/projects');
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Custom date picker input that displays the selected date range
  const CustomDatePickerInput = React.forwardRef<HTMLDivElement, { value?: string; onClick?: () => void }>(
    ({ value, onClick }, ref) => (
      <div className="relative" ref={ref}>
        <input
          type="text"
          id="dateRange"
          name="dateRange"
          required
          value={formData.dateRange}
          onChange={handleInputChange}
          className="w-full p-2.5 border border-gray-300 rounded-md pr-10"
          placeholder="mm/dd/yy-mm/dd/yy"
          readOnly
          onClick={onClick}
        />
        <button 
          type="button"
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          onClick={onClick}
        >
          <Calendar className="w-5 h-5" />
        </button>
      </div>
    )
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <p className="text-gray-600">Projects/Create Project</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className='bg-white rounded-lg p-6'>
        {/* Project Details Section */}
        <div className="mb-8">
          <div className="flex">
            {/* Left column - section title */}
            <div className="w-1/4 pr-8">
              <h2 className="text-xl font-bold">Project Details</h2>
              <p className="text-gray-600 text-sm">What is the project all about?</p>
            </div>
            
            {/* Right column - form fields */}
            <div className="w-3/4">
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Project Name */}
                <div>
                  <label htmlFor="projectName" className="block text-sm font-medium mb-1">
                    Project Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="projectName"
                    name="projectName"
                    required
                    value={formData.projectName}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-gray-300 rounded-md"
                    placeholder="Enter the project name"
                  />
                </div>

                {/* Project Lead - Changed to text input */}
                <div>
                  <label htmlFor="projectLead" className="block text-sm font-medium mb-1">
                    Project Lead<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="projectLead"
                    name="projectLead"
                    required
                    value={formData.projectLead}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-gray-300 rounded-md"
                    placeholder="Enter project lead name"
                  />
                </div>

                {/* Date Range - Replaced with DatePicker component */}
                <div className="col-span-2">
                  <label htmlFor="dateRange" className="block text-sm font-medium mb-1">
                    Project Duration<span className="text-red-500">*</span>
                  </label>
                  
                  <DatePicker
                    selected={startDate}
                    onChange={(dates) => {
                      const [start, end] = dates as [Date, Date];
                      setStartDate(start);
                      setEndDate(end);
                    }}
                    startDate={startDate}
                    endDate={endDate}
                    selectsRange
                    customInput={<CustomDatePickerInput />}
                    dateFormat="MM/dd/yy"
                    calendarClassName="bg-white shadow-lg border border-gray-200 rounded-md"
                  />
                  
                  <p className="text-xs text-gray-500 mt-1">Format: mm/dd/yy-mm/dd/yy (start date-end date)</p>
                </div>
              </div>

              {/* Project Overview */}
              <div className="mb-6">
                <label htmlFor="projectOverview" className="block text-sm font-medium mb-1">
                  Project Overview<span className="text-red-500">*</span>
                </label>
                <textarea
                  id="projectOverview"
                  name="projectOverview"
                  required
                  value={formData.projectOverview}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full p-2.5 border border-gray-300 rounded-md"
                  placeholder="Details goes here ..."
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Project Goals */}
                <div>
                  <label htmlFor="projectGoals" className="block text-sm font-medium mb-1">
                    Project goals/objective<span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="projectGoals"
                    name="projectGoals"
                    required
                    value={formData.projectGoals}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full p-2.5 border border-gray-300 rounded-md"
                    placeholder="Details goes here ..."
                  ></textarea>
                </div>

                {/* Expected Outcomes */}
                <div>
                  <label htmlFor="expectedOutcomes" className="block text-sm font-medium mb-1">
                    Expected outcomes<span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="expectedOutcomes"
                    name="expectedOutcomes"
                    required
                    value={formData.expectedOutcomes}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full p-2.5 border border-gray-300 rounded-md"
                    placeholder="Details goes here ..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal line divider */}
        <hr className="my-8 border-t border-gray-200" />

        {/* Team Section */}
        <div className="mb-8">
          <div className="flex">
            {/* Left column - section title */}
            <div className="w-1/4 pr-8">
              <h2 className="text-xl font-bold">Team</h2>
              <p className="text-gray-600 text-sm">Who else is part of this project?</p>
            </div>
            
            {/* Right column - team members management */}
            <div className="w-3/4">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium">
                    Team Members<span className="text-red-500">*</span>
                  </label>
                  <a 
                    href="/users/add"
                    className="text-sm flex items-center text-green-700 hover:text-green-800"
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Add New User
                  </a>
                </div>

                {/* MultipleSelector implementation with styling updates */}
                <div className="relative">
                  <MultipleSelector
                    defaultOptions={teamMemberOptions}
                    onChange={handleTeamMemberChange}
                    placeholder="Select team members..."
                    badgeClassName="bg-green-100 text-green-800 hover:bg-green-200"
                    emptyIndicator={
                      <p className="text-center text-lg leading-10 text-gray-600">
                        No team members found.
                      </p>
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal line divider */}
        <hr className="my-8 border-t border-gray-200" />

        {/* Files & Uploads Section */}
        <div className="mb-8">
          <div className="flex">
            {/* Left column - section title */}
            <div className="w-1/4 pr-8">
              <h2 className="text-xl font-bold">Files & Uploads</h2>
              <p className="text-gray-600 text-sm">Please attach any relevant files</p>
            </div>
            
            {/* Right column - form fields */}
            <div className="w-3/4">
              <div className="border-2 border-dashed border-gray-300 p-6 rounded-md text-center mb-4">
                <label htmlFor="fileUpload" className="cursor-pointer">
                  <div className="flex flex-col items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-gray-700 font-medium mb-1">Drag and drop files here</p>
                    <p className="text-gray-500 text-sm mb-3">or click to browse</p>
                    <p className="text-xs text-gray-400">Supports images (JPG, PNG, GIF) and videos (MP4, WebM)</p>
                  </div>
                </label>
                <input
                  type="file"
                  id="fileUpload"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              
              {/* Display uploaded files */}
              {formData.files.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files:</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {formData.files.map((file, index) => {
                      // Determine if the file is an image or video
                      const isImage = file.type.startsWith('image/');
                      const isVideo = file.type.startsWith('video/');
                      
                      return (
                        <div key={index} className="border rounded-md p-3 flex items-center">
                          <div className="flex-shrink-0 mr-3">
                            {isImage ? (
                              <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            ) : isVideo ? (
                              <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </div>
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {isImage ? 'Image' : isVideo ? 'Video' : 'Document'} • {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newFiles = [...formData.files];
                              newFiles.splice(index, 1);
                              setFormData({...formData, files: newFiles});
                            }}
                            className="flex-shrink-0 ml-2 text-red-500 hover:text-red-700"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Drag and drop functionality */}
              <script dangerouslySetInnerHTML={{
                __html: `
                  const dropZone = document.querySelector('.border-dashed');
                  if (dropZone) {
                    dropZone.addEventListener('dragover', (e) => {
                      e.preventDefault();
                      dropZone.classList.add('border-green-500', 'bg-green-50');
                    });
                    
                    dropZone.addEventListener('dragleave', () => {
                      dropZone.classList.remove('border-green-500', 'bg-green-50');
                    });
                    
                    dropZone.addEventListener('drop', (e) => {
                      e.preventDefault();
                      dropZone.classList.remove('border-green-500', 'bg-green-50');
                      const fileInput = document.getElementById('fileUpload');
                      if (fileInput && e.dataTransfer.files.length > 0) {
                        fileInput.files = e.dataTransfer.files;
                        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
                      }
                    });
                  }
                `
              }} />
            </div>
          </div>
        </div>

        {/* Form buttons */}
        <div className="flex justify-end space-x-3 mt-8">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-green-700 rounded-md text-white hover:bg-green-800 flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;