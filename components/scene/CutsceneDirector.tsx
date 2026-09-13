"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  cutsceneClock,
  grassPulse,
  impactFX,
  LAPTOP_FALL_Y,
  LAPTOP_STRIKE,
  PHASE_DURATION,
  PHASE_NEXT,
  resetImpactFX,
  strikeImpact,
  type CutscenePhase,
} from "@/lib/cutscene";

function fallingHeight(u: number) {
  const drop = 0.18 * u + 0.82 * u * u * u;
  return THREE.MathUtils.lerp(LAPTOP_FALL_Y, LAPTOP_STRIKE.y, drop);
}

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

    if (phase === "playable" && cutsceneClock.phase !== "playable") {
      cutsceneClock.phase = "playable";
      cutsceneClock.t = 0;
      armed.current = "playable";
    } else if (phase === "falling" && cutsceneClock.phase === "awaiting") {
      cutsceneClock.phase = "falling";
      cutsceneClock.t = 0;
      resetImpactFX();
      armed.current = "falling";
    } else if (phase === "awaiting" && cutsceneClock.phase !== "awaiting") {
      cutsceneClock.phase = "awaiting";
      cutsceneClock.t = 0;
      resetImpactFX();
      armed.current = "awaiting";
    }

    const freeze = impactFX.age >= 0 && impactFX.age < 0.048;
    const sim = freeze ? dt * 0.07 : dt;

    cutsceneClock.t += sim;
    if (impactFX.age >= 0) impactFX.age += dt;

    if (cutsceneClock.phase === "falling" && impactFX.age < 0) {
      const u = THREE.MathUtils.clamp(cutsceneClock.t / PHASE_DURATION.falling, 0, 1);
      if (fallingHeight(u) <= LAPTOP_STRIKE.y + 0.22) strikeImpact();
    }

    if (impactFX.age >= 0 && impactFX.age < 1.15) {
      grassPulse.x = 0;
      grassPulse.z = 0;
      grassPulse.radius = 1.2 + impactFX.age * 18;
      grassPulse.strength = Math.exp(-impactFX.age * 2.05);
    } else {
      grassPulse.strength = THREE.MathUtils.damp(grassPulse.strength, 0, 3.2, dt);
    }

    const clockPhase = cutsceneClock.phase;
    const duration = PHASE_DURATION[clockPhase];
    const next = PHASE_NEXT[clockPhase];
    if (
      next &&
      Number.isFinite(duration) &&
      cutsceneClock.t >= duration &&
      armed.current === clockPhase
    ) {
      armed.current = next;
      cutsceneClock.phase = next;
      cutsceneClock.t = 0;
      if (next === "impact") strikeImpact();
      onPhase(next);
    }
  });

  return null;
}
