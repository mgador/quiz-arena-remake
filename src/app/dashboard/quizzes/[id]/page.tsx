import { notFound } from "next/navigation";
import { QuizEditor } from "@/components/dashboard/quiz-editor";
import { connectToDatabase } from "@/lib/mongoose";
import { requireUser } from "@/lib/auth";
import { Quiz } from "@/models/Quiz";
import type { QuizPayload } from "@/types/quiz";

export default async function EditQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  await connectToDatabase();
  const quiz = await Quiz.findOne({ _id: id, ownerId: user.id }).lean();

  if (!quiz) {
    notFound();
  }

  const initialQuiz: QuizPayload = {
    title: quiz.title,
    description: quiz.description,
    category: quiz.category,
    tags: quiz.tags,
    visibility: quiz.visibility,
    settings: {
      shuffleQuestions: quiz.settings.shuffleQuestions,
      shuffleOptions: quiz.settings.shuffleOptions,
      timeLimitPerQuiz: quiz.settings.timeLimitPerQuiz,
      passingScore: quiz.settings.passingScore,
    },
    questions: quiz.questions.map((question: QuizPayload["questions"][number]) => ({
      id: question.id,
      type: question.type,
      prompt: question.prompt,
      options: question.options,
      correctOptionIds: question.correctOptionIds,
      points: question.points,
    })),
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-cyan-200/70">
          Edit challenge
        </p>
        <h1 className="mt-3 font-[family:var(--font-space-grotesk)] text-4xl font-semibold text-white">
          {quiz.title}
        </h1>
      </div>
      <QuizEditor quizId={quiz._id.toString()} initialQuiz={initialQuiz} />
    </div>
  );
}
