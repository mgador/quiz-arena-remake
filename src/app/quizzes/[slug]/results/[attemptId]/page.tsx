import { notFound } from "next/navigation";
import { Leaderboard } from "@/components/game/leaderboard";
import { ResultsSummary } from "@/components/game/results-summary";
import { requireUser } from "@/lib/auth";
import { getQuizBySlug } from "@/lib/game";
import { getAttemptRank, getLeaderboard } from "@/lib/quiz";
import { connectToDatabase } from "@/lib/mongoose";
import { QuizAttempt } from "@/models/QuizAttempt";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ slug: string; attemptId: string }>;
}) {
  const user = await requireUser();
  const { slug, attemptId } = await params;

  await connectToDatabase();
  const [quiz, attempt] = await Promise.all([
    getQuizBySlug(slug),
    QuizAttempt.findOne({
      _id: attemptId,
      userId: user.id,
      status: "submitted",
    }).lean(),
  ]);

  if (!quiz || !attempt) {
    notFound();
  }

  const [leaderboard, rank] = await Promise.all([
    getLeaderboard(quiz._id.toString(), 10),
    getAttemptRank(quiz._id.toString(), attemptId),
  ]);

  const breakdown = attempt.questionSnapshot.map((question: { id: string; prompt: string; points: number }) => {
    const answer = attempt.answers.find(
      (item: { questionId: string }) => item.questionId === question.id
    );

    return {
      questionId: question.id,
      prompt: question.prompt,
      isCorrect: answer?.isCorrect ?? false,
      pointsEarned: answer?.pointsEarned ?? 0,
      totalPoints: question.points,
    };
  });

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
      <ResultsSummary
        score={attempt.score}
        maxScore={attempt.maxScore}
        completionMs={attempt.completionMs}
        rank={rank}
        breakdown={breakdown}
        playAgainHref={`/quizzes/${quiz.slug}/play`}
      />
      <Leaderboard entries={leaderboard} />
    </div>
  );
}
