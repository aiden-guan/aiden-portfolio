"use client";

import { useRef, type Ref } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SpeechBubble } from "@/components/hud/SpeechBubble";
import type { InspectSubject } from "@/lib/content";
import {
  aidenLine,
  CRATER,
  cutsceneClock,
  founderOnStage,
  founderSitting,
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
/** Pickup start: low and into the crater, before palms close the lift. */
const HOLD_GRAB = new THREE.Vector3(0, 0.08, 1.12);
/**
 * Sit on the outer torus in profile. Face east so the hero camera (south)
 * sees his side, thighs drape toward the crater, and body yaw can stay frozen.
 */
const SIT_RADIUS = (CRATER.wall + CRATER.rim) * 0.5 + 0.26;
/** Face +X. Stable while sitting — camera/cursor never rotate the body. */
const SIT_YAW = Math.PI / 2;
/** Torso underside is local y 0.44. Rim peak is ~0.49; a little lift keeps voxels on top of the tube. */
const SIT_Y = 0.58 - 0.44 * BODY;
const SIT_HIP = -1.28;
const SIT_KNEE = 1.22;
const SIT_HIP_Z = -0.08;
const HEAD_YAW_LIMIT = 0.82;
const HEAD_PITCH_LIMIT = 0.32;
const PALM_A = new THREE.Vector3();
const PALM_B = new THREE.Vector3();
const PALM_MID = new THREE.Vector3();
const SKIN = "#edbc94";
const SHIRT = "#4d719c";
const PANTS = "#2a3840";
const SHOES = "#14181c";
const HAIR = "#3d2a1c";
const EYE = "#161410";

function wrapAngle(angle: number) {
  let a = angle;
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

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

function poseLeg(
  hip: THREE.Group | null,
  shin: THREE.Group | null,
  hipX: number,
  shinX: number,
  hipZ = 0.02,
) {
  if (hip) {
    hip.rotation.x = hipX;
    hip.position.z = hipZ;
  }
  if (shin) shin.rotation.x = shinX;
}

function Leg({
  hip,
  shin,
  side,
}: {
  hip: Ref<THREE.Group>;
  shin: Ref<THREE.Group>;
  side: number;
}) {
  return (
    <group ref={hip} position={[side * 0.13, 0.56, 0.02]}>
      <Voxel args={[0.2, 0.36, 0.2]} color={PANTS} position={[0, -0.18, 0]} roughness={0.94} />
      <group ref={shin} position={[0, -0.36, 0]}>
        <Voxel args={[0.18, 0.26, 0.18]} color={PANTS} position={[0, -0.13, 0]} roughness={0.94} />
        <Voxel args={[0.2, 0.09, 0.26]} color={SHOES} position={[0, -0.28, 0.05]} roughness={1} />
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
  const leftShin = useRef<THREE.Group>(null);
  const rightShin = useRef<THREE.Group>(null);
  const holdAnchor = useRef<THREE.Group>(null);
  const lookYaw = useRef(0);
  const lookPitch = useRef(0);
  const shadow = useRef<THREE.Mesh>(null);

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
    const sitting = founderSitting(phase);
    const sitU = sitting ? (phase === "handoff" && !reducedMotion ? smoothstep(u) : 1) : 0;
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
    const rimY = CRATER.rimHeight * 0.7;
    let y = bob;
    if (phase === "walkIn") {
      const stepUp = smoothstep(THREE.MathUtils.clamp((walkU - 0.76) / 0.24, 0, 1));
      y = THREE.MathUtils.lerp(bob, rimY + bob * 0.25, stepUp);
    } else if (
      phase === "notice" ||
      phase === "pickup" ||
      phase === "foundYou" ||
      phase === "fourthWall" ||
      phase === "toCenter"
    ) {
      y = rimY + bob * 0.22;
    } else if (sitting) {
      const fromR = Math.hypot(IDLE_STAND.x, IDLE_STAND.z);
      const radius = THREE.MathUtils.lerp(fromR, SIT_RADIUS, sitU);
      const scale = radius / fromR;
      x = IDLE_STAND.x * scale;
      z = IDLE_STAND.z * scale;
      y = THREE.MathUtils.lerp(rimY, SIT_Y, sitU);
    }
    group.position.set(x, y, z);

    const walkYaw = Math.atan2(WALK_END.x - WALK_START.x, WALK_END.z - WALK_START.z);
    const centerYaw = Math.atan2(IDLE_STAND.x - WALK_END.x, IDLE_STAND.z - WALK_END.z);
    const laptopYaw = Math.atan2(-x, -z);
    const camYaw = Math.atan2(state.camera.position.x - x, state.camera.position.z - z);
    const lookAtYou = reducedMotion
      ? 1
      : phase === "foundYou"
        ? smoothstep(THREE.MathUtils.clamp((t - 1.45) / 0.28, 0, 1))
        : phase === "fourthWall"
          ? 1
          : 0;
    let yaw = laptopYaw;
    if (phase === "walkIn") yaw = walkYaw;
    else if (phase === "toCenter") yaw = centerYaw;
    else if (phase === "foundYou" || phase === "fourthWall") {
      yaw = THREE.MathUtils.lerp(laptopYaw, camYaw, lookAtYou);
    } else if (sitU > 0.01) {
      yaw = THREE.MathUtils.lerp(yaw, SIT_YAW, sitU);
    }
    const yawDamp =
      phase === "foundYou" || phase === "fourthWall" ? 18 : walking ? 8 : 5;
    if (sitU === 1) {
      group.rotation.y = SIT_YAW;
    } else {
      group.rotation.y = THREE.MathUtils.damp(group.rotation.y, yaw, yawDamp, delta);
    }

    const swing = walking && !reducedMotion ? Math.sin(t * 8.2) * 0.55 : 0;
    if (walking && !reducedMotion) {
      poseLeg(leftLeg.current, leftShin.current, -swing * 0.55, Math.max(0, swing) * 0.35);
      poseLeg(rightLeg.current, rightShin.current, swing * 0.55, Math.max(0, -swing) * 0.35);
    } else if (grabbing) {
      poseLeg(leftLeg.current, leftShin.current, 0.28, 0.42);
      poseLeg(rightLeg.current, rightShin.current, 0.28, 0.42);
    } else {
      const hipX = THREE.MathUtils.lerp(0.06, SIT_HIP, sitU);
      const shinX = THREE.MathUtils.lerp(0, SIT_KNEE, sitU);
      const hipZ = THREE.MathUtils.lerp(0.02, SIT_HIP_Z, sitU);
      poseLeg(leftLeg.current, leftShin.current, hipX, shinX, hipZ);
      poseLeg(rightLeg.current, rightShin.current, hipX * 0.97, shinX * 0.94, hipZ);
    }

    if (grabbing) {
      const rotX = THREE.MathUtils.lerp(1.12, 0.95, reach) - lift * 0.4;
      const armY = THREE.MathUtils.lerp(0.7, 0.5, reach * (1 - lift * 0.5));
      const armZ = THREE.MathUtils.lerp(0.02, 0.18, reach);
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
    } else if (sitU > 0.01) {
      const rotX = THREE.MathUtils.lerp(0.72, 0.9, sitU);
      const armY = THREE.MathUtils.lerp(0.7, 0.54, sitU);
      const armZ = THREE.MathUtils.lerp(0.02, 0.1, sitU);
      armPose(leftArm.current, rotX, armZ, -1, armY, 0.22, 0.04);
      armPose(rightArm.current, rotX * 0.96, armZ, 1, armY, 0.22, 0.04);
    } else {
      armPose(leftArm.current, 0.72, 0.02, -1);
      armPose(rightArm.current, 0.72, 0.02, 1);
    }

    if (torso.current) {
      const crouch = grabbing ? reach * (1 - lift) * 0.28 : 0;
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
        (phase === "foundYou" && lookAtYou > 0.2);
      let yawTarget = THREE.MathUtils.clamp(meadowMouse.x * 0.08, -0.28, 0.28);
      let pitchTarget = grabbing
        ? 0.22
        : lookUp
          ? -0.22
          : holding
            ? -0.08
            : -0.12;
      if (grabbing) yawTarget = 0.08;
      else if (holding && !lookUp) yawTarget = -0.05;
      else if (lookUp) {
        yawTarget = THREE.MathUtils.clamp(
          (state.camera.position.x - group.position.x) * 0.08,
          -0.5,
          0.45,
        );
      }
      if (sitU > 0.4) {
        const bodyYaw = group.rotation.y;
        const cursorYaw = wrapAngle(
          Math.atan2(meadowMouse.x - group.position.x, meadowMouse.z - group.position.z) - bodyYaw,
        );
        const audienceYaw = wrapAngle(
          Math.atan2(
            state.camera.position.x - group.position.x,
            state.camera.position.z - group.position.z,
          ) - bodyYaw,
        );
        yawTarget = THREE.MathUtils.clamp(
          cursorYaw * 0.75 + audienceYaw * 0.25,
          -HEAD_YAW_LIMIT,
          HEAD_YAW_LIMIT,
        );
        pitchTarget = THREE.MathUtils.clamp(
          (state.camera.position.y - (group.position.y + BODY * 0.98)) * 0.05,
          -HEAD_PITCH_LIMIT,
          HEAD_PITCH_LIMIT,
        );
      }
      lookYaw.current = THREE.MathUtils.damp(
        lookYaw.current,
        yawTarget,
        phase === "foundYou" || phase === "fourthWall" || sitU > 0.4 ? 10 : 6,
        delta,
      );
      lookPitch.current = THREE.MathUtils.damp(lookPitch.current, pitchTarget, 8, delta);
      head.current.rotation.y = lookYaw.current;
      head.current.rotation.x = lookPitch.current;
    }

    if (shadow.current) shadow.current.visible = sitU < 0.35;

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
          <mesh ref={shadow} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.38, 12]} />
            <meshBasicMaterial color="#0c140e" transparent opacity={0.5} />
          </mesh>

          <Leg hip={leftLeg} shin={leftShin} side={-1} />
          <Leg hip={rightLeg} shin={rightShin} side={1} />

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
