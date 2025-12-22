"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { complianceApi } from "@/lib/api-client";
import type { OnboardEgsDto, IssueCsidDto } from "@/lib/types";

export default function OnboardingPage() {
  const [activeTab, setActiveTab] = useState<"onboard" | "issue">("onboard");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register: registerOnboard,
    handleSubmit: handleSubmitOnboard,
    formState: { errors: errorsOnboard },
    reset: resetOnboard,
  } = useForm<OnboardEgsDto>({
    defaultValues: {
      production: false,
      countryName: "SA",
      invoiceType: "1100",
      industryBusinessCategory: "Hotels and Accommodation",
    },
  });

  const {
    register: registerIssue,
    handleSubmit: handleSubmitIssue,
    formState: { errors: errorsIssue },
    reset: resetIssue,
  } = useForm<IssueCsidDto>({
    defaultValues: {
      production: false,
    },
  });

  const onSubmitOnboard = async (data: OnboardEgsDto) => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const result = (await complianceApi.onboard(data)) as any;
      setResponse(result);
      resetOnboard(); // Successful submission clears form data
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "An error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const onSubmitIssue = async (data: IssueCsidDto) => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const result = (await complianceApi.issueCsid(data)) as any;
      setResponse(result);
      resetIssue(); // Successful issuance clears form data
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
      {/* Page Header */}
      <div className="border-l-4 border-blue-600 pl-6">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-2">
          Property Onboarding
        </h1>
        <p className="text-gray-600 text-base lg:text-lg">
          Register your hotel and issue ZATCA compliance certificates
        </p>
      </div>

      {/* Process Explanation */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">
              Understanding the Onboarding Process
            </h3>
            <div className="text-sm text-gray-700 space-y-2">
              <p>
                <strong>Full Onboarding:</strong> This process generates a
                Certificate Signing Request (CSR) containing your organization's
                cryptographic identity. The CSR is then submitted to ZATCA's
                Fatoora Portal along with an OTP to obtain your Compliance
                Certificate (CSID).
              </p>
              <p>
                <strong>Issue CSID Only:</strong> If you already have a CSR and
                OTP from ZATCA's portal, use this flow to complete the
                certificate issuance. This is typically used when you've
                generated the CSR manually or need to re-issue a certificate.
              </p>
              <p className="text-xs text-gray-600 mt-3">
                <strong>Note:</strong> The CSID certificate is required to
                digitally sign invoices. Store your private key securely - it's
                used for all invoice signatures.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("onboard")}
          className={`px-6 py-4 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === "onboard"
              ? "text-blue-600 border-blue-600 bg-blue-50/50"
              : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          Full Onboarding
        </button>
        <button
          onClick={() => setActiveTab("issue")}
          className={`px-6 py-4 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === "issue"
              ? "text-blue-600 border-blue-600 bg-blue-50/50"
              : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          Issue CSID Only
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Form Container */}
        <div className="lg:col-span-8 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 lg:p-8">
            {activeTab === "onboard" ? (
              <form
                onSubmit={handleSubmitOnboard(onSubmitOnboard)}
                className="space-y-8"
              >
                <div className="space-y-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Mandatory Credentials
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Common Name (Hotel Name){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...registerOnboard("commonName", { required: true })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                        placeholder="Grand Hotel Riyadh"
                      />
                      {errorsOnboard.commonName && (
                        <span className="text-xs text-red-500 mt-1 block">
                          Field required
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Serial Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...registerOnboard("serialNumber", { required: true })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                        placeholder="1-TST|2-TST|3-ABCD1234"
                      />
                      {errorsOnboard.serialNumber && (
                        <span className="text-xs text-red-500 mt-1 block">
                          Field required
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Organization Name{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...registerOnboard("organizationName", {
                          required: true,
                        })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                        placeholder="Grand Hotels Group"
                      />
                      {errorsOnboard.organizationName && (
                        <span className="text-xs text-red-500 mt-1 block">
                          Field required
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Organization Unit{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...registerOnboard("organizationUnitName", {
                          required: true,
                        })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                        placeholder="Riyadh Branch"
                      />
                      {errorsOnboard.organizationUnitName && (
                        <span className="text-xs text-red-500 mt-1 block">
                          Field required
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        VAT Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...registerOnboard("organizationIdentifier", {
                          required: true,
                        })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                        placeholder="300000000000003"
                      />
                      {errorsOnboard.organizationIdentifier && (
                        <span className="text-xs text-red-500 mt-1 block">
                          Field required
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...registerOnboard("countryName", { required: true })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-600 focus:outline-none cursor-not-allowed"
                        defaultValue="SA"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Technical Configuration
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Invoice Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...registerOnboard("invoiceType", { required: true })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                      >
                        <option value="1000">1000 - Standard Invoice</option>
                        <option value="1100">1100 - Simplified Invoice</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Industry Category{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...registerOnboard("industryBusinessCategory", {
                          required: true,
                        })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                        placeholder="Hotels and Accommodation"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Legal Location Address{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...registerOnboard("locationAddress", {
                        required: true,
                      })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                      placeholder="King Fahd Road, Riyadh, KSA"
                    />
                  </div>

                  <label className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      {...registerOnboard("production")}
                      className="w-5 h-5 mt-0.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 shrink-0"
                    />
                    <div>
                      <span className="block text-sm font-semibold text-gray-900 mb-1">
                        Enable Production Environment
                      </span>
                      <span className="block text-xs text-gray-600">
                        Use for live ZATCA reporting. Unchecked uses Sandbox.
                      </span>
                    </div>
                  </label>
                </div>

                <div className="pt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading && (
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    )}
                    {loading ? "Processing..." : "Run Onboarding Flow"}
                  </button>
                </div>
              </form>
            ) : (
              <form
                onSubmit={handleSubmitIssue(onSubmitIssue)}
                className="space-y-6"
              >
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Common Name (Hotel Name){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...registerIssue("commonName", { required: true })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                      placeholder="Grand Hotel Riyadh"
                    />
                    {errorsIssue.commonName && (
                      <span className="text-xs text-red-500 mt-1 block">
                        Required
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      One-Time Password (OTP){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...registerIssue("otp", { required: true })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-lg font-mono text-center tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                      placeholder="XXXXXX"
                      maxLength={6}
                    />
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Generated via ZATCA Fatoora Portal
                    </p>
                    {errorsIssue.otp && (
                      <span className="text-xs text-red-500 mt-1 block">
                        Required
                      </span>
                    )}
                  </div>

                  <label className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      {...registerIssue("production")}
                      className="w-5 h-5 mt-0.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 shrink-0"
                    />
                    <div>
                      <span className="block text-sm font-semibold text-gray-900 mb-1">
                        Production Mode
                      </span>
                      <span className="block text-xs text-gray-600">
                        Execute against live production endpoints
                      </span>
                    </div>
                  </label>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-8 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading && (
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    )}
                    {loading
                      ? "Issuing CSID..."
                      : "Generate Compliance Certificate"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Info/Response Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Status Display Area */}
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-4 mb-6">
              Execution Status
            </h3>

            {!error && !response && (
              <div className="flex flex-col items-center py-10 text-center opacity-40">
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
                      strokeWidth={1.5}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-500">
                  Awaiting Operation
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Results will appear here after submission
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-semibold">Error Detected</span>
                </div>
                <p className="text-xs text-red-700 leading-relaxed">{error}</p>
              </div>
            )}

            {response && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-100 rounded-lg flex items-center gap-3 text-green-700">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center shrink-0">
                    <svg
                      className="w-5 h-5"
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
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide">
                      Success
                    </p>
                    <p className="text-xs opacity-80">Process complete</p>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
                  <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      Response Payload
                    </span>
                  </div>
                  <div className="p-4 overflow-auto max-h-[400px]">
                    <pre className="text-xs text-blue-300 font-mono leading-relaxed">
                      {JSON.stringify(response, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-blue-600 p-6 rounded-xl text-white shadow-lg">
            <h4 className="text-lg font-bold mb-3">ZATCA Process Overview</h4>
            <div className="text-sm leading-relaxed text-blue-100 space-y-3">
              <div>
                <strong className="text-white">Step 1 - CSR Generation:</strong>{" "}
                The platform creates a Certificate Signing Request with your
                organization details. This CSR uniquely identifies your EGS
                (E-Invoice Generation Solution).
              </div>
              <div>
                <strong className="text-white">Step 2 - ZATCA Portal:</strong>{" "}
                Submit the CSR to ZATCA's Fatoora Portal along with an OTP.
                ZATCA validates your VAT registration and organization details.
              </div>
              <div>
                <strong className="text-white">Step 3 - CSID Issuance:</strong>{" "}
                Upon validation, ZATCA issues a Compliance Certificate (CSID) -
                a digital certificate that authorizes you to sign invoices.
              </div>
              <div className="pt-3 border-t border-blue-500">
                <strong className="text-white">⚠️ Important:</strong> Onboarding
                is a one-time process per cryptographic unit. Ensure all details
                match your ZATCA portal registration exactly. Store your private
                key securely - it's required for all invoice signatures.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
