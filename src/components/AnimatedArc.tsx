// AnimatedArc.tsx
import * as React from "react";

/* ------------------------------- utils ---------------------------------- */

export type SpinDirection = "cw" | "ccw" | "both";

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

const randomBetween = (min: number, max: number): number => {
  const low = Math.min(min, max);
  return low + Math.random() * (Math.max(min, max) - low);
};

const round = (value: number): number => Math.round(value * 1e3) / 1e3;

const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Arc length in user units for a given sweep (degrees). */
export const degreesToArcLength = (deg: number, radius: number): number =>
  (deg * Math.PI * radius) / 180;

/** Sweep in degrees for a given arc length (radius must be > 0). */
export const arcLengthToDegrees = (length: number, radius: number): number =>
  radius > 0 ? (length * 180) / (Math.PI * radius) : 0;

/** 0° = 12 o'clock, increasing clockwise. */
export const polarToCartesian = (
  cx: number,
  cy: number,
  r: number,
  deg: number,
): { x: number; y: number } => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

/** `d` for an open annulus section, drawn from `startDeg` for `sweepDeg`. */
export const arcPath = (
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  sweepDeg: number,
): string => {
  if (r <= 0) return "";
  const sweep = clamp(sweepDeg, 0.001, 359.999); // never exactly 360 → keeps an end point
  const from = polarToCartesian(cx, cy, r, startDeg);
  const to = polarToCartesian(cx, cy, r, startDeg + sweep);
  const largeArc = sweep > 180 ? 1 : 0;
  return `M ${round(from.x)} ${round(from.y)} A ${round(r)} ${round(r)} 0 ${largeArc} 1 ${round(to.x)} ${round(to.y)}`;
};

/* ------------------------------ component ------------------------------- */

interface MotionState {
  sweep: number;
  rotation: number;
  from: { sweep: number; rotation: number };
  to: { sweep: number; rotation: number };
  duration: number;
  cycleStart: number;
  nextCycleAt: number;
  phase: "idle" | "animating" | "waiting";
}

export type AnimatedArcProps = Omit<
  React.SVGProps<SVGSVGElement>,
  "stroke" | "strokeWidth" | "strokeLinecap"
> & {
  /** Radius of the ring's centre-line. Ring thickness comes from `strokeWidth`. */
  radius?: number;
  /** SVG stroke-width — used as the annulus thickness (and to pad the viewBox). */
  strokeWidth?: string | number;
  /** Any SVG stroke value, including `url(#gradientId)` (put the gradient in `children`). */
  strokeColor?: string;
  strokeLinecap?: "round" | "butt" | "square";
  /** Faint full-ring track behind the arc. Omit for none. */
  trackColor?: string;
  trackOpacity?: number;

  /** Lower/upper bound of animated arc length, in degrees of sweep. */
  minArcDegrees?: number;
  maxArcDegrees?: number;
  /** Sweep used before the first cycle. */
  initialArcDegrees?: number;
  /** Starting rotation, degrees, clockwise from 12 o'clock. */
  rotationStart?: number;
  /** Per-cycle rotation delta, degrees. */
  minRotationDegrees?: number;
  maxRotationDegrees?: number;
  spinDirection?: SpinDirection;

  /** Every animation lasts between these two durations (ms). */
  durationRangeStart?: number;
  durationRangeEnd?: number;
  /** Pause between animations is picked randomly in this range (ms). */
  randomIntervalStart?: number;
  randomIntervalEnd?: number;

  /** Interpolation curve applied to both sweep and rotation. */
  easing?: (t: number) => number;
  /** Freeze on the current pose when the OS asks for reduced motion. */
  respectReducedMotion?: boolean;
  /** Hold the current pose (e.g. when off-screen). */
  paused?: boolean;
  /** Extra props for the `<path>` itself. `d`/`transform` stay owned by the animation. */
  arcProps?: Omit<React.SVGProps<SVGPathElement>, "d" | "transform">;
};

