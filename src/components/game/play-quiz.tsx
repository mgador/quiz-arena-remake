"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Clock3, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { AttemptAnswerInput, QuizPayload } from "@/types/quiz";

type PublicQuestion = Omit<QuizPayload["questions"][number], "correctOptionIds">;

type PlayQuizProps = {
  attemptId: string;
  quizSlug: string;
  questions: PublicQuestion[];
  startedAt: string;
  timeLimitPerQuiz: number | null | undefined;
};

export function PlayQuiz({
  attemptId,
  quizSlug,
  questions,
  startedAt,
  timeLimitPerQuiz,
}: PlayQuizProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [pending, startTransition] = useTransition();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const current = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  useEffect(() => {
    const syncElapsed = () =>
      setElapsedSeconds(
        Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
      );

    syncElapsed();
    const interval = window.setInterval(syncElapsed, 1000);

    return () => window.clearInterval(interval);
  }, [startedAt]);

  const timeRemaining = useMemo(() => {
    if (!timeLimitPerQuiz) {
      return null;
    }

    return Math.max(timeLimitPerQuiz * 60 - elapsedSeconds, 0);
  }, [elapsedSeconds, timeLimitPerQuiz]);

  const submit = () => {
    const payload: AttemptAnswerInput[] = questions.map((question) => ({
      questionId: question.id,
      selectedOptionIds: answers[question.id] ?? [],
    }));

    startTransition(async () => {
      const response = await fetch(`/api/attempts/${attemptId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: payload }),
      });
      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Could not submit attempt.");
        return;
      }

      toast.success("Score locked.");
      router.push(`/quizzes/${quizSlug}/results/${attemptId}`);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <Card className="border-white/10 bg-white/[0.03]">
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>Progress</span>
              <span>
                {currentIndex + 1}/{questions.length}
              </span>
            </div>
            <Progress value={progress} className="h-3 bg-white/10" />
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/[0.03]">
          <CardContent className="flex h-full items-center gap-3 p-5 text-sm text-slate-200">
            <Clock3 className="h-4 w-4 text-amber-300" />
            {timeRemaining === null ? "Untimed run" : `${timeRemaining}s left`}
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/[0.03]">
          <CardContent className="flex h-full items-center gap-3 p-5 text-sm text-slate-200">
            <Check className="h-4 w-4 text-cyan-300" />
            {Object.keys(answers).length} answered
          </CardContent>
        </Card>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -18 }}
          className="rounded-[32px] border border-white/10 bg-white/[0.03] p-6 shadow-xl shadow-slate-950/30"
        >
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-200/70">
            {current.type.replaceAll("_", " ")}
          </p>
          <h2 className="mt-4 font-[family:var(--font-space-grotesk)] text-3xl font-semibold text-white">
            {current.prompt}
          </h2>
          <div className="mt-6 grid gap-3">
            {current.options.map((option) => {
              const multi = current.type === "multi_select";
              const selected = answers[current.id]?.includes(option.id) ?? false;

              return (
                <button
                  key={option.id}
                  type="button"
                  className={`rounded-[24px] border px-5 py-4 text-left transition ${
                    selected
                      ? "border-cyan-300/40 bg-cyan-300/15 text-white"
                      : "border-white/10 bg-slate-950/70 text-slate-200 hover:border-white/20 hover:bg-white/5"
                  }`}
                  onClick={() =>
                    setAnswers((currentAnswers) => {
                      const currentValue = currentAnswers[current.id] ?? [];
                      const nextValue = multi
                        ? selected
                          ? currentValue.filter((value) => value !== option.id)
                          : [...currentValue, option.id]
                        : [option.id];

                      return {
                        ...currentAnswers,
                        [current.id]: nextValue,
                      };
                    })
                  }
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
          onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
          disabled={currentIndex === 0}
        >
          Previous
        </Button>
        {currentIndex === questions.length - 1 ? (
          <Button
            type="button"
            className="rounded-full bg-amber-300 text-slate-950 hover:bg-amber-200"
            disabled={pending}
            onClick={submit}
          >
            {pending ? "Submitting..." : "Submit run"}
          </Button>
        ) : (
          <Button
            type="button"
            className="rounded-full bg-white text-slate-950 hover:bg-slate-200"
            onClick={() =>
              setCurrentIndex((index) => Math.min(questions.length - 1, index + 1))
            }
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
