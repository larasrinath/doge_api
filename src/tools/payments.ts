import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getPayments, getPaymentStatistics, DogeApiError } from "../client.js";

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

export function registerPaymentTools(server: McpServer): void {
  server.tool(
    "get_payments",
    [
      "Retrieve government payment line items from select agencies processed via the Program Support Center.",
      "Each record includes payment date, amount, agency name, award description, FAIN,",
      "recipient payment justification, agency lead justification, and recipient organisation name.",
      "Use the filter + filter_value params to narrow results by agency_name, date (YYYY-MM-DD), or org_name.",
      "Tip: call get_payment_statistics first to discover valid agency names and org names.",
    ].join(" "),
    {
      sort_by: z
        .enum(["amount", "date"])
        .optional()
        .describe("Field to sort by: amount or date"),
      sort_order: z
        .enum(["asc", "desc"])
        .optional()
        .describe("Sort direction: asc or desc"),
      page: z
        .number()
        .int()
        .min(1)
        .optional()
        .describe("Page number (default: 1)"),
      per_page: z
        .number()
        .int()
        .min(1)
        .max(500)
        .optional()
        .describe("Results per page, 1–500 (default: 100)"),
      filter: z
        .enum(["agency_name", "date", "org_name"])
        .optional()
        .describe(
          "Field to filter by: agency_name, date (YYYY-MM-DD), or org_name. Must be used together with filter_value."
        ),
      filter_value: z
        .string()
        .optional()
        .describe("Value to match for the selected filter field."),
    },
    async (args) => {
      const hasFilter = args.filter !== undefined;
      const hasValue = args.filter_value !== undefined && args.filter_value !== "";
      if (hasFilter !== hasValue) {
        throw new Error(
          "filter and filter_value must be provided together — supply both or neither."
        );
      }
      try {
        const data = await getPayments(args);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (err) {
        wrapError(err);
      }
    }
  );

  server.tool(
    "get_payment_statistics",
    "Retrieve aggregated payment counts grouped by agency name, request date, and organisation name. No parameters required. Use this to discover which agencies and organisations have payment data before calling get_payments with a filter.",
    {},
    async () => {
      try {
        const data = await getPaymentStatistics();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (err) {
        wrapError(err);
      }
    }
  );
}
