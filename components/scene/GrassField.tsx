"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mailbox, relics } from "@/lib/content";
import { meadowMouse, PART_RADIUS } from "@/lib/meadow-mouse";

const FIELD = 52;
const CLEARING = 2.15;
const NEST_RADIUS: Record<string, number> = {
  sidespace: 1.35,
  milliondollarleaderboard: 1.2,
  corgi: 1.0,
};
const NESTS: { x: number; z: number; r: number }[] = [
  { x: 0, z: 0, r: CLEARING },
  ...relics.map((relic) => ({
    x: relic.position[0],
    z: relic.position[2],
    r: NEST_RADIUS[relic.id] ?? 1.1,
  })),
  { x: mailbox.position[0], z: mailbox.position[2], r: 0.55 },
];

const bladeVert = /* glsl */ `
  varying vec3 vColor;
  varying float vHeight;
  varying float vFlatten;

  uniform float uTime;
  uniform vec3 uMouse;
  uniform float uRadius;
  uniform float uWindStrength;

  void main() {
    #ifdef USE_INSTANCING_COLOR
      vColor = instanceColor;
    #else
      vColor = vec3(0.12, 0.22, 0.16);
    #endif
    float h = position.y;
    vHeight = h;

    vec3 worldRoot = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    vec2 delta = worldRoot.xz - uMouse.xz;
    float dist = length(delta);
    float flatten = 1.0 - smoothstep(0.0, uRadius, dist);
    flatten *= flatten;
    vFlatten = flatten;

    vec2 dir = dist > 0.001 ? normalize(delta) : vec2(0.0, 1.0);
    float wind = sin(uTime * 2.4 + worldRoot.x * 1.8 + worldRoot.z * 1.1)
      * 0.28 * uWindStrength * clamp(h / 0.5, 0.0, 1.4);

    vec3 transformed = position;
    transformed.x += wind + dir.x * flatten * h * 2.8;
    transformed.z += dir.y * flatten * h * 2.8;
    float shrink = mix(1.0, 0.04, flatten);
    transformed.x *= shrink;
    transformed.z *= shrink;
    transformed.y *= mix(1.0, 0.05, flatten);

    vec4 world = modelMatrix * instanceMatrix * vec4(transformed, 1.0);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const bladeFrag = /* glsl */ `
  varying vec3 vColor;
  varying float vHeight;
  varying float vFlatten;

  void main() {
    float tip = smoothstep(0.08, 0.82, vHeight);
    vec3 col = mix(vColor * 0.55, vColor * 1.05, tip);
    col = mix(col, vec3(0.12, 0.14, 0.10), vFlatten * 0.55);
    float steps = 7.0;
    col = floor(col * steps + 0.5) / steps;
    gl_FragColor = vec4(col, 1.0);
  }
`;

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function bladeCount(reducedMotion: boolean) {
  if (typeof window === "undefined") return 6000;
  const mobile = window.matchMedia("(max-width: 768px)").matches;
  if (reducedMotion) return 8000;
  if (mobile) return 16000;
  return 42000;
}

export function GrassField({ reducedMotion }: { reducedMotion: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const count = useMemo(() => bladeCount(reducedMotion), [reducedMotion]);

  const geometry = useMemo(() => {
    const geo = new THREE.ConeGeometry(0.085, 0.56, 3);
    geo.translate(0, 0.26, 0);
    return geo;
  }, []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: bladeVert,
        fragmentShader: bladeFrag,
        uniforms: {
          uTime: { value: 0 },
          uMouse: { value: meadowMouse },
          uRadius: { value: PART_RADIUS },
          uWindStrength: { value: reducedMotion ? 0 : 1 },
        },
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    [reducedMotion],
  );

  const colors = useMemo(() => {
    const rand = mulberry32(20260902);
    const dummy = new THREE.Object3D();
    const palette = [
      new THREE.Color("#1c4a32"),
      new THREE.Color("#246040"),
      new THREE.Color("#2d7348"),
      new THREE.Color("#1a3c2c"),
      new THREE.Color("#348050"),
      new THREE.Color("#3d6b45"),
    ];
    const color = new THREE.Color();
    const list: { matrix: THREE.Matrix4; color: THREE.Color }[] = [];

    let placed = 0;
    let attempts = 0;
    while (placed < count && attempts < count * 8) {
      attempts += 1;
      const x = (rand() - 0.5) * FIELD;
      const z = (rand() - 0.5) * FIELD;
      if (NESTS.some((nest) => Math.hypot(x - nest.x, z - nest.z) < nest.r)) continue;
      dummy.position.set(x, 0, z);
      dummy.rotation.set((rand() - 0.5) * 0.25, rand() * Math.PI * 2, (rand() - 0.5) * 0.25);
      const sy = 0.75 + rand() * 0.75;
      dummy.scale.set(0.9 + rand() * 0.65, sy, 0.9 + rand() * 0.5);
      dummy.updateMatrix();
      color.copy(palette[Math.floor(rand() * palette.length)]);
      list.push({ matrix: dummy.matrix.clone(), color: color.clone() });
      placed += 1;
    }
    return list;
  }, [count]);

  useLayoutEffect(() => {
    const instance = mesh.current;
    if (!instance) return;
    instance.raycast = () => {};
    if (!instance.instanceColor) {
      instance.instanceColor = new THREE.InstancedBufferAttribute(
        new Float32Array(colors.length * 3),
        3,
      );
    }
    colors.forEach((blade, index) => {
      instance.setMatrixAt(index, blade.matrix);
      instance.setColorAt(index, blade.color);
    });
    instance.instanceMatrix.needsUpdate = true;
    if (instance.instanceColor) instance.instanceColor.needsUpdate = true;
    instance.count = colors.length;
  }, [colors]);

  useFrame((state) => {
    material.uniforms.uTime.value = reducedMotion ? 0 : state.clock.elapsedTime;
    material.uniforms.uWindStrength.value = reducedMotion ? 0.2 : 1;
  });

  return (
    <instancedMesh
      ref={mesh}
      args={[geometry, material, Math.max(colors.length, 1)]}
      frustumCulled={false}
    />
  );
}
