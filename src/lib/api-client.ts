import axios from "axios";
import type {
  OnboardEgsDto,
  IssueCsidDto,
  CheckComplianceDto,
  SignInvoiceDto,
  OnboardResponse,
  CsidResponse,
  SignResponse,
  ComplianceResponse,
  EgsListItem,
  SubmitZatcaDto,
  ZatcaSubmissionResponse,
  IssueProductionCsidDto,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * complianceApi
 *
 * Handles all ZATCA onboarding and compliance-related network calls.
 * Used for CSR generation, CSID issuance, and the final production submission.
 */
export const complianceApi = {
  /** Handshake Step 1: Local Keys/CSR */
  onboard: (data: OnboardEgsDto) =>
    apiClient
      .post<OnboardResponse>("/compliance/onboard", data)
      .then((r) => r.data),

  /** Handshake Step 2: ZATCA Certificate Exchange */
  issueCsid: (data: IssueCsidDto) =>
    apiClient
      .post<CsidResponse>("/compliance/issue-csid", data)
      .then((r) => r.data),

  /** Step 4: Dry-run check for invoice compliance */
  checkCompliance: (data: CheckComplianceDto) =>
    apiClient
      .post<ComplianceResponse>("/compliance/check", data)
      .then((r) => r.data),

  /** Retrieves all profiles registered on this microservice */
  listEgs: (commonName?: string) =>
    apiClient
      .get<EgsListItem[]>("/compliance/egs", { params: { commonName } })
      .then((r) => r.data),

  /** Step 5: Final Submission to ZATCA Simulation/Production */
  submit: (data: SubmitZatcaDto) =>
    apiClient
      .post<ZatcaSubmissionResponse>("/compliance/submit", data)
      .then((r) => r.data),

  /** Step 6: Exchange Compliance CSID for Production CSID */
  /** Step 6: Exchange Compliance CSID for Production CSID */
  issueProductionCsid: (data: IssueProductionCsidDto) =>
    apiClient
      .post<CsidResponse>("/compliance/production", data)
      .then((r) => r.data),
};

/**
 * invoiceApi
 *
 * Handles core invoice operations like XML generation and Digital Signing.
 */
export const invoiceApi = {
  /** Signs an invoice XML using the private key and CSR data */
  sign: (data: SignInvoiceDto) =>
    apiClient.post<SignResponse>("/invoice/sign", data).then((r) => r.data),

  /** Lists invoices for a given EGS Common Name */
  listInvoices: (commonName: string) =>
    apiClient
      .get<any[]>(`/invoice`, { params: { commonName } })
      .then((r) => r.data),

  /** Gets full detail of a single invoice by its number */
  getInvoice: (invoiceNumber: string) =>
    apiClient.get<any>(`/invoice/${invoiceNumber}`).then((r) => r.data),

  /** Gets raw ZATCA response for a single invoice */
  getZatcaResponse: (invoiceNumber: string) =>
    apiClient
      .get<any>(`/invoice/${invoiceNumber}/zatca-response`)
      .then((r) => r.data),
};

export default apiClient;
