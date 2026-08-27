/**
 * ContractSigningStatus is shared by the onboarding task card, the contract tab, and the Sign
 * page's list view — one component rendering the same signer sequence at two levels of detail.
 */
import { afterEach, describe, it, expect } from "vitest";
import { screen, cleanup } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "@/tests/recruitment/test-utils";
import { ContractSigningStatus } from "@/components/processes/contract-signing-status";
import type { SequenceSigner } from "@/services/signing.service";

const API = "http://localhost:3002/api";
const CONTRACT_ID = "11111111-1111-1111-1111-111111111111";

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

function mockSequence(signers: SequenceSigner[]) {
  server.use(
    http.get(`${API}/hr/signing/requests`, () => HttpResponse.json({ requests: signers })),
  );
}

const hrSigner = (status: SequenceSigner["status"]): SequenceSigner => ({
  id: 1,
  sequence_no: 1,
  signer_user_id: 7,
  signer_name: "HR Rep",
  status,
  completed_at: status === "signed" ? "2026-03-02T00:00:00Z" : null,
});

const employeeSigner = (status: SequenceSigner["status"]): SequenceSigner => ({
  id: 2,
  sequence_no: 2,
  signer_user_id: 9,
  signer_name: "Ada Lovelace",
  status,
  completed_at: status === "signed" ? "2026-03-03T00:00:00Z" : null,
});

describe("ContractSigningStatus", () => {
  it("shows nothing when no contract is linked yet", () => {
    renderWithClient(<ContractSigningStatus refKind="contract" refId={null} />);
    expect(screen.getByText(/no contract linked yet/i)).toBeInTheDocument();
  });

  it("shows 'not yet sent' when a contract exists but no sequence has been created", async () => {
    mockSequence([]);
    renderWithClient(<ContractSigningStatus refKind="contract" refId={CONTRACT_ID} />);
    expect(await screen.findByText(/not yet sent for signature/i)).toBeInTheDocument();
  });

  it("nothing started: HR hasn't signed yet — compact shows waiting on HR", async () => {
    mockSequence([hrSigner("sent"), employeeSigner("draft")]);
    renderWithClient(
      <ContractSigningStatus refKind="contract" refId={CONTRACT_ID} variant="compact" />,
    );
    expect(await screen.findByText(/waiting on hr rep/i)).toBeInTheDocument();
  });

  it("HR signed: full variant shows HR signed, employee awaiting", async () => {
    mockSequence([hrSigner("signed"), employeeSigner("sent")]);
    renderWithClient(
      <ContractSigningStatus refKind="contract" refId={CONTRACT_ID} variant="full" />,
    );

    expect(await screen.findByText("HR Rep")).toBeInTheDocument();
    expect(screen.getByText("Signed")).toBeInTheDocument();
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("Awaiting signature")).toBeInTheDocument();
    expect(screen.queryByText(/fully executed/i)).not.toBeInTheDocument();
  });

  it("HR signed: compact shows waiting on the employee", async () => {
    mockSequence([hrSigner("signed"), employeeSigner("sent")]);
    renderWithClient(
      <ContractSigningStatus refKind="contract" refId={CONTRACT_ID} variant="compact" />,
    );
    expect(await screen.findByText(/waiting on ada lovelace/i)).toBeInTheDocument();
  });

  it("both signed: fully executed in both variants", async () => {
    mockSequence([hrSigner("signed"), employeeSigner("signed")]);
    const { unmount } = renderWithClient(
      <ContractSigningStatus refKind="contract" refId={CONTRACT_ID} variant="compact" />,
    );
    expect(await screen.findByText(/fully executed/i)).toBeInTheDocument();
    unmount();

    mockSequence([hrSigner("signed"), employeeSigner("signed")]);
    renderWithClient(
      <ContractSigningStatus refKind="contract" refId={CONTRACT_ID} variant="full" />,
    );
    expect(await screen.findByText(/fully executed/i)).toBeInTheDocument();
    expect(screen.getAllByText("Signed")).toHaveLength(2);
  });
});
