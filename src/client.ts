import axios, { AxiosError } from "axios";

const BASE_URL = "https://api.doge.gov";

const http = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { Accept: "application/json" },
});

// ---- Error type --------------------------------------------------------

export class DogeApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly isRateLimit = false
  ) {
    super(message);
    this.name = "DogeApiError";
  }
}

// ---- Internal GET helper -----------------------------------------------

async function get<T>(
  path: string,
  params: Record<string, unknown> = {}
): Promise<T> {
  // Remove undefined values so they aren't serialised as the string "undefined"
  const cleaned = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined)
  );
  try {
    const { data } = await http.get<T>(path, { params: cleaned });
    return data;
  } catch (err) {
    if (err instanceof AxiosError) {
      const status = err.response?.status;
      const msg =
        (err.response?.data as { message?: string })?.message ?? err.message;
      throw new DogeApiError(msg, status, status === 429);
    }
    throw err;
  }
}

// ---- Shared types -------------------------------------------------------

interface Meta {
  total_results: number;
  pages: number;
}

// ---- Savings: Grants ----------------------------------------------------

export interface Grant {
  date: string;
  agency: string;
  recipient: string;
  value: number;
  savings: number;
  link: string | null;
  description: string | null;
}

export interface GrantsResponse {
  success: boolean;
  result: { grants: Grant[] };
  meta: Meta;
}

export function getGrants(params: {
  sort_by?: "savings" | "value" | "date";
  sort_order?: "asc" | "desc";
  page?: number;
  per_page?: number;
}) {
  return get<GrantsResponse>("/savings/grants", params);
}

// ---- Savings: Contracts -------------------------------------------------

export interface Contract {
  piid: string;
  agency: string;
  vendor: string;
  value: number;
  description: string | null;
  fpds_status: string | null;
  fpds_link: string | null;
  deleted_date: string | null;
  savings: number;
}

export interface ContractsResponse {
  success: boolean;
  result: { contracts: Contract[] };
  meta: Meta;
}

export function getContracts(params: {
  sort_by?: "savings" | "value" | "date";
  sort_order?: "asc" | "desc";
  page?: number;
  per_page?: number;
}) {
  return get<ContractsResponse>("/savings/contracts", params);
}

// ---- Savings: Leases ----------------------------------------------------

export interface Lease {
  date: string;
  location: string;
  sq_ft: number;
  description: string | null;
  value: number;
  savings: number;
  agency: string;
}

export interface LeasesResponse {
  success: boolean;
  result: { leases: Lease[] };
  meta: Meta;
}

export function getLeases(params: {
  sort_by?: "savings" | "value" | "date";
  sort_order?: "asc" | "desc";
  page?: number;
  per_page?: number;
}) {
  return get<LeasesResponse>("/savings/leases", params);
}

// ---- Payments -----------------------------------------------------------

export interface Payment {
  payment_date: string;
  payment_amt: number;
  agency_name: string;
  award_description: string | null;
  fain: string | null;
  recipient_justification: string;
  agency_lead_justification: string;
  org_name: string | null;
  generated_unique_award_id: string | null;
}

export interface PaymentsResponse {
  success: boolean;
  result: { payments: Payment[] };
  meta: Meta;
}

export function getPayments(params: {
  sort_by?: "amount" | "date";
  sort_order?: "asc" | "desc";
  page?: number;
  per_page?: number;
  filter?: "agency_name" | "date" | "org_name";
  filter_value?: string;
}) {
  return get<PaymentsResponse>("/payments", params);
}

// ---- Payment Statistics -------------------------------------------------

export interface PaymentStatistics {
  agency: { agency_name: string; count: number }[];
  request_date: { date: string; count: number }[];
  org_names: { org_name: string; count: number }[];
}

export interface PaymentStatisticsResponse {
  success: boolean;
  result: PaymentStatistics;
}

export function getPaymentStatistics() {
  return get<PaymentStatisticsResponse>("/payments/statistics");
}
