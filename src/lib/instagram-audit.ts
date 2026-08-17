// API service layer for the Instagram audit.
//
// To connect the real backend (e.g. an n8n webhook), set
// VITE_AUDIT_WEBHOOK_URL in the project env. When it is absent we fall back to
// mock data so the UI stays fully explorable.

export type AuditItem = {
  post?: string;
  reason?: string;
  title?: string;
  detail?: string;
};

export type Recommendation = {
  recommendation: string;
  action: string;
};

export type AuditResponse = {
  success: boolean;
  username?: string;
  profile_url?: string;
  metrics?: {
    posts_analyzed?: number;
    average_engagement?: string;
    total_views?: string;
  };
  summary: {
    evidence_strength?: string;
    overall_performance?: string;
  };
  top_performers: AuditItem[];
  underperformers: AuditItem[];
  content_patterns: string[];
  caption_insights: string[];
  hashtag_insights: string[];
  engagement_patterns: string[];
  recommendations: Recommendation[];
  data_quality_issues: string[];
  limitations: string[];
};

export function extractUsername(url: string): string {
  const cleaned = url.trim().replace(/\/+$/, "");
  const match = cleaned.match(/instagram\.com\/([^/?#]+)/i);
  if (match?.[1]) return match[1];
  return cleaned.replace(/^@/, "") || "your account";
}

export async function analyzeInstagramProfile(instagramUrl: string): Promise<AuditResponse> {
  const endpoint = import.meta.env["VITE_AUDIT_WEBHOOK_URL"] as string | undefined;
  const username = extractUsername(instagramUrl);

  if (endpoint) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instagram_url: instagramUrl }),
    });
    if (!res.ok) throw new Error(`Audit failed (${res.status})`);
    const data = (await res.json()) as AuditResponse;
    return normalize(data, instagramUrl, username);
  }

  await new Promise((r) => setTimeout(r, 3200));
  return normalize(mockAudit(username), instagramUrl, username);
}

function normalize(data: AuditResponse, url: string, username: string): AuditResponse {
  return {
    ...data,
    username: data.username ?? username,
    profile_url: data.profile_url ?? url,
    summary: data.summary ?? {},
    top_performers: data.top_performers ?? [],
    underperformers: data.underperformers ?? [],
    content_patterns: data.content_patterns ?? [],
    caption_insights: data.caption_insights ?? [],
    hashtag_insights: data.hashtag_insights ?? [],
    engagement_patterns: data.engagement_patterns ?? [],
    recommendations: data.recommendations ?? [],
    data_quality_issues: data.data_quality_issues ?? [],
    limitations: data.limitations ?? [],
  };
}

function mockAudit(username: string): AuditResponse {
  return {
    success: true,
    username,
    metrics: {
      posts_analyzed: 42,
      average_engagement: "4.8%",
      total_views: "312K",
    },
    summary: {
      evidence_strength: "Strong",
      overall_performance:
        "Your account is performing above average for your size. Short-form video is carrying most of your reach, while static single-image posts pull the account average down. Engagement is concentrated in the first two hours after posting, which suggests a loyal core audience but limited discovery beyond it. Doubling down on your educational carousel format and keeping a consistent 4-posts-per-week cadence is the fastest path to growth.",
    },
    top_performers: [
      {
        post: "Reel — “3 mistakes I made in my first year”",
        reason: "Hook in the first second plus on-screen text drove 6x your average saves.",
      },
      {
        post: "Carousel — “Content calendar template”",
        reason: "Actionable, save-worthy value; highest share rate of the last 90 days.",
      },
      {
        post: "Reel — Behind-the-scenes studio day",
        reason: "Personal, face-to-camera storytelling kept 68% average watch time.",
      },
    ],
    underperformers: [
      {
        post: "Single image — Product flat lay",
        reason: "No context or caption hook; engagement 71% below your account average.",
      },
      {
        post: "Quote graphic",
        reason: "Generic and reposted format — low saves and almost no comments.",
      },
      {
        post: "Long announcement post",
        reason: "Key message buried after the “more” cut; most viewers never read it.",
      },
    ],
    content_patterns: [
      "Reels outperform static posts by roughly 3.4x on reach.",
      "Educational carousels earn the most saves and profile visits.",
      "Posts featuring your face get 2x more comments than product-only posts.",
      "Series-style content brings viewers back within 24 hours.",
    ],
    caption_insights: [
      "Your strongest captions open with a one-line hook under 8 words.",
      "Captions with a clear question at the end get 40% more comments.",
      "Captions over 900 characters see a sharp drop in read-through.",
    ],
    hashtag_insights: [
      "5–8 focused, niche hashtags outperform 20+ broad ones.",
      "Branded hashtag appears on only 30% of posts — inconsistent.",
      "Very large hashtags (>5M posts) bring almost no measurable reach.",
    ],
    engagement_patterns: [
      "Peak engagement window: weekdays 7–9pm local time.",
      "Tuesday and Thursday posts consistently beat weekend posts.",
      "Replying to comments within an hour correlates with higher final reach.",
    ],
    recommendations: [
      {
        recommendation: "Publish three Reels per week using your proven hook formula",
        action:
          "Batch-film on one day, and open every Reel with a problem statement plus on-screen text in the first second.",
      },
      {
        recommendation: "Turn your best-saved carousels into a recurring series",
        action:
          "Pick one teaching theme and post it every Tuesday with consistent cover styling so followers learn to expect it.",
      },
      {
        recommendation: "Rewrite captions with a hook-first structure",
        action:
          "One-line hook, three short value lines, then a single question as the call to action.",
      },
      {
        recommendation: "Trim your hashtag set",
        action: "Use 6 niche hashtags plus your branded tag on every post, and drop anything over 5M posts.",
      },
      {
        recommendation: "Retire low-context static posts",
        action:
          "Replace flat lays and quote graphics with face-to-camera clips or before/after formats.",
      },
    ],
    data_quality_issues: [
      "View counts are unavailable for older static posts, so total views may be understated.",
      "Follower count at time of posting could not be retrieved, so engagement rates use the current follower count.",
    ],
    limitations: [
      "Only public data from the most recent 42 posts was analyzed.",
      "Stories, Lives, and collaboration posts are not included.",
      "Insights are directional and cannot access private account analytics such as reach source or audience demographics.",
    ],
  };
}
