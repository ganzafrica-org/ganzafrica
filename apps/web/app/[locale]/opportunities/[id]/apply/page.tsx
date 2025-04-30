'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, FileText, Upload, CheckCircle2, ChevronDown, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import apiClient from "@/lib/api-client";

// Country type and data
type Country = {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
  format: string;
  regex: RegExp;
};

const countries: Country[] = [
  {
    code: 'RW',
    name: 'Rwanda',
    flag: '🇷🇼',
    dialCode: '+250',
    format: '+250 7XX XXX XXX',
    regex: /^\+250\s?7[0-9]{2}\s?[0-9]{3}\s?[0-9]{3}$/
  },
  {
    code: 'KE',
    name: 'Kenya',
    flag: '🇰🇪',
    dialCode: '+254',
    format: '+254 7XX XXX XXX',
    regex: /^\+254\s?[71][0-9]{8}$/
  },
  {
    code: 'UG',
    name: 'Uganda',
    flag: '🇺🇬',
    dialCode: '+256',
    format: '+256 7XX XXX XXX',
    regex: /^\+256\s?7[0-9]{8}$/
  },
  {
    code: 'TZ',
    name: 'Tanzania',
    flag: '🇹🇿',
    dialCode: '+255',
    format: '+255 7XX XXX XXX',
    regex: /^\+255\s?[67][0-9]{8}$/
  },
];

// Custom question types
type CustomQuestionType = 'text' | 'textarea' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'file';

type CustomQuestion = {
  id: string;
  question: string;
  field_type: CustomQuestionType;
  options?: string[];
  is_required: boolean;
  max_length?: number;
  order: number;
};

type FormData = {
  firstName: string;
  lastName: string;
  phone: string;
  selectedCountry: Country;
  nationalId: string;
  email: string;
  city: string;
  country: string;
  educationLevel: string;
  institution: string;
  graduationYear: string;
  educationField: string;
  cv: File | null;
  supportingDocs: File | null;
  careerExperience: string;
  certifications: string[];
  motivation: string;
  fiveYearVision: string;
  desiredImpact: string;
  communityRole: string;
  nationalStrategy: string;
  ganzAfricaHelp: string;
  ganzAfricaContribution: string;
  consent: boolean;
  gender: string;
  nationality: string;
  customAnswers: Record<string, any>;
};

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  phone: '',
  selectedCountry: countries[0] ?? {
    code: 'RW',
    name: 'Rwanda',
    flag: '🇷🇼',
    dialCode: '+250',
    format: '### ### ###',
    regex: /^\d{9}$/
  },
  nationalId: '',
  email: '',
  city: '',
  country: '',
  educationLevel: '',
  institution: '',
  graduationYear: '',
  educationField: '',
  cv: null,
  supportingDocs: null,
  careerExperience: '',
  certifications: [],
  motivation: '',
  fiveYearVision: '',
  desiredImpact: '',
  communityRole: '',
  nationalStrategy: '',
  ganzAfricaHelp: '',
  ganzAfricaContribution: '',
  consent: false,
  gender: '',
  nationality: '',
  customAnswers: {}
};

