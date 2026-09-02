"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mailbox, relics } from "@/lib/content";
import {
  FOUNDER_RADIUS,
  MAIL_RADIUS,
  meadowMouse,
  REVEAL_RADIUS,
} from "@/lib/meadow-mouse";

const relicPoints = relics.map(
  (relic) => new THREE.Vector3(relic.position[0], 0, relic.position[2]),
);
const mailPoint = new THREE.Vector3(
  mailbox.position[0],
  0,
  mailbox.position[2],
);

export function HoverTracker({
  onHover,
  onDiscover,
}: {
  onHover: (kind: "grass" | "hot") => void;
  onDiscover: (id: string) => void;
}) {
  const last = useRef<"grass" | "hot">("grass");
  const seen = useRef(new Set<string>());

  useFrame(() => {
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
    if (Math.hypot(meadowMouse.x, meadowMouse.z) < FOUNDER_RADIUS) hot = true;
    if (meadowMouse.distanceTo(mailPoint) < MAIL_RADIUS) hot = true;

    const kind = hot ? "hot" : "grass";
    if (kind !== last.current) {
      last.current = kind;
      onHover(kind);
    }
  });

  return null;
}
