"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Copy, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function QuizActions({
  quizId,
  slug,
  visibility,
}: {
  quizId: string;
  slug: string;
  visibility: "draft" | "public" | "private";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const run = (callback: () => Promise<void>) => {
    startTransition(async () => {
      try {
        await callback();
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Action failed");
      }
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild size="sm" className="rounded-full">
        <a href={`/dashboard/quizzes/${quizId}`}>
          <Pencil className="h-4 w-4" />
          Edit
        </a>
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
        disabled={pending}
        onClick={() =>
          run(async () => {
            const response = await fetch(`/api/quizzes/${quizId}/duplicate`, {
              method: "POST",
            });
            const payload = await response.json();
            if (!response.ok) throw new Error(payload.error);
            toast.success("Quiz duplicated.");
          })
        }
      >
        <Copy className="h-4 w-4" />
        Duplicate
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
        disabled={pending}
        onClick={() =>
          run(async () => {
            const response = await fetch(`/api/quizzes/${quizId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ visibility: visibility === "public" ? "private" : "public" }),
            });
            const payload = await response.json();
            if (!response.ok) throw new Error(payload.error);
            toast.success(
              visibility === "public" ? "Quiz moved to private." : "Quiz is now public."
            );
          })
        }
      >
        {visibility === "public" ? (
          <>
            <EyeOff className="h-4 w-4" />
            Hide
          </>
        ) : (
          <>
            <Eye className="h-4 w-4" />
            Publish
          </>
        )}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="rounded-full border-rose-400/30 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20"
        disabled={pending}
        onClick={() =>
          run(async () => {
            const response = await fetch(`/api/quizzes/${quizId}`, {
              method: "DELETE",
            });
            const payload = await response.json();
            if (!response.ok) throw new Error(payload.error);
            toast.success("Quiz deleted.");
            if (window.location.pathname.endsWith(slug)) {
              router.push("/dashboard");
            }
          })
        }
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </Button>
    </div>
  );
}
