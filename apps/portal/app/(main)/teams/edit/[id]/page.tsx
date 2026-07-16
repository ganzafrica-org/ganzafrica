"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  AlertCircle,
  Loader,
  ChevronDown,
  Save,
  Check,
  Mail,
  Globe,
  User,
  Briefcase,
  Tag,
  Image,
  LinkIcon,
} from "lucide-react";
import Link from "next/link";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

interface TeamType {
  id: number;
  name: string;
}
interface TeamFormData {
  name: string;
  position: string;
  photo_url: string;
  bio: string;
  email: string;
  profile_link: string;
  skills: string[];
  team_type_id: string;
}

const EditTeamPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const teamId = params?.id;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [teamTypes, setTeamTypes] = useState<TeamType[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [usePhotoUrl, setUsePhotoUrl] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [originalTeamData, setOriginalTeamData] = useState(null);

  // Form state
  const [formData, setFormData] = useState<TeamFormData>({
    name: "",
    position: "",
    photo_url: "",
    bio: "",
    email: "",
    profile_link: "",
    skills: [],
    team_type_id: "",
  });

  // Temporary state for skills input
  const [newSkill, setNewSkill] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [initialPhotoUrl, setInitialPhotoUrl] = useState("");

  // Clean up blob URLs when component unmounts
  useEffect(() => {
    return () => {
      // Revoke any photo preview URL
      if (
        formData.photo_url &&
        formData.photo_url.startsWith("blob:") &&
        formData.photo_url !== initialPhotoUrl
      ) {
        URL.revokeObjectURL(formData.photo_url);
      }
    };
  }, [formData.photo_url, initialPhotoUrl]);

  // Fetch team data on component mount
  useEffect(() => {
    const fetchTeamData = async () => {
      if (!teamId) {
        setError("Team ID is missing.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await apiClient.get(`/teams/${teamId}`);

        if (response.data && response.data.team) {
          const team = response.data.team;

          // Store the complete original team data
          setOriginalTeamData(team);

          // Determine if this is a URL or file upload
          if (team.photo_url && team.photo_url.startsWith("http")) {
            setUsePhotoUrl(true);
          }

          setInitialPhotoUrl(team.photo_url || "");

          // Map skills array if it comes as a string
          let skillsArray = [];
          if (team.skills) {
            if (typeof team.skills === "string") {
              try {
                // Try to parse JSON string
                skillsArray = JSON.parse(team.skills);
              } catch (e) {
                // If not valid JSON, split by comma
                skillsArray = team.skills.split(",").map((s: string) => s.trim());
              }
            } else if (Array.isArray(team.skills)) {
              skillsArray = team.skills;
            }
          }

          setFormData({
            name: team.name || "",
            position: team.position || "",
            photo_url: team.photo_url || "",
            bio: team.bio || "",
            email: team.email || "",
            profile_link: team.profile_link || "",
            skills: skillsArray,
            team_type_id: team.team_type_id?.toString() || team.team_type?.id?.toString() || "",
          });
        } else {
          setError("Team data not found.");
        }
      } catch (error) {
        console.error("Error fetching team data:", error);
        setError("Failed to load team data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamData();
  }, [teamId]);

  // Fetch team types on component mount
  useEffect(() => {
    const fetchTeamTypes = async () => {
      try {
        const response = await apiClient.get("/team-types");

        // Check the structure of the response and extract team types array
        if (response.data && response.data.teamTypes && Array.isArray(response.data.teamTypes)) {
          setTeamTypes(response.data.teamTypes);
        } else if (response.data && Array.isArray(response.data.types)) {
          setTeamTypes(response.data.types);
        } else if (Array.isArray(response.data)) {
          setTeamTypes(response.data);
        } else {
          console.error("Unexpected team types response format:", response.data);
          // Set default team types if response format is not as expected
          setTeamTypes([
            { id: 1, name: "Leadership" },
            { id: 2, name: "Technical" },
            { id: 3, name: "Support" },
          ]);
        }
      } catch (error) {
        console.error("Error fetching team types:", error);
        // Set default team types if API fails
        setTeamTypes([
          { id: 1, name: "Leadership" },
          { id: 2, name: "Technical" },
          { id: 3, name: "Support" },
        ]);
      }
    };

    fetchTeamTypes();
  }, []);

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Revoke previous blob URL if exists
      if (
        formData.photo_url &&
        formData.photo_url.startsWith("blob:") &&
        formData.photo_url !== initialPhotoUrl
      ) {
        URL.revokeObjectURL(formData.photo_url);
      }

      setPhotoFile(file);
      // Create a local preview URL
      const localUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        photo_url: localUrl,
      }));
      setUsePhotoUrl(false);
    }
  };

  // Handle photo URL input
  const handlePhotoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData((prev) => ({
      ...prev,
      photo_url: url,
    }));
  };

  // Toggle between file upload and URL input
  const togglePhotoUrlMode = () => {
    if (usePhotoUrl) {
      // Switching to file upload mode
      setUsePhotoUrl(false);
      if (!photoFile) {
        setFormData((prev) => ({
          ...prev,
          photo_url: "",
        }));
      }
    } else {
      // Switching to URL mode
      setUsePhotoUrl(true);
      if (
        formData.photo_url &&
        formData.photo_url.startsWith("blob:") &&
        formData.photo_url !== initialPhotoUrl
      ) {
        URL.revokeObjectURL(formData.photo_url);
        setFormData((prev) => ({
          ...prev,
          photo_url: "",
        }));
        setPhotoFile(null);
      }
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Add skill to skills list
  const addSkill = () => {
    if (!newSkill.trim()) return;

    if (!formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
    }

    setNewSkill("");
  };

  // Handle new skill key press (add on Enter)
  const handleSkillKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  // Remove skill from list
  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  // Upload file to backend and return a persistent URL
  const uploadFileToServer = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post("/uploads/file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) return;
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      if (response.data && response.data.success && response.data.file?.url) {
        setIsUploading(false);
        setUploadProgress(100);
        return response.data.file.url;
      }

      throw new Error("Upload failed");
    } catch (error) {
      console.error("Error uploading file:", error);
      setIsUploading(false);
      toast.error("Failed to upload image. Please try again.");
      return null;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    // Validate form data
    if (!formData.name || !formData.position || !formData.email || !formData.team_type_id) {
      setError("Please fill in all required fields (Name, Position, Email, and Team Type)");
      setLoading(false);
      return;
    }

    try {
      // Process the photo file if it exists and we're in file upload mode
      let finalPhotoUrl = formData.photo_url;

      if (photoFile && !usePhotoUrl) {
        // Upload the photo file and get a URL back
        finalPhotoUrl = await uploadFileToServer(photoFile);

        if (!finalPhotoUrl) {
          setError("Failed to process the photo. Please try again.");
          setLoading(false);
          return;
        }
      }

      // Build update payload matching backend validation
      const teamData: {
        name: string;
        position: string;
        email: string;
        bio: string | null;
        profile_link: string | null;
        skills: string[];
        team_type_id: number;
        photo_url?: string;
      } = {
        name: formData.name,
        position: formData.position,
        email: formData.email,
        bio: formData.bio || null,
        profile_link: formData.profile_link || null,
        skills: Array.isArray(formData.skills) ? formData.skills : [],
        team_type_id: parseInt(formData.team_type_id),
      };
      // Only include photo_url if we have a valid string (backend validates URL)
      if (finalPhotoUrl || (usePhotoUrl && formData.photo_url)) {
        teamData.photo_url = finalPhotoUrl || formData.photo_url;
      }

      console.log("Updating team data:", teamData);

      // Use apiClient to update the team member
      const response = await apiClient.put(`/teams/${teamId}`, teamData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Team updated:", response.data);
      setSuccess(true);
      toast.success("Team member updated successfully");

      // Navigate back to teams list after a brief delay
      setTimeout(() => {
        router.push("/teams");
      }, 2000);
    } catch (error: any) {
      console.error("Error updating team member:", error);

      // Check if error is related to data size
      if (
        error.response?.data?.message?.includes("too long") ||
        error.message?.includes("too long") ||
        error.response?.status === 413
      ) {
        setError(
          "The image file is too large. Please use a smaller image or compress the current one.",
        );
      } else {
        setError(
          error.response?.data?.message || "Failed to update team member. Please try again.",
        );
      }
      toast.error("Failed to update team member");
    } finally {
      setLoading(false);
    }
  };

  // Format file size display
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
        <p className="ml-2 text-gray-600">Loading team data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header with back button */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <Link href="/teams" className="mr-4 p-2 bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Edit Team Member</h1>
        </div>
        <p className="text-gray-600">Teams/Edit Team Member</p>
      </div>

      {/* Success message */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          <div className="flex items-center">
            <Check className="w-5 h-5 mr-2" />
            <span>Team member updated successfully! Redirecting...</span>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {/* Team form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md">
        {/* Basic information */}
        <div className="mb-8 p-6">
          <div className="flex flex-col md:flex-row">
            {/* Left column - section title */}
            <div className="w-full md:w-1/4 pr-0 md:pr-8 mb-4 md:mb-0">
              <h2 className="text-xl font-bold">Basic Information</h2>
              <p className="text-gray-600 text-sm">Personal and contact details</p>
            </div>

            {/* Right column - form fields */}
            <div className="w-full md:w-3/4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Full Name<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 p-2.5 border border-gray-300 rounded-md"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Position<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Briefcase className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      className="w-full pl-10 p-2.5 border border-gray-300 rounded-md"
                      placeholder="Enter position or role"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Mail className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 p-2.5 border border-gray-300 rounded-md"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>

                {/* Team Type */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Team Type<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Tag className="w-5 h-5 text-gray-400" />
                    </div>
                    <select
                      name="team_type_id"
                      value={formData.team_type_id}
                      onChange={handleChange}
                      className="w-full pl-10 p-2.5 border border-gray-300 rounded-md appearance-none"
                      required
                    >
                      <option value="">Select a team type</option>
                      {teamTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Profile Link */}
                <div>
                  <label className="block text-sm font-medium mb-1">Profile Link</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Globe className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      name="profile_link"
                      value={formData.profile_link}
                      onChange={handleChange}
                      className="w-full pl-10 p-2.5 border border-gray-300 rounded-md"
                      placeholder="LinkedIn or other profile URL"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal line divider */}
        <hr className="border-t border-gray-200" />

        {/* Bio Section */}
        <div className="mb-8 p-6">
          <div className="flex flex-col md:flex-row">
            {/* Left column - section title */}
            <div className="w-full md:w-1/4 pr-0 md:pr-8 mb-4 md:mb-0">
              <h2 className="text-xl font-bold">Biography</h2>
              <p className="text-gray-600 text-sm">Professional background and experience</p>
            </div>

            {/* Right column - form fields */}
            <div className="w-full md:w-3/4">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={5}
                  className="w-full p-2.5 border border-gray-300 rounded-md"
                  placeholder="Enter professional background, experience, and achievements..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal line divider */}
        <hr className="border-t border-gray-200" />

        {/* Skills Section */}
        <div className="mb-8 p-6">
          <div className="flex flex-col md:flex-row">
            {/* Left column - section title */}
            <div className="w-full md:w-1/4 pr-0 md:pr-8 mb-4 md:mb-0">
              <h2 className="text-xl font-bold">Skills</h2>
              <p className="text-gray-600 text-sm">Areas of expertise and competencies</p>
            </div>

            {/* Right column - form fields */}
            <div className="w-full md:w-3/4">
              {/* Skills list */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Skills & Expertise</label>

                {formData.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.skills.map((skill, index) => (
                      <div
                        key={index}
                        className="bg-gray-100 rounded-full px-3 py-1 text-sm flex items-center"
                      >
                        <span className="mr-1">{skill}</span>
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm italic mb-4">No skills added yet.</p>
                )}

                {/* Add skill form */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={handleSkillKeyPress}
                    placeholder="Add a skill"
                    className="w-full p-2.5 border border-gray-300 rounded-md"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal line divider */}
        <hr className="border-t border-gray-200" />

        {/* Photo Upload Section */}
        <div className="mb-8 p-6">
          <div className="flex flex-col md:flex-row">
            {/* Left column - section title */}
            <div className="w-full md:w-1/4 pr-0 md:pr-8 mb-4 md:mb-0">
              <h2 className="text-xl font-bold">Profile Photo</h2>
              <p className="text-gray-600 text-sm">Upload a professional photo</p>
            </div>

            {/* Right column - form fields */}
            <div className="w-full md:w-3/4">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium">Photo</label>

                  {/* Toggle between URL and file upload */}
                  <div className="flex items-center mb-2">
                    <button
                      type="button"
                      onClick={togglePhotoUrlMode}
                      className={`text-sm py-1 px-3 rounded-md ${
                        usePhotoUrl ? "bg-green-700 text-white" : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      Use URL
                    </button>
                    <span className="mx-2 text-gray-400">|</span>
                    <button
                      type="button"
                      onClick={togglePhotoUrlMode}
                      className={`text-sm py-1 px-3 rounded-md ${
                        !usePhotoUrl ? "bg-green-700 text-white" : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      Upload File
                    </button>
                  </div>
                </div>

                {usePhotoUrl ? (
                  // URL input option
                  <div className="mb-6">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <LinkIcon className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="url"
                        value={formData.photo_url}
                        onChange={handlePhotoUrlChange}
                        className="w-full pl-10 p-2.5 border border-gray-300 rounded-md"
                        placeholder="Enter image URL (https://...)"
                      />
                    </div>

                    {/* URL preview */}
                    {formData.photo_url && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-md">
                        <div className="flex items-center mb-3">
                          <Image className="w-6 h-6 mr-2 text-blue-500" />
                          <span className="text-sm font-medium">Image from URL</span>
                        </div>
                        <div className="mb-4 border rounded overflow-hidden">
                          <img
                            src={formData.photo_url}
                            alt="Profile preview"
                            className="w-full h-auto max-h-60 object-contain"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.onerror = null;
                              img.src = "/api/placeholder/400/400";
                              img.alt = "Failed to load image";
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, photo_url: "" }))}
                          className="text-sm text-red-500 hover:text-red-700 flex items-center"
                        >
                          <X className="w-4 h-4 mr-1" /> Clear URL
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  // File upload option
                  <>
                    {/* Upload area */}
                    <div className="border-2 border-dashed border-gray-300 p-6 rounded-md text-center mb-6">
                      <label onClick={triggerFileInput} className="cursor-pointer">
                        <div className="flex flex-col items-center justify-center">
                          <Upload className="h-12 w-12 text-gray-400 mb-3" />
                          <p className="text-gray-700 font-medium mb-1">
                            Drag and drop an image here
                          </p>
                          <p className="text-gray-500 text-sm mb-3">or click to browse</p>
                          <p className="text-xs text-gray-400">Supports JPG, PNG, GIF (max 5MB)</p>
                        </div>
                      </label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                      />
                    </div>
                  </>
                )}

                {/* Photo preview (for file upload) */}
                {!usePhotoUrl && formData.photo_url && (
                  <div className="p-4 bg-gray-50 rounded-md mb-6">
                    <div className="flex items-center mb-3">
                      <Image className="w-6 h-6 mr-2 text-blue-500" />
                      <span className="text-sm font-medium">
                        {photoFile ? photoFile.name : "Profile photo"}
                      </span>
                    </div>

                    {photoFile && (
                      <div className="text-xs text-gray-500 mb-4">
                        Type: {photoFile.type?.split("/")[1]?.toUpperCase() || "N/A"} | Size:{" "}
                        {formatFileSize(photoFile.size)}
                      </div>
                    )}

                    {/* Image preview */}
                    <div className="mb-4 border rounded overflow-hidden">
                      <img
                        src={formData.photo_url}
                        alt="Profile preview"
                        className="w-full h-auto max-h-60 object-contain"
                      />
                    </div>

                    {isUploading && (
                      <div className="mb-4">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-green-600 h-2.5 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 text-center">
                          Uploading: {uploadProgress}%
                        </div>
                      </div>
                    )}

                    <div className="mt-2 flex justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, photo_url: "" }));
                          setPhotoFile(null);
                        }}
                        className="text-sm text-red-500 hover:text-red-700 flex items-center"
                      >
                        <X className="w-4 h-4 mr-1" /> Remove Image
                      </button>

                      <button
                        type="button"
                        onClick={triggerFileInput}
                        className="text-sm text-blue-500 hover:text-blue-700 flex items-center"
                      >
                        <Upload className="w-4 h-4 mr-1" /> Change Image
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form buttons */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            onClick={() => router.push("/teams")}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-green-700 rounded-md text-white hover:bg-green-800 flex items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Update Team Member
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTeamPage;
