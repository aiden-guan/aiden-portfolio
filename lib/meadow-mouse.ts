import * as THREE from "three";

/** Shared world-space pointer. Starts far away so the meadow is closed on boot. */
export const meadowMouse = new THREE.Vector3(80, 0, 80);

export const PART_RADIUS = 2.55;
export const REVEAL_RADIUS = 2.15;
export const FOUNDER_RADIUS = 1.85;
export const MAIL_RADIUS = 1.15;

export const meadowPointer = {
  armed: false,
};
