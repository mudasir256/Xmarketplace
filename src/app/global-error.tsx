"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: 40, textAlign: "center" }}>
        <h1 style={{ fontSize: 22 }}>Something went wrong</h1>
        <p style={{ color: "#667" }}>Please try again. If this keeps happening, refresh the page.</p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: 16,
            border: 0,
            borderRadius: 999,
            background: "#003049",
            color: "#fff",
            padding: "10px 18px",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
        {error.digest ? (
          <p style={{ marginTop: 18, fontSize: 12, color: "#99a" }}>Ref: {error.digest}</p>
        ) : null}
      </body>
    </html>
  );
}
