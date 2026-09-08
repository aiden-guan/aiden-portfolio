"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mailbox, relics } from "@/lib/content";
import { canInspect, founderOnStage, type CursorKind, type CutscenePhase } from "@/lib/cutscene";
import {
  FOUNDER_RADIUS,
  MAIL_RADIUS,
  meadowMouse,
  PATCH_RADIUS,
  REVEAL_RADIUS,
} from "@/lib/meadow-mouse";

export function HoverTracker({
  phase,
  onHover,
  onDiscover,
}: {
  phase: CutscenePhase;
  onHover: (kind: CursorKind) => void;
  onDiscover: (id: string) => void;
}) {
  const last = useRef<CursorKind>("grass");
  const seen = useRef(new Set<string>());
  const relicPoints = useMemo(
    () => relics.map((relic) => new THREE.Vector3(relic.position[0], 0, relic.position[2])),
    [],
  );
  const mailPoint = useMemo(
    () => new THREE.Vector3(mailbox.position[0], 0, mailbox.position[2]),
    [],
  );

  useFrame(() => {
    let kind: CursorKind = "grass";
    if (phase === "awaiting") {
      if (Math.hypot(meadowMouse.x, meadowMouse.z) < PATCH_RADIUS) kind = "exclaim";
    } else if (canInspect(phase)) {
      let hot = false;
      relics.forEach((relic, index) => {
        const dist = meadowMouse.distanceTo(relicPoints[index]);
        if (dist < REVEAL_RADIUS) {
          hot = true;
          if (!seen.current.has(relic.id)) {
            seen.current.add(relic.id);
            onDiscover(relic.id);
          }
        }
      });
      if (founderOnStage(phase) && Math.hypot(meadowMouse.x, meadowMouse.z) < FOUNDER_RADIUS) {
        hot = true;
      }
      if (meadowMouse.distanceTo(mailPoint) < MAIL_RADIUS) hot = true;
      if (hot) kind = "hot";
    }

    if (kind !== last.current) {
      last.current = kind;
      onHover(kind);
    }
  });

  return null;
}
