"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Site-wide high-performance motion layer.
 * Drives smooth parallax, staggered entrances, and scroll dynamics.
 * Built with failsafes ensuring sections NEVER remain hidden.
 */
export function SiteMotion() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();

    // Reduced motion mode: ensure full visibility immediately
    mm.add("(prefers-reduced-motion: reduce)", () => {
      document.querySelectorAll<HTMLElement>("[data-stagger], [data-parallax]").forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // 1. Dynamic Parallax on Photography
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((plate) => {
        gsap.fromTo(
          plate,
          { yPercent: -6, scale: 1.04 },
          {
            yPercent: 6,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: plate.closest("figure, a, div") ?? plate,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8,
            },
          },
        );
      });

      // 2. Grids, Lists & Timetables: Fluid Staggered Entrance
      gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((group) => {
        const items = Array.from(group.children) as HTMLElement[];
        if (!items.length) return;

        // Check if group is already visible on screen
        const rect = group.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.9) {
          gsap.fromTo(
            items,
            { opacity: 0, y: 18 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: "power2.out",
              stagger: 0.08,
              immediateRender: false,
            }
          );
        } else {
          gsap.fromTo(
            items,
            { opacity: 0, y: 22 },
            {
              opacity: 1,
              y: 0,
              duration: 0.75,
              ease: "power3.out",
              stagger: 0.08,
              immediateRender: false,
              scrollTrigger: {
                trigger: group,
                start: "top 95%",
                once: true,
              },
            }
          );
        }
      });

      // 3. Hero Gathering Photo: Cinematic Depth Parallax
      const hero = document.querySelector<HTMLElement>("[data-hero]");
      const heroMedia = document.querySelector<HTMLElement>("[data-hero-media]");
      if (hero && heroMedia) {
        gsap.to(heroMedia, {
          yPercent: 12,
          scale: 1.05,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: 0.6,
          },
        });
      }

      // 4. Guaranteed Failsafe: Ensure zero sections ever remain hidden
      const failsafeTimer = window.setTimeout(() => {
        document.querySelectorAll<HTMLElement>("[data-stagger] > *").forEach((el) => {
          if (window.getComputedStyle(el).opacity === "0") {
            el.style.opacity = "1";
            el.style.transform = "none";
          }
        });
      }, 1400);

      return () => {
        window.clearTimeout(failsafeTimer);
      };
    });

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh).catch(() => undefined);
    const settle = window.setTimeout(refresh, 600);

    return () => {
      window.clearTimeout(settle);
      window.removeEventListener("load", refresh);
      mm.revert();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [pathname]);

  return null;
}
