import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AuditLanding } from "@/components/audit/AuditLanding";
import { AuditLoading } from "@/components/audit/AuditLoading";
import { AuditResults } from "@/components/audit/AuditResults";
import { analyzeInstagramProfile, type AuditResponse } from "@/lib/instagram-audit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Instagram Audit — Data-Driven Content Report" },
      {
        name: "description",
        content:
          "Paste an Instagram profile URL and get a clean, data-driven content audit: top performers, patterns, caption and hashtag insights, plus clear recommendations.",
      },
      { property: "og:title", content: "Instagram Audit — Data-Driven Content Report" },
      {
        property: "og:description",
        content:
          "Discover what's working on your Instagram — and what to improve. A polished content audit in seconds.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [data, setData] = useState<AuditResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze(url: string) {
    setState("loading");
    setError(null);
    try {
      const result = await analyzeInstagramProfile(url);
      setData(result);
      setState("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setState("idle");
    }
  }

  function reset() {
    setData(null);
    setError(null);
    setState("idle");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between px-5 py-5">
        <button onClick={reset} className="text-sm font-extrabold tracking-tight text-foreground">
          IG <span className="text-ig-gradient">Audit</span>
        </button>
        <button
          onClick={reset}
          className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          New Audit
        </button>
      </header>

      <main>
        {state === "loading" ? <AuditLoading /> : null}
        {state === "done" && data ? <AuditResults data={data} /> : null}
        {state === "idle" ? (
          <>
            <AuditLanding onAnalyze={handleAnalyze} />
            {error ? (
              <p className="pb-10 text-center text-sm text-primary">{error}</p>
            ) : null}
          </>
        ) : null}
      </main>
    </div>
  );
}
