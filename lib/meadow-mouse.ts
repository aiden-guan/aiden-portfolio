import * as THREE from "three";
import { isCoarsePointer } from "@/lib/device";

/** Shared world-space pointer. Starts far away so the meadow is closed on boot. */
export const meadowMouse = new THREE.Vector3(80, 0, 80);

export const PART_RADIUS = 2.55;
export const REVEAL_RADIUS = 2.15;
export const FOUNDER_RADIUS = 1.85;
export const PATCH_RADIUS = 2.7;
export const MAIL_RADIUS = 1.15;

const FINE_DRAG_PX = 7;
const COARSE_DRAG_PX = 16;

export const meadowPointer = {
  armed: false,
  downX: 0,
  downY: 0,
  dragging: false,
  pressed: false,
};

function dragPx() {
  return isCoarsePointer() ? COARSE_DRAG_PX : FINE_DRAG_PX;
}

export function plantMeadowProbe(x: number, z: number) {
  meadowPointer.armed = true;
  meadowMouse.set(x, 0, z);
}

export function beginMeadowPointer(x: number, y: number) {
  meadowPointer.armed = true;
  meadowPointer.pressed = true;
  meadowPointer.dragging = false;
  meadowPointer.downX = x;
  meadowPointer.downY = y;
}

export function moveMeadowPointer(x: number, y: number) {
  if (!meadowPointer.pressed && isCoarsePointer()) return;
  meadowPointer.armed = true;
  if (!meadowPointer.pressed) return;
  if (Math.hypot(x - meadowPointer.downX, y - meadowPointer.downY) > dragPx()) {
    meadowPointer.dragging = true;
  }
}

export function endMeadowPointer() {
  meadowPointer.pressed = false;
}

/** Stop following the live pointer but keep the last world hit (touch probe). */
export function freezeMeadowProbe() {
  meadowPointer.pressed = false;
  meadowPointer.armed = false;
}

export function resetMeadowProbe() {
  meadowPointer.armed = false;
  meadowPointer.pressed = false;
  meadowMouse.set(80, 0, 80);
}

export function isInspectClick() {
  return !meadowPointer.dragging;
}
