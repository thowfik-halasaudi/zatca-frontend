"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { invoiceApi, complianceApi } from "@/lib/api-client";
import type { SignInvoiceDto, EgsListItem } from "@/lib/types";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  ChevronRight,
  Hotel,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  LayoutDashboard,
  Zap,
  ArrowRight,
} from "lucide-react";

// Invoice Line Item Presets
const INVOICE_PRESETS: Record<string, any[]> = {
  "Deluxe Room": [
    {
      lineId: "1",
      type: "Service",
      description: "Deluxe Room – One Night Stay",
      quantity: 1,
      unitCode: "PCE",
      unitPrice: 800.0,
      taxExclusiveAmount: 800.0,
      vatPercent: 15,
      vatAmount: 120.0,
      taxCategory: "S",
    },
    {
      lineId: "2",
      type: "Service",
      description: "Breakfast Buffet",
      quantity: 2,
      unitCode: "PCE",
      unitPrice: 75.0,
      taxExclusiveAmount: 150.0,
      vatPercent: 15,
      vatAmount: 22.5,
      taxCategory: "S",
    },
  ],
  "Executive Room": [
    {
      lineId: "1",
      type: "Service",
      description: "Executive Room – One Night Stay",
      quantity: 1,
      unitCode: "PCE",
      unitPrice: 1000.0,
      taxExclusiveAmount: 1000.0,
      vatPercent: 15,
      vatAmount: 150.0,
      taxCategory: "S",
    },
  ],
};

