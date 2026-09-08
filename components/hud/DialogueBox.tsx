"use client";

import { getSubjectCopy } from "@/lib/cutscene";
import type { InspectSubject } from "@/lib/content";
import { PixelAction } from "@/components/hud/PixelAction";

export function DialogueBox({
  subject,
  onClose,
}: {
  subject: InspectSubject;
  onClose: () => void;
}) {
  const copy = getSubjectCopy(subject);
  if (!copy) return null;

  return (
    <div className="dialogue-root">
      <div
        className="dialogue"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialogue-title"
      >
        <div className="dialogue-inner">
          <p className="dialogue-kicker">{copy.kicker}</p>
          <h2 id="dialogue-title">{copy.title}</h2>
          <p className="dialogue-body">{copy.body}</p>
          <div className="dialogue-actions">
            {copy.comingSoon ? (
              <span className="pixel-btn pixel-btn-fill pixel-btn-soon" aria-disabled="true">
                Coming soon
              </span>
            ) : null}
            {copy.actions.map((action) => (
              <PixelAction key={action.href} {...action} />
            ))}
            <button type="button" className="pixel-btn" onClick={onClose} autoFocus>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
