// "use client";

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { 
//   ArrowLeft,
//   Calendar,
//   User,
//   Tag,
//   Clock,
//   CheckCircle,
//   FileText,
//   Mail,
//   Phone,
//   MapPin,
//   GraduationCap,
//   Briefcase,
//   AlertCircle,
//   Download,
//   MessageSquare,
//   ThumbsUp,
//   ThumbsDown,
//   UserPlus,
//   X
// } from 'lucide-react';

// // Define TypeScript interfaces
// interface Review {
//   id: number;
//   application_id: number;
//   reviewer_id: number;
//   score: number;
//   comments: string;
//   recommendation: string;
//   created_at: string;
//   updated_at: string;
// }

// interface Application {
//   id: number;
//   opportunity_id: number;
//   full_name: string;
//   email: string;
//   phone: string;
//   gender: string;
//   nationality: string;
//   country: string;
//   education_level: string;
//   institution: string;
//   field_of_study: string;
//   graduation_year: number;
//   certifications: string[];
//   resume_url: string;
//   custom_answers: Record<string, any>;
//   status: string;
//   submission_date: string;
//   user_id?: number;
//   created_at: string;
//   updated_at: string;
//   reviews?: Review[];
// }

// interface Opportunity {
//   id: number;
//   title: string;
//   description: string;
//   type: string;
//   status: string;
//   custom_questions?: Array<{
//     id: string;
//     question: string;
//     field_type: string;
//     options?: string[];
//     is_required: boolean;
//   }>;
// }

// const ApplicationDetailsPage = ({ params }: { params: { id: string } }) => {
//   const router = useRouter();
//   const [application, setApplication] = useState<Application | null>(null);
//   const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [users, setUsers] = useState<Record<number, string>>({});
//   const [activeTab, setActiveTab] = useState('details');
  
//   // State for review form
//   const [reviewForm, setReviewForm] = useState({
//     score: 0,
//     comments: '',
//     recommendation: 'pending'
//   });
  
//   // State for status update
//   const [newStatus, setNewStatus] = useState('');
//   const [statusLoading, setStatusLoading] = useState(false);
//   const [statusError, setStatusError] = useState<string | null>(null);
//   const [statusSuccess, setStatusSuccess] = useState(false);

//   // Fetch application data
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
        
//         // Fetch application details
//         const applicationResponse = await axios.get(`http://localhost:3002/api/opportunities/applications/${params.id}`);
        
//         if (applicationResponse.data && applicationResponse.data.application) {
//           setApplication(applicationResponse.data.application);
          
//           // Fetch opportunity details based on the application
//           try {
//             const opportunityResponse = await axios.get(`http://localhost:3002/api/opportunities/${applicationResponse.data.application.opportunity_id}`);
//             if (opportunityResponse.data && opportunityResponse.data.opportunity) {
//               setOpportunity(opportunityResponse.data.opportunity);
//             }
//           } catch (oppError) {
//             console.error('Error fetching opportunity details:', oppError);
//           }
//         } else {
//           setError('Invalid application data structure');
//         }
        
//         // Set fallback users (you can replace with actual API call)
//         setUsers({
//           1: 'Mukamana Fransine',
//           2: 'John Doe',
//           3: 'Jane Smith',
//           4: 'Michael Johnson'
//         });
        
//       } catch (error) {
//         console.error('Error fetching application:', error);
//         setError('Failed to fetch application details. Please try again later.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [params.id]);

//   // Format date for display
//   const formatDate = (dateString: string | undefined) => {
//     if (!dateString) return 'N/A';
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });
//   };

//   // Get user name from user_id
//   const getUserName = (userId: number | undefined) => {
//     if (!userId) return 'Unknown';
//     return users[userId] || 'Unknown User';
//   };

//   // Handle review form change
//   const handleReviewChange = (e) => {
//     const { name, value } = e.target;
//     setReviewForm(prev => ({
//       ...prev,
//       [name]: name === 'score' ? parseInt(value) : value
//     }));
//   };

//   // Submit review
//   const handleSubmitReview = async (e) => {
//     e.preventDefault();
    
//     if (!application) return;
    
//     try {
//       const response = await axios.post(`http://localhost:3002/api/opportunities/applications/${application.id}/review`, {
//         score: reviewForm.score,
//         comments: reviewForm.comments,
//         recommendation: reviewForm.recommendation
//       });
      
//       // Refresh application data to show the new review
//       const updatedApplication = await axios.get(`http://localhost:3002/api/opportunities/applications/${params.id}`);
//       setApplication(updatedApplication.data.application);
      
