import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/* ---------- reveal on scroll ---------- */

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const t = window.setTimeout(() => setShown(true), delay);
            io.disconnect();
            return () => window.clearTimeout(t);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={cn(shown ? "reveal-shown" : "reveal-hidden", className)}>
      {children}
    </div>
  );
}

/* ---------- animated counter ---------- */

export function useCountUp(target: number | null, duration = 1100) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target === null || !Number.isFinite(target)) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return target === null ? null : value;
}

export function Counter({
  value,
  decimals = 0,
  suffix = "",
  className,
}: {
  value: number | null;
  decimals?: number;
  suffix?: string;
  className?: string;
}) {
  const v = useCountUp(value);
  if (v === null) return <span className={className}>—</span>;
  return (
    <span className={className}>
      {v.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* ---------- score ring ---------- */

export function ScoreRing({
  score,
  label,
  size = 208,
}: {
  score: number | null;
  label?: string | null;
  size?: number;
}) {
  const animated = useCountUp(score, 1400);
  const pct = Math.max(0, Math.min(100, animated ?? 0));
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--ig-amber)" />
            <stop offset="45%" stopColor="var(--ig-pink)" />
            <stop offset="100%" stopColor="var(--ig-purple)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (pct / 100) * c}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-5xl font-extrabold leading-none tracking-tight text-foreground">
          {score === null ? "—" : Math.round(pct)}
        </p>
        {score !== null ? (
          <p className="mt-1 text-xs font-medium text-muted-foreground">out of 100</p>
        ) : null}
        {label ? (
          <p className="text-ig-gradient mt-2 max-w-[9rem] text-xs font-bold uppercase tracking-[0.14em]">
            {label}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/* ---------- misc ---------- */

export function Chip({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "good" | "warn" | "bad" | "gradient";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "border-border bg-secondary text-secondary-foreground",
    good: "border-good/30 bg-good/12 text-good",
    warn: "border-warn/30 bg-warn/12 text-warn",
    bad: "border-bad/35 bg-bad/12 text-bad",
    gradient: "border-transparent bg-ig-gradient text-primary-foreground",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6 max-w-2xl">
      {eyebrow ? (
        <p className="text-ig-gradient text-xs font-bold uppercase tracking-[0.2em]">{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

export function Bar({ value, max, tone = "gradient" }: { value: number; max: number; tone?: "gradient" | "muted" }) {
  const [w, setW] = useState(0);
  const pct = max > 0 ? Math.max(2, Math.min(100, (value / max) * 100)) : 0;
  useEffect(() => {
    const t = window.setTimeout(() => setW(pct), 80);
    return () => window.clearTimeout(t);
  }, [pct]);
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-1000 ease-out",
          tone === "gradient" ? "bg-ig-gradient" : "bg-muted-foreground/50",
        )}
        style={{ width: `${w}%` }}
      />
    </div>
  );
}
