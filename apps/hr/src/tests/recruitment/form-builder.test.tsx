import { afterEach, describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

afterEach(cleanup);
import { FormBuilder, type RuleDraft } from "@/components/recruitment/form-builder";
import type { FormDefinition } from "@/lib/recruitment/form-types";

const definition: FormDefinition = {
  standard: [
    {
      key: "first_name",
      label: "First name",
      type: "text",
      required: true,
      order: 1,
      section: "About you",
    },
    {
      key: "date_of_birth",
      label: "Date of birth",
      type: "date",
      required: true,
      order: 2,
      section: "About you",
    },
  ],
  custom: [],
};

function setup(rules: RuleDraft[] = []) {
  const handlers = {
    onSaveDraft: vi.fn(),
    onPublish: vi.fn(),
    onCreateRule: vi.fn(),
    onUpdateRule: vi.fn(),
    onDeleteRule: vi.fn(),
  };
  render(<FormBuilder definition={definition} rules={rules} {...handlers} />);
  return handlers;
}

describe("FormBuilder", () => {
  it("renders standard fields locked (label visible, no delete)", () => {
    setup();
    expect(screen.getByText("First name")).toBeInTheDocument();
    expect(screen.getByText("Date of birth")).toBeInTheDocument();
    expect(screen.queryByLabelText("Delete field")).not.toBeInTheDocument();
  });

  it("adding a custom field saves the draft with the new field", () => {
    const h = setup();
    fireEvent.click(screen.getByRole("button", { name: "Add custom field" }));
    expect(h.onSaveDraft).toHaveBeenCalledTimes(1);
    const def = h.onSaveDraft.mock.calls[0][0] as FormDefinition;
    expect(def.custom).toHaveLength(1);
  });

  it("adding a rule invokes onCreateRule with defaults", () => {
    const h = setup();
    fireEvent.click(screen.getByRole("button", { name: "Add rule" }));
    expect(h.onCreateRule).toHaveBeenCalledTimes(1);
  });

  it("a rule with hits cannot be hard-deleted (delete disabled)", () => {
    setup([
      {
        field_key: "age",
        operator: "gt",
        value: 30,
        reject_message: "cap",
        is_active: true,
        hit_count: 4,
      },
    ]);
    const del = screen.getByLabelText("Delete rule 1") as HTMLButtonElement;
    expect(del.disabled).toBe(true);
  });

  it("editing a rule's reject message calls onUpdateRule", () => {
    const h = setup([
      { field_key: "age", operator: "gt", value: 30, reject_message: "", is_active: true },
    ]);
    fireEvent.change(screen.getByRole("textbox", { name: "Reject message for rule 1" }), {
      target: { value: "Sorry" },
    });
    expect(h.onUpdateRule).toHaveBeenCalled();
    const [, updated] = h.onUpdateRule.mock.calls[0];
    expect(updated.reject_message).toBe("Sorry");
  });

  it("opens the publish confirmation dialog then publishes", () => {
    const h = setup();
    fireEvent.click(screen.getByRole("button", { name: "Open publish dialog" }));
    expect(screen.getByText("Publish this form?")).toBeInTheDocument();
    // The dialog's confirm button (plain "Publish", distinct from the trigger's aria-label)
    fireEvent.click(screen.getByRole("button", { name: "Publish" }));
    expect(h.onPublish).toHaveBeenCalledTimes(1);
  });
});