//       // Reset form
//       setReviewForm({
//         score: 0,
//         comments: '',
//         recommendation: 'pending'
//       });
      
//       alert('Review submitted successfully');
//     } catch (error) {
//       console.error('Error submitting review:', error);
//       alert('Failed to submit review. Please try again.');
//     }
//   };

//   // Update application status
//   const handleUpdateStatus = async () => {
//     if (!application || !newStatus) return;
    
//     setStatusLoading(true);
//     setStatusError(null);
//     setStatusSuccess(false);
    
//     try {
//       await axios.put(`http://localhost:3002/api/opportunities/applications/${application.id}/status`, {
//         status: newStatus
//       });
      
//       // Update local state
//       setApplication(prev => prev ? { ...prev, status: newStatus } : null);
//       setStatusSuccess(true);
      
//       // Clear status after a delay
//       setTimeout(() => {
//         setStatusSuccess(false);
//       }, 3000);
//     } catch (error) {
//       console.error('Error updating status:', error);
//       setStatusError('Failed to update status. Please try again.');
//     } finally {
//       setStatusLoading(false);
//     }
//   };

//   // Map status to display badge
//   const getStatusBadge = (status: string) => {
//     switch(status.toLowerCase()) {
//       case 'accepted':
//         return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">• Accepted</span>;
//       case 'rejected':
//         return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">• Rejected</span>;
//       case 'submitted':
//         return <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">• Submitted</span>;
//       case 'reviewed':
//         return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">• Reviewed</span>;
//       case 'shortlisted':
//         return <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">• Shortlisted</span>;
//       case 'interviewing':
//         return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">• Interviewing</span>;
//       default:
//         return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">• {status}</span>;
//     }
//   };

//   // Get recommendation badge
//   const getRecommendationBadge = (recommendation: string) => {
//     switch(recommendation.toLowerCase()) {
//       case 'accept':
//         return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Recommend Accept</span>;
//       case 'reject':
//         return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Recommend Reject</span>;
//       case 'waitlist':
//         return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Recommend Waitlist</span>;
//       case 'interview':
//         return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Recommend Interview</span>;
//       default:
//         return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{recommendation}</span>;
//     }
//   };

//   if (loading) {
//     return (
//       <div className="p-6 max-w-full flex items-center justify-center min-h-[80vh]">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading application details...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-6 max-w-full">
//         <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
//           <div className="flex">
//             <AlertCircle className="h-5 w-5 mr-2" />
//             <span>{error}</span>
//           </div>
//           <div className="mt-4">
//             <Link href="/opportunities" className="text-red-700 font-medium hover:underline flex items-center">
//               <ArrowLeft className="w-4 h-4 mr-1" /> Back to Opportunities
//             </Link>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!application) {
//     return (
//       <div className="p-6 max-w-full">
//         <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative" role="alert">
//           <div className="flex">
//             <AlertCircle className="h-5 w-5 mr-2" />
//             <span>Application not found</span>
//           </div>
//           <div className="mt-4">
//             <Link href="/opportunities" className="text-yellow-700 font-medium hover:underline flex items-center">
//               <ArrowLeft className="w-4 h-4 mr-1" /> Back to Opportunities
//             </Link>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 max-w-full">
//       {/* Header section */}
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <Link 
//             href={`/opportunities/${application.opportunity_id}/applications`} 
//             className="text-green-700 hover:underline flex items-center mb-2"
//           >
//             <ArrowLeft className="w-4 h-4 mr-1" /> Back to Applications
//           </Link>
//           <div className="flex items-center">
//             <h1 className="text-2xl font-bold">Application from {application.full_name}</h1>
//             <div className="ml-4">
//               {getStatusBadge(application.status)}
//             </div>
//           </div>
//           <p className="text-gray-500 text-sm">Opportunities / Applications / View</p>
//         </div>
//         {opportunity && (
//           <Link 
//             href={`/opportunities/${opportunity.id}`} 
//             className="px-4 py-2 bg-green-700 rounded text-sm font-medium text-white hover:bg-green-800"
//           >
//             View Opportunity
//           </Link>
//         )}
//       </div>

