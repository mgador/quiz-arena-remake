import Link from "next/link";
import { Search } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { QuizCard } from "@/components/quiz-card";
import { Input } from "@/components/ui/input";
import { connectToDatabase } from "@/lib/mongoose";
import { Quiz } from "@/models/Quiz";

export default async function QuizzesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const params = await searchParams;
  const search = params.search?.trim();
  const category = params.category?.trim();

  await connectToDatabase();
  const filter: Record<string, unknown> = { visibility: "public" };

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
    ];
  }

  if (category) {
    filter.category = category;
  }

  const quizzes = await Quiz.find(filter).sort({ updatedAt: -1 }).lean();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">
            Discovery
          </p>
          <h1 className="font-[family:var(--font-space-grotesk)] text-4xl font-semibold text-white">
            Explore active quiz arenas
          </h1>
          <p className="max-w-2xl text-slate-300">
            Search by category, title, or tags. Every result here is public and ready
            to play.
          </p>
        </div>
        <form className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <div className="relative min-w-[280px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              name="search"
              defaultValue={search}
              placeholder="Search quizzes"
              className="pl-9"
            />
          </div>
          <Input name="category" defaultValue={category} placeholder="Category" />
          <button className="rounded-full bg-white px-5 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-200">
            Filter
          </button>
        </form>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {quizzes.length ? (
          quizzes.map((quiz) => (
            <QuizCard
              key={quiz._id.toString()}
              quiz={{
                id: quiz._id.toString(),
                slug: quiz.slug,
                title: quiz.title,
                description: quiz.description,
                category: quiz.category,
                tags: quiz.tags,
                questionCount: quiz.questions.length,
                playCount: quiz.playCount,
              }}
            />
          ))
        ) : (
          <div className="lg:col-span-3">
            <EmptyState
              title="No quizzes match your filter"
              description="Try a different search term, or publish a new quiz from your dashboard."
              actionHref="/dashboard"
              actionLabel="Open dashboard"
            />
          </div>
        )}
      </div>
      <div className="mt-10 text-sm text-slate-400">
        Want to publish your own challenge?{" "}
        <Link href="/dashboard/quizzes/new" className="text-cyan-200 hover:text-white">
          Create a quiz
        </Link>
      </div>
    </div>
  );
}
