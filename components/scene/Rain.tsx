"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function rainCount(reducedMotion: boolean) {
  if (typeof window === "undefined") return 400;
  const mobile = window.matchMedia("(max-width: 768px)").matches;
  if (reducedMotion) return 180;
  if (mobile) return 420;
  return 1200;
}

export function Rain({ reducedMotion }: { reducedMotion: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const count = useMemo(() => rainCount(reducedMotion), [reducedMotion]);
  const drops = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 52,
      y: Math.random() * 16,
      z: (Math.random() - 0.5) * 52,
      speed: 9 + Math.random() * 7,
    }));
  }, [count]);

  useFrame((_, delta) => {
    const instance = mesh.current;
    if (!instance) return;
    instance.raycast = () => {};
    const fall = reducedMotion ? 3.2 : 1;
    drops.forEach((drop, i) => {
      drop.y -= drop.speed * fall * delta;
      drop.x -= 1.6 * fall * delta;
      if (drop.y < 0) {
        drop.y = 12 + Math.random() * 6;
        drop.x = (Math.random() - 0.5) * 52;
        drop.z = (Math.random() - 0.5) * 52;
      }
      dummy.position.set(drop.x, drop.y, drop.z);
      dummy.rotation.set(0.35, 0, 0.18);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      instance.setMatrixAt(i, dummy.matrix);
    });
    instance.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <boxGeometry args={[0.03, 0.42, 0.03]} />
      <meshBasicMaterial color="#9eb4c8" transparent opacity={0.55} toneMapped={false} />
    </instancedMesh>
  );
}
