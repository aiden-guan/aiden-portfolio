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

export const HERO_CAMERA_POSITION = new THREE.Vector3(-2.4, 8.2, 13.4);
export const HERO_CAMERA_TARGET = new THREE.Vector3(0, 0.25, 0.15);

export const CRATER = {
  floor: 0.52,
  wall: 1.32,
  rim: 1.78,
  outer: 2.85,
  depth: 1.22,
  rimHeight: 0.52,
};

export const WALK_START = { x: -12.5, z: 5.2 };
/** West rim, facing the hole to grab the laptop. */
export const WALK_END = { x: -1.78, z: 0.42 };
/** West-south rim. Idle is sitting here after the intro, in profile to the hero camera. */
export const IDLE_STAND = { x: -1.68, z: 0.78 };

export const LAPTOP_STRIKE = new THREE.Vector3(0.12, 0.08, 0.04);
export const LAPTOP_CRASH = new THREE.Vector3(0.16, -0.48, 0.04);
export const LAPTOP_CRASH_EULER = new THREE.Euler(1.34, 0.92, 0.5);
export const LAPTOP_FALL_Y = 9.8;
export const LAPTOP_SCALE = 2.05;
export const HELD_SCALE = 0.92;

export const PHASE_DURATION: Record<CutscenePhase, number> = {
  awaiting: Number.POSITIVE_INFINITY,
  falling: 1.28,
  impact: 0.78,
  walkIn: 2.35,
  notice: 1.85,
  pickup: 1.35,
  foundYou: 2.2,
  fourthWall: 5.4,
  toCenter: 1.2,
  handoff: 0.95,
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
  fourthWall: "Looks like we got an audience...{pause}\nhow about you show them around?",
};

export const cutsceneClock = {
  phase: "awaiting" as CutscenePhase,
  t: 0,
  holdMatrix: new THREE.Matrix4(),
  hasHold: false,
};

/** Wall-clock age of the contact burst. -1 means the laptop has not struck yet. */
export const impactFX = {
  age: -1,
};

export const grassPulse = {
  x: 0,
  z: 0,
  radius: 2.55,
  strength: 0,
};

export function resetImpactFX() {
  impactFX.age = -1;
}

export function strikeImpact() {
  if (impactFX.age < 0) impactFX.age = 0;
}

export function impactLive() {
  return impactFX.age >= 0;
}

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

export function craterFormed(phase: CutscenePhase) {
  return phase !== "awaiting" && phase !== "falling";
}

export function craterAmount(phase: CutscenePhase, _t?: number) {
  if (impactFX.age >= 0) {
    const punch = Math.exp(-Math.min(impactFX.age, 3) * 16);
    return 1 + punch * 0.4;
  }
  return craterFormed(phase) ? 1 : 0;
}

export function founderSitting(phase: CutscenePhase) {
  return phase === "handoff" || phase === "playable";
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
      comingSoon: false,
      actions: [{ href: links.github, label: "GitHub", fill: true }],
    };
  }
  if (subject.type === "contact") {
    return {
      title: mailbox.title,
      body: mailbox.blurb,
      tour: mailbox.tourLine,
      kicker: "inspect",
      comingSoon: false,
      actions: [
        { href: links.email, label: mailbox.email, fill: true },
        { href: links.linkedin, label: "LinkedIn" },
      ],
    };
  }
  const relic = getRelic(subject.id);
  if (!relic) return null;
  const actions: { href: string; label: string; fill?: boolean }[] = [];
  if (!relic.comingSoon) {
    if (relic.href) actions.push({ href: relic.href, label: "Visit", fill: true });
    if (relic.github) {
      actions.push({
        href: relic.github,
        label: relic.href ? "Source" : "GitHub",
        fill: !relic.href,
      });
    }
  }
  return {
    title: relic.collab ? `${relic.title} · collab` : relic.title,
    body: relic.blurb,
    tour: relic.tourLine,
    kicker: relic.comingSoon ? "coming soon" : "inspect",
    comingSoon: Boolean(relic.comingSoon),
    actions,
  };
}

export function fallingLaptopPose(u: number, outPos: THREE.Vector3, outEuler: THREE.Euler) {
  const drop = 0.18 * u + 0.82 * easeInCubic(u);
  outPos.set(
    Math.sin(u * 1.35) * 0.72,
    THREE.MathUtils.lerp(LAPTOP_FALL_Y, LAPTOP_STRIKE.y, drop),
    Math.cos(u * 0.95) * 0.4,
  );
  outEuler.set(0.48 + u * 1.22, 0.16 + u * 1.12, 0.28 + u * 0.34);
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
