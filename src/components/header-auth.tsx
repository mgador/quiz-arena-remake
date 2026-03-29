"use client";

import Link from "next/link";
import { useTransition } from "react";
import { LogOut, Sparkles } from "lucide-react";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import { Button } from "@/components/ui/button";

export function HeaderAuth({ session }: { session: Session | null }) {
  const [pending, startTransition] = useTransition();

  if (!session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Button
          asChild
          variant="ghost"
          className="rounded-full border border-white/10 text-slate-100 hover:bg-white/10 hover:text-white"
        >
          <Link href="/auth/sign-in">Sign in</Link>
        </Button>
        <Button
          asChild
          className="rounded-full bg-amber-300 text-slate-950 hover:bg-amber-200"
        >
          <Link href="/auth/sign-up">Start playing</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 md:flex md:items-center md:gap-2">
        <Sparkles className="h-4 w-4 text-amber-300" />
        {session.user.name ?? session.user.email}
      </div>
      <Button
        type="button"
        variant="ghost"
        className="rounded-full border border-white/10 text-white hover:bg-white/10 hover:text-white"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await signOut({ callbackUrl: "/" });
          })
        }
      >
        <LogOut className="h-4 w-4" />
        {pending ? "Leaving..." : "Sign out"}
      </Button>
    </div>
  );
}
