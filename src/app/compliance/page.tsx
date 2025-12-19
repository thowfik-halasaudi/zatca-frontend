"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { complianceApi } from "@/lib/api-client";
import type { CheckComplianceDto } from "@/lib/types";

export default function CompliancePage() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckComplianceDto>();

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
                    <input
                      {...register("commonName", { required: true })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                      placeholder="Hotel Property Name"
                    />
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
                    <input
                      {...register("invoiceSerialNumber", { required: true })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                      placeholder="INV-2024-XXXX"
                    />
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
                <div className="p-6 bg-green-50 border border-green-100 rounded-xl text-center">
                  <div className="w-12 h-12 bg-green-500 text-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
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
                  <h4 className="text-xs font-semibold text-green-800 uppercase tracking-wide mb-2">
                    Compliant
                  </h4>
                  <p className="text-xs text-green-700">
                    Validation sequence passed
                  </p>
                </div>

                <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
                  <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      Metadata Report
                    </span>
                  </div>
                  <div className="p-4 overflow-auto max-h-[300px]">
                    <pre className="text-xs text-blue-300 font-mono leading-relaxed">
                      {JSON.stringify(response, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
