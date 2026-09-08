"use client";

import { useLayoutEffect, useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mailbox, relics, type InspectSubject } from "@/lib/content";
import { isInspectClick, meadowMouse, REVEAL_RADIUS } from "@/lib/meadow-mouse";

type HoverRef = MutableRefObject<number>;

const PIXEL_COLS = 12;
const PIXEL_ROWS = 10;
const PIXEL_COUNT = PIXEL_COLS * PIXEL_ROWS;
const HEART_COUNT = 14;
const COIN_COUNT = 22;
const BARK_PUFF_COUNT = 6;

const pixelPalette = [
  "#c45c26",
  "#e8c547",
  "#6eb5d0",
  "#8fbf4a",
  "#d45c7a",
  "#f4ead5",
  "#3d6b3a",
  "#5a7aad",
];

function dampToward(
  current: number,
  target: number,
  speed: number,
  delta: number,
  snap: boolean,
) {
  if (snap) return target;
  return THREE.MathUtils.damp(current, target, speed, delta);
}

function Storefront({ hover, reducedMotion }: { hover: HoverRef; reducedMotion: boolean }) {
  const board = useRef<THREE.Group>(null);
  const lamp = useRef<THREE.PointLight>(null);

  useLayoutEffect(() => {
    if (!board.current) return;
    board.current.scale.set(0.06, 0.06, 1);
    board.current.visible = false;
  }, []);

  useFrame((_, delta) => {
    const t = hover.current;
    if (board.current) {
      const target = THREE.MathUtils.lerp(0.06, 1, t);
      const s = dampToward(board.current.scale.x || 0.06, target, 14, delta, reducedMotion);
      board.current.scale.set(s, s, 1);
      board.current.position.y = dampToward(
        board.current.position.y,
        THREE.MathUtils.lerp(1.05, 2.9, t),
        14,
        delta,
        reducedMotion,
      );
      board.current.visible = s > 0.1;
    }
    if (lamp.current) {
      lamp.current.intensity = THREE.MathUtils.lerp(1.6, 4.2, t);
    }
  });

  return (
    <group>
      <pointLight
        ref={lamp}
        position={[0, 1.2, 0.6]}
        color="#c45c26"
        intensity={1.6}
        distance={6}
        decay={2}
      />
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[1.8, 1.4, 1.05]} />
        <meshStandardMaterial color="#3a2a22" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.48, 0]}>
        <boxGeometry args={[1.95, 0.16, 1.18]} />
        <meshStandardMaterial color="#c45c26" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.72, 0.54]}>
        <boxGeometry args={[1.15, 0.72, 0.06]} />
        <meshStandardMaterial
          color="#1a120c"
          emissive="#c45c26"
          emissiveIntensity={0.85}
          roughness={0.35}
        />
      </mesh>
      <mesh position={[0, 1.18, 0.56]}>
        <boxGeometry args={[1.25, 0.18, 0.18]} />
        <meshStandardMaterial color="#e8d5a3" roughness={0.6} />
      </mesh>
      <mesh position={[-0.55, 1.18, 0.68]} rotation={[0.15, 0, 0.4]}>
        <boxGeometry args={[0.08, 0.28, 0.04]} />
        <meshStandardMaterial color="#8fbf4a" emissive="#8fbf4a" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0.55, 1.18, 0.68]} rotation={[0.15, 0, -0.4]}>
        <boxGeometry args={[0.08, 0.28, 0.04]} />
        <meshStandardMaterial color="#6eb5d0" emissive="#6eb5d0" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0, 0.08, 0.7]}>
        <boxGeometry args={[1.4, 0.08, 0.4]} />
        <meshStandardMaterial color="#2a2118" roughness={1} />
      </mesh>

      <group ref={board} position={[0, 1.05, 0.9]} rotation={[-0.28, 0.42, 0]}>
        <mesh position={[0, 0, -0.08]}>
          <boxGeometry args={[3.4, 2.05, 0.12]} />
          <meshStandardMaterial color="#2a1c14" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[3.2, 1.85, 0.08]} />
          <meshBasicMaterial color="#c45c26" />
        </mesh>
        <mesh position={[0, 1.12, 0.04]}>
          <boxGeometry args={[3.25, 0.22, 0.16]} />
          <meshStandardMaterial color="#e8d5a3" roughness={0.55} />
        </mesh>
        <mesh position={[-0.85, 0.12, 0.08]}>
          <boxGeometry args={[0.9, 0.7, 0.06]} />
          <meshStandardMaterial color="#8fbf4a" emissive="#8fbf4a" emissiveIntensity={0.55} />
        </mesh>
        <mesh position={[0.85, 0.12, 0.08]}>
          <boxGeometry args={[0.9, 0.7, 0.06]} />
          <meshStandardMaterial color="#6eb5d0" emissive="#6eb5d0" emissiveIntensity={0.45} />
        </mesh>
        <mesh position={[0, -0.55, 0.08]}>
          <boxGeometry args={[2.4, 0.28, 0.06]} />
          <meshStandardMaterial color="#f4ead5" emissive="#c45c26" emissiveIntensity={0.25} />
        </mesh>
      </group>
    </group>
  );
}

