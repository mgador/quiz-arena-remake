import { Crown, Timer } from "lucide-react";
import { formatDate, formatDuration } from "@/lib/format";
import type { LeaderboardEntry } from "@/types/quiz";

export function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center gap-2 text-white">
        <Crown className="h-5 w-5 text-amber-300" />
        <h3 className="font-[family:var(--font-space-grotesk)] text-2xl font-semibold">
          Leaderboard
        </h3>
      </div>
      <div className="mt-5 space-y-3">
        {entries.length ? (
          entries.map((entry) => (
            <div
              key={entry.attemptId}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3"
            >
              <div>
                <p className="text-sm text-slate-400">#{entry.rank}</p>
                <p className="text-white">{entry.playerName}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-amber-200">
                  {entry.score}/{entry.maxScore}
                </p>
                <p className="inline-flex items-center gap-1 text-sm text-slate-300">
                  <Timer className="h-3.5 w-3.5" />
                  {formatDuration(entry.completionMs)}
                </p>
                <p className="text-xs text-slate-500">{formatDate(entry.submittedAt)}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-slate-300">
            No submitted attempts yet.
          </div>
        )}
      </div>
    </div>
  );
}
