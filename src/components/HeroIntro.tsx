"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { site } from "@/config/site";

/**
 * The invitation that sits over the photograph: one rise, in sequence, and
 * nothing else. Framer sets the opening frame in the server-rendered HTML, so
 * the copy never flashes in and out before it animates.
 */
export function HeroIntro() {
  const group: Variants = {
    hidden: {},
    shown: { transition: { staggerChildren: 0.11 } },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    shown: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.div variants={group} initial="hidden" animate="shown">
      <motion.h1 variants={item} className="max-w-[13ch] font-display text-display text-parchment">
        A community
        <br />
        of the <em className="italic text-gold-soft">called</em>.
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
          className="btn btn-gold whitespace-nowrap px-3 text-[0.68rem] tracking-[0.05em] sm:px-[1.3rem] sm:text-[0.6875rem] sm:tracking-[0.13em]"
        >
          Join a gathering
        </Link>
        <Link
          href="/teachings"
          className="link-quiet inline-flex items-center gap-2 whitespace-nowrap text-[0.7rem] text-parchment/75 hover:text-parchment sm:text-sm"
        >
          Read a teaching first
          <ArrowRight aria-hidden="true" className="hidden h-3.5 w-3.5 sm:block" />
        </Link>
      </motion.div>
    </motion.div>
  );
}
