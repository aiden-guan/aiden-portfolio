"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { HERO_CAMERA_TARGET } from "@/lib/cutscene";
import { isCompactScene } from "@/lib/device";

const CLEARING = 14.8;
const OUTER = 62;

const treeTarget = { value: HERO_CAMERA_TARGET.clone() };

function withCameraFade(material: THREE.MeshBasicMaterial) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTarget = treeTarget;
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
        varying float vGhost;
        varying vec3 vWorldFade;
        uniform vec3 uTarget;`,
      )
      .replace(
        "#include <project_vertex>",
        `#include <project_vertex>
        vec4 worldFade = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          worldFade = instanceMatrix * worldFade;
        #endif
        worldFade = modelMatrix * worldFade;
        vWorldFade = worldFade.xyz;
        vec3 origin;
        float rad;
        #ifdef USE_INSTANCING
          origin = (modelMatrix * instanceMatrix * vec4(0.0, 0.42, 0.0, 1.0)).xyz;
          rad = max(
            length((instanceMatrix * vec4(1.0, 0.0, 0.0, 0.0)).xyz),
            length((instanceMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz) * 0.55
          );
        #else
          origin = (modelMatrix * vec4(0.0, 0.42, 0.0, 1.0)).xyz;
          rad = 2.0;
        #endif
        float envelope = rad + 6.5;
        float inside = 1.0 - smoothstep(envelope * 0.12, envelope, distance(cameraPosition, origin));
        vec3 pa = origin - cameraPosition;
        vec3 ba = uTarget - cameraPosition;
        float t = clamp(dot(pa, ba) / max(dot(ba, ba), 0.0001), 0.0, 1.0);
        float blocking = 1.0 - smoothstep(rad * 0.15, rad * 1.35, length(pa - ba * t));
        blocking *= 1.0 - smoothstep(7.0, 16.0, length(pa));
        vGhost = max(inside, blocking);`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        varying float vGhost;
        varying vec3 vWorldFade;`,
      )
      .replace(
        "#include <opaque_fragment>",
        `float camDist = distance(vWorldFade, cameraPosition);
        if (vGhost > 0.28 || camDist < 9.2) discard;
        float nearFade = smoothstep(9.2, 13.5, camDist);
        float fade = nearFade * (1.0 - vGhost);
        vec2 grid = floor(gl_FragCoord.xy * 0.22);
        float dither = fract(grid.x * 0.37 + grid.y * 0.61 + grid.x * grid.y * 0.09);
        if (dither > fade) discard;
        #include <opaque_fragment>`,
      );
  };
  material.customProgramCacheKey = () => "tree-cam-fade-v5";
  return material;
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function treeBudget() {
  if (typeof window === "undefined") return 220;
  return isCompactScene() ? 160 : 260;
}

type Tree = {
  x: number;
  z: number;
  rot: number;
  leanX: number;
  leanZ: number;
  girth: number;
  height: number;
  spread: number;
  layers: number;
  color: THREE.Color;
};

function plantForest(count: number) {
  const rand = mulberry32(20260907);
  const palette = [
    new THREE.Color("#1a4a32"),
    new THREE.Color("#21563a"),
    new THREE.Color("#163c28"),
    new THREE.Color("#246844"),
    new THREE.Color("#1c5234"),
    new THREE.Color("#0f3024"),
    new THREE.Color("#2a6a48"),
    new THREE.Color("#184636"),
  ];
  const trees: Tree[] = [];

  function add(x: number, z: number, scale: number) {
    const minDist = 1.08 + scale * 0.2;
    for (let i = 0; i < trees.length; i += 1) {
      if (Math.hypot(trees[i].x - x, trees[i].z - z) < minDist) return false;
    }
    const layers = scale > 1.2 ? 3 : 2;
    trees.push({
      x,
      z,
      rot: rand() * Math.PI * 2,
      leanX: (rand() - 0.5) * 0.06,
      leanZ: (rand() - 0.5) * 0.06,
      girth: 0.78 + rand() * 0.5,
      height: scale,
      spread: 0.92 + rand() * 0.42,
      layers,
      color: palette[Math.floor(rand() * palette.length)].clone(),
    });
    return true;
  }

  const rings = [
    { radius: 15.2, jitter: 0.55, n: 84, scale: [1.25, 1.85] as const },
    { radius: 17.1, jitter: 0.7, n: 78, scale: [1.4, 2.05] as const },
    { radius: 19.6, jitter: 0.95, n: 72, scale: [1.55, 2.25] as const },
    { radius: 23.0, jitter: 1.2, n: 64, scale: [1.7, 2.5] as const },
    { radius: 27.6, jitter: 1.5, n: 58, scale: [1.85, 2.75] as const },
    { radius: 33.4, jitter: 1.9, n: 52, scale: [2.0, 3.0] as const },
    { radius: 41.0, jitter: 2.4, n: 46, scale: [2.15, 3.25] as const },
    { radius: 50.0, jitter: 2.8, n: 40, scale: [2.3, 3.5] as const },
    { radius: 58.5, jitter: 2.2, n: 32, scale: [2.5, 3.7] as const },
  ];

  for (const ring of rings) {
    for (let i = 0; i < ring.n; i += 1) {
      const a = (i / ring.n) * Math.PI * 2 + (rand() - 0.5) * 0.1;
      const r = ring.radius + (rand() - 0.5) * ring.jitter * 2;
      if (r < CLEARING || r > OUTER) continue;
      const scale = ring.scale[0] + rand() * (ring.scale[1] - ring.scale[0]);
      add(Math.cos(a) * r, Math.sin(a) * r, scale);
    }
  }

  let guard = 0;
  while (trees.length < count && guard < count * 22) {
    guard += 1;
    const u = rand() < 0.5 ? rand() * rand() : rand();
    const r = CLEARING + 0.2 + u * (OUTER - CLEARING);
    const a = rand() * Math.PI * 2;
    const scale = 1.05 + rand() * 1.9 + (r > 32 ? 0.55 : 0);
    add(Math.cos(a) * r, Math.sin(a) * r, scale);
  }

  return trees;
}

