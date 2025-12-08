"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Briefcase,
  Phone,
  Linkedin,
  Twitter,
  Github,
  Globe,
  GraduationCap,
  Save,
  X,
  Plus,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { alumniApi, AlumniProfile } from "@/lib/api/alumni";

const industries = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Environmental",
  "Research",
  "Entertainment",
  "FinTech",
  "Agriculture",
  "Consulting",
  "Non-profit",
  "Government",
  "Other",
];

const countries = [
  "Rwanda",
  "Kenya",
  "Uganda",
  "Tanzania",
  "Ethiopia",
  "Nigeria",
  "South Africa",
  "Ghana",
  "United States",
  "United Kingdom",
  "Germany",
  "France",
  "Canada",
  "Other",
];

const currentYear = new Date().getFullYear();
const graduationYears = Array.from({ length: 10 }, (_, i) => currentYear - i);

// Profile Form Skeleton
const ProfileSkeleton = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </CardHeader>
    </Card>
    {[...Array(3)].map((_, i) => (
      <Card key={i}>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<AlumniProfile | null>(null);
  const [skillInput, setSkillInput] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    country: "",
    industry: "",
    bio: "",
    graduationYear: "",
    fellowRole: "",
    skills: [] as string[],
    phone: "",
    linkedin: "",
    twitter: "",
    github: "",
    website: "",
  });

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await alumniApi.getProfile();
        setProfile(response.profile);

        // Populate form with existing data
        if (response.profile) {
          setFormData({
            title: response.profile.title || "",
            company: response.profile.company || "",
            location: response.profile.location || "",
            country: response.profile.country || "",
            industry: response.profile.industry || "",
            bio: response.profile.bio || "",
            graduationYear: response.profile.graduationYear?.toString() || "",
            fellowRole: response.profile.fellowRole || "",
            skills: response.profile.skills || [],
            phone: response.profile.phone || "",
            linkedin: response.profile.linkedin || "",
            twitter: response.profile.twitter || "",
            github: response.profile.github || "",
            website: response.profile.website || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      await alumniApi.updateProfile({
        ...formData,
        graduationYear: formData.graduationYear
          ? parseInt(formData.graduationYear, 10)
          : null,
      });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600">
              Manage your alumni profile information
            </p>
          </div>
          <ProfileSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">
            Manage your alumni profile information
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Header Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  {profile?.avatar ? (
                    <AvatarImage src={profile.avatar} alt={profile.name} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-green-primary to-green-secondary text-white text-xl">
                      {profile?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "?"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {profile?.name || "Your Name"}
                  </h2>
                  <p className="text-gray-600">{profile?.email}</p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Current Role Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Briefcase className="h-5 w-5 text-green-primary" />
                Current Role
              </CardTitle>
              <CardDescription>
                What are you doing now? This will be displayed in the alumni
                directory.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g., Software Engineer"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company/Organization *</Label>
                  <Input
                    id="company"
                    name="company"
                    placeholder="e.g., Google"
                    value={formData.company}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <Select
                    value={formData.industry}
                    onValueChange={(v) => handleSelectChange("industry", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">City/Location *</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="e.g., Kigali, Rwanda"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Select
                  value={formData.country}
                  onValueChange={(v) => handleSelectChange("country", v)}
                >
                  <SelectTrigger className="md:w-1/2">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell others about yourself and what you're working on..."
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Fellowship Info Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <GraduationCap className="h-5 w-5 text-blue-secondary" />
                Fellowship Information
              </CardTitle>
              <CardDescription>
                Details about your GanzAfrica fellowship experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="graduationYear">Graduation Year *</Label>
                  <Select
                    value={formData.graduationYear}
                    onValueChange={(v) =>
                      handleSelectChange("graduationYear", v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {graduationYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fellowRole">Role During Fellowship</Label>
                  <Input
                    id="fellowRole"
                    name="fellowRole"
                    placeholder="e.g., Data Analyst, Software Engineer"
                    value={formData.fellowRole}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <Label>Skills</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addSkill}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact & Social Links Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="h-5 w-5 text-purple-500" />
                Contact & Social Links
              </CardTitle>
              <CardDescription>
                Help other alumni connect with you. Phone number is used for
                WhatsApp.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone (WhatsApp)
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="+250788123456"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn Username
                  </Label>
                  <Input
                    id="linkedin"
                    name="linkedin"
                    placeholder="johndoe"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="twitter" className="flex items-center gap-2">
                    <Twitter className="h-4 w-4" />
                    Twitter/X Username
                  </Label>
                  <Input
                    id="twitter"
                    name="twitter"
                    placeholder="johndoe"
                    value={formData.twitter}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github" className="flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    GitHub Username
                  </Label>
                  <Input
                    id="github"
                    name="github"
                    placeholder="johndoe"
                    value={formData.github}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Personal Website
                </Label>
                <Input
                  id="website"
                  name="website"
                  placeholder="https://yourwebsite.com"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="md:w-1/2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-green-primary hover:bg-green-600"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
