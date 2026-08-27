"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/lib/toast";
import { recruitmentService } from "@/services/recruitment.service";
import { FormBuilder } from "@/components/recruitment/form-builder";
import type { FormDefinition } from "@/lib/recruitment/form-types";

const STANDARD_FIELDS: FormDefinition["standard"] = [
  {
    key: "first_name",
    label: "First name",
    type: "text",
    required: true,
    order: 1,
    section: "About you",
  },
  {
    key: "last_name",
    label: "Last name",
    type: "text",
    required: true,
    order: 2,
    section: "About you",
  },
  { key: "email", label: "Email", type: "text", required: true, order: 3, section: "About you" },
  {
    key: "date_of_birth",
    label: "Date of birth",
    type: "date",
    required: true,
    order: 4,
    section: "About you",
  },
];

type Step = 1 | 2 | 3;

export default function NewPostingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);
  const [oppId, setOppId] = useState<number | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);

  const [details, setDetails] = useState({
    title: "",
    description: "",
    type: "fellowship" as "fellowship" | "employment",
    application_deadline: "",
    employment_type: "full-time",
    program_name: "",
  });
  const [definition, setDefinition] = useState<FormDefinition>({
    standard: STANDARD_FIELDS,
    custom: [],
  });

  async function createDraft() {
    if (
      !details.title ||
      details.title.length < 5 ||
      !details.description ||
      !details.application_deadline
    ) {
      toast.danger("Fill in title, description and deadline");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: details.title,
        description: details.description,
        type: details.type,
        application_deadline: details.application_deadline,
        ...(details.type === "employment"
          ? { employment_details: { employment_type: details.employment_type } }
          : { fellowship_details: { program_name: details.program_name || details.title } }),
      };
      const res = await recruitmentService.createOpportunity(payload);
      setOppId(res.opportunity.id);
      setStep(2);
    } catch {
      toast.danger("Couldn't create the posting");
    } finally {
      setSaving(false);
    }
  }

  async function publish() {
    if (oppId == null) return;
    setSaving(true);
    try {
      await recruitmentService.saveForm(oppId, definition);
      await recruitmentService.publishForm(oppId);
      await recruitmentService.publishOpportunity(oppId);
      toast.success("Posting published");
      router.push(`/recruitment/${oppId}`);
    } catch {
      toast.danger("Publish failed");
    } finally {
      setSaving(false);
      setPublishOpen(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-bold text-slate-900">New posting</h1>
      <ol className="flex gap-4 text-sm">
        {(["Details", "Form", "Publish"] as const).map((label, i) => (
          <li
            key={label}
            className={step === i + 1 ? "font-semibold text-blue-600" : "text-slate-400"}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      {step === 1 && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={details.title}
                onChange={(e) => setDetails({ ...details, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={details.description}
                onChange={(e) => setDetails({ ...details, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select
                  value={details.type}
                  onValueChange={(v) => setDetails({ ...details, type: v as typeof details.type })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fellowship">Fellowship</SelectItem>
                    <SelectItem value="employment">Employment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="deadline">Application deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={details.application_deadline}
                  onChange={(e) => setDetails({ ...details, application_deadline: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button disabled={saving} onClick={createDraft}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardContent className="pt-6">
            <FormBuilder
              definition={definition}
              rules={[]}
              onSaveDraft={setDefinition}
              onPublish={() => setStep(3)}
              onCreateRule={() => {}}
              onUpdateRule={() => {}}
              onDeleteRule={() => {}}
            />
            <div className="mt-4 flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)}>Continue</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <p className="text-slate-700">
              Ready to publish. This makes the posting and its form live on the public site.
            </p>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={() => setPublishOpen(true)}>Publish</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish this posting?</DialogTitle>
            <DialogDescription>
              The posting and its application form go live on the public site and start accepting
              applications.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPublishOpen(false)}>
              Cancel
            </Button>
            <Button disabled={saving} onClick={publish}>
              Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
