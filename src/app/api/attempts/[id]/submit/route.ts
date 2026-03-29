import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerAuthSession } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { submitAttempt } from "@/lib/game";

const submitSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      selectedOptionIds: z.array(z.string().min(1)),
    })
  ),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const forwardedFor = request.headers.get("x-forwarded-for") ?? session.user.id;
  const rateLimit = checkRateLimit(`submit:${forwardedFor}`, 15, 60_000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many submit attempts. Try again in a moment." },
      { status: 429 }
    );
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = submitSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid answers." }, { status: 400 });
  }

  try {
    const attempt = await submitAttempt({
      attemptId: id,
      userId: session.user.id,
      answers: parsed.data.answers,
    });

    return NextResponse.json({ ok: true, score: attempt.score });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not submit." },
      { status: 400 }
    );
  }
}