//       {/* Application content with sidebar */}
//       <div className="flex flex-col md:flex-row gap-6">
//         {/* Sidebar navigation */}
//         <div className="w-full md:w-1/4 bg-white p-4 rounded border border-gray-200">
//           <ul>
//             <li className="mb-6">
//               <button 
//                 onClick={() => setActiveTab('details')}
//                 className={`w-full text-left flex items-start ${activeTab === 'details' ? 'text-green-700' : 'text-gray-700'}`}
//               >
//                 <div className="flex-shrink-0 mt-1">
//                   <div className={`w-3 h-3 rounded-full ${activeTab === 'details' ? 'bg-green-700' : 'bg-gray-300'}`}></div>
//                 </div>
//                 <div className="ml-4">
//                   <p className="font-semibold">Applicant Details</p>
//                   <p className="text-sm text-gray-500">Personal and contact information</p>
//                 </div>
//               </button>
//             </li>
//             <li className="mb-6">
//               <button 
//                 onClick={() => setActiveTab('application')}
//                 className={`w-full text-left flex items-start ${activeTab === 'application' ? 'text-green-700' : 'text-gray-700'}`}
//               >
//                 <div className="flex-shrink-0 mt-1">
//                   <div className={`w-3 h-3 rounded-full ${activeTab === 'application' ? 'bg-green-700' : 'bg-gray-300'}`}></div>
//                 </div>
//                 <div className="ml-4">
//                   <p className="font-semibold">Application Answers</p>
//                   <p className="text-sm text-gray-500">Responses to application questions</p>
//                 </div>
//               </button>
//             </li>
//             <li className="mb-6">
//               <button 
//                 onClick={() => setActiveTab('reviews')}
//                 className={`w-full text-left flex items-start ${activeTab === 'reviews' ? 'text-green-700' : 'text-gray-700'}`}
//               >
//                 <div className="flex-shrink-0 mt-1">
//                   <div className={`w-3 h-3 rounded-full ${activeTab === 'reviews' ? 'bg-green-700' : 'bg-gray-300'}`}></div>
//                 </div>
//                 <div className="ml-4">
//                   <p className="font-semibold">Reviews & Evaluation</p>
//                   <p className="text-sm text-gray-500">Feedback from evaluators</p>
//                 </div>
//               </button>
//             </li>
//           </ul>
          
//           {/* Application Status */}
//           <div className="mt-8 border-t pt-6">
//             <h3 className="text-sm font-semibold mb-3">Application Status</h3>
//             <div className="space-y-3">
//               <div className="p-3 bg-gray-50 rounded-lg">
//                 <p className="text-sm text-gray-500 mb-1">Current Status</p>
//                 <div>{getStatusBadge(application.status)}</div>
//               </div>
              
//               <div className="p-3 bg-gray-50 rounded-lg">
//                 <p className="text-sm text-gray-500 mb-1">Change Status</p>
//                 <select
//                   value={newStatus}
//                   onChange={(e) => setNewStatus(e.target.value)}
//                   className="w-full p-2 border border-gray-300 rounded mb-2 text-sm"
//                 >
//                   <option value="">Select status...</option>
//                   <option value="submitted">Submitted</option>
//                   <option value="reviewed">Reviewed</option>
//                   <option value="shortlisted">Shortlisted</option>
//                   <option value="interviewing">Interviewing</option>
//                   <option value="accepted">Accepted</option>
//                   <option value="rejected">Rejected</option>
//                 </select>
//                 <button
//                   onClick={handleUpdateStatus}
//                   disabled={statusLoading || !newStatus}
//                   className="w-full py-2 bg-green-700 text-white rounded text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
//                 >
//                   {statusLoading ? 'Updating...' : 'Update Status'}
//                 </button>
                
//                 {statusError && (
//                   <p className="text-red-600 text-xs mt-2">{statusError}</p>
//                 )}
                
//                 {statusSuccess && (
//                   <p className="text-green-600 text-xs mt-2">Status updated successfully!</p>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Main content area */}
//         <div className="w-full md:w-3/4">
//           {/* Details tab */}
//           {activeTab === 'details' && (
//             <div className="bg-white p-6 rounded-lg border border-gray-200">
//               <h2 className="text-xl font-bold mb-6">Applicant Information</h2>
              
//               {/* Basic info section */}
//               <div className="mb-8">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="p-4 bg-gray-50 rounded-lg">
//                     <div className="flex items-center mb-2">
//                       <User className="w-4 h-4 text-gray-500 mr-2" />
//                       <span className="text-sm text-gray-500">Full Name</span>
//                     </div>
//                     <p className="font-medium">{application.full_name}</p>
//                   </div>
                  
//                   <div className="p-4 bg-gray-50 rounded-lg">
//                     <div className="flex items-center mb-2">
//                       <Mail className="w-4 h-4 text-gray-500 mr-2" />
//                       <span className="text-sm text-gray-500">Email</span>
//                     </div>
//                     <p className="font-medium">{application.email}</p>
//                   </div>
                  
