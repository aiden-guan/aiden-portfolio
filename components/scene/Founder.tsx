"use client";

import { useRef, type Ref } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SpeechBubble } from "@/components/hud/SpeechBubble";
import type { InspectSubject } from "@/lib/content";
import {
  aidenLine,
  cutsceneClock,
  founderOnStage,
  IDLE_STAND,
  laptopHolding,
  PHASE_DURATION,
  smoothstep,
  WALK_END,
  WALK_START,
  type CutscenePhase,
} from "@/lib/cutscene";
import { isInspectClick, meadowMouse } from "@/lib/meadow-mouse";

/** World height ≈ 2.4. Chunky voxel proportions so he matches the meadow props. */
const BODY = 2.4;
/** Laptop sits in the palms: a little forward of the palm midpoint so the chassis is not in the forearms. */
const HOLD_PALM_OFFSET = new THREE.Vector3(0, 0.02, 0.16);
/** Pickup start: low and forward of the torso, before palms close the lift. */
const HOLD_GRAB = new THREE.Vector3(0, 0.3, 0.88);
const PALM_A = new THREE.Vector3();
const PALM_B = new THREE.Vector3();
const PALM_MID = new THREE.Vector3();
const SKIN = "#edbc94";
const SHIRT = "#4d719c";
const PANTS = "#2a3840";
const SHOES = "#14181c";
const HAIR = "#3d2a1c";
const EYE = "#161410";

function Voxel({
  args,
  color,
  position,
  roughness = 0.86,
}: {
  args: [number, number, number];
  color: string;
  position?: [number, number, number];
  roughness?: number;
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} roughness={roughness} />
    </mesh>
  );
}

function armPose(
  group: THREE.Group | null,
  rotX: number,
  z: number,
  side: number,
  y = 0.7,
  spread = 0.26,
  rotY = 0,
) {
  if (!group) return;
  group.rotation.x = rotX;
  group.rotation.y = -side * rotY;
  group.rotation.z = side * 0.04;
  group.position.set(side * spread, y, z);
}

function Arm({
  inner,
  palm,
  side,
}: {
  inner: Ref<THREE.Group>;
  palm: Ref<THREE.Group>;
  side: number;
}) {
  return (
    <group ref={inner} position={[side * 0.26, 0.7, 0.02]}>
      <Voxel args={[0.16, 0.16, 0.34]} color={SHIRT} position={[0, 0, 0.15]} />
      <group ref={palm} position={[0, -0.01, 0.4]}>
        <Voxel args={[0.14, 0.12, 0.14]} color={SKIN} roughness={0.78} />
      </group>
    </group>
  );
}

function WorldSpeech({
  phase,
  reducedMotion,
}: {
  phase: CutscenePhase;
  reducedMotion: boolean;
}) {
  const spoken = aidenLine(phase);
  const show = Boolean(spoken) && founderOnStage(phase);
  if (!show) return null;

  return (
    <Html
      position={[0, 0.26, 0]}
      center
      sprite
      occlude={false}
      pointerEvents="none"
      zIndexRange={[22, 8]}
      style={{ pointerEvents: "none" }}
    >
      <div className="speech-html world-speech" data-who="aiden">
        <SpeechBubble
          key={spoken}
          speaker="Aiden"
          text={spoken}
          reducedMotion={reducedMotion}
          tail="center"
        />
      </div>
    </Html>
  );
}