const steps = [
  { title: 'Personal Information', description: 'Basic contact details' },
  { title: 'Experience and Knowledge', description: 'Educational background' },
  { title: 'Work Aspirations', description: 'Career goals' },
  { title: 'Impact to the Community', description: 'Social contribution' },
  { title: 'Programme Relevance', description: 'Final steps' },
  { title: 'Custom Questions', description: 'Opportunity-specific questions' }
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

interface OpportunityApplicationFormProps {
  opportunityId: number | string;
  opportunity?: any;
}

export default function OpportunityApplicationForm({ opportunityId, opportunity }: OpportunityApplicationFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [direction, setDirection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [opportunityData, setOpportunityData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch opportunity details if not provided
  useEffect(() => {
    if (opportunity) {
      setOpportunityData(opportunity);
      setIsLoading(false);
      return;
    }

    const fetchOpportunity = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get(`/opportunities/${opportunityId}`);
        setOpportunityData(response.data?.opportunity || response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch opportunity details:", err);
        setError("Failed to load opportunity details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (opportunityId) {
      fetchOpportunity();
    }
  }, [opportunityId, opportunity]);

  // Adjust steps based on whether there are custom questions
  useEffect(() => {
    if (opportunityData) {
      const hasCustomQuestions = opportunityData.custom_questions && 
                                 Array.isArray(opportunityData.custom_questions) && 
                                 opportunityData.custom_questions.length > 0;
      
      // Remove custom questions step if there are none
      if (!hasCustomQuestions) {
        steps.pop();
      }
    }
  }, [opportunityData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // If the user is typing and hasn't added the country code, add it
    if (!value.startsWith('+') && value.length > 0) {
      value = formData.selectedCountry.dialCode + ' ' + value;
    }

    // Remove any non-digit characters except + and space
    value = value.replace(/[^\d+\s]/g, '');

    setFormData(prev => ({
      ...prev,
      phone: value
    }));
  };

  const handleCountrySelect = (country: Country) => {
    setFormData(prev => ({
      ...prev,
      selectedCountry: country,
      phone: prev.phone ? country.dialCode + prev.phone.substring(prev.selectedCountry.dialCode.length) : ''
    }));
    setIsCountryDropdownOpen(false);
  };

  const handleCertificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, value.trim()]
      }));
      
      // Clear the input
      e.target.value = '';
    }
  };

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'cv' | 'supportingDocs') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PDF, DOC or DOCX files are allowed');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        [field]: file
      }));
      toast.success(`${field === 'cv' ? 'CV' : 'Supporting document'} uploaded successfully`);
    }
  };

  const handleCustomAnswerChange = (questionId: string, value: any, fieldType: CustomQuestionType) => {
    // Handle different field types appropriately
    let processedValue = value;
    
    if (fieldType === 'multiselect') {
      // For multiselect, we need to update an array
      const currentValues = formData.customAnswers[questionId] || [];
      if (Array.isArray(currentValues)) {
        const valueIndex = currentValues.indexOf(value);
        if (valueIndex === -1) {
          processedValue = [...currentValues, value];
        } else {
          processedValue = currentValues.filter(v => v !== value);
        }
      } else {
        processedValue = [value];
      }
    }
    
    setFormData(prev => ({
      ...prev,
      customAnswers: {
        ...prev.customAnswers,
        [questionId]: processedValue
      }
    }));
  };

  const validateStep = () => {
    switch (currentStep) {
      case 0: // Personal Information
        if (!formData.firstName || !formData.lastName || !formData.phone || !formData.nationalId || !formData.email || !formData.city || !formData.country) {
          toast.error('Please fill in all required fields');
          return false;
        }
        if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          toast.error('Please enter a valid email address');
          return false;
        }
        if (!formData.selectedCountry.regex.test(formData.phone)) {
          toast.error(`Please enter a valid ${formData.selectedCountry.name} phone number\nFormat: ${formData.selectedCountry.format}`);
          return false;
        }
        break;
      case 1: // Education & Experience
        if (!formData.educationLevel || !formData.educationField || !formData.cv || !formData.careerExperience) {
          toast.error('Please fill in all required fields');
          return false;
        }
        break;
      case 2: // Vision & Motivation
        if (!formData.motivation || !formData.fiveYearVision) {
          toast.error('Please fill in all required fields');
          return false;
        }
        break;
      case 3: // Community Impact
        if (!formData.desiredImpact || !formData.communityRole || !formData.nationalStrategy) {
          toast.error('Please fill in all required fields');
          return false;
        }
        break;
      case 4: // Programme Relevance
        if (!formData.ganzAfricaHelp || !formData.ganzAfricaContribution || !formData.consent) {
          toast.error('Please fill in all required fields and accept the terms');
          return false;
          return false;
        }
        break;
      case 5: // Custom Questions
        if (opportunityData?.custom_questions) {
          const requiredQuestions = opportunityData.custom_questions.filter((q: CustomQuestion) => q.is_required);
          for (const question of requiredQuestions) {
            const answer = formData.customAnswers[question.id];
            if (answer === undefined || answer === null || answer === '' || (Array.isArray(answer) && answer.length === 0)) {
              toast.error(`Please answer all required questions: ${question.question}`);
              return false;
            }
          }
        }
        break;
    }
    return true;
  };

  // Create a file upload function
  const uploadFileAndGetUrl = async (file: File, fileType: string): Promise<string> => {
    // Simulate a file upload - in a real app, you'd upload to your server or cloud storage
    const fileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const timestamp = new Date().getTime();
    const mockUploadUrl = `https://example-storage.com/${fileType}/${timestamp}_${fileName}`;
    
    // Simulate a delay for the upload
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return mockUploadUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
    
    if (!validateStep()) return;
    
    setIsSubmitting(true);
  
    try {
      // Process file uploads
      let cvUrl = "";
      let supportingDocsUrl = "";
      
      if (formData.cv) {
        cvUrl = await uploadFileAndGetUrl(formData.cv, 'cv');
      } else {
        throw new Error('CV is required');
      }
      
      if (formData.supportingDocs) {
        supportingDocsUrl = await uploadFileAndGetUrl(formData.supportingDocs, 'supporting_docs');
      }
      
      // Prepare the application data in both formats to accommodate potential backend inconsistencies
      const applicationData = {
        // Both formats for name fields
        full_name: `${formData.firstName} ${formData.lastName}`,
        first_name: formData.firstName,
        last_name: formData.lastName,
        
        // Basic information
        email: formData.email,
        phone: formData.phone,
        national_id: formData.nationalId,
        city: formData.city,
        country: formData.country,
        gender: formData.gender || undefined,
        nationality: formData.nationality || undefined,
        
        // Education details
        education_level: formData.educationLevel,
        field_of_study: formData.educationField,
        institution: formData.institution || undefined,
        graduation_year: formData.graduationYear ? parseInt(formData.graduationYear) : undefined,
        certifications: formData.certifications.length > 0 ? formData.certifications : undefined,
        
        // Experience and files
        career_experience: formData.careerExperience,
        cv_url: cvUrl,
        supporting_docs_url: supportingDocsUrl || undefined,
        
        // Vision and motivation
        motivation: formData.motivation,
        five_year_vision: formData.fiveYearVision,
        
        // Impact and community
        desired_impact: formData.desiredImpact,
        community_role: formData.communityRole,
        national_strategy: formData.nationalStrategy,
        
        // Program relevance
        how_ganzafrica_can_help: formData.ganzAfricaHelp,
        contribution_to_ganzafrica: formData.ganzAfricaContribution,
        
        // Consent
        data_processing_consent: formData.consent,
        
        // Custom answers
        custom_answers: formData.customAnswers
      };
  
      // Determine the endpoint based on opportunity ID
      const endpoint = `/${opportunityId}/apply`;
  
      // Submit the application
      const response = await apiClient.post(endpoint, applicationData);
  
      // Application was submitted successfully
      toast.success('Application submitted successfully!');
      
      // Redirect after success
      // Redirect after success
      setTimeout(() => {
        router.push('/en/opportunities?success=true');
      }, 1500);
    } catch (error: any) {
      console.error('Application submission error:', error);
      
      // Handle error response from the API
      if (error.response && error.response.data) {
        // If the error has a structured response
        const errorMessage = error.response.data.message || error.response.data.error || 'Failed to submit application';
        toast.error(errorMessage);
        
        // If there are validation errors, display them
        if (error.response.data.details && Array.isArray(error.response.data.details)) {
          error.response.data.details.forEach((detail: any) => {
            toast.error(`${detail.path}: ${detail.message}`);
          });
        }
      } else {
        // Generic error message
        toast.error(error instanceof Error ? error.message : 'Failed to submit application. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (!validateStep()) return;
    setDirection(1);
    setDirection(1);
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const renderProgressBar = () => (
    <div className="mb-8">
    <div className="mb-8">
      <div className="flex justify-between mb-4">
        {steps.map((step, index) => (
        {steps.map((step, index) => (
          <div key={step.title} className="flex flex-col items-center relative group">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                index <= currentStep ? 'bg-[#005c3d] text-[#fef597]' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {index < currentStep ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                index + 1
              )}
            </div>
              )}
            </div>
            <div className="absolute -bottom-16 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-2 rounded-lg shadow-lg text-sm w-48 text-center">
              <p className="font-semibold">{step.title}</p>
              <p className="text-gray-600 text-xs">{step.description}</p>
            </div>
            <span className="text-xs mt-2 text-center font-medium">{step.title}</span>
          </div>
        ))}
      </div>
      <div className="relative">
        <div className="absolute top-1/2 w-full h-1 bg-gray-200 -translate-y-1/2" />
        <div 
          className="absolute top-1/2 h-1 bg-[#005c3d] -translate-y-1/2 transition-all duration-500"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );

  // Render custom questions
  const renderCustomQuestions = () => {
    if (!opportunityData?.custom_questions || !Array.isArray(opportunityData.custom_questions) || opportunityData.custom_questions.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No additional questions for this opportunity.</p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <h3 className="text-xl font-semibold text-[#005c3d] mb-4">Opportunity-Specific Questions</h3>
        
        {opportunityData.custom_questions
          .sort((a: CustomQuestion, b: CustomQuestion) => a.order - b.order)
          .map((question: CustomQuestion) => (
            <div key={question.id} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {question.question} {question.is_required && <span className="text-red-500">*</span>}
              </label>
              
              {question.field_type === 'text' && (
                <input
                  type="text"
                  value={formData.customAnswers[question.id] || ''}
                  onChange={(e) => handleCustomAnswerChange(question.id, e.target.value, question.field_type)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#005c3d] focus:border-[#005c3d]"
                  required={question.is_required}
                  maxLength={question.max_length}
                />
              )}
              
              {question.field_type === 'textarea' && (
                <textarea
                  value={formData.customAnswers[question.id] || ''}
                  onChange={(e) => handleCustomAnswerChange(question.id, e.target.value, question.field_type)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#005c3d] focus:border-[#005c3d]"
                  required={question.is_required}
                  maxLength={question.max_length}
                  rows={4}
                />
              )}
              
              {question.field_type === 'select' && question.options && (
                <select
                  value={formData.customAnswers[question.id] || ''}
                  onChange={(e) => handleCustomAnswerChange(question.id, e.target.value, question.field_type)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#005c3d] focus:border-[#005c3d]"
                  required={question.is_required}
                >
                  <option value="">Select an option</option>
                  {question.options.map((option, idx) => (
                    <option key={idx} value={option}>{option}</option>
                  ))}
                </select>
              )}
              
              {question.field_type === 'multiselect' && question.options && (
  <div className="space-y-2 border border-gray-300 rounded-md p-3">
    {question.options.map((option, idx) => {
      const isSelected = Array.isArray(formData.customAnswers[question.id]) && 
                        formData.customAnswers[question.id]?.includes(option);
      return (
        <div key={idx} className="flex items-center">
          <input
            type="checkbox"
            id={`${question.id}-${idx}`}
            checked={isSelected}
            onChange={() => handleCustomAnswerChange(question.id, option, question.field_type)}
            className="mr-2"
          />
          <label htmlFor={`${question.id}-${idx}`} className="text-sm text-gray-700">
            {option}
          </label>
        </div>
      );
    })}
  </div>
)}
              
              {question.field_type === 'radio' && question.options && (
                <div className="space-y-2 border border-gray-300 rounded-md p-3">
                  {question.options.map((option, idx) => (
                    <div key={idx} className="flex items-center">
                      <input
                        type="radio"
                        id={`${question.id}-${idx}`}
                        name={question.id}
                        value={option}
                        checked={formData.customAnswers[question.id] === option}
                        onChange={() => handleCustomAnswerChange(question.id, option, question.field_type)}
                        className="mr-2"
                        required={question.is_required}
                      />
                      <label htmlFor={`${question.id}-${idx}`} className="text-sm text-gray-700">
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              )}
              
              {question.field_type === 'checkbox' && question.options && (
                <div className="space-y-2 border border-gray-300 rounded-md p-3">
                  {question.options.map((option, idx) => (
                    <div key={idx} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`${question.id}-${idx}`}
                        checked={formData.customAnswers[question.id] === option}
                        onChange={() => handleCustomAnswerChange(question.id, option, question.field_type)}
                        className="mr-2"
                      />
                      <label htmlFor={`${question.id}-${idx}`} className="text-sm text-gray-700">
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              )}
              
              {question.field_type === 'file' && (
                <div className="flex items-center space-x-2">
                  <input 
                    type="file"
                    id={`${question.id}-file`}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleCustomAnswerChange(question.id, file, question.field_type);
                      }
                    }}
                    required={question.is_required}
                  />
                  <label
                    htmlFor={`${question.id}-file`}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
                  >
                    <Upload className="w-5 h-5 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-700">Choose File</span>
                  </label>
                  {formData.customAnswers[question.id] && (
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      <span>File uploaded</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
      </div>
    );
  };

  // Loading and error states
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#005c3d] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Error Loading Application</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/en/opportunities')}
            className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
          >
            Return to Opportunities
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-16">
      {/* Hero Section with Opportunity Title */}
      <section className="relative h-[400px] md:h-[500px]">
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/videos/hero-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="container mx-auto px-4 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl md:text-5xl font-bold text-white mb-4"
            >
              Apply for <span className="text-[#FDB022]">{opportunityData?.title || 'Opportunity'}</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-white/90 text-base md:text-lg max-w-2xl mx-auto mb-6"
            >
              {opportunityData?.description?.substring(0, 120) || 'Complete the application form below to apply for this opportunity.'}
              {opportunityData?.description?.length > 120 ? '...' : ''}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex items-center justify-center gap-6 text-white/90"
            >
              <div className="flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2 text-[#FDB022]" />
                <span>{opportunityData?.type || 'Opportunity'}</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-[#FDB022]"></div>
              <div className="flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2 text-[#FDB022]" />
                <span>{opportunityData?.location || 'Location varies'}</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-[#FDB022]"></div>
              <div className="flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2 text-[#FDB022]" />
                <span>Deadline: {new Date(opportunityData?.application_deadline || Date.now()).toLocaleDateString()}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 -mt-20 relative z-20">
        <div className="bg-white rounded-xl shadow-xl p-10">
          {renderProgressBar()}
          
          <form onSubmit={handleSubmit} className="relative mt-12">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                  opacity: { duration: 0.2 }
                }}
                className="relative"
              >
                {currentStep === 0 && (
              >
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-[#005c3d] mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="firstName">
                          First Name *
                        </label>
                        <input
                          type="text"
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#005c3d] focus:border-[#005c3d] bg-white text-gray-800 placeholder-gray-400"
                          required
                          required
                          title="Enter your first name"
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div>
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="lastName">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#005c3d] focus:border-[#005c3d] bg-white text-gray-800 placeholder-gray-400"
                          required
                          required
                          title="Enter your last name"
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>
                    <div>
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                        Email *
                      </label>
                      <input
                        type="email"
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#005c3d] focus:border-[#005c3d] bg-white text-gray-800 placeholder-gray-400"
                        required
                        required
                        title="Enter your email address"
                        placeholder="Enter your email address"
                      />
                    </div>
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                          className="absolute inset-y-0 left-0 flex items-center pl-3 pr-2 border-r border-gray-300"
                        >
                        >
                          <span className="text-lg mr-1">{formData.selectedCountry.flag}</span>
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        </button>
                        </button>
                        <input
                          type="tel"
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handlePhoneChange}
                          name="phone"
                          value={formData.phone}
                          onChange={handlePhoneChange}
                          className="w-full pl-24 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#005c3d] focus:border-[#005c3d] bg-white text-gray-800 placeholder-gray-400"
                          required
                          title="Enter your phone number"
                          placeholder={formData.selectedCountry.format}
                        />
                        {isCountryDropdownOpen && (
                          placeholder={formData.selectedCountry.format}
                        />
                        {isCountryDropdownOpen && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                            {countries.map((country) => (
                              <button
                                key={country.code}
                                type="button"
                                onClick={() => handleCountrySelect(country)}
                            {countries.map((country) => (
                              <button
                                key={country.code}
                                type="button"
                                onClick={() => handleCountrySelect(country)}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
                              >
                              >
                                <span className="text-lg">{country.flag}</span>
                                <span>{country.name}</span>
                                <span className="text-gray-500 text-sm">{country.dialCode}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="nationalId">
                        National ID *
                      </label>
                      <input
                        type="text"
                        id="nationalId"
                        name="nationalId"
                        value={formData.nationalId}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#005c3d] focus:border-[#005c3d] bg-white text-gray-800 placeholder-gray-400"
                        required
                        title="Enter your national ID number"
                        placeholder="Enter your national ID number"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="city">
                          City *
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#005c3d] focus:border-[#005c3d] bg-white text-gray-800 placeholder-gray-400"
                          required
                          title="Enter your city"
                          placeholder="Enter your city"
                        />
                      </div>
                      <div>
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="country">
                          Country *
                        </label>
                        <input
                          type="text"
                          type="text"
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#005c3d] focus:border-[#005c3d] bg-white text-gray-800 placeholder-gray-400"
                          required
                          required
                          title="Enter your country"
                          placeholder="Enter your country"
                        />
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="nationality">
                          Nationality
                        </label>
                        <input
                          type="text"
                          id="nationality"
                          name="nationality"
                          value={formData.nationality}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#005c3d] focus:border-[#005c3d] bg-white text-gray-800 placeholder-gray-400"
                          title="Enter your nationality"
                          placeholder="Enter your nationality"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="gender">
                          Gender
                        </label>
                        <select
                          id="gender"
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#005c3d] focus:border-[#005c3d] bg-white text-gray-800 placeholder-gray-400"
                          title="Select your gender"
                        >
                          <option value="">Select your gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="non_binary">Non-binary</option>
                          <option value="prefer_not_to_say">Prefer not to say</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-[#005c3d] mb-4">Education & Experience</h3>
                    <div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="educationLevel">
                        Education Level *
                      </label>
                      <select
                      <select
                        id="educationLevel"
                        name="educationLevel"
                        value={formData.educationLevel}
                        onChange={handleInputChange}
                        name="educationLevel"
                        value={formData.educationLevel}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#005c3d] focus:border-[#005c3d] bg-white text-gray-800 placeholder-gray-400"
                        required
                        title="Select your education level"
                      >
                        required
                        title="Select your education level"
                      >
                        <option value="">Select your education level</option>
                        <option value="high_school">High School</option>
                        <option value="associate_degree">Associate Degree</option>
                        <option value="bachelors_degree">Bachelor's Degree</option>
                        <option value="masters_degree">Master's Degree</option>
                        <option value="doctorate">PhD</option>
                        <option value="professional_certification">Professional Certification</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="institution">
                          Institution/University
                        </label>
                        <input
                          type="text"
                          id="institution"
                          name="institution"
                          value={formData.institution}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#005c3d] focus:border-[#005c3d] bg-white text-gray-800 placeholder-gray-400"
                          title="Enter your institution name"
                          placeholder="Enter your institution name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="graduationYear">
                          Graduation Year
                        </label>
                        <input
                          type="number"
                          id="graduationYear"
                          name="graduationYear"
                          value={formData.graduationYear}
                          onChange={handleInputChange}
                          min="1950"
                          max="2030"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#005c3d] focus:border-[#005c3d] bg-white text-gray-800 placeholder-gray-400"
                          title="Enter your graduation year"
                          placeholder="Enter your graduation year"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="educationField">
                        Field of Study *
                      </label>
                      <input
                        type="text"
                        type="text"
                        id="educationField"
                        name="educationField"
                        value={formData.educationField}
                        onChange={handleInputChange}
                        name="educationField"
                        value={formData.educationField}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#005c3d] focus:border-[#005c3d] bg-white text-gray-800 placeholder-gray-400"
                        required
                        title="Enter your field of study"
                        placeholder="Enter your field of study"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Certifications
                      </label>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input
                            type="text"
                            id="certificationInput"
                            placeholder="Add certification and press Enter"
                            className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-[#005c3d] focus:border-[#005c3d] bg-white text-gray-800 placeholder-gray-400"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleCertificationChange(e as unknown as React.ChangeEvent<HTMLInputElement>);
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={(e) => handleCertificationChange({ target: { value: (document.getElementById('certificationInput') as HTMLInputElement).value } } as React.ChangeEvent<HTMLInputElement>)}
                            className="px-4 py-2 bg-[#005c3d] text-white rounded-r-md hover:bg-[#00482e]"
                          >
                            Add
                          </button>
                        </div>
                        {formData.certifications.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {formData.certifications.map((cert, idx) => (
                              <div key={idx} className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                                <span className="text-sm text-gray-800">{cert}</span>
                                <button
                                  type="button"
                                  onClick={() => removeCertification(idx)}
                                  className="ml-2 text-gray-500 hover:text-red-500"
                                >
                                  &times;
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="careerExperience">
                        Career Experience *
                      </label>
                      <textarea
                        id="careerExperience"
                        name="careerExperience"
                        value={formData.careerExperience}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#005c3d] focus:border-[#005c3d] bg-white text-gray-800 placeholder-gray-400"
                        required
                        required
                        title="Describe your career experience and training"
                        placeholder="Share your professional journey, including relevant work experience and training..."
                      />
                    </div>
                    <div>
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="cv">
                        CV (PDF, DOC, DOCX) *
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="file"
                          type="file"
                          id="cv"
                          name="cv"
                          onChange={(e) => handleFileChange(e, 'cv')}
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          required
                          title="Upload your CV"
                        />
                        <label
                          htmlFor="cv"
                          className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
                        >
                         <Upload className="w-5 h-5 mr-2 text-gray-500" />
                          <span className="text-sm text-gray-700">Choose CV</span>
                        </label>
                        {formData.cv && (
                          <div className="flex items-center text-sm text-green-600">
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            <span>CV uploaded: {formData.cv.name}</span>
                          </div>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-500">Max file size: 5MB</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="supportingDocs">
                        Supporting Documents (PDF, DOC, DOCX)
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="file"
                          type="file"
                          id="supportingDocs"
                          name="supportingDocs"
                          onChange={(e) => handleFileChange(e, 'supportingDocs')}
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          title="Upload supporting documents"
                        />
                        <label
                          htmlFor="supportingDocs"
                          className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
                        >
                          <FileText className="w-5 h-5 mr-2 text-gray-500" />
                          <span className="text-sm text-gray-700">Choose Documents</span>
                        </label>
                        {formData.supportingDocs && (
                          <div className="flex items-center text-sm text-green-600">
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            <span>Documents uploaded: {formData.supportingDocs.name}</span>
                          </div>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-500">Max file size: 5MB</p>
                    </div>
                  </div>
                )}
                  </div>
                )}

                {currentStep === 2 && (
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-[#005c3d] mb-4">Vision & Motivation</h3>
                    <div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="motivation">
                        Motivation *
                      </label>
                      <textarea
                        id="motivation"
                        name="motivation"
                        value={formData.motivation}
                        onChange={handleInputChange}
                        rows={4}
                        name="motivation"
                        value={formData.motivation}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#005c3d] focus:border-[#005c3d] bg-white text-gray-800 placeholder-gray-400"
                        required
                        required
                        title="Explain your motivation for applying"
                        placeholder="What motivates you to apply for this opportunity?"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fiveYearVision">
                        Five-Year Vision *
                      </label>
                      <textarea
                        id="fiveYearVision"
                        name="fiveYearVision"
                        value={formData.fiveYearVision}
                        onChange={handleInputChange}
                        rows={4}
                        name="fiveYearVision"
                        value={formData.fiveYearVision}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#005c3d] focus:border-[#005c3d] bg-white text-gray-800 placeholder-gray-400"
                        required
                        required
                        title="Describe your five-year vision"
                        placeholder="Where do you see yourself in five years? What goals do you want to achieve?"
                      />
                    </div>
                  </div>
                )}
                      />
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-[#005c3d] mb-4">Community Impact</h3>
                    <div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="desiredImpact">
                        Desired Impact *
                      </label>
                      <textarea
                        id="desiredImpact"
                        name="desiredImpact"
                        value={formData.desiredImpact}
                        onChange={handleInputChange}
                        rows={4}
                        name="desiredImpact"
                        value={formData.desiredImpact}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#005c3d] focus:border-[#005c3d] bg-white text-gray-800 placeholder-gray-400"
                        required
                        required
                        title="Describe the impact you want to make"
                        placeholder="What impact do you want to make in your community and country?"
                      />
                    </div>
                    <div>
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="communityRole">
                        Community Role *
                      </label>
                      <textarea
                        id="communityRole"
                        name="communityRole"
                        value={formData.communityRole}
                        onChange={handleInputChange}
                        rows={4}
                        name="communityRole"
                        value={formData.communityRole}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#005c3d] focus:border-[#005c3d] bg-white text-gray-800 placeholder-gray-400"
                        required
                        required
                        title="Describe your role in the community"
                        placeholder="How do you currently contribute to your community?"
                      />
                    </div>
                    <div>
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="nationalStrategy">
                        National Strategy *
                      </label>
                      <textarea
                        id="nationalStrategy"
                        name="nationalStrategy"
                        value={formData.nationalStrategy}
                        onChange={handleInputChange}
                        rows={4}
                        name="nationalStrategy"
                        value={formData.nationalStrategy}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#005c3d] focus:border-[#005c3d] bg-white text-gray-800 placeholder-gray-400"
                        required
                        required
                        title="Describe the national strategy you want to contribute to"
                        placeholder="Which national strategy, policy or flagship programme do you want to contribute to and why?"
                      />
                    </div>
                  </div>
                )}
                      />
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-[#005c3d] mb-4">Programme Relevance</h3>
                    <div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="ganzAfricaHelp">
                        How can GanzAfrica help you? *
                      </label>
                      <textarea
                        id="ganzAfricaHelp"
                        name="ganzAfricaHelp"
                        value={formData.ganzAfricaHelp}
                        onChange={handleInputChange}
                        rows={4}
                        name="ganzAfricaHelp"
                        value={formData.ganzAfricaHelp}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#005c3d] focus:border-[#005c3d] bg-white text-gray-800 placeholder-gray-400"
                        required
                        required
                        title="Explain how GanzAfrica can help you achieve your goals"
                        placeholder="How do you think GanzAfrica will help you achieve your career goals?"
                      />
                    </div>
                    <div>
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="ganzAfricaContribution">
                        How can you contribute to GanzAfrica? *
                      </label>
                      <textarea
                        id="ganzAfricaContribution"
                        name="ganzAfricaContribution"
                        value={formData.ganzAfricaContribution}
                        onChange={handleInputChange}
                        rows={4}
                        name="ganzAfricaContribution"
                        value={formData.ganzAfricaContribution}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#005c3d] focus:border-[#005c3d] bg-white text-gray-800 placeholder-gray-400"
                        required
                        required
                        title="Describe your potential contributions to GanzAfrica"
                        placeholder="What unique skills, perspectives, or contributions can you offer to GanzAfrica?"
                      />
                    </div>
                      />
                    </div>
                    <div className="flex items-start space-x-2 mt-8">
                      <input
                        type="checkbox"
                      <input
                        type="checkbox"
                        id="consent"
                        name="consent"
                        checked={formData.consent}
                        name="consent"
                        checked={formData.consent}
                        onChange={handleInputChange}
                        className="mt-1"
                        required
                        required
                        title="Consent to data processing"
                      />
                      />
                      <label htmlFor="consent" className="text-sm text-gray-700">
                        I consent to the processing of my personal data in accordance with the privacy policy and terms and conditions *
                      </label>
                    </div>
                  </div>
                )}

                {currentStep === 5 && renderCustomQuestions()}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            {/* Navigation Buttons */}
            <div className="mt-12 flex justify-between items-center pt-8 border-t border-gray-100">
              <button
                type="button"
                onClick={prevStep}
                className={`flex items-center px-8 py-3 text-sm font-medium rounded-full transition-all duration-300 ${
                  currentStep === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                    : 'bg-[#005c3d] text-[#fef597] hover:bg-[#009758] hover:shadow-lg transform hover:-translate-y-1'
                }`}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Previous
              </button>

              {currentStep === steps.length - 1 ? (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex items-center px-8 py-3 text-sm font-medium rounded-full bg-[#005c3d] text-[#fef597] hover:bg-[#009758] transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⚬</span>
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextStep}
                  type="button"
                  onClick={nextStep}
                  className="flex items-center px-8 py-3 text-sm font-medium rounded-full bg-[#005c3d] text-[#fef597] hover:bg-[#009758] transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                >
                  Next
                >
                  Next
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              )}
            </div>
            </form>
        </div>
      </div>
    </div>

  );
}                
                    