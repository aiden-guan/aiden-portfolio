"use client";

import { useMemo, useRef, useState, type RefObject } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SpeechBubble } from "@/components/hud/SpeechBubble";
import {
  CRATER,
  cutsceneClock,
  easeOutCubic,
  fallingLaptopPose,
  getSubjectCopy,
  getTourSubject,
  HELD_SCALE,
  IDLE_STAND,
  impactFX,
  laptopHolding,
  laptopVisible,
  LAPTOP_CRASH,
  LAPTOP_CRASH_EULER,
  LAPTOP_SCALE,
  PHASE_DURATION,
  type CutscenePhase,
} from "@/lib/cutscene";
import { mailbox, relics, type InspectSubject } from "@/lib/content";
import { meadowMouse, meadowPointer } from "@/lib/meadow-mouse";

function sameSubject(a: InspectSubject | null, b: InspectSubject | null) {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.type !== b.type) return false;
  return a.type !== "relic" || b.type !== "relic" || a.id === b.id;
}

const CODE_COUNT = 40;

function makeDigitTexture(digit: "0" | "1") {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.clearRect(0, 0, 64, 64);
  ctx.fillStyle = "#c8ff7a";
  ctx.font = "700 52px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(digit, 32, 36);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}

function CodeParticles({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const tex0 = useMemo(() => makeDigitTexture("0"), []);
  const tex1 = useMemo(() => makeDigitTexture("1"), []);
  const particles = useMemo(
    () =>
      Array.from({ length: CODE_COUNT }, (_, i) => ({
        x: ((i % 5) - 2) * 0.08,
        y: ((Math.floor(i / 5) % 4) - 1.4) * 0.06,
        life: (i * 0.11) % 1,
        speed: 0.34 + (i % 7) * 0.06,
        drift: ((i % 5) - 2) * 0.01,
        one: i % 2 === 1,
        scale: 0.14 + (i % 4) * 0.025,
      })),
    [],
  );

  useFrame((_, delta) => {
    const root = group.current;
    if (!root) return;
    particles.forEach((p, i) => {
      const sprite = root.children[i] as THREE.Sprite | undefined;
      if (!sprite || !sprite.isSprite) return;
      if (!reducedMotion) p.life += p.speed * delta;
      if (p.life > 1) p.life -= 1;
      const rise = p.life;
      const fade = rise < 0.1 ? rise / 0.1 : rise > 0.72 ? 1 - (rise - 0.72) / 0.28 : 1;
      sprite.position.set(p.x + p.drift * rise, p.y + rise * 0.7, 0.04 + rise * 0.08);
      sprite.scale.setScalar(p.scale * fade);
      const mat = sprite.material;
      if (mat && !Array.isArray(mat)) mat.opacity = fade;
    });
  });

  if (!tex0 || !tex1) return null;

  return (
    <group ref={group}>
      {particles.map((p, i) => (
        <sprite key={i} frustumCulled={false}>
          <spriteMaterial
            map={p.one ? tex1 : tex0}
            transparent
            depthWrite={false}
            toneMapped={false}
          />
        </sprite>
      ))}
    </group>
  );
}

function KeyGrid() {
  const keys = useMemo(() => {
    const cells: { x: number; z: number; w: number }[] = [];
    for (let row = 0; row < 5; row += 1) {
      for (let col = 0; col < 12; col += 1) {
        const wide = row === 4 && col > 3 && col < 8;
        if (wide && col !== 5) continue;
        cells.push({
          x: (col - 5.5) * 0.048,
          z: (row - 2.1) * 0.046,
          w: wide ? 0.18 : 0.036,
        });
      }
    }
    return cells;
  }, []);

  return (
    <group position={[0, 0.034, 0.01]}>
      {keys.map((key) => (
        <mesh key={`${key.x}-${key.z}`} position={[key.x, 0, key.z]}>
          <boxGeometry args={[key.w, 0.012, 0.034]} />
          <meshStandardMaterial color="#1a1c20" roughness={0.55} />
        </mesh>
      ))}
    </group>
  );
}

function MacBookModel({
  lid,
  screen,
  particles,
  shadow,
  reducedMotion,
}: {
  lid: RefObject<THREE.Group | null>;
  screen: RefObject<THREE.MeshStandardMaterial | null>;
  particles: RefObject<THREE.Group | null>;
  shadow: RefObject<THREE.Mesh | null>;
  reducedMotion: boolean;
}) {
  return (
    <group>
      <mesh ref={shadow} position={[0, 0.002, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.38, 16]} />
        <meshBasicMaterial color="#0c140e" transparent opacity={0.4} />
      </mesh>

      <mesh position={[0, 0.018, 0.02]}>
        <boxGeometry args={[0.74, 0.03, 0.5]} />
        <meshStandardMaterial color="#7d838c" roughness={0.28} metalness={0.55} />
      </mesh>
      <mesh position={[0, 0.03, 0.018]}>
        <boxGeometry args={[0.7, 0.008, 0.46]} />
        <meshStandardMaterial color="#2a2d32" roughness={0.7} />
      </mesh>
      <KeyGrid />
      <mesh position={[0, 0.032, 0.16]}>
        <boxGeometry args={[0.2, 0.008, 0.12]} />
        <meshStandardMaterial color="#4b5058" roughness={0.35} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0.028, -0.228]}>
        <boxGeometry args={[0.74, 0.028, 0.04]} />
        <meshStandardMaterial color="#6b717a" roughness={0.3} metalness={0.5} />
      </mesh>

      <group ref={lid} position={[0, 0.034, -0.228]}>
        <mesh position={[0, 0.215, 0]}>
          <boxGeometry args={[0.74, 0.46, 0.028]} />
          <meshStandardMaterial color="#6f757e" roughness={0.3} metalness={0.52} />
        </mesh>
        <mesh position={[0, 0.215, 0.016]}>
          <boxGeometry args={[0.66, 0.4, 0.01]} />
          <meshStandardMaterial
            ref={screen}
            color="#06110c"
            emissive="#8fd45a"
            emissiveIntensity={0.9}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[0, 0.215, 0.018]}>
          <boxGeometry args={[0.28, 0.012, 0.004]} />
          <meshBasicMaterial color="#b6f06a" />
        </mesh>
        <mesh position={[-0.14, 0.175, 0.018]}>
          <boxGeometry args={[0.32, 0.012, 0.004]} />
          <meshBasicMaterial color="#7cbc4d" />
        </mesh>
        <mesh position={[-0.08, 0.148, 0.018]}>
          <boxGeometry args={[0.44, 0.012, 0.004]} />
          <meshBasicMaterial color="#c8ff88" />
        </mesh>
        <mesh position={[-0.18, 0.121, 0.018]}>
          <boxGeometry args={[0.24, 0.012, 0.004]} />
          <meshBasicMaterial color="#8fd45a" />
        </mesh>
        <mesh position={[0, 0.43, 0.002]}>
          <boxGeometry args={[0.07, 0.02, 0.016]} />
          <meshStandardMaterial color="#111418" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.215, -0.016]}>
          <boxGeometry args={[0.07, 0.07, 0.008]} />
          <meshStandardMaterial color="#c5c9ce" roughness={0.28} metalness={0.65} />
        </mesh>
        <group ref={particles} position={[0, 0.215, 0.03]} visible={false}>
          <CodeParticles reducedMotion={reducedMotion} />
        </group>
      </group>
    </group>
  );
}

