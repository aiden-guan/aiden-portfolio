"use client";

import { founder, relics, type InspectSubject } from "@/lib/content";

export function GameHud({
  discovered,
  showAll,
  onToggleAll,
  onInspect,
}: {
  discovered: string[];
  showAll: boolean;
  onToggleAll: () => void;
  onInspect: (subject: InspectSubject) => void;
}) {
  const found = discovered.length;
  const total = relics.length;
  const hint =
    found === 0
      ? "Part the grass. Drag to look around."
      : found < total
        ? `${total} buried. ${found} found.`
        : "You found everything.";

  return (
    <div className="hud">
      <header className="hud-plaque">
        <p className="hud-name">{founder.name}</p>
        <p className="hud-tag">{founder.tagline}</p>
      </header>

      <div className="hud-tools">
        <button type="button" className="pixel-btn pixel-btn-tiny" onClick={onToggleAll}>
          {showAll ? "Hide list" : "Show all"}
        </button>
      </div>

      {showAll ? (
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
