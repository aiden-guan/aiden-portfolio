"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { DialogueBox } from "@/components/hud/DialogueBox";
import { GameHud } from "@/components/hud/GameHud";
import { ImpactOverlay } from "@/components/hud/ImpactOverlay";
import { PixelCursor } from "@/components/hud/PixelCursor";
import { relics, type InspectSubject } from "@/lib/content";
import {
  canInspect,
  cutsceneClock,
  isCinematic,
  type CursorKind,
  type CutscenePhase,
} from "@/lib/cutscene";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const MeadowCanvas = dynamic(
  () =>
    import("@/components/scene/MeadowCanvas").then((mod) => mod.MeadowCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="meadow-boot">
        <p>the meadow is waiting…</p>
      </div>
    ),
  },
);

export default function Home() {
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<CutscenePhase>("awaiting");
  const [inspect, setInspect] = useState<InspectSubject | null>(null);
  const [discovered, setDiscovered] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [cursor, setCursor] = useState<CursorKind>("grass");

  const onDiscover = useCallback((id: string) => {
    setDiscovered((current) =>
      current.includes(id) ? current : [...current, id],
    );
  }, []);

  const goPhase = useCallback((next: CutscenePhase) => {
    setPhase((current) => {
      if (current === "playable" && isCinematic(next)) return current;
      return next;
    });
  }, []);

  const skipIntro = useCallback(() => {
    setInspect(null);
    setShowAll(false);
    cutsceneClock.phase = "playable";
    cutsceneClock.t = 0;
    cutsceneClock.hasHold = false;
    setPhase("playable");
  }, []);

  const onInspect = useCallback(
    (subject: InspectSubject) => {
      if (!canInspect(phase)) return;
      setInspect(subject);
      if (subject.type === "relic") onDiscover(subject.id);
    },
    [onDiscover, phase],
  );

  useEffect(() => {
    cutsceneClock.phase = "awaiting";
    cutsceneClock.t = 0;
    cutsceneClock.hasHold = false;
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (inspect) {
          setInspect(null);
          setShowAll(false);
          return;
        }
        if (isCinematic(phase) || phase === "awaiting") skipIntro();
      }
      if ((event.key === "Enter" || event.key === " ") && (isCinematic(phase) || phase === "awaiting") && !inspect) {
        event.preventDefault();
        skipIntro();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inspect, phase, skipIntro]);

  return (
    <main className="meadow-root">
      <h1 className="sr-only">
        Aiden Guan — a night meadow with {relics.length} projects around an empty clearing
      </h1>
      <MeadowCanvas
        reducedMotion={reducedMotion}
        phase={phase}
        discovered={discovered}
        onPhase={goPhase}
        onInspect={onInspect}
        onDiscover={onDiscover}
        onHover={setCursor}
      />
      <GameHud
        phase={phase}
        discovered={discovered}
        showAll={showAll}
        onToggleAll={() => setShowAll((value) => !value)}
        onInspect={onInspect}
        onSkip={skipIntro}
      />
      {inspect ? (
        <DialogueBox subject={inspect} onClose={() => setInspect(null)} />
      ) : null}
      <ImpactOverlay active={phase === "impact"} />
      <PixelCursor kind={cursor} />
    </main>
  );
}
