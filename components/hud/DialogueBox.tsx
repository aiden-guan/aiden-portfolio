"use client";

import { founder, getRelic, links, mailbox, type InspectSubject } from "@/lib/content";

export function DialogueBox({
  subject,
  onClose,
}: {
  subject: InspectSubject;
  onClose: () => void;
}) {
  const copy =
    subject.type === "about"
      ? { title: founder.name, body: founder.about, href: links.github, hrefLabel: "GitHub", extra: undefined }
      : subject.type === "contact"
        ? {
            title: mailbox.title,
            body: mailbox.blurb,
            href: links.github,
            hrefLabel: "GitHub",
            extra: { href: links.sidespace, label: "SideSpace" },
          }
        : (() => {
            const relic = getRelic(subject.id);
            if (!relic) return null;
            return {
              title: relic.collab ? `${relic.title} · collab` : relic.title,
              body: relic.blurb,
              href: relic.href ?? relic.github,
              hrefLabel: relic.href ? "Visit" : "GitHub",
              extra: relic.href && relic.github ? { href: relic.github, label: "Source" } : undefined,
            };
          })();

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
          <p className="dialogue-kicker">inspect</p>
          <h2 id="dialogue-title">{copy.title}</h2>
          <p className="dialogue-body">{copy.body}</p>
          <div className="dialogue-actions">
            {copy.href ? (
              <a className="pixel-btn pixel-btn-fill" href={copy.href} target="_blank" rel="noreferrer">
                {copy.hrefLabel}
                <span className="pixel-btn-icon" aria-hidden>
                  ↗
                </span>
              </a>
            ) : null}
            {copy.extra ? (
              <a className="pixel-btn" href={copy.extra.href} target="_blank" rel="noreferrer">
                {copy.extra.label}
                <span className="pixel-btn-icon" aria-hidden>
                  ↗
                </span>
              </a>
            ) : null}
            <button type="button" className="pixel-btn" onClick={onClose} autoFocus>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
