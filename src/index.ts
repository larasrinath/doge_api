import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerSavingsTools } from "./tools/savings.js";
import { registerPaymentTools } from "./tools/payments.js";

const server = new McpServer({
  name: "doge-mcp",
  version: "1.0.0",
});

registerSavingsTools(server);
registerPaymentTools(server);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("DOGE MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error starting DOGE MCP server:", err);
  process.exit(1);
});
