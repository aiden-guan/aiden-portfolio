import * as THREE from "three";

/** Shared world-space pointer. Starts far away so the meadow is closed on boot. */
export const meadowMouse = new THREE.Vector3(80, 0, 80);

export const PART_RADIUS = 2.55;
export const REVEAL_RADIUS = 2.15;
export const FOUNDER_RADIUS = 1.85;
export const PATCH_RADIUS = 2.7;
export const MAIL_RADIUS = 1.15;

const DRAG_PX = 7;

export const meadowPointer = {
  armed: false,
  downX: 0,
  downY: 0,
  dragging: false,
  pressed: false,
};

export function beginMeadowPointer(x: number, y: number) {
  meadowPointer.armed = true;
  meadowPointer.pressed = true;
  meadowPointer.dragging = false;
  meadowPointer.downX = x;
  meadowPointer.downY = y;
}

export function moveMeadowPointer(x: number, y: number) {
  meadowPointer.armed = true;
  if (!meadowPointer.pressed) return;
  if (Math.hypot(x - meadowPointer.downX, y - meadowPointer.downY) > DRAG_PX) {
    meadowPointer.dragging = true;
  }
}

export function endMeadowPointer() {
  meadowPointer.pressed = false;
}

export function isInspectClick() {
  return !meadowPointer.dragging;
}
