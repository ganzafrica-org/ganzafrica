/**
 * MOD-06 leave-flow emails: submit notifies the resolved approver, decision notifies the
 * requester. Same branded shell as the recruitment offer/welcome emails (offer-emails.ts) — reused
 * rather than duplicated.
 */
import { shell } from "../recruitment/offer-emails";

export function leaveSubmittedEmail(input: {
  approverFirstName?: string | null;
  requesterName: string;
  type: string;
  days: number;
  startDate: string;
  endDate: string;
}) {
  const greeting = input.approverFirstName ? `Hi ${input.approverFirstName},` : "Hi,";
  const typeLabel = input.type.toLowerCase();
  return {
    subject: `Leave request awaiting your approval — ${input.requesterName}`,
    html: shell(
      `<p>${greeting}</p>
       <p><strong>${input.requesterName}</strong> requested ${input.days} working day(s) of
       ${typeLabel} leave, from ${input.startDate} to ${input.endDate}.</p>
       <p>Please review and decide on this request in GanzAfrica HR.</p>`,
    ),
    text: `${greeting}\n\n${input.requesterName} requested ${input.days} working day(s) of ${typeLabel} leave, from ${input.startDate} to ${input.endDate}.\n\nPlease review and decide on this request in GanzAfrica HR.`,
  };
}

export function leaveDecidedEmail(input: {
  firstName: string;
  decision: "APPROVED" | "REJECTED";
  type: string;
  days: number;
  startDate: string;
  endDate: string;
  approverNote?: string | null;
}) {
  const outcome = input.decision === "APPROVED" ? "approved" : "rejected";
  const typeLabel = input.type.toLowerCase();
  const note = input.approverNote
    ? `<p><strong>Note from your approver:</strong> ${input.approverNote}</p>`
    : "";
  const noteText = input.approverNote ? `\n\nNote from your approver: ${input.approverNote}` : "";
  return {
    subject: `Your leave request was ${outcome}`,
    html: shell(
      `<p>Hi ${input.firstName},</p>
       <p>Your request for ${input.days} working day(s) of ${typeLabel} leave
       (${input.startDate} – ${input.endDate}) has been <strong>${outcome}</strong>.</p>
       ${note}`,
    ),
    text: `Hi ${input.firstName},\n\nYour request for ${input.days} working day(s) of ${typeLabel} leave (${input.startDate} – ${input.endDate}) has been ${outcome}.${noteText}`,
  };
}
