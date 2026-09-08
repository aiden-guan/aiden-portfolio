"use client";

export default function Error({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main className="meadow-root">
      <div className="meadow-boot" style={{ gap: 16 }}>
        <p>the meadow went quiet.</p>
        <button type="button" className="pixel-btn" onClick={() => retry()}>
          Try again
        </button>
      </div>
    </main>
  );
}