function MillionDollarBoard({
  hover,
  reducedMotion,
}: {
  hover: HoverRef;
  reducedMotion: boolean;
}) {
  const frame = useRef<THREE.Group>(null);
  const pixels = useRef<THREE.InstancedMesh>(null);
  const coins = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const pixelColors = useMemo(() => {
    return Array.from({ length: PIXEL_COUNT }, (_, i) => {
      const color = new THREE.Color(pixelPalette[i % pixelPalette.length]);
      color.offsetHSL((i * 0.07) % 0.2, 0, ((i * 13) % 7) * 0.02 - 0.06);
      return color;
    });
  }, []);
  const coinSeeds = useMemo(
    () =>
      Array.from({ length: COIN_COUNT }, (_, i) => ({
        x: ((i * 17) % 11) * 0.12 - 0.6,
        z: ((i * 9) % 7) * 0.1 - 0.28,
        speed: 0.55 + (i % 5) * 0.18,
        phase: (i * 0.37) % 1,
        spin: 1.2 + (i % 4) * 0.4,
      })),
    [],
  );

  useLayoutEffect(() => {
    const mesh = pixels.current;
    if (!mesh) return;
    mesh.raycast = () => {};
    if (!mesh.instanceColor) {
      mesh.instanceColor = new THREE.InstancedBufferAttribute(
        new Float32Array(PIXEL_COUNT * 3),
        3,
      );
    }
    pixelColors.forEach((color, i) => mesh.setColorAt(i, color));
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    dummy.scale.setScalar(0);
    dummy.position.set(0, -10, 0);
    dummy.updateMatrix();
    for (let i = 0; i < PIXEL_COUNT; i += 1) mesh.setMatrixAt(i, dummy.matrix);
    mesh.instanceMatrix.needsUpdate = true;
    if (coins.current) {
      coins.current.raycast = () => {};
      for (let i = 0; i < COIN_COUNT; i += 1) coins.current.setMatrixAt(i, dummy.matrix);
      coins.current.instanceMatrix.needsUpdate = true;
    }
  }, [dummy, pixelColors]);

  useFrame((state, delta) => {
    const t = hover.current;
    const time = state.clock.elapsedTime;
    if (frame.current) {
      const s = dampToward(frame.current.scale.x, THREE.MathUtils.lerp(1, 2.15, t), 10, delta, reducedMotion);
      frame.current.scale.setScalar(s);
      frame.current.position.y = dampToward(
        frame.current.position.y,
        THREE.MathUtils.lerp(0, 0.22, t),
        6.5,
        delta,
        reducedMotion,
      );
    }

    const grid = pixels.current;
    if (grid) {
      for (let i = 0; i < PIXEL_COUNT; i += 1) {
        const col = i % PIXEL_COLS;
        const row = Math.floor(i / PIXEL_COLS);
        const x = (col - (PIXEL_COLS - 1) / 2) * 0.13;
        const y = (row - (PIXEL_ROWS - 1) / 2) * 0.13;
        const pop = reducedMotion ? t : t * (0.55 + 0.45 * Math.sin(time * 6 + i * 0.35));
        dummy.position.set(x, y, 0.06 + pop * 0.08);
        dummy.scale.setScalar(0.92 + pop * 0.18);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        grid.setMatrixAt(i, dummy.matrix);
      }
      grid.instanceMatrix.needsUpdate = true;
    }

    const coinMesh = coins.current;
    if (coinMesh) {
      coinSeeds.forEach((coin, i) => {
        const cycle = reducedMotion ? 0.4 : (time * coin.speed + coin.phase) % 1.4;
        const alive = t * (1 - cycle / 1.4);
        dummy.position.set(
          coin.x + Math.sin(time * coin.spin + i) * 0.12 * t,
          0.35 + cycle * 1.7 * Math.max(t, 0.001),
          0.45 + coin.z,
        );
        dummy.rotation.set(time * coin.spin, time * 2.2, 0.4);
        dummy.scale.setScalar(Math.max(0.001, alive * 0.9));
        dummy.updateMatrix();
        coinMesh.setMatrixAt(i, dummy.matrix);
      });
      coinMesh.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      <pointLight position={[0, 1.4, 0.5]} color="#e8c547" intensity={1.8} distance={6} decay={2} />
      <mesh position={[0, 0.38, 0]}>
        <boxGeometry args={[0.14, 0.76, 0.14]} />
        <meshStandardMaterial color="#3a2a22" roughness={1} />
      </mesh>
      <mesh position={[0, 0.08, 0.18]}>
        <boxGeometry args={[1.15, 0.1, 0.7]} />
        <meshStandardMaterial color="#2a2118" roughness={1} />
      </mesh>

      <group ref={frame} position={[0, 1.05, 0.12]}>
        <mesh>
          <boxGeometry args={[1.82, 1.55, 0.12]} />
          <meshStandardMaterial color="#1a1814" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[1.62, 1.35, 0.08]} />
          <meshStandardMaterial color="#0c1014" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.86, 0.08]}>
          <boxGeometry args={[1.7, 0.14, 0.14]} />
          <meshStandardMaterial color="#e8c547" emissive="#e8c547" emissiveIntensity={0.55} />
        </mesh>
        <instancedMesh ref={pixels} args={[undefined, undefined, PIXEL_COUNT]} frustumCulled={false}>
          <boxGeometry args={[0.11, 0.11, 0.05]} />
          <meshStandardMaterial roughness={0.45} emissive="#111" emissiveIntensity={0.35} />
        </instancedMesh>
      </group>

      <instancedMesh ref={coins} args={[undefined, undefined, COIN_COUNT]} frustumCulled={false}>
        <cylinderGeometry args={[0.07, 0.07, 0.025, 8]} />
        <meshStandardMaterial
          color="#e8c547"
          emissive="#e8c547"
          emissiveIntensity={0.8}
          metalness={0.4}
          roughness={0.35}
        />
      </instancedMesh>
    </group>
  );
}

