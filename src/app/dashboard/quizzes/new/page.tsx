import { QuizEditor } from "@/components/dashboard/quiz-editor";

export default function NewQuizPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-cyan-200/70">
          New challenge
        </p>
        <h1 className="mt-3 font-[family:var(--font-space-grotesk)] text-4xl font-semibold text-white">
          Build a quiz that feels alive.
        </h1>
      </div>
      <QuizEditor />
    </div>
  );
}
