import { useMemo, useState } from "react";
import type {
  Audit,
  Experiment,
  FormatRow,
  Insight,
  Opportunity,
  Recommendation,
  TopPost,
} from "@/lib/audit-types";
import { totalRecommendations } from "@/lib/audit-types";
import { Bar, Chip, Counter, Reveal, ScoreRing, SectionHeading } from "./primitives";
import { cn } from "@/lib/utils";

/* ---------- helpers ---------- */

const MEDALS = ["🥇", "🥈", "🥉"];

function signed(n: number) {
  const r = Math.round(n);
  return `${r > 0 ? "+" : ""}${r}%`;
}

function toneForClassification(c: string | null) {
  const s = (c ?? "").toLowerCase();
  if (s.includes("strong") || s.includes("win") || s.includes("top")) return "good" as const;
  if (s.includes("weak") || s.includes("poor") || s.includes("under")) return "bad" as const;
  if (s.includes("mixed") || s.includes("average") || s.includes("neutral")) return "warn" as const;
  return "neutral" as const;
}

function scrollToPost(ref: string) {
  const el =
    document.getElementById(`post-${ref}`) ??
    document.getElementById(`post-${ref.replace(/[^0-9]/g, "")}`);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add("shadow-glow");
  window.setTimeout(() => el.classList.remove("shadow-glow"), 2200);
}

