"use client";

import { useEffect, useState } from "react";
import { PixelAction, type PixelActionProps } from "@/components/hud/PixelAction";

const PAUSE_TOKEN = "{pause}";
const CHAR_MS = 28;
const PAUSE_MS = 1100;

function stripPauses(text: string) {
  return text.replaceAll(PAUSE_TOKEN, "");
}

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
  const plain = stripPauses(text);
  const [shown, setShown] = useState("");

  useEffect(() => {
    if (reducedMotion) {
      setShown(plain);
      return undefined;
    }
    setShown("");
    let index = 0;
    let timeout = 0;
    const tick = () => {
      if (index >= text.length) return;
      if (text.startsWith(PAUSE_TOKEN, index)) {
        index += PAUSE_TOKEN.length;
        timeout = window.setTimeout(tick, PAUSE_MS);
        return;
      }
      index += 1;
      setShown(stripPauses(text.slice(0, index)));
      if (index < text.length) timeout = window.setTimeout(tick, CHAR_MS);
    };
    timeout = window.setTimeout(tick, CHAR_MS);
    return () => window.clearTimeout(timeout);
  }, [plain, reducedMotion, text]);

  const display = reducedMotion ? plain : shown;
  const done = display.length >= plain.length;

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
