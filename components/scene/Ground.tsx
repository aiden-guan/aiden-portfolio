"use client";

import { useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { meadowMouse, meadowPointer, PART_RADIUS } from "@/lib/meadow-mouse";

const FIELD = 70;

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
    vec3 soil = mix(vec3(0.07, 0.09, 0.07), vec3(0.12, 0.16, 0.11), n);
    vec3 wet = vec3(0.09, 0.12, 0.14);
    vec3 col = mix(soil, wet, 0.35);

    float part = 1.0 - smoothstep(0.0, uRadius * 1.05, length(vWorld.xz - uMouse.xz));
    col = mix(col, vec3(0.16, 0.14, 0.10), part * 0.7);

    float steps = 7.0;
    col = floor(col * steps + 0.5) / steps;
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function Ground({
  onProbe,
}: {
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
        uniforms: {
          uMouse: { value: meadowMouse },
          uRadius: { value: PART_RADIUS },
        },
      }),
    [],
  );

  useFrame(() => {
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
        onProbe?.(meadowMouse);
      }}
    >
      <planeGeometry args={[FIELD, FIELD, 1, 1]} />
    </mesh>
  );
}