function PostRefs({ refs, label = "Supporting posts" }: { refs: string[]; label?: string }) {
  if (refs.length === 0) return null;
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {refs.map((r) => (
        <button
          key={r}
          onClick={() => scrollToPost(r)}
          className="rounded-full border border-border bg-secondary px-2.5 py-1 text-[11px] font-semibold text-secondary-foreground transition-colors hover:border-primary/50 hover:text-primary"
        >
          Post {r.replace(/^#/, "")}
        </button>
      ))}
    </div>
  );
}

function Shell({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mx-auto w-full max-w-6xl px-5 py-14 sm:py-16">
      {children}
    </section>
  );
}

/* ---------- 1. overview ---------- */

function Overview({ audit }: { audit: Audit }) {
  const a = audit.account;
  const strongFormat = [...audit.formats].sort(
    (x, y) => (y.average_performance ?? -Infinity) - (x.average_performance ?? -Infinity),
  )[0];
  const level = a.overall_score !== null ? Math.round(a.overall_score) : null;

  return (
    <Shell>
      <Reveal>
        <div className="panel overflow-hidden">
          <div className="bg-ig-soft flex flex-col gap-8 px-6 py-8 sm:px-10 sm:py-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-4">
                {a.avatar ? (
                  <img
                    src={a.avatar}
                    alt={a.username ? `@${a.username} profile picture` : "Profile picture"}
                    className="h-14 w-14 rounded-full border border-border object-cover"
                    loading="lazy"
                  />
                ) : null}
                <div className="min-w-0">
                  <p className="truncate text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                    @{a.username ?? "account"}
                  </p>
                  {a.niche ? (
                    <p className="mt-1 text-sm text-muted-foreground">{a.niche}</p>
                  ) : null}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {level !== null ? <Chip tone="gradient">Level {level}</Chip> : null}
                {a.performance_label ? <Chip tone="good">{a.performance_label}</Chip> : null}
                {strongFormat ? <Chip tone="neutral">Winning format: {strongFormat.format}</Chip> : null}
                {audit.insights[0] ? <Chip tone="warn">Top insight identified</Chip> : null}
              </div>

              {a.summary ? (
                <p className="mt-6 max-w-2xl text-sm leading-relaxed text-foreground/90 sm:text-base">
                  {a.summary}
                </p>
              ) : null}

              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat label="Posts analyzed" value={a.posts_analyzed} />
                <Stat label="Insights" value={audit.insights.length} />
                <Stat label="Actions" value={totalRecommendations(audit.recommendations)} />
                <Stat label="Formats" value={audit.formats.length} />
              </div>
            </div>

            <div className="flex justify-center lg:pl-8">
              <ScoreRing score={a.overall_score} label={a.performance_label} />
            </div>
          </div>
        </div>
      </Reveal>
    </Shell>
  );
}

function Stat({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 px-4 py-3">
      <p className="text-2xl font-extrabold tracking-tight text-foreground">
        <Counter value={value} />
      </p>
      <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

/* ---------- 2. insights ---------- */

function Insights({ items }: { items: Insight[] }) {
  if (items.length === 0) return null;
  const order = { high: 0, medium: 1, low: 2 } as const;
  const sorted = [...items].sort(
    (a, b) => (a.importance ? order[a.importance] : 3) - (b.importance ? order[b.importance] : 3),
  );

  return (
    <Shell>
      <Reveal>
        <SectionHeading
          eyebrow="Discovered"
          title="Your Biggest Insights"
          description="What the analysis found first — ranked by how much it matters for this account."
        />
      </Reveal>
      <div className="grid gap-4 lg:grid-cols-2">
        {sorted.map((it, i) => {
          const high = it.importance === "high";
          const low = it.importance === "low";
          return (
            <Reveal key={i} delay={i * 60} className={high ? "lg:col-span-2" : undefined}>
              <article
                className={cn(
                  "panel hover-lift h-full px-6 py-6",
                  high && "bg-ig-soft shadow-glow",
                  low && "opacity-80",
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  {it.importance ? (
                    <Chip tone={high ? "gradient" : low ? "neutral" : "warn"}>
                      {it.importance} priority
                    </Chip>
                  ) : null}
                  {it.confidence ? <Chip tone="neutral">Confidence {it.confidence}</Chip> : null}
                </div>
                <p
                  className={cn(
                    "mt-4 font-bold leading-snug tracking-tight text-foreground",
                    high ? "text-xl sm:text-2xl" : "text-base",
                  )}
                >
                  {it.insight}
                </p>
                <PostRefs refs={it.supporting_posts} />
              </article>
            </Reveal>
          );
        })}
      </div>
    </Shell>
  );
}

/* ---------- 3. strategy buckets ---------- */

const BUCKETS = [
  { key: "continue", icon: "🟢", title: "Continue", blurb: "Already working — protect it.", tone: "good" },
  { key: "make_more", icon: "🔥", title: "Make More", blurb: "Deserves more production.", tone: "gradient" },
  { key: "reduce", icon: "🟡", title: "Reduce", blurb: "Use less often.", tone: "warn" },
  { key: "stop", icon: "🔴", title: "Stop", blurb: "The data supports stopping.", tone: "bad" },
] as const;

function Strategy({ audit }: { audit: Audit }) {
  if (totalRecommendations(audit.recommendations) === 0) return null;

  return (
    <Shell>
      <Reveal>
        <SectionHeading
          eyebrow="Strategy"
          title="Continue · Make More · Reduce · Stop"
          description="Every action below is tied to a reason and to the posts that prove it."
        />
      </Reveal>
      <div className="grid gap-4 lg:grid-cols-2">
        {BUCKETS.map((b, i) => {
          const items = audit.recommendations[b.key] as Recommendation[];
          if (items.length === 0) return null;
          return (
            <Reveal key={b.key} delay={i * 60}>
              <div
                className={cn(
                  "panel h-full px-6 py-6",
                  b.tone === "good" && "border-good/25",
                  b.tone === "warn" && "border-warn/25",
                  b.tone === "bad" && "border-bad/30",
                  b.tone === "gradient" && "bg-ig-soft border-primary/25",
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg" aria-hidden>
                    {b.icon}
                  </span>
                  <h3 className="text-lg font-extrabold uppercase tracking-wide text-foreground">
                    {b.title}
                  </h3>
                  <Chip tone={b.tone}>{items.length}</Chip>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">{b.blurb}</p>

                <ul className="mt-5 space-y-4">
                  {items.map((r, j) => (
                    <li key={j} className="rounded-2xl border border-border bg-card/60 px-4 py-4">
                      <p className="text-sm font-bold leading-snug text-foreground">
                        {r.recommendation}
                      </p>
                      {r.reason ? (
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {r.reason}
                        </p>
                      ) : null}
                      {r.confidence ? (
                        <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Confidence {r.confidence}
                        </p>
                      ) : null}
                      <PostRefs refs={r.supporting_posts} label="Evidence" />
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Shell>
  );
}

/* ---------- 4. formats ---------- */

function Formats({ rows }: { rows: FormatRow[] }) {
  if (rows.length === 0) return null;
  const sorted = [...rows].sort(
    (a, b) => (b.average_performance ?? -Infinity) - (a.average_performance ?? -Infinity),
  );
  const max = Math.max(...sorted.map((r) => r.average_performance ?? 0), 1);

  return (
    <Shell>
      <Reveal>
        <SectionHeading
          eyebrow="Format analysis"
          title="What Format Is Actually Winning?"
          description="Ranked by average performance, compared against this account's own median."
        />
      </Reveal>
      <div className="space-y-3">
        {sorted.map((r, i) => (
          <Reveal key={r.format} delay={i * 50}>
            <div className="panel hover-lift px-5 py-5 sm:px-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="w-7 text-center text-lg" aria-hidden>
                    {MEDALS[i] ?? `#${i + 1}`}
                  </span>
                  <p className="truncate text-base font-bold tracking-tight text-foreground">
                    {r.format}
                  </p>
                  {r.classification ? (
                    <Chip tone={toneForClassification(r.classification)}>{r.classification}</Chip>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  {r.post_count !== null ? <span>{r.post_count} posts</span> : null}
                  {r.median_performance !== null ? (
                    <span>median {Math.round(r.median_performance)}</span>
                  ) : null}
                  {r.vs_account_median !== null ? (
                    <span
                      className={cn(
                        "font-bold",
                        r.vs_account_median >= 0 ? "text-good" : "text-bad",
                      )}
                    >
                      {signed(r.vs_account_median)} vs account median
                    </span>
                  ) : null}
                  <span className="text-lg font-extrabold text-foreground">
                    <Counter value={r.average_performance} />
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <Bar value={r.average_performance ?? 0} max={max} />
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Shell>
  );
}

/* ---------- 5. pattern lab ---------- */

function PatternLab({ audit }: { audit: Audit }) {
  if (audit.patterns.length === 0) return null;
  return (
    <Shell>
      <Reveal>
        <SectionHeading
          eyebrow="Pattern Lab"
          title="Why This Content Works"
          description="The recurring ingredients behind the account's strongest posts."
        />
      </Reveal>
      <div className="grid gap-4 md:grid-cols-2">
        {audit.patterns.map((g, i) => (
          <Reveal key={g.label} delay={i * 60}>
            <div className="panel hover-lift h-full px-6 py-6">
              <h3 className="text-base font-extrabold tracking-tight text-foreground">{g.label}</h3>
              <ul className="mt-4 space-y-3">
                {g.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <span className="bg-ig-gradient mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
                    <p className="text-sm leading-relaxed text-foreground/90">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </Shell>
  );
}

/* ---------- 6. hall of fame ---------- */

function HallOfFame({ posts, username }: { posts: TopPost[]; username: string | null }) {
  const [sort, setSort] = useState<"performance" | "date" | "format">("performance");
  const [format, setFormat] = useState<string>("all");

  const formats = useMemo(
    () => Array.from(new Set(posts.map((p) => p.format).filter((f): f is string => !!f))),
    [posts],
  );

  const view = useMemo(() => {
    const filtered = format === "all" ? posts : posts.filter((p) => p.format === format);
    const sorted = [...filtered];
    if (sort === "performance") {
      sorted.sort((a, b) => (b.performance_score ?? -Infinity) - (a.performance_score ?? -Infinity));
    } else if (sort === "date") {
      sorted.sort((a, b) => (b.posted_at ?? "").localeCompare(a.posted_at ?? ""));
    } else {
      sorted.sort((a, b) => (a.format ?? "").localeCompare(b.format ?? ""));
    }
    return sorted;
  }, [posts, sort, format]);

  if (posts.length === 0) return null;

  return (
    <Shell id="hall-of-fame">
      <Reveal>
        <SectionHeading
          eyebrow="Leaderboard"
          title="Your Hall of Fame"
          description="The exact posts the recommendations are built on."
        />
      </Reveal>

      <Reveal>
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Sort
          </span>
          {(["performance", "date", "format"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors",
                sort === s
                  ? "border-transparent bg-ig-gradient text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {s}
            </button>
          ))}

          {formats.length > 1 ? (
            <>
              <span className="ml-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Format
              </span>
              {["all", ...formats].map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                    format === f
                      ? "border-primary/50 bg-secondary text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {f}
                </button>
              ))}
            </>
          ) : null}
        </div>
      </Reveal>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {view.map((p, i) => (
          <Reveal key={p.id} delay={i * 50}>
            <article
              id={`post-${p.id}`}
              className="panel hover-lift flex h-full flex-col overflow-hidden scroll-mt-24 transition-shadow"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface-2">
                {p.cover_image ? (
                  <img
                    src={p.cover_image}
                    alt={p.topic ? `${p.topic} post cover` : "Instagram post cover"}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.04]"
                    loading="lazy"
                  />
                ) : (
                  <div className="bg-ig-soft flex h-full w-full items-center justify-center">
                    <span className="px-6 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      No cover image provided
                    </span>
                  </div>
                )}
                <div className="absolute left-3 top-3 flex items-center gap-2">
                  <span className="bg-ig-gradient rounded-full px-3 py-1 text-xs font-extrabold text-primary-foreground">
                    {MEDALS[p.rank - 1] ?? ""} #{p.rank}
                  </span>
                  {p.format ? (
                    <span className="glass rounded-full px-2.5 py-1 text-[11px] font-semibold text-foreground">
                      {p.format}
                    </span>
                  ) : null}
                </div>
                {p.performance_score !== null ? (
                  <div className="glass absolute bottom-3 right-3 rounded-full px-3 py-1.5">
                    <span className="text-sm font-extrabold text-foreground">
                      <Counter value={p.performance_score} />
                    </span>
                    <span className="ml-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      perf
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-1 flex-col px-5 py-5">
                <div className="flex items-center gap-2">
                  <span className="bg-ig-gradient h-6 w-6 rounded-full" aria-hidden />
                  <span className="text-xs font-semibold text-muted-foreground">
                    @{username ?? "account"}
                  </span>
                </div>

                {p.topic ? (
                  <p className="mt-3 text-base font-bold leading-snug tracking-tight text-foreground">
                    {p.topic}
                  </p>
                ) : null}
                {p.why_it_worked ? (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {p.why_it_worked}
                  </p>
                ) : null}
                {p.pattern_to_replicate ? (
                  <p className="mt-3 rounded-2xl border border-border bg-card/60 px-3.5 py-3 text-xs leading-relaxed text-foreground/90">
                    <span className="font-bold uppercase tracking-wide text-muted-foreground">
                      Replicate:{" "}
                    </span>
                    {p.pattern_to_replicate}
                  </p>
                ) : null}

                <div className="mt-auto pt-5">
                  {p.url ? (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-bold uppercase tracking-wide text-foreground transition-colors hover:bg-accent"
                    >
                      View post ↗
                    </a>
                  ) : (
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Post link unavailable
                    </span>
                  )}
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Shell>
  );
}

/* ---------- 7. opportunities ---------- */

function Opportunities({ items }: { items: Opportunity[] }) {
  if (items.length === 0) return null;
  return (
    <Shell>
      <Reveal>
        <SectionHeading
          eyebrow="Roadmap"
          title="What You Should Post Next"
          description="Each idea is derived from patterns already proven on this account."
        />
      </Reveal>
      <div className="grid gap-5 lg:grid-cols-3">
        {items.map((o, i) => (
          <Reveal key={i} delay={i * 70}>
            <article className="panel hover-lift bg-ig-soft flex h-full flex-col px-6 py-6">
              <div className="flex flex-wrap items-center gap-2">
                {o.type ? <Chip tone="gradient">{o.type}</Chip> : null}
                {o.confidence ? <Chip tone="neutral">Confidence {o.confidence}</Chip> : null}
              </div>
              <h3 className="mt-4 text-lg font-extrabold leading-snug tracking-tight text-foreground">
                {o.title}
              </h3>
              <dl className="mt-5 space-y-3.5">
                <Field label="Format" value={o.format} />
                <Field label="Hook" value={o.hook} />
                <Field label="Concept" value={o.concept} />
                <Field label="Structure" value={o.structure} />
                <Field label="Why this is recommended" value={o.why} />
              </dl>
              <PostRefs refs={o.supporting_posts} label="Evidence" />
            </article>
          </Reveal>
        ))}
      </div>
    </Shell>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm leading-relaxed text-foreground/90">{value}</dd>
    </div>
  );
}

/* ---------- 8. content mix ---------- */

const MIX_COLORS = ["var(--ig-pink)", "var(--ig-purple)", "var(--ig-amber)", "var(--good)", "var(--chart-5)"];

function ContentMix({ slices }: { slices: Audit["content_mix"] }) {
  if (slices.length === 0) return null;
  const total = slices.reduce((s, x) => s + x.percentage, 0) || 1;
  let acc = 0;
  const stops = slices.map((s, i) => {
    const start = (acc / total) * 100;
    acc += s.percentage;
    const end = (acc / total) * 100;
    return `${MIX_COLORS[i % MIX_COLORS.length]} ${start}% ${end}%`;
  });

  return (
    <Shell>
      <Reveal>
        <SectionHeading
          eyebrow="Allocation"
          title="Recommended Content Mix"
          description="This is the recommended split for this specific account — not an Instagram rule."
        />
      </Reveal>
      <Reveal>
        <div className="panel flex flex-col items-center gap-9 px-6 py-9 sm:px-10 lg:flex-row lg:items-center">
          <div
            className="relative h-56 w-56 shrink-0 rounded-full"
            style={{ background: `conic-gradient(${stops.join(", ")})` }}
            role="img"
            aria-label="Recommended content mix"
          >
            <div className="absolute inset-[22%] rounded-full bg-card" />
          </div>
          <ul className="w-full space-y-3">
            {slices.map((s, i) => (
              <li key={s.label} className="flex items-center gap-3">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ background: MIX_COLORS[i % MIX_COLORS.length] }}
                />
                <span className="flex-1 text-sm font-semibold text-foreground">{s.label}</span>
                <span className="text-sm font-extrabold text-foreground">
                  <Counter value={s.percentage} suffix="%" />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </Shell>
  );
}

/* ---------- 9. experiments ---------- */

function ExperimentLab({ items }: { items: Experiment[] }) {
  if (items.length === 0) return null;
  return (
    <Shell>
      <Reveal>
        <SectionHeading
          eyebrow="Experiment Lab"
          title="Tests Ready To Run"
          description="Controlled tests that grow the strategy without risking what already works."
        />
      </Reveal>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((e, i) => (
          <Reveal key={i} delay={i * 60}>
            <article className="panel hover-lift h-full px-6 py-6">
              <div className="flex items-center justify-between gap-3">
                <Chip tone="gradient">New experiment</Chip>
                <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  Test {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-4 text-base font-extrabold leading-snug tracking-tight text-foreground">
                {e.test}
              </h3>
              <dl className="mt-4 space-y-3.5">
                <Field label="Control" value={e.control} />
                <Field label="Variable" value={e.variable} />
                <Field label="Hypothesis" value={e.hypothesis} />
                <Field label="Success signal" value={e.success_signal} />
              </dl>
            </article>
          </Reveal>
        ))}
      </div>
    </Shell>
  );
}

/* ---------- 10. research + data quality ---------- */

function Research({ research }: { research: Audit["research"] }) {
  const groups = [
    { label: "Current platform findings", items: research.findings },
    { label: "Relevance to this account", items: research.relevance },
    { label: "Research cautions", items: research.cautions },
  ].filter((g) => g.items.length > 0);
  if (groups.length === 0) return null;

  return (
    <Shell>
      <Reveal>
        <SectionHeading
          eyebrow="External context"
          title="Instagram Intelligence"
          description="Platform-level research, kept separate from what this account's own data says."
        />
      </Reveal>
      <div className="grid gap-4 md:grid-cols-3">
        {groups.map((g, i) => (
          <Reveal key={g.label} delay={i * 60}>
            <div className="panel h-full px-6 py-6">
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
                {g.label}
              </h3>
              <ul className="mt-4 space-y-3">
                {g.items.map((item, j) => (
                  <li key={j} className="text-sm leading-relaxed text-foreground/90">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </Shell>
  );
}

function DataQuality({ audit }: { audit: Audit }) {
  const q = audit.data_quality;
  const posts = q.posts_analyzed ?? audit.account.posts_analyzed;
  if (posts === null && !q.confidence && q.limitations.length === 0 && q.sufficient === null)
    return null;

  const low =
    q.sufficient === false ||
    (q.confidence ?? "").toLowerCase().includes("low") ||
    (posts !== null && posts < 10);

  return (
    <Shell>
      <Reveal>
        <div
          className={cn(
            "panel px-6 py-6 sm:px-8",
            low ? "border-warn/35 bg-warn/8" : undefined,
          )}
        >
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-base font-extrabold tracking-tight text-foreground">
              Analysis Confidence
            </h2>
            {q.confidence ? <Chip tone={low ? "warn" : "good"}>{q.confidence}</Chip> : null}
            {posts !== null ? <Chip tone="neutral">{posts} posts analyzed</Chip> : null}
            {q.sufficient !== null ? (
              <Chip tone={q.sufficient ? "good" : "warn"}>
                {q.sufficient ? "Sufficient for pattern analysis" : "Directional only"}
              </Chip>
            ) : null}
          </div>
          {low ? (
            <p className="mt-3 text-sm leading-relaxed text-foreground/90">
              Sample size is limited, so format-level conclusions should be treated as directional.
            </p>
          ) : null}
          {q.limitations.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {q.limitations.map((l, i) => (
                <li key={i} className="text-xs leading-relaxed text-muted-foreground">
                  {l}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Reveal>
    </Shell>
  );
}

/* ---------- dashboard ---------- */

export function Dashboard({ audit }: { audit: Audit }) {
  return (
    <div>
      <Overview audit={audit} />
      <Insights items={audit.insights} />
      <Strategy audit={audit} />
      <Formats rows={audit.formats} />
      <PatternLab audit={audit} />
      <HallOfFame posts={audit.top_posts} username={audit.account.username} />
      <Opportunities items={audit.opportunities} />
      <ContentMix slices={audit.content_mix} />
      <ExperimentLab items={audit.experiments} />
      <Research research={audit.research} />
      <DataQuality audit={audit} />
    </div>
  );
}
