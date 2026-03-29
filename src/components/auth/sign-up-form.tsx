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

export function SignUpForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  return (
    <Card className="border-white/10 bg-slate-900/70 backdrop-blur">
      <CardHeader>
        <CardTitle className="font-[family:var(--font-space-grotesk)] text-3xl text-white">
          Launch your creator account
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            startTransition(async () => {
              const response = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
              });

              const payload = await response.json();

              if (!response.ok) {
                toast.error(payload.error || "Could not create account.");
                return;
              }

              await signIn("credentials", {
                email: form.email,
                password: form.password,
                redirect: false,
              });
              toast.success("Account created.");
              router.push("/dashboard");
              router.refresh();
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="name">Display name</Label>
            <Input
              id="name"
              required
              minLength={2}
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
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
            className="w-full rounded-full bg-cyan-300 text-slate-950 hover:bg-cyan-200"
            disabled={pending}
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
          </Button>
          <div className="text-sm text-slate-300">
            Already have an account?{" "}
            <Link href="/auth/sign-in" className="text-white">
              Sign in
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
