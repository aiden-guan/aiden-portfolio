"use client";

export type PixelActionProps = {
  href: string;
  label: string;
  fill?: boolean;
};

export function PixelAction({ href, label, fill }: PixelActionProps) {
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
