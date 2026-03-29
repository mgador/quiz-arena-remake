import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/mongoose";
import { getServerAuthSession } from "@/lib/auth";
import { createUniqueSlug } from "@/lib/quiz";
import { Quiz } from "@/models/Quiz";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;

  await connectToDatabase();
  const quiz = await Quiz.findOne({ _id: id, ownerId: session.user.id }).lean();

  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
  }

  const duplicate = await Quiz.create({
    ownerId: session.user.id,
    title: `${quiz.title} Copy`,
    slug: await createUniqueSlug(`${quiz.title} Copy`),
    description: quiz.description,
    category: quiz.category,
    tags: quiz.tags,
    visibility: "draft",
    settings: quiz.settings,
    questions: quiz.questions.map((question: { id: string }) => ({
      ...question,
      id: crypto.randomUUID(),
    })),
  });

  revalidatePath("/dashboard");

  return NextResponse.json({ id: duplicate._id.toString() });
}
