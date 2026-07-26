import { z } from "zod";
import { db } from "@/lib/db";
import { apiHandler, fail, ok } from "@/lib/api/responses";
import { rateLimit, getClientIP } from "@/lib/api/rate-limit";
import { generateOTP, sendOTPEmail } from "@/lib/email";

const sendOTPSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(60).optional(),
});

/**
 * Send a 6-digit OTP to the user's email for verification.
 * Works for both new signups and existing users who need to re-verify.
 * If the email doesn't exist, creates a pending user account.
 */
export const POST = apiHandler(async (req) => {
  // Rate limit: 3 OTP requests per 5 minutes per IP
  const ip = getClientIP(req);
  const limited = rateLimit(`otp:${ip}`, 3, 5 * 60 * 1000);
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  const parsed = sendOTPSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid input", 422, parsed.error.flatten());

  const { email, name } = parsed.data;

  // Check if user already exists
  const existingUser = await db.user.findUnique({ where: { email } });

  // Delete any previous unverified OTPs for this email
  await db.emailOTP.deleteMany({
    where: { email, verified: false },
  });

  // Generate new OTP
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await db.emailOTP.create({
    data: { email, code, expiresAt },
  });

  // Send the email
  try {
    await sendOTPEmail(email, code, name ?? existingUser?.name);
  } catch (e) {
    console.error("[send-otp] Email send failed:", e);
    // In development, return the code directly for testing
    if (process.env.NODE_ENV !== "production") {
      return ok({ sent: false, devCode: code, message: "Email sending failed (dev mode — code returned directly)" });
    }
    return fail("ইমেইল পাঠাতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।", 500);
  }

  return ok({
    sent: true,
    message: "যাচাই কোড আপনার ইমেইলে পাঠানো হয়েছে",
    isNewUser: !existingUser,
  });
});
