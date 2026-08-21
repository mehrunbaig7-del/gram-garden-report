// Strict types the dashboard renders, plus a tolerant normalizer that maps the
// LLM/n8n JSON response onto them. Nothing here fabricates data: missing values
// become null / empty arrays so sections can hide themselves gracefully.

export type Importance = "high" | "medium" | "low";

export type Insight = {
  insight: string;
  importance: Importance | null;
  confidence: string | null;
  supporting_posts: string[];
};

export type Recommendation = {
  recommendation: string;
  reason: string | null;
  confidence: string | null;
  supporting_posts: string[];
};

export type RecommendationBuckets = {
  continue: Recommendation[];
  make_more: Recommendation[];
  reduce: Recommendation[];
  stop: Recommendation[];
};

export type FormatRow = {
  format: string;
  post_count: number | null;
  average_performance: number | null;
  median_performance: number | null;
  vs_account_median: number | null;
  classification: string | null;
};

export type PatternGroup = {
  label: string;
  items: string[];
};

export type TopPost = {
  id: string;
  rank: number;
  cover_image: string | null;
  url: string | null;
  performance_score: number | null;
  format: string | null;
  topic: string | null;
  why_it_worked: string | null;
  pattern_to_replicate: string | null;
  posted_at: string | null;
  caption: string | null;
};

export type Opportunity = {
  title: string;
  format: string | null;
  hook: string | null;
  concept: string | null;
  structure: string | null;
  why: string | null;
  supporting_posts: string[];
  type: string | null;
  confidence: string | null;
};

export type MixSlice = { label: string; percentage: number };

export type Experiment = {
  test: string;
  control: string | null;
  variable: string | null;
  hypothesis: string | null;
  success_signal: string | null;
};

export type Audit = {
  account: {
    username: string | null;
    niche: string | null;
    overall_score: number | null;
    performance_label: string | null;
    summary: string | null;
    posts_analyzed: number | null;
    avatar: string | null;
  };
  insights: Insight[];
  recommendations: RecommendationBuckets;
  formats: FormatRow[];
  patterns: PatternGroup[];
  top_posts: TopPost[];
  opportunities: Opportunity[];
  content_mix: MixSlice[];
  research: { findings: string[]; relevance: string[]; cautions: string[] };
  experiments: Experiment[];
  data_quality: {
    posts_analyzed: number | null;
    sufficient: boolean | null;
    confidence: string | null;
    limitations: string[];
  };
};

/* ---------- tolerant accessors ---------- */

type Rec = Record<string, unknown>;

const isRec = (v: unknown): v is Rec => typeof v === "object" && v !== null && !Array.isArray(v);

function pick(obj: unknown, ...keys: string[]): unknown {
  if (!isRec(obj)) return undefined;
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
}

function str(v: unknown): string | null {
  if (typeof v === "string") return v.trim() || null;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return null;
}

function num(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number.parseFloat(v.replace(/[^0-9.+-]/g, ""));
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function bool(v: unknown): boolean | null {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const s = v.toLowerCase().trim();
    if (["true", "yes", "sufficient"].includes(s)) return true;
    if (["false", "no", "insufficient"].includes(s)) return false;
  }
  return null;
}

function list(v: unknown): unknown[] {
  if (Array.isArray(v)) return v;
  if (v === undefined || v === null || v === "") return [];
  return [v];
}

/** Turn a list of strings / objects into readable strings. */
function strList(v: unknown): string[] {
  return list(v)
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (isRec(item)) {
        const main = str(
          pick(item, "pattern", "topic", "hook", "structure", "style", "combination", "name", "label", "title", "value", "text"),
        );
        const detail = str(pick(item, "why", "reason", "detail", "note", "evidence", "description"));
        if (main && detail) return `${main} — ${detail}`;
        return main ?? detail ?? null;
      }
      return str(item);
    })
    .filter((s): s is string => !!s);
}

function idList(v: unknown): string[] {
  return list(v)
    .map((item) => (isRec(item) ? str(pick(item, "id", "post_id", "rank", "url")) : str(item)))
    .filter((s): s is string => !!s);
}

