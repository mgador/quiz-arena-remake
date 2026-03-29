"use client";

import Link from "next/link";
import { Award, CheckCircle2, CircleX, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { formatDuration } from "@/lib/format";
import { Button } from "@/components/ui/button";

type ResultsSummaryProps = {
  score: number;
  maxScore: number;
  completionMs: number;
  rank: number | null;
  breakdown: Array<{
    questionId: string;
    prompt: string;
    isCorrect: boolean;
    pointsEarned: number;
    totalPoints: number;
  }>;
  playAgainHref: string;
};

export function ResultsSummary({
  score,
  maxScore,
  completionMs,
  rank,
  breakdown,
  playAgainHref,
}: ResultsSummaryProps) {
  const accuracy =
    maxScore === 0 ? 0 : Math.round((score / maxScore) * 100);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-[32px] border border-white/10 bg-linear-to-br from-amber-300/15 via-white/5 to-cyan-300/10 p-6"
      >
        <p className="text-sm uppercase tracking-[0.24em] text-amber-100/70">
          Final score
        </p>
        <h2 className="mt-3 font-[family:var(--font-space-grotesk)] text-5xl font-semibold text-white">
          {score}/{maxScore}
        </h2>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-slate-200">
            <div className="inline-flex items-center gap-2 text-sm text-slate-400">
              <Award className="h-4 w-4 text-amber-300" />
              Rank
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">
              {rank ? `#${rank}` : "Pending"}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-slate-200">
            <div className="inline-flex items-center gap-2 text-sm text-slate-400">
              <Flame className="h-4 w-4 text-cyan-300" />
              Accuracy
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">{accuracy}%</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-slate-200">
            <div className="inline-flex items-center gap-2 text-sm text-slate-400">
              <Award className="h-4 w-4 text-rose-300" />
              Time
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">
              {formatDuration(completionMs)}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-3">
        {breakdown.map((item, index) => (
          <div
            key={item.questionId}
            className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                  Question {index + 1}
                </p>
                <p className="mt-2 text-white">{item.prompt}</p>
              </div>
              <div
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm ${
                  item.isCorrect
                    ? "bg-emerald-500/15 text-emerald-100"
                    : "bg-rose-500/15 text-rose-100"
                }`}
              >
                {item.isCorrect ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <CircleX className="h-4 w-4" />
                )}
                {item.pointsEarned}/{item.totalPoints}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button asChild className="rounded-full bg-white text-slate-950 hover:bg-slate-200">
        <Link href={playAgainHref}>Run it again</Link>
      </Button>
    </div>
  );
}
