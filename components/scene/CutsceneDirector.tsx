"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  cutsceneClock,
  grassPulse,
  PHASE_DURATION,
  PHASE_NEXT,
  type CutscenePhase,
} from "@/lib/cutscene";

export function CutsceneDirector({
  phase,
  onPhase,
}: {
  phase: CutscenePhase;
  onPhase: (phase: CutscenePhase) => void;
}) {
  const armed = useRef(phase);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (cutsceneClock.phase !== phase) {
      cutsceneClock.phase = phase;
      cutsceneClock.t = 0;
      armed.current = phase;
      if (phase === "impact") {
        grassPulse.x = 0;
        grassPulse.z = 0;
        grassPulse.strength = 1;
      }
    }

    cutsceneClock.t += dt;
    grassPulse.strength = THREE.MathUtils.damp(grassPulse.strength, 0, 3.2, dt);

    const duration = PHASE_DURATION[phase];
    const next = PHASE_NEXT[phase];
    if (
      next &&
      Number.isFinite(duration) &&
      cutsceneClock.t >= duration &&
      armed.current === phase
    ) {
      armed.current = next;
      onPhase(next);
    }
  });

  return null;
}
