import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock3, Layers3, PlayCircle } from "lucide-react";
import { Leaderboard } from "@/components/game/leaderboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getServerAuthSession } from "@/lib/auth";
import { getQuizBySlug } from "@/lib/game";
import { getLeaderboard } from "@/lib/quiz";

export default async function QuizDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [quiz, session] = await Promise.all([getQuizBySlug(slug), getServerAuthSession()]);

  if (!quiz || quiz.visibility !== "public") {
    notFound();
  }

  const leaderboard = await getLeaderboard(quiz._id.toString(), 8);

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
      <div className="space-y-6">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-7">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-200/70">
            {quiz.category}
          </p>
          <h1 className="mt-4 font-[family:var(--font-space-grotesk)] text-5xl font-semibold text-white">
            {quiz.title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            {quiz.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-slate-200">
              <Layers3 className="h-4 w-4 text-cyan-300" />
              {quiz.questions.length} questions
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-slate-200">
              <Clock3 className="h-4 w-4 text-amber-300" />
              {quiz.settings.timeLimitPerQuiz
                ? `${quiz.settings.timeLimitPerQuiz} minute limit`
                : "Untimed run"}
            </span>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {quiz.tags.map((tag: string) => (
              <Badge key={tag} className="rounded-full bg-white/10 text-slate-100">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="mt-8">
            <Button
              asChild
              className="rounded-full bg-amber-300 px-6 text-slate-950 hover:bg-amber-200"
            >
              <Link href={session?.user ? `/quizzes/${slug}/play` : "/auth/sign-in"}>
                <PlayCircle className="h-4 w-4" />
                {session?.user ? "Start run" : "Sign in to play"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <Leaderboard entries={leaderboard} />
    </div>
  );
}