const AnimatedArc = React.forwardRef<SVGSVGElement, AnimatedArcProps>(
  function AnimatedArc(props, forwardedRef) {
    const {
      radius = 72,
      strokeWidth = 12,
      strokeColor = "currentColor",
      strokeLinecap = "round",
      trackColor,
      trackOpacity = 0.2,
      minArcDegrees = 45,
      maxArcDegrees = 300,
      initialArcDegrees = 110,
      rotationStart = 0,
      minRotationDegrees = 30,
      maxRotationDegrees = 240,
      spinDirection = "both",
      durationRangeStart = 3000,
      durationRangeEnd = 8000,
      randomIntervalStart = 1000,
      randomIntervalEnd = 5000,
      easing = easeInOutCubic,
      respectReducedMotion = true,
      paused = false,
      children,
      arcProps,
      style,
      ...svgProps
    } = props;

    /* ---- geometry ----------------------------------------------------- */
    const strokeWidthPx = React.useMemo(() => {
      const parsed = typeof strokeWidth === "number" ? strokeWidth : Number.parseFloat(strokeWidth);
      return Number.isFinite(parsed) ? Math.max(parsed, 0) : 0;
    }, [strokeWidth]);

    const padding = strokeWidthPx / 2 + 1;
    const size = Math.max((radius + padding) * 2, 1);
    const cx = size / 2;
    const cy = size / 2;
    const pathRadius = Math.max(radius, 0);

    /* ---- animation state (lives in refs: no per-frame re-render) ------- */
    const pathRef = React.useRef<SVGPathElement>(null);
    const stateRef = React.useRef<MotionState>({
      sweep: initialArcDegrees,
      rotation: rotationStart,
      from: { sweep: initialArcDegrees, rotation: rotationStart },
      to: { sweep: initialArcDegrees, rotation: rotationStart },
      duration: 0,
      cycleStart: 0,
      nextCycleAt: 0,
      phase: "idle",
    });

    // Latest config, readable inside the rAF loop without restarting it.
    const configRef = React.useRef({
      cx, cy, pathRadius, minArcDegrees, maxArcDegrees,
      minRotationDegrees, maxRotationDegrees, spinDirection,
      durationRangeStart, durationRangeEnd, randomIntervalStart, randomIntervalEnd, easing,
    });
    configRef.current = {
      cx, cy, pathRadius, minArcDegrees, maxArcDegrees,
      minRotationDegrees, maxRotationDegrees, spinDirection,
      durationRangeStart, durationRangeEnd, randomIntervalStart, randomIntervalEnd, easing,
    };

    const apply = React.useCallback(() => {
      const path = pathRef.current;
      if (!path) return;
      const { cx, cy, pathRadius } = configRef.current;
      const state = stateRef.current;
      // Arc is always drawn from 0°; the rotation transform does the orbiting,
      // so rotation and arc length stay independent, both about the radial centre.
      path.setAttribute("d", arcPath(cx, cy, pathRadius, 0, state.sweep));
      path.setAttribute("transform", `rotate(${round(state.rotation)} ${round(cx)} ${round(cy)})`);
    }, []);

    const startCycle = React.useCallback((now: number) => {
      const cfg = configRef.current;
      const state = stateRef.current;
      const direction =
        cfg.spinDirection === "both"
          ? Math.random() < 0.5 ? -1 : 1
          : cfg.spinDirection === "ccw" ? -1 : 1;

      state.from = { sweep: state.sweep, rotation: state.rotation };
      state.to = {
        sweep: randomBetween(cfg.minArcDegrees, cfg.maxArcDegrees),
        rotation: state.rotation + direction * randomBetween(cfg.minRotationDegrees, cfg.maxRotationDegrees),
      };
      state.duration = Math.max(randomBetween(cfg.durationRangeStart, cfg.durationRangeEnd), 1);
      state.cycleStart = now;
      state.phase = "animating";
    }, []);

    /* ---- reduced-motion awareness ------------------------------------- */
    const [motionReduced, setMotionReduced] = React.useState(prefersReducedMotion);

    React.useEffect(() => {
      if (typeof window.matchMedia !== "function") return;
      const query = window.matchMedia("(prefers-reduced-motion: reduce)");
      const onChange = (event: MediaQueryListEvent) => setMotionReduced(event.matches);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    }, []);

    /* ---- the loop ------------------------------------------------------ */
    const frozen = paused || (respectReducedMotion && motionReduced);

    React.useEffect(() => {
      const state = stateRef.current;

      if (frozen) {
        apply();
        return;
      }

      // Resuming mid-flight? Hold the current pose a moment, then animate on.
      if (state.phase === "animating") {
        const cfg = configRef.current;
        state.phase = "waiting";
        state.nextCycleAt =
          performance.now() + randomBetween(cfg.randomIntervalStart, cfg.randomIntervalEnd) * 0.5;
      }

      let frame = 0;
      const tick = (now: number) => {
        const cfg = configRef.current;

        if (state.phase === "waiting") {
          if (now >= state.nextCycleAt) startCycle(now);
        } else {
          // "idle" (first frame) or "animating"
          const elapsed = now - state.cycleStart;
          const t = clamp(elapsed / Math.max(state.duration, 1), 0, 1);
          const eased = cfg.easing(t);
          state.sweep = lerp(state.from.sweep, state.to.sweep, eased);
          state.rotation = lerp(state.from.rotation, state.to.rotation, eased);

          if (t >= 1) {
            state.phase = "waiting";
            state.nextCycleAt =
              now + randomBetween(cfg.randomIntervalStart, cfg.randomIntervalEnd);
          } else {
            state.phase = "animating";
          }
        }

        apply();
        frame = requestAnimationFrame(tick);
      };

      frame = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frame);
    }, [frozen, apply, startCycle]);

    // Geometry prop changes should show up even while waiting between cycles.
    React.useEffect(apply, [apply, cx, cy, pathRadius]);

    /* ---- render -------------------------------------------------------
       The first `d`/`transform` are memoised so they never change across
       renders — React therefore skips them while the loop writes attributes. */
    const firstPaint = React.useMemo(
      () => ({
        d: arcPath(cx, cy, pathRadius, 0, initialArcDegrees),
        transform: `rotate(${round(rotationStart)} ${round(cx)} ${round(cy)})`,
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    );

    return (
      <svg
        ref={forwardedRef}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${round(size)} ${round(size)}`}
        width={round(size)}
        height={round(size)}
        aria-hidden
        style={{ display: "block", overflow: "visible", ...style }}
        {...svgProps}
      >
        {children}
        {trackColor ? (
          <circle
            cx={cx}
            cy={cy}
            r={pathRadius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
            opacity={trackOpacity}
          />
        ) : null}
        <path
          ref={pathRef}
          d={firstPaint.d}
          transform={firstPaint.transform}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap={strokeLinecap}
          {...arcProps}
        />
      </svg>
    );
  },
);

AnimatedArc.displayName = "AnimatedArc";

export { AnimatedArc };
