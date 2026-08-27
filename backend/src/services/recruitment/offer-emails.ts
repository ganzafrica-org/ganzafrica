/**
 * REC-05 offer/hire emails (link-bearing). Kept separate from the REC-02 stage templates since
 * these carry secure links and post-accept next-steps.
 */
export function shell(bodyHtml: string): string {
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

export function button(url: string, label: string): string {
  return `<p style="text-align:center;margin:28px 0;">
    <a href="${url}" style="background:#045F3C;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;">${label}</a>
  </p>`;
}

export function offerEmail(input: {
  firstName: string;
  positionTitle: string;
  link: string;
  expiresAt?: Date | null;
}) {
  const expiry = input.expiresAt
    ? `<p style="color:#777;font-size:14px;">This offer link expires on ${input.expiresAt.toDateString()}.</p>`
    : "";
  return {
    subject: `Your offer from GanzAfrica — ${input.positionTitle}`,
    html: shell(
      `<p>Hi ${input.firstName},</p>
       <p>Congratulations! We're pleased to offer you the position of
       <strong>${input.positionTitle}</strong> at GanzAfrica.</p>
       <p>Please review your offer letter and respond using the secure link below.</p>
       ${button(input.link, "View & respond to your offer")}
       ${expiry}`,
    ),
  };
}

export function welcomeEmail(input: {
  firstName: string;
  positionTitle: string;
  setPasswordLink?: string;
}) {
  const setup = input.setPasswordLink
    ? `<p>To get started, set up your account:</p>${button(input.setPasswordLink, "Set up your account")}`
    : `<p>You can sign in with your existing GanzAfrica account to begin onboarding.</p>`;
  const setupText = input.setPasswordLink
    ? `To get started, set up your account: ${input.setPasswordLink}`
    : `You can sign in with your existing GanzAfrica account to begin onboarding.`;
  return {
    subject: `Welcome to GanzAfrica — ${input.positionTitle}`,
    html: shell(
      `<p>Hi ${input.firstName},</p>
       <p>Welcome aboard! We're thrilled you've accepted the <strong>${input.positionTitle}</strong>
       position. Your onboarding will begin shortly.</p>
       ${setup}`,
    ),
    // Plain-text part — without one, some clients (and inbox preview snippets) render an
    // html-only email as blank, since they read the text part for the preview/fallback.
    text: `Hi ${input.firstName},\n\nWelcome aboard! We're thrilled you've accepted the ${input.positionTitle} position. Your onboarding will begin shortly.\n\n${setupText}\n\nWarm regards,\nThe GanzAfrica Recruitment Team`,
  };
}
