"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * The scroll layer of the site, in one place.
 *
 * Only two things are animated here, both driven by position on the page:
 * `[data-parallax]` drifts a photograph a few pixels inside its frame, and
 * `[data-stagger]` brings a grid or a list in one item at a time. Nothing
 * above the fold is hidden by this file, so a page still reads correctly
 * before hydration and with JavaScript switched off.
 *
 * Reduced-motion readers get the page with no transforms at all.
 */
export function SiteMotion() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();

    // Reduced motion keeps the fade, and drops every movement. The page still
    // arrives in sequence; nothing travels across the screen.
    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((group) => {
        const items = Array.from(group.children) as HTMLElement[];
        if (!items.length) return;
        gsap.from(items, {
          opacity: 0,
          duration: 0.4,
          stagger: 0.05,
          ease: "power1.out",
          scrollTrigger: { trigger: group, start: "top 88%", once: true },
        });
      });
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // A photograph beside long copy drifts gently against the scroll.
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((plate) => {
        gsap.fromTo(
          plate,
          { yPercent: -4 },
          {
            yPercent: 4,
            ease: "none",
            scrollTrigger: {
              trigger: plate.closest("figure, a, div") ?? plate,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          },
        );
      });

      // Grids and lists arrive one item at a time.
      gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((group) => {
        const items = Array.from(group.children) as HTMLElement[];
        if (!items.length) return;
        gsap.from(items, {
          opacity: 0,
          y: 28,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.09,
          scrollTrigger: { trigger: group, start: "top 88%", once: true },
        });
      });

      // The hero photograph settles as the invitation leaves the screen.
      const hero = document.querySelector<HTMLElement>("[data-hero]");
      const heroMedia = document.querySelector<HTMLElement>("[data-hero-media]");
      if (hero && heroMedia) {
        gsap.to(heroMedia, {
          yPercent: 5,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: 0.5,
          },
        });
      }

      return () => {};
    });

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh).catch(() => undefined);
    const settle = window.setTimeout(refresh, 900);

    return () => {
      window.clearTimeout(settle);
      window.removeEventListener("load", refresh);
      mm.revert();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [pathname]);

  return null;
}
