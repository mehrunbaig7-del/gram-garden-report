import { useEffect, useState } from "react";

const STATUSES = [
  "Fetching your content...",
  "Analyzing engagement...",
  "Finding your top-performing content...",
  "Generating recommendations...",
];

export function AuditLoading() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => (s + 1 < STATUSES.length ? s + 1 : s));
    }, 900);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="mx-auto flex w-full max-w-md flex-col items-center px-5 pb-24 pt-24">
      <div className="card-soft w-full px-7 py-12 text-center">
        <div className="mx-auto flex items-center justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="bg-ig-gradient h-2.5 w-2.5 animate-pulse rounded-full"
              style={{ animationDelay: `${i * 220}ms`, animationDuration: "1.4s" }}
            />
          ))}
        </div>

        <h2 className="mt-7 text-xl font-bold tracking-tight text-foreground">
          Analyzing your Instagram...
        </h2>

        <p key={step} className="mt-3 text-sm text-muted-foreground">
          {STATUSES[step]}
        </p>

        <div className="mt-8 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="bg-ig-gradient h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${((step + 1) / STATUSES.length) * 100}%` }}
          />
        </div>
      </div>
    </section>
  );
}
