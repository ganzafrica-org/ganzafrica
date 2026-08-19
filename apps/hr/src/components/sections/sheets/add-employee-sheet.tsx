"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  Check,
  User,
  CheckCircle,
  FileSignature,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ReusableSheet } from "@/components/sections/sheets/sheet-component";
import { useCreateEmployee } from "@/hooks/useEmployees";
import {
  ContractFormFields,
  getMissingContractFields,
  type ContractFormState,
} from "@/components/sections/contracts/contract-form-fields";
import { saveContractWithAgreement } from "@/lib/helpers/contract-agreement";
import { useProcesses, useProcess, usePatchTask } from "@/hooks/useProcesses";
import { ContractSigningStatus } from "@/components/processes/contract-signing-status";
import type { CreateEmployeeRequest, EmploymentType, Contract } from "@/types/api";

type StepType = "profile" | "contract";

const STEPS: { id: StepType; title: string; subtitle: string; icon: React.ReactNode }[] = [
  {
    id: "profile",
    title: "Profile & Type",
    subtitle: "Who they are, what role",
    icon: <User className="w-5 h-5" />,
  },
  {
    id: "contract",
    title: "Contract (optional)",
    subtitle: "Add now or skip for later",
    icon: <FileText className="w-5 h-5" />,
  },
];

const EMPLOYMENT_TYPES: EmploymentType[] = ["staff", "fellow", "analyst", "contractor", "intern"];

interface ProfileFormState {
  first_name: string;
  last_name: string;
  personal_email: string;
  work_email: string;
  employee_number: string;
  job_title: string;
  department: string;
  employment_type: EmploymentType | "";
  hired_at: string;
  phone: string;
}

const emptyProfile: ProfileFormState = {
  first_name: "",
  last_name: "",
  personal_email: "",
  work_email: "",
  employee_number: "",
  job_title: "",
  department: "",
  employment_type: "",
  hired_at: "",
  phone: "",
};

interface AddEmployeeSheetProps {
  open: boolean;
  onOpenChange: (val: boolean) => void;
}

interface CreatedResult {
  employeeId: string;
  contract: Contract;
}

/**
 * Shown once employee + DRAFT contract creation both succeed. The contract_signing task and its
 * signature request already exist server-side the moment the onboarding instance is instantiated
 * (createEmployee now does this) — this just links the freshly-created contract to that task via
 * the existing PATCH /process-tasks/:id (usePatchTask), the same mechanism the onboarding task
 * card's own contract picker uses. No new signing/onboarding backend logic — this only calls
 * endpoints that already exist and were already exercised from a different entry point.
 */
function SendForSignaturePanel({ employeeId, contract }: CreatedResult) {
  const queryClient = useQueryClient();
  const { data: instances } = useProcesses({ employee_id: employeeId, type: "onboarding" });
  const instanceId = instances?.[0]?.id ?? null;
  const { data: detail, isLoading: loadingDetail } = useProcess(instanceId);
  const patchTask = usePatchTask();
  const [sent, setSent] = useState(false);

  const signingTask = detail?.tasks.find(
    (t) =>
      t.kind === "contract_signing" &&
      !(t.link_ref as { contract_id?: string } | null)?.contract_id,
  );

  async function handleSend() {
    if (!signingTask) return;
    await patchTask.mutateAsync({
      taskId: signingTask.id,
      link_ref: { contract_id: contract.id },
    });
    await queryClient.invalidateQueries({
      queryKey: ["signing", "by-ref", "contract", contract.id],
    });
    setSent(true);
  }

  return (
    <div className="rounded-lg border border-gray-200 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <FileSignature className="w-4 h-4 text-brand-accent" />
        <h3 className="text-sm font-semibold text-gray-900">Route for signature</h3>
      </div>
      <ContractSigningStatus refKind="contract" refId={contract.id} variant="compact" />

      {!sent && !loadingDetail && instances && !signingTask && (
        <p className="text-xs text-gray-500">
          This employee&apos;s onboarding checklist has no unlinked &ldquo;sign contract&rdquo; step
          — send this from the Contracts tab or the onboarding task card instead.
        </p>
      )}

      <Button
        size="sm"
        onClick={handleSend}
        disabled={!signingTask || patchTask.isPending || sent}
        className="bg-brand-accent hover:bg-brand-accent/90 text-white"
      >
        {sent
          ? "Sent to HR for signature"
          : patchTask.isPending
            ? "Sending…"
            : "Send for signature"}
      </Button>
    </div>
  );
}

