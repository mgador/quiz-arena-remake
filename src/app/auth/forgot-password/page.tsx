import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 text-cyan-300">
        <Mail className="h-9 w-9" />
      </div>
      <h1 className="font-[family:var(--font-space-grotesk)] text-4xl font-semibold text-white">
        Password reset is queued for the next milestone.
      </h1>
      <p className="max-w-xl text-slate-300">
        The first release includes a placeholder here. Until email delivery is wired,
        create a fresh local account or update credentials directly in MongoDB.
      </p>
      <Button asChild className="rounded-full">
        <Link href="/auth/sign-in">Back to sign in</Link>
      </Button>
    </div>
  );
}
