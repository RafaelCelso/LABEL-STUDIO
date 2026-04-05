"use client";

/**
 * Mesmo gradiente SVG animado das telas de autenticação (sign-in / sign-up).
 * Use `idPrefix` único se várias instâncias coexistirem no DOM.
 */
export function AuthGradientBackground({
  idPrefix = "agb",
  className = "absolute inset-0 h-full w-full",
}: {
  idPrefix?: string;
  className?: string;
}) {
  const p = idPrefix;
  return (
    <>
      <style>{`
        @keyframes auth-bg-float1 { 0% { transform: translate(0, 0); } 50% { transform: translate(-10px, 10px); } 100% { transform: translate(0, 0); } }
        @keyframes auth-bg-float2 { 0% { transform: translate(0, 0); } 50% { transform: translate(10px, -10px); } 100% { transform: translate(0, 0); } }
      `}</style>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 800 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        className={className}
        aria-hidden
      >
        <defs>
          <linearGradient id={`${p}_grad1`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop
              offset="0%"
              style={{ stopColor: "var(--color-primary)", stopOpacity: 0.8 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "var(--color-chart-3)", stopOpacity: 0.6 }}
            />
          </linearGradient>
          <linearGradient id={`${p}_grad2`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop
              offset="0%"
              style={{ stopColor: "var(--color-chart-4)", stopOpacity: 0.9 }}
            />
            <stop
              offset="50%"
              style={{ stopColor: "var(--color-secondary)", stopOpacity: 0.7 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "var(--color-chart-1)", stopOpacity: 0.6 }}
            />
          </linearGradient>
          <radialGradient id={`${p}_grad3`} cx="50%" cy="50%" r="50%">
            <stop
              offset="0%"
              style={{ stopColor: "var(--color-destructive)", stopOpacity: 0.8 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "var(--color-chart-5)", stopOpacity: 0.4 }}
            />
          </radialGradient>
          <filter id={`${p}_blur1`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="35" />
          </filter>
          <filter id={`${p}_blur2`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="25" />
          </filter>
          <filter id={`${p}_blur3`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="45" />
          </filter>
        </defs>
        <g style={{ animation: "auth-bg-float1 20s ease-in-out infinite" }}>
          <ellipse
            cx="200"
            cy="500"
            rx="250"
            ry="180"
            fill={`url(#${p}_grad1)`}
            filter={`url(#${p}_blur1)`}
            transform="rotate(-30 200 500)"
          />
          <rect
            x="500"
            y="100"
            width="300"
            height="250"
            rx="80"
            fill={`url(#${p}_grad2)`}
            filter={`url(#${p}_blur2)`}
            transform="rotate(15 650 225)"
          />
        </g>
        <g style={{ animation: "auth-bg-float2 25s ease-in-out infinite" }}>
          <circle
            cx="650"
            cy="450"
            r="150"
            fill={`url(#${p}_grad3)`}
            filter={`url(#${p}_blur3)`}
            opacity="0.7"
          />
          <ellipse
            cx="50"
            cy="150"
            rx="180"
            ry="120"
            fill="var(--color-accent)"
            filter={`url(#${p}_blur2)`}
            opacity="0.8"
          />
        </g>
      </svg>
    </>
  );
}
