// Server-only transport to the n8n production workflow.
// Credentials never reach the browser: they are read from env at call time.

const DEFAULT_URL = "https://mehruu.app.n8n.cloud/webhook/instagram-audit";

export type AuditFetchResult =
  | { ok: true; payload: unknown }
  | { ok: false; kind: "network" | "upstream"; message: string };

export async function fetchAuditFromN8n(username: string): Promise<AuditFetchResult> {
  const endpoint = process.env["N8N_PRODUCTION_URL"] || DEFAULT_URL;
  const apiKey = process.env["N8N_API_KEY"];

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (apiKey) {
    headers["x-api-key"] = apiKey;
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  const handle = username.trim().replace(/^@/, "");
  const body = JSON.stringify({
    username: handle,
    instagram_username: handle,
    instagram_url: `https://instagram.com/${handle}`,
  });

  let res: Response;
  try {
    res = await fetch(endpoint, { method: "POST", headers, body });
  } catch (e) {
    return {
      ok: false,
      kind: "network",
      message: e instanceof Error ? e.message : "Could not reach the analysis service.",
    };
  }

  const text = await res.text().catch(() => "");

  if (!res.ok) {
    return {
      ok: false,
      kind: "upstream",
      message: `Analysis service responded with ${res.status}${text ? `: ${text.slice(0, 300)}` : ""}`,
    };
  }

  try {
    return { ok: true, payload: JSON.parse(text) as unknown };
  } catch {
    return { ok: false, kind: "upstream", message: "The analysis service did not return JSON." };
  }
}
