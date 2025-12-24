"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { complianceApi, invoiceApi } from "@/lib/api-client";
import { useTenant } from "@/context/TenantContext";
import type {
  CheckComplianceDto,
  EgsListItem,
  SubmitZatcaDto,
} from "@/lib/types";
import {
  ShieldCheck,
  FileCheck,
  AlertOctagon,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Server,
  FileText,
  Search,
  ArrowRight,
  Loader2,
  Lock,
  Globe,
  Activity,
  Database,
  RefreshCw,
  Trash2,
  Settings,
} from "lucide-react";

export default function CompliancePage() {
  const { activeTenant } = useTenant();
  // Tabs: 'verify', 'submit', 'data'
  const [activeTab, setActiveTab] = useState<"verify" | "submit" | "data">(
    "verify"
  );

  // --- 1. VERIFICATION STATE ---
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyResponse, setVerifyResponse] = useState<any>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const {
    register: registerVerify,
    handleSubmit: handleSubmitVerify,
    setValue: setValueVerify,
    formState: { errors: errorsVerify },
  } = useForm<CheckComplianceDto>();

  const [invoices, setInvoices] = useState<any[]>([]);

  // --- 2. SUBMISSION STATE ---
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitResponse, setSubmitResponse] = useState<any>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitInvoices, setSubmitInvoices] = useState<any[]>([]);

  const {
    register: registerSubmit,
    handleSubmit: handleSubmitSubmit,
    setValue: setValueSubmit,
    formState: { errors: errorsSubmit },
  } = useForm<SubmitZatcaDto>();

  // --- 3. DATA/MANAGEMENT STATE ---
  const [egsUnits, setEgsUnits] = useState<EgsListItem[]>([]);
  const [loadingEgs, setLoadingEgs] = useState(false);

  // --- EFFECTS ---
  useEffect(() => {
    if (activeTenant) {
      // Pre-fill tenant common name for both forms
      setValueVerify("commonName", activeTenant.slug);
      setValueSubmit("commonName", activeTenant.slug);

      // Fetch invoices
      invoiceApi
        .listInvoices(activeTenant.slug)
        .then((data) => {
          setInvoices(data);
          setSubmitInvoices(data);
        })
        .catch((err) => {
          console.error("Failed to fetch invoices", err);
          setInvoices([]);
          setSubmitInvoices([]);
        });
    } else {
      setInvoices([]);
      setSubmitInvoices([]);
    }
  }, [activeTenant, setValueVerify, setValueSubmit]);

  // Fetch EGS Units when Data tab is active
  useEffect(() => {
    if (activeTab === "data") {
      setLoadingEgs(true);
      complianceApi
        .listEgs(activeTenant?.slug)
        .then(setEgsUnits)
        .catch(console.error)
        .finally(() => setLoadingEgs(false));
    }
  }, [activeTab]);

  // --- HANDLERS ---
  const onVerifySubmit = async (data: CheckComplianceDto) => {
    setVerifyLoading(true);
    setVerifyError(null);
    setVerifyResponse(null);
    try {
      const result = await complianceApi.checkCompliance(data);
      setVerifyResponse(result);
    } catch (err: any) {
      setVerifyError(
        err.response?.data?.message || err.message || "An error occurred"
      );
    } finally {
      setVerifyLoading(false);
    }
  };

  const onSubmissionSubmit = async (data: SubmitZatcaDto) => {
    setSubmitLoading(true);
    setSubmitError(null);
    setSubmitResponse(null);
    try {
      const result = await complianceApi.submit(data);
      setSubmitResponse(result);
    } catch (err: any) {
      setSubmitError(
        err.response?.data?.message || err.message || "An error occurred"
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  // --- RENDER HELPERS ---
  const renderVerificationTab = () => (
    <div className="grid lg:grid-cols-12 gap-8 items-start animate-in fade-in slide-in-from-bottom-4">
      {/* Form Area */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Run Compliance Check
            </h3>
          </div>

          <form
            onSubmit={handleSubmitVerify(onVerifySubmit)}
            className="space-y-6"
          >
            <div className="hidden">
              <input {...registerVerify("commonName")} />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Invoice to Verify <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  {...registerVerify("invoiceSerialNumber", { required: true })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
                >
                  <option value="">Choose an invoice...</option>
                  {invoices.map((inv) => (
                    <option key={inv.invoiceNumber} value={inv.invoiceNumber}>
                      {inv.invoiceNumber} — {inv.totalAmount.toFixed(2)} SAR (
                      {new Date(inv.issueDateTime).toLocaleDateString()})
                    </option>
                  ))}
                </select>
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              {errorsVerify.invoiceSerialNumber && (
                <p className="text-xs text-red-500 mt-1">
                  Please select an invoice.
                </p>
              )}
              {invoices.length === 0 && (
                <p className="text-xs text-amber-600 mt-2">
                  No local invoices found to verify.
                </p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={verifyLoading || invoices.length === 0}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all
                        ${
                          verifyLoading || invoices.length === 0
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md"
                        }`}
              >
                {verifyLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                {verifyLoading ? "Verifying..." : "Verify Compliance"}
              </button>
            </div>
          </form>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-3">
              <FileCheck className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-1">
              Structure
            </h4>
            <p className="text-xs text-gray-500">
              Validates UBL 2.1 schema structure and mandatory fields.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-1">
              Signature
            </h4>
            <p className="text-xs text-gray-500">
              Verifies ECDSA signature and XAdES-EPES properties.
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-1">
              Security
            </h4>
            <p className="text-xs text-gray-500">
              Checks certificate chain trust and validity periods.
            </p>
          </div>
        </div>
      </div>

      {/* Results Sidebar */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm sticky top-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-6 border-b border-gray-100 pb-4">
            Verification Results
          </h3>

          {!verifyResponse && !verifyError && (
            <div className="text-center py-10 opacity-50">
              <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-xs font-medium text-gray-400">
                Run a check to see results
              </p>
            </div>
          )}

          {verifyError && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex gap-3 text-red-700">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div>
                <h4 className="text-sm font-bold">Verification Failed</h4>
                <p className="text-xs mt-1 leading-relaxed opacity-90">
                  {verifyError}
                </p>
              </div>
            </div>
          )}

          {verifyResponse && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              {/* Main Status Badge */}
              <div
                className={`flex flex-col items-center justify-center p-6 rounded-xl border ${
                  verifyResponse.validationResults?.status === "PASS"
                    ? "bg-green-50 border-green-100 text-green-800"
                    : "bg-amber-50 border-amber-100 text-amber-800"
                }`}
              >
                {verifyResponse.validationResults?.status === "PASS" ? (
                  <CheckCircle2 className="w-10 h-10 mb-2 text-green-600" />
                ) : (
                  <AlertOctagon className="w-10 h-10 mb-2 text-amber-600" />
                )}
                <h4 className="text-lg font-bold">
                  {verifyResponse.validationResults?.status === "PASS"
                    ? "Compliance Passed"
                    : "Warnings Found"}
                </h4>
              </div>

              {/* Mini Details */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-500">Status</span>
                  <span className="font-semibold text-gray-900">
                    {verifyResponse.clearanceStatus || "Passed"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-500">Reporting</span>
                  <span className="font-semibold text-gray-900">
                    {verifyResponse.reportingStatus || "Success"}
                  </span>
                </div>
              </div>

              {/* Console Log */}
              <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
                <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    System Log
                  </span>
                  <span className="text-[10px] bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                    {verifyResponse.validationResults?.infoMessages?.length ||
                      0}{" "}
                    Infos
                  </span>
                </div>
                <div className="p-4 overflow-auto max-h-[250px] space-y-3">
                  {/* Errors */}
                  {verifyResponse.validationResults?.errorMessages?.length >
                    0 && (
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-red-500 uppercase">
                        Errors
                      </p>
                      {verifyResponse.validationResults.errorMessages.map(
                        (msg: any, i: number) => (
                          <div
                            key={i}
                            className="text-[10px] font-mono text-red-400 bg-red-900/20 p-1.5 rounded"
                          >
                            [{msg.code}] {msg.message}
                          </div>
                        )
                      )}
                    </div>
                  )}
                  {/* Warnings */}
                  {verifyResponse.validationResults?.warningMessages?.length >
                    0 && (
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-amber-500 uppercase">
                        Warnings
                      </p>
                      {verifyResponse.validationResults.warningMessages.map(
                        (msg: any, i: number) => (
                          <div
                            key={i}
                            className="text-[10px] font-mono text-amber-400 bg-amber-900/20 p-1.5 rounded"
                          >
                            [{msg.code}] {msg.message}
                          </div>
                        )
                      )}
                    </div>
                  )}
                  <pre className="text-[10px] font-mono text-gray-500">
                    {JSON.stringify(
                      {
                        qrSellerStatus:
                          verifyResponse.validationResults?.qrSellerStatus,
                        qrBuyertatus:
                          verifyResponse.validationResults?.qrBuyertatus,
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderSubmissionTab = () => (
    <div className="grid lg:grid-cols-12 gap-8 items-start animate-in fade-in slide-in-from-bottom-4">
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
            <Globe className="w-5 h-5 text-purple-600" />
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Submit to ZATCA
            </h3>
          </div>

          <form
            onSubmit={handleSubmitSubmit(onSubmissionSubmit)}
            className="space-y-6"
          >
            <div className="hidden">
              <input {...registerSubmit("commonName")} />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Invoice for Submission{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  {...registerSubmit("invoiceSerialNumber", { required: true })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-purple-600 transition-colors"
                >
                  <option value="">Choose an invoice...</option>
                  {submitInvoices.map((inv) => (
                    <option key={inv.invoiceNumber} value={inv.invoiceNumber}>
                      {inv.invoiceNumber} — {inv.totalAmount.toFixed(2)} SAR
                    </option>
                  ))}
                </select>
                <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              {errorsSubmit.invoiceSerialNumber && (
                <p className="text-xs text-red-500 mt-1">Required field.</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitLoading || submitInvoices.length === 0}
                className={`flex items-center gap-2 px-8 py-3 rounded-lg text-sm font-bold text-white transition-all
                        ${
                          submitLoading || submitInvoices.length === 0
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg"
                        }`}
              >
                {submitLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Globe className="w-5 h-5" />
                )}
                {submitLoading ? "Transmitting..." : "Submit to ZATCA"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Submission Status Sidebar */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm sticky top-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-6 border-b border-gray-100 pb-4">
            Submission Status
          </h3>

          {!submitResponse && !submitError && (
            <div className="text-center py-10 opacity-50">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-xs font-medium text-gray-400">
                Awaiting submission
              </p>
            </div>
          )}

          {submitError && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex gap-3 text-red-700">
              <XCircle className="w-5 h-5 shrink-0" />
              <div>
                <h4 className="text-sm font-bold">Submission Failed</h4>
                <p className="text-xs mt-1 leading-relaxed opacity-90">
                  {submitError}
                </p>
              </div>
            </div>
          )}

          {submitResponse && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div
                className={`p-6 rounded-xl border flex flex-col items-center text-center
                        ${
                          ["CLEARED", "REPORTED"].includes(
                            submitResponse.zatcaStatus
                          )
                            ? "bg-green-50 border-green-100 text-green-800"
                            : "bg-amber-50 border-amber-100 text-amber-800"
                        }`}
              >
                {["CLEARED", "REPORTED"].includes(
                  submitResponse.zatcaStatus
                ) ? (
                  <CheckCircle2 className="w-12 h-12 mb-3 text-green-600" />
                ) : (
                  <AlertTriangle className="w-12 h-12 mb-3 text-amber-600" />
                )}
                <h4 className="text-xl font-black uppercase tracking-tight">
                  {submitResponse.zatcaStatus}
                </h4>
                <p className="text-xs opacity-75 font-mono mt-1">
                  {submitResponse.submissionType}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-500">Cleared Inv</span>
                  <span className="font-semibold">
                    {submitResponse.clearedInvoice ? "Available" : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between text-sm p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-500">Validation</span>
                  <span className="font-semibold text-purple-600">
                    {submitResponse.validationResults?.infoMessages?.length ||
                      0}{" "}
                    Infos
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderDataTab = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">
            Registered Certificates (EGS Units)
          </h3>
          <button
            onClick={() => {
              setLoadingEgs(true);
              complianceApi
                .listEgs()
                .then(setEgsUnits)
                .finally(() => setLoadingEgs(false));
            }}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <RefreshCw
              className={`w-5 h-5 ${loadingEgs ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {loadingEgs && egsUnits.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p>Loading certificates...</p>
          </div>
        ) : egsUnits.length === 0 ? (
          <div className="py-12 text-center">
            <Database className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No certificates found</p>
            <Link
              href="/onboarding"
              className="text-sm text-blue-600 hover:underline mt-2 inline-block"
            >
              Register a new device in Onboarding
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 font-semibold">
                    Common Name (UUID)
                  </th>
                  <th className="px-4 py-3 font-semibold">VAT Number</th>
                  <th className="px-4 py-3 font-semibold">Environment</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {egsUnits.map((u) => (
                  <tr
                    key={u.slug}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">
                        {u.organizationName}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        {u.slug}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-600">
                      {u.vatNumber}
                    </td>
                    <td className="px-4 py-3">
                      {u.production ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          Production
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                          Simulation
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-4">
                        <Link
                          href="/onboarding"
                          className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center gap-1"
                          title="Re-issue CSID"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Renew
                        </Link>
                        <button
                          className="text-red-500 hover:text-red-700 font-medium text-xs flex items-center gap-1 opacity-60 hover:opacity-100"
                          onClick={() =>
                            alert(
                              "To revoke a certificate, please contact the ZATCA portal administration or delete the specific EGS entry from the database manually. Revocation API is not yet standardized."
                            )
                          }
                        >
                          <Trash2 className="w-3 h-3" />
                          Revoke
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* Page Header */}
      <div className="border-l-4 border-blue-600 pl-6">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-2">
          Compliance & Reporting
        </h1>
        <p className="text-gray-600 text-base lg:text-lg">
          Validate invoices, manage certificates, and submit to ZATCA.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab("verify")}
          className={`px-6 py-4 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === "verify"
              ? "text-blue-600 border-blue-600 bg-blue-50/50"
              : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          1. Verify Compliance
        </button>
        <button
          onClick={() => setActiveTab("submit")}
          className={`px-6 py-4 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === "submit"
              ? "text-purple-600 border-purple-600 bg-purple-50/50"
              : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Globe className="w-4 h-4" />
          2. Clearance & Reporting
        </button>
        <button
          onClick={() => setActiveTab("data")}
          className={`px-6 py-4 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === "data"
              ? "text-indigo-600 border-indigo-600 bg-indigo-50/50"
              : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Database className="w-4 h-4" />
          3. Manage Certificates
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "verify" && renderVerificationTab()}
        {activeTab === "submit" && renderSubmissionTab()}
        {activeTab === "data" && renderDataTab()}
      </div>
    </div>
  );
}
