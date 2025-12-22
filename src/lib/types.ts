// TypeScript types matching backend DTOs

export enum Environment {
  SIMULATION = "SIMULATION",
  PRODUCTION = "PRODUCTION",
}

// Compliance DTOs
export interface OnboardEgsDto {
  commonName: string;
  serialNumber: string;
  organizationIdentifier: string;
  organizationUnitName: string;
  organizationName: string;
  countryName: string;
  invoiceType: string;
  locationAddress: string;
  industryBusinessCategory: string;
  production?: boolean;
}

export interface IssueCsidDto {
  commonName: string;
  otp: string;
  production?: boolean;
}

export interface CheckComplianceDto {
  commonName: string;
  invoiceSerialNumber: string;
}

// Invoice DTOs
export interface EgsDto {
  commonName: string;
  organizationName?: string;
  organizationUnitName?: string;
  vatNumber: string;
  crNumber?: string;
  countryCode?: string;
  invoiceType?: string;
  production?: boolean;
}

export interface InvoiceMetaDto {
  uuid?: string;
  issueDate?: string;
  issueTime?: string;
  currency?: string;
  previousInvoiceHash?: string;
  paymentMeansCode?: string;
  deliveryDate?: string;
  invoiceTypeCode?: string;
  invoiceTypeCodeName?: string;
  billingReferenceId?: string;
}

export interface AddressDto {
  street?: string;
  buildingNumber?: string;
  district?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export interface SupplierDto {
  registrationName: string;
  vatNumber: string;
  address: AddressDto;
}

export interface CustomerDto {
  type?: string;
  name?: string;
  registrationName?: string;
  vatNumber?: string;
  crNumber?: string;
  address?: AddressDto;
}

export interface InvoiceLineItemDto {
  lineId: string;
  type?: string;
  description: string;
  quantity: number;
  unitCode?: string;
  unitPrice: number;
  taxExclusiveAmount: number;
  vatPercent: number;
  vatAmount: number;
  taxCategory?: string;
}

export interface TotalsDto {
  lineExtensionTotal: number;
  taxExclusiveTotal: number;
  vatTotal: number;
  taxInclusiveTotal: number;
  payableAmount: number;
}

export interface SignInvoiceDto {
  egs: EgsDto;
  invoice: InvoiceMetaDto;
  supplier: SupplierDto;
  customer?: CustomerDto;
  lineItems: InvoiceLineItemDto[];
  totals: TotalsDto;
}

// Specific Response Types
export interface OnboardResponse {
  privateKey: string;
  csr: string;
  message: string;
}

export interface CsidResponse {
  privateKey?: string;
  certificate: string;
  secret: string;
  requestId: string | number;
  message: string;
}

export interface SignResponse {
  signedXml: string;
  qrCode?: string;
  fileName: string;
  message: string;
}

export interface SubmitZatcaDto {
  commonName: string;
  invoiceSerialNumber: string;
  production?: boolean;
}

export interface ZatcaSubmissionResponse {
  submissionType: "CLEARANCE" | "REPORTING";
  zatcaStatus: "CLEARED" | "REPORTED" | "REJECTED" | "WARNING";
  validationResults: {
    infoMessages: any[];
    warningMessages: any[];
    errorMessages: any[];
    status: string;
  };
  clearanceStatus?: string;
  reportingStatus?: string;
  clearedInvoice?: string;
  message: string;
}

export interface ComplianceResponse {
  validationResults: {
    infoMessages: any[];
    warningMessages: any[];
    errorMessages: any[];
    status: string;
  };
  reportingStatus: string;
  clearanceStatus: string;
  qrSellertName: string;
  qrVatNumber: string;
  reportPath?: string;
  message?: string;
}

export interface EgsListItem {
  slug: string;
  organizationName: string;
  vatNumber: string;
}

// Generic API Response wrapper (for errors primarily)
export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
}
