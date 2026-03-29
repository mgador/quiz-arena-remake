"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Progress({
  value = 0,
  className,
}: React.HTMLAttributes<HTMLDivElement> & { value?: number }) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-primary/20", className)}>
      <div
        className="h-full rounded-full bg-linear-to-r from-cyan-300 via-white to-amber-300 transition-all"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
