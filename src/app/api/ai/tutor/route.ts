import { z } from "zod";
import ZAI from "z-ai-web-dev-sdk";
import { apiHandler, fail, ok } from "@/lib/api/responses";
import { getSessionUser } from "@/lib/session";

const tutorSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ),
  context: z
    .object({
      level: z.number().optional(),
      currentLesson: z.string().optional(),
    })
    .optional(),
});

const SYSTEM_PROMPT = `তুমি "আরবি শিখি" (Arabic Sikhi) অ্যাপের বন্ধুত্বপূর্ণ AI আরবি শিক্ষক। 

তোমার দায়িত্ব:
- বাংলাভাষী শিক্ষার্থীদের কুরআনি আরবি শেখানো
- সহজ, উৎসাহদায়ক এবং ধৈর্যশীল হওয়া
- আরবি শব্দ বা বাক্য ব্যাখ্যা করার সময় আরবি টেক্সট, ট্রান্সলিটারেশন ও বাংলা অর্থ একসাথে দেওয়া
- উদাহরণস্বরূপ: «السلام عليكم» (as-salāmu ʿalaykum) — অর্থ: "তোমার উপর শান্তি বর্ষিত হোক"
- ছোট ছোট প্রশ্ন দিয়ে শিক্ষার্থীকে চিন্তা করতে উৎসাহিত করা
- সংক্ষিপ্ত উত্তর দেওয়া (সর্বোচ্চ ৩-৪ বাক্য), যাতে মোবাইলে পড়তে সুবিধা হয়
- প্রয়োজনে কুরআনের আয়াত বা হাদিসের সহজ উদাহরণ দেওয়া

মনে রেখো — শিক্ষার্থীরা শুরুর দিকে থাকতে পারে, তাই খুব জটিল ব্যাকরণ এড়িয়ে যাও।`;

export const POST = apiHandler(async (req) => {
  // Require authentication — prevents anonymous LLM credit abuse
  const session = await getSessionUser();
  if (!session) return fail("Not authenticated", 401);

  const body = await req.json().catch(() => null);
  const parsed = tutorSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid payload", 422, parsed.error.flatten());

  // Limit message history to prevent token abuse
  const recentMessages = parsed.data.messages.slice(-10);
  const { context } = parsed.data;

  const contextNote = context?.level
    ? `\n\nশিক্ষার্থীর বর্তমান লেভেল: ${context.level}। ${context.currentLesson ? `বর্তমান লেসন: ${context.currentLesson}।` : ""}`
    : "";

  const zai = await ZAI.create();

  const completion = await zai.chat.completions.create({
    messages: [
      { role: "assistant", content: SYSTEM_PROMPT + contextNote },
      ...recentMessages,
    ],
    thinking: { type: "disabled" },
  });

  const reply = completion.choices[0]?.message?.content;

  if (!reply) return fail("Empty AI response", 502);

  return ok({ reply });
});
