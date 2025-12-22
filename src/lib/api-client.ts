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
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Compliance endpoints
export const complianceApi = {
  onboard: (data: OnboardEgsDto) =>
    apiClient
      .post<OnboardResponse>("/compliance/onboard", data)
      .then((r) => r.data),
  issueCsid: (data: IssueCsidDto) =>
    apiClient
      .post<CsidResponse>("/compliance/issue-csid", data)
      .then((r) => r.data),
  checkCompliance: (data: CheckComplianceDto) =>
    apiClient
      .post<ComplianceResponse>("/compliance/check", data)
      .then((r) => r.data),
  listEgs: () =>
    apiClient.get<EgsListItem[]>("/compliance/egs").then((r) => r.data),
};

// Invoice endpoints
export const invoiceApi = {
  sign: (data: SignInvoiceDto) =>
    apiClient.post<SignResponse>("/invoice/sign", data).then((r) => r.data),
};

export default apiClient;