export function Founder({
  onInspect,
  reducedMotion,
  phase,
  interactive,
}: {
  onInspect: (subject: InspectSubject) => void;
  reducedMotion: boolean;
  phase: CutscenePhase;
  interactive: boolean;
}) {
  const root = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const leftPalm = useRef<THREE.Group>(null);
  const rightPalm = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);
  const holdAnchor = useRef<THREE.Group>(null);
  const lookYaw = useRef(0);

  useFrame((state, delta) => {
    const group = root.current;
    if (!group) return;
    const onStage = founderOnStage(phase);
    group.visible = onStage;
    if (!onStage) {
      group.position.set(WALK_START.x, 0, WALK_START.z);
      cutsceneClock.hasHold = false;
      return;
    }

    const t = cutsceneClock.t;
    const duration = PHASE_DURATION[phase];
    const u = duration === Number.POSITIVE_INFINITY ? 1 : THREE.MathUtils.clamp(t / duration, 0, 1);
    const walking = phase === "walkIn" || phase === "toCenter";
    const walkU = walking ? smoothstep(u) : 1;
    const grabbing = phase === "pickup";
    const holding = laptopHolding(phase);
    const reach = grabbing ? smoothstep(THREE.MathUtils.clamp(u / 0.38, 0, 1)) : 0;
    const lift = grabbing && u > 0.38 ? smoothstep((u - 0.38) / 0.62) : grabbing ? 0 : holding ? 1 : 0;

    let x = IDLE_STAND.x;
    let z = IDLE_STAND.z;
    if (phase === "walkIn") {
      x = THREE.MathUtils.lerp(WALK_START.x, WALK_END.x, walkU);
      z = THREE.MathUtils.lerp(WALK_START.z, WALK_END.z, walkU);
    } else if (
      phase === "notice" ||
      phase === "pickup" ||
      phase === "foundYou" ||
      phase === "fourthWall"
    ) {
      x = WALK_END.x;
      z = WALK_END.z;
    } else if (phase === "toCenter") {
      x = THREE.MathUtils.lerp(WALK_END.x, IDLE_STAND.x, walkU);
      z = THREE.MathUtils.lerp(WALK_END.z, IDLE_STAND.z, walkU);
    }

    const bob =
      walking && !reducedMotion
        ? Math.abs(Math.sin(t * 8.2)) * 0.05
        : Math.sin(state.clock.elapsedTime * 1.6) * 0.018;
    group.position.set(x, bob, z);

    const walkYaw = Math.atan2(WALK_END.x - WALK_START.x, WALK_END.z - WALK_START.z);
    const centerYaw = Math.atan2(IDLE_STAND.x - WALK_END.x, IDLE_STAND.z - WALK_END.z);
    const laptopYaw = Math.atan2(-x, -z);
    const camYaw = Math.atan2(state.camera.position.x - x, state.camera.position.z - z);
    const lookAtYou = reducedMotion
      ? 1
      : phase === "foundYou"
        ? smoothstep(THREE.MathUtils.clamp((t - 1.45) / 0.28, 0, 1))
        : phase === "fourthWall" || phase === "handoff"
          ? 1
          : 0;
    let yaw = laptopYaw;
    if (phase === "walkIn") yaw = walkYaw;
    else if (phase === "toCenter") yaw = centerYaw;
    else if (phase === "foundYou" || phase === "fourthWall") {
      yaw = THREE.MathUtils.lerp(laptopYaw, camYaw, lookAtYou);
    } else if (phase === "handoff" || phase === "playable") yaw = camYaw * (phase === "playable" ? 0.18 : 1);
    const yawDamp =
      phase === "foundYou" || phase === "fourthWall" ? 18 : walking ? 8 : 5;
    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, yaw, yawDamp, delta);

    const swing = walking && !reducedMotion ? Math.sin(t * 8.2) * 0.55 : 0;
    if (leftLeg.current) leftLeg.current.rotation.x = walking ? -swing * 0.55 : grabbing ? 0.42 : 0.08;
    if (rightLeg.current) rightLeg.current.rotation.x = walking ? swing * 0.55 : grabbing ? 0.42 : 0.08;

    if (grabbing) {
      const rotX = THREE.MathUtils.lerp(1.12, 0.95, reach) - lift * 0.4;
      const armY = THREE.MathUtils.lerp(0.7, 0.58, reach * (1 - lift * 0.5));
      const armZ = THREE.MathUtils.lerp(0.02, 0.12, reach);
      const spread = THREE.MathUtils.lerp(0.26, 0.28, reach);
      const wrap = THREE.MathUtils.lerp(0, 0.1, reach);
      armPose(leftArm.current, rotX, armZ, -1, armY, spread, wrap);
      armPose(rightArm.current, rotX, armZ, 1, armY, spread, wrap);
    } else if (holding) {
      armPose(leftArm.current, 0.52, 0.04, -1, 0.7, 0.28, 0.1);
      armPose(rightArm.current, 0.52, 0.04, 1, 0.7, 0.28, 0.1);
    } else if (walking) {
      armPose(leftArm.current, 1.02 + swing, 0.02, -1);
      armPose(rightArm.current, 1.02 - swing, 0.02, 1);
    } else {
      armPose(leftArm.current, 0.72, 0.02, -1);
      armPose(rightArm.current, 0.72, 0.02, 1);
    }

    if (torso.current) {
      const crouch = grabbing ? reach * (1 - lift) * 0.16 : 0;
      torso.current.rotation.x = THREE.MathUtils.damp(
        torso.current.rotation.x,
        crouch,
        phase === "playable" ? 16 : 9,
        delta,
      );
    }

    if (head.current) {
      const lookUp =
        phase === "fourthWall" ||
        phase === "handoff" ||
        phase === "playable" ||
        (phase === "foundYou" && lookAtYou > 0.2);
      let target = THREE.MathUtils.clamp(meadowMouse.x * 0.08, -0.28, 0.28);
      if (grabbing) target = 0.08;
      if (holding && !grabbing && !lookUp) target = -0.05;
      if (lookUp) {
        target = THREE.MathUtils.clamp((state.camera.position.x - group.position.x) * 0.08, -0.5, 0.45);
      }
      if (phase === "playable" && !reducedMotion && Math.sin(state.clock.elapsedTime * 0.32) < 0.65) {
        target *= 0.2;
      }
      lookYaw.current = THREE.MathUtils.damp(
        lookYaw.current,
        target,
        phase === "foundYou" || phase === "fourthWall" ? 16 : 6,
        delta,
      );
      head.current.rotation.y = lookYaw.current;
      head.current.rotation.x = grabbing ? 0.16 : lookUp ? -0.22 : holding ? -0.08 : -0.12;
    }

    if (holdAnchor.current && torso.current && leftPalm.current && rightPalm.current) {
      torso.current.updateWorldMatrix(true, true);
      leftPalm.current.getWorldPosition(PALM_A);
      rightPalm.current.getWorldPosition(PALM_B);
      PALM_MID.addVectors(PALM_A, PALM_B).multiplyScalar(0.5);
      torso.current.worldToLocal(PALM_MID);
      PALM_MID.add(HOLD_PALM_OFFSET);
      if (grabbing) {
        holdAnchor.current.position.lerpVectors(HOLD_GRAB, PALM_MID, lift);
      } else {
        holdAnchor.current.position.copy(PALM_MID);
      }
      holdAnchor.current.rotation.set(-0.18, Math.PI, 0);
      holdAnchor.current.updateWorldMatrix(true, false);
      cutsceneClock.holdMatrix.copy(holdAnchor.current.matrixWorld);
      cutsceneClock.hasHold = holding || phase === "handoff";
    }
  });

  return (
    <group
      ref={root}
      position={[WALK_START.x, 0, WALK_START.z]}
      visible={false}
      onClick={(event) => {
        event.stopPropagation();
        if (!interactive || !isInspectClick()) return;
        onInspect({ type: "about" });
      }}
      onPointerOver={(event) => event.stopPropagation()}
    >
      <group ref={torso}>
        <group scale={BODY}>
          <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.38, 12]} />
            <meshBasicMaterial color="#0c140e" transparent opacity={0.5} />
          </mesh>

          <group ref={leftLeg} position={[-0.11, 0.4, 0.02]}>
            <Voxel args={[0.18, 0.36, 0.18]} color={PANTS} position={[0, -0.16, 0]} roughness={0.94} />
            <Voxel args={[0.18, 0.08, 0.24]} color={SHOES} position={[0, -0.38, 0.04]} roughness={1} />
          </group>
          <group ref={rightLeg} position={[0.11, 0.4, 0.02]}>
            <Voxel args={[0.18, 0.36, 0.18]} color={PANTS} position={[0, -0.16, 0]} roughness={0.94} />
            <Voxel args={[0.18, 0.08, 0.24]} color={SHOES} position={[0, -0.38, 0.04]} roughness={1} />
          </group>

          <Voxel args={[0.44, 0.4, 0.24]} color={SHIRT} position={[0, 0.64, 0.02]} />

          <group ref={head} position={[0, 0.98, 0.04]}>
            <Voxel args={[0.28, 0.28, 0.26]} color={SKIN} roughness={0.78} />
            <Voxel args={[0.04, 0.07, 0.05]} color={SKIN} position={[-0.16, 0.01, 0]} roughness={0.78} />
            <Voxel args={[0.04, 0.07, 0.05]} color={SKIN} position={[0.16, 0.01, 0]} roughness={0.78} />
            <Voxel args={[0.28, 0.08, 0.16]} color={HAIR} position={[0, 0.18, -0.05]} roughness={1} />
            <Voxel args={[0.045, 0.05, 0.03]} color={EYE} position={[-0.065, 0.0, 0.135]} roughness={0.55} />
            <Voxel args={[0.045, 0.05, 0.03]} color={EYE} position={[0.065, 0.0, 0.135]} roughness={0.55} />
            <Voxel args={[0.05, 0.018, 0.025]} color={HAIR} position={[0, -0.06, 0.135]} roughness={0.8} />
            <WorldSpeech phase={phase} reducedMotion={reducedMotion} />
          </group>

          <Arm inner={leftArm} palm={leftPalm} side={-1} />
          <Arm inner={rightArm} palm={rightPalm} side={1} />
        </group>

        <group ref={holdAnchor} position={[0, 1.16, 1.02]} rotation={[-0.18, Math.PI, 0]} />
      </group>
    </group>
  );
}
