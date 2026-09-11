/**
 * DOC-signing emails. Same branded shell as recruitment/leave emails (offer-emails.ts) — reused
 * rather than duplicated.
 */
import { shell, button } from "../recruitment/offer-emails";

export function signatureRequestedEmail(input: {
  signerFirstName?: string | null;
  subject: string;
  link: string;
}) {
  const greeting = input.signerFirstName ? `Hi ${input.signerFirstName},` : "Hi,";
  return {
    subject: `Please sign: ${input.subject}`,
    html: shell(
      `<p>${greeting}</p>
       <p>You have a document waiting for your signature: <strong>${input.subject}</strong>.</p>
       ${button(input.link, "Review & sign")}`,
    ),
    text: `${greeting}\n\nYou have a document waiting for your signature: ${input.subject}.\n\n${input.link}`,
  };
}