function yawTowardCamera(group: THREE.Group, camera: THREE.Camera, delta: number) {
  const target =
    Math.atan2(camera.position.x - group.position.x, camera.position.z - group.position.z);
  const current = group.rotation.y;
  let diff = target - current;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  group.rotation.y = current + diff * (1 - Math.exp(-delta * 4.2));
  group.rotation.x = THREE.MathUtils.damp(group.rotation.x, -0.32, 6, delta);
  group.rotation.z = THREE.MathUtils.damp(group.rotation.z, 0, 6, delta);
}

function tourAnchor(subject: InspectSubject | null, cursor: THREE.Vector3, out: THREE.Vector3) {
  if (subject?.type === "relic") {
    const relic = relics.find((item) => item.id === subject.id);
    if (relic) {
      out.set(
        relic.position[0] * 0.78 + cursor.x * 0.22,
        1.22,
        relic.position[2] * 0.78 + cursor.z * 0.22,
      );
      return out;
    }
  }
  if (subject?.type === "contact") {
    out.set(
      mailbox.position[0] * 0.72 + cursor.x * 0.28,
      1.18,
      mailbox.position[2] * 0.72 + cursor.z * 0.28,
    );
    return out;
  }
  if (subject?.type === "about") {
    out.set(IDLE_STAND.x + 1.05, 1.22, IDLE_STAND.z + 0.15);
    return out;
  }
  out.set(cursor.x, Math.hypot(cursor.x, cursor.z) < CRATER.outer ? 1.7 : 0.95, cursor.z);
  return out;
}

