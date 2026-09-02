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
      orthographic
      dpr={1 / 2.2}
      camera={{ position: [10, 15, 10], zoom: 48, near: 0.1, far: 90 }}
      onCreated={({ camera }) => {
        camera.lookAt(0, 0.4, 0);
      }}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
      className="meadow-canvas"
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
