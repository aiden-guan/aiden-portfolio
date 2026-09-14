"use client";

import { Component, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import type { InspectSubject } from "@/lib/content";
import {
  heroCameraPosition,
  heroCameraFov,
  HERO_CAMERA_TARGET,
  type CursorKind,
  type CutscenePhase,
} from "@/lib/cutscene";
import { freezeMeadowProbe, meadowPointer, resetMeadowProbe } from "@/lib/meadow-mouse";
import { isCoarsePointer, isCompactScene } from "@/lib/device";
import { MeadowScene } from "@/components/scene/MeadowScene";

class SceneErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="meadow-boot">
          <p>the meadow stumbled. refresh the page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export function MeadowCanvas({
  reducedMotion,
  phase,
  onPhase,
  onInspect,
  onDiscover,
  onHover,
}: {
  reducedMotion: boolean;
  phase: CutscenePhase;
  onPhase: (phase: CutscenePhase) => void;
  onInspect: (subject: InspectSubject) => void;
  onDiscover: (id: string) => void;
  onHover: (kind: CursorKind) => void;
}) {
  const [device] = useState(() => ({
    coarse: isCoarsePointer(),
    compact: isCompactScene(),
  }));
  const start = heroCameraPosition(device.compact);
  const fov = heroCameraFov(device.compact);
  const [rendererKey, setRendererKey] = useState(0);

  return (
    <SceneErrorBoundary>
      <Canvas
        key={rendererKey}
        flat
        dpr={device.coarse ? [1, 1.5] : [1, 2]}
        camera={{
          fov,
          position: [start.x, start.y, start.z],
          near: 0.1,
          far: 180,
        }}
        style={{ background: "#0b1522" }}
        onCreated={({ camera, gl }) => {
          const cam = camera as THREE.PerspectiveCamera;
          const w = gl.domElement.clientWidth || 1;
          const h = gl.domElement.clientHeight || 1;
          cam.fov = fov;
          cam.aspect = w / h;
          cam.updateProjectionMatrix();
          camera.lookAt(HERO_CAMERA_TARGET);
          gl.setClearColor("#0b1522", 1);
          gl.domElement.style.imageRendering = "auto";
          gl.toneMapping = THREE.NoToneMapping;
          gl.domElement.addEventListener("webglcontextlost", () => {
            setRendererKey((n) => n + 1);
          });
        }}
        gl={{
          antialias: !device.coarse,
          alpha: false,
          powerPreference: "high-performance",
        }}
        className="meadow-canvas"
        role="application"
        tabIndex={0}
        aria-label="Night meadow. Find the empty clearing, then show the work around."
        onPointerEnter={() => {
          if (!isCoarsePointer()) meadowPointer.armed = true;
        }}
        onPointerLeave={() => {
          if (isCoarsePointer()) {
            freezeMeadowProbe();
            return;
          }
          resetMeadowProbe();
        }}
      >
        <MeadowScene
          reducedMotion={reducedMotion}
          phase={phase}
          onPhase={onPhase}
          onInspect={onInspect}
          onDiscover={onDiscover}
          onHover={onHover}
        />
      </Canvas>
    </SceneErrorBoundary>
  );
}