export const AddEmployeeSheet = ({ open, onOpenChange }: AddEmployeeSheetProps) => {
  const createEmployeeMutation = useCreateEmployee();
  const [currentStep, setCurrentStep] = useState<StepType>("profile");
  const [profile, setProfile] = useState<ProfileFormState>(emptyProfile);
  const [addContractNow, setAddContractNow] = useState(false);
  const [contract, setContract] = useState<ContractFormState>({ currency: "RWF" });
  const [agreementFile, setAgreementFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<CreatedResult | null>(null);

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);
  const [isSubmittingContract, setIsSubmittingContract] = useState(false);
  const isSaving = createEmployeeMutation.isPending || isSubmittingContract;

  const reset = () => {
    setCurrentStep("profile");
    setProfile(emptyProfile);
    setAddContractNow(false);
    setContract({ currency: "RWF" });
    setAgreementFile(null);
    setError(null);
    setCreatedResult(null);
  };

  const profileValid = !!(profile.first_name && profile.last_name && profile.personal_email);

  const handleNext = () => {
    if (currentStep === "profile") {
      if (!profileValid) {
        setError("First name, last name and personal email are required.");
        return;
      }
      setError(null);
      setCurrentStep("contract");
      return;
    }
    handleSubmit();
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) setCurrentStep(STEPS[currentStepIndex - 1].id);
  };

  const handleSubmit = async () => {
    const missingContractFields = addContractNow
      ? getMissingContractFields(contract, !!agreementFile)
      : [];
    if (missingContractFields.length > 0) {
      setError(
        `Missing required contract field${missingContractFields.length > 1 ? "s" : ""}: ` +
          `${missingContractFields.join(", ")} — or turn the contract step off.`,
      );
      return;
    }
    setError(null);

    const payload: CreateEmployeeRequest = {
      first_name: profile.first_name,
      last_name: profile.last_name,
      personal_email: profile.personal_email,
      work_email: profile.work_email || undefined,
      employee_number: profile.employee_number || undefined,
      job_title: profile.job_title || undefined,
      department: profile.department || undefined,
      employment_type: profile.employment_type || undefined,
      hired_at: profile.hired_at || undefined,
      phone: profile.phone || undefined,
    };

    try {
      const employee = await createEmployeeMutation.mutateAsync(payload);

      if (addContractNow) {
        setIsSubmittingContract(true);
        let createdContract: Contract;
        try {
          createdContract = await saveContractWithAgreement({
            employeeId: employee.id,
            form: contract,
            agreementFile,
          });
        } finally {
          setIsSubmittingContract(false);
        }
        // Stay open on a DRAFT contract so HR can route it for signature right here — closing
        // immediately would mean going to find the onboarding task card just to do this.
        if (createdContract.status === "DRAFT") {
          setCreatedResult({ employeeId: employee.id, contract: createdContract });
          return;
        }
      }

      reset();
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Something went wrong. Please try again.");
    }
  };

  const isStepCompleted = (stepIndex: number) => stepIndex < currentStepIndex;
  const isStepActive = (stepIndex: number) => stepIndex === currentStepIndex;

  if (createdResult) {
    return (
      <ReusableSheet
        open={open}
        onOpenChange={(v) => {
          if (!v) reset();
          onOpenChange(v);
        }}
        title="Employee created"
        description="A draft contract was attached — route it for signature now, or do it later from the Contracts tab."
        footer={
          <Button
            className="w-full bg-black text-white hover:bg-gray-900"
            onClick={() => {
              reset();
              onOpenChange(false);
            }}
          >
            Done
          </Button>
        }
      >
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm text-emerald-700">
            <CheckCircle className="w-4 h-4" />
            Employee and contract created.
          </div>
          <SendForSignaturePanel
            employeeId={createdResult.employeeId}
            contract={createdResult.contract}
          />
        </div>
      </ReusableSheet>
    );
  }

  return (
    <ReusableSheet
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <div className="w-full max-w-[95%] h-[calc(100vh-2rem)] flex flex-col overflow-hidden">
        <div className="grid md:grid-cols-[240px_1fr] gap-0 h-full overflow-hidden">
          {/* Stepper sidebar */}
          <div className="hidden md:flex bg-white py-8 flex-col rounded-l-lg overflow-hidden shrink-0 self-stretch">
            <div className="space-y-8 h-full flex flex-col justify-center items-center border-r border-gray-100">
              {STEPS.map((step, index) => {
                const completed = isStepCompleted(index);
                const active = isStepActive(index);
                return (
                  <div key={step.id}>
                    <div
                      onClick={() => completed && setCurrentStep(step.id)}
                      className={`flex items-start gap-4 ${completed ? "cursor-pointer" : ""}`}
                    >
                      <div
                        style={{
                          backgroundColor:
                            completed || active ? "var(--color-brand-accent)" : "#E5E7EB",
                        }}
                        className="flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 text-white"
                      >
                        {completed ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <span className="text-sm font-semibold">
                            {active ? (
                              step.icon
                            ) : (
                              <span className="text-gray-600">{index + 1}</span>
                            )}
                          </span>
                        )}
                      </div>
                      <div className="pt-1">
                        <h3
                          className={`text-sm font-semibold ${active ? "text-gray-900" : "text-gray-500"}`}
                        >
                          {step.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">{step.subtitle}</p>
                      </div>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div className="ml-4 w-0.5 my-2 h-8 bg-gray-200" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-r-lg flex flex-col overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex-1 space-y-5"
              >
                {currentStep === "profile" && (
                  <>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Profile & Type</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Basic info for a legacy hire — an account is linked or created
                        automatically.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>First Name</Label>
                        <Input
                          value={profile.first_name}
                          onChange={(e) =>
                            setProfile((p) => ({ ...p, first_name: e.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Last Name</Label>
                        <Input
                          value={profile.last_name}
                          onChange={(e) => setProfile((p) => ({ ...p, last_name: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Personal Email</Label>
                      <Input
                        type="email"
                        placeholder="john@gmail.com"
                        value={profile.personal_email}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, personal_email: e.target.value }))
                        }
                      />
                      <p className="text-xs text-gray-400">
                        Links to an existing account by email, or creates a new one.
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Work Email</Label>
                      <Input
                        type="email"
                        value={profile.work_email}
                        onChange={(e) => setProfile((p) => ({ ...p, work_email: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Phone</Label>
                      <Input
                        value={profile.phone}
                        onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Job Title</Label>
                        <Input
                          value={profile.job_title}
                          onChange={(e) => setProfile((p) => ({ ...p, job_title: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Department</Label>
                        <Input
                          value={profile.department}
                          onChange={(e) =>
                            setProfile((p) => ({ ...p, department: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Employment Type</Label>
                        <Select
                          value={profile.employment_type}
                          onValueChange={(v) =>
                            setProfile((p) => ({ ...p, employment_type: v as EmploymentType }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {EMPLOYMENT_TYPES.map((t) => (
                              <SelectItem key={t} value={t} className="capitalize">
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Employee Number</Label>
                        <Input
                          value={profile.employee_number}
                          onChange={(e) =>
                            setProfile((p) => ({ ...p, employee_number: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Hired Date</Label>
                      <Input
                        type="date"
                        value={profile.hired_at}
                        onChange={(e) => setProfile((p) => ({ ...p, hired_at: e.target.value }))}
                      />
                    </div>
                  </>
                )}

                {currentStep === "contract" && (
                  <>
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Contract</h2>
                        <p className="text-sm text-gray-500 mt-1">
                          Optional — can be added later from the employee&apos;s Contract tab.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <Label className="text-sm text-gray-600">Add now</Label>
                        <Switch checked={addContractNow} onCheckedChange={setAddContractNow} />
                      </div>
                    </div>
                    {addContractNow && (
                      <ContractFormFields
                        value={contract}
                        onChange={(patch) => setContract((c) => ({ ...c, ...patch }))}
                        agreementFile={agreementFile}
                        onAgreementFileChange={setAgreementFile}
                      />
                    )}
                    {!addContractNow && (
                      <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                        <CheckCircle className="w-5 h-5 mx-auto mb-2 text-gray-300" />
                        Skipping — the employee will be created without a contract.
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <Button
                onClick={handlePrev}
                variant="ghost"
                disabled={currentStepIndex === 0}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </Button>

              <div className="flex gap-2 items-center">
                {STEPS.map((_, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: index <= currentStepIndex ? "#4F46E5" : "#E5E7EB",
                      width: index <= currentStepIndex ? 24 : 8,
                    }}
                    className="h-2 rounded-full transition-all"
                  />
                ))}
              </div>

              <Button
                onClick={handleNext}
                disabled={isSaving}
                className="gap-2 bg-black text-white hover:bg-gray-900"
              >
                {currentStepIndex === STEPS.length - 1 ? (
                  <>
                    <Check className="w-4 h-4" />
                    {isSaving ? "Creating…" : "Create Employee"}
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ReusableSheet>
  );
};
