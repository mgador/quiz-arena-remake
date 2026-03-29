"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignInForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({ email: "", password: "" });

  return (
    <Card className="border-white/10 bg-slate-900/70 backdrop-blur">
      <CardHeader>
        <CardTitle className="font-[family:var(--font-space-grotesk)] text-3xl text-white">
          Return to the arena
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            startTransition(async () => {
              const result = await signIn("credentials", {
                email: form.email,
                password: form.password,
                redirect: false,
              });

              if (result?.error) {
                toast.error("Incorrect email or password.");
                return;
              }

              toast.success("Welcome back.");
              router.push("/dashboard");
              router.refresh();
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
            />
          </div>
          <Button
            type="submit"
            className="w-full rounded-full bg-amber-300 text-slate-950 hover:bg-amber-200"
            disabled={pending}
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
          </Button>
          <div className="flex items-center justify-between text-sm text-slate-300">
            <Link href="/auth/sign-up" className="hover:text-white">
              Create an account
            </Link>
            <Link href="/auth/forgot-password" className="hover:text-white">
              Forgot password?
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