function PixelHeart() {
  return (
    <group scale={1.65}>
      <mesh position={[-0.045, 0.04, 0]}>
        <boxGeometry args={[0.07, 0.07, 0.05]} />
        <meshBasicMaterial color="#ff6b8a" toneMapped={false} />
      </mesh>
      <mesh position={[0.045, 0.04, 0]}>
        <boxGeometry args={[0.07, 0.07, 0.05]} />
        <meshBasicMaterial color="#ff6b8a" toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.02, 0]}>
        <boxGeometry args={[0.14, 0.07, 0.05]} />
        <meshBasicMaterial color="#ff4d73" toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.09, 0]}>
        <boxGeometry args={[0.08, 0.07, 0.05]} />
        <meshBasicMaterial color="#ff4d73" toneMapped={false} />
      </mesh>
    </group>
  );
}

function CorgiProp({ hover, reducedMotion }: { hover: HoverRef; reducedMotion: boolean }) {
  const tail = useRef<THREE.Mesh>(null);
  const head = useRef<THREE.Group>(null);
  const jaw = useRef<THREE.Mesh>(null);
  const hearts = useRef<(THREE.Group | null)[]>([]);
  const puffs = useRef<THREE.Group>(null);
  const heartSeeds = useMemo(
    () =>
      Array.from({ length: HEART_COUNT }, (_, i) => ({
        x: (i % 5) * 0.18 - 0.36,
        z: ((i * 3) % 4) * 0.12 - 0.12,
        speed: 0.45 + (i % 4) * 0.12,
        phase: (i * 0.19) % 1,
        scale: 0.7 + (i % 3) * 0.25,
      })),
    [],
  );

  useFrame((state) => {
    const t = hover.current;
    const time = state.clock.elapsedTime;
    const bark = reducedMotion ? t * 0.35 : t * (0.45 + 0.55 * (Math.sin(time * 16) * 0.5 + 0.5));

    if (tail.current) {
      const wag = t > 0.05 ? 16 : 7;
      tail.current.rotation.z = 0.4 + Math.sin(time * wag) * (0.35 + t * 0.45);
    }
    if (head.current) {
      head.current.rotation.x = bark * 0.22;
      head.current.position.y = 0.62 + bark * 0.06;
    }
    if (jaw.current) {
      jaw.current.rotation.x = bark * 0.7;
      jaw.current.position.z = 0.8 + bark * 0.04;
    }
    if (puffs.current) {
      const puff = reducedMotion ? t : t * (0.5 + 0.5 * Math.sin(time * 14));
      puffs.current.scale.setScalar(0.15 + puff * 0.95);
      puffs.current.position.set(0, 0.62 + puff * 0.15, 1.05 + puff * 0.35);
      puffs.current.visible = t > 0.08;
    }

    heartSeeds.forEach((seed, i) => {
      const group = hearts.current[i];
      if (!group) return;
      const cycle = reducedMotion ? 0.45 : (time * seed.speed + seed.phase) % 1.6;
      const rise = cycle / 1.6;
      const alive = t * (1 - rise);
      group.position.set(
        seed.x + Math.sin(time * 1.4 + i) * 0.12,
        0.85 + rise * 1.55,
        0.35 + seed.z,
      );
      group.rotation.y = time * 1.1 + i;
      group.scale.setScalar(Math.max(0, alive * seed.scale));
      group.visible = t > 0.04;
    });
  });

  return (
    <group rotation={[0, Math.PI * 0.35, 0]} scale={1.15}>
      <pointLight position={[0, 0.9, 0.4]} color="#e8d5a3" intensity={1.4} distance={4} decay={2} />
      <mesh position={[0, 0.38, 0.05]}>
        <boxGeometry args={[0.7, 0.42, 1.05]} />
        <meshStandardMaterial color="#e0b05a" roughness={0.75} emissive="#5a3a10" emissiveIntensity={0.25} />
      </mesh>
      <group ref={head} position={[0, 0.62, 0.05]}>
        <mesh position={[0, 0, 0.53]}>
          <boxGeometry args={[0.48, 0.42, 0.42]} />
          <meshStandardMaterial color="#f3e2b8" roughness={0.7} emissive="#6a5020" emissiveIntensity={0.2} />
        </mesh>
        <mesh position={[-0.22, 0.26, 0.5]}>
          <boxGeometry args={[0.14, 0.28, 0.1]} />
          <meshStandardMaterial color="#c45c26" roughness={0.8} />
        </mesh>
        <mesh position={[0.22, 0.26, 0.5]}>
          <boxGeometry args={[0.14, 0.28, 0.1]} />
          <meshStandardMaterial color="#c45c26" roughness={0.8} />
        </mesh>
        <mesh ref={jaw} position={[0, -0.1, 0.8]}>
          <boxGeometry args={[0.22, 0.14, 0.18]} />
          <meshStandardMaterial color="#1a2f1c" roughness={0.9} />
        </mesh>
      </group>
      <mesh position={[-0.22, 0.16, 0.28]}>
        <boxGeometry args={[0.16, 0.28, 0.16]} />
        <meshStandardMaterial color="#e8d5a3" roughness={0.9} />
      </mesh>
      <mesh position={[0.22, 0.16, 0.28]}>
        <boxGeometry args={[0.16, 0.28, 0.16]} />
        <meshStandardMaterial color="#e8d5a3" roughness={0.9} />
      </mesh>
      <mesh position={[-0.22, 0.16, -0.32]}>
        <boxGeometry args={[0.16, 0.28, 0.16]} />
        <meshStandardMaterial color="#e8d5a3" roughness={0.9} />
      </mesh>
      <mesh position={[0.22, 0.16, -0.32]}>
        <boxGeometry args={[0.16, 0.28, 0.16]} />
        <meshStandardMaterial color="#e8d5a3" roughness={0.9} />
      </mesh>
      <mesh ref={tail} position={[0, 0.55, -0.58]} rotation={[0.4, 0, 0.3]}>
        <boxGeometry args={[0.12, 0.14, 0.32]} />
        <meshStandardMaterial color="#c45c26" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.72, 0.05]}>
        <boxGeometry args={[0.22, 0.12, 0.22]} />
        <meshStandardMaterial
          color="#1a120c"
          emissive="#c45c26"
          emissiveIntensity={0.45}
        />
      </mesh>

      <group ref={puffs} position={[0, 0.62, 1.05]} visible={false}>
        {Array.from({ length: BARK_PUFF_COUNT }, (_, i) => (
          <mesh key={i} position={[(i % 3) * 0.12 - 0.12, Math.floor(i / 3) * 0.12, i * 0.04]}>
            <boxGeometry args={[0.1, 0.08, 0.08]} />
            <meshBasicMaterial color="#f4ead5" transparent opacity={0.85} toneMapped={false} />
          </mesh>
        ))}
      </group>

      {heartSeeds.map((_, i) => (
        <group
          key={i}
          ref={(node) => {
            hearts.current[i] = node;
          }}
          visible={false}
        >
          <PixelHeart />
        </group>
      ))}
    </group>
  );
}

