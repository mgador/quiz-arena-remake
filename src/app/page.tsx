import Link from "next/link";
import { ArrowRight, Sparkles, Trophy, Zap } from "lucide-react";
import { HeroOrb } from "@/components/hero-orb";
import { QuizCard } from "@/components/quiz-card";
import { Button } from "@/components/ui/button";
import { connectToDatabase } from "@/lib/mongoose";
import { getServerAuthSession } from "@/lib/auth";
import { Quiz } from "@/models/Quiz";

async function getFeaturedQuizzes() {
  await connectToDatabase();
  const quizzes = await Quiz.find({ visibility: "public" })
    .sort({ playCount: -1, updatedAt: -1 })
    .limit(6)
    .lean();

  return quizzes.map((quiz) => ({
    id: quiz._id.toString(),
    slug: quiz.slug,
    title: quiz.title,
    description: quiz.description,
    category: quiz.category,
    tags: quiz.tags,
    questionCount: quiz.questions.length,
    playCount: quiz.playCount,
  }));
}

export default async function HomePage() {
  const [featuredQuizzes, session] = await Promise.all([
    getFeaturedQuizzes(),
    getServerAuthSession(),
  ]);

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[680px] bg-linear-to-b from-cyan-400/10 via-amber-300/10 to-transparent" />
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-28">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">
            <Sparkles className="h-4 w-4" />
            Next.js quiz platform with game-like motion
          </div>
          <div className="space-y-5">
            <h1 className="max-w-3xl font-[family:var(--font-space-grotesk)] text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              Build trivia that feels like a competition, not a form.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              Quiz Arena lets every user create public or private quizzes, launch them
              instantly, and compete on score-and-speed leaderboards.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              className="rounded-full bg-amber-300 px-6 text-slate-950 hover:bg-amber-200"
            >
              <Link href={session?.user ? "/dashboard/quizzes/new" : "/auth/sign-up"}>
                Start creating
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-white/10 bg-white/5 px-6 text-white hover:bg-white/10"
            >
              <Link href="/quizzes">Explore quizzes</Link>
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: Trophy, label: "Per-quiz rankings" },
              { icon: Zap, label: "Animated play flow" },
              { icon: Sparkles, label: "Creator dashboard" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 text-slate-200"
              >
                <item.icon className="h-5 w-5 text-amber-300" />
                <p className="mt-3 text-sm">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center lg:justify-end">
          <HeroOrb />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-amber-200/70">
              Featured board
            </p>
            <h2 className="mt-3 font-[family:var(--font-space-grotesk)] text-3xl font-semibold text-white">
              Popular public quizzes
            </h2>
          </div>
          <Link className="text-sm text-cyan-200 hover:text-white" href="/quizzes">
            See all quizzes
          </Link>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {featuredQuizzes.length ? (
            featuredQuizzes.map((quiz) => <QuizCard key={quiz.id} quiz={quiz} />)
          ) : (
            <div className="rounded-[28px] border border-dashed border-white/15 bg-white/[0.03] p-8 text-slate-300 lg:col-span-3">
              No public quizzes yet. Create the first one from the dashboard.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
