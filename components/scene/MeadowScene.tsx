"use client";

import { useLayoutEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
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
import { FOUNDER_RADIUS, MAIL_RADIUS, REVEAL_RADIUS } from "@/lib/meadow-mouse";

function MeadowCamera({ reducedMotion }: { reducedMotion: boolean }) {
  const camera = useThree((state) => state.camera) as THREE.OrthographicCamera;
  const pointer = useThree((state) => state.pointer);
  const width = useThree((state) => state.size.width);

  useLayoutEffect(() => {
    camera.position.set(10, 15, 10);
    camera.lookAt(0, 0.4, 0);
    camera.updateProjectionMatrix();
  }, [camera]);

  useFrame(() => {
    const zoom = width < 768 ? 34 : 48;
    camera.zoom = zoom;
    const baseX = 10;
    const baseY = 15;
    const baseZ = 10;
    if (reducedMotion) {
      camera.position.set(baseX, baseY, baseZ);
    } else {
      camera.position.x = THREE.MathUtils.lerp(
        camera.position.x,
        baseX + pointer.x * 0.9,
        0.045,
      );
      camera.position.z = THREE.MathUtils.lerp(
        camera.position.z,
        baseZ - pointer.y * 0.9,
        0.045,
      );
      camera.position.y = baseY;
    }
    camera.lookAt(0, 0.4, 0);
    camera.updateProjectionMatrix();
  });

  return null;
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
      <Pixelation factor={2.2} />
      <MeadowCamera reducedMotion={reducedMotion} />
      <color attach="background" args={["#0b1522"]} />
      <fog attach="fog" args={["#0f1c28", 22, 48]} />
      <hemisphereLight args={["#3a5078", "#0a120e", 0.72]} />
      <directionalLight position={[-8, 14, -4]} intensity={0.72} color="#d0dcf0" />
      <ambientLight intensity={0.22} />
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