function importance(v: unknown): Importance | null {
  const s = str(v)?.toLowerCase();
  if (!s) return null;
  if (s.includes("high") || s.includes("critical")) return "high";
  if (s.includes("med") || s.includes("normal")) return "medium";
  if (s.includes("low") || s.includes("minor")) return "low";
  return null;
}

function confidence(v: unknown): string | null {
  const n = typeof v === "number" ? v : null;
  if (n !== null) return n <= 1 ? `${Math.round(n * 100)}%` : `${Math.round(n)}%`;
  return str(v);
}

/* ---------- section mappers ---------- */

function mapInsights(v: unknown): Insight[] {
  return list(v)
    .map((raw) => {
      const text = typeof raw === "string" ? raw : str(pick(raw, "insight", "title", "finding", "text"));
      if (!text) return null;
      return {
        insight: text,
        importance: importance(pick(raw, "importance", "priority", "severity")),
        confidence: confidence(pick(raw, "confidence", "confidence_level")),
        supporting_posts: idList(pick(raw, "supporting_posts", "supporting_post_ids", "evidence", "posts")),
      } satisfies Insight;
    })
    .filter((x): x is Insight => !!x);
}

function mapRecs(v: unknown): Recommendation[] {
  return list(v)
    .map((raw) => {
      const text =
        typeof raw === "string"
          ? raw
          : str(pick(raw, "recommendation", "action", "title", "pattern", "text"));
      if (!text) return null;
      return {
        recommendation: text,
        reason: str(pick(raw, "reason", "why", "rationale", "evidence", "detail")),
        confidence: confidence(pick(raw, "confidence", "confidence_level")),
        supporting_posts: idList(pick(raw, "supporting_posts", "supporting_post_ids", "posts", "evidence_posts")),
      } satisfies Recommendation;
    })
    .filter((x): x is Recommendation => !!x);
}

function mapBuckets(v: unknown): RecommendationBuckets {
  return {
    continue: mapRecs(pick(v, "continue", "keep", "continue_doing")),
    make_more: mapRecs(pick(v, "make_more", "do_more", "scale", "amplify", "make_more_of")),
    reduce: mapRecs(pick(v, "reduce", "do_less", "reduce_frequency")),
    stop: mapRecs(pick(v, "stop", "avoid", "stop_doing")),
  };
}

function mapFormats(v: unknown): FormatRow[] {
  const rows = Array.isArray(v)
    ? v
    : isRec(v)
      ? Object.entries(v).map(([k, val]) => (isRec(val) ? { format: k, ...val } : { format: k, average_performance: val }))
      : [];
  return rows
    .map((raw) => {
      const format = str(pick(raw, "format", "content_format", "name", "type", "label"));
      if (!format) return null;
      return {
        format,
        post_count: num(pick(raw, "post_count", "posts", "count", "n")),
        average_performance: num(pick(raw, "average_performance", "avg_performance", "average", "avg_score", "performance")),
        median_performance: num(pick(raw, "median_performance", "median", "median_score")),
        vs_account_median: num(
          pick(raw, "vs_account_median", "performance_vs_account_median", "delta_vs_median", "vs_median", "lift"),
        ),
        classification: str(pick(raw, "classification", "verdict", "label", "rating")),
      } satisfies FormatRow;
    })
    .filter((x): x is FormatRow => !!x);
}

const PATTERN_LABELS: Record<string, string> = {
  winning_topics: "Winning Topics",
  topics: "Winning Topics",
  winning_hooks: "Winning Hooks",
  hooks: "Winning Hooks",
  winning_structures: "Winning Structures",
  structures: "Winning Structures",
  winning_presentation_styles: "Winning Presentation Styles",
  presentation_styles: "Winning Presentation Styles",
  winning_combinations: "Winning Topic + Format Combinations",
  winning_topic_format_combinations: "Winning Topic + Format Combinations",
  topic_format_combinations: "Winning Topic + Format Combinations",
  combinations: "Winning Topic + Format Combinations",
};