export function MeadowLaptop({
  phase,
  reducedMotion,
}: {
  phase: CutscenePhase;
  reducedMotion: boolean;
}) {
  const root = useRef<THREE.Group>(null);
  const model = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null);
  const screen = useRef<THREE.MeshStandardMaterial>(null);
  const shadow = useRef<THREE.Mesh>(null);
  const desired = useMemo(() => new THREE.Vector3(), []);
  const handoffFrom = useMemo(() => new THREE.Vector3(), []);
  const holdPos = useMemo(() => new THREE.Vector3(), []);
  const holdQuat = useMemo(() => new THREE.Quaternion(), []);
  const holdScale = useMemo(() => new THREE.Vector3(), []);
  const crashQuat = useMemo(
    () => new THREE.Quaternion().setFromEuler(LAPTOP_CRASH_EULER),
    [],
  );
  const fallPos = useMemo(() => new THREE.Vector3(), []);
  const fallEuler = useMemo(() => new THREE.Euler(), []);
  const fallQuat = useMemo(() => new THREE.Quaternion(), []);
  const scratchEuler = useMemo(() => new THREE.Euler(), []);
  const punchQuat = useMemo(() => new THREE.Quaternion(), []);
  const particles = useRef<THREE.Group>(null);
  const armed = useRef("");
  const tourRef = useRef<InspectSubject | null>(null);
  const [tour, setTour] = useState<InspectSubject | null>(null);

  useFrame((state, delta) => {
    const group = root.current;
    const body = model.current;
    if (!group || !body) return;
    const visual = cutsceneClock.phase;
    const visible = laptopVisible(visual);
    group.visible = visible;
    if (!visible) return;

    const t = cutsceneClock.t;
    const duration = PHASE_DURATION[visual];
    const u = duration === Number.POSITIVE_INFINITY ? 1 : THREE.MathUtils.clamp(t / duration, 0, 1);
    const holding = laptopHolding(visual);
    const attached = holding && (visual !== "pickup" || u >= 0.4);
    const struck = impactFX.age >= 0;
    const showParticles =
      attached ||
      visual === "falling" ||
      visual === "impact" ||
      visual === "walkIn" ||
      visual === "notice" ||
      visual === "handoff" ||
      visual === "playable";
    group.scale.setScalar(1);

    if (armed.current !== visual) {
      armed.current = visual;
      if (visual === "handoff") {
        group.getWorldPosition(handoffFrom);
      }
    }

    cutsceneClock.holdMatrix.decompose(holdPos, holdQuat, holdScale);

    if (visual === "falling" && !struck) {
      fallingLaptopPose(u, fallPos, scratchEuler);
      group.position.copy(fallPos);
      group.quaternion.setFromEuler(scratchEuler);
      body.scale.setScalar(LAPTOP_SCALE);
    } else if (visual === "falling" || visual === "impact") {
      fallingLaptopPose(1, fallPos, fallEuler);
      fallQuat.setFromEuler(fallEuler);
      const age = Math.max(0, impactFX.age);
      const freeze = age < 0.05;
      const slamAge = freeze ? 0 : age - 0.05;
      const slam = freeze ? 0.12 : 1 - Math.exp(-slamAge * 18);
      const squash = freeze ? 1 : Math.exp(-slamAge * 13);
      group.position.lerpVectors(fallPos, LAPTOP_CRASH, slam);
      group.position.y -= squash * 0.28;
      punchQuat.setFromEuler(scratchEuler.set(squash * 0.42, squash * 0.16, squash * 0.28));
      group.quaternion.slerpQuaternions(fallQuat, crashQuat, Math.min(1, slam + 0.2));
      group.quaternion.multiply(punchQuat);
      body.scale.set(
        LAPTOP_SCALE * (1 + squash * 0.42),
        LAPTOP_SCALE * (1 - squash * 0.58),
        LAPTOP_SCALE * (1 + squash * 0.3),
      );
    } else if (attached) {
      group.position.copy(holdPos);
      group.quaternion.copy(holdQuat);
      body.scale.setScalar(HELD_SCALE);
    } else if (holding) {
      group.position.copy(LAPTOP_CRASH);
      group.quaternion.copy(crashQuat);
      body.scale.setScalar(LAPTOP_SCALE);
    } else if (visual === "notice" || visual === "walkIn") {
      group.position.copy(LAPTOP_CRASH);
      group.quaternion.copy(crashQuat);
      body.scale.setScalar(LAPTOP_SCALE);
    } else if (visual === "handoff") {
      tourAnchor(null, meadowMouse, desired);
      const fly = easeOutCubic(u);
      group.position.lerpVectors(handoffFrom, desired, fly);
      group.position.y += Math.sin(fly * Math.PI) * 1.15;
      group.quaternion.identity();
      yawTowardCamera(group, state.camera, delta);
      body.scale.setScalar(LAPTOP_SCALE);
    } else {
      if (!(meadowPointer.pressed && meadowPointer.dragging)) {
        const next = getTourSubject(meadowMouse, true);
        tourAnchor(next, meadowMouse, desired);
        if (!sameSubject(next, tourRef.current)) {
          tourRef.current = next;
          setTour(next);
        }
      }
      if (reducedMotion) {
        group.position.copy(desired);
      } else {
        group.position.x = THREE.MathUtils.damp(group.position.x, desired.x, 5.5, delta);
        group.position.y = THREE.MathUtils.damp(
          group.position.y,
          desired.y + Math.sin(state.clock.elapsedTime * 2.3) * 0.05,
          5.5,
          delta,
        );
        group.position.z = THREE.MathUtils.damp(group.position.z, desired.z, 5.5, delta);
      }
      yawTowardCamera(group, state.camera, delta);
      body.scale.setScalar(LAPTOP_SCALE);
    }

    if (lid.current) {
      const open =
        visual === "falling" && !struck
          ? 0.72 + u * 0.18
          : visual === "falling" || visual === "impact"
            ? 0.55
            : attached
              ? 0.88
              : 1.18;
      lid.current.rotation.x = THREE.MathUtils.damp(lid.current.rotation.x, -open, 10, delta);
    }
    if (screen.current) {
      screen.current.emissiveIntensity = showParticles
        ? 1.05 + Math.sin(state.clock.elapsedTime * 4.4) * 0.18
        : 0.35;
    }
    if (particles.current) particles.current.visible = showParticles;
    if (shadow.current) {
      shadow.current.visible =
        !attached &&
        visual !== "falling" &&
        visual !== "impact" &&
        visual !== "handoff" &&
        visual !== "playable";
    }
    if (visual !== "playable" && tourRef.current) {
      tourRef.current = null;
      setTour(null);
    }
  });

  const copy = phase === "playable" && tour ? getSubjectCopy(tour) : null;

  return (
    <group ref={root} visible={false}>
      <group ref={model}>
        <MacBookModel
          lid={lid}
          screen={screen}
          particles={particles}
          shadow={shadow}
          reducedMotion={reducedMotion}
        />
      </group>
      {phase === "playable" && copy ? (
        <Html
          position={[0.72, 1.28, 0.28]}
          sprite
          zIndexRange={[12, 4]}
          style={{ pointerEvents: "none" }}
        >
          <div className="speech-html macbook-speech" data-who="macbook">
            <SpeechBubble
              key={copy.title}
              speaker="MacBook"
              text={copy.tour}
              actions={copy.actions}
              reducedMotion={reducedMotion}
              tail="left"
            />
          </div>
        </Html>
      ) : null}
    </group>
  );
}
