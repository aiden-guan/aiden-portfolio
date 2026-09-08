"use client";

import { founder, relics, type InspectSubject } from "@/lib/content";
import { canInspect, type CutscenePhase } from "@/lib/cutscene";

export function GameHud({
  phase,
  discovered,
  showAll,
  onToggleAll,
  onInspect,
  onSkip,
}: {
  phase: CutscenePhase;
  discovered: string[];
  showAll: boolean;
  onToggleAll: () => void;
  onInspect: (subject: InspectSubject) => void;
  onSkip: () => void;
}) {
  const found = discovered.length;
  const total = relics.length;
  const playable = canInspect(phase);
  const hint = playable
    ? found === 0
      ? "The laptop will talk. Drag to look around."
      : found < total
        ? `${total} buried. ${found} found.`
        : "You found everything."
    : phase === "awaiting"
      ? "The clearing is empty."
      : "…";

  return (
    <div className="hud">
      <header className="hud-plaque">
        <p className="hud-name">{founder.name}</p>
        <p className="hud-tag">{founder.tagline}</p>
      </header>

      <div className="hud-tools">
        {playable ? (
          <button type="button" className="pixel-btn pixel-btn-tiny" onClick={onToggleAll}>
            {showAll ? "Hide list" : "Show all"}
          </button>
        ) : (
          <button type="button" className="pixel-btn pixel-btn-tiny" onClick={onSkip}>
            Skip intro
          </button>
        )}
      </div>

      {showAll && playable ? (
        <nav className="hud-list" aria-label="Buried work">
          {relics.map((relic) => (
            <button
              key={relic.id}
              type="button"
              className="hud-list-item"
              onClick={() => onInspect({ type: "relic", id: relic.id })}
            >
              <span
                className="hud-dot"
                style={{ background: relic.accent }}
                data-found={discovered.includes(relic.id) ? "true" : "false"}
              />
              <span>{relic.title}</span>
            </button>
          ))}
          <button
            type="button"
            className="hud-list-item"
            onClick={() => onInspect({ type: "about" })}
          >
            <span className="hud-dot hud-dot-person" />
            <span>Aiden</span>
          </button>
          <button
            type="button"
            className="hud-list-item"
            onClick={() => onInspect({ type: "contact" })}
          >
            <span className="hud-dot hud-dot-mail" />
            <span>Write</span>
          </button>
        </nav>
      ) : null}

      <p className="hud-quest">{hint}</p>
      <div className="hud-frame" aria-hidden />
    </div>
  );
}
