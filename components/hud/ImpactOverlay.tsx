"use client";

import { useEffect, useRef } from "react";
import { impactFX } from "@/lib/cutscene";

export function ImpactOverlay() {
  const root = useRef<HTMLDivElement>(null);
  const flash = useRef<HTMLDivElement>(null);
  const fire = useRef<HTMLDivElement>(null);
  const shock = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let id = 0;
    const tick = () => {
      const age = impactFX.age;
      const live = age >= 0 && age < 0.46;
      const el = root.current;
      if (el) el.style.opacity = live ? "1" : "0";

      if (live) {
        const kick = Math.exp(-age * 22);
        const mid = Math.exp(-age * 8);
        const late = Math.exp(-age * 3.4);
        if (flash.current) {
          flash.current.style.opacity = String(Math.min(1, kick * 1.15));
        }
        if (fire.current) {
          const bloom = 0.28 + Math.min(age * 3.8, 1.1);
          fire.current.style.opacity = String(0.82 * mid);
          fire.current.style.transform = `translate(-50%, -48%) scale(${bloom})`;
        }
        if (shock.current) {
          shock.current.style.opacity = String(0.55 * late * (age < 0.08 ? age / 0.08 : 1));
          shock.current.style.transform = `translate(-50%, -46%) scale(${1 + age * 6.5})`;
        }
      }

      id = window.requestAnimationFrame(tick);
    };
    id = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(id);
  }, []);

  return (
    <div ref={root} className="impact-overlay" aria-hidden>
      <div ref={flash} className="impact-flash" />
      <div ref={fire} className="impact-fire" />
      <div ref={shock} className="impact-shock" />
    </div>
  );
}
