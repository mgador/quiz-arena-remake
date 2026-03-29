import Link from "next/link";
import { Trophy } from "lucide-react";
import { getServerAuthSession } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { HeaderAuth } from "@/components/header-auth";

const navItems = [
  { href: "/quizzes", label: "Explore" },
  { href: "/dashboard", label: "Dashboard" },
];

export async function SiteHeader() {
  const session = await getServerAuthSession();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group inline-flex items-center gap-3 font-medium text-white"
        >
          <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-amber-300/30 bg-linear-to-br from-amber-300 via-orange-400 to-rose-500 shadow-lg shadow-orange-900/30">
            <Trophy className="h-5 w-5 text-slate-950" />
          </div>
          <div className="space-y-0.5">
            <p className="font-[family:var(--font-space-grotesk)] text-lg font-semibold tracking-tight">
              Quiz Arena
            </p>
            <p className="text-xs uppercase tracking-[0.32em] text-slate-400">
              Compete. Create. Climb.
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white",
                item.href === "/dashboard" && !session ? "hidden" : ""
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <HeaderAuth session={session} />
      </div>
    </header>
  );
}
