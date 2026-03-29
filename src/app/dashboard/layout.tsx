import Link from "next/link";
import { PlusCircle, Shapes, Sparkles } from "lucide-react";
import { requireUser } from "@/lib/auth";

const nav = [
  { href: "/dashboard", label: "Overview", icon: Sparkles },
  { href: "/dashboard/quizzes/new", label: "New Quiz", icon: PlusCircle },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-[30px] border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-200/70">
            Creator zone
          </p>
          <h2 className="mt-3 font-[family:var(--font-space-grotesk)] text-2xl font-semibold text-white">
            {user.name}
          </h2>
          <p className="mt-2 text-sm text-slate-300">{user.email}</p>
          <div className="mt-6 space-y-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-200 transition hover:bg-white/5 hover:text-white"
              >
                <item.icon className="h-4 w-4 text-amber-300" />
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-300">
            <div className="flex items-center gap-2 text-white">
              <Shapes className="h-4 w-4 text-cyan-300" />
              Dashboard rules
            </div>
            <p className="mt-2">Draft privately, publish when ready, and track plays by quiz.</p>
          </div>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
