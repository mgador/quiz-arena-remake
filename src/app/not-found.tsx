import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-amber-300">
        <SearchX className="h-10 w-10" />
      </div>
      <h1 className="font-[family:var(--font-space-grotesk)] text-4xl font-semibold text-white">
        This challenge doesn&apos;t exist.
      </h1>
      <p className="max-w-xl text-slate-300">
        The quiz might be private, unpublished, or the link is incorrect.
      </p>
      <Button asChild className="rounded-full">
        <Link href="/quizzes">Explore quizzes</Link>
      </Button>
    </div>
  );
}
