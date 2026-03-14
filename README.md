# doge-mcp

An MCP (Model Context Protocol) server that wraps the [doge.gov](https://api.doge.gov) public API, letting Claude query U.S. government spending transparency data — cancelled contracts, grants, leases, and payment records — directly from a conversation.

> **Disclaimer:** This project is an independent, unofficial tool and is not affiliated with, endorsed by, or associated with the U.S. Department of Government Efficiency (DOGE), the U.S. federal government, or any government agency. All data is fetched in real time from the publicly available `api.doge.gov` API. The accuracy, completeness, and timeliness of the data are the sole responsibility of that API. This tool is provided for informational and research purposes only. Nothing returned by this server constitutes legal, financial, or political advice. Use responsibly and in accordance with applicable laws.

---

## Available Tools

| Tool | Endpoint | Description |
|------|----------|-------------|
| `get_grant_savings` | `GET /savings/grants` | Cancelled federal grants — agency, recipient, value, savings |
| `get_contract_savings` | `GET /savings/contracts` | Cancelled federal contracts — PIID, vendor, FPDS status, savings |
| `get_lease_savings` | `GET /savings/leases` | Cancelled property leases — location, sq ft, agency, savings |
| `get_payments` | `GET /payments` | Payment line items with justifications; filterable by agency, date, or org |
| `get_payment_statistics` | `GET /payments/statistics` | Aggregated payment counts by agency, date, and org name |

---

## Prerequisites

- **Node.js** 18 or later
- **npm** 9 or later
- **Claude Desktop** (or any MCP-compatible client)

---

## Installation

```bash
git clone https://github.com/larasrinath/doge_api.git
cd doge_api
npm install
npm run build
```

The compiled server lands in `./dist/index.js`.

---

## Claude Desktop Configuration

Add the following to your `claude_desktop_config.json` (usually at `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "doge": {
      "command": "node",
      "args": ["/absolute/path/to/doge_api/dist/index.js"]
    }
  }
}
```

Replace `/absolute/path/to/doge_api` with the real path on your machine, e.g. `/Users/yourname/Projects/doge_api`.

Restart Claude Desktop after saving. You should see the five DOGE tools appear in the tool picker.

---

## Example Prompts

```
Show me the 10 grants with the highest savings, sorted descending.
```
```
Which federal agencies cancelled the most contracts? Page through the results.
```
```
Find all payments made to org_name "CONNECTICUT STATE DEPT OF REHABILITATION SERVICES".
```
```
What agencies have payment data in the DOGE system? (use get_payment_statistics)
```
```
List cancelled government leases in California sorted by square footage.
```

---

## Development

```bash
# Run directly without building (requires tsx dev dependency)
npm run dev

# Rebuild after changes
npm run build
```

---

## Project Structure

```
doge_api/
├── src/
│   ├── index.ts          # MCP server entry point
│   ├── client.ts         # Typed doge.gov API client (axios)
│   └── tools/
│       ├── savings.ts    # get_grant_savings, get_contract_savings, get_lease_savings
│       └── payments.ts   # get_payments, get_payment_statistics
├── package.json
├── tsconfig.json
├── LICENSE
└── README.md
```

---

## Rate Limits

The `api.doge.gov` API enforces rate limits. If you receive a `429` error, wait a moment and retry. This server surfaces rate limit errors with a clear message rather than crashing.

---

## License

MIT — see [LICENSE](./LICENSE).