//                   <div className="p-4 bg-gray-50 rounded-lg">
//                     <div className="flex items-center mb-2">
//                       <Phone className="w-4 h-4 text-gray-500 mr-2" />
//                       <span className="text-sm text-gray-500">Phone</span>
//                     </div>
//                     <p className="font-medium">{application.phone || 'Not provided'}</p>
//                   </div>
                  
//                   <div className="p-4 bg-gray-50 rounded-lg">
//                     <div className="flex items-center mb-2">
//                       <Tag className="w-4 h-4 text-gray-500 mr-2" />
//                       <span className="text-sm text-gray-500">Gender</span>
//                     </div>
//                     <p className="font-medium">{application.gender || 'Not provided'}</p>
//                   </div>
                  
//                   <div className="p-4 bg-gray-50 rounded-lg">
//                     <div className="flex items-center mb-2">
//                       <MapPin className="w-4 h-4 text-gray-500 mr-2" />
//                       <span className="text-sm text-gray-500">Nationality</span>
//                     </div>
//                     <p className="font-medium">{application.nationality || 'Not provided'}</p>
//                   </div>
                  
//                   <div className="p-4 bg-gray-50 rounded-lg">
//                     <div className="flex items-center mb-2">
//                       <MapPin className="w-4 h-4 text-gray-500 mr-2" />
//                       <span className="text-sm text-gray-500">Country of Residence</span>
//                     </div>
//                     <p className="font-medium">{application.country || 'Not provided'}</p>
//                   </div>
//                 </div>
//               </div>
              
//               {/* Education section */}
//               <h2 className="text-xl font-bold mb-4">Education & Experience</h2>
//               <div className="mb-8">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="p-4 bg-gray-50 rounded-lg">
//                     <div className="flex items-center mb-2">
//                       <GraduationCap className="w-4 h-4 text-gray-500 mr-2" />
//                       <span className="text-sm text-gray-500">Education Level</span>
//                     </div>
//                     <p className="font-medium">{application.education_level || 'Not provided'}</p>
//                   </div>
                  
//                   <div className="p-4 bg-gray-50 rounded-lg">
//                     <div className="flex items-center mb-2">
//                       <Briefcase className="w-4 h-4 text-gray-500 mr-2" />
//                       <span className="text-sm text-gray-500">Institution</span>
//                     </div>
//                     <p className="font-medium">{application.institution || 'Not provided'}</p>
//                   </div>
                  
//                   <div className="p-4 bg-gray-50 rounded-lg">
//                     <div className="flex items-center mb-2">
//                       <Tag className="w-4 h-4 text-gray-500 mr-2" />
//                       <span className="text-sm text-gray-500">Field of Study</span>
//                     </div>
//                     <p className="font-medium">{application.field_of_study || 'Not provided'}</p>
//                   </div>
                  
//                   <div className="p-4 bg-gray-50 rounded-lg">
//                     <div className="flex items-center mb-2">
//                       <Calendar className="w-4 h-4 text-gray-500 mr-2" />
//                       <span className="text-sm text-gray-500">Graduation Year</span>
//                     </div>
//                     <p className="font-medium">{application.graduation_year || 'Not provided'}</p>
//                   </div>
//                 </div>
//               </div>
              
//               {/* Certifications */}
//               {application.certifications && application.certifications.length > 0 && (
//                 <div className="mb-8">
//                   <h2 className="text-xl font-bold mb-4">Certifications</h2>
//                   <div className="p-4 bg-gray-50 rounded-lg">
//                     <ul className="list-disc pl-5 space-y-1">
//                       {application.certifications.map((cert, index) => (
//                         <li key={index} className="text-gray-700">{cert}</li>
//                       ))}
//                     </ul>
//                   </div>
//                 </div>
//               )}
              
//               {/* Resume/CV */}
//               {application.resume_url && (
//                 <div className="mb-8">
//                   <h2 className="text-xl font-bold mb-4">Resume/CV</h2>
//                   <div className="p-4 bg-gray-50 rounded-lg">
//                     <a 
//                       href={application.resume_url} 
//                       target="_blank" 
//                       rel="noopener noreferrer"
//                       className="flex items-center text-green-700 hover:underline"
//                     >
//                       <Download className="w-4 h-4 mr-2" />
//                       Download Resume/CV
//                     </a>
//                   </div>
//                 </div>
//               )}
              
