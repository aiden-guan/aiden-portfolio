"use client";

import { Component, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import type { InspectSubject } from "@/lib/content";
import {
  HERO_CAMERA_POSITION,
  HERO_CAMERA_TARGET,
  type CursorKind,
  type CutscenePhase,
} from "@/lib/cutscene";
import { meadowMouse, meadowPointer } from "@/lib/meadow-mouse";
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
  return (
    <SceneErrorBoundary>
      <Canvas
        flat
        dpr={[1, 2]}
        camera={{
          fov: 42,
          position: [HERO_CAMERA_POSITION.x, HERO_CAMERA_POSITION.y, HERO_CAMERA_POSITION.z],
          near: 0.1,
          far: 180,
        }}
        style={{ background: "#0b1522" }}
        onCreated={({ camera, gl }) => {
          camera.lookAt(HERO_CAMERA_TARGET);
          gl.setClearColor("#0b1522", 1);
          gl.domElement.style.imageRendering = "auto";
          gl.toneMapping = THREE.NoToneMapping;
          gl.domElement.addEventListener("webglcontextlost", (event) => {
            event.preventDefault();
          });
        }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        className="meadow-canvas"
        role="application"
        tabIndex={0}
        aria-label="Night meadow. Find the empty clearing, then show the work around."
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
          phase={phase}
          discovered={discovered}
          onPhase={onPhase}
          onInspect={onInspect}
          onDiscover={onDiscover}
          onHover={onHover}
        />
      </Canvas>
    </SceneErrorBoundary>
  );
}
