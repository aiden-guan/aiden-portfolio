"use client";

import { founder, getRelic, links, mailbox, type InspectSubject } from "@/lib/content";

type DialogueAction = {
  href: string;
  label: string;
  fill?: boolean;
};

function ActionLink({ href, label, fill }: DialogueAction) {
  const external = !href.startsWith("mailto:");
  return (
    <a
      className={fill ? "pixel-btn pixel-btn-fill" : "pixel-btn"}
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {label}
      {external ? (
        <span className="pixel-btn-icon" aria-hidden>
          ↗
        </span>
      ) : null}
    </a>
  );
}

export function DialogueBox({
  subject,
  onClose,
}: {
  subject: InspectSubject;
  onClose: () => void;
}) {
  const copy =
    subject.type === "about"
      ? {
          title: founder.name,
          body: founder.about,
          actions: [{ href: links.github, label: "GitHub", fill: true }] satisfies DialogueAction[],
        }
      : subject.type === "contact"
        ? {
            title: mailbox.title,
            body: mailbox.blurb,
            actions: [
              { href: links.email, label: mailbox.email, fill: true },
              { href: links.linkedin, label: "LinkedIn" },
            ] satisfies DialogueAction[],
          }
        : (() => {
            const relic = getRelic(subject.id);
            if (!relic) return null;
            const actions: DialogueAction[] = [];
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
              actions,
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
            {copy.actions.map((action) => (
              <ActionLink key={action.href} {...action} />
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
