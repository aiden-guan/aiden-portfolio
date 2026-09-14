"use client";

import { useEffect, useState } from "react";

function useMedia(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const apply = () => setMatches(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [query]);

  return matches;
}

export function useCoarsePointer() {
  return useMedia("(pointer: coarse)");
}

export function useCompactScene() {
  const coarse = useMedia("(pointer: coarse)");
  const narrow = useMedia("(max-width: 768px)");
  return coarse || narrow;
}
