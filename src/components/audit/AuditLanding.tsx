import { useState } from "react";

export function AuditLanding({ onAnalyze }: { onAnalyze: (url: string) => void }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) {
      setError("Paste an Instagram profile URL to get started.");
      return;
    }
    setError(null);
    onAnalyze(url.trim());
  }

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col items-center px-5 pb-24 pt-16 text-center sm:pt-24">
      <span className="rounded-full bg-accent px-4 py-1.5 text-xs font-semibold tracking-wide text-accent-foreground">
        Instagram content audit
      </span>

      <h1 className="mt-7 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
        Instagram <span className="text-ig-gradient">Audit</span>
      </h1>

      <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
        Discover what's working on your Instagram — and what to improve.
      </p>

      <form onSubmit={submit} className="mt-10 w-full">
        <label htmlFor="ig-url" className="sr-only">
          Paste Instagram profile URL
        </label>
        <div className="card-soft p-2 sm:p-2.5">
          <input
            id="ig-url"
            type="text"
            inputMode="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://instagram.com/username"
            aria-label="Paste Instagram profile URL"
            className="w-full rounded-2xl bg-transparent px-4 py-4 text-center text-base text-foreground outline-none placeholder:text-muted-foreground/70 sm:text-left"
          />
        </div>

        <p className="mt-3 text-xs text-muted-foreground">Paste Instagram profile URL</p>

        <button
          type="submit"
          className="bg-ig-gradient shadow-lift mt-6 w-full rounded-full px-8 py-4 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto sm:px-12"
        >
          Analyze Account
        </button>

        <p className="mt-4 text-sm text-muted-foreground">
          Get a data-driven content audit in seconds.
        </p>

        {error ? <p className="mt-3 text-sm font-medium text-primary">{error}</p> : null}
      </form>
    </section>
  );
}
