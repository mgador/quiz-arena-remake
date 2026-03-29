import Link from "next/link";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-white/15 bg-white/[0.03] p-8 text-center">
      <h3 className="font-[family:var(--font-space-grotesk)] text-2xl font-semibold text-white">
        {title}
      </h3>
      <p className="mx-auto mt-3 max-w-xl text-slate-300">{description}</p>
      {actionHref && actionLabel ? (
        <Button asChild className="mt-6 rounded-full">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
