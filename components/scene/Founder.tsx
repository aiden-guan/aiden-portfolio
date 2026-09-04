"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { InspectSubject } from "@/lib/content";
import { isInspectClick, meadowMouse } from "@/lib/meadow-mouse";

const CODE_COUNT = 36;

function CodeParticles({ reducedMotion }: { reducedMotion: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => {
    return Array.from({ length: CODE_COUNT }, (_, i) => ({
      x: (i % 4) * 0.07 - 0.12,
      y: (i * 0.17) % 1.15,
      z: ((i * 11) % 4) * 0.05 - 0.08,
      speed: 0.62 + (i % 5) * 0.18,
      spin: 1.1 + (i % 4) * 0.4,
      scale: 0.05 + (i % 3) * 0.018,
      glyph: i % 2 === 0,
    }));
  }, []);

  const palette = useMemo(
    () => [
      new THREE.Color("#b6f06a"),
      new THREE.Color("#e8ffb0"),
      new THREE.Color("#8fe0ff"),
      new THREE.Color("#f4ead5"),
    ],
    [],
  );

  useLayoutEffect(() => {
    const instance = mesh.current;
    if (!instance) return;
    instance.raycast = () => {};
    if (!instance.instanceColor) {
      instance.instanceColor = new THREE.InstancedBufferAttribute(
        new Float32Array(CODE_COUNT * 3),
        3,
      );
    }
  }, []);

  useFrame((state, delta) => {
    const instance = mesh.current;
    if (!instance) return;
    const t = state.clock.elapsedTime;
    particles.forEach((p, i) => {
      if (!reducedMotion) p.y += p.speed * delta;
      if (p.y > 1.2) p.y = 0;
      dummy.position.set(
        p.x + Math.sin(t * p.spin + i) * 0.04,
        p.y,
        p.z + Math.cos(t * p.spin * 0.7 + i) * 0.03,
      );
      dummy.rotation.set(0, t * p.spin, 0);
      const s = p.scale * (reducedMotion ? 0.75 : 1);
      dummy.scale.set(p.glyph ? s * 0.45 : s, s, p.glyph ? s * 1.8 : s);
      dummy.updateMatrix();
      instance.setMatrixAt(i, dummy.matrix);
      instance.setColorAt(i, palette[i % palette.length]);
    });
    instance.instanceMatrix.needsUpdate = true;
    if (instance.instanceColor) instance.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, CODE_COUNT]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial toneMapped={false} transparent opacity={0.92} />
    </instancedMesh>
  );
}

function VoxelFounder({
  onInspect,
  reducedMotion,
}: {
  onInspect: (subject: InspectSubject) => void;
  reducedMotion: boolean;
}) {
  const head = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Mesh>(null);
  const rightArm = useRef<THREE.Mesh>(null);
  const screen = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!reducedMotion) {
      if (leftArm.current) leftArm.current.rotation.x = Math.sin(t * 11) * 0.18;
      if (rightArm.current) rightArm.current.rotation.x = Math.sin(t * 11 + 0.8) * 0.18;
    }
    if (screen.current) {
      screen.current.emissiveIntensity = 1.35 + Math.sin(t * 5.2) * 0.28;
    }
    if (head.current) {
      const target = THREE.MathUtils.clamp(meadowMouse.x * 0.12, -0.4, 0.4);
      head.current.rotation.y = THREE.MathUtils.lerp(
        head.current.rotation.y,
        target,
        0.08,
      );
    }
  });

  return (
    <group
      position={[0, 0, 0]}
      onClick={(event) => {
        event.stopPropagation();
        if (!isInspectClick()) return;
        onInspect({ type: "about" });
      }}
      onPointerOver={(event) => event.stopPropagation()}
    >
      <pointLight
        position={[0, 1.35, 0.95]}
        color="#b6f06a"
        intensity={reducedMotion ? 2.4 : 4.2}
        distance={10}
        decay={2}
      />

      <group scale={2.85}>
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.72, 12]} />
          <meshBasicMaterial color="#0c140e" transparent opacity={0.55} />
        </mesh>

        <mesh position={[0, 0.24, 0.04]}>
          <boxGeometry args={[0.48, 0.5, 0.3]} />
          <meshStandardMaterial color="#5a7aad" roughness={0.75} />
        </mesh>

        <group ref={head} position={[0, 0.62, 0.04]}>
          <mesh>
            <boxGeometry args={[0.3, 0.3, 0.26]} />
            <meshStandardMaterial color="#f0c49a" roughness={0.7} emissive="#3a2414" emissiveIntensity={0.35} />
          </mesh>
          <mesh position={[0, 0.14, 0]}>
            <boxGeometry args={[0.32, 0.14, 0.28]} />
            <meshStandardMaterial color="#1a2f1c" roughness={1} />
          </mesh>
          <mesh position={[-0.07, 0.04, 0.14]}>
            <boxGeometry args={[0.06, 0.06, 0.04]} />
            <meshStandardMaterial color="#1a2f1c" />
          </mesh>
          <mesh position={[0.07, 0.04, 0.14]}>
            <boxGeometry args={[0.06, 0.06, 0.04]} />
            <meshStandardMaterial color="#1a2f1c" />
          </mesh>
        </group>

        <mesh position={[-0.26, 0.1, 0.16]} rotation={[0.2, 0, 0.4]}>
          <boxGeometry args={[0.18, 0.16, 0.4]} />
          <meshStandardMaterial color="#2c3a2e" roughness={1} />
        </mesh>
        <mesh position={[0.26, 0.1, 0.16]} rotation={[0.2, 0, -0.4]}>
          <boxGeometry args={[0.18, 0.16, 0.4]} />
          <meshStandardMaterial color="#2c3a2e" roughness={1} />
        </mesh>

        <mesh ref={leftArm} position={[-0.32, 0.34, 0.22]} rotation={[0.9, 0, 0.2]}>
          <boxGeometry args={[0.1, 0.1, 0.36]} />
          <meshStandardMaterial color="#f0c49a" roughness={0.8} />
        </mesh>
        <mesh ref={rightArm} position={[0.32, 0.34, 0.22]} rotation={[0.9, 0, -0.2]}>
          <boxGeometry args={[0.1, 0.1, 0.36]} />
          <meshStandardMaterial color="#f0c49a" roughness={0.8} />
        </mesh>

        <group position={[0, 0.36, 0.38]} rotation={[-0.38, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.56, 0.04, 0.38]} />
            <meshStandardMaterial color="#c45c26" roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.18, -0.15]} rotation={[0.95, 0, 0]}>
            <boxGeometry args={[0.56, 0.34, 0.04]} />
            <meshStandardMaterial
              ref={screen}
              color="#07140c"
              emissive="#b6f06a"
              emissiveIntensity={1.4}
              roughness={0.25}
            />
          </mesh>
        </group>
      </group>

      <group position={[0, 1.55, 1.15]}>
        <CodeParticles reducedMotion={reducedMotion} />
      </group>
    </group>
  );
}

export function Founder({
  onInspect,
  reducedMotion,
}: {
  onInspect: (subject: InspectSubject) => void;
  reducedMotion: boolean;
}) {
  return <VoxelFounder onInspect={onInspect} reducedMotion={reducedMotion} />;
}
