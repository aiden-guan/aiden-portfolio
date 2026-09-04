"use client";

import { useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export function Pixelation() {
  const gl = useThree((state) => state.gl);

  useLayoutEffect(() => {
    gl.domElement.style.imageRendering = "auto";
    gl.toneMapping = THREE.NoToneMapping;
  }, [gl]);

  return null;
}
