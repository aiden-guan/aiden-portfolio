"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Sky({ reducedMotion }: { reducedMotion: boolean }) {
  const moon = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!moon.current || reducedMotion) return;
    moon.current.position.y = 16 + Math.sin(state.clock.elapsedTime * 0.35) * 0.12;
  });

  return (
    <group ref={moon} position={[-16, 16, -18]}>
      <mesh>
        <sphereGeometry args={[2.15, 24, 24]} />
        <meshBasicMaterial color="#e8eef8" fog={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[3.6, 24, 24]} />
        <meshBasicMaterial
          color="#c5d4f0"
          transparent
          opacity={0.2}
          depthWrite={false}
          fog={false}
        />
      </mesh>
      <pointLight color="#c5d4f0" intensity={2.1} distance={42} decay={2} />
    </group>
  );
}
