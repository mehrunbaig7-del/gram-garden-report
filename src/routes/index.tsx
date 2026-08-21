import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Landing } from "@/components/dash/Landing";
import { AnalyzingSequence } from "@/components/dash/AnalyzingSequence";
import { Dashboard } from "@/components/dash/Dashboard";
import { runAudit } from "@/lib/audit.functions";
import { normalizeAudit, totalRecommendations, type Audit } from "@/lib/audit-types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Instagram Performance Intelligence — Content Audit Dashboard" },
      {
        name: "description",
        content:
          "Enter an Instagram username and get a data-driven performance audit: winning formats, top posts, patterns, and exactly what to post next.",
      },
      { property: "og:title", content: "Instagram Performance Intelligence" },
      {
        property: "og:description",
        content:
          "Turn your Instagram data into a strategy: what to make more of, what to stop, and why your best content works.",
      },
    ],
  }),
  component: Index,
});

type Phase = "idle" | "loading" | "done";

function Index() {
  const audit = useServerFn(runAudit);
  const [phase, setPhase] = useState<Phase>("idle");
  const [username, setUsername] = useState("");
  const [data, setData] = useState<Audit | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function analyze(handle: string) {
    setUsername(handle);
    setPhase("loading");
    setError(null);
    setData(null);

    const started = Date.now();
    try {
      const result = await audit({ data: { username: handle } });
      const ms = Date.now() - started;

      if (!result.ok) {
        console.error("[audit] request failed", {
          endpointHost: result.endpointHost,
          status: result.status ?? null,
          kind: result.kind,
          message: result.message,
          durationMs: ms,
        });
        setError(result.message);
        setPhase("idle");
        return;
      }

      console.info("[audit] response received", {
        endpointHost: result.endpointHost,
        status: result.status,
        durationMs: ms,
        bytes: result.payloadJson.length,
        bodyPreview: result.payloadJson.slice(0, 1000),
      });

      let parsed: unknown;
      try {
        parsed = JSON.parse(result.payloadJson);
      } catch (e) {
        console.error("[audit] response was not valid JSON", e, result.payloadJson.slice(0, 500));
        setError("Instagram intelligence data could not be interpreted.");
        setPhase("idle");
        return;
      }

      const normalized = normalizeAudit(parsed, handle);
      if (!normalized) {
        console.error("[audit] response JSON did not match expected audit shape", parsed);
        setError("Instagram intelligence data could not be interpreted.");
        setPhase("idle");
        return;
      }

      const sections =
        normalized.top_posts.length +
        normalized.formats.length +
        normalized.insights.length +
        normalized.patterns.length +
        normalized.opportunities.length +
        normalized.experiments.length +
        totalRecommendations(normalized.recommendations);
      const empty = sections === 0 && normalized.account.overall_score === null;
      if (empty) {
        console.warn("[audit] no usable posts in response", parsed);
        setError("No usable Instagram posts were found for this account.");
        setPhase("idle");
        return;
      }

      setData(normalized);
      setPhase("done");
    } catch (e) {
      console.error("[audit] unexpected client error", e);
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setPhase("idle");
    }
  }

  function reset() {
    setData(null);
    setError(null);
    setPhase("idle");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <button onClick={reset} className="text-sm font-extrabold tracking-tight text-foreground">
          IG <span className="text-ig-gradient">Intelligence</span>
        </button>
        {phase === "done" ? (
          <button
            onClick={reset}
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            New Audit
          </button>
        ) : null}
      </header>

      <main>
        {phase === "idle" ? (
          <Landing
            onAnalyze={analyze}
            error={error}
            {...(username ? { onRetry: () => analyze(username) } : {})}
          />
        ) : null}
        {phase === "loading" ? <AnalyzingSequence username={username} /> : null}
        {phase === "done" && data ? <Dashboard audit={data} /> : null}
      </main>
    </div>
  );
}
