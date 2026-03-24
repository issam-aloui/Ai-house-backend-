const escapeHtml = (value) => {
  if (value === undefined || value === null) return "";

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const baseLayout = (title, preheader, content) => `
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;background:#f3f6fb;color:#0f172a;font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0;">
          <tr>
            <td style="background:#0b3d91;padding:18px 24px;color:#ffffff;">
              <h1 style="margin:0;font-size:20px;line-height:1.3;">Blida 1 AI House</h1>
              <p style="margin:6px 0 0;font-size:13px;opacity:.9;">Contact Management</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;">${content}</td>
          </tr>
          <tr>
            <td style="padding:16px 24px;background:#f8fafc;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px;">
              This is an automated email from the Blida 1 AI House backend.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const buildAdminNotificationTemplate = (inquiry) => {
  const title = `New Contact Inquiry: ${inquiry.subject || "No subject"}`;

  return {
    subject: title,
    html: baseLayout(
      title,
      "New contact inquiry received",
      `
      <h2 style="margin:0 0 14px;font-size:18px;color:#0f172a;">New Contact Inquiry</h2>
      <p style="margin:0 0 18px;color:#334155;">A new inquiry was submitted from the website contact form.</p>

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
        <tr><td style="padding:10px 14px;background:#f8fafc;font-weight:700;">Name</td><td style="padding:10px 14px;">${escapeHtml(inquiry.name)}</td></tr>
        <tr><td style="padding:10px 14px;background:#f8fafc;font-weight:700;">Email</td><td style="padding:10px 14px;">${escapeHtml(inquiry.email)}</td></tr>
        <tr><td style="padding:10px 14px;background:#f8fafc;font-weight:700;">Phone</td><td style="padding:10px 14px;">${escapeHtml(inquiry.phone || "N/A")}</td></tr>
        <tr><td style="padding:10px 14px;background:#f8fafc;font-weight:700;">Type</td><td style="padding:10px 14px;">${escapeHtml(inquiry.inquiry_type || "general")}</td></tr>
        <tr><td style="padding:10px 14px;background:#f8fafc;font-weight:700;">Subject</td><td style="padding:10px 14px;">${escapeHtml(inquiry.subject)}</td></tr>
      </table>

      <div style="margin-top:16px;padding:14px;border-radius:10px;background:#f8fafc;border:1px solid #e2e8f0;">
        <p style="margin:0 0 8px;font-weight:700;color:#0f172a;">Message</p>
        <p style="margin:0;white-space:pre-line;color:#334155;">${escapeHtml(inquiry.message)}</p>
      </div>
      `,
    ),
  };
};

const buildResolvedConfirmationTemplate = (inquiry) => ({
  subject: `Re: ${inquiry.subject || "Your inquiry to Blida 1 AI House"}`,
  html: baseLayout(
    "Inquiry Update",
    "Your inquiry has been updated",
    `
    <h2 style="margin:0 0 12px;font-size:18px;color:#0f172a;">Your Inquiry Has Been Updated</h2>
    <p style="margin:0 0 12px;color:#334155;">Dear ${escapeHtml(inquiry.name || "there")},</p>
    <p style="margin:0 0 12px;color:#334155;">Thank you for contacting Blida 1 AI House. Your inquiry has now been marked as resolved.</p>

    <div style="margin:14px 0;padding:14px;border-radius:10px;background:#f8fafc;border:1px solid #e2e8f0;">
      <p style="margin:0 0 8px;font-weight:700;color:#0f172a;">Inquiry subject</p>
      <p style="margin:0;color:#334155;">${escapeHtml(inquiry.subject || "N/A")}</p>
    </div>

    <p style="margin:0 0 10px;color:#334155;">If you still need help, reply to this email or contact us at <strong>maison_ia@univ-blida.dz</strong>.</p>
    <p style="margin:0;color:#334155;">Best regards,<br /><strong>Blida 1 AI House Team</strong></p>
    `,
  ),
});

module.exports = {
  buildAdminNotificationTemplate,
  buildResolvedConfirmationTemplate,
};
