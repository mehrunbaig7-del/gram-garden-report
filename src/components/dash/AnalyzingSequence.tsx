import { useEffect, useState } from "react";

const STEPS = [
  "Scanning content...",
  "Measuring performance...",
  "Detecting winning patterns...",
  "Comparing content formats...",
  "Studying top-performing posts...",
  "Building your strategy...",
];

export function AnalyzingSequence({ username }: { username: string }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => (s + 1 < STEPS.length ? s + 1 : s));
    }, 1600);
    return () => clearInterval(id);
  }, []);

  const pct = ((step + 1) / STEPS.length) * 100;

  return (
    <section className="mx-auto flex w-full max-w-xl flex-col items-center px-5 pb-28 pt-24">
      <div className="panel w-full px-7 py-10 sm:px-10">
        <p className="text-ig-gradient text-xs font-bold uppercase tracking-[0.22em]">
          Analysis in progress
        </p>
        <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground">
          @{username}
        </h2>

        <ul className="mt-8 space-y-3">
          {STEPS.map((label, i) => {
            const state = i < step ? "done" : i === step ? "active" : "idle";
            return (
              <li key={label} className="flex items-center gap-3">
                <span
                  className={
                    state === "done"
                      ? "bg-ig-gradient h-2.5 w-2.5 rounded-full"
                      : state === "active"
                        ? "bg-ig-gradient h-2.5 w-2.5 animate-pulse rounded-full"
                        : "h-2.5 w-2.5 rounded-full bg-muted"
                  }
                />
                <span
                  className={
                    state === "idle"
                      ? "text-sm text-muted-foreground/50"
                      : state === "active"
                        ? "text-sm font-semibold text-foreground"
                        : "text-sm text-muted-foreground"
                  }
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="mt-9 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="bg-ig-gradient h-full rounded-full transition-[width] duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Live analysis — this can take up to a minute on larger accounts.
        </p>
      </div>
    </section>
  );
}
