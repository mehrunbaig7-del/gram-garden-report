import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { fetchAuditFromN8n } from "./audit.server";

export const runAudit = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ username: z.string().min(1).max(60) }).parse(data))
  .handler(async ({ data }) => {
    return fetchAuditFromN8n(data.username);
  });
