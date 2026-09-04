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
  riderelay: 1.2,
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

function bladeSpacing(reducedMotion: boolean) {
  if (typeof window === "undefined") return 0.32;
  const mobile = window.matchMedia("(max-width: 768px)").matches;
  if (reducedMotion) return 0.32;
  if (mobile) return 0.26;
  return 0.2;
}

export function GrassField({ reducedMotion }: { reducedMotion: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const undergrowth = useRef<THREE.InstancedMesh>(null);
  const spacing = useMemo(() => bladeSpacing(reducedMotion), [reducedMotion]);

  const geometry = useMemo(() => {
    const geo = new THREE.ConeGeometry(0.1, 0.58, 3);
    geo.translate(0, 0.26, 0);
    return geo;
  }, []);

  const shortGeometry = useMemo(() => {
    const geo = new THREE.ConeGeometry(0.08, 0.34, 3);
    geo.translate(0, 0.17, 0);
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

  const layers = useMemo(() => {
    const dummy = new THREE.Object3D();
    const palette = [
      new THREE.Color("#1c4a32"),
      new THREE.Color("#246040"),
      new THREE.Color("#2d7348"),
      new THREE.Color("#1a3c2c"),
      new THREE.Color("#348050"),
      new THREE.Color("#3d6b45"),
    ];

    function plant(
      seed: number,
      step: number,
      offset: number,
      scaleY: [number, number],
      fat: number,
    ) {
      const rand = mulberry32(seed);
      const color = new THREE.Color();
      const list: { matrix: THREE.Matrix4; color: THREE.Color }[] = [];
      const cells = Math.ceil(FIELD / step);
      const origin = -FIELD / 2 + offset;
      const jitter = step * 0.38;
      for (let ix = 0; ix < cells; ix += 1) {
        for (let iz = 0; iz < cells; iz += 1) {
          const x = origin + ix * step + (rand() - 0.5) * jitter;
          const z = origin + iz * step + (rand() - 0.5) * jitter;
          if (NESTS.some((nest) => Math.hypot(x - nest.x, z - nest.z) < nest.r)) continue;
          dummy.position.set(x, 0, z);
          dummy.rotation.set((rand() - 0.5) * 0.28, rand() * Math.PI * 2, (rand() - 0.5) * 0.28);
          const sy = scaleY[0] + rand() * (scaleY[1] - scaleY[0]);
          dummy.scale.set(fat * (0.85 + rand() * 0.4), sy, fat * (0.85 + rand() * 0.35));
          dummy.updateMatrix();
          color.copy(palette[Math.floor(rand() * palette.length)]);
          list.push({ matrix: dummy.matrix.clone(), color: color.clone() });
        }
      }
      return list;
    }

    return {
      tall: plant(20260902, spacing, 0, [0.85, 1.55], 1),
      short: plant(20260917, spacing, spacing * 0.5, [0.7, 1.12], 0.92),
    };
  }, [spacing]);

  useLayoutEffect(() => {
    function fill(instance: THREE.InstancedMesh | null, blades: typeof layers.tall) {
      if (!instance) return;
      instance.raycast = () => {};
      if (!instance.instanceColor) {
        instance.instanceColor = new THREE.InstancedBufferAttribute(
          new Float32Array(blades.length * 3),
          3,
        );
      }
      blades.forEach((blade, index) => {
        instance.setMatrixAt(index, blade.matrix);
        instance.setColorAt(index, blade.color);
      });
      instance.instanceMatrix.needsUpdate = true;
      if (instance.instanceColor) instance.instanceColor.needsUpdate = true;
      instance.count = blades.length;
    }
    fill(mesh.current, layers.tall);
    fill(undergrowth.current, layers.short);
  }, [layers]);

  useFrame((state) => {
    material.uniforms.uTime.value = reducedMotion ? 0 : state.clock.elapsedTime;
    material.uniforms.uWindStrength.value = reducedMotion ? 0.2 : 1;
  });

  return (
    <group>
      <instancedMesh
        ref={mesh}
        args={[geometry, material, Math.max(layers.tall.length, 1)]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={undergrowth}
        args={[shortGeometry, material, Math.max(layers.short.length, 1)]}
        frustumCulled={false}
      />
    </group>
  );
}
