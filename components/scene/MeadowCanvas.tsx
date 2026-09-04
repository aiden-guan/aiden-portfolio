"use client";

import { Canvas } from "@react-three/fiber";
import type { InspectSubject } from "@/lib/content";
import { meadowMouse, meadowPointer } from "@/lib/meadow-mouse";
import { MeadowScene } from "@/components/scene/MeadowScene";

export function MeadowCanvas({
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
    <Canvas
      flat
      dpr={[1, 2]}
      camera={{ fov: 50, position: [9.5, 4.8, 13.2], near: 0.1, far: 110 }}
      onCreated={({ camera }) => {
        camera.lookAt(0, 0.55, 0);
      }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      className="meadow-canvas"
      role="application"
      tabIndex={0}
      aria-label="Night meadow. Drag to look around, part the grass to find buried work."
      onPointerEnter={() => {
        meadowPointer.armed = true;
      }}
      onPointerMove={() => {
        meadowPointer.armed = true;
      }}
      onPointerLeave={() => {
        meadowPointer.armed = false;
        meadowMouse.set(80, 0, 80);
      }}
    >
      <MeadowScene
        reducedMotion={reducedMotion}
        discovered={discovered}
        onInspect={onInspect}
        onDiscover={onDiscover}
        onHover={onHover}
      />
    </Canvas>
  );
}
