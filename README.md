<div align="center">

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Node.js: 18+](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)
[![API: v0.0.2-beta](https://img.shields.io/badge/doge.gov%20API-v0.0.2--beta-orange.svg)](https://api.doge.gov/docs#/)

# DOGE MCP

</div>

An MCP (Model Context Protocol) server that wraps the [doge.gov](https://api.doge.gov) public API, letting Claude query U.S. government spending transparency data — cancelled contracts, grants, leases, and payment records — directly from a conversation.

> **Disclaimer:** This project is an independent, unofficial tool and is not affiliated with, endorsed by, or associated with the U.S. Department of Government Efficiency (DOGE), the U.S. federal government, or any government agency. All data is fetched in real time from the publicly available `api.doge.gov` API. The accuracy, completeness, and timeliness of the data are the sole responsibility of that API. This tool is provided for informational and research purposes only. Nothing returned by this server constitutes legal, financial, or political advice. Use responsibly and in accordance with applicable laws.

> **API status:** The doge.gov API is in beta and subject to change without notice. Tool behaviour may change as the upstream API evolves.

---

## Available Tools

| Tool | Endpoint | Description |
|------|----------|-------------|
| `get_grant_savings` | `GET /savings/grants` | Cancelled federal grants — agency, recipient, value, savings |
| `get_contract_savings` | `GET /savings/contracts` | Cancelled federal contracts — PIID, vendor, FPDS status, savings |
| `get_lease_savings` | `GET /savings/leases` | Cancelled property leases — location, sq ft, agency, savings |
| `get_payments` | `GET /payments` | Payment line items with justifications; filterable by agency, date, or org |
| `get_payment_statistics` | `GET /payments/statistics` | Aggregated payment counts by agency, date, and org name |

### Tool Parameters

**`get_grant_savings` / `get_contract_savings` / `get_lease_savings`**

| Parameter | Type | Values | Default |
|-----------|------|--------|---------|
| `sort_by` | string | `savings` `value` `date` | — |
| `sort_order` | string | `asc` `desc` | — |
| `page` | number | ≥ 1 | 1 |
| `per_page` | number | 1 – 500 | 100 |

**`get_payments`**

| Parameter | Type | Values | Default |
|-----------|------|--------|---------|
| `sort_by` | string | `amount` `date` | — |
| `sort_order` | string | `asc` `desc` | — |
| `page` | number | ≥ 1 | 1 |
| `per_page` | number | 1 – 500 | 100 |
| `filter` | string | `agency_name` `date` `org_name` | — |
| `filter_value` | string | value to match | — |

> **Filtering payments:** `filter` and `filter_value` must always be supplied together. Use `get_payment_statistics` first to discover valid agency names and organisation names, then pass the exact string as `filter_value`.

**`get_payment_statistics`** — no parameters.

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

### macOS

Config file: `~/Library/Application Support/Claude/claude_desktop_config.json`

### Windows

Config file: `%APPDATA%\Claude\claude_desktop_config.json`

### Linux

Config file: `~/.config/Claude/claude_desktop_config.json`

---

Add the following block (adjust the path to match your machine):

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

**macOS/Linux example:**
```json
"args": ["/Users/yourname/Projects/doge_api/dist/index.js"]
```

**Windows example:**
```json
"args": ["C:\\Users\\yourname\\Projects\\doge_api\\dist\\index.js"]
```

Restart Claude Desktop after saving. The five DOGE tools will appear in the tool picker.

---

## Example Prompts

```
Show me the 10 grants with the highest savings, sorted descending.
```
```
Which federal agencies cancelled the most contracts? Page through the results.
```
```
What agencies have payment data available? (use get_payment_statistics first)
```
```
Find all payments made to org_name "CONNECTICUT STATE DEPT OF REHABILITATION SERVICES".
```
```
List cancelled government leases sorted by savings, largest first.
```
```
Show me contracts cancelled by the General Services Administration.
```

---

## Development

```bash
# Run directly without building (uses tsx, included in devDependencies)
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

The `api.doge.gov` API enforces rate limits. If you receive a `429` error, wait a moment and retry. This server surfaces rate limit errors with a clear message rather than crashing silently.

---

## License

MIT — see [LICENSE](./LICENSE).
