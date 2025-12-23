"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { complianceApi, invoiceApi } from "@/lib/api-client";
import type {
  CheckComplianceDto,
  EgsListItem,
  SubmitZatcaDto,
} from "@/lib/types";

export default function CompliancePage() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [hotels, setHotels] = useState<EgsListItem[]>([]);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const data = await complianceApi.listEgs();
        setHotels(data);
      } catch (err) {
        console.error("Failed to fetch hotels", err);
      }
    };
    fetchHotels();
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckComplianceDto>();

  const [invoices, setInvoices] = useState<any[]>([]);
  const selectedCommonName = watch("commonName");

  useEffect(() => {
    if (selectedCommonName) {
      invoiceApi
        .listInvoices(selectedCommonName)
        .then((data) => setInvoices(data))
        .catch((err) => {
          console.error("Failed to fetch invoices", err);
          setInvoices([]);
        });
    } else {
      setInvoices([]);
    }
  }, [selectedCommonName]);

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
    watch: watchSubmit,
    formState: { errors: errorsSubmit },
  } = useForm<SubmitZatcaDto>();

  const selectedSubmitCommonName = watchSubmit("commonName");

  useEffect(() => {
    if (selectedSubmitCommonName) {
      invoiceApi
        .listInvoices(selectedSubmitCommonName)
        .then((data) => setSubmitInvoices(data))
        .catch((err) => {
          console.error("Failed to fetch invoices for submission", err);
          setSubmitInvoices([]);
        });
    } else {
      setSubmitInvoices([]);
    }
  }, [selectedSubmitCommonName]);

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
    <div className="space-y-8 lg:space-y-10">
      <div className="border-l-4 border-blue-600 pl-6">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-2">
          Compliance Verification
        </h1>
        <p className="text-gray-600 text-base lg:text-lg">
          Validate local signatures against ZATCA Phase-2 standards
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Main Checker Area */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6 lg:p-8 shadow-sm">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-6">
                  Verification Details
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Common Name <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("commonName", { required: true })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                    >
                      <option value="">Select a Hotel...</option>
                      {hotels.map((hotel) => (
                        <option key={hotel.slug} value={hotel.slug}>
                          {hotel.organizationName}
                        </option>
                      ))}
                    </select>
                    {hotels.length === 0 && (
                      <p className="text-[10px] text-amber-600 mt-1 font-medium">
                        No onboarded hotels found. Please onboard a property
                        first.
                      </p>
                    )}
                    {errors.commonName && (
                      <span className="text-xs text-red-500 mt-1 block">
                        Required Field
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Invoice Serial Number{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("invoiceSerialNumber", { required: true })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                    >
                      <option value="">Select Invoice...</option>
                      {invoices.length > 0 ? (
                        invoices.map((inv) => (
                          <option
                            key={inv.invoiceNumber}
                            value={inv.invoiceNumber}
                          >
                            {inv.invoiceNumber} (
                            {new Date(inv.issueDateTime).toLocaleDateString()} -{" "}
                            {inv.totalAmount} SAR)
                          </option>
                        ))
                      ) : (
                        <option disabled>No invoices found</option>
                      )}
                    </select>
                    {errors.invoiceSerialNumber && (
                      <span className="text-xs text-red-500 mt-1 block">
                        Required Field
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-start">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Run Compliance Check"}
                </button>
              </div>
            </form>
          </div>

          {/* Validation Checklist */}
          <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
            <div className="bg-green-50 border border-green-100 rounded-xl p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 text-green-600">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
                Structure
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                UBL 2.1 Schema Integrity
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 text-blue-600">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 20c4.478 0 8.268-2.943 9.542-7H21m-9-4v10m0-10l-4 4m4-4l4 4"
                  />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
                Signature
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                XAdES-EPES Verification
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4 text-amber-600">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
                Security
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Certificate Chain Audit
              </p>
            </div>
          </div>
        </div>

        {/* Status/Response Aside */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-4 mb-6">
              Verification Result
            </h3>

            {!error && !response && (
              <div className="flex flex-col items-center py-12 text-center opacity-40">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Ready for Check
                </p>
              </div>
            )}

            {error && (
              <div className="p-6 bg-red-50 border border-red-100 rounded-xl text-center">
                <div className="w-12 h-12 bg-red-500 text-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h4 className="text-xs font-semibold text-red-800 uppercase tracking-wide mb-2">
                  Check Failed
                </h4>
                <p className="text-xs text-red-700 leading-relaxed">{error}</p>
              </div>
            )}

            {response && (
              <div className="space-y-4">
                <div
                  className={`p-6 border rounded-xl text-center ${
                    response.validationResults?.status === "PASS"
                      ? "bg-green-50 border-green-100"
                      : "bg-amber-50 border-amber-100"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md ${
                      response.validationResults?.status === "PASS"
                        ? "bg-green-500"
                        : "bg-amber-500"
                    } text-white`}
                  >
                    {response.validationResults?.status === "PASS" ? (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    )}
                  </div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide mb-1">
                    {response.validationResults?.status === "PASS"
                      ? "Compliant"
                      : "Warnings Found"}
                  </h4>
                  <p className="text-[10px] text-gray-500 font-mono">
                    ID: {response.reportingStatus || "N/A"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1">
                      Clearance
                    </p>
                    <p className="text-xs font-semibold text-gray-700">
                      {response.clearanceStatus || "Passed"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1">
                      Reporting
                    </p>
                    <p className="text-xs font-semibold text-gray-700">
                      {response.reportingStatus || "Success"}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
                  <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      Validation Report
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-blue-900/40 text-blue-400 rounded-full font-bold">
                      {response.validationResults?.infoMessages?.length || 0}{" "}
                      Infos
                    </span>
                  </div>
                  <div className="p-4 overflow-auto max-h-[300px]">
                    <div className="space-y-4">
                      {response.validationResults?.errorMessages?.length >
                        0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-red-400 uppercase">
                            Errors
                          </p>
                          {response.validationResults.errorMessages.map(
                            (msg: any, i: number) => (
                              <div
                                key={i}
                                className="text-[10px] text-red-300 font-mono bg-red-950/30 p-2 rounded border border-red-900/30"
                              >
                                [{msg.code}] {msg.message}
                              </div>
                            )
                          )}
                        </div>
                      )}
                      <pre className="text-[10px] text-blue-300 font-mono leading-relaxed">
                        {JSON.stringify(response, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Clearance & Reporting Section --- */}
      <div className="border-t border-gray-200 pt-10">
        <div className="border-l-4 border-purple-600 pl-6 mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-2">
            Clearance & Reporting
          </h1>
          <p className="text-gray-600 text-base lg:text-lg">
            Submit final signed invoices to ZATCA (Clearance or Reporting)
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Main Submission Area */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white border border-gray-200 rounded-xl p-6 lg:p-8 shadow-sm">
              <form
                onSubmit={handleSubmitSubmit(onSubmissionSubmit)}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-6">
                    Submission Details
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Common Name <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...registerSubmit("commonName", { required: true })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-colors"
                      >
                        <option value="">Select a Hotel...</option>
                        {hotels.map((hotel) => (
                          <option key={hotel.slug} value={hotel.slug}>
                            {hotel.organizationName}
                          </option>
                        ))}
                      </select>
                      {errorsSubmit.commonName && (
                        <span className="text-xs text-red-500 mt-1 block">
                          Required Field
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Invoice Serial Number{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...registerSubmit("invoiceSerialNumber", {
                          required: true,
                        })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-colors"
                      >
                        <option value="">Select Invoice...</option>
                        {submitInvoices.length > 0 ? (
                          submitInvoices.map((inv) => (
                            <option
                              key={inv.invoiceNumber}
                              value={inv.invoiceNumber}
                            >
                              {inv.invoiceNumber} (
                              {new Date(inv.issueDateTime).toLocaleDateString()}{" "}
                              - {inv.totalAmount} SAR)
                            </option>
                          ))
                        ) : (
                          <option disabled>No invoices found</option>
                        )}
                      </select>
                      {errorsSubmit.invoiceSerialNumber && (
                        <span className="text-xs text-red-500 mt-1 block">
                          Required Field
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-start">
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="px-8 py-3 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitLoading ? "Submitting..." : "Submit to ZATCA"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Submission Result Aside */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-4 mb-6">
                Submission Result
              </h3>

              {!submitError && !submitResponse && (
                <div className="flex flex-col items-center py-12 text-center opacity-40">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Ready to Submit
                  </p>
                </div>
              )}

              {submitError && (
                <div className="p-6 bg-red-50 border border-red-100 rounded-xl text-center">
                  <div className="w-12 h-12 bg-red-500 text-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <h4 className="text-xs font-semibold text-red-800 uppercase tracking-wide mb-2">
                    Submission Failed
                  </h4>
                  <p className="text-xs text-red-700 leading-relaxed">
                    {submitError}
                  </p>
                </div>
              )}

              {submitResponse && (
                <div className="space-y-4">
                  <div
                    className={`p-6 border rounded-xl text-center ${
                      ["CLEARED", "REPORTED"].includes(
                        submitResponse.zatcaStatus
                      )
                        ? "bg-green-50 border-green-100"
                        : "bg-amber-50 border-amber-100"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md ${
                        ["CLEARED", "REPORTED"].includes(
                          submitResponse.zatcaStatus
                        )
                          ? "bg-green-500"
                          : "bg-amber-500"
                      } text-white`}
                    >
                      {["CLEARED", "REPORTED"].includes(
                        submitResponse.zatcaStatus
                      ) ? (
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                      )}
                    </div>
                    <h4 className="text-xs font-semibold uppercase tracking-wide mb-1">
                      {submitResponse.zatcaStatus}
                    </h4>
                    <p className="text-[10px] text-gray-500 font-mono">
                      {submitResponse.submissionType}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1">
                        Cleared Invoice
                      </p>
                      <p className="text-xs font-semibold text-gray-700 truncate">
                        {submitResponse.clearedInvoice
                          ? "Received"
                          : "Not Applicable"}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1">
                        Reporting
                      </p>
                      <p className="text-xs font-semibold text-gray-700">
                        {submitResponse.reportingStatus || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
                    <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Validation Log
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-purple-900/40 text-purple-400 rounded-full font-bold">
                        {submitResponse.validationResults?.infoMessages
                          ?.length || 0}{" "}
                        Infos
                      </span>
                    </div>
                    <div className="p-4 overflow-auto max-h-[300px]">
                      <div className="space-y-4">
                        {submitResponse.validationResults?.errorMessages
                          ?.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-[10px] font-bold text-red-400 uppercase">
                              Errors
                            </p>
                            {submitResponse.validationResults.errorMessages.map(
                              (msg: any, i: number) => (
                                <div
                                  key={i}
                                  className="text-[10px] text-red-300 font-mono bg-red-950/30 p-2 rounded border border-red-900/30"
                                >
                                  [{msg.code}] {msg.message}
                                </div>
                              )
                            )}
                          </div>
                        )}
                        {submitResponse.validationResults?.warningMessages
                          ?.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-[10px] font-bold text-amber-400 uppercase">
                              Warnings
                            </p>
                            {submitResponse.validationResults.warningMessages.map(
                              (msg: any, i: number) => (
                                <div
                                  key={i}
                                  className="text-[10px] text-amber-300 font-mono bg-amber-950/30 p-2 rounded border border-amber-900/30"
                                >
                                  [{msg.code}] {msg.message}
                                </div>
                              )
                            )}
                          </div>
                        )}
                        <pre className="text-[10px] text-purple-300 font-mono leading-relaxed">
                          {JSON.stringify(submitResponse, null, 2)}
                        </pre>
                      </div>
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
