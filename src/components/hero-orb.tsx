"use client";

import { motion } from "framer-motion";

export function HeroOrb() {
  return (
    <div className="relative h-[320px] w-full max-w-[420px]">
      <motion.div
        className="absolute inset-x-0 top-4 h-56 rounded-full bg-linear-to-r from-cyan-400/30 via-amber-300/20 to-rose-500/25 blur-3xl"
        animate={{ y: [0, -18, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-8 top-10 h-64 w-64 rounded-[32px] border border-white/15 bg-slate-900/70 p-5 shadow-2xl shadow-cyan-950/30 backdrop-blur"
        animate={{ rotate: [-3, 0, -3], y: [0, -8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex h-full flex-col justify-between rounded-[26px] border border-white/10 bg-linear-to-br from-white/10 to-white/5 p-5">
          <div className="space-y-3">
            <div className="h-3 w-24 rounded-full bg-amber-300/60" />
            <div className="h-3 w-40 rounded-full bg-white/20" />
            <div className="h-3 w-32 rounded-full bg-white/10" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="h-3 w-10 rounded-full bg-white/10" />
                <div className="mt-4 h-7 w-14 rounded-full bg-linear-to-r from-cyan-300/60 to-blue-400/60" />
              </div>
            ))}
          </div>
        </div>
      </motion.div>
      <motion.div
        className="absolute right-6 top-24 w-48 rounded-[28px] border border-amber-200/20 bg-amber-300/15 p-5 shadow-xl shadow-orange-900/20 backdrop-blur"
        animate={{ rotate: [4, 0, 4], y: [0, 12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <p className="text-xs uppercase tracking-[0.3em] text-amber-100/70">
          Live Rank
        </p>
        <div className="mt-4 space-y-3">
          {["Nova", "Rin", "Mika"].map((name, index) => (
            <div
              key={name}
              className="flex items-center justify-between rounded-2xl bg-slate-950/45 px-3 py-2 text-sm text-white"
            >
              <span>
                #{index + 1} {name}
              </span>
              <span className="text-amber-200">{980 - index * 40}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