function titleize(key: string) {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function mapPatterns(v: unknown): PatternGroup[] {
  if (!isRec(v)) {
    const items = strList(v);
    return items.length ? [{ label: "Winning Patterns", items }] : [];
  }
  const order = Object.keys(PATTERN_LABELS);
  const entries = Object.entries(v);
  entries.sort((a, b) => {
    const ai = order.indexOf(a[0]);
    const bi = order.indexOf(b[0]);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
  return entries
    .map(([key, value]) => ({
      label: PATTERN_LABELS[key] ?? titleize(key),
      items: strList(value),
    }))
    .filter((g) => g.items.length > 0);
}

function mapTopPosts(v: unknown): TopPost[] {
  return list(v)
    .map((raw, i) => {
      if (!isRec(raw)) return null;
      const url = str(pick(raw, "url", "post_url", "postUrl", "permalink", "link", "instagram_url"));
      const cover = str(pick(raw, "cover_image", "coverImage", "thumbnailUrl", "thumbnail_url", "displayUrl", "display_url", "image"));
      const rank = num(pick(raw, "rank", "position"));
      return {
        id: str(pick(raw, "id", "post_id", "shortcode")) ?? String(rank ?? i + 1),
        rank: rank ?? i + 1,
        cover_image: cover,
        url,
        performance_score: num(pick(raw, "performance_score", "performance", "score", "performance_index")),
        format: str(pick(raw, "format", "content_format", "type")),
        topic: str(pick(raw, "topic", "theme", "subject")),
        why_it_worked: str(pick(raw, "why_it_worked", "why", "reason", "analysis")),
        pattern_to_replicate: str(pick(raw, "pattern_to_replicate", "replicable_pattern", "pattern", "takeaway")),
        posted_at: str(pick(raw, "posted_at", "timestamp", "date", "taken_at")),
        caption: str(pick(raw, "caption", "text")),
      } satisfies TopPost;
    })
    .filter((x): x is TopPost => !!x);
}

function mapOpportunities(v: unknown): Opportunity[] {
  return list(v)
    .map((raw) => {
      const title = typeof raw === "string" ? raw : str(pick(raw, "idea", "title", "idea_title", "name"));
      if (!title) return null;
      return {
        title,
        format: str(pick(raw, "format", "content_format")),
        hook: str(pick(raw, "hook", "opening")),
        concept: str(pick(raw, "concept", "description", "idea_description")),
        structure: str(pick(raw, "structure", "outline")),
        why: str(pick(raw, "why", "why_recommended", "why_this_is_recommended", "reason", "rationale")),
        supporting_posts: idList(pick(raw, "supporting_posts", "supporting_post_ids", "evidence", "based_on")),
        type: str(pick(raw, "type", "idea_type", "category")),
        confidence: confidence(pick(raw, "confidence", "confidence_level")),
      } satisfies Opportunity;
    })
    .filter((x): x is Opportunity => !!x);
}

function mapMix(v: unknown): MixSlice[] {
  const rows: MixSlice[] = [];
  if (Array.isArray(v)) {
    for (const raw of v) {
      const label = str(pick(raw, "label", "name", "type", "category", "bucket"));
      const pct = num(pick(raw, "percentage", "percent", "share", "value", "pct"));
      if (label && pct !== null) rows.push({ label, percentage: pct });
    }
  } else if (isRec(v)) {
    for (const [k, val] of Object.entries(v)) {
      if (isRec(val)) {
        const pct = num(pick(val, "percentage", "percent", "share", "value"));
        if (pct !== null) rows.push({ label: titleize(k), percentage: pct });
      } else {
        const pct = num(val);
        if (pct !== null) rows.push({ label: titleize(k), percentage: pct });
      }
    }
  }
  return rows;
}

function mapExperiments(v: unknown): Experiment[] {
  return list(v)
    .map((raw) => {
      const test = typeof raw === "string" ? raw : str(pick(raw, "test", "experiment", "name", "title"));
      if (!test) return null;
      return {
        test,
        control: str(pick(raw, "control", "baseline")),
        variable: str(pick(raw, "variable", "variable_tested", "change")),
        hypothesis: str(pick(raw, "hypothesis", "expectation")),
        success_signal: str(pick(raw, "success_signal", "success_metric", "success_criteria", "signal")),
      } satisfies Experiment;
    })
    .filter((x): x is Experiment => !!x);
}

/* ---------- top-level ---------- */

export function normalizeAudit(input: unknown, fallbackUsername?: string): Audit | null {
  // n8n often wraps the payload: array response, { data }, { output }, { json }, { result }
  let root: unknown = input;
  for (let i = 0; i < 4; i++) {
    if (Array.isArray(root)) root = root[0];
    else if (isRec(root)) {
      const inner = root["data"] ?? root["output"] ?? root["json"] ?? root["result"] ?? root["audit"];
      if (inner && (isRec(inner) || Array.isArray(inner))) root = inner;
      else break;
    } else break;
  }
  if (!isRec(root)) return null;

  const overview = pick(root, "account_overview", "overview", "account") ?? root;
  const quality = pick(root, "data_quality", "analysis_confidence", "confidence") ?? {};
  const research = pick(root, "platform_research", "instagram_research", "research") ?? {};
  // Legacy workflow shape: { summary: { overall_performance, evidence_strength } }
  const legacySummary = pick(root, "summary");
  const legacyOverall = isRec(legacySummary) ? str(pick(legacySummary, "overall_performance")) : null;
  const legacyEvidence = isRec(legacySummary) ? str(pick(legacySummary, "evidence_strength")) : null;
  const rootLimitations = strList(pick(root, "limitations", "data_quality_issues"));

  const audit: Audit = {
    account: {
      username: str(pick(overview, "username", "handle", "account", "profile"))?.replace(/^@/, "") ?? fallbackUsername ?? null,
      niche: str(pick(overview, "niche", "category", "vertical")),
      overall_score: num(pick(overview, "overall_score", "score", "account_score", "performance_score")),
      performance_label:
        str(pick(overview, "performance_label", "label", "verdict", "rating", "tier")) ?? legacyOverall,
      summary: str(pick(overview, "ai_summary", "overall_summary", "description")) ?? legacyOverall,
      posts_analyzed: num(pick(overview, "posts_analyzed", "post_count", "posts")) ?? num(pick(quality, "posts_analyzed")),
      avatar: str(pick(overview, "avatar", "profile_pic_url", "profilePicUrl", "avatar_url")),
    },
    insights: mapInsights(pick(root, "executive_insights", "insights", "key_insights")),
    recommendations: mapBuckets(pick(root, "recommendations", "strategy", "actions") ?? root),
    formats: mapFormats(pick(root, "format_analysis", "formats", "format_performance")),
    patterns: mapPatterns(pick(root, "content_patterns", "patterns", "pattern_lab")),
    top_posts: mapTopPosts(pick(root, "top_posts", "top_performing_posts", "hall_of_fame", "top_performers")),
    opportunities: mapOpportunities(pick(root, "content_opportunities", "content_ideas", "opportunities", "ideas")),
    content_mix: mapMix(pick(root, "content_mix", "recommended_content_mix", "mix")),
    research: {
      findings: strList(pick(research, "findings", "current_findings", "platform_findings", "insights")),
      relevance: strList(pick(research, "relevance", "relevance_to_account", "application", "relevance_to_this_account")),
      cautions: strList(pick(research, "cautions", "caveats", "limitations", "warnings")),
    },
    experiments: mapExperiments(pick(root, "testing_strategy", "experiments", "tests", "experiment_lab")),
    data_quality: {
      posts_analyzed: num(pick(quality, "posts_analyzed", "post_count")),
      sufficient: bool(pick(quality, "sufficient_for_pattern_analysis", "sufficient", "is_sufficient")),
      confidence: str(pick(quality, "confidence", "analysis_confidence", "level")) ?? legacyEvidence,
      limitations: [...strList(pick(quality, "limitations", "caveats", "notes")), ...rootLimitations],
    },
  };

  const hasContent =
    audit.account.username ||
    audit.account.overall_score !== null ||
    audit.insights.length ||
    audit.top_posts.length ||
    audit.formats.length ||
    audit.opportunities.length;

  return hasContent ? audit : null;
}

export function totalRecommendations(r: RecommendationBuckets) {
  return r.continue.length + r.make_more.length + r.reduce.length + r.stop.length;
}
