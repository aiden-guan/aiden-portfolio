"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  CRATER,
  craterAmount,
  cutsceneClock,
  impactFX,
  type CutscenePhase,
} from "@/lib/cutscene";
import { isInspectClick, meadowMouse, meadowPointer } from "@/lib/meadow-mouse";

const DIRT_COUNT = 42;
const ROCK_COUNT = 18;
const EMBER_COUNT = 32;
const DUST_COUNT = 18;
const STREAK_COUNT = 14;

type Chunk = {
  x: number;
  y: number;
  z: number;
  pos: THREE.Vector3;
  spin: THREE.Vector3;
  size: number;
};

function seedChunks(count: number, speed: number, lift: number): Chunk[] {
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2 + (i % 5) * 0.19;
    const rise = lift + (i % 7) * 0.42;
    const rush = speed + (i % 9) * 0.38;
    return {
      x: Math.cos(a) * rush * (0.65 + (i % 4) * 0.18),
      y: rise,
      z: Math.sin(a) * rush * (0.65 + ((i * 3) % 4) * 0.16),
      pos: new THREE.Vector3(),
      spin: new THREE.Vector3((i % 5) * 4.2, (i % 3) * 3.1, (i % 7) * 2.4),
      size: 0.08 + (i % 6) * 0.04,
    };
  });
}

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
  const core = useRef<THREE.PointLight>(null);
  const sparks = useRef<THREE.InstancedMesh>(null);
  const dirt = useRef<THREE.InstancedMesh>(null);
  const rocks = useRef<THREE.InstancedMesh>(null);
  const embers = useRef<THREE.InstancedMesh>(null);
  const dust = useRef<THREE.InstancedMesh>(null);
  const streaks = useRef<THREE.InstancedMesh>(null);
  const fireball = useRef<THREE.Mesh>(null);
  const fireballMat = useRef<THREE.MeshBasicMaterial>(null);
  const glow = useRef<THREE.Mesh>(null);
  const glowMat = useRef<THREE.MeshBasicMaterial>(null);
  const shockA = useRef<THREE.Mesh>(null);
  const shockB = useRef<THREE.Mesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const dirtBits = useMemo(() => seedChunks(DIRT_COUNT, 3.4, 4.6), []);
  const rockBits = useMemo(() => seedChunks(ROCK_COUNT, 2.6, 3.4), []);
  const emberBits = useMemo(() => seedChunks(EMBER_COUNT, 1.7, 5.8), []);
  const dustBits = useMemo(() => seedChunks(DUST_COUNT, 2.2, 1.8), []);
  const streakBits = useMemo(() => seedChunks(STREAK_COUNT, 6.4, 2.2), []);
  const sparkSeeds = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        x: Math.cos((i / 7) * Math.PI * 2) * 0.55,
        z: Math.sin((i / 7) * Math.PI * 2) * 0.55,
        phase: i * 0.7,
        scale: 0.04 + (i % 3) * 0.012,
      })),
    [],
  );
  const rubbleSeeds = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2 + 0.2;
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
  const rubble = useRef<THREE.InstancedMesh>(null);
  const armed = useRef(-2);
  const gravity = useRef({ dirt: 22, rock: 16, ember: 7.5, dust: 5.4 });

  useLayoutEffect(() => {
    if (dirt.current) dirt.current.raycast = () => {};
    if (rocks.current) rocks.current.raycast = () => {};
    if (embers.current) embers.current.raycast = () => {};
    if (dust.current) dust.current.raycast = () => {};
    if (streaks.current) streaks.current.raycast = () => {};
    if (sparks.current) sparks.current.raycast = () => {};
    if (rubble.current) rubble.current.raycast = () => {};
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const amount = craterAmount(cutsceneClock.phase, cutsceneClock.t);
    const age = impactFX.age;
    const struck = age >= 0;
    const punch = struck ? Math.exp(-age * 16) : 0;
    const freeze = struck && age < 0.05;

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
        const grow = reducedMotion ? 1 : 0.86 + Math.min(amount, 1) * 0.14 + punch * 0.28;
        const depth = reducedMotion ? 1 : 0.78 + Math.min(amount, 1) * 0.22 + punch * 0.42;
        craterGroup.scale.set(grow, depth, grow);
      }
    }

    if (heat.current) {
      if (!struck) {
        heat.current.intensity = 0;
      } else {
        heat.current.intensity = 38 * punch + 9 * Math.exp(-age * 2.4);
        heat.current.color.setRGB(
          1,
          THREE.MathUtils.lerp(0.95, 0.32, Math.min(age * 2.2, 1)),
          THREE.MathUtils.lerp(0.72, 0.08, Math.min(age * 1.8, 1)),
        );
      }
    }
    if (core.current) {
      core.current.intensity = struck ? 26 * Math.exp(-age * 28) : 0;
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
      const show = amount > 0.2;
      rubbleMesh.visible = show;
      if (show) {
        const pop = reducedMotion ? 1 : THREE.MathUtils.clamp(amount, 0, 1);
        rubbleSeeds.forEach((piece, i) => {
          dummy.position.set(piece.x, piece.y * pop + punch * 0.12, piece.z);
          dummy.rotation.set(piece.rot, piece.rot * 0.6, piece.rot * 0.3);
          dummy.scale.set(piece.sx * pop, piece.sy * pop, piece.sz * pop);
          dummy.updateMatrix();
          rubbleMesh.setMatrixAt(i, dummy.matrix);
        });
        rubbleMesh.instanceMatrix.needsUpdate = true;
      }
    }

    if (fireball.current && fireballMat.current) {
      const live = struck && age < 0.42 && !reducedMotion;
      fireball.current.visible = live;
      if (live) {
        const grow = 0.35 + Math.min(age * 14, 2.6);
        fireball.current.scale.setScalar(grow);
        fireballMat.current.opacity = Math.max(0, 0.95 * Math.exp(-age * 9));
      }
    }
    if (glow.current && glowMat.current) {
      const live = struck && age < 0.55 && !reducedMotion;
      glow.current.visible = live;
      if (live) {
        glow.current.scale.setScalar(0.8 + age * 7.5);
        glowMat.current.opacity = Math.max(0, 0.55 * Math.exp(-age * 5.5));
      }
    }
    if (shockA.current) {
      const live = struck && age < 0.5 && !reducedMotion;
      shockA.current.visible = live;
      if (live) {
        const s = 0.4 + age * 18;
        shockA.current.scale.set(s, 1, s);
        const mat = shockA.current.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, 0.7 * Math.exp(-age * 6.5));
      }
    }
    if (shockB.current) {
      const live = struck && age > 0.04 && age < 0.62 && !reducedMotion;
      shockB.current.visible = live;
      if (live) {
        const s = 0.8 + (age - 0.04) * 14;
        shockB.current.scale.set(s, 1, s);
        const mat = shockB.current.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, 0.45 * Math.exp(-(age - 0.04) * 5.2));
      }
    }

    if (armed.current !== impactFX.age && impactFX.age >= 0 && armed.current < 0) {
      dirtBits.forEach((piece) => piece.pos.set(0, 0.14, 0));
      rockBits.forEach((piece) => piece.pos.set(0, 0.18, 0));
      emberBits.forEach((piece) => piece.pos.set(0, 0.2, 0));
      dustBits.forEach((piece) => piece.pos.set(0, 0.1, 0));
      streakBits.forEach((piece) => piece.pos.set(0, 0.16, 0));
    }
    armed.current = impactFX.age;

    const burstLive = struck && age < 1.35 && !reducedMotion;
    const sim = freeze ? 0 : delta;

    const stepChunks = (
      mesh: THREE.InstancedMesh | null,
      bits: Chunk[],
      gravityAmt: number,
      life: number,
      stretch = false,
    ) => {
      if (!mesh) return;
      mesh.visible = burstLive;
      if (!burstLive) return;
      bits.forEach((piece, i) => {
        piece.pos.x += piece.x * sim;
        piece.pos.y += piece.y * sim;
        piece.pos.z += piece.z * sim;
        piece.y -= gravityAmt * sim;
        dummy.position.copy(piece.pos);
        dummy.rotation.set(
          time * piece.spin.x + i,
          time * piece.spin.y,
          time * piece.spin.z,
        );
        const fade = Math.max(0, 1 - age / life);
        if (stretch) {
          dummy.scale.set(piece.size * 0.35, piece.size * 0.35, piece.size * (1.4 + fade));
        } else {
          dummy.scale.setScalar(piece.size * fade);
        }
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    };

    stepChunks(dirt.current, dirtBits, gravity.current.dirt, 0.95);
    stepChunks(rocks.current, rockBits, gravity.current.rock, 1.15);
    stepChunks(embers.current, emberBits, gravity.current.ember, 1.35);
    stepChunks(dust.current, dustBits, gravity.current.dust, 1.45);
    stepChunks(streaks.current, streakBits, 3.4, 0.28, true);
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
          position={[0, 0.35, 0]}
          color="#ff9a3c"
          intensity={0}
          distance={14}
          decay={2}
        />
        <pointLight
          ref={core}
          position={[0, 0.12, 0]}
          color="#fff4d8"
          intensity={0}
          distance={7}
          decay={2}
        />
      </group>

      <mesh ref={fireball} visible={false} position={[0, 0.22, 0]}>
        <sphereGeometry args={[1, 18, 14]} />
        <meshBasicMaterial
          ref={fireballMat}
          color="#fff1c4"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={glow} visible={false} position={[0, 0.18, 0]}>
        <sphereGeometry args={[1, 14, 10]} />
        <meshBasicMaterial
          ref={glowMat}
          color="#ff7a28"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={shockA} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} visible={false}>
        <ringGeometry args={[0.72, 0.92, 48]} />
        <meshBasicMaterial
          color="#ffe7c0"
          transparent
          opacity={0}
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={shockB} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0]} visible={false}>
        <ringGeometry args={[0.95, 1.18, 48]} />
        <meshBasicMaterial
          color="#ff8a32"
          transparent
          opacity={0}
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      <instancedMesh ref={sparks} args={[undefined, undefined, 7]} frustumCulled={false} raycast={() => {}}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#e8d5a3" toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={dirt} args={[undefined, undefined, DIRT_COUNT]} frustumCulled={false} visible={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#4a3828" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={rocks} args={[undefined, undefined, ROCK_COUNT]} frustumCulled={false} visible={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#2a2118" roughness={0.85} />
      </instancedMesh>
      <instancedMesh ref={embers} args={[undefined, undefined, EMBER_COUNT]} frustumCulled={false} visible={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#ffb14a" toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={dust} args={[undefined, undefined, DUST_COUNT]} frustumCulled={false} visible={false}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshStandardMaterial color="#6a5340" transparent opacity={0.45} roughness={1} depthWrite={false} />
      </instancedMesh>
      <instancedMesh ref={streaks} args={[undefined, undefined, STREAK_COUNT]} frustumCulled={false} visible={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial
          color="#fff3c8"
          transparent
          opacity={0.85}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </instancedMesh>
      <instancedMesh ref={rubble} args={[undefined, undefined, 14]} frustumCulled={false} visible={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#4a3a28" roughness={1} />
      </instancedMesh>
    </group>
  );
}
