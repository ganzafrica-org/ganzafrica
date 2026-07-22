"use client";

/**
 * REC-01 form builder (controlled component). The parent owns persistence — this renders the
 * standard fields locked, lets HR add/edit/reorder custom fields and author eligibility rules,
 * and surfaces save/publish/rule callbacks. Detailed page wiring lands in REC-03.
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowDown, ArrowUp, Lock, Plus, Trash2 } from "lucide-react";
import type { FormDefinition, FormField, FormFieldType } from "@/lib/recruitment/form-types";
import { STANDARD_RULE_KEYS } from "@/lib/recruitment/form-types";
import { RULE_OPERATORS } from "@/lib/recruitment/eligibility";

export interface RuleDraft {
  id?: number;
  field_key: string;
  operator: string;
  value?: unknown;
  reject_message: string;
  is_active: boolean;
  hit_count?: number;
}

export interface FormBuilderProps {
  definition: FormDefinition;
  rules: RuleDraft[];
  onSaveDraft: (definition: FormDefinition) => void;
  onPublish: () => void;
  onCreateRule: (rule: RuleDraft) => void;
  onUpdateRule: (index: number, rule: RuleDraft) => void;
  onDeleteRule: (index: number) => void;
  saving?: boolean;
}

const CUSTOM_FIELD_TYPES: FormFieldType[] = [
  "text",
  "textarea",
  "select",
  "multiselect",
  "number",
  "date",
  "file",
  "boolean",
  "country",
];

const NO_VALUE_OPERATORS = new Set(["is_true", "is_false"]);

function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function FormBuilder(props: FormBuilderProps) {
  const { definition, rules } = props;
  const [custom, setCustom] = useState<FormField[]>(definition.custom);
  const [publishOpen, setPublishOpen] = useState(false);

  const customFieldKeys = custom.map((f) => f.key);
  const ruleFieldOptions = [...STANDARD_RULE_KEYS, ...customFieldKeys];

  function commitCustom(next: FormField[]) {
    // renumber order to match position
    const ordered = next.map((f, i) => ({ ...f, order: i + 1 }));
    setCustom(ordered);
    props.onSaveDraft({ standard: definition.standard, custom: ordered });
  }

  function addCustomField() {
    const key = `custom_${custom.length + 1}`;
    commitCustom([
      ...custom,
      {
        key,
        label: "Untitled field",
        type: "text",
        required: false,
        order: custom.length + 1,
        section: "Additional questions",
      },
    ]);
  }

  function updateCustomField(index: number, patch: Partial<FormField>) {
    commitCustom(custom.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  }

  function ruleReferencesField(key: string): boolean {
    return rules.some((r) => r.is_active && r.field_key === key);
  }

  function removeCustomField(index: number) {
    const field = custom[index];
    // A field an active rule references cannot be deleted (spec §8).
    if (ruleReferencesField(field.key)) return;
    commitCustom(custom.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-8">
      {/* Standard (locked) fields */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Lock className="h-4 w-4 text-slate-400" /> Standard fields
        </h3>
        <ul className="divide-y rounded-md border">
          {definition.standard.map((f) => (
            <li key={f.key} className="flex items-center justify-between px-4 py-2 text-sm">
              <span className="font-medium text-slate-700">{f.label}</span>
              <span className="text-xs text-slate-400">{f.type}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Custom fields */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Custom fields</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={addCustomField}
            aria-label="Add custom field"
          >
            <Plus className="mr-1 h-4 w-4" /> Add field
          </Button>
        </div>
        {custom.length === 0 ? (
          <p className="text-sm text-slate-500">No custom fields yet.</p>
        ) : (
          <ul className="space-y-3">
            {custom.map((f, i) => {
              const locked = ruleReferencesField(f.key);
              return (
                <li key={f.key} className="rounded-md border p-3">
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="flex-1 min-w-[160px]">
                      <Label htmlFor={`label-${f.key}`}>Label</Label>
                      <Input
                        id={`label-${f.key}`}
                        value={f.label}
                        onChange={(e) => updateCustomField(i, { label: e.target.value })}
                      />
                    </div>
                    <div className="w-40">
                      <Label>Type</Label>
                      <Select
                        value={f.type}
                        onValueChange={(v) => updateCustomField(i, { type: v as FormFieldType })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CUSTOM_FIELD_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={f.required}
                        onCheckedChange={(c) => updateCustomField(i, { required: c })}
                        id={`req-${f.key}`}
                      />
                      <Label htmlFor={`req-${f.key}`}>Required</Label>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Move up"
                        onClick={() => commitCustom(moveItem(custom, i, i - 1))}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Move down"
                        onClick={() => commitCustom(moveItem(custom, i, i + 1))}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete field"
                        disabled={locked}
                        title={locked ? "An active rule references this field" : undefined}
                        onClick={() => removeCustomField(i)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Eligibility rules */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Eligibility rules</h3>
          <Button
            variant="outline"
            size="sm"
            aria-label="Add rule"
            onClick={() =>
              props.onCreateRule({
                field_key: ruleFieldOptions[0] ?? "age",
                operator: "eq",
                value: "",
                reject_message: "",
                is_active: true,
              })
            }
          >
            <Plus className="mr-1 h-4 w-4" /> Add rule
          </Button>
        </div>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Operator</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Reject message</TableHead>
                <TableHead>Active</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-sm text-slate-500">
                    No rules yet.
                  </TableCell>
                </TableRow>
              ) : (
                rules.map((r, i) => {
                  const noValue = NO_VALUE_OPERATORS.has(r.operator);
                  const canDelete = !r.hit_count;
                  return (
                    <TableRow key={r.id ?? i}>
                      <TableCell>
                        <Select
                          value={r.field_key}
                          onValueChange={(v) => props.onUpdateRule(i, { ...r, field_key: v })}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ruleFieldOptions.map((k) => (
                              <SelectItem key={k} value={k}>
                                {k}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={r.operator}
                          onValueChange={(v) => props.onUpdateRule(i, { ...r, operator: v })}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {RULE_OPERATORS.map((op) => (
                              <SelectItem key={op} value={op}>
                                {op}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          aria-label={`Value for rule ${i + 1}`}
                          disabled={noValue}
                          value={noValue ? "" : String(r.value ?? "")}
                          onChange={(e) => props.onUpdateRule(i, { ...r, value: e.target.value })}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          aria-label={`Reject message for rule ${i + 1}`}
                          value={r.reject_message}
                          onChange={(e) =>
                            props.onUpdateRule(i, { ...r, reject_message: e.target.value })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          aria-label={`Toggle rule ${i + 1}`}
                          checked={r.is_active}
                          onCheckedChange={(c) => props.onUpdateRule(i, { ...r, is_active: c })}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete rule ${i + 1}`}
                          disabled={!canDelete}
                          title={canDelete ? undefined : "Rules with hits deactivate instead"}
                          onClick={() => props.onDeleteRule(i)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          disabled={props.saving}
          onClick={() => props.onSaveDraft({ standard: definition.standard, custom })}
        >
          Save draft
        </Button>
        <Button aria-label="Open publish dialog" onClick={() => setPublishOpen(true)}>
          Publish
        </Button>
      </div>

      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish this form?</DialogTitle>
            <DialogDescription>
              Publishing bumps the form version and makes it the live application form. The current
              published version is archived.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPublishOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setPublishOpen(false);
                props.onPublish();
              }}
            >
              Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default FormBuilder;
