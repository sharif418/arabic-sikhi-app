import { createTransport } from "nodemailer";

/**
 * Email sending utility using Nodemailer.
 * Supports SMTP configuration via environment variables.
 *
 * Required env vars:
 * - SMTP_HOST: SMTP server hostname
 * - SMTP_PORT: SMTP port (usually 587 for TLS, 465 for SSL)
 * - SMTP_USER: SMTP username
 * - SMTP_PASS: SMTP password
 * - SMTP_FROM: From email address (e.g., "আরবি শিখি <noreply@arabicsikhi.com>")
 */

let transporter: ReturnType<typeof createTransport> | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    throw new Error("SMTP environment variables not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM");
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
 * Uses a beautiful HTML template with the Arabic Sikhi branding.
 */
export async function sendOTPEmail(email: string, code: string, name?: string): Promise<void> {
  const from = process.env.SMTP_FROM ?? "আরবি শিখি <noreply@arabicsikhi.com>";
  const transport = getTransporter();

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f7f3ea;font-family:'Plus Jakarta Sans',system-ui,sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:32px 24px;">
    <!-- Logo -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;border-radius:16px;background:linear-gradient(135deg,#2d6a4f,#1b4332);color:white;font-size:28px;font-weight:bold;font-family:Amiri,serif;">ع</div>
      <h1 style="color:#1b4332;font-size:20px;margin:12px 0 4px;">আরবি শিখি</h1>
      <p style="color:#6b7280;font-size:12px;margin:0;">Arabic Sikhi — Premium Quranic Arabic Learning</p>
    </div>

    <!-- Card -->
    <div style="background:white;border-radius:20px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
      <h2 style="color:#1b4332;font-size:18px;margin:0 0 8px;">ইমেইল যাচাই কোড</h2>
      <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 24px;">
        ${name ? `${name}, আপনার` : "আপনার"} আরবি শিখি অ্যাকাউন্ট যাচাই করতে নিচের ৬-সংখ্যার কোডটি ব্যবহার করুন:
      </p>

      <!-- OTP Code -->
      <div style="text-align:center;margin:24px 0;">
        <div style="display:inline-block;letter-spacing:8px;font-size:36px;font-weight:800;color:#2d6a4f;background:#f0f7f4;border-radius:12px;padding:16px 32px;border:2px solid #d1e7dd;">
          ${code}
        </div>
      </div>

      <p style="color:#9ca3af;font-size:12px;text-align:center;margin:16px 0 0;">
        এই কোডটি ১০ মিনিটের জন্য বৈধ।<br>
        আপনি এই অনুরোধ করেননি? এই ইমেইলটি উপেক্ষা করুন।
      </p>
    </div>

    <!-- Footer -->
    <p style="color:#9ca3af;font-size:11px;text-align:center;margin:24px 0 0;">
      © 2024 আস-সুন্নাহ ফাউন্ডেশন · আরবি শিখি
    </p>
  </div>
</body>
</html>
  `.trim();

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
