import Link from "next/link";
import { BarChart3, Layers3, Play, Trophy } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { QuizActions } from "@/components/dashboard/quiz-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { connectToDatabase } from "@/lib/mongoose";
import { requireUser } from "@/lib/auth";
import { Quiz } from "@/models/Quiz";
import { QuizAttempt } from "@/models/QuizAttempt";

export default async function DashboardPage() {
  const user = await requireUser();
  await connectToDatabase();

  const [quizzes, attempts] = await Promise.all([
    Quiz.find({ ownerId: user.id }).sort({ updatedAt: -1 }).lean(),
    QuizAttempt.find({ userId: user.id, status: "submitted" }).lean(),
  ]);

  const totalRuns = quizzes.reduce((sum, quiz) => sum + quiz.playCount, 0);
  const publishedCount = quizzes.filter((quiz) => quiz.visibility === "public").length;
  const bestScore = attempts.reduce((max, attempt) => Math.max(max, attempt.score), 0);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Quizzes created", value: quizzes.length, icon: Layers3 },
          { label: "Published", value: publishedCount, icon: Trophy },
          { label: "Total runs", value: totalRuns, icon: Play },
        ].map((item) => (
          <Card key={item.label} className="border-white/10 bg-white/[0.03]">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-slate-300">{item.label}</p>
                <p className="mt-2 font-[family:var(--font-space-grotesk)] text-4xl font-semibold text-white">
                  {item.value}
                </p>
              </div>
              <item.icon className="h-6 w-6 text-amber-300" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-white/10 bg-white/[0.03]">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-[family:var(--font-space-grotesk)] text-3xl text-white">
              Your quiz board
            </CardTitle>
            <p className="mt-2 text-sm text-slate-300">
              Best player score recorded: {bestScore}
            </p>
          </div>
          <Link
            href="/dashboard/quizzes/new"
            className="inline-flex items-center gap-2 rounded-full bg-amber-300 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-amber-200"
          >
            <BarChart3 className="h-4 w-4" />
            Create quiz
          </Link>
        </CardHeader>
        <CardContent>
          {quizzes.length ? (
            <div className="grid gap-4">
              {quizzes.map((quiz) => (
                <div
                  key={quiz._id.toString()}
                  className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.22em] text-cyan-200/70">
                        {quiz.category}
                      </p>
                      <h3 className="mt-3 font-[family:var(--font-space-grotesk)] text-2xl font-semibold text-white">
                        {quiz.title}
                      </h3>
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                        {quiz.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Badge className="rounded-full bg-white/10 text-slate-100">
                          {quiz.visibility}
                        </Badge>
                        <Badge className="rounded-full bg-white/10 text-slate-100">
                          {quiz.questions.length} questions
                        </Badge>
                        <Badge className="rounded-full bg-white/10 text-slate-100">
                          {quiz.playCount} plays
                        </Badge>
                      </div>
                    </div>
                    <QuizActions
                      quizId={quiz._id.toString()}
                      slug={quiz.slug}
                      visibility={quiz.visibility}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No quizzes yet"
              description="Your creator dashboard is ready. Start with a draft, add questions, then publish when the flow feels right."
              actionHref="/dashboard/quizzes/new"
              actionLabel="Create your first quiz"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
