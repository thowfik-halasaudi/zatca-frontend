"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { invoiceApi, complianceApi } from "@/lib/api-client";
import type {
  SignInvoiceDto,
  EgsListItem,
  ZatcaSubmissionResponse,
} from "@/lib/types";
import { QRCodeCanvas } from "qrcode.react";
import { useState, useEffect } from "react";

/**
 * InvoicesPage
 *
 * This is the primary business interface for the ZATCA microservice.
 * It serves three main purposes:
 * 1. Form Collection: Gathers all UBL-required data (Supplier, Customer, Items).
 * 2. Digital Signing: Synchronously generates the XML hash and embeds the QR Code.
 * 3. ZATCA Submission: Sends the signed XML to the final Clearance/Reporting APIs.
 *
 * Flow: User fills form -> Clicks "Sign" -> Views QR/XML -> Clicks "Submit to ZATCA" -> Receives Status.
 */
export default function InvoicesPage() {
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [submitResponse, setSubmitResponse] =
    useState<ZatcaSubmissionResponse | null>(null);
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
    control,
    setValue,
    formState: { errors },
  } = useForm<SignInvoiceDto>({
    defaultValues: {
      egs: {
        production: false,
        countryCode: "SA",
        invoiceType: "1100",
      },
      invoice: {
        currency: "SAR",
        invoiceTypeCode: "388",
        paymentMeansCode: "10", // Cash
      },
      supplier: {
        registrationName: "Supplier Name LTD",
        vatNumber: "300000000000003",
        address: {
          street: "Main St",
          city: "Riyadh",
          country: "SA",
        },
      },
      lineItems: [],
    },
  });

  const selectedCommonName = watch("egs.commonName");

  useEffect(() => {
    if (selectedCommonName && hotels.length > 0) {
      const hotel = hotels.find((h) => h.slug === selectedCommonName);
      if (hotel) {
        setValue("egs.vatNumber", hotel.vatNumber);
        setValue("supplier.vatNumber", hotel.vatNumber); // Ensure supplier VAT matches EGS
        setValue("supplier.registrationName", hotel.organizationName); // Use the org name from properties
      }
    }
  }, [selectedCommonName, hotels, setValue]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems",
  });
  const lineItems = watch("lineItems");

  const calculateTotals = () => {
    const items = watch("lineItems") || [];

    const lineExtensionTotal = items.reduce(
      (sum, item) =>
        sum + (Number(item.quantity) * Number(item.unitPrice) || 0),
      0
    );

    const vatTotal = items.reduce(
      (sum, item) =>
        sum +
        (Number(item.quantity) *
          Number(item.unitPrice) *
          (Number(item.vatPercent) / 100) || 0),
      0
    );

    const taxInclusiveTotal = lineExtensionTotal + vatTotal;

    return {
      lineExtensionTotal: Number(lineExtensionTotal.toFixed(2)),
      taxExclusiveTotal: Number(lineExtensionTotal.toFixed(2)),
      vatTotal: Number(vatTotal.toFixed(2)),
      taxInclusiveTotal: Number(taxInclusiveTotal.toFixed(2)),
      payableAmount: Number(taxInclusiveTotal.toFixed(2)),
    };
  };

  const invoiceTypeCode = watch("invoice.invoiceTypeCode");

  const onSubmit = async (data: SignInvoiceDto) => {
    setLoading(true);
    setError(null);
    setResponse(null);
    setSubmitResponse(null);

    // Auto-set invoiceTypeCodeName based on selection if not set
    if (!data.invoice.invoiceTypeCodeName) {
      data.invoice.invoiceTypeCodeName =
        data.customer?.type === "B2B" ? "0111010" : "0211010";
    }

    // Ensure numeric fields are correctly calculated before submission
    const currentTotals = calculateTotals();
    data.totals = currentTotals;

    // Ensure line items have calculated amounts for the XML template
    data.lineItems = data.lineItems.map((item) => ({
      ...item,
      taxExclusiveAmount: Number((item.quantity * item.unitPrice).toFixed(2)),
      vatAmount: Number(
        (item.quantity * item.unitPrice * (item.vatPercent / 100)).toFixed(2)
      ),
    }));

    try {
      const result = (await invoiceApi.sign(data)) as any;
      setResponse(result);
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "An error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * handleZatcaSubmission
   *
   * Triggers the final hand-off to ZATCA.
   * This sends the signed XML (stored locally by serial number) to the microservice
   * which then decides to use either Clearance (Standard) or Reporting (Simplified) API.
   */
  const handleZatcaSubmission = async () => {
    if (!response || !selectedCommonName) return;

    setSubmitLoading(true);
    setError(null);

    try {
      const result = await complianceApi.submit({
        commonName: selectedCommonName,
        invoiceSerialNumber: response.fileName.replace("_signed.xml", ""),
        production: false,
      });
      setSubmitResponse(result);
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Submission failed"
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const addLineItem = () => {
    append({
      lineId: String(fields.length + 1),
      type: "Service",
      description: "",
      quantity: 1,
      unitCode: "PCE",
      unitPrice: 0,
      taxExclusiveAmount: 0,
      vatPercent: 15,
      vatAmount: 0,
      taxCategory: "S",
    });
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-8">
      <div className="border-l-4 border-blue-600 pl-6">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-2">
          Invoice Management
        </h1>
        <p className="text-gray-600 text-base lg:text-lg">
          Create and sign ZATCA-compliant enterprise invoices
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Main Form Fields */}
          <div className="lg:col-span-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* EGS Box */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-4 mb-6 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </span>
                  EGS Configuration
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Common Name <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("egs.commonName", { required: true })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
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
                    <input type="hidden" {...register("egs.vatNumber")} />
                    <input type="hidden" {...register("supplier.vatNumber")} />
                  </div>
                </div>
              </div>

              {/* Invoice Box */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-4 mb-6 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </span>
                  Invoice Metadata
                </h3>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg mb-2">
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tight mb-1">
                      Status
                    </p>
                    <p className="text-xs text-blue-800 font-medium">
                      Serial & Counter managed automatically
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Invoice Type
                      </label>
                      <select
                        {...register("invoice.invoiceTypeCode")}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                      >
                        <option value="388">Tax Invoice</option>
                        <option value="381">Credit Note</option>
                        <option value="383">Debit Note</option>
                      </select>
                    </div>
                    {invoiceTypeCode !== "388" && (
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-blue-600">
                          Reference ID <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register("invoice.billingReferenceId", {
                            required: true,
                          })}
                          className="w-full px-4 py-2.5 border border-blue-200 bg-blue-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
                          placeholder="Original Invoice ID"
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                        Issue Date & Time
                      </p>
                      <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-bold uppercase">
                        Automated
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 italic">
                      Captured precisely at the moment of signing
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Supplier Box */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm relative">
                <div className="absolute top-0 right-0 px-3 py-1.5 bg-gray-50 border-l border-b border-gray-200 rounded-bl-lg text-xs font-semibold text-gray-500 uppercase">
                  Supplier
                </div>
                <div className="space-y-4 pt-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Registration Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("supplier.registrationName", {
                        required: true,
                      })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      VAT Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("supplier.vatNumber", { required: true })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Customer Box */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm relative">
                <div className="absolute top-0 right-0 px-3 py-1.5 bg-blue-50 border-l border-b border-blue-200 rounded-bl-lg text-xs font-semibold text-blue-600 uppercase">
                  Customer
                </div>
                <div className="space-y-4 pt-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Type
                    </label>
                    <select
                      {...register("customer.type")}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                    >
                      <option value="B2C">Individual (B2C)</option>
                      <option value="B2B">Company (B2B)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Customer Name / Business Name
                    </label>
                    <input
                      {...register("customer.name")}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                      placeholder="Guest or Company Name"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    3
                  </span>
                  Items & Services
                </h3>
                <button
                  type="button"
                  onClick={addLineItem}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                >
                  + Add New Line
                </button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => {
                  const quantity = watch(`lineItems.${index}.quantity`) || 0;
                  const unitPrice = watch(`lineItems.${index}.unitPrice`) || 0;
                  const grossTotal = quantity * unitPrice;
                  const vatPercent =
                    watch(`lineItems.${index}.vatPercent`) || 0;
                  const vatAmount = grossTotal * (vatPercent / 100);

                  return (
                    <div
                      key={field.id}
                      className="p-5 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide bg-white border border-gray-200 px-3 py-1 rounded-full">
                          Line Item {index + 1}
                        </span>
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="text-xs font-semibold text-red-500 hover:text-red-600 uppercase tracking-wide px-3 py-1 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-12">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Description <span className="text-red-500">*</span>
                          </label>
                          <input
                            {...register(`lineItems.${index}.description`, {
                              required: true,
                            })}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                            placeholder="Ex: Executive King Suite - 2 Nights"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Qty
                          </label>
                          <input
                            type="number"
                            {...register(`lineItems.${index}.quantity`, {
                              valueAsNumber: true,
                            })}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-center font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                          />
                        </div>

                        <div className="md:col-span-3">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Unit Price
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            {...register(`lineItems.${index}.unitPrice`, {
                              valueAsNumber: true,
                            })}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-right focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                          />
                        </div>

                        <div className="md:col-span-3">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Tax Category
                          </label>
                          <select
                            {...register(`lineItems.${index}.taxCategory`)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "E" || val === "Z" || val === "O") {
                                // Set VAT to 0 for non-standard categories
                                // Note: In a real app we'd use setValue from useForm
                              }
                            }}
                          >
                            <option value="S">Standard (15%)</option>
                            <option value="E">Exempt (0%)</option>
                            <option value="Z">Zero Rated (0%)</option>
                            <option value="O">Out of Scope (0%)</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            VAT %
                          </label>
                          <input
                            type="number"
                            {...register(`lineItems.${index}.vatPercent`, {
                              valueAsNumber: true,
                            })}
                            className="w-full px-4 py-2.5 border rounded-lg text-sm text-center font-semibold bg-blue-50 border-blue-100 focus:outline-none"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            VAT Amt
                          </label>
                          <div className="px-4 py-2.5 bg-green-50 border border-green-100 rounded-lg flex items-center justify-end font-semibold text-green-700 text-sm">
                            {vatAmount.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-24 bg-white border border-gray-200 rounded-xl p-6 lg:p-8 shadow-lg">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-4 mb-6">
                Summary & Totals
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 uppercase tracking-wide text-xs font-semibold">
                    Net Amount
                  </span>
                  <span className="text-gray-900 font-semibold tabular-nums">
                    {totals.lineExtensionTotal.toFixed(2)} SAR
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 uppercase tracking-wide text-xs font-semibold">
                    Total VAT
                  </span>
                  <span className="text-green-600 font-semibold tabular-nums">
                    {totals.vatTotal.toFixed(2)} SAR
                  </span>
                </div>
                <div className="border-t border-dashed border-gray-200 pt-4 mt-4">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Grand Total Payable
                    </span>
                    <div className="text-3xl lg:text-4xl font-bold text-blue-600 tracking-tight tabular-nums mb-1">
                      {totals.taxInclusiveTotal.toFixed(2)}
                      <span className="text-sm ml-2 font-semibold text-gray-500 uppercase tracking-normal">
                        SAR
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Encrypting..." : "Sign & Finalize"}
                </button>
              </div>
            </div>

            {/* Response Box */}
            {response && (
              <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-xl">
                <div className="bg-gray-800 px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">
                      Signing Successful
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(response.signedXml);
                      alert("Signed XML copied to clipboard!");
                    }}
                    type="button"
                    className="text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-wider transition-colors"
                  >
                    Copy XML
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {response.qrCode && (
                    <div className="bg-white p-4 rounded-xl flex flex-col items-center justify-center shadow-inner">
                      <QRCodeCanvas
                        value={response.qrCode}
                        size={180}
                        level="M"
                        includeMargin={false}
                      />
                      <p className="mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                        ZATCA Compliant QR Code
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={handleZatcaSubmission}
                      disabled={
                        submitLoading ||
                        submitResponse?.zatcaStatus === "CLEARED" ||
                        submitResponse?.zatcaStatus === "REPORTED"
                      }
                      className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
                    >
                      {submitLoading
                        ? "Submitting..."
                        : submitResponse
                        ? "Resubmit to ZATCA"
                        : "Submit to ZATCA"}
                    </button>

                    {submitResponse && (
                      <div
                        className={`p-4 rounded-lg border ${
                          submitResponse.zatcaStatus === "REJECTED"
                            ? "bg-red-900/20 border-red-800 text-red-200"
                            : "bg-green-900/20 border-green-800 text-green-200"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            {submitResponse.submissionType} Status:
                          </span>
                          <span
                            className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                              submitResponse.zatcaStatus === "REJECTED"
                                ? "bg-red-500 text-white"
                                : "bg-green-500 text-white"
                            }`}
                          >
                            {submitResponse.zatcaStatus}
                          </span>
                        </div>
                        <p className="text-xs opacity-80 leading-relaxed">
                          {submitResponse.message}
                        </p>

                        {submitResponse.validationResults?.warningMessages
                          ?.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <p className="text-[10px] font-bold text-amber-400 uppercase mb-1">
                              Warnings:
                            </p>
                            <ul className="text-[10px] list-disc list-inside space-y-1 opacity-70">
                              {submitResponse.validationResults.warningMessages.map(
                                (msg, i) => (
                                  <li key={i}>{msg.message}</li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                      <p className="text-[10px] text-gray-500 uppercase font-black mb-1">
                        Physical File
                      </p>
                      <p className="text-xs text-blue-400 font-mono font-medium truncate">
                        {response.fileName}
                      </p>
                    </div>

                    <div className="relative">
                      <div className="absolute top-0 right-0 p-2">
                        <span className="text-[10px] font-bold text-gray-600 uppercase">
                          UBL 2.1
                        </span>
                      </div>
                      <pre className="text-[10px] text-blue-300/80 font-mono leading-tight p-4 bg-black/40 rounded-lg border border-gray-800 max-h-[200px] overflow-auto whitespace-pre-wrap break-all shadow-inner">
                        {response.signedXml}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
