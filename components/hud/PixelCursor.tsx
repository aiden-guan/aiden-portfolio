"use client";

import { useEffect, useRef } from "react";
import type { CursorKind } from "@/lib/cutscene";

export function PixelCursor({ kind }: { kind: CursorKind }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const move = (event: PointerEvent) => {
      node.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    <div
      ref={ref}
      className="pixel-cursor"
      data-kind={kind}
      aria-hidden
    >
      {kind === "exclaim" ? <ExclaimMark /> : kind === "hot" ? <SparkleMark /> : <HandMark />}
    </div>
  );
}

function HandMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" shapeRendering="crispEdges">
      <rect x="7" y="1" width="3" height="8" fill="#f4ead5" />
      <rect x="4" y="6" width="9" height="8" fill="#f4ead5" />
      <rect x="5" y="14" width="7" height="3" fill="#e8d5a3" />
      <rect x="7" y="0" width="3" height="1" fill="#1a2f1c" />
      <rect x="6" y="1" width="1" height="5" fill="#1a2f1c" />
      <rect x="10" y="1" width="1" height="5" fill="#1a2f1c" />
      <rect x="3" y="6" width="1" height="8" fill="#1a2f1c" />
      <rect x="13" y="6" width="1" height="8" fill="#1a2f1c" />
      <rect x="4" y="14" width="1" height="3" fill="#1a2f1c" />
      <rect x="12" y="14" width="1" height="3" fill="#1a2f1c" />
      <rect x="5" y="17" width="7" height="1" fill="#1a2f1c" />
    </svg>
  );
}

function SparkleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" shapeRendering="crispEdges">
      <rect x="8" y="1" width="2" height="16" fill="#f4ead5" />
      <rect x="1" y="8" width="16" height="2" fill="#f4ead5" />
      <rect x="5" y="5" width="8" height="8" fill="#8fbf4a" />
      <rect x="7" y="7" width="4" height="4" fill="#f4ead5" />
    </svg>
  );
}

function ExclaimMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" shapeRendering="crispEdges">
      <rect x="7" y="1" width="4" height="10" fill="#f4ead5" />
      <rect x="8" y="2" width="2" height="7" fill="#e8c547" />
      <rect x="7" y="13" width="4" height="4" fill="#f4ead5" />
      <rect x="8" y="14" width="2" height="2" fill="#e8c547" />
      <rect x="6" y="0" width="6" height="1" fill="#1a2f1c" />
      <rect x="6" y="1" width="1" height="10" fill="#1a2f1c" />
      <rect x="11" y="1" width="1" height="10" fill="#1a2f1c" />
      <rect x="7" y="11" width="4" height="1" fill="#1a2f1c" />
      <rect x="6" y="12" width="6" height="1" fill="#1a2f1c" />
      <rect x="6" y="13" width="1" height="4" fill="#1a2f1c" />
      <rect x="11" y="13" width="1" height="4" fill="#1a2f1c" />
      <rect x="7" y="17" width="4" height="1" fill="#1a2f1c" />
    </svg>
  );
}
