import { createTransport } from "nodemailer";

/**
 * Email sending utility using Nodemailer.
 * Supports SMTP configuration via environment variables (Brevo-compatible).
 *
 * Required env vars:
 * - SMTP_HOST: SMTP server hostname (e.g., smtp-relay.brevo.com)
 * - SMTP_PORT: SMTP port (587 for TLS)
 * - SMTP_USER: SMTP username
 * - SMTP_PASS: SMTP password / API key
 * - SMTP_FROM: From email address
 */

let transporter: ReturnType<typeof createTransport> | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    throw new Error("SMTP environment variables not configured.");
  }

  transporter = createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
  });

  return transporter;
}

/**
 * Send a 6-digit OTP verification email.
 * Premium responsive HTML template with Arabic Sikhi branding.
 */
export async function sendOTPEmail(email: string, code: string, name?: string): Promise<void> {
  const from = process.env.SMTP_FROM ?? "Arabic Sikhi <noreply@arabic.ailearnersbd.com>";
  const transport = getTransporter();

  const greeting = name ? `${name}, আপনার` : "আপনার";

  const html = `<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>আরবি শিখি — ইমেইল যাচাই কোড</title>
</head>
<body style="margin:0;padding:0;background-color:#f7f3ea;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Plus Jakarta Sans','Noto Sans Bengali',sans-serif;-webkit-font-smoothing:antialiased;">

<!-- Preheader (hidden) -->
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
  আপনার আরবি শিখি অ্যাকাউন্ট যাচাই করতে এই ৬-সংখ্যার কোডটি ব্যবহার করুন।
</div>

<!-- Outer wrapper -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f3ea;">
<tr>
<td align="center" style="padding:32px 16px;">

  <!-- Email container -->
  <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">

    <!-- Logo header -->
    <tr>
      <td align="center" style="padding-bottom:28px;">
        <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <div style="display:inline-block;width:64px;height:64px;border-radius:18px;background:linear-gradient(135deg,#2d6a4f 0%,#1b4332 100%);text-align:center;line-height:64px;color:#ffffff;font-size:30px;font-weight:700;font-family:'Amiri','Noto Naskh Arabic',serif;">
              ع
            </div>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-top:14px;">
            <h1 style="margin:0;color:#1b4332;font-size:22px;font-weight:800;letter-spacing:-0.3px;">আরবি শিখি</h1>
            <p style="margin:4px 0 0;color:#6b7280;font-size:12px;font-weight:500;letter-spacing:0.3px;">Arabic Sikhi — Premium Quranic Arabic Learning</p>
          </td>
        </tr>
        </table>
      </td>
    </tr>

    <!-- Main card -->
    <tr>
      <td>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:20px;box-shadow:0 2px 8px rgba(27,67,50,0.06);overflow:hidden;">

          <!-- Top accent bar -->
          <tr>
            <td style="height:5px;background:linear-gradient(90deg,#2d6a4f 0%,#52b788 50%,#f4a261 100%);font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:36px 32px 28px;">

              <!-- Icon badge -->
              <div style="text-align:center;margin-bottom:24px;">
                <div style="display:inline-block;width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,#d1e7dd 0%,#a3d9b1 100%);text-align:center;line-height:52px;font-size:26px;">
                  🔐
                </div>
              </div>

              <h2 style="margin:0 0 10px;color:#1b4332;font-size:19px;font-weight:700;text-align:center;">ইমেইল যাচাই কোড</h2>
              <p style="margin:0 0 28px;color:#6b7280;font-size:14px;line-height:1.65;text-align:center;">
                ${greeting} আরবি শিখি অ্যাকাউন্ট যাচাই করতে নিচের<br>৬-সংখ্যার কোডটি ব্যবহার করুন:
              </p>

              <!-- OTP Code box -->
              <div style="text-align:center;margin:8px 0 24px;">
                <div style="display:inline-block;letter-spacing:10px;font-size:38px;font-weight:800;color:#1b4332;background:linear-gradient(135deg,#f0f7f4 0%,#e8f5e9 100%);border-radius:16px;padding:20px 36px;border:2px solid #d1e7dd;font-family:'Courier New',monospace;">
                  ${code}
                </div>
              </div>

              <!-- Expiry notice -->
              <div style="background-color:#fef9e7;border:1px solid #fde68a;border-radius:12px;padding:12px 16px;margin:0 0 20px;">
                <p style="margin:0;color:#92400e;font-size:12px;text-align:center;line-height:1.5;">
                  ⏱ এই কোডটি <strong>১০ মিনিট</strong>ের জন্য বৈধ
                </p>
              </div>

              <!-- Security note -->
              <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;line-height:1.6;">
                আপনি এই অনুরোধ করেননি? নিরাপত্তার জন্য এই ইমেইলটি উপেক্ষা করুন।<br>
                কেউ আপনার অ্যাকাউন্ট অ্যাক্সেস করার চেষ্টা করছে না।
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td align="center" style="padding:24px 16px 8px;">
        <p style="margin:0 0 6px;color:#9ca3af;font-size:11px;font-weight:500;letter-spacing:0.2px;">
          আস-সুন্নাহ ফাউন্ডেশন · আরবি শিখি
        </p>
        <p style="margin:0;color:#c9c9c9;font-size:10px;">
          © 2024 Arabic Sikhi. All rights reserved.
        </p>
      </td>
    </tr>

  </table>
</td>
</tr>
</table>
</body>
</html>`;

  await transport.sendMail({
    from,
    to: email,
    subject: "আরবি শিখি — ইমেইল যাচাই কোড",
    html,
  });
}

/**
 * Generate a random 6-digit OTP code.
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
