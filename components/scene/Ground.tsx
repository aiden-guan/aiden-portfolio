"use client";

import { useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CRATER, craterAmount, cutsceneClock, grassPulse, type CutscenePhase } from "@/lib/cutscene";
import {
  isInspectClick,
  meadowMouse,
  meadowPointer,
  PART_RADIUS,
  PATCH_RADIUS,
} from "@/lib/meadow-mouse";

const FIELD = 128;

const dirtUniforms = {
  uMouse: { value: meadowMouse },
  uRadius: { value: PART_RADIUS },
  uPulse: { value: new THREE.Vector3() },
  uPulseRadius: { value: 2.55 },
  uPulseStrength: { value: 0 },
  uCrater: { value: 0 },
  uCraterRadius: { value: 2.58 },
};

const dirtVert = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorld;
  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const dirtFrag = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorld;
  uniform vec3 uMouse;
  uniform float uRadius;
  uniform vec3 uPulse;
  uniform float uPulseRadius;
  uniform float uPulseStrength;
  uniform float uCrater;
  uniform float uCraterRadius;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    vec2 p = vWorld.xz * 0.55;
    float n = noise(p) * 0.55 + noise(p * 3.4) * 0.3 + noise(p * 8.0) * 0.15;
    vec3 soil = mix(vec3(0.08, 0.13, 0.08), vec3(0.13, 0.2, 0.11), n);
    vec3 wet = vec3(0.09, 0.14, 0.12);
    vec3 col = mix(soil, wet, 0.28);
    float woods = smoothstep(26.0, 52.0, length(vWorld.xz));
    col = mix(col, vec3(0.05, 0.09, 0.06), woods * 0.5);

    float crater = length(vWorld.xz);
    if (uCrater > 0.02 && crater < uCraterRadius * 0.98 * uCrater) discard;

    float part = 1.0 - smoothstep(0.0, uRadius * 1.05, length(vWorld.xz - uMouse.xz));
    col = mix(col, vec3(0.16, 0.14, 0.10), part * 0.7);
    float pulse = uPulseStrength * (1.0 - smoothstep(0.0, uPulseRadius, length(vWorld.xz - uPulse.xz)));
    col = mix(col, vec3(0.09, 0.07, 0.05), pulse * 0.8);
    float scorch = uCrater * (1.0 - smoothstep(uCraterRadius * 0.9, uCraterRadius * 1.35, crater));
    col = mix(col, vec3(0.08, 0.06, 0.04), scorch * 0.7);

    float steps = 14.0;
    col = floor(col * steps + 0.5) / steps;
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function Ground({
  phase,
  onStartCutscene,
  onProbe,
}: {
  phase: CutscenePhase;
  onStartCutscene: () => void;
  onProbe?: (point: THREE.Vector3) => void;
}) {
  const camera = useThree((state) => state.camera);
  const pointer = useThree((state) => state.pointer);
  const raycaster = useThree((state) => state.raycaster);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const hit = useMemo(() => new THREE.Vector3(), []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: dirtVert,
        fragmentShader: dirtFrag,
        uniforms: dirtUniforms,
      }),
    [],
  );

  useFrame(() => {
    dirtUniforms.uPulse.value.set(grassPulse.x, 0, grassPulse.z);
    dirtUniforms.uPulseRadius.value = grassPulse.radius;
    dirtUniforms.uPulseStrength.value = grassPulse.strength;
    dirtUniforms.uCrater.value = craterAmount(cutsceneClock.phase, cutsceneClock.t);
    dirtUniforms.uCraterRadius.value = CRATER.outer;
    if (!meadowPointer.armed) return;
    raycaster.setFromCamera(pointer, camera);
    if (raycaster.ray.intersectPlane(plane, hit)) {
      meadowMouse.set(hit.x, 0, hit.z);
    }
  });

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.01, 0]}
      material={material}
      onPointerMove={(event) => {
        meadowPointer.armed = true;
        meadowMouse.set(event.point.x, 0, event.point.z);
      }}
      onPointerDown={(event) => {
        meadowPointer.armed = true;
        meadowMouse.set(event.point.x, 0, event.point.z);
      }}
      onClick={(event) => {
        meadowPointer.armed = true;
        meadowMouse.set(event.point.x, 0, event.point.z);
        if (!isInspectClick()) return;
        if (phase === "awaiting") {
          if (Math.hypot(meadowMouse.x, meadowMouse.z) < PATCH_RADIUS) onStartCutscene();
          return;
        }
        if (phase !== "playable") return;
        onProbe?.(meadowMouse);
      }}
    >
      <planeGeometry args={[FIELD, FIELD, 1, 1]} />
    </mesh>
  );
}
