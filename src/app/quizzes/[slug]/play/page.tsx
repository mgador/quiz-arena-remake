import { notFound } from "next/navigation";
import { PlayQuiz } from "@/components/game/play-quiz";
import { getQuizBySlug, ensureAttempt } from "@/lib/game";
import { requireUser } from "@/lib/auth";

export default async function PlayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await requireUser();
  const { slug } = await params;
  const quiz = await getQuizBySlug(slug);

  if (!quiz || quiz.visibility !== "public") {
    notFound();
  }

  const attempt = await ensureAttempt({
    quizId: quiz._id.toString(),
    userId: user.id,
  });

  if (!attempt) {
    notFound();
  }

  const baseQuestions = attempt.questionSnapshot.map(
    (question: {
      id: string;
      type: "single_choice" | "true_false" | "multi_select";
      prompt: string;
      options: Array<{ id: string; label: string }>;
      points: number;
    }) => ({
      id: question.id,
      type: question.type,
      prompt: question.prompt,
      options: question.options,
      points: question.points,
    })
  );

  const questions = quiz.settings.shuffleQuestions
    ? [...baseQuestions].sort(() => Math.random() - 0.5)
    : baseQuestions;

  const preparedQuestions = questions.map((question: typeof baseQuestions[number]) => ({
    ...question,
    options: quiz.settings.shuffleOptions
      ? [...question.options].sort(() => Math.random() - 0.5)
      : question.options,
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.24em] text-cyan-200/70">
          Live attempt
        </p>
        <h1 className="mt-3 font-[family:var(--font-space-grotesk)] text-4xl font-semibold text-white">
          {quiz.title}
        </h1>
      </div>
      <PlayQuiz
        attemptId={attempt._id.toString()}
        quizSlug={quiz.slug}
        questions={preparedQuestions}
        startedAt={new Date(attempt.startedAt).toISOString()}
        timeLimitPerQuiz={quiz.settings.timeLimitPerQuiz}
      />
    </div>
  );
}
