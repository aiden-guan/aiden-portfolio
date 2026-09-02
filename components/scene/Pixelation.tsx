"use client";

import { useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export function Pixelation({ factor = 2.2 }: { factor?: number }) {
  const gl = useThree((state) => state.gl);
  const size = useThree((state) => state.size);

  useLayoutEffect(() => {
    const canvas = gl.domElement;
    canvas.style.imageRendering = "pixelated";
    gl.setPixelRatio(1 / factor);
    gl.toneMapping = THREE.NoToneMapping;
  }, [gl, factor, size.width, size.height]);

  return null;
}
