"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Sky({ reducedMotion }: { reducedMotion: boolean }) {
  const moon = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!moon.current || reducedMotion) return;
    moon.current.position.y = 7.4 + Math.sin(state.clock.elapsedTime * 0.35) * 0.08;
  });

  return (
    <group ref={moon} position={[-6.8, 7.4, -7.2]}>
      <mesh>
        <sphereGeometry args={[0.85, 12, 12]} />
        <meshBasicMaterial color="#e8eef8" />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.45, 12, 12]} />
        <meshBasicMaterial color="#c5d4f0" transparent opacity={0.22} depthWrite={false} />
      </mesh>
      <pointLight color="#c5d4f0" intensity={1.8} distance={18} decay={2} />
    </group>
  );
}
