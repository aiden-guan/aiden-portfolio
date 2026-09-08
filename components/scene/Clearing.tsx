"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { type CutscenePhase } from "@/lib/cutscene";

const DIRT_COUNT = 16;
const SPARK_COUNT = 7;

export function Clearing({
  phase,
  reducedMotion,
}: {
  phase: CutscenePhase;
  reducedMotion: boolean;
}) {
  const ring = useRef<THREE.MeshBasicMaterial>(null);
  const sparks = useRef<THREE.InstancedMesh>(null);
  const dirt = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const velocities = useMemo(
    () =>
      Array.from({ length: DIRT_COUNT }, (_, i) => ({
        x: Math.cos((i / DIRT_COUNT) * Math.PI * 2) * (1.1 + (i % 5) * 0.18),
        y: 1.6 + (i % 4) * 0.45,
        z: Math.sin((i / DIRT_COUNT) * Math.PI * 2) * (1.1 + (i % 3) * 0.2),
        pos: new THREE.Vector3(),
      })),
    [],
  );
  const sparkSeeds = useMemo(
    () =>
      Array.from({ length: SPARK_COUNT }, (_, i) => ({
        x: Math.cos((i / SPARK_COUNT) * Math.PI * 2) * 0.55,
        z: Math.sin((i / SPARK_COUNT) * Math.PI * 2) * 0.55,
        phase: i * 0.7,
        scale: 0.04 + (i % 3) * 0.012,
      })),
    [],
  );
  const burstPhase = useRef("");
  const dirtAge = useRef(0);

  useLayoutEffect(() => {
    if (dirt.current) dirt.current.raycast = () => {};
    if (sparks.current) sparks.current.raycast = () => {};
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    if (ring.current) {
      const pulse = phase === "awaiting" ? 0.18 + Math.sin(time * 2.2) * 0.1 : 0.06;
      ring.current.opacity = reducedMotion && phase === "awaiting" ? 0.22 : pulse;
    }

    const sparkMesh = sparks.current;
    if (sparkMesh) {
      const show = phase === "awaiting";
      sparkMesh.visible = show;
      if (show) {
        sparkSeeds.forEach((seed, i) => {
          dummy.position.set(seed.x, 0.18 + Math.sin(time * 2.4 + seed.phase) * 0.08, seed.z);
          dummy.rotation.set(0, time + i, 0);
          dummy.scale.setScalar(seed.scale);
          dummy.updateMatrix();
          sparkMesh.setMatrixAt(i, dummy.matrix);
        });
        sparkMesh.instanceMatrix.needsUpdate = true;
      }
    }

    const dirtMesh = dirt.current;
    if (dirtMesh) {
      if (burstPhase.current !== phase) {
        burstPhase.current = phase;
        if (phase === "impact") {
          dirtAge.current = 0;
          velocities.forEach((piece) => piece.pos.set(0, 0.12, 0));
        }
      }
      const live = phase === "impact" || (phase === "walkIn" && dirtAge.current < 0.55);
      dirtMesh.visible = live;
      if (live) {
        dirtAge.current += delta;
        velocities.forEach((piece, i) => {
          piece.pos.x += piece.x * delta * 1.8;
          piece.pos.y += piece.y * delta;
          piece.pos.z += piece.z * delta;
          piece.y -= 9 * delta;
          dummy.position.copy(piece.pos);
          dummy.rotation.set(time * 4 + i, time * 3, 0);
          dummy.scale.setScalar(Math.max(0, 0.14 - dirtAge.current * 0.16));
          dummy.updateMatrix();
          dirtMesh.setMatrixAt(i, dummy.matrix);
        });
        dirtMesh.instanceMatrix.needsUpdate = true;
      }
    }
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <circleGeometry args={[1.35, 16]} />
        <meshStandardMaterial color="#1a1712" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[1.28, 1.46, 20]} />
        <meshBasicMaterial ref={ring} color="#c5d4f0" transparent opacity={0.16} toneMapped={false} />
      </mesh>
      <mesh position={[-0.42, 0.04, 0.28]}>
        <boxGeometry args={[0.1, 0.05, 0.08]} />
        <meshStandardMaterial color="#3a3228" roughness={1} />
      </mesh>
      <mesh position={[0.36, 0.035, -0.22]}>
        <boxGeometry args={[0.08, 0.04, 0.1]} />
        <meshStandardMaterial color="#2c281f" roughness={1} />
      </mesh>
      <mesh position={[0.12, 0.03, 0.48]}>
        <boxGeometry args={[0.07, 0.04, 0.06]} />
        <meshStandardMaterial color="#4a4032" roughness={1} />
      </mesh>

      <instancedMesh ref={sparks} args={[undefined, undefined, SPARK_COUNT]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#e8d5a3" toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={dirt} args={[undefined, undefined, DIRT_COUNT]} frustumCulled={false} visible={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#3a3228" roughness={1} />
      </instancedMesh>
    </group>
  );
}
