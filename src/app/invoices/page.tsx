"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { invoiceApi } from "@/lib/api-client";
import type { SignInvoiceDto } from "@/lib/types";

export default function InvoicesPage() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<SignInvoiceDto>({
    defaultValues: {
      egs: { countryCode: "SA", invoiceType: "1100", production: false },
      invoice: {
        currency: "SAR",
        invoiceTypeCode: "388",
        invoiceTypeCodeName: "0211010",
        invoiceCounterNumber: 1,
      },
      supplier: { address: { country: "SA" } },
      customer: { type: "B2C", address: { country: "SA" } },
      lineItems: [
        {
          lineId: "1",
          type: "Service",
          unitCode: "PCE",
          taxCategory: "S",
          description: "",
          quantity: 1,
          unitPrice: 0,
          taxExclusiveAmount: 0,
          vatPercent: 15,
          vatAmount: 0,
        },
      ],
      totals: {
        lineExtensionTotal: 0,
        taxExclusiveTotal: 0,
        vatTotal: 0,
        taxInclusiveTotal: 0,
        payableAmount: 0,
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems",
  });
  const lineItems = watch("lineItems");

  const calculateTotals = () => {
    const items = lineItems || [];
    const lineExtensionTotal = items.reduce(
      (sum, item) => sum + (Number(item.taxExclusiveAmount) || 0),
      0
    );
    const vatTotal = items.reduce(
      (sum, item) => sum + (Number(item.vatAmount) || 0),
      0
    );
    const taxInclusiveTotal = lineExtensionTotal + vatTotal;

    return {
      lineExtensionTotal,
      taxExclusiveTotal: lineExtensionTotal,
      vatTotal,
      taxInclusiveTotal,
      payableAmount: taxInclusiveTotal,
    };
  };

  const onSubmit = async (data: SignInvoiceDto) => {
    setLoading(true);
    setError(null);
    setResponse(null);
    data.totals = calculateTotals();

    try {
      const result = await invoiceApi.sign(data);
      setResponse(result);
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "An error occurred"
      );
    } finally {
      setLoading(false);
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
                    <input
                      {...register("egs.commonName", { required: true })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                      placeholder="Hotel Property Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      VAT Registration Number{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("egs.vatNumber", { required: true })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                      placeholder="300000000000003"
                    />
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
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Serial Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("invoice.invoiceSerialNumber", {
                        required: true,
                      })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                      placeholder="INV-2024-0001"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Issue Date
                      </label>
                      <input
                        type="date"
                        {...register("invoice.issueDate")}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Issue Time
                      </label>
                      <input
                        type="time"
                        {...register("invoice.issueTime")}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                      />
                    </div>
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
                      Customer Name
                    </label>
                    <input
                      {...register("customer.name")}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
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
                  const vatAmount = grossTotal * 0.15;

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
                            Gross Total
                          </label>
                          <div className="px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-end font-semibold text-gray-700 text-sm">
                            {grossTotal.toFixed(2)}
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            VAT %
                          </label>
                          <input
                            type="number"
                            {...register(`lineItems.${index}.vatPercent`)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-center font-semibold bg-blue-50 border-blue-100 focus:outline-none cursor-not-allowed"
                            readOnly
                            defaultValue={15}
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
                    Total VAT (15%)
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
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">
                    Signing Response
                  </span>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
                <div className="overflow-auto max-h-[300px]">
                  <pre className="text-xs text-blue-300 font-mono leading-relaxed">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
