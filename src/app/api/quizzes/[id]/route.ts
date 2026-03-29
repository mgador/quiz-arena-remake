import { Types } from "mongoose";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/mongoose";
import { getServerAuthSession } from "@/lib/auth";
import { createUniqueSlug, normalizeQuizPayload } from "@/lib/quiz";
import { Quiz } from "@/models/Quiz";
import { User } from "@/models/User";

async function getOwnedQuiz(id: string, userId: string) {
  await connectToDatabase();

  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  return Quiz.findOne({ _id: id, ownerId: userId });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const quiz = await getOwnedQuiz(id, session.user.id);

  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
  }

  const body = await request.json();

  try {
    if (Object.keys(body).length === 1 && body.visibility) {
      quiz.visibility = body.visibility;
      await quiz.save();
    } else {
      const payload = normalizeQuizPayload(body);
      quiz.title = payload.title;
      quiz.slug = await createUniqueSlug(payload.title, quiz._id.toString());
      quiz.description = payload.description;
      quiz.category = payload.category;
      quiz.tags = payload.tags;
      quiz.visibility = payload.visibility;
      quiz.settings = payload.settings;
      quiz.questions = payload.questions;
      await quiz.save();
    }

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/quizzes/${quiz._id.toString()}`);
    revalidatePath("/quizzes");
    revalidatePath(`/quizzes/${quiz.slug}`);

    return NextResponse.json({ id: quiz._id.toString(), slug: quiz.slug });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update quiz." },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const quiz = await getOwnedQuiz(id, session.user.id);

  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
  }

  await quiz.deleteOne();
  await User.findByIdAndUpdate(session.user.id, { $inc: { createdQuizzesCount: -1 } });

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/quizzes");

  return NextResponse.json({ ok: true });
}
