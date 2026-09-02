"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { DialogueBox } from "@/components/hud/DialogueBox";
import { GameHud } from "@/components/hud/GameHud";
import { PixelCursor } from "@/components/hud/PixelCursor";
import { relics, type InspectSubject } from "@/lib/content";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const MeadowCanvas = dynamic(
  () =>
    import("@/components/scene/MeadowCanvas").then((mod) => mod.MeadowCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="meadow-boot">
        <p>walking into the field…</p>
      </div>
    ),
  },
);

export default function Home() {
  const reducedMotion = useReducedMotion();
  const [inspect, setInspect] = useState<InspectSubject | null>(null);
  const [discovered, setDiscovered] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [cursor, setCursor] = useState<"grass" | "hot">("grass");

  const onDiscover = useCallback((id: string) => {
    setDiscovered((current) =>
      current.includes(id) ? current : [...current, id],
    );
  }, []);

  const onInspect = useCallback(
    (subject: InspectSubject) => {
      setInspect(subject);
      if (subject.type === "relic") onDiscover(subject.id);
    },
    [onDiscover],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setInspect(null);
        setShowAll(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <main className="meadow-root">
      <h1 className="sr-only">
        Aiden Guan — part the grass to find {relics.length} buried projects
      </h1>
      <MeadowCanvas
        reducedMotion={reducedMotion}
        discovered={discovered}
        onInspect={onInspect}
        onDiscover={onDiscover}
        onHover={setCursor}
      />
      <GameHud
        discovered={discovered}
        showAll={showAll}
        onToggleAll={() => setShowAll((value) => !value)}
        onInspect={onInspect}
      />
      {inspect ? (
        <DialogueBox subject={inspect} onClose={() => setInspect(null)} />
      ) : null}
      <PixelCursor kind={cursor} />
    </main>
  );
}
