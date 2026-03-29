import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/mongoose";
import { getServerAuthSession } from "@/lib/auth";
import { createUniqueSlug, normalizeQuizPayload } from "@/lib/quiz";
import { Quiz } from "@/models/Quiz";
import { User } from "@/models/User";

export async function POST(request: Request) {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json();

  try {
    const payload = normalizeQuizPayload(body);
    await connectToDatabase();

    const quiz = await Quiz.create({
      ownerId: session.user.id,
      ...payload,
      slug: await createUniqueSlug(payload.title),
    });

    await User.findByIdAndUpdate(session.user.id, { $inc: { createdQuizzesCount: 1 } });

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/quizzes");

    return NextResponse.json({ id: quiz._id.toString(), slug: quiz.slug });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create quiz." },
      { status: 400 }
    );
  }
}
