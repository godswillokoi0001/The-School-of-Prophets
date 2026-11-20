"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { site } from "@/config/site";

export function HeroIntro() {
  const group: Variants = {
    hidden: {},
    shown: { transition: { staggerChildren: 0.15 } },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 28 },
    shown: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <motion.div variants={group} initial="hidden" animate="shown">
      <motion.div variants={item} className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1 text-[0.68rem] uppercase tracking-[0.2em] text-gold-soft backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
        Watchers · Daniel 4:17
      </motion.div>

      <motion.h1 variants={item} className="max-w-[13ch] font-display text-display text-parchment">
        A community
        <br />
        of the{" "}
        <span className="relative inline-block">
          <em className="italic text-gold-soft bg-gradient-to-r from-gold-soft via-[#f7e7c4] to-gold bg-clip-text text-transparent">
            called
          </em>
          <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-gold/0 via-gold to-gold/0 opacity-70" />
        </span>
        .
      </motion.h1>

      <motion.p
        variants={item}
        className="mt-7 max-w-[46ch] text-lead leading-relaxed text-parchment/85"
      >
        The School of Prophets is an interdenominational prophetic fellowship led
        by {site.leader}, gathering online every week from Nigeria, Zambia and
        beyond.
      </motion.p>

      <motion.div
        variants={item}
        className="mt-8 flex flex-nowrap items-center gap-x-2 sm:gap-x-7"
      >
        <Link
          href="/gatherings"
          className="btn btn-gold group relative overflow-hidden whitespace-nowrap px-3 text-[0.68rem] tracking-[0.05em] sm:px-[1.3rem] sm:text-[0.6875rem] sm:tracking-[0.13em] shadow-[0_4px_20px_rgba(176,128,58,0.3)] transition-all duration-300 hover:shadow-[0_6px_28px_rgba(176,128,58,0.45)] hover:scale-[1.02]"
        >
          <span className="relative z-10">Join a gathering</span>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 group-hover:translate-x-full"
          />
        </Link>
        <Link
          href="/teachings"
          className="link-quiet group inline-flex items-center gap-2 whitespace-nowrap text-[0.7rem] text-parchment/75 hover:text-parchment sm:text-sm transition-colors"
        >
          <span>Read a teaching first</span>
          <ArrowRight
            aria-hidden="true"
            className="hidden h-3.5 w-3.5 sm:block transition-transform duration-300 group-hover:translate-x-1 text-gold-soft"
          />
        </Link>
      </motion.div>
    </motion.div>
  );
}