export function Forest() {
  const trunks = useRef<THREE.InstancedMesh>(null);
  const canopy = useRef<THREE.InstancedMesh>(null);
  const count = useMemo(() => treeBudget(), []);
  const trees = useMemo(() => plantForest(count), [count]);

  const trunkGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(0.22, 0.4, 1, 5);
    geo.translate(0, 0.5, 0);
    return geo;
  }, []);

  const canopyGeo = useMemo(() => {
    const geo = new THREE.ConeGeometry(1, 1, 6);
    geo.translate(0, 0.5, 0);
    return geo;
  }, []);

  const trunkMat = useMemo(
    () => withCameraFade(new THREE.MeshBasicMaterial({ color: "#3a281c" })),
    [],
  );
  const canopyMat = useMemo(
    () => withCameraFade(new THREE.MeshBasicMaterial({ color: "#ffffff" })),
    [],
  );

  const canopyCount = useMemo(
    () => trees.reduce((sum, tree) => sum + tree.layers, 0),
    [trees],
  );

  useLayoutEffect(() => {
    const trunkMesh = trunks.current;
    const canopyMesh = canopy.current;
    if (!trunkMesh || !canopyMesh) return;
    trunkMesh.raycast = () => {};
    canopyMesh.raycast = () => {};

    if (!canopyMesh.instanceColor) {
      canopyMesh.instanceColor = new THREE.InstancedBufferAttribute(
        new Float32Array(canopyCount * 3),
        3,
      );
    }

    const dummy = new THREE.Object3D();
    let canopyIndex = 0;
    trees.forEach((tree, index) => {
      dummy.position.set(tree.x, 0, tree.z);
      dummy.rotation.set(tree.leanX, tree.rot, tree.leanZ);
      dummy.scale.set(tree.girth * tree.height, 2.45 * tree.height, tree.girth * tree.height);
      dummy.updateMatrix();
      trunkMesh.setMatrixAt(index, dummy.matrix);

      const lifts =
        tree.layers === 3
          ? [
              { y: 1.7, r: 1.95, h: 2.55 },
              { y: 3.15, r: 1.42, h: 2.2 },
              { y: 4.45, r: 0.9, h: 1.85 },
            ]
          : [
              { y: 1.55, r: 1.62, h: 2.35 },
              { y: 2.95, r: 1.05, h: 2.0 },
            ];

      lifts.forEach((lift) => {
        dummy.position.set(tree.x, lift.y * tree.height, tree.z);
        dummy.rotation.set(tree.leanX * 0.55, tree.rot, tree.leanZ * 0.55);
        dummy.scale.set(
          lift.r * tree.spread * tree.height,
          lift.h * tree.spread,
          lift.r * tree.spread * tree.height,
        );
        dummy.updateMatrix();
        canopyMesh.setMatrixAt(canopyIndex, dummy.matrix);
        canopyMesh.setColorAt(canopyIndex, tree.color);
        canopyIndex += 1;
      });
    });

    trunkMesh.count = trees.length;
    canopyMesh.count = canopyIndex;
    trunkMesh.instanceMatrix.needsUpdate = true;
    canopyMesh.instanceMatrix.needsUpdate = true;
    if (canopyMesh.instanceColor) canopyMesh.instanceColor.needsUpdate = true;
  }, [canopyCount, trees]);

  useFrame((state) => {
    const controls = state.controls as unknown as { target?: THREE.Vector3 } | undefined;
    treeTarget.value.copy(controls?.target ?? HERO_CAMERA_TARGET);
  });

  return (
    <group>
      <mesh position={[0, 12, 0]} frustumCulled={false} raycast={() => {}}>
        <cylinderGeometry args={[48, 56, 32, 32, 1, true]} />
        <meshBasicMaterial color="#102018" side={THREE.BackSide} />
      </mesh>
      <instancedMesh
        ref={trunks}
        args={[trunkGeo, trunkMat, Math.max(trees.length, 1)]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={canopy}
        args={[canopyGeo, canopyMat, Math.max(canopyCount, 1)]}
        frustumCulled={false}
      />
    </group>
  );
}
