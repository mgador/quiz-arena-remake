import { redirect } from "next/navigation";
import { SignInForm } from "@/components/auth/sign-in-form";
import { getServerAuthSession } from "@/lib/auth";

export default async function SignInPage() {
  const session = await getServerAuthSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
      <div className="space-y-6">
        <p className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">
          Login checkpoint
        </p>
        <h1 className="font-[family:var(--font-space-grotesk)] text-5xl font-semibold tracking-tight text-white">
          Step back into the game board.
        </h1>
        <p className="max-w-xl text-lg leading-8 text-slate-300">
          Access your creator dashboard, track leaderboard movement, and publish new
          challenges from one account.
        </p>
      </div>
      <SignInForm />
    </div>
  );
}
