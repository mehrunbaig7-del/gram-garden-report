// Server-only transport to the n8n production workflow.
// Credentials never reach the browser: they are read from env at call time.
// Calling n8n from the server also avoids browser CORS entirely.

export type AuditFetchResult =
  | { ok: true; payloadJson: string; status: number; endpointHost: string }
  | {
      ok: false;
      kind: "config" | "network" | "upstream" | "format";
      message: string;
      status?: number;
      endpointHost: string;
    };

function readEndpoint(): string | undefined {
  return (
    process.env["N8N_WEBHOOK_URL"] ||
    process.env["N8N_PRODUCTION_URL"] ||
    process.env["VITE_N8N_WEBHOOK_URL"] ||
    undefined
  );
}

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "invalid-url";
  }
}

export async function fetchAuditFromN8n(username: string): Promise<AuditFetchResult> {
  const endpoint = readEndpoint();
  if (!endpoint) {
    return {
      ok: false,
      kind: "config",
      endpointHost: "unset",
      message:
        "The analysis webhook is not configured. Set N8N_WEBHOOK_URL in the project environment.",
    };
  }

  const endpointHost = hostOf(endpoint);
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
    const message = e instanceof Error ? e.message : "Could not reach the analysis service.";
    console.error("[audit.server] network failure", { endpointHost, message });
    return { ok: false, kind: "network", endpointHost, message };
  }

  const text = await res.text().catch(() => "");

  if (!res.ok) {
    console.error("[audit.server] upstream error", {
      endpointHost,
      status: res.status,
      bodyPreview: text.slice(0, 500),
    });
    return {
      ok: false,
      kind: "upstream",
      status: res.status,
      endpointHost,
      message: `Analysis service responded with ${res.status}${text ? `: ${text.slice(0, 300)}` : ""}`,
    };
  }

  try {
    JSON.parse(text);
  } catch {
    console.error("[audit.server] non-JSON response", {
      endpointHost,
      status: res.status,
      bodyPreview: text.slice(0, 500),
    });
    return {
      ok: false,
      kind: "format",
      status: res.status,
      endpointHost,
      message: "The analysis service did not return JSON.",
    };
  }

  return { ok: true, payloadJson: text, status: res.status, endpointHost };
}
