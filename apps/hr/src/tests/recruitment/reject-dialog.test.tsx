import { afterEach, describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { RejectDialog } from "@/components/recruitment/reject-dialog";

afterEach(cleanup);

describe("RejectDialog", () => {
  it("requires a reason before confirming", async () => {
    const onConfirm = vi.fn();
    render(
      <RejectDialog
        open
        onOpenChange={() => {}}
        applicationName="Jane Doe"
        onConfirm={onConfirm}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Reject" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("reason is required");
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("clears the error once the user starts typing a reason", async () => {
    render(
      <RejectDialog open onOpenChange={() => {}} applicationName="Jane Doe" onConfirm={vi.fn()} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Reason"), { target: { value: "x" } });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("passes the reason and send_email flag through", async () => {
    const onConfirm = vi.fn();
    render(
      <RejectDialog
        open
        onOpenChange={() => {}}
        applicationName="Jane Doe"
        onConfirm={onConfirm}
      />,
    );

    fireEvent.change(screen.getByLabelText("Reason"), { target: { value: "Not a fit" } });
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));

    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
    expect(onConfirm).toHaveBeenCalledWith({ reason: "Not a fit", sendEmail: true });
  });
});
