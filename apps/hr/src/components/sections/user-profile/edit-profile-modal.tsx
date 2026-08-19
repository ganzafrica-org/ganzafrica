"use client";

import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ReusableSheet } from "@/components/sections/sheets/sheet-component";
import { useUpdateMyProfile } from "@/hooks/useEmployees";
import { getInitials } from "@/lib/helpers/employee-util";
import type { Employee, UpdateMyProfileRequest } from "@/types/api";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
}

function toFormState(employee: Employee): UpdateMyProfileRequest {
  return {
    phone: employee.phone ?? "",
    picture: employee.picture ?? "",
    personal_email: employee.personal_email ?? "",
    home_city: employee.home_city ?? "",
    home_country: employee.home_country ?? "",
    citizenship: employee.citizenship ?? "",
  };
}

/**
 * Self-service edit — SELF_EDITABLE_FIELDS only (employees-core.service.ts). HR-owned fields
 * (title, department, status, hired date, …) are read-only here; changing those goes through HR.
 */
export default function EditProfileModal({ isOpen, onClose, employee }: EditProfileModalProps) {
  const updateMyProfile = useUpdateMyProfile();
  const [form, setForm] = useState<UpdateMyProfileRequest>(toFormState(employee));
  const [error, setError] = useState<string | null>(null);
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setForm(toFormState(employee));
      setError(null);
      setPictureFile(null);
      setPicturePreview(null);
    }
  }, [isOpen, employee]);

  useEffect(() => {
    return () => {
      if (picturePreview) URL.revokeObjectURL(picturePreview);
    };
  }, [picturePreview]);

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (picturePreview) URL.revokeObjectURL(picturePreview);
    setPictureFile(file);
    setPicturePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setError(null);
    try {
      await updateMyProfile.mutateAsync({ payload: form, pictureFile: pictureFile ?? undefined });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to save your profile.");
    }
  };

  const currentPictureUrl = picturePreview ?? employee.picture ?? undefined;

  return (
    <ReusableSheet
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Edit Profile"
      description="Contact HR to change your name, title, department, or work email."
      footer={
        <div className="flex w-full gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1 bg-brand-accent hover:bg-brand-accent/90 text-white"
            onClick={handleSave}
            disabled={updateMyProfile.isPending}
          >
            {updateMyProfile.isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      }
    >
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Label>Profile Picture</Label>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={currentPictureUrl} />
              <AvatarFallback className="bg-brand-accent/10 text-brand-accent font-bold">
                {getInitials(employee.first_name, employee.last_name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                {pictureFile ? "Choose a different photo" : "Upload photo"}
              </Button>
              {pictureFile && (
                <p className="text-xs text-muted-foreground truncate max-w-[220px]">
                  {pictureFile.name}
                </p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePictureChange}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Phone</Label>
          <Input
            value={form.phone ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="Phone number"
          />
        </div>

        <div className="space-y-2">
          <Label>Personal Email</Label>
          <Input
            type="email"
            value={form.personal_email ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, personal_email: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Citizenship</Label>
          <Input
            value={form.citizenship ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, citizenship: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Home City</Label>
            <Input
              value={form.home_city ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, home_city: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Home Country</Label>
            <Input
              value={form.home_country ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, home_country: e.target.value }))}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </ReusableSheet>
  );
}
