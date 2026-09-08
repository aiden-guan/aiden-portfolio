"use client";

import { useEffect } from "react";
import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { InspectSubject } from "@/lib/content";
import { mailbox, relics } from "@/lib/content";
import {
  canInspect,
  canOrbit,
  cutsceneClock,
  HERO_CAMERA_POSITION,
  HERO_CAMERA_TARGET,
  IDLE_STAND,
  isCinematic,
  PHASE_DURATION,
  type CursorKind,
  type CutscenePhase,
} from "@/lib/cutscene";
import {
  beginMeadowPointer,
  endMeadowPointer,
  FOUNDER_RADIUS,
  MAIL_RADIUS,
  moveMeadowPointer,
  REVEAL_RADIUS,
} from "@/lib/meadow-mouse";
import { Clearing } from "@/components/scene/Clearing";
import { CutsceneDirector } from "@/components/scene/CutsceneDirector";
import { Forest } from "@/components/scene/Forest";
import { Founder } from "@/components/scene/Founder";
import { GrassField } from "@/components/scene/GrassField";
import { Ground } from "@/components/scene/Ground";
import { HoverTracker } from "@/components/scene/HoverTracker";
import { MeadowLaptop } from "@/components/scene/MacBook";
import { Pixelation } from "@/components/scene/Pixelation";
import { Rain } from "@/components/scene/Rain";
import { Relics } from "@/components/scene/Relics";
import { Sky } from "@/components/scene/Sky";

function MeadowLook({
  reducedMotion,
  phase,
}: {
  reducedMotion: boolean;
  phase: CutscenePhase;
}) {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    const el = gl.domElement;
    const onDown = (event: PointerEvent) => {
      beginMeadowPointer(event.clientX, event.clientY);
    };
    const onMove = (event: PointerEvent) => {
      moveMeadowPointer(event.clientX, event.clientY);
    };
    const onUp = () => {
      endMeadowPointer();
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, [gl]);

  useFrame((state, delta) => {
    const controls = state.controls as unknown as {
      enabled: boolean;
      target: THREE.Vector3;
      update: () => void;
    } | undefined;
    if (controls) controls.enabled = canOrbit(phase);
    if (!isCinematic(phase) || !controls) return;
    const k = 1 - Math.exp(-delta * 3.2);
    state.camera.position.lerp(HERO_CAMERA_POSITION, k);
    controls.target.lerp(HERO_CAMERA_TARGET, k);
    controls.update();

    if (phase === "impact" && !reducedMotion) {
      const t = cutsceneClock.t;
      const u = THREE.MathUtils.clamp(t / PHASE_DURATION.impact, 0, 1);
      const decay = Math.exp(-u * 6.4);
      const kick = Math.exp(-u * 16);
      state.camera.position.x +=
        (Math.sin(t * 67.1 + 0.8) * 0.18 + Math.sin(t * 103.4) * 0.07) * decay;
      state.camera.position.y +=
        (Math.sin(t * 79.3 + 1.7) * 0.1 + Math.sin(t * 121.8) * 0.045) * decay - kick * 0.07;
      state.camera.position.z +=
        (Math.sin(t * 54.6 + 0.4) * 0.14 + Math.sin(t * 91.2) * 0.055) * decay;
      state.camera.rotation.z +=
        (Math.sin(t * 58.4 + 1.1) * 0.012 + Math.sin(t * 88.7) * 0.005) * decay;
      state.camera.rotation.x += Math.sin(t * 46.2 + 2.2) * 0.007 * decay;
    }
  });

  return (
    <OrbitControls
      makeDefault
      enablePan={false}
      enabled={canOrbit(phase)}
      enableDamping={!reducedMotion && canOrbit(phase)}
      dampingFactor={0.08}
      minPolarAngle={0.62}
      maxPolarAngle={Math.PI / 2.05}
      minDistance={11}
      maxDistance={32}
      target={[HERO_CAMERA_TARGET.x, HERO_CAMERA_TARGET.y, HERO_CAMERA_TARGET.z]}
      rotateSpeed={0.62}
      zoomSpeed={0.65}
    />
  );
}

export function MeadowScene({
  reducedMotion,
  phase,
  discovered,
  onPhase,
  onInspect,
  onDiscover,
  onHover,
}: {
  reducedMotion: boolean;
  phase: CutscenePhase;
  discovered: string[];
  onPhase: (phase: CutscenePhase) => void;
  onInspect: (subject: InspectSubject) => void;
  onDiscover: (id: string) => void;
  onHover: (kind: CursorKind) => void;
}) {
  const playable = canInspect(phase);

  return (
    <>
      <Pixelation />
      <CutsceneDirector phase={phase} onPhase={onPhase} />
      <MeadowLook reducedMotion={reducedMotion} phase={phase} />
      <color attach="background" args={["#0b1522"]} />
      <fog attach="fog" args={["#0f1c28", 34, 96]} />
      <hemisphereLight args={["#3a5078", "#0a120e", 0.78]} />
      <directionalLight position={[-8, 14, -4]} intensity={0.95} color="#d0dcf0" />
      <directionalLight position={[10, 6, 8]} intensity={0.28} color="#6a7a98" />
      <ambientLight intensity={0.2} />
      <Sky reducedMotion={reducedMotion} />
      <Ground
        phase={phase}
        onStartCutscene={() => onPhase("falling")}
        onProbe={(point) => {
          if (!playable) return;
          for (const relic of relics) {
            const dist = Math.hypot(
              point.x - relic.position[0],
              point.z - relic.position[2],
            );
            if (dist < REVEAL_RADIUS) {
              onInspect({ type: "relic", id: relic.id });
              onDiscover(relic.id);
              return;
            }
          }
          if (Math.hypot(point.x - IDLE_STAND.x, point.z - IDLE_STAND.z) < FOUNDER_RADIUS) {
            onInspect({ type: "about" });
            return;
          }
          if (
            Math.hypot(
              point.x - mailbox.position[0],
              point.z - mailbox.position[2],
            ) < MAIL_RADIUS
          ) {
            onInspect({ type: "contact" });
          }
        }}
      />
      <GrassField reducedMotion={reducedMotion} phase={phase} />
      <Forest />
      <Clearing
        phase={phase}
        reducedMotion={reducedMotion}
        onStartCutscene={() => onPhase("falling")}
      />
      <Founder
        onInspect={onInspect}
        reducedMotion={reducedMotion}
        phase={phase}
        interactive={playable}
      />
      <MeadowLaptop phase={phase} reducedMotion={reducedMotion} />
      <Relics
        discovered={discovered}
        interactive={playable}
        onInspect={onInspect}
        onDiscover={onDiscover}
        reducedMotion={reducedMotion}
      />
      <Rain reducedMotion={reducedMotion} />
      <HoverTracker phase={phase} onHover={onHover} onDiscover={onDiscover} />
    </>
  );
}
