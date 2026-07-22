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

  it("save draft button reports the current definition", () => {
    const h = setup();
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));
    expect(h.onSaveDraft).toHaveBeenCalled();
  });
});

const withCustom: FormDefinition = {
  standard: definition.standard,
  custom: [
    { key: "degree", label: "Degree", type: "text", required: false, order: 1, section: "Extra" },
    {
      key: "portfolio",
      label: "Portfolio",
      type: "text",
      required: false,
      order: 2,
      section: "Extra",
    },
  ],
};

function setupCustom(rules: RuleDraft[] = []) {
  const h = {
    onSaveDraft: vi.fn(),
    onPublish: vi.fn(),
    onCreateRule: vi.fn(),
    onUpdateRule: vi.fn(),
    onDeleteRule: vi.fn(),
  };
  render(<FormBuilder definition={withCustom} rules={rules} {...h} />);
  return h;
}

describe("FormBuilder — custom fields & rule editing", () => {
  it("editing a custom field label saves the draft", () => {
    const h = setupCustom();
    fireEvent.change(screen.getByLabelText("Label", { selector: "#label-degree" }), {
      target: { value: "Highest degree" },
    });
    expect(h.onSaveDraft).toHaveBeenCalled();
    const def = h.onSaveDraft.mock.calls.at(-1)![0] as FormDefinition;
    expect(def.custom[0].label).toBe("Highest degree");
  });

  it("toggling required saves the draft", () => {
    const h = setupCustom();
    // Each custom field row has a required Switch (radix switch = role="switch").
    fireEvent.click(screen.getAllByRole("switch")[0]);
    expect(h.onSaveDraft).toHaveBeenCalled();
  });

  it("moving a field down reorders and renumbers", () => {
    const h = setupCustom();
    const downButtons = screen.getAllByLabelText("Move down");
    fireEvent.click(downButtons[0]);
    const def = h.onSaveDraft.mock.calls.at(-1)![0] as FormDefinition;
    expect(def.custom[0].key).toBe("portfolio");
    expect(def.custom[0].order).toBe(1);
  });

  it("deletes a custom field not referenced by a rule", () => {
    const h = setupCustom();
    const del = screen.getAllByLabelText("Delete field")[0];
    fireEvent.click(del);
    const def = h.onSaveDraft.mock.calls.at(-1)![0] as FormDefinition;
    expect(def.custom).toHaveLength(1);
  });

  it("a field referenced by an active rule cannot be deleted", () => {
    setupCustom([
      { field_key: "degree", operator: "eq", value: "none", reject_message: "x", is_active: true },
    ]);
    const del = screen.getAllByLabelText("Delete field")[0] as HTMLButtonElement;
    expect(del.disabled).toBe(true);
  });

  it("editing a rule's value calls onUpdateRule", () => {
    const h = setupCustom([
      { field_key: "age", operator: "gt", value: "", reject_message: "x", is_active: true },
    ]);
    fireEvent.change(screen.getByLabelText("Value for rule 1"), { target: { value: "40" } });
    expect(h.onUpdateRule).toHaveBeenCalled();
    expect(h.onUpdateRule.mock.calls.at(-1)![1].value).toBe("40");
  });

  it("value input is disabled for is_false operator", () => {
    setupCustom([
      {
        field_key: "has_work_permit",
        operator: "is_false",
        value: null,
        reject_message: "x",
        is_active: true,
      },
    ]);
    const valueInput = screen.getByLabelText("Value for rule 1") as HTMLInputElement;
    expect(valueInput.disabled).toBe(true);
  });

  it("toggling a rule active calls onUpdateRule", () => {
    const h = setupCustom([
      { field_key: "age", operator: "gt", value: "30", reject_message: "x", is_active: true },
    ]);
    fireEvent.click(screen.getByLabelText("Toggle rule 1"));
    expect(h.onUpdateRule).toHaveBeenCalled();
  });

  it("deleting a rule with no hits calls onDeleteRule", () => {
    const h = setupCustom([
      { field_key: "age", operator: "gt", value: "30", reject_message: "x", is_active: true },
    ]);
    fireEvent.click(screen.getByLabelText("Delete rule 1"));
    expect(h.onDeleteRule).toHaveBeenCalledWith(0);
  });

  it("moving the first field up is a no-op (bounds guard)", () => {
    const h = setupCustom();
    fireEvent.click(screen.getAllByLabelText("Move up")[0]);
    // order unchanged: degree still first
    const def = h.onSaveDraft.mock.calls.at(-1)![0] as FormDefinition;
    expect(def.custom[0].key).toBe("degree");
  });
});