export default function InvoicesPage() {
  const [loading, setLoading] = useState(false);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [hotels, setHotels] = useState<EgsListItem[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch Hotels On Load
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

  const { register, handleSubmit, watch, control, setValue, reset } =
    useForm<SignInvoiceDto>({
      defaultValues: {
        egs: { production: false, countryCode: "SA", invoiceType: "1100" },
        invoice: {
          currency: "SAR",
          invoiceTypeCode: "388",
          paymentMeansCode: "10",
        },
        supplier: {
          registrationName: "",
          vatNumber: "",
          address: { street: "", city: "", country: "SA" },
        },
        customer: { type: "B2C", name: "" },
        lineItems: [],
      },
    });

  const selectedCommonName = watch("egs.commonName");

  // 2. Fetch Invoices when Hotel changes
  useEffect(() => {
    if (selectedCommonName) {
      const fetchInvoices = async () => {
        setInvoicesLoading(true);
        try {
          const data = await invoiceApi.listInvoices(selectedCommonName);
          setInvoices(data);
        } catch (err) {
          console.error("Failed to fetch invoices", err);
        } finally {
          setInvoicesLoading(false);
        }
      };

      // Also update supplier defaults
      const hotel = hotels.find((h) => h.slug === selectedCommonName);
      if (hotel) {
        setValue("egs.vatNumber", hotel.vatNumber);
        setValue("supplier.vatNumber", hotel.vatNumber);
        setValue("supplier.registrationName", hotel.organizationName);
      }

      fetchInvoices();
    } else {
      setInvoices([]);
    }
  }, [selectedCommonName, hotels, setValue]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems",
  });

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
    return {
      lineExtensionTotal,
      vatTotal,
      taxInclusiveTotal: lineExtensionTotal + vatTotal,
    };
  };

  const totals = calculateTotals();

  const handleSignInvoice = async (data: SignInvoiceDto) => {
    setLoading(true);
    setError(null);

    // Preparation
    if (!data.invoice.invoiceTypeCodeName) {
      data.invoice.invoiceTypeCodeName =
        data.customer?.type === "B2B" ? "0111010" : "0211010";
    }
    data.totals = {
      lineExtensionTotal: totals.lineExtensionTotal,
      taxExclusiveTotal: totals.lineExtensionTotal,
      vatTotal: totals.vatTotal,
      taxInclusiveTotal: totals.taxInclusiveTotal,
      payableAmount: totals.taxInclusiveTotal,
    };
    data.lineItems = data.lineItems.map((item) => ({
      ...item,
      taxExclusiveAmount: item.quantity * item.unitPrice,
      vatAmount: item.quantity * item.unitPrice * (item.vatPercent / 100),
    }));

    try {
      await invoiceApi.sign(data);
      setShowCreateForm(false);
      reset();
      // Refresh list
      const updatedList = await invoiceApi.listInvoices(selectedCommonName);
      setInvoices(updatedList);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Signing failed");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toUpperCase();
    if (s === "REPORTED" || s === "CLEARED")
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-black uppercase border border-green-200 shadow-sm">
          <CheckCircle2 className="w-3 h-3" /> {s}
        </span>
      );
    if (s === "FAILED" || s === "REJECTED")
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-black uppercase border border-red-200 shadow-sm">
          <XCircle className="w-3 h-3" /> {s}
        </span>
      );
    if (s === "PENDING")
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase border border-amber-200 shadow-sm">
          <Clock className="w-3 h-3" /> {s}
        </span>
      );
    return (
      <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-[10px] font-black uppercase border border-gray-200">
        {s || "ISSUE"}
      </span>
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Top Navigation & Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-gray-100">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              ZATCA Dashboard
            </h1>
          </div>
          <p className="text-gray-400 font-medium pl-14 text-sm">
            Management & Reporting Command Center
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
          <div className="pl-4 pr-2 py-2 flex items-center gap-2 border-r border-gray-100">
            <Hotel className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
              Property:
            </span>
          </div>
          <select
            {...register("egs.commonName")}
            className="bg-transparent text-sm font-bold text-gray-900 focus:outline-none pr-8 cursor-pointer min-w-[200px]"
          >
            <option value="">Choose Unit...</option>
            {hotels.map((h, idx) => (
              <option key={h.slug || idx} value={h.slug}>
                {h.organizationName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedCommonName ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center text-center space-y-4 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
          <LayoutDashboard className="w-16 h-16 text-gray-200" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-900">
              No Unit Selected
            </h3>
            <p className="text-sm text-gray-400 max-w-xs">
              Select a hotel property from the dropdown above to manage its
              ZATCA compliance records.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">
                Record Registry
              </h2>
            </div>

            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
            >
              <Plus className="w-4 h-4" />{" "}
              {showCreateForm ? "Cancel Creation" : "Issue New Invoice"}
            </button>
          </div>

          {showCreateForm ? (
            <div className="bg-white border-2 border-blue-600/10 rounded-3xl p-8 shadow-xl animate-in zoom-in-95 duration-300">
              <form
                onSubmit={handleSubmit(handleSignInvoice)}
                className="space-y-8"
              >
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 mb-4">
                      <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-[10px]">
                        1
                      </span>{" "}
                      Header Data
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                          Type
                        </label>
                        <select
                          {...register("invoice.invoiceTypeCode")}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none"
                        >
                          <option value="388">Tax Invoice (388)</option>
                          <option value="381">Credit Note (381)</option>
                          <option value="383">Debit Note (383)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                          Customer Type
                        </label>
                        <select
                          {...register("customer.type")}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none"
                        >
                          <option value="B2C">Individual (B2C)</option>
                          <option value="B2B">Corporate (B2B)</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                        Customer Name
                      </label>
                      <input
                        {...register("customer.name")}
                        placeholder="Guest or Company Name"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 mb-4">
                      <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-[10px]">
                        2
                      </span>{" "}
                      Quick Line Items
                    </h3>
                    <div className="flex gap-2 pb-4 flex-wrap">
                      {Object.keys(INVOICE_PRESETS).map((p, idx) => (
                        <button
                          key={`preset-${p}-${idx}`}
                          type="button"
                          onClick={() => {
                            while (fields.length > 0) remove(0);
                            INVOICE_PRESETS[p].forEach((i: any) => append(i));
                          }}
                          className="px-3 py-1.5 bg-gray-100 text-[10px] font-black text-gray-600 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          {p}
                        </button>
                      ))}
                    </div>

                    <div className="max-h-[250px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                      {fields.map((f, i) => (
                        <div
                          key={f.id}
                          className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4"
                        >
                          <span className="text-[10px] font-black text-gray-300">
                            #0{i + 1}
                          </span>
                          <input
                            {...register(`lineItems.${i}.description`)}
                            className="bg-transparent text-sm font-bold text-gray-900 border-none focus:ring-0 flex-1 min-w-[100px]"
                            placeholder="Item Name"
                          />
                          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shrink-0">
                            <span className="text-[9px] font-black text-gray-400">
                              SAR
                            </span>
                            <input
                              type="number"
                              {...register(`lineItems.${i}.unitPrice`, {
                                valueAsNumber: true,
                              })}
                              className="w-16 bg-transparent text-sm font-black text-right border-none focus:ring-0"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(i)}
                            className="p-1.5 hover:bg-red-50 text-red-400 transition-colors rounded-lg shrink-0"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          append({
                            lineId: String(fields.length + 1),
                            description: "",
                            quantity: 1,
                            unitPrice: 0,
                            vatPercent: 15,
                            taxExclusiveAmount: 0,
                            vatAmount: 0,
                            taxCategory: "S",
                            unitCode: "PCE",
                            type: "Service",
                          })
                        }
                        className="w-full py-3 border-2 border-dashed border-gray-100 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:border-blue-200 hover:text-blue-600 transition-all"
                      >
                        + Add New Entry
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Estimated Total Payable
                    </p>
                    <p className="text-2xl font-black text-gray-900">
                      {totals.taxInclusiveTotal.toFixed(2)}{" "}
                      <span className="text-xs text-gray-400">SAR</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="flex-1 sm:flex-none px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-900"
                    >
                      Discard
                    </button>
                    <button
                      disabled={loading}
                      type="submit"
                      className="flex-1 sm:flex-none px-10 py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4" />
                      )}
                      Sign & Authenticate
                    </button>
                  </div>
                </div>
              </form>
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl flex items-center gap-3">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden min-h-[500px]">
              {invoicesLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
                  <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
                    Synchronizing Records...
                  </p>
                </div>
              ) : invoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-4 p-8">
                  <div className="p-6 bg-gray-50 rounded-3xl">
                    <FileText className="w-12 h-12 text-gray-200" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      No Registry Found
                    </h3>
                    <p className="text-sm text-gray-400">
                      This property has not issued any ZATCA invoices yet.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                          Invoice ID
                        </th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                          Issue Date
                        </th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                          Category
                        </th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                          Amount
                        </th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                          Status
                        </th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50/80">
                      {invoices.map((inv, idx) => (
                        <tr
                          key={inv.id || inv.invoiceNumber || idx}
                          className="group hover:bg-blue-50/20 transition-all cursor-pointer"
                          onClick={() =>
                            (window.location.href = `/invoices-list/${inv.invoiceNumber}`)
                          }
                        >
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-colors shrink-0">
                                <FileText className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                              </div>
                              <span className="text-sm font-black text-gray-900 group-hover:text-blue-600 tracking-tight">
                                {inv.invoiceNumber}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-6 shrink-0">
                            <span className="text-xs font-bold text-gray-500 whitespace-nowrap">
                              {new Date(inv.issueDateTime).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-6 py-6">
                            <span className="text-[9px] font-black px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md uppercase tracking-widest whitespace-nowrap">
                              {inv.invoiceCategory}
                            </span>
                          </td>
                          <td className="px-6 py-6 font-mono">
                            <span className="text-sm font-black text-gray-900">
                              {(inv.totalAmount || 0).toFixed(2)}
                            </span>
                            <span className="text-[10px] text-gray-400 ml-1 font-bold">
                              SAR
                            </span>
                          </td>
                          <td className="px-6 py-6">
                            {getStatusBadge(inv.status)}
                          </td>
                          <td className="px-8 py-6 text-right">
                            <Link
                              href={`/invoices-list/${inv.invoiceNumber}`}
                              className="inline-flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0"
                            >
                              Details <ArrowRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
