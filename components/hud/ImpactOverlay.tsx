"use client";

import { useEffect, useState } from "react";

export function ImpactOverlay({ active }: { active: boolean }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) {
      setVisible(false);
      return undefined;
    }
    setVisible(true);
    const id = window.setTimeout(() => setVisible(false), 400);
    return () => window.clearTimeout(id);
  }, [active]);

  if (!visible) return null;
  return <div className="impact-overlay" aria-hidden />;
}
