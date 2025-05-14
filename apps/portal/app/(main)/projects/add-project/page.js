"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X, Upload, Image, FileVideo, Check, AlertCircle, Loader, UserPlus, ChevronDown, Play, Link as LinkIcon, File, FilePlus } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
// Import shadcn/ui components
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, } from "@workspace/ui/components/command";
import { Popover, PopoverContent, PopoverTrigger, } from "@workspace/ui/components/popover";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Check as CheckIcon } from "lucide-react";
const AddProjectPage = () => {
    const router = useRouter();
    const fileInputRef = useRef(null);
    const documentFileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [formSuccess, setFormSuccess] = useState('');
    const [categories, setCategories] = useState([]);
    const [users, setUsers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [partners, setPartners] = useState([]);
    const [openTeamPopover, setOpenTeamPopover] = useState(false);
    const [openPartnerPopover, setOpenPartnerPopover] = useState(false);
    const [filteredTeamMembers, setFilteredTeamMembers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
    const [mediaSourceType, setMediaSourceType] = useState('file');
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
    const [teamSearchValue, setTeamSearchValue] = useState('');
    const [partnerSearchValue, setPartnerSearchValue] = useState('');
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'planned',
        start_date: '',
        end_date: '',
        category_id: '',
        location: '',
        goals: {
            items: []
        },
        outcomes: {
            items: []
        },
        media: {
            items: []
        },
        members: [],
        partners: [],
        documents: []
    });
    // Temporary state
    const [newGoal, setNewGoal] = useState({ title: '', description: '', completed: false });
    const [newOutcome, setNewOutcome] = useState({ title: '', description: '', status: 'pending' });
    const [newMember, setNewMember] = useState({ team_id: '', role: '' });
    const [newPartner, setNewPartner] = useState({ partner_id: '' });
    const [newDocument, setNewDocument] = useState({ name: '', file: null, file_url: '', file_size: 0 });
    const [newMedia, setNewMedia] = useState({
        file: null,
        type: 'image',
        title: '',
        description: '',
        tag: 'feature',
        cover: false,
        url: '',
        thumbnailUrl: null,
        thumbnailFile: null,
        duration: 0,
        previewUrl: null
    });
    // Clean up blob URLs when component unmounts
    useEffect(() => {
        return () => {
            // Revoke any video preview URL
            if (videoPreviewUrl && videoPreviewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(videoPreviewUrl);
            }
            // Revoke all media blob URLs
            formData.media.items.forEach(media => {
                if (media.url && media.url.startsWith('blob:')) {
                    URL.revokeObjectURL(media.url);
                }
                if (media.thumbnailUrl && media.thumbnailUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(media.thumbnailUrl);
                }
            });
            // Revoke any media preview URLs
            if (newMedia.previewUrl && newMedia.previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(newMedia.previewUrl);
            }
            if (newMedia.thumbnailUrl && newMedia.thumbnailUrl.startsWith('blob:')) {
                URL.revokeObjectURL(newMedia.thumbnailUrl);
            }
        };
    }, [formData.media.items, videoPreviewUrl, newMedia]);
    // Fetch categories, users, teams, partners and roles on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch categories
                const categoriesResponse = await apiClient.get('/categories');
                // Check the structure of the response and extract categories array
                if (categoriesResponse.data && Array.isArray(categoriesResponse.data.categories)) {
                    setCategories(categoriesResponse.data.categories);
                }
                else if (Array.isArray(categoriesResponse.data)) {
                    setCategories(categoriesResponse.data);
                }
                else {
                    console.error('Unexpected categories response format:', categoriesResponse.data);
                    setCategories([]);
                }
                // Fetch roles
                try {
                    const rolesResponse = await apiClient.get('/roles');
                    // Extract roles data based on response structure
                    if (rolesResponse.data && Array.isArray(rolesResponse.data.roles)) {
                        setRoles(rolesResponse.data.roles);
                    }
                    else if (Array.isArray(rolesResponse.data)) {
                        setRoles(rolesResponse.data);
                    }
                }
                catch (error) {
                    console.error('Error fetching roles:', error);
                    setRoles([]);
                }
                // Fetch partners
                try {
                    const partnersResponse = await apiClient.get('/partners');
                    console.log('Partners response:', partnersResponse.data);
                    // Extract partners array
                    if (partnersResponse.data && Array.isArray(partnersResponse.data.partners)) {
                        setPartners(partnersResponse.data.partners);
                    }
                    else if (Array.isArray(partnersResponse.data)) {
                        setPartners(partnersResponse.data);
                    }
                    else {
                        console.error('Unexpected partners response format:', partnersResponse.data);
                        setPartners([]);
                    }
                }
                catch (error) {
                    console.error('Error fetching partners:', error);
                    setPartners([]);
                }
                // Fetch teams
                try {
                    const teamsResponse = await apiClient.get('/teams');
                    console.log('Teams response:', teamsResponse.data);
                    // Check the structure of the response and extract teams array
                    let allTeamMembers = [];
                    if (teamsResponse.data && Array.isArray(teamsResponse.data.teams)) {
                        allTeamMembers = teamsResponse.data.teams;
                        setTeams(teamsResponse.data.teams);
                    }
                    else if (Array.isArray(teamsResponse.data)) {
                        allTeamMembers = teamsResponse.data;
                        setTeams(teamsResponse.data);
                    }
                    else {
                        console.error('Unexpected teams response format:', teamsResponse.data);
                        setTeams([]);
                    }
                    // Safety check to ensure allTeamMembers is an array before proceeding
                    if (!Array.isArray(allTeamMembers)) {
                        console.error('allTeamMembers is not an array:', allTeamMembers);
                        allTeamMembers = [];
                    }
                    // Ensure each member has the required properties for the Command component
                    const processedMembers = allTeamMembers.map(member => {
                        // Make sure member has all required fields
                        return {
                            id: member.id || 0,
                            name: member.name || '',
                            team_type: member.team_type || '',
                            // Add any other properties needed for display
                            position: member.position || '',
                            photo_url: member.photo_url || '',
                            first_name: member.first_name || '',
                            last_name: member.last_name || ''
                        };
                    });
                    // Filter team members with team_type of "team" or "fellow" (case-insensitive)
                    const filtered = processedMembers.filter(member => {
                        // Handle team_type as an object or string - ensure we have a string before calling toLowerCase()
                        let teamTypeName = '';
                        if (typeof member.team_type === 'string') {
                            teamTypeName = member.team_type;
                        }
                        else if (member.team_type && typeof member.team_type === 'object' && member.team_type.name) {
                            teamTypeName = member.team_type.name;
                        }
                        // Safely convert to lowercase if teamTypeName is a string
                        const teamTypeNameLower = typeof teamTypeName === 'string' ? teamTypeName.toLowerCase() : '';
                        return teamTypeNameLower === "team" || teamTypeNameLower === "fellow";
                    });
                    console.log('Filtered team members:', filtered);
                    if (filtered.length === 0) {
                        // If no filtered results, include all team members as fallback
                        console.log('No filtered team members found, using all members as fallback');
                        setFilteredTeamMembers(processedMembers);
                        setUsers(processedMembers);
                    }
                    else {
                        setFilteredTeamMembers(filtered);
                        setUsers(filtered);
                    }
                }
                catch (error) {
                    console.error('Error fetching teams:', error);
                    setTeams([]);
                    setFilteredTeamMembers([]);
                    setUsers([]);
                }
            }
            catch (error) {
                console.error('Error fetching categories:', error);
                setError('Failed to load categories. Please try again.');
                setCategories([]);
            }
        };
        fetchData();
    }, []);
    // Handle input change
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
    // Handle goal input
    const handleGoalChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewGoal(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
    // Handle outcome input
    const handleOutcomeChange = (e) => {
        const { name, value } = e.target;
        setNewOutcome(prev => ({
            ...prev,
            [name]: value
        }));
    };
    // Handle member input
    const handleMemberChange = (e) => {
        const { name, value } = e.target;
        setNewMember(prev => ({
            ...prev,
            [name]: value
        }));
    };
    // Handle media input
    const handleMediaChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewMedia(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
    // Handle document file selection
    const handleDocumentFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setNewDocument(prev => ({
                ...prev,
                file: file,
                name: prev.name || file.name,
                file_size: file.size
            }));
        }
    };
    // Handle document input change
    const handleDocumentChange = (e) => {
        const { name, value } = e.target;
        setNewDocument(prev => ({
            ...prev,
            [name]: value
        }));
    };
    // Add document
    const addDocument = async () => {
        if (!newDocument.file || !newDocument.name) {
            setError('Please select a file and provide a name');
            return;
        }
        try {
            setIsUploading(true);
            setUploadProgress(0);
            // Create form data for file upload
            const formData = new FormData();
            formData.append('file', newDocument.file);
            // Make the upload request to the backend
            const response = await apiClient.post('/uploads/file', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });
            // Check if upload was successful
            if (response.data && response.data.success) {
                console.log('Document uploaded successfully:', response.data.file);
                // Add document to form data
                const documentToAdd = {
                    name: newDocument.name,
                    file_url: response.data.file.url,
                    file_size: newDocument.file.size
                };
                setFormData(prev => ({
                    ...prev,
                    documents: [...prev.documents, documentToAdd]
                }));
                // Reset document form
                setNewDocument({ name: '', file: null, file_url: '', file_size: 0 });
                if (documentFileInputRef.current) {
                    documentFileInputRef.current.value = '';
                }
                setFormSuccess('Document added successfully');
                setTimeout(() => setFormSuccess(''), 3000);
            }
            else {
                throw new Error('Upload failed: Server returned unsuccessful response');
            }
        }
        catch (error) {
            console.error('Error adding document:', error);
            setError('Failed to add document. Please try again.');
        }
        finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };
    // Remove document
    const removeDocument = (index) => {
        setFormData(prev => ({
            ...prev,
            documents: prev.documents.filter((_, i) => i !== index)
        }));
    };
    // Handle selecting a team member
    const handleTeamMemberSelect = (teamId) => {
        // Check if the role is selected
        if (!selectedRole) {
            alert('Please select a role first');
            return;
        }
        // Check if team member is already a member
        const alreadyMember = formData.members.some(member => member.team_id === teamId);
        if (!alreadyMember) {
            const memberToAdd = {
                team_id: teamId,
                role: selectedRole // This will now be one of: 'lead', 'member', 'supervisor', 'contributor'
            };
            setFormData(prev => ({
                ...prev,
                members: [...prev.members, memberToAdd]
            }));
        }
        setOpenTeamPopover(false);
    };
    // Get role name for display
    const getRoleNameById = (roleId) => {
        // For the fixed role values, return the formatted display name
        if (roleId === 'lead')
            return 'Lead';
        if (roleId === 'member')
            return 'Member';
        if (roleId === 'supervisor')
            return 'Supervisor';
        if (roleId === 'contributor')
            return 'Contributor';
        // Fallback for any other role (should not happen with fixed values)
        return roleId?.toString();
    };
    // Handle selecting a partner
    const handlePartnerSelect = (partnerId) => {
        // Check if partner is already added
        const alreadyAdded = formData.partners.some(partner => partner.partner_id === partnerId);
        if (!alreadyAdded) {
            const partnerToAdd = {
                partner_id: partnerId
            };
            setFormData(prev => ({
                ...prev,
                partners: [...prev.partners, partnerToAdd]
            }));
        }
        setOpenPartnerPopover(false);
    };
    // Upload file to the backend server
    const uploadFile = async (file) => {
        setIsUploading(true);
        setUploadProgress(0);
        try {
            // Create form data for file upload
            const formData = new FormData();
            formData.append('file', file);
            // Make the upload request to the backend
            const response = await apiClient.post('/uploads/file', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });
            // Check if upload was successful
            if (response.data && response.data.success) {
                console.log('File uploaded successfully:', response.data.file);
                setUploadProgress(100);
                setIsUploading(false);
                return response.data.file.url;
            }
            else {
                throw new Error('Upload failed: Server returned unsuccessful response');
            }
        }
        catch (error) {
            console.error('Error uploading file to server:', error);
            setIsUploading(false);
            throw error; // Re-throw to handle in the calling function
        }
        finally {
            setIsUploading(false);
        }
    };
    // Handle file selection
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const fileType = file.type.startsWith('image/') ? 'image' : 'video';
            // If previous file was a video, revoke its URL
            if (newMedia.file && newMedia.type === 'video' && newMedia.previewUrl) {
                URL.revokeObjectURL(newMedia.previewUrl);
            }
            // Create a preview for videos
            let previewUrl = URL.createObjectURL(file);
            if (fileType === 'video') {
                // Create a video element to extract metadata
                const videoElement = document.createElement('video');
                videoElement.preload = 'metadata';
                videoElement.src = previewUrl;
                videoElement.onloadedmetadata = () => {
                    const duration = Math.round(videoElement.duration);
                    // Generate thumbnail on load
                    if (videoElement.readyState >= 2) {
                        videoElement.currentTime = 1; // 1 second in to avoid black frames
                        videoElement.onseeked = () => {
                            try {
                                // Create canvas and draw video frame for thumbnail
                                const canvas = document.createElement('canvas');
                                canvas.width = videoElement.videoWidth;
                                canvas.height = videoElement.videoHeight;
                                const ctx = canvas.getContext('2d');
                                ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                                // Get thumbnail as data URL
                                const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);
                                // Update media state with video metadata and thumbnail
                                setNewMedia(prev => ({
                                    ...prev,
                                    file,
                                    type: fileType,
                                    previewUrl,
                                    thumbnailUrl,
                                    duration
                                }));
                            }
                            catch (error) {
                                console.error('Error generating thumbnail:', error);
                                setNewMedia(prev => ({
                                    ...prev,
                                    file,
                                    type: fileType,
                                    previewUrl,
                                    duration
                                }));
                            }
                        };
                    }
                    else {
                        // If we can't generate thumbnail right away, just set basic info
                        setNewMedia(prev => ({
                            ...prev,
                            file,
                            type: fileType,
                            previewUrl,
                            duration
                        }));
                    }
                };
                videoElement.onerror = () => {
                    console.error('Error loading video for preview');
                    setNewMedia(prev => ({
                        ...prev,
                        file,
                        type: fileType,
                        previewUrl
                    }));
                };
            }
            else {
                // For images, just set the basic info
                setNewMedia(prev => ({
                    ...prev,
                    file,
                    type: fileType,
                    previewUrl
                }));
            }
            // Switch to file mode
            setMediaSourceType('file');
        }
    };
    // Generate a video thumbnail
    const generateVideoThumbnail = async (videoFile) => {
        return new Promise((resolve) => {
            try {
                const videoElement = document.createElement('video');
                videoElement.preload = 'metadata';
                videoElement.playsInline = true;
                videoElement.muted = true;
                // Create a URL for the video file
                const videoURL = URL.createObjectURL(videoFile);
                videoElement.src = videoURL;
                // Set a timeout in case the video fails to load
                const timeoutId = setTimeout(() => {
                    console.warn('Video thumbnail generation timed out');
                    URL.revokeObjectURL(videoURL);
                    resolve(null);
                }, 10000); // 10 second timeout
                // Once the video metadata is loaded, capture the thumbnail
                videoElement.onloadedmetadata = () => {
                    // Set current time to the first frame
                    videoElement.currentTime = 1; // 1 second in to avoid black frames
                };
                // When the current time updates (after seeking)
                videoElement.onseeked = () => {
                    try {
                        clearTimeout(timeoutId);
                        // Create a canvas and draw the video frame
                        const canvas = document.createElement('canvas');
                        canvas.width = videoElement.videoWidth;
                        canvas.height = videoElement.videoHeight;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                        // Convert the canvas to a data URL (thumbnail)
                        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);
                        // Clean up
                        URL.revokeObjectURL(videoURL);
                        // Return the thumbnail
                        resolve(thumbnailUrl);
                    }
                    catch (err) {
                        console.error('Error in onseeked handler:', err);
                        URL.revokeObjectURL(videoURL);
                        resolve(null);
                    }
                };
                // Handle errors
                videoElement.onerror = (e) => {
                    console.error('Error in video element:', e);
                    clearTimeout(timeoutId);
                    URL.revokeObjectURL(videoURL);
                    resolve(null);
                };
            }
            catch (err) {
                console.error('Error setting up video element:', err);
                resolve(null);
            }
        });
    };
    // Handle media source type change
    const handleMediaSourceChange = (type) => {
        setMediaSourceType(type);
        // Reset media state based on new source type
        if (type === 'url') {
            if (newMedia.file && newMedia.previewUrl) {
                URL.revokeObjectURL(newMedia.previewUrl);
            }
            setNewMedia(prev => ({
                ...prev,
                file: null,
                previewUrl: null,
                url: '',
            }));
        }
        else {
            setNewMedia(prev => ({
                ...prev,
                url: '',
            }));
        }
    };
    // Validate URL and determine type
    const validateUrl = (url) => {
        try {
            // Simple check if string is not empty
            if (!url || url.trim() === '') {
                return { valid: false, type: null, message: 'URL cannot be empty' };
            }
            // More permissive URL validation to allow a wider range of URLs
            // This pattern only checks for basic URL structure and allows more TLDs
            const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z0-9-]+(\/[a-zA-Z0-9-_.~:/?#[\]@!$&'()*+,;=]*)?$/;
            if (!urlPattern.test(url)) {
                // Fall back to a very basic check - just make sure it has some domain structure
                const veryBasicPattern = /^(https?:\/\/)?[a-zA-Z0-9-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/;
                if (!veryBasicPattern.test(url)) {
                    return { valid: false, type: null, message: 'Invalid URL format' };
                }
            }
            // Check if URL ends with common image extensions
            const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff'];
            const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.flv'];
            const lowerUrl = url.toLowerCase();
            // Determine type based on extension
            let type = null;
            if (imageExtensions.some(ext => lowerUrl.endsWith(ext))) {
                type = 'image';
            }
            else if (videoExtensions.some(ext => lowerUrl.endsWith(ext))) {
                type = 'video';
            }
            else {
                // For URLs without clear extensions, try to guess based on common patterns
                if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be') ||
                    lowerUrl.includes('vimeo.com') || lowerUrl.includes('dailymotion.com')) {
                    type = 'video';
                }
                else {
                    // Default to image if we can't determine
                    type = 'image';
                }
            }
            return { valid: true, type, message: 'URL valid' };
        }
        catch (error) {
            console.error('Error validating URL:', error);
            // Return valid true with default type to prevent crashes
            return { valid: true, type: 'image', message: 'URL format uncertain, treating as image' };
        }
    };
    // Handle URL input
    const handleUrlChange = (e) => {
        try {
            const url = e.target.value;
            // Always update the URL in the state
            setNewMedia(prev => ({ ...prev, url }));
            // Only validate if there's actually a URL entered
            if (url && url.trim() !== '') {
                const validation = validateUrl(url);
                if (validation.valid) {
                    setNewMedia(prev => ({
                        ...prev,
                        url,
                        type: validation.type || 'image'
                    }));
                }
            }
        }
        catch (error) {
            console.error('Error handling URL change:', error);
            // Don't throw error, just update the URL in state
            setNewMedia(prev => ({ ...prev, url: e.target.value }));
        }
    };
    // Trigger file input click
    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };
    // Trigger document file input click
    const triggerDocumentFileInput = () => {
        documentFileInputRef.current?.click();
    };
    // Add media to media list
    const addMedia = async () => {
        try {
            // Validate based on media source type
            if (mediaSourceType === 'file' && !newMedia.file) {
                setError('Please select a file');
                return;
            }
            if (mediaSourceType === 'url' && !newMedia.url) {
                setError('Please enter a URL');
                return;
            }
            if (!newMedia.title) {
                setError('Please enter a title for the media');
                return;
            }
            setError('');
            let fileUrl = '';
            let thumbnailUrl = null;
            let mediaSize = 0;
            if (mediaSourceType === 'file') {
                // Upload file to the server and get the URL
                fileUrl = await uploadFile(newMedia.file);
                mediaSize = newMedia.file.size;
                if (!fileUrl) {
                    setError('Failed to upload file. Please try again.');
                    return;
                }
                // For videos, we may already have a thumbnail in the state
                if (newMedia.type === 'video') {
                    if (newMedia.thumbnailUrl) {
                        // If the thumbnail is a data URL, we need to convert it to a file and upload
                        try {
                            const thumbnailFile = await dataURLtoFile(newMedia.thumbnailUrl, 'thumbnail.jpg');
                            thumbnailUrl = await uploadFile(thumbnailFile);
                        }
                        catch (error) {
                            console.error('Error processing thumbnail:', error);
                            // Fallback to generating a thumbnail
                            try {
                                thumbnailUrl = await generateVideoThumbnail(newMedia.file);
                                if (thumbnailUrl) {
                                    const thumbnailFile = await dataURLtoFile(thumbnailUrl, 'thumbnail.jpg');
                                    thumbnailUrl = await uploadFile(thumbnailFile);
                                }
                            }
                            catch (innerError) {
                                console.error('Error generating thumbnail:', innerError);
                                // If all fails, we can still continue without a thumbnail
                            }
                        }
                    }
                    else {
                        // Generate and upload a thumbnail
                        try {
                            const generatedThumbnail = await generateVideoThumbnail(newMedia.file);
                            if (generatedThumbnail) {
                                const thumbnailFile = await dataURLtoFile(generatedThumbnail, 'thumbnail.jpg');
                                thumbnailUrl = await uploadFile(thumbnailFile);
                            }
                        }
                        catch (error) {
                            console.error('Error generating/uploading thumbnail:', error);
                            // Continue without thumbnail
                        }
                    }
                }
            }
            else {
                // For URL-based media, validate URL
                const urlValidation = validateUrl(newMedia.url);
                if (!urlValidation.valid) {
                    setError('Invalid URL. Please check and try again.');
                    return;
                }
                fileUrl = newMedia.url;
                // For URL-based videos, we don't have a thumbnail
                // Could potentially fetch thumbnail from YouTube/Vimeo API
            }
            const mediaId = `media-${Date.now()}`;
            const mediaToAdd = {
                id: mediaId,
                type: newMedia.type,
                url: fileUrl,
                title: newMedia.title,
                description: newMedia.description || '',
                tag: newMedia.tag,
                cover: newMedia.cover,
                order: formData.media.items.length + 1,
                size: mediaSize,
                isExternalUrl: mediaSourceType === 'url',
                // For videos, add duration and thumbnail
                ...(newMedia.type === 'video' && {
                    duration: newMedia.duration || 0,
                    thumbnailUrl: thumbnailUrl
                })
            };
            setFormData(prev => ({
                ...prev,
                media: {
                    items: [...prev.media.items, mediaToAdd]
                }
            }));
            // Cleanup preview URLs if any
            if (newMedia.previewUrl && newMedia.previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(newMedia.previewUrl);
            }
            // Reset new media form
            setNewMedia({
                file: null,
                type: 'image',
                title: '',
                description: '',
                tag: 'feature',
                cover: false,
                url: '',
                thumbnailUrl: null,
                thumbnailFile: null,
                duration: 0,
                previewUrl: null
            });
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            // Show success feedback
            setFormSuccess('Media added successfully');
            setTimeout(() => setFormSuccess(''), 3000);
        }
        catch (error) {
            console.error('Error adding media:', error);
            setError('Failed to add media. Please try again.');
        }
    };
    // Convert data URL to file for upload
    const dataURLtoFile = async (dataUrl, filename) => {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        return new File([blob], filename, { type: blob.type });
    };
    // Open video in a larger modal/preview
    const openVideoPreview = (url) => {
        setVideoPreviewUrl(url);
    };
    // Close video preview
    const closeVideoPreview = () => {
        setVideoPreviewUrl('');
    };
    // Select media for editing
    const selectMedia = (mediaId) => {
        if (selectedMedia && selectedMedia.id === mediaId) {
            setSelectedMedia(null);
        }
        else {
            const media = formData.media.items.find(item => item.id === mediaId);
            setSelectedMedia(media);
        }
    };
    // Update media tag
    const updateMediaTag = (mediaId, tag) => {
        setFormData(prev => ({
            ...prev,
            media: {
                items: prev.media.items.map(item => item.id === mediaId ? { ...item, tag } : item)
            }
        }));
        // Update selectedMedia if it's the one being updated
        if (selectedMedia && selectedMedia.id === mediaId) {
            setSelectedMedia(prev => ({ ...prev, tag }));
        }
    };
    // Toggle media as cover
    const toggleMediaCover = (mediaId) => {
        setFormData(prev => ({
            ...prev,
            media: {
                items: prev.media.items.map(item => item.id === mediaId
                    ? { ...item, cover: true }
                    : { ...item, cover: false } // Ensure only one cover image
                )
            }
        }));
        // Update selectedMedia if it's the one being updated
        if (selectedMedia && selectedMedia.id === mediaId) {
            setSelectedMedia(prev => ({ ...prev, cover: true }));
        }
    };
    // Add goal to goals list
    const addGoal = () => {
        if (!newGoal.title || !newGoal.description)
            return;
        const goalId = `goal-${Date.now()}`;
        const goalToAdd = {
            id: goalId,
            title: newGoal.title,
            description: newGoal.description,
            completed: newGoal.completed,
            order: formData.goals.items.length + 1
        };
        setFormData(prev => ({
            ...prev,
            goals: {
                items: [...prev.goals.items, goalToAdd]
            }
        }));
        // Reset new goal form
        setNewGoal({ title: '', description: '', completed: false });
    };
    // Add outcome to outcomes list
    const addOutcome = () => {
        if (!newOutcome.title || !newOutcome.description)
            return;
        const outcomeId = `outcome-${Date.now()}`;
        const outcomeToAdd = {
            id: outcomeId,
            title: newOutcome.title,
            description: newOutcome.description,
            status: newOutcome.status,
            order: formData.outcomes.items.length + 1
        };
        setFormData(prev => ({
            ...prev,
            outcomes: {
                items: [...prev.outcomes.items, outcomeToAdd]
            }
        }));
        // Reset new outcome form
        setNewOutcome({ title: '', description: '', status: 'pending' });
    };
    // Add member to members list
    const addMember = () => {
        if (!newMember.team_id || !newMember.role)
            return;
        const memberToAdd = {
            team_id: parseInt(newMember.team_id),
            role: newMember.role
        };
        // Check if user is already a member
        const alreadyMember = formData.members.some(member => member.team_id === memberToAdd.team_id);
        if (alreadyMember) {
            alert('This team member is already a project member');
            return;
        }
        setFormData(prev => ({
            ...prev,
            members: [...prev.members, memberToAdd]
        }));
        // Reset new member form
        setNewMember({ team_id: '', role: 'member' });
    };
    // Add partner to partners list
    const addPartner = () => {
        if (!newPartner.partner_id)
            return;
        const partnerToAdd = {
            partner_id: parseInt(newPartner.partner_id)
        };
        // Check if partner is already added
        const alreadyAdded = formData.partners.some(partner => partner.partner_id === partnerToAdd.partner_id);
        if (alreadyAdded) {
            alert('This partner is already added to the project');
            return;
        }
        setFormData(prev => ({
            ...prev,
            partners: [...prev.partners, partnerToAdd]
        }));
        // Reset new partner form
        setNewPartner({ partner_id: '' });
    };
    // Remove goal from list
    const removeGoal = (goalId) => {
        setFormData(prev => ({
            ...prev,
            goals: {
                items: prev.goals.items.filter(goal => goal.id !== goalId)
            }
        }));
    };
    // Remove outcome from list
    const removeOutcome = (outcomeId) => {
        setFormData(prev => ({
            ...prev,
            outcomes: {
                items: prev.outcomes.items.filter(outcome => outcome.id !== outcomeId)
            }
        }));
    };
    // Remove media from list
    const removeMedia = (mediaId) => {
        // Revoke the object URL to prevent memory leaks
        const mediaToRemove = formData.media.items.find(media => media.id === mediaId);
        if (mediaToRemove) {
            if (mediaToRemove.url && mediaToRemove.url.startsWith('blob:')) {
                URL.revokeObjectURL(mediaToRemove.url);
            }
            if (mediaToRemove.thumbnailUrl && mediaToRemove.thumbnailUrl.startsWith('blob:')) {
                URL.revokeObjectURL(mediaToRemove.thumbnailUrl);
            }
        }
        setFormData(prev => ({
            ...prev,
            media: {
                items: prev.media.items.filter(media => media.id !== mediaId)
            }
        }));
        if (selectedMedia && selectedMedia.id === mediaId) {
            setSelectedMedia(null);
        }
    };
    // Remove member from list
    const removeMember = (teamId) => {
        setFormData(prev => ({
            ...prev,
            members: prev.members.filter(member => member.team_id !== teamId)
        }));
    };
    // Remove partner from list
    const removePartner = (partnerId) => {
        setFormData(prev => ({
            ...prev,
            partners: prev.partners.filter(partner => partner.partner_id !== partnerId)
        }));
    };
    // Media preview component
    const MediaPreview = ({ media }) => {
        if (media.type === 'image') {
            return (<div className="h-20 bg-gray-100 flex items-center justify-center overflow-hidden">
          <img src={media.url} alt={media.title} className="object-cover w-full h-full" onError={(e) => {
                    // Replace with placeholder on error
                    e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                }}/>
        </div>);
        }
        else if (media.type === 'video') {
            return (<div className="h-20 bg-gray-100 flex items-center justify-center relative cursor-pointer" onClick={() => openVideoPreview(media.url)}>
          {/* Video thumbnail or first frame */}
          {media.thumbnailUrl ? (<img src={media.thumbnailUrl} alt={media.title} className="object-cover w-full h-full" onError={(e) => {
                        // Replace with placeholder on error
                        e.target.src = 'https://via.placeholder.com/400x300?text=Video+Preview';
                        e.target.onerror = null; // Prevent infinite error loop
                    }}/>) : (<div className="bg-gray-200 w-full h-full flex items-center justify-center">
              <FileVideo className="w-8 h-8 text-gray-500"/>
            </div>)}
          
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-40 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-white bg-opacity-80 flex items-center justify-center">
              <Play className="w-6 h-6 text-gray-800 ml-1"/>
            </div>
          </div>
        </div>);
        }
        else {
            return (<div className="h-20 bg-gray-100 flex items-center justify-center">
          <FileVideo className="w-10 h-10 text-purple-500"/>
        </div>);
        }
    };
    // Video preview modal
    const VideoPreviewModal = () => {
        if (!videoPreviewUrl)
            return null;
        // Check if URL is external (not blob)
        const isExternalUrl = !videoPreviewUrl.startsWith('blob:');
        const isYouTube = videoPreviewUrl.includes('youtube.com') || videoPreviewUrl.includes('youtu.be');
        const isVimeo = videoPreviewUrl.includes('vimeo.com');
        // Create embed URL from YouTube or Vimeo URL
        let embedUrl = videoPreviewUrl;
        if (isYouTube) {
            // Convert YouTube URL to embed format
            if (videoPreviewUrl.includes('watch?v=')) {
                const videoId = new URL(videoPreviewUrl).searchParams.get('v');
                embedUrl = `https://www.youtube.com/embed/${videoId}`;
            }
            else if (videoPreviewUrl.includes('youtu.be/')) {
                const videoId = videoPreviewUrl.split('youtu.be/')[1].split('?')[0];
                embedUrl = `https://www.youtube.com/embed/${videoId}`;
            }
        }
        else if (isVimeo) {
            // Convert Vimeo URL to embed format
            const vimeoId = videoPreviewUrl.match(/vimeo\.com\/(\d+)/)?.[1];
            if (vimeoId) {
                embedUrl = `https://player.vimeo.com/video/${vimeoId}`;
            }
        }
        return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
        <div className="relative w-full max-w-4xl mx-auto p-4">
          <button onClick={closeVideoPreview} className="absolute top-2 right-2 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70">
            <X className="w-6 h-6"/>
          </button>
          
          <div className="bg-black rounded-lg overflow-hidden">
            {isExternalUrl && (isYouTube || isVimeo) ? (
            // For YouTube or Vimeo URLs, use iframe embed
            <iframe src={embedUrl} className="w-full h-[80vh]" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>) : (
            // For other URLs or blob URLs, use video element
            <video src={videoPreviewUrl} controls autoPlay className="w-full h-auto max-h-[80vh]" onError={(e) => {
                    console.error('Error playing video:', e);
                    // Could show an error message
                }}/>)}
          </div>
        </div>
      </div>);
    };
    // Get team member name
    const getTeamMemberName = (teamId) => {
        const team = filteredTeamMembers.find(member => member.id === teamId);
        if (team) {
            if (team.name) {
                return team.name;
            }
            else if (team.first_name || team.last_name) {
                return `${team.first_name || ''} ${team.last_name || ''}`;
            }
        }
        return `Team Member ${teamId}`;
    };
    const getPartnerName = (partnerId) => {
        const partner = partners.find((p) => p.id === partnerId);
        return partner ? partner.name : `Partner ${partnerId}`;
    };
    // Format file size display
    const formatFileSize = (bytes) => {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    // Navigate to add partner page
    const navigateToAddPartner = () => {
        router.push('/partners/add');
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);
        try {
            // Create a new object with the correct data types for submission
            const submissionData = {
                ...formData,
                category_id: formData.category_id ? parseInt(formData.category_id, 10) : 0,
                members: formData.members.map(member => ({
                    ...(typeof member === 'object' && member !== null ? member : {}),
                    team_id: typeof member.team_id === 'string' ? parseInt(member.team_id, 10) : member.team_id,
                    role: member.role,
                    start_date: formData.start_date
                })),
                // Rest of the data...
            };
            console.log('Submitting project data:', submissionData);
            // Submit to API
            const response = await apiClient.post('/projects', submissionData);
            console.log('Project created successfully:', response.data);
            setSuccess(true);
            // Redirect to project detail or projects list
            setTimeout(() => {
                router.push('/projects');
            }, 2000);
        }
        catch (error) {
            console.error('Error creating project:', error);
            setError(error.response?.data?.message || 'Failed to create project. Please try again.');
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="max-w-7xl mx-auto p-6">
      {/* Video preview modal */}
      {videoPreviewUrl && <VideoPreviewModal />}
      
      {/* Header with back button */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <Link href="/projects" className="mr-4 p-2 bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5"/>
          </Link>
          <h1 className="text-2xl font-bold">Add New Project</h1>
        </div>
        <p className="text-gray-600">Projects/Create Project</p>
      </div>
      
      {/* Success message */}
      {success && (<div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">Project created successfully! Redirecting...</span>
        </div>)}
      
      {/* Form success message */}
      {formSuccess && (<div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          <div className="flex items-center">
            <Check className="w-5 h-5 mr-2"/>
            <span>{formSuccess}</span>
          </div>
        </div>)}
      
      {/* Error message */}
      {error && (<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2"/>
          <span>{error}</span>
        </div>)}
      
      {/* Project form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md">
        {/* Basic project information */}
        <div className="mb-8 p-6">
          <div className="flex">
            {/* Left column - section title */}
            <div className="w-1/4 pr-8">
              <h2 className="text-xl font-bold">Project Details</h2>
              <p className="text-gray-600 text-sm">What is the project all about?</p>
            </div>
            
            {/* Right column - form fields */}
            <div className="w-3/4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Project name */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Project Name<span className="text-red-500">*</span>
                  </label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-md" placeholder="Enter the project name" required/>
                </div>
                
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select name="category_id" value={formData.category_id} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-md appearance-none" required>
                      <option value="">Select a category</option>
                      {Array.isArray(categories) && categories.map(category => (<option key={category.id} value={category.id}>
                          {category.name}
                        </option>))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none"/>
                  </div>
                </div>
                
                {/* Start date */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start Date<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-md" required/>
                  </div>
                </div>
                
                {/* End date */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    End Date
                  </label>
                  <div className="relative">
                    <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-md"/>
                  </div>
                </div>
                
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Status
                  </label>
                  <div className="relative">
                    <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-md appearance-none">
                      <option value="planned">Planned</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="on_hold">On Hold</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none"/>
                  </div>
                </div>
                
                {/* Location */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Location
                  </label>
                  <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-md" placeholder="Enter project location"/>
                </div>
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Project Overview<span className="text-red-500">*</span>
                </label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full p-2.5 border border-gray-300 rounded-md" placeholder="Details go here..." required/>
              </div>
            </div>
          </div>
        </div>
        {/* Horizontal line divider */}
        <hr className="border-t border-gray-200"/>
        
        

        {/* Project goals & outcomes */}
        <div className="mb-8 p-6">
          <div className="flex">
            {/* Left column - section title */}
            <div className="w-1/4 pr-8">
              <h2 className="text-xl font-bold">Goals & Outcomes</h2>
              <p className="text-gray-600 text-sm">What are you trying to achieve?</p>
            </div>
            
            {/* Right column - form fields */}
            <div className="w-3/4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Project goals */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Project goals/objective<span className="text-red-500">*</span>
                  </label>
                  
                  {/* Goals list */}
                  <div className="space-y-3 mb-4">
                    {formData.goals.items.map(goal => (<div key={goal.id} className="p-3 bg-gray-50 rounded-md relative">
                        <button type="button" onClick={() => removeGoal(goal.id)} className="absolute top-2 right-2 text-gray-500 hover:text-red-500">
                          <X className="w-4 h-4"/>
                        </button>
                        <h4 className="font-medium">{goal.title}</h4>
                        <p className="text-sm text-gray-600">{goal.description}</p>
                        <div className="mt-1 text-xs">
                          <span className={`px-2 py-1 rounded-full ${goal.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {goal.completed ? 'Completed' : 'Not completed'}
                          </span>
                        </div>
                      </div>))}
                    
                    {formData.goals.items.length === 0 && (<p className="text-gray-500 text-sm italic">No goals added yet.</p>)}
                  </div>
                  
                  {/* Add goal form */}
                  <div className="border-t pt-3">
                    <h4 className="font-medium text-sm mb-2">Add New Goal</h4>
                    <div className="space-y-3">
                      <div>
                        <input type="text" name="title" value={newGoal.title} onChange={handleGoalChange} placeholder="Goal title" className="w-full p-2.5 border border-gray-300 rounded-md"/>
                      </div>
                      <div>
                        <textarea name="description" value={newGoal.description} onChange={handleGoalChange} placeholder="Goal description" rows={2} className="w-full p-2.5 border border-gray-300 rounded-md"/>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" name="completed" id="goalCompleted" checked={newGoal.completed} onChange={handleGoalChange} className="mr-2"/>
                        <label htmlFor="goalCompleted" className="text-sm">
                          Completed
                        </label>
                      </div>
                      <button type="button" onClick={addGoal} className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-3 rounded-md text-sm flex items-center">
                        <Plus className="w-4 h-4 mr-1"/> Add Goal
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Project outcomes */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Expected outcomes<span className="text-red-500">*</span>
                  </label>
                  
                  {/* Outcomes list */}
                  <div className="space-y-3 mb-4">
                    {formData.outcomes.items.map(outcome => (<div key={outcome.id} className="p-3 bg-gray-50 rounded-md relative">
                        <button type="button" onClick={() => removeOutcome(outcome.id)} className="absolute top-2 right-2 text-gray-500 hover:text-red-500">
                          <X className="w-4 h-4"/>
                        </button>
                        <h4 className="font-medium">{outcome.title}</h4>
                        <p className="text-sm text-gray-600">{outcome.description}</p>
                        <div className="mt-1 text-xs">
                          <span className={`px-2 py-1 rounded-full ${outcome.status === 'achieved' ? 'bg-green-100 text-green-800' :
                outcome.status === 'in-progress' ? 'bg-orange-100 text-orange-800' :
                    'bg-purple-100 text-purple-800'}`}>
                            {outcome.status.charAt(0).toUpperCase() + outcome.status.slice(1)}
                          </span>
                        </div>
                      </div>))}
                    
                    {formData.outcomes.items.length === 0 && (<p className="text-gray-500 text-sm italic">No outcomes added yet.</p>)}
                  </div>
                  
                  {/* Add outcome form */}
                  <div className="border-t pt-3">
                    <h4 className="font-medium text-sm mb-2">Add New Outcome</h4>
                    <div className="space-y-3">
                      <div>
                        <input type="text" name="title" value={newOutcome.title} onChange={handleOutcomeChange} placeholder="Outcome title" className="w-full p-2.5 border border-gray-300 rounded-md"/>
                      </div>
                      <div>
                        <textarea name="description" value={newOutcome.description} onChange={handleOutcomeChange} placeholder="Outcome description" rows={2} className="w-full p-2.5 border border-gray-300 rounded-md"/>
                      </div>
                      <div>
                        <label className="block text-sm mb-1">Status</label>
                        <div className="relative">
                          <select name="status" value={newOutcome.status} onChange={handleOutcomeChange} className="w-full p-2.5 border border-gray-300 rounded-md appearance-none">
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="achieved">Achieved</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none"/>
                        </div>
                      </div>
                      <button type="button" onClick={addOutcome} className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-3 rounded-md text-sm flex items-center">
                        <Plus className="w-4 h-4 mr-1"/> Add Outcome
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Horizontal line divider */}
        <hr className="border-t border-gray-200"/>
       {/* Team members */}
    <div className="mb-8 p-6">
  <div className="flex">
    {/* Left column - section title */}
    <div className="w-1/4 pr-8">
      <h2 className="text-xl font-bold">Team</h2>
      <p className="text-gray-600 text-sm">Who will be working on this project?</p>
    </div>
    
    {/* Right column - form fields */}
    <div className="w-3/4">
      <div className="mb-4 flex justify-between items-center">
        <label className="block text-sm font-medium">
          Team Members<span className="text-red-500">*</span>
        </label>
        <a href="/teams/add-team" className="text-sm flex items-center text-green-700 hover:text-green-800">
          <UserPlus className="w-4 h-4 mr-1"/>
          Add New Team Member
        </a>
      </div>
      
      {/* Members list */}
      {formData.members.length === 0 ? (<p className="text-gray-500 text-sm italic mb-4">No team members added yet.</p>) : (<div className="bg-gray-50 rounded-md mb-4">
          <div className="divide-y divide-gray-200">
            {formData.members.map(member => (<div key={member.team_id} className="grid grid-cols-12 p-3 items-center text-sm hover:bg-green-50">
                <div className="col-span-6">{getTeamMemberName(member.team_id)}</div>
                <div className="col-span-5 text-gray-600">{getRoleNameById(member.role)}</div>
                <div className="col-span-1 flex justify-end">
                  <button type="button" onClick={() => removeMember(member.team_id)} className="text-red-500 hover:text-red-700">
                    <X className="w-4 h-4"/>
                  </button>
                </div>
              </div>))}
          </div>
        </div>)}
      
      {/* Role selection first - Using fixed string enum values instead of IDs */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Role<span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-md appearance-none">
            <option value="">Select a role</option>
            <option value="lead">Lead</option>
            <option value="member">Member</option>
            <option value="supervisor">Supervisor</option>
            <option value="contributor">Contributor</option>
          </select>
          <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none"/>
        </div>
      </div>
      
      {/* Team member selection with Popover */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">
          Add Team Members<span className="text-red-500">*</span>
        </label>
        <Popover open={openTeamPopover} onOpenChange={setOpenTeamPopover}>
          <PopoverTrigger asChild>
            <button type="button" className="w-full flex items-center justify-between p-2.5 border border-gray-300 rounded-md bg-white text-left" disabled={!selectedRole}>
              <span className="text-gray-500">
                {selectedRole ? 'Select team members...' : 'Please select a role first'}
              </span>
              <ChevronDown className="w-5 h-5 text-gray-400"/>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search team members..." value={teamSearchValue} onValueChange={setTeamSearchValue}/>
              <CommandEmpty>No team members found.</CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-[200px]">
                  {filteredTeamMembers.map(member => {
            // Check if this team member is already in the project
            const isAdded = formData.members.some(m => m.team_id === member.id);
            return (<CommandItem key={member.id} value={member.name || member.id.toString()} onSelect={() => {
                    if (!isAdded) {
                        handleTeamMemberSelect(member.id);
                    }
                }} disabled={isAdded} className={isAdded ? 'opacity-50' : ''}>
                        <div className="flex items-center space-x-2">
                          {isAdded ? (<CheckIcon className="h-4 w-4 text-green-600"/>) : (<div className="h-4 w-4"/>)}
                          <span>
                            {member.name || `Team Member ${member.id}`}
                            {member.position && ` - ${member.position}`}
                          </span>
                        </div>
                      </CommandItem>);
        })}
                </ScrollArea>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  </div>
    </div>
        {/* Horizontal line divider */}
        <hr className="border-t border-gray-200"/>

        {/* Partners Section */}
        <div className="mb-8 p-6">
          <div className="flex">
            {/* Left column - section title */}
            <div className="w-1/4 pr-8">
              <h2 className="text-xl font-bold">Partners</h2>
              <p className="text-gray-600 text-sm">Organizations partnering on this project</p>
            </div>
            
            {/* Right column - form fields */}
            <div className="w-3/4">
              <div className="mb-4 flex justify-between items-center">
                <label className="block text-sm font-medium">
                  Project Partners
                </label>
                <a href="/partners" className="text-sm flex items-center text-green-700 hover:text-green-800">
          <UserPlus className="w-4 h-4 mr-1"/>
          Add New Partners
        </a>
              </div>
              
              {/* Partners list */}
              {formData.partners.length === 0 ? (<p className="text-gray-500 text-sm italic mb-4">No partners added yet.</p>) : (<div className="bg-gray-50 rounded-md mb-4">
                  <div className="divide-y divide-gray-200">
                    {formData.partners.map(partner => (<div key={partner.partner_id} className="grid grid-cols-12 p-3 items-center text-sm hover:bg-blue-50">
                        <div className="col-span-11">{getPartnerName(partner.partner_id)}</div>
                        <div className="col-span-1 flex justify-end">
                          <button type="button" onClick={() => removePartner(partner.partner_id)} className="text-red-500 hover:text-red-700">
                            <X className="w-4 h-4"/>
                          </button>
                        </div>
                      </div>))}
                  </div>
                </div>)}
              
              {/* Partner selection with Popover */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">
                  Add Partners
                </label>
                <Popover open={openPartnerPopover} onOpenChange={setOpenPartnerPopover}>
                  <PopoverTrigger asChild>
                    <button type="button" className="w-full flex items-center justify-between p-2.5 border border-gray-300 rounded-md bg-white text-left">
                      <span className="text-gray-500">Select partners...</span>
                      <ChevronDown className="w-5 h-5 text-gray-400"/>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search partners..." value={partnerSearchValue} onValueChange={setPartnerSearchValue}/>
                      <CommandEmpty>
                        <div className="py-6 text-center">
                          <p className="text-sm text-gray-500 mb-2">No partners found</p>
                          <button type="button" onClick={navigateToAddPartner} className="text-sm flex items-center justify-center mx-auto text-green-700 hover:text-green-800">
                            <Plus className="w-4 h-4 mr-1"/>
                            Add New Partner
                          </button>
                        </div>
                      </CommandEmpty>
                      <CommandGroup>
                        <ScrollArea className="h-[200px]">
                          {partners.map(partner => {
            // Check if this partner is already added
            const isAdded = formData.partners.some(p => p.partner_id === partner.id);
            return (<CommandItem key={partner.id} value={partner.name || partner.id.toString()} onSelect={() => {
                    if (!isAdded) {
                        handlePartnerSelect(partner.id);
                    }
                }} disabled={isAdded} className={isAdded ? 'opacity-50' : ''}>
                                <div className="flex items-center space-x-2">
                                  {isAdded ? (<CheckIcon className="h-4 w-4 text-green-600"/>) : (<div className="h-4 w-4"/>)}
                                  <span>{partner.name || `Partner ${partner.id}`}</span>
                                </div>
                              </CommandItem>);
        })}
                        </ScrollArea>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>
        {/* Horizontal line divider */}
        <hr className="border-t border-gray-200"/>

        {/* Files & Media Section */}
        <div className="mb-8 p-6">
          <div className="flex">
            {/* Left column - section title */}
            <div className="w-1/4 pr-8">
              <h2 className="text-xl font-bold">Files & Media</h2>
              <p className="text-gray-600 text-sm">Please attach any relevant files or URLs</p>
            </div>
            
            {/* Right column - form fields */}
            <div className="w-3/4">
              {/* Document upload section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Project Documents</h3>
                
                {/* Documents list */}
                {formData.documents.length === 0 ? (<p className="text-gray-500 text-sm italic mb-4">No documents added yet.</p>) : (<div className="bg-gray-50 rounded-md mb-4 divide-y divide-gray-200">
                    {formData.documents.map((doc, index) => (<div key={index} className="p-3 flex items-center justify-between">
                        <div className="flex items-center">
                          <File className="w-5 h-5 text-blue-500 mr-3"/>
                          <div>
                            <p className="font-medium text-sm">{doc.name}</p>
                            <p className="text-xs text-gray-500">
                              {doc.file_size ? formatFileSize(doc.file_size) : 'Unknown size'}
                            </p>
                          </div>
                        </div>
                        <button type="button" onClick={() => removeDocument(index)} className="text-red-500 hover:text-red-700">
                          <X className="w-4 h-4"/>
                        </button>
                      </div>))}
                  </div>)}
                
                {/* Document upload form */}
                <div className="border border-gray-300 rounded-md p-4">
                  <h4 className="font-medium text-sm mb-3">Add Document</h4>
                  
                  <div className="mb-3">
                    <label className="block text-sm mb-1">Document Name <span className="text-red-500">*</span></label>
                    <input type="text" name="name" value={newDocument.name} onChange={handleDocumentChange} placeholder="Enter document name" className="w-full p-2.5 border border-gray-300 rounded-md"/>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm mb-1">File <span className="text-red-500">*</span></label>
                    <input type="file" ref={documentFileInputRef} onChange={handleDocumentFileChange} className="hidden"/>
                    
                    <div onClick={triggerDocumentFileInput} className="w-full border-2 border-dashed border-gray-300 p-4 rounded-md text-center cursor-pointer hover:bg-gray-50">
                      <FilePlus className="w-8 h-8 mx-auto text-gray-400 mb-2"/>
                      <p className="text-sm text-gray-600">Click to select a file</p>
                      {newDocument.file && (<p className="mt-2 text-xs text-green-600 font-medium">
                          {newDocument.file.name} ({formatFileSize(newDocument.file.size)})
                        </p>)}
                    </div>
                  </div>
                  
                  {isUploading && (<div className="mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 text-center">
                        Uploading: {uploadProgress}%
                      </div>
                    </div>)}
                  
                  <button type="button" onClick={addDocument} disabled={!newDocument.file || !newDocument.name || isUploading} className={`w-full py-2 px-4 rounded-md text-white flex items-center justify-center ${!newDocument.file || !newDocument.name || isUploading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'}`}>
                    {isUploading ? (<>
                        <Loader className="w-4 h-4 mr-2 animate-spin"/>
                        Uploading...
                      </>) : (<>
                        <Plus className="w-4 h-4 mr-2"/>
                        Add Document
                      </>)}
                  </button>
                </div>
              </div>
              
              {/* Media section */}
              <h3 className="text-lg font-semibold mb-4">Media Content</h3>
              
              {/* Media source toggle */}
              <div className="flex mb-4 border border-gray-200 rounded-md overflow-hidden">
                <button type="button" onClick={() => handleMediaSourceChange('file')} className={`flex-1 py-2 px-4 text-center text-sm ${mediaSourceType === 'file' ? 'bg-green-100 text-green-700 font-medium' : 'bg-gray-50 text-gray-500'}`}>
                  <Upload className="w-4 h-4 inline-block mr-1"/>
                  Upload File
                </button>
                <button type="button" onClick={() => handleMediaSourceChange('url')} className={`flex-1 py-2 px-4 text-center text-sm ${mediaSourceType === 'url' ? 'bg-green-100 text-green-700 font-medium' : 'bg-gray-50 text-gray-500'}`}>
                  <LinkIcon className="w-4 h-4 inline-block mr-1"/>
                  External URL
                </button>
              </div>
              
              {/* File upload area */}
              {mediaSourceType === 'file' && (<div className="border-2 border-dashed border-gray-300 p-6 rounded-md text-center mb-6">
                  <label htmlFor="fileUpload" className="cursor-pointer">
                    <div className="flex flex-col items-center justify-center">
                      <Upload className="h-12 w-12 text-gray-400 mb-3"/>
                      <p className="text-gray-700 font-medium mb-1">Drag and drop files here</p>
                      <p className="text-gray-500 text-sm mb-3">or click to browse</p>
                      <p className="text-xs text-gray-400">Supports images (JPG, PNG, GIF) and videos (MP4, WebM)</p>
                    </div>
                  </label>
                  <input type="file" id="fileUpload" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*"/>
                </div>)}
              
              {/* URL input area */}
              {mediaSourceType === 'url' && (<div className="border border-gray-300 p-6 rounded-md mb-6">
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      External Media URL<span className="text-red-500">*</span>
                    </label>
                    <div className="flex">
                      <div className="relative flex-grow">
                        <input type="url" name="url" value={newMedia.url} onChange={handleUrlChange} placeholder="https://example.com/image.jpg" className="w-full p-2.5 border border-gray-300 rounded-md pl-10"/>
                        <LinkIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400"/>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Enter URLs for images (JPG, PNG, GIF) or videos (MP4, YouTube, Vimeo links)
                    </p>
                  </div>
                  
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center">
                      <input type="radio" id="mediaTypeImage" name="type" value="image" checked={newMedia.type === 'image'} onChange={() => setNewMedia(prev => ({ ...prev, type: 'image' }))} className="mr-2"/>
                      <label htmlFor="mediaTypeImage" className="flex items-center">
                        <Image className="w-4 h-4 mr-1"/> Image
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input type="radio" id="mediaTypeVideo" name="type" value="video" checked={newMedia.type === 'video'} onChange={() => setNewMedia(prev => ({ ...prev, type: 'video' }))} className="mr-2"/>
                      <label htmlFor="mediaTypeVideo" className="flex items-center">
                        <FileVideo className="w-4 h-4 mr-1"/> Video
                      </label>
                    </div>
                  </div>
                </div>)}
              
              {/* File/URL preview */}
              {(mediaSourceType === 'file' && newMedia.file) || (mediaSourceType === 'url' && newMedia.url) ? (<div className="p-4 bg-gray-50 rounded-md mb-6">
                  <div className="flex items-center mb-3">
                    {newMedia.type === 'image' ? (<Image className="w-6 h-6 mr-2 text-blue-500"/>) : (<FileVideo className="w-6 h-6 mr-2 text-purple-500"/>)}
                    <span className="text-sm font-medium">
                      {mediaSourceType === 'file'
                ? newMedia.file.name
                : newMedia.url.length > 50
                    ? newMedia.url.substring(0, 47) + '...'
                    : newMedia.url}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-4">
                    Type: {newMedia.type.charAt(0).toUpperCase() + newMedia.type.slice(1)}
                    {mediaSourceType === 'file' && ` | Size: ${formatFileSize(newMedia.file.size)}`}
                    {mediaSourceType === 'url' && ` | External URL`}
                  </div>
                  
                  {/* Video preview for local videos */}
                  {mediaSourceType === 'file' && newMedia.type === 'video' && newMedia.previewUrl && (<div className="mb-4 border rounded overflow-hidden">
                      <video src={newMedia.previewUrl} controls className="w-full h-auto max-h-40"/>
                    </div>)}
                  
                  {/* Image preview for local images */}
                  {mediaSourceType === 'file' && newMedia.type === 'image' && newMedia.file && (<div className="mb-4 border rounded overflow-hidden">
                      <img src={URL.createObjectURL(newMedia.file)} alt="Preview" className="w-full h-auto max-h-40 object-contain" onLoad={(e) => URL.revokeObjectURL(e.target.src)} // Clean up object URL after loading
            />
                    </div>)}
                  
                  {/* URL preview placeholders */}
                  {mediaSourceType === 'url' && newMedia.url && (<div className="mb-4 border rounded overflow-hidden bg-gray-100 p-2 flex items-center justify-center">
                      {newMedia.type === 'image' ? (<div className="text-center p-4">
                         <Image className="w-8 h-8 mx-auto text-gray-400"/>
                          <p className="text-sm text-gray-500 mt-2">Image will be loaded from URL</p>
                        </div>) : (<div className="text-center p-4">
                          <FileVideo className="w-8 h-8 mx-auto text-gray-400"/>
                          <p className="text-sm text-gray-500 mt-2">Video will be loaded from URL</p>
                        </div>)}
                    </div>)}
                  
                  {isUploading && (<div className="mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 text-center">
                        Uploading: {uploadProgress}%
                      </div>
                    </div>)}
                  
                  {/* Media details form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-1">Title <span className="text-red-500">*</span></label>
                      <input type="text" name="title" value={newMedia.title} onChange={handleMediaChange} placeholder="Media title" className="w-full p-2.5 border border-gray-300 rounded-md"/>
                    </div>
                    
                    <div>
                      <label className="block text-sm mb-1">Tag</label>
                      <div className="relative">
                        <select name="tag" value={newMedia.tag} onChange={handleMediaChange} className="w-full p-2.5 border border-gray-300 rounded-md appearance-none">
                          <option value="feature">Feature</option>
                          <option value="description">Description</option>
                          <option value="others">Others</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none"/>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <input type="checkbox" name="cover" id="mediaCover" checked={newMedia.cover} onChange={handleMediaChange} className="mr-2" disabled={newMedia.type === 'video'} // Only images can be cover
        />
                      <label htmlFor="mediaCover" className={`text-sm ${newMedia.type === 'video' ? 'text-gray-400' : ''}`}>
                        Use as cover image
                        {newMedia.type === 'video' && " (only available for images)"}
                      </label>
                    </div>
                    
                    <div className="flex justify-end">
                      <button type="button" onClick={addMedia} disabled={isUploading} className="bg-green-700 hover:bg-green-800 text-white py-2 px-4 rounded-md text-sm flex items-center">
                        {isUploading ? (<>
                            <Loader className="w-4 h-4 mr-2 animate-spin"/>
                            Uploading...
                          </>) : (<>
                            <Plus className="w-4 h-4 mr-1"/> 
                            {mediaSourceType === 'url' ? 'Add External Media' : 'Add Media'}
                          </>)}
                      </button>
                    </div>
                  </div>
                </div>) : null}
              
              {/* Display media list */}
              <h3 className="text-lg font-semibold mb-4">Project Media</h3>
              
              {formData.media.items.length === 0 ? (<p className="text-gray-500 text-sm italic mb-4">No media added yet.</p>) : (<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {formData.media.items.map(media => (<div key={media.id} className={`border rounded-md overflow-hidden ${selectedMedia && selectedMedia.id === media.id ? 'ring-2 ring-green-500' : ''}`}>
                      {/* Media preview */}
                      <div className="cursor-pointer" onClick={() => media.type === 'video' ? openVideoPreview(media.url) : selectMedia(media.id)}>
                        <MediaPreview media={media}/>
                      </div>
                      
                      {/* Media info */}
                      <div className="p-3">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-medium text-sm truncate">{media.title}</h4>
                          <button type="button" onClick={() => removeMedia(media.id)} className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0">
                            <X className="w-4 h-4"/>
                          </button>
                        </div>
                        
                        {media.description && (<p className="text-xs text-gray-600 mb-2 line-clamp-2">{media.description}</p>)}
                        
                        <div className="flex flex-wrap gap-1 text-xs">
                          <span className="px-2 py-1 bg-gray-100 rounded-full">
                            {media.type}
                          </span>
                          {media.isExternalUrl ? (<span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                              External URL
                            </span>) : (<span className="px-2 py-1 bg-gray-100 rounded-full">
                              {formatFileSize(media.size)}
                            </span>)}
                          <span className={`px-2 py-1 rounded-full ${media.tag === 'feature' ? 'bg-blue-100 text-blue-800' :
                    media.tag === 'description' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'}`}>
                            {media.tag}
                          </span>
                          {media.cover && (<span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                              Cover
                            </span>)}
                        </div>
                      </div>
                      
                      {/* Tag selection - show when media is selected */}
                      {selectedMedia && selectedMedia.id === media.id && media.type !== 'video' && (<div className="p-3 border-t">
                          <div className="mb-2">
                            <label className="text-xs font-semibold mb-1 block">Change Display Tag:</label>
                            <div className="flex flex-wrap gap-2">
                              <button type="button" onClick={() => updateMediaTag(media.id, 'feature')} className={`px-2 py-1 text-xs rounded-full ${media.tag === 'feature' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'}`}>
                                Feature
                              </button>
                              <button type="button" onClick={() => updateMediaTag(media.id, 'description')} className={`px-2 py-1 text-xs rounded-full ${media.tag === 'description' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-800'}`}>
                                Description
                              </button>
                              <button type="button" onClick={() => updateMediaTag(media.id, 'others')} className={`px-2 py-1 text-xs rounded-full ${media.tag === 'others' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'}`}>
                                Others
                              </button>
                            </div>
                          </div>
                          
                          {!media.cover && media.type === 'image' && (<button type="button" onClick={() => toggleMediaCover(media.id)} className="text-xs bg-green-700 hover:bg-green-800 text-white px-2 py-1 rounded-md flex items-center">
                              <Check className="w-3 h-3 mr-1"/> Set as Cover Image
                            </button>)}
                        </div>)}
                    </div>))}
                </div>)}
            </div>
          </div>
        </div>

        {/* Form buttons */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button type="button" className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50" onClick={() => router.push('/projects')}>
            Cancel
          </button>
          <button type="submit" className="px-6 py-2 bg-green-700 rounded-md text-white hover:bg-green-800 flex items-center" disabled={loading}>
            {loading ? (<>
                <Loader className="w-4 h-4 mr-2 animate-spin"/>
                Submitting...
              </>) : 'Submit'}
          </button>
        </div>
      </form>
    </div>);
};
export default AddProjectPage;
