"use client";

import { motion } from "framer-motion";

/**
 * A page arrives with the smallest possible movement: one short rise, under a
 * third of a second, so navigation feels continuous rather than abrupt.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
