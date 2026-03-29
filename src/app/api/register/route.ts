import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { trackEvent } from "@/lib/analytics";
import { connectToDatabase } from "@/lib/mongoose";
import { checkRateLimit } from "@/lib/rate-limit";
import { User } from "@/models/User";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(48),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "local";
  const rateLimit = checkRateLimit(`register:${forwardedFor}`, 8, 60_000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait before trying again." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid account details." }, { status: 400 });
  }

  await connectToDatabase();

  const existing = await User.findOne({ email: parsed.data.email.toLowerCase() })
    .select("_id")
    .lean();

  if (existing) {
    return NextResponse.json(
      { error: "An account already exists for that email." },
      { status: 409 }
    );
  }

  const passwordHash = await hash(parsed.data.password, 12);
  const user = await User.create({
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    passwordHash,
  });

  trackEvent("user.registered", { userId: user._id.toString() });

  return NextResponse.json({ ok: true });
}
