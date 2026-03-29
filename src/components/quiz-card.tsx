import Link from "next/link";
import { Clock3, Crown, Layers3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type QuizCardProps = {
  quiz: {
    id: string;
    slug: string;
    title: string;
    description: string;
    category: string;
    tags: string[];
    questionCount: number;
    playCount: number;
  };
};

export function QuizCard({ quiz }: QuizCardProps) {
  return (
    <Link
      href={`/quizzes/${quiz.slug}`}
      className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] p-6 transition duration-300 hover:-translate-y-1 hover:border-amber-300/40 hover:bg-white/[0.05]"
    >
      <div className="absolute inset-x-4 top-0 h-px bg-linear-to-r from-transparent via-white/30 to-transparent" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-cyan-200/70">
            {quiz.category}
          </p>
          <h3 className="mt-3 font-[family:var(--font-space-grotesk)] text-2xl font-semibold text-white">
            {quiz.title}
          </h3>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-200">
          {quiz.questionCount} Qs
        </div>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-300">
        {quiz.description}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {quiz.tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-100"
          >
            {tag}
          </Badge>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-300">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2">
          <Layers3 className="h-4 w-4 text-cyan-300" />
          {quiz.questionCount} rounds
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2">
          <Clock3 className="h-4 w-4 text-amber-300" />
          Async play
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2">
          <Crown className="h-4 w-4 text-rose-300" />
          {quiz.playCount} runs
        </span>
      </div>
    </Link>
  );
}
