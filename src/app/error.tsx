"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="rounded-full border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm text-rose-100">
        Something broke in the arena
      </p>
      <h1 className="font-[family:var(--font-space-grotesk)] text-4xl font-semibold text-white">
        {error.message || "Unexpected error"}
      </h1>
      <div className="flex gap-3">
        <Button onClick={() => reset()} className="rounded-full">
          Try again
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
