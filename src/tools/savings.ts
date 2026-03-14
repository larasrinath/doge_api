import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getGrants, getContracts, getLeases, DogeApiError } from "../client.js";

// ---- Shared schemas -----------------------------------------------------

const sortBy = z
  .enum(["savings", "value", "date"])
  .optional()
  .describe("Field to sort by: savings, value, or date");

const sortOrder = z
  .enum(["asc", "desc"])
  .optional()
  .describe("Sort direction: asc or desc");

const page = z
  .number()
  .int()
  .min(1)
  .optional()
  .describe("Page number (default: 1)");

const perPage = z
  .number()
  .int()
  .min(1)
  .max(500)
  .optional()
  .describe("Results per page, 1–500 (default: 100)");

// ---- Error helper -------------------------------------------------------

function wrapError(err: unknown): never {
  if (err instanceof DogeApiError) {
    if (err.isRateLimit)
      throw new Error("Rate limit exceeded — please try again in a moment.");
    throw new Error(
      `DOGE API error (HTTP ${err.statusCode ?? "unknown"}): ${err.message}`
    );
  }
  throw err;
}

// ---- Tool registrations -------------------------------------------------

export function registerSavingsTools(server: McpServer): void {
  server.tool(
    "get_grant_savings",
    "Retrieve cancelled federal grants reported by DOGE. Each record includes the cancellation date, agency, recipient organisation, original dollar value, savings amount, and a link to usaspending.gov. Supports sorting and pagination.",
    { sort_by: sortBy, sort_order: sortOrder, page, per_page: perPage },
    async (args) => {
      try {
        const data = await getGrants(args);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (err) {
        wrapError(err);
      }
    }
  );

  server.tool(
    "get_contract_savings",
    "Retrieve cancelled federal contracts reported by DOGE. Each record includes the PIID, agency, vendor, contract value, estimated savings, FPDS status, a link to the FPDS entry, and the deletion date. Supports sorting and pagination.",
    { sort_by: sortBy, sort_order: sortOrder, page, per_page: perPage },
    async (args) => {
      try {
        const data = await getContracts(args);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (err) {
        wrapError(err);
      }
    }
  );

  server.tool(
    "get_lease_savings",
    "Retrieve cancelled federal property leases reported by DOGE. Each record includes the cancellation date, city/state location, square footage, agency, annualised lease value, and the remaining-value savings. Supports sorting and pagination.",
    { sort_by: sortBy, sort_order: sortOrder, page, per_page: perPage },
    async (args) => {
      try {
        const data = await getLeases(args);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (err) {
        wrapError(err);
      }
    }
  );
}
