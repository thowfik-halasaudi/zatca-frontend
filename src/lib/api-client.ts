import axios from "axios";
import type {
  OnboardEgsDto,
  IssueCsidDto,
  CheckComplianceDto,
  SignInvoiceDto,
  ApiResponse,
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
  onboard: async (data: OnboardEgsDto): Promise<ApiResponse> => {
    const response = await apiClient.post("/compliance/onboard", data);
    return response.data;
  },

  issueCsid: async (data: IssueCsidDto): Promise<ApiResponse> => {
    const response = await apiClient.post("/compliance/issue-csid", data);
    return response.data;
  },

  checkCompliance: async (data: CheckComplianceDto): Promise<ApiResponse> => {
    const response = await apiClient.post("/compliance/check", data);
    return response.data;
  },
};

// Invoice endpoints
export const invoiceApi = {
  sign: async (data: SignInvoiceDto): Promise<ApiResponse> => {
    const response = await apiClient.post("/invoice/sign", data);
    return response.data;
  },
};

export default apiClient;
