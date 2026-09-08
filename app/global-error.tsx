"use client";

export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          background: "#0c1610",
          color: "#e8dcc4",
          fontFamily: "ui-monospace, monospace",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        <div style={{ display: "grid", gap: 16, justifyItems: "center" }}>
          <p>the meadow went quiet.</p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              cursor: "pointer",
              background: "#e8dcc4",
              color: "#0c1610",
              border: 0,
              padding: "8px 14px",
              font: "inherit",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