//               {/* Submission information */}
//               <div className="mb-8">
//                 <h2 className="text-xl font-bold mb-4">Submission Information</h2>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="p-4 bg-gray-50 rounded-lg">
//                     <div className="flex items-center mb-2">
//                       <Calendar className="w-4 h-4 text-gray-500 mr-2" />
//                       <span className="text-sm text-gray-500">Submission Date</span>
//                     </div>
//                     <p className="font-medium">{formatDate(application.submission_date)}</p>
//                   </div>
                  
//                   <div className="p-4 bg-gray-50 rounded-lg">
//                     <div className="flex items-center mb-2">
//                       <Tag className="w-4 h-4 text-gray-500 mr-2" />
//                       <span className="text-sm text-gray-500">Opportunity</span>
//                     </div>
//                     <p className="font-medium">{opportunity ? opportunity.title : `Opportunity ID: ${application.opportunity_id}`}</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Application answers tab */}
//           {activeTab === 'application' && (
//             <div className="bg-white p-6 rounded-lg border border-gray-200">
//               <h2 className="text-xl font-bold mb-6">Application Responses</h2>
              
//               {application.custom_answers && Object.keys(application.custom_answers).length > 0 ? (
//                 <div className="space-y-6">
//                   {Object.entries(application.custom_answers).map(([questionId, answer], index) => {
//                     // Try to find the question text from the opportunity
//                     const questionData = opportunity?.custom_questions?.find(q => q.id === questionId);
//                     const questionText = questionData ? questionData.question : `Question ${index + 1}`;
                    
//                     return (
//                       <div key={questionId} className="p-4 bg-gray-50 rounded-lg border-l-4 border-green-700">
//                         <p className="font-medium mb-2">{questionText}</p>
//                         <div className="pl-4 border-l border-gray-300">
//                           {typeof answer === 'string' ? (
//                             <p className="text-gray-700 whitespace-pre-line">{answer}</p>
//                           ) : Array.isArray(answer) ? (
//                             <ul className="list-disc pl-5">
//                               {answer.map((item, i) => (
//                                 <li key={i} className="text-gray-700">{item}</li>
//                               ))}
//                             </ul>
//                           ) : (
//                             <p className="text-gray-700">{JSON.stringify(answer)}</p>
//                           )}
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               ) : (
//                 <div className="p-4 bg-gray-50 rounded-lg text-gray-500 text-center">
//                   No custom answers provided for this application.
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Reviews tab */}
//           {activeTab === 'reviews' && (
//             <div className="bg-white p-6 rounded-lg border border-gray-200">
//               <h2 className="text-xl font-bold mb-6">Reviews & Evaluation</h2>
              
//               {/* Existing reviews */}
//               {application.reviews && application.reviews.length > 0 ? (
//                 <div className="mb-8 space-y-4">
//                   <h3 className="text-lg font-semibold mb-3">Review Summary</h3>
                  
//                   {application.reviews.map((review, index) => (
//                     <div key={review.id} className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
//                       <div className="flex justify-between items-start mb-2">
//                         <div className="flex items-center">
//                           <User className="w-4 h-4 text-gray-500 mr-2" />
//                           <span className="font-medium">{getUserName(review.reviewer_id)}</span>
//                         </div>
//                         <div className="flex items-center">
//                           <Clock className="w-4 h-4 text-gray-500 mr-1" />
//                           <span className="text-xs text-gray-500">{formatDate(review.created_at)}</span>
//                         </div>
//                       </div>
                      
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                         <div>
//                           <p className="text-xs text-gray-500 mb-1">Score</p>
//                           <div className="flex items-center">
//                             <div className="w-full bg-gray-200 rounded-full h-2">
//                               <div 
//                                 className="bg-green-600 h-2 rounded-full" 
//                                 style={{ width: `${(review.score / 5) * 100}%` }}
//                               ></div>
//                             </div>
//                             <span className="ml-2 text-sm font-medium">{review.score}/5</span>
//                           </div>
//                         </div>
                        
//                         <div>
//                           <p className="text-xs text-gray-500 mb-1">Recommendation</p>
//                           {getRecommendationBadge(review.recommendation || 'N/A')}
//                         </div>
//                       </div>
                      
//                       {review.comments && (
//                         <div>
//                           <p className="text-xs text-gray-500 mb-1">Comments</p>
//                           <p className="text-sm text-gray-700 bg-white p-3 rounded border border-gray-200 whitespace-pre-line">
//                             {review.comments}
//                           </p>
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="p-4 bg-gray-50 rounded-lg text-gray-500 text-center mb-8">
//                   No reviews have been submitted for this application yet.