function LimeScooter({ hover, reducedMotion }: { hover: HoverRef; reducedMotion: boolean }) {
  const body = useRef<THREE.Group>(null);
  const wheels = useRef<THREE.Group>(null);
  const stand = useRef<THREE.Mesh>(null);
  const lamp = useRef<THREE.PointLight>(null);
  const streaks = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const streakSeeds = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        x: ((i * 13) % 5) * 0.08 - 0.16,
        y: 0.18 + (i % 4) * 0.08,
        z: (i % 7) * 0.12,
        speed: 1.4 + (i % 5) * 0.35,
        phase: (i * 0.21) % 1,
      })),
    [],
  );

  useLayoutEffect(() => {
    const mesh = streaks.current;
    if (!mesh) return;
    mesh.raycast = () => {};
    dummy.scale.setScalar(0);
    dummy.position.set(0, -8, 0);
    dummy.updateMatrix();
    for (let i = 0; i < 16; i += 1) mesh.setMatrixAt(i, dummy.matrix);
    mesh.instanceMatrix.needsUpdate = true;
  }, [dummy]);

  useFrame((state, delta) => {
    const t = hover.current;
    const time = state.clock.elapsedTime;
    if (body.current) {
      body.current.rotation.x = THREE.MathUtils.damp(
        body.current.rotation.x,
        t * -0.18,
        10,
        delta,
      );
      body.current.position.y = reducedMotion ? t * 0.04 : t * (0.06 + Math.sin(time * 10) * 0.03);
    }
    if (wheels.current && !reducedMotion) {
      wheels.current.children.forEach((wheel) => {
        wheel.rotation.x += t * 14 * delta;
      });
    }
    if (stand.current) {
      stand.current.rotation.z = THREE.MathUtils.damp(
        stand.current.rotation.z,
        THREE.MathUtils.lerp(0.55, 0.08, t),
        12,
        delta,
      );
    }
    if (lamp.current) lamp.current.intensity = THREE.MathUtils.lerp(1.2, 3.4, t);

    const mesh = streaks.current;
    if (mesh) {
      streakSeeds.forEach((s, i) => {
        const cycle = reducedMotion ? 0.35 : (time * s.speed + s.phase) % 1;
        const alive = t * (1 - cycle);
        dummy.position.set(s.x, s.y, -0.35 - cycle * 1.4);
        dummy.scale.set(0.04, 0.04, 0.18 + cycle * 0.35);
        dummy.scale.multiplyScalar(Math.max(0.001, alive));
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group rotation={[0, Math.PI * 0.28, 0]} scale={1.35}>
      <pointLight
        ref={lamp}
        position={[0, 0.9, 0.55]}
        color="#32d74b"
        intensity={1.2}
        distance={5}
        decay={2}
      />
      <group ref={body}>
        <mesh position={[0, 0.28, 0.02]}>
          <boxGeometry args={[0.38, 0.1, 1.35]} />
          <meshStandardMaterial color="#32d74b" roughness={0.45} emissive="#145c22" emissiveIntensity={0.35} />
        </mesh>
        <mesh position={[0, 0.34, 0.04]}>
          <boxGeometry args={[0.22, 0.04, 1.05]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.22, 0.52]}>
          <boxGeometry args={[0.16, 0.16, 0.28]} />
          <meshStandardMaterial color="#111" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.72, 0.58]}>
          <boxGeometry args={[0.1, 0.95, 0.1]} />
          <meshStandardMaterial color="#1c1c1c" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.78, 0.58]}>
          <boxGeometry args={[0.14, 0.42, 0.08]} />
          <meshStandardMaterial color="#32d74b" roughness={0.4} emissive="#32d74b" emissiveIntensity={0.25} />
        </mesh>
        <mesh position={[0, 1.22, 0.58]}>
          <boxGeometry args={[0.72, 0.08, 0.08]} />
          <meshStandardMaterial color="#111" roughness={0.55} />
        </mesh>
        <mesh position={[-0.34, 1.22, 0.58]}>
          <boxGeometry args={[0.08, 0.16, 0.08]} />
          <meshStandardMaterial color="#222" roughness={0.6} />
        </mesh>
        <mesh position={[0.34, 1.22, 0.58]}>
          <boxGeometry args={[0.08, 0.16, 0.08]} />
          <meshStandardMaterial color="#222" roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.02, 0.64]}>
          <boxGeometry args={[0.16, 0.16, 0.06]} />
          <meshStandardMaterial color="#b6f06a" emissive="#32d74b" emissiveIntensity={0.7} />
        </mesh>
        <mesh position={[0, 1.18, 0.68]}>
          <boxGeometry args={[0.1, 0.08, 0.08]} />
          <meshStandardMaterial color="#f4ead5" emissive="#f4ead5" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0, 0.32, -0.62]}>
          <boxGeometry args={[0.28, 0.12, 0.18]} />
          <meshStandardMaterial color="#32d74b" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.38, -0.7]}>
          <boxGeometry args={[0.08, 0.08, 0.08]} />
          <meshStandardMaterial color="#c45c26" emissive="#c45c26" emissiveIntensity={0.55} />
        </mesh>
        <mesh ref={stand} position={[0.16, 0.16, 0.05]} rotation={[0, 0, 0.55]}>
          <boxGeometry args={[0.05, 0.32, 0.05]} />
          <meshStandardMaterial color="#222" roughness={0.8} />
        </mesh>
        <group ref={wheels}>
          <mesh position={[0, 0.2, 0.62]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.2, 0.2, 0.12, 10]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.2, 0.62]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.14, 8]} />
            <meshStandardMaterial color="#c5d4f0" roughness={0.4} metalness={0.3} />
          </mesh>
          <mesh position={[0, 0.2, -0.58]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.2, 0.2, 0.12, 10]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.2, -0.58]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.14, 8]} />
            <meshStandardMaterial color="#c5d4f0" roughness={0.4} metalness={0.3} />
          </mesh>
        </group>
      </group>
      <instancedMesh ref={streaks} args={[undefined, undefined, 16]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#b6f06a" transparent opacity={0.75} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}
function ProjectModel({
  id,
  hover,
  reducedMotion,
}: {
  id: string;
  hover: HoverRef;
  reducedMotion: boolean;
}) {
  if (id === "sidespace") return <Storefront hover={hover} reducedMotion={reducedMotion} />;
  if (id === "milliondollarleaderboard") {
    return <MillionDollarBoard hover={hover} reducedMotion={reducedMotion} />;
  }
  if (id === "riderelay") return <LimeScooter hover={hover} reducedMotion={reducedMotion} />;
  return <CorgiProp hover={hover} reducedMotion={reducedMotion} />;
}

function RelicMesh({
  id,
  position,
  discovered,
  interactive,
  onInspect,
  onDiscover,
  reducedMotion,
}: {
  id: string;
  position: [number, number, number];
  discovered: boolean;
  interactive: boolean;
  onInspect: (subject: InspectSubject) => void;
  onDiscover: (id: string) => void;
  reducedMotion: boolean;
}) {
  const revealed = useRef(false);
  const group = useRef<THREE.Group>(null);
  const hover = useRef(0);
  const linger = useRef(0);
  const world = useMemo(
    () => new THREE.Vector3(position[0], 0, position[2]),
    [position],
  );

  useFrame((_, delta) => {
    const dist = meadowMouse.distanceTo(world);
    const near = dist < REVEAL_RADIUS;
    if (near) linger.current = 0.28;
    else linger.current = Math.max(0, linger.current - delta);
    const active = near || linger.current > 0;
    hover.current = dampToward(hover.current, active ? 1 : 0, 14, delta, reducedMotion);
    if (near && interactive && !revealed.current) {
      revealed.current = true;
      onDiscover(id);
    }
    if (group.current) {
      group.current.position.y = THREE.MathUtils.damp(
        group.current.position.y,
        active ? 0.1 : 0,
        10,
        delta,
      );
    }
  });

  return (
    <group position={position}>
      <group
        ref={group}
        onClick={(event) => {
          event.stopPropagation();
          if (!interactive || !isInspectClick()) return;
          if (meadowMouse.distanceTo(world) < REVEAL_RADIUS || discovered) {
            onInspect({ type: "relic", id });
            onDiscover(id);
          }
        }}
      >
        <ProjectModel id={id} hover={hover} reducedMotion={reducedMotion} />
      </group>
    </group>
  );
}

function Mailbox({
  onInspect,
  interactive,
}: {
  onInspect: (subject: InspectSubject) => void;
  interactive: boolean;
}) {
  const flag = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!flag.current) return;
    flag.current.rotation.z = -0.2 + Math.sin(state.clock.elapsedTime * 1.4) * 0.08;
  });

  return (
    <group
      position={mailbox.position}
      scale={1.35}
      onClick={(event) => {
        event.stopPropagation();
        if (!interactive || !isInspectClick()) return;
        onInspect({ type: "contact" });
      }}
    >
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[0.1, 0.84, 0.1]} />
        <meshStandardMaterial color="#1a1814" roughness={1} />
      </mesh>
      <mesh position={[0, 0.92, 0]}>
        <boxGeometry args={[0.55, 0.36, 0.32]} />
        <meshStandardMaterial
          color="#c45c26"
          emissive="#c45c26"
          emissiveIntensity={0.2}
          roughness={0.65}
        />
      </mesh>
      <mesh ref={flag} position={[0.32, 1.02, 0]}>
        <boxGeometry args={[0.28, 0.12, 0.04]} />
        <meshStandardMaterial color="#8fbf4a" emissive="#8fbf4a" emissiveIntensity={0.35} />
      </mesh>
    </group>
  );
}

export function Relics({
  discovered,
  interactive,
  onInspect,
  onDiscover,
  reducedMotion,
}: {
  discovered: string[];
  interactive: boolean;
  onInspect: (subject: InspectSubject) => void;
  onDiscover: (id: string) => void;
  reducedMotion: boolean;
}) {
  const found = useMemo(() => new Set(discovered), [discovered]);

  return (
    <group>
      {relics.map((relic) => (
        <RelicMesh
          key={relic.id}
          id={relic.id}
          position={relic.position}
          discovered={found.has(relic.id)}
          interactive={interactive}
          onInspect={onInspect}
          onDiscover={onDiscover}
          reducedMotion={reducedMotion}
        />
      ))}
      <Mailbox onInspect={onInspect} interactive={interactive} />
    </group>
  );
}
