"use client";

import { MotionConfig } from "framer-motion";

/**
 * Reduced motion is handled once, here, and not per component: with
 * `reducedMotion="user"` Framer keeps the opacity fades and skips transforms,
 * layout and scale. The server HTML is the same for everyone, so nothing
 * mismatches on hydration and nothing is left hidden when an animation is
 * skipped.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
