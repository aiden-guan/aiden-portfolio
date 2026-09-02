"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mailbox, relics, type InspectSubject } from "@/lib/content";
import { meadowMouse, REVEAL_RADIUS } from "@/lib/meadow-mouse";

function Storefront() {
  return (
    <group>
      <pointLight position={[0, 1.2, 0.6]} color="#c45c26" intensity={1.6} distance={5} decay={2} />
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
    </group>
  );
}

function KrakenTable() {
  const tentacle = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!tentacle.current) return;
    tentacle.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.12;
  });

  return (
    <group scale={1.28}>
      <pointLight position={[0, 0.9, 0.2]} color="#6eb5d0" intensity={1.5} distance={5} decay={2} />
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.95, 1.05, 0.16, 8]} />
        <meshStandardMaterial color="#2a3a48" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.12, 0.16, 0.44, 6]} />
        <meshStandardMaterial color="#1a242c" roughness={1} />
      </mesh>
      <mesh position={[-0.28, 0.54, 0.12]} rotation={[-0.2, 0.3, 0.1]}>
        <boxGeometry args={[0.28, 0.02, 0.38]} />
        <meshStandardMaterial color="#f4ead5" roughness={0.5} />
      </mesh>
      <mesh position={[0.22, 0.54, -0.08]} rotation={[0.1, -0.4, 0]}>
        <boxGeometry args={[0.28, 0.02, 0.38]} />
        <meshStandardMaterial color="#6eb5d0" roughness={0.5} />
      </mesh>
      <mesh position={[0.08, 0.54, 0.28]} rotation={[0, 0.6, 0.05]}>
        <boxGeometry args={[0.28, 0.02, 0.38]} />
        <meshStandardMaterial color="#c45c26" roughness={0.5} />
      </mesh>
      <group ref={tentacle} position={[0.7, 0.1, 0.35]}>
        <mesh position={[0, 0.35, 0]} rotation={[0.4, 0, 0.5]}>
          <boxGeometry args={[0.18, 0.8, 0.18]} />
          <meshStandardMaterial color="#3a5a72" roughness={0.7} />
        </mesh>
        <mesh position={[0.22, 0.85, 0.12]} rotation={[0.9, 0.2, 0.3]}>
          <boxGeometry args={[0.14, 0.55, 0.14]} />
          <meshStandardMaterial
            color="#4a7a92"
            emissive="#6eb5d0"
            emissiveIntensity={0.25}
            roughness={0.6}
          />
        </mesh>
        <mesh position={[0.08, 0.2, 0.22]}>
          <sphereGeometry args={[0.1, 6, 6]} />
          <meshStandardMaterial color="#8fbf4a" emissive="#8fbf4a" emissiveIntensity={0.5} />
        </mesh>
      </group>
      <mesh position={[-0.65, 0.18, -0.4]} rotation={[-0.5, 0.4, -0.3]}>
        <boxGeometry args={[0.16, 0.7, 0.16]} />
        <meshStandardMaterial color="#2f4a5c" roughness={0.75} />
      </mesh>
    </group>
  );
}

function CorgiProp() {
  const tail = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!tail.current) return;
    tail.current.rotation.z = 0.4 + Math.sin(state.clock.elapsedTime * 7) * 0.35;
  });

  return (
    <group rotation={[0, Math.PI * 0.35, 0]} scale={1.15}>
      <pointLight position={[0, 0.9, 0.4]} color="#e8d5a3" intensity={1.4} distance={4} decay={2} />
      <mesh position={[0, 0.38, 0.05]}>
        <boxGeometry args={[0.7, 0.42, 1.05]} />
        <meshStandardMaterial color="#e0b05a" roughness={0.75} emissive="#5a3a10" emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0, 0.62, 0.58]}>
        <boxGeometry args={[0.48, 0.42, 0.42]} />
        <meshStandardMaterial color="#f3e2b8" roughness={0.7} emissive="#6a5020" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[-0.22, 0.88, 0.55]}>
        <boxGeometry args={[0.14, 0.28, 0.1]} />
        <meshStandardMaterial color="#c45c26" roughness={0.8} />
      </mesh>
      <mesh position={[0.22, 0.88, 0.55]}>
        <boxGeometry args={[0.14, 0.28, 0.1]} />
        <meshStandardMaterial color="#c45c26" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.52, 0.8]}>
        <boxGeometry args={[0.22, 0.14, 0.18]} />
        <meshStandardMaterial color="#1a2f1c" roughness={0.9} />
      </mesh>
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
    </group>
  );
}

function ProjectModel({ id }: { id: string }) {
  if (id === "sidespace") return <Storefront />;
  if (id === "fish") return <KrakenTable />;
  return <CorgiProp />;
}

function RelicMesh({
  id,
  position,
  discovered,
  onInspect,
  onDiscover,
}: {
  id: string;
  position: [number, number, number];
  discovered: boolean;
  onInspect: (subject: InspectSubject) => void;
  onDiscover: (id: string) => void;
}) {
  const revealed = useRef(false);
  const group = useRef<THREE.Group>(null);
  const world = useMemo(
    () => new THREE.Vector3(position[0], 0, position[2]),
    [position],
  );

  useFrame((state) => {
    const dist = meadowMouse.distanceTo(world);
    const on = dist < REVEAL_RADIUS;
    if (on && !revealed.current) {
      revealed.current = true;
      onDiscover(id);
    }
    if (group.current) {
      const lift = on ? 0.12 : 0;
      group.current.position.y = THREE.MathUtils.lerp(
        group.current.position.y,
        lift,
        0.12,
      );
      const pulse = on ? 1 + Math.sin(state.clock.elapsedTime * 4) * 0.04 : 1;
      group.current.scale.setScalar(pulse);
    }
  });

  return (
    <group position={position}>
      <group
        ref={group}
        onClick={(event) => {
          event.stopPropagation();
          if (meadowMouse.distanceTo(world) < REVEAL_RADIUS || discovered) {
            onInspect({ type: "relic", id });
            onDiscover(id);
          }
        }}
      >
        <ProjectModel id={id} />
      </group>
    </group>
  );
}

function Mailbox({
  onInspect,
}: {
  onInspect: (subject: InspectSubject) => void;
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
  onInspect,
  onDiscover,
}: {
  discovered: string[];
  onInspect: (subject: InspectSubject) => void;
  onDiscover: (id: string) => void;
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
          onInspect={onInspect}
          onDiscover={onDiscover}
        />
      ))}
      <Mailbox onInspect={onInspect} />
    </group>
  );
}
