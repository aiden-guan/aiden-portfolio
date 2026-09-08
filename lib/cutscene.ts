import * as THREE from "three";
import { founder, getRelic, links, mailbox, relics, type InspectSubject } from "@/lib/content";
import { FOUNDER_RADIUS, MAIL_RADIUS, REVEAL_RADIUS } from "@/lib/meadow-mouse";

export type CutscenePhase =
  | "awaiting"
  | "falling"
  | "impact"
  | "walkIn"
  | "notice"
  | "pickup"
  | "foundYou"
  | "fourthWall"
  | "toCenter"
  | "handoff"
  | "playable";

export type CursorKind = "grass" | "hot" | "exclaim";

export const CUTSCENE_STORAGE_KEY = "meadow-intro-done";

export const HERO_CAMERA_POSITION = new THREE.Vector3(0, 12.8, 16.0);
export const HERO_CAMERA_TARGET = new THREE.Vector3(0, 1.4, 0);

export const WALK_START = { x: -12.5, z: 5.2 };
export const WALK_END = { x: -1.15, z: 0.42 };
export const IDLE_STAND = { x: 0, z: 0 };

export const LAPTOP_GROUND = new THREE.Vector3(0, 0.28, 0);
export const LAPTOP_FALL_Y = 9.4;
export const LAPTOP_SCALE = 2.05;
export const HELD_SCALE = 0.92;

export const PHASE_DURATION: Record<CutscenePhase, number> = {
  awaiting: Number.POSITIVE_INFINITY,
  falling: 1.22,
  impact: 0.4,
  walkIn: 2.35,
  notice: 1.85,
  pickup: 1.35,
  foundYou: 2.2,
  fourthWall: 4.1,
  toCenter: 1.55,
  handoff: 0.85,
  playable: Number.POSITIVE_INFINITY,
};

export const PHASE_NEXT: Partial<Record<CutscenePhase, CutscenePhase>> = {
  falling: "impact",
  impact: "walkIn",
  walkIn: "notice",
  notice: "pickup",
  pickup: "foundYou",
  foundYou: "fourthWall",
  fourthWall: "toCenter",
  toCenter: "handoff",
  handoff: "playable",
};

export const AIDEN_LINES: Partial<Record<CutscenePhase, string>> = {
  notice: "Oh, there it is!",
  foundYou: "I've been looking for you.",
  fourthWall: "Looks like we got an audience, how about you show them around?",
};

export const cutsceneClock = {
  phase: "awaiting" as CutscenePhase,
  t: 0,
  holdMatrix: new THREE.Matrix4(),
  hasHold: false,
};

export const grassPulse = {
  x: 0,
  z: 0,
  radius: 2.55,
  strength: 0,
};

export function canOrbit(phase: CutscenePhase) {
  return phase === "playable";
}

export function canInspect(phase: CutscenePhase) {
  return phase === "playable";
}

export function isCinematic(phase: CutscenePhase) {
  return phase !== "awaiting" && phase !== "playable";
}

export function founderOnStage(phase: CutscenePhase) {
  return (
    phase === "walkIn" ||
    phase === "notice" ||
    phase === "pickup" ||
    phase === "foundYou" ||
    phase === "fourthWall" ||
    phase === "toCenter" ||
    phase === "handoff" ||
    phase === "playable"
  );
}

export function laptopVisible(phase: CutscenePhase) {
  return phase !== "awaiting";
}

export function laptopHolding(phase: CutscenePhase) {
  return (
    phase === "pickup" ||
    phase === "foundYou" ||
    phase === "fourthWall" ||
    phase === "toCenter"
  );
}

export function aidenLine(phase: CutscenePhase) {
  return AIDEN_LINES[phase] ?? "";
}

export function readIntroDone() {
  try {
    return sessionStorage.getItem(CUTSCENE_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeIntroDone() {
  try {
    sessionStorage.setItem(CUTSCENE_STORAGE_KEY, "1");
  } catch {
    /* private mode */
  }
}

export function clearIntroDone() {
  try {
    sessionStorage.removeItem(CUTSCENE_STORAGE_KEY);
  } catch {
    /* private mode */
  }
}

export function getTourSubject(mouse: THREE.Vector3, allowAbout: boolean): InspectSubject | null {
  let best: InspectSubject | null = null;
  let bestD = REVEAL_RADIUS;

  for (const relic of relics) {
    const dist = Math.hypot(mouse.x - relic.position[0], mouse.z - relic.position[2]);
    if (dist < bestD) {
      bestD = dist;
      best = { type: "relic", id: relic.id };
    }
  }

  if (allowAbout) {
    const dist = Math.hypot(mouse.x - IDLE_STAND.x, mouse.z - IDLE_STAND.z);
    if (dist < Math.min(bestD, FOUNDER_RADIUS)) {
      bestD = dist;
      best = { type: "about" };
    }
  }

  const mailDist = Math.hypot(mouse.x - mailbox.position[0], mouse.z - mailbox.position[2]);
  if (mailDist < Math.min(bestD, MAIL_RADIUS)) {
    best = { type: "contact" };
  }

  return best;
}

export function getSubjectCopy(subject: InspectSubject) {
  if (subject.type === "about") {
    return {
      title: founder.name,
      body: founder.about,
      tour: founder.tourLine,
      kicker: "inspect",
      actions: [{ href: links.github, label: "GitHub", fill: true }],
    };
  }
  if (subject.type === "contact") {
    return {
      title: mailbox.title,
      body: mailbox.blurb,
      tour: mailbox.tourLine,
      kicker: "inspect",
      actions: [
        { href: links.email, label: mailbox.email, fill: true },
        { href: links.linkedin, label: "LinkedIn" },
      ],
    };
  }
  const relic = getRelic(subject.id);
  if (!relic) return null;
  const actions: { href: string; label: string; fill?: boolean }[] = [];
  if (relic.href) actions.push({ href: relic.href, label: "Visit", fill: true });
  if (relic.github) {
    actions.push({
      href: relic.github,
      label: relic.href ? "Source" : "GitHub",
      fill: !relic.href,
    });
  }
  return {
    title: relic.collab ? `${relic.title} · collab` : relic.title,
    body: relic.blurb,
    tour: relic.tourLine,
    kicker: "inspect",
    actions,
  };
}

export function easeInQuad(t: number) {
  return t * t;
}

export function easeInCubic(t: number) {
  return t * t * t;
}

export function easeOutCubic(t: number) {
  const x = 1 - t;
  return 1 - x * x * x;
}

export function smoothstep(t: number) {
  const x = THREE.MathUtils.clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}
