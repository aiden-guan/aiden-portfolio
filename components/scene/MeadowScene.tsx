"use client";

import { useEffect } from "react";
import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import type { InspectSubject } from "@/lib/content";
import { mailbox, relics } from "@/lib/content";
import { Founder } from "@/components/scene/Founder";
import { GrassField } from "@/components/scene/GrassField";
import { Ground } from "@/components/scene/Ground";
import { HoverTracker } from "@/components/scene/HoverTracker";
import { Pixelation } from "@/components/scene/Pixelation";
import { Rain } from "@/components/scene/Rain";
import { Relics } from "@/components/scene/Relics";
import { Sky } from "@/components/scene/Sky";
import {
  beginMeadowPointer,
  endMeadowPointer,
  FOUNDER_RADIUS,
  MAIL_RADIUS,
  moveMeadowPointer,
  REVEAL_RADIUS,
} from "@/lib/meadow-mouse";

function MeadowLook({ reducedMotion }: { reducedMotion: boolean }) {
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

  return (
    <OrbitControls
      makeDefault
      enablePan={false}
      enableDamping={!reducedMotion}
      dampingFactor={0.08}
      minPolarAngle={0.28}
      maxPolarAngle={Math.PI / 2.08}
      minDistance={6.5}
      maxDistance={22}
      target={[0, 0.55, 0]}
      rotateSpeed={0.62}
      zoomSpeed={0.65}
    />
  );
}

export function MeadowScene({
  reducedMotion,
  discovered,
  onInspect,
  onDiscover,
  onHover,
}: {
  reducedMotion: boolean;
  discovered: string[];
  onInspect: (subject: InspectSubject) => void;
  onDiscover: (id: string) => void;
  onHover: (kind: "grass" | "hot") => void;
}) {
  return (
    <>
      <Pixelation />
      <MeadowLook reducedMotion={reducedMotion} />
      <color attach="background" args={["#0b1522"]} />
      <fog attach="fog" args={["#0f1c28", 18, 62]} />
      <hemisphereLight args={["#3a5078", "#0a120e", 0.78]} />
      <directionalLight position={[-8, 14, -4]} intensity={0.95} color="#d0dcf0" />
      <directionalLight position={[10, 6, 8]} intensity={0.28} color="#6a7a98" />
      <ambientLight intensity={0.2} />
      <Sky reducedMotion={reducedMotion} />
      <Ground
        onProbe={(point) => {
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
          if (Math.hypot(point.x, point.z) < FOUNDER_RADIUS) {
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
      <GrassField reducedMotion={reducedMotion} />
      <Founder onInspect={onInspect} reducedMotion={reducedMotion} />
      <Relics
        discovered={discovered}
        onInspect={onInspect}
        onDiscover={onDiscover}
        reducedMotion={reducedMotion}
      />
      <Rain reducedMotion={reducedMotion} />
      <HoverTracker onHover={onHover} onDiscover={onDiscover} />
    </>
  );
}
