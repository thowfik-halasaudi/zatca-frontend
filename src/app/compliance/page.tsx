"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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
} from "lucide-react";

export default function CompliancePage() {
  const { activeTenant } = useTenant();
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckComplianceDto>();

  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    if (activeTenant) {
      setValue("commonName", activeTenant.slug);
      invoiceApi
        .listInvoices(activeTenant.slug)
        .then((data) => setInvoices(data))
        .catch((err) => {
          console.error("Failed to fetch invoices", err);
          setInvoices([]);
        });
    } else {
      setInvoices([]);
    }
  }, [activeTenant, setValue]);

  const onSubmit = async (data: CheckComplianceDto) => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const result = await complianceApi.checkCompliance(data);
      setResponse(result);
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "An error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  // --- Clearance & Reporting Logic ---
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

  useEffect(() => {
    if (activeTenant) {
      setValueSubmit("commonName", activeTenant.slug);
      invoiceApi
        .listInvoices(activeTenant.slug)
        .then((data) => setSubmitInvoices(data))
        .catch((err) => {
          console.error("Failed to fetch invoices for submission", err);
          setSubmitInvoices([]);
        });
    } else {
      setSubmitInvoices([]);
    }
  }, [activeTenant, setValueSubmit]);

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

  return (
    <div className="space-y-12">
      {/* 1. COMPLIANCE CHECK SECTION */}
      <div className="space-y-8">
        <div className="border-l-4 border-blue-600 pl-6">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-2">
            Compliance Verification
          </h1>
          <p className="text-gray-600 lg:text-lg">
            Validate local signatures against ZATCA Phase-2 standards before
            submission.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Main Checker Form */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Run Compliance Check
                </h3>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="hidden">
                  <input {...register("commonName")} />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Invoice to Verify{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        {...register("invoiceSerialNumber", { required: true })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
                      >
                        <option value="">Choose an invoice...</option>
                        {invoices.map((inv) => (
                          <option
                            key={inv.invoiceNumber}
                            value={inv.invoiceNumber}
                          >
                            {inv.invoiceNumber} — {inv.totalAmount.toFixed(2)}{" "}
                            SAR (
                            {new Date(inv.issueDateTime).toLocaleDateString()})
                          </option>
                        ))}
                      </select>
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    {errors.invoiceSerialNumber && (
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
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={loading || invoices.length === 0}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all
                            ${
                              loading || invoices.length === 0
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md"
                            }
                        `}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    {loading ? "Verifying..." : "Verify Compliance"}
                  </button>
                </div>
              </form>
            </div>

            {/* Explainer Cards */}
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

              {!response && !error && (
                <div className="text-center py-10 opacity-50">
                  <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-xs font-medium text-gray-400">
                    Run a check to see results
                  </p>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex gap-3 text-red-700">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold">Verification Failed</h4>
                    <p className="text-xs mt-1 leading-relaxed opacity-90">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {response && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  {/* Main Status Badge */}
                  <div
                    className={`flex flex-col items-center justify-center p-6 rounded-xl border ${
                      response.validationResults?.status === "PASS"
                        ? "bg-green-50 border-green-100 text-green-800"
                        : "bg-amber-50 border-amber-100 text-amber-800"
                    }`}
                  >
                    {response.validationResults?.status === "PASS" ? (
                      <CheckCircle2 className="w-10 h-10 mb-2 text-green-600" />
                    ) : (
                      <AlertOctagon className="w-10 h-10 mb-2 text-amber-600" />
                    )}
                    <h4 className="text-lg font-bold">
                      {response.validationResults?.status === "PASS"
                        ? "Compliance Passed"
                        : "Warnings Found"}
                    </h4>
                  </div>

                  {/* Mini Details */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-500">Status</span>
                      <span className="font-semibold text-gray-900">
                        {response.clearanceStatus || "Passed"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-500">Reporting</span>
                      <span className="font-semibold text-gray-900">
                        {response.reportingStatus || "Success"}
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
                        {response.validationResults?.infoMessages?.length || 0}{" "}
                        Infos
                      </span>
                    </div>
                    <div className="p-4 overflow-auto max-h-[250px] space-y-3">
                      {/* Errors */}
                      {response.validationResults?.errorMessages?.length >
                        0 && (
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold text-red-500 uppercase">
                            Errors
                          </p>
                          {response.validationResults.errorMessages.map(
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
                      {response.validationResults?.warningMessages?.length >
                        0 && (
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold text-amber-500 uppercase">
                            Warnings
                          </p>
                          {response.validationResults.warningMessages.map(
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
                              response.validationResults?.qrSellerStatus,
                            qrBuyertatus:
                              response.validationResults?.qrBuyertatus,
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
      </div>

      <div className="w-full h-px bg-gray-200" />

      {/* 2. ZATCA SUBMISSION SECTION */}
      <div className="space-y-8">
        <div className="border-l-4 border-purple-600 pl-6">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-2">
            Clearance & Reporting
          </h1>
          <p className="text-gray-600 lg:text-lg">
            Submit approved invoices securely to the ZATCA production/simulation
            environment.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Main Submission Form */}
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

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Invoice for Submission{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        {...registerSubmit("invoiceSerialNumber", {
                          required: true,
                        })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-purple-600 transition-colors"
                      >
                        <option value="">Choose an invoice...</option>
                        {submitInvoices.map((inv) => (
                          <option
                            key={inv.invoiceNumber}
                            value={inv.invoiceNumber}
                          >
                            {inv.invoiceNumber} — {inv.totalAmount.toFixed(2)}{" "}
                            SAR
                          </option>
                        ))}
                      </select>
                      <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    {errorsSubmit.invoiceSerialNumber && (
                      <p className="text-xs text-red-500 mt-1">
                        Required field.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={submitLoading || submitInvoices.length === 0}
                    className={`flex items-center gap-2 px-8 py-3 rounded-lg text-sm font-bold text-white transition-all
                                    ${
                                      submitLoading ||
                                      submitInvoices.length === 0
                                        ? "bg-gray-300 cursor-not-allowed"
                                        : "bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg"
                                    }
                                `}
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
                                }
                            `}
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
                        {submitResponse.validationResults?.infoMessages
                          ?.length || 0}{" "}
                        Infos
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
