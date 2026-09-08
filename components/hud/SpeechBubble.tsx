"use client";

import { useEffect, useState } from "react";
import { PixelAction, type PixelActionProps } from "@/components/hud/PixelAction";

export function SpeechBubble({
  speaker,
  text,
  actions,
  reducedMotion,
  tail = "left",
}: {
  speaker: string;
  text: string;
  actions?: PixelActionProps[];
  reducedMotion?: boolean;
  tail?: "left" | "center" | "none";
}) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    if (reducedMotion) return undefined;
    let index = 0;
    const id = window.setInterval(() => {
      index += 1;
      setShown(text.slice(0, index));
      if (index >= text.length) window.clearInterval(id);
    }, 28);
    return () => window.clearInterval(id);
  }, [text, reducedMotion]);

  const display = reducedMotion ? text : shown;
  const done = display.length >= text.length;

  return (
    <div className="speech-bubble" data-speaker={speaker.toLowerCase()} data-tail={tail}>
      <div className="speech-bubble-inner">
        <p className="speech-kicker">{speaker}</p>
        <p className="speech-text">
          {display}
          {!done ? <span className="speech-caret" aria-hidden /> : null}
        </p>
        {done && actions && actions.length > 0 ? (
          <div className="speech-actions">
            {actions.map((action) => (
              <PixelAction key={action.href} {...action} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
