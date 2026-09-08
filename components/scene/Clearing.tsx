"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  CRATER,
  craterAmount,
  cutsceneClock,
  PHASE_DURATION,
  type CutscenePhase,
} from "@/lib/cutscene";
import { isInspectClick, meadowMouse, meadowPointer } from "@/lib/meadow-mouse";

const DIRT_COUNT = 28;
const RUBBLE_COUNT = 14;
const SPARK_COUNT = 7;

export function Clearing({
  phase,
  reducedMotion,
  onStartCutscene,
}: {
  phase: CutscenePhase;
  reducedMotion: boolean;
  onStartCutscene: () => void;
}) {
  const ring = useRef<THREE.MeshBasicMaterial>(null);
  const patch = useRef<THREE.Group>(null);
  const crater = useRef<THREE.Group>(null);
  const heat = useRef<THREE.PointLight>(null);
  const sparks = useRef<THREE.InstancedMesh>(null);
  const dirt = useRef<THREE.InstancedMesh>(null);
  const rubble = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const velocities = useMemo(
    () =>
      Array.from({ length: DIRT_COUNT }, (_, i) => {
        const a = (i / DIRT_COUNT) * Math.PI * 2 + (i % 3) * 0.17;
        const speed = 1.35 + (i % 6) * 0.28;
        return {
          x: Math.cos(a) * speed,
          y: 2.1 + (i % 5) * 0.55,
          z: Math.sin(a) * speed,
          pos: new THREE.Vector3(),
        };
      }),
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
  const rubbleSeeds = useMemo(
    () =>
      Array.from({ length: RUBBLE_COUNT }, (_, i) => {
        const a = (i / RUBBLE_COUNT) * Math.PI * 2 + 0.2;
        const r = CRATER.rim + (i % 4) * 0.12 - 0.08;
        return {
          x: Math.cos(a) * r,
          z: Math.sin(a) * r,
          y: CRATER.rimHeight * 0.45 + (i % 3) * 0.03,
          sx: 0.12 + (i % 5) * 0.04,
          sy: 0.07 + (i % 3) * 0.03,
          sz: 0.1 + (i % 4) * 0.03,
          rot: (i * 0.73) % Math.PI,
        };
      }),
    [],
  );
  const burstPhase = useRef("");
  const dirtAge = useRef(0);

  useLayoutEffect(() => {
    if (dirt.current) dirt.current.raycast = () => {};
    if (sparks.current) sparks.current.raycast = () => {};
    if (rubble.current) rubble.current.raycast = () => {};
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const amount = craterAmount(phase, cutsceneClock.t);
    const impactU =
      phase === "impact"
        ? THREE.MathUtils.clamp(cutsceneClock.t / PHASE_DURATION.impact, 0, 1)
        : amount;
    const punch = phase === "impact" ? Math.sin(Math.min(impactU, 1) * Math.PI) : 0;

    if (ring.current) {
      const pulse = phase === "awaiting" ? 0.18 + Math.sin(time * 2.2) * 0.1 : 0.06;
      ring.current.opacity = reducedMotion && phase === "awaiting" ? 0.22 : pulse;
    }
    if (patch.current) patch.current.visible = amount < 0.35;

    const craterGroup = crater.current;
    if (craterGroup) {
      const show = amount > 0.001;
      craterGroup.visible = show;
      if (show) {
        const grow = reducedMotion ? 1 : 0.72 + amount * 0.28 + punch * 0.14;
        const depth = reducedMotion ? 1 : 0.35 + amount * 0.65 + punch * 0.22;
        craterGroup.scale.set(grow, depth, grow);
      }
    }
    if (heat.current) {
      heat.current.intensity = phase === "impact" ? (1 - impactU) * 6.5 + punch * 3.2 : 0;
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

    const rubbleMesh = rubble.current;
    if (rubbleMesh) {
      const show = amount > 0.45;
      rubbleMesh.visible = show;
      if (show) {
        const pop = reducedMotion ? 1 : THREE.MathUtils.clamp((amount - 0.45) / 0.4, 0, 1);
        rubbleSeeds.forEach((piece, i) => {
          dummy.position.set(piece.x, piece.y * pop, piece.z);
          dummy.rotation.set(piece.rot, piece.rot * 0.6, piece.rot * 0.3);
          dummy.scale.set(piece.sx * pop, piece.sy * pop, piece.sz * pop);
          dummy.updateMatrix();
          rubbleMesh.setMatrixAt(i, dummy.matrix);
        });
        rubbleMesh.instanceMatrix.needsUpdate = true;
      }
    }

    const dirtMesh = dirt.current;
    if (dirtMesh) {
      if (burstPhase.current !== phase) {
        burstPhase.current = phase;
        if (phase === "impact") {
          dirtAge.current = 0;
          velocities.forEach((piece) => piece.pos.set(0, 0.16, 0));
        }
      }
      const live = phase === "impact" || (phase === "walkIn" && dirtAge.current < 0.9);
      dirtMesh.visible = live;
      if (live) {
        dirtAge.current += delta;
        velocities.forEach((piece, i) => {
          piece.pos.x += piece.x * delta * 2.15;
          piece.pos.y += piece.y * delta;
          piece.pos.z += piece.z * delta;
          piece.y -= 11 * delta;
          dummy.position.copy(piece.pos);
          dummy.rotation.set(time * 5 + i, time * 3.4, i);
          dummy.scale.setScalar(Math.max(0, 0.2 - dirtAge.current * 0.18));
          dummy.updateMatrix();
          dirtMesh.setMatrixAt(i, dummy.matrix);
        });
        dirtMesh.instanceMatrix.needsUpdate = true;
      }
    }
  });

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.06, 0]}
        visible={phase === "awaiting"}
        onPointerMove={(event) => {
          meadowPointer.armed = true;
          meadowMouse.set(event.point.x, 0, event.point.z);
        }}
        onClick={(event) => {
          meadowPointer.armed = true;
          meadowMouse.set(event.point.x, 0, event.point.z);
          event.stopPropagation();
          if (!isInspectClick()) return;
          onStartCutscene();
        }}
      >
        <circleGeometry args={[2.7, 16]} />
          <meshBasicMaterial transparent opacity={0.001} depthWrite={false} />
      </mesh>
      <group ref={patch}>
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
      </group>

      <group ref={crater} visible={false}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -CRATER.depth, 0]} raycast={() => {}}>
          <circleGeometry args={[CRATER.floor, 24]} />
          <meshStandardMaterial color="#030201" roughness={1} />
        </mesh>
        <mesh position={[0, -CRATER.depth * 0.5 + 0.04, 0]} raycast={() => {}}>
          <cylinderGeometry
            args={[CRATER.wall, CRATER.floor * 0.92, CRATER.depth + 0.08, 32, 1, true]}
          />
          <meshStandardMaterial color="#1c120c" roughness={1} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, CRATER.rimHeight * 0.28, 0]} raycast={() => {}}>
          <torusGeometry args={[(CRATER.wall + CRATER.rim) * 0.5, 0.34, 10, 36]} />
          <meshStandardMaterial color="#8a6240" roughness={1} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} raycast={() => {}}>
          <ringGeometry args={[CRATER.rim * 0.92, CRATER.outer, 40]} />
          <meshStandardMaterial color="#4a3a24" roughness={1} side={THREE.DoubleSide} />
        </mesh>
        <pointLight
          ref={heat}
          position={[0, 0.2, 0]}
          color="#ff7a32"
          intensity={0}
          distance={9}
          decay={2}
        />
      </group>

      <instancedMesh ref={sparks} args={[undefined, undefined, SPARK_COUNT]} frustumCulled={false} raycast={() => {}}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#e8d5a3" toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={dirt} args={[undefined, undefined, DIRT_COUNT]} frustumCulled={false} visible={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#4a3828" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={rubble} args={[undefined, undefined, RUBBLE_COUNT]} frustumCulled={false} visible={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#4a3a28" roughness={1} />
      </instancedMesh>
    </group>
  );
}
