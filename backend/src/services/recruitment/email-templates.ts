/**
 * GanzAfrica-branded applicant email templates (REC-02). Plain inline HTML like the payslip mails.
 * Each returns { subject, html }. `rejected` uses the HR-authored rejection_reason copy only —
 * never rule internals (GDPR-ish, spec §8).
 */

export type ApplicantEmailType =
  | "received"
  | "rejected"
  | "shortlisted"
  | "interview"
  | "offer"
  | "hired";

interface TemplateInput {
  firstName: string;
  opportunityTitle: string;
  rejectionReason?: string | null;
}

function shell(bodyHtml: string): string {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;font-family:Arial,sans-serif;background:#f9f9f9;">
  <div style="max-width:600px;margin:0 auto;">
    <div style="background:#045F3C;padding:20px;text-align:center;">
      <h1 style="color:#fff;margin:0;">GanzAfrica</h1>
    </div>
    <div style="padding:32px 30px;color:#333;line-height:1.6;">
      ${bodyHtml}
      <p style="margin-top:28px;color:#555;">Warm regards,<br/>The GanzAfrica Recruitment Team</p>
    </div>
  </div>
</body></html>`;
}

const TEMPLATES: Record<
  ApplicantEmailType,
  (i: TemplateInput) => { subject: string; html: string }
> = {
  received: (i) => ({
    subject: `We received your application — ${i.opportunityTitle}`,
    html: shell(
      `<p>Hi ${i.firstName},</p>
       <p>Thank you for applying for <strong>${i.opportunityTitle}</strong>. We've received your
       application and our team will review it carefully. We'll be in touch about next steps.</p>`,
    ),
  }),
  rejected: (i) => ({
    subject: `Update on your application — ${i.opportunityTitle}`,
    html: shell(
      `<p>Hi ${i.firstName},</p>
       <p>Thank you for your interest in <strong>${i.opportunityTitle}</strong> and for the time
       you invested in your application.</p>
       <p>${
         i.rejectionReason?.trim()
           ? i.rejectionReason
           : "After careful consideration, we won't be moving forward with your application at this time."
       }</p>
       <p>We genuinely appreciate your interest in GanzAfrica and encourage you to apply for future
       opportunities that match your profile.</p>`,
    ),
  }),
  shortlisted: (i) => ({
    subject: `Good news about your application — ${i.opportunityTitle}`,
    html: shell(
      `<p>Hi ${i.firstName},</p>
       <p>We're pleased to let you know that you've been <strong>shortlisted</strong> for
       <strong>${i.opportunityTitle}</strong>. Our team will reach out shortly with the next steps.</p>`,
    ),
  }),
  interview: (i) => ({
    subject: `Interview invitation — ${i.opportunityTitle}`,
    html: shell(
      `<p>Hi ${i.firstName},</p>
       <p>Congratulations — we'd like to invite you to an <strong>interview</strong> for
       <strong>${i.opportunityTitle}</strong>. A member of our team will contact you to arrange a
       convenient time.</p>`,
    ),
  }),
  offer: (i) => ({
    subject: `An offer for you — ${i.opportunityTitle}`,
    html: shell(
      `<p>Hi ${i.firstName},</p>
       <p>We're delighted to extend an offer for <strong>${i.opportunityTitle}</strong>. Details
       will follow separately.</p>`,
    ),
  }),
  hired: (i) => ({
    subject: `Welcome to GanzAfrica — ${i.opportunityTitle}`,
    html: shell(
      `<p>Hi ${i.firstName},</p>
       <p>Welcome aboard! We're thrilled to have you join us for
       <strong>${i.opportunityTitle}</strong>.</p>`,
    ),
  }),
};

export function renderApplicantEmail(type: ApplicantEmailType, input: TemplateInput) {
  return TEMPLATES[type](input);
}
