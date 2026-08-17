import { useState } from "react";
import type { AuditItem, AuditResponse } from "@/lib/instagram-audit";

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="card-soft px-5 py-6">
      <p className="text-3xl font-extrabold tracking-tight text-foreground">{value}</p>
      <p className="mt-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function Section({
  title,
  children,
  description,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12">
      <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">{title}</h2>
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function PostTable({ items, accent }: { items: AuditItem[]; accent: "up" | "down" }) {
  if (items.length === 0) return <EmptyNote />;
  return (
    <div className="card-soft overflow-hidden">
      <div className="hidden grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-6 border-b border-border px-6 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid">
        <span>Post</span>
        <span>Reason</span>
      </div>
      <ul className="divide-y divide-border">
        {items.map((item, i) => (
          <li
            key={i}
            className="grid gap-2 px-6 py-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:gap-6"
          >
            <div className="flex items-start gap-2.5">
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  accent === "up" ? "bg-ig-gradient" : "bg-muted-foreground/40"
                }`}
              />
              <p className="text-sm font-semibold text-foreground">{item.post ?? item.title}</p>
            </div>
            <p className="pl-5 text-sm leading-relaxed text-muted-foreground md:pl-0">
              {item.reason ?? item.detail}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EmptyNote() {
  return (
    <div className="card-soft px-6 py-8 text-sm text-muted-foreground">
      No data available for this section.
    </div>
  );
}

function BulletCards({ items }: { items: string[] }) {
  if (items.length === 0) return <EmptyNote />;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item, i) => (
        <div key={i} className="card-soft flex items-start gap-3 px-5 py-4">
          <span className="bg-ig-gradient mt-1.5 h-2 w-2 shrink-0 rounded-full" />
          <p className="text-sm leading-relaxed text-foreground">{item}</p>
        </div>
      ))}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) return <EmptyNote />;
  return (
    <div className="card-soft px-6 py-5">
      <ul className="space-y-3.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <p className="text-sm leading-relaxed text-foreground">{item}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AuditResults({ data }: { data: AuditResponse }) {
  const [showLimits, setShowLimits] = useState(false);
  const m = data.metrics ?? {};

  return (
    <div className="mx-auto w-full max-w-4xl px-5 pb-24 pt-12">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Instagram Content Audit
        </h1>
        {data.username ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Report for <span className="font-semibold text-primary">@{data.username}</span>
          </p>
        ) : null}
      </header>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard value={String(m.posts_analyzed ?? "—")} label="Posts Analyzed" />
        <StatCard value={m.average_engagement ?? "—"} label="Average Engagement" />
        <StatCard value={m.total_views ?? "—"} label="Total Views" />
        <StatCard value={data.summary?.evidence_strength ?? "—"} label="Evidence Strength" />
      </div>

      <Section title="Overall Performance">
        <div className="card-soft bg-accent/50 px-6 py-6">
          <p className="text-sm leading-relaxed text-foreground sm:text-base">
            {data.summary?.overall_performance ?? "No summary available."}
          </p>
        </div>
      </Section>

      <Section title="Top Performers">
        <PostTable items={data.top_performers} accent="up" />
      </Section>

      <Section title="Underperformers">
        <PostTable items={data.underperformers} accent="down" />
      </Section>

      <Section title="Content Patterns">
        <BulletCards items={data.content_patterns} />
      </Section>

      <Section title="Caption Insights">
        <BulletList items={data.caption_insights} />
      </Section>

      <Section title="Hashtag Insights">
        <BulletList items={data.hashtag_insights} />
      </Section>

      <Section title="Engagement Patterns">
        <BulletList items={data.engagement_patterns} />
      </Section>

      <Section title="Recommendations" description="Start at the top — these have the most impact.">
        {data.recommendations.length === 0 ? (
          <EmptyNote />
        ) : (
          <div className="space-y-3">
            {data.recommendations.map((r, i) => (
              <div key={i} className="shadow-lift rounded-3xl border border-accent bg-card p-6">
                <div className="flex items-start gap-4">
                  <span className="bg-ig-gradient flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-base font-bold tracking-tight text-foreground">
                      {r.recommendation}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.action}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {data.data_quality_issues.length > 0 ? (
        <section className="mt-12 rounded-3xl border border-accent bg-accent/60 px-6 py-5">
          <h2 className="text-sm font-bold text-accent-foreground">Data quality notes</h2>
          <p className="mt-1 text-xs text-accent-foreground/80">
            Some metrics in this report may be less reliable.
          </p>
          <ul className="mt-3 space-y-2">
            {data.data_quality_issues.map((issue, i) => (
              <li key={i} className="text-sm leading-relaxed text-foreground">
                {issue}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {data.limitations.length > 0 ? (
        <section className="mt-8 border-t border-border pt-5">
          <button
            onClick={() => setShowLimits((v) => !v)}
            className="text-xs font-medium text-muted-foreground underline-offset-4 hover:underline"
          >
            {showLimits ? "Hide limitations" : "What this audit doesn't cover"}
          </button>
          {showLimits ? (
            <ul className="mt-3 space-y-2">
              {data.limitations.map((l, i) => (
                <li key={i} className="text-xs leading-relaxed text-muted-foreground">
                  {l}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
