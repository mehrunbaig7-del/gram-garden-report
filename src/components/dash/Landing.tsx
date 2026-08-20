import { useState } from "react";

export function Landing({
  onAnalyze,
  error,
  onRetry,
}: {
  onAnalyze: (username: string) => void;
  error?: string | null;
  onRetry?: () => void;
}) {
  const [value, setValue] = useState("");
  const [local, setLocal] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const handle = value.trim().replace(/^@/, "").replace(/\/+$/, "").split("/").pop() ?? "";
    if (!handle) {
      setLocal("Enter an Instagram username to analyze.");
      return;
    }
    setLocal(null);
    onAnalyze(handle);
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-center px-5 pb-28 pt-16 text-center sm:pt-24">
      <div className="glass px-4 py-1.5">
        <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
          Intelligence Lab
        </span>
      </div>

      <h1 className="mt-8 text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
        Instagram <span className="text-ig-gradient">Performance</span> Intelligence
      </h1>

      <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
        Turn your Instagram data into a strategy that tells you what to post more of, what to stop,
        and why your best content works.
      </p>

      <form onSubmit={submit} className="mt-11 w-full max-w-xl">
        <label htmlFor="ig-handle" className="sr-only">
          Instagram username
        </label>
        <div className="panel flex items-center gap-2 p-2.5">
          <span className="pl-3 text-lg font-semibold text-muted-foreground">@</span>
          <input
            id="ig-handle"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="username"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent py-3 text-base text-foreground outline-none placeholder:text-muted-foreground/60"
          />
          <button
            type="submit"
            className="bg-ig-gradient shadow-glow shrink-0 rounded-full px-6 py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Analyze Account
          </button>
        </div>
      </form>

      {local ? <p className="mt-4 text-sm font-medium text-primary">{local}</p> : null}

      {error ? (
        <div className="panel mt-8 w-full max-w-xl px-6 py-6 text-left">
          <p className="text-sm font-bold text-foreground">Unable to analyze this account right now.</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{error}</p>
          {onRetry ? (
            <button
              onClick={onRetry}
              className="mt-4 rounded-full border border-border px-5 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
            >
              Retry analysis
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="mt-16 grid w-full gap-3 sm:grid-cols-3">
        {[
          ["What's working", "Formats and patterns ranked against your own median."],
          ["Why it works", "Hooks, topics and structures behind your best posts."],
          ["What's next", "A content roadmap with the evidence attached."],
        ].map(([title, body]) => (
          <div key={title} className="panel hover-lift px-5 py-5 text-left">
            <p className="text-sm font-bold text-foreground">{title}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
