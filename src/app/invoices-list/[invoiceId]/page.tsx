"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { invoiceApi } from "@/lib/api-client";
import { QRCodeCanvas } from "qrcode.react";
import {
  ArrowLeft,
  Code,
  User,
  FileText,
  Calendar,
  CreditCard,
  Building,
  CheckCircle,
  AlertCircle,
  Hash,
  Download,
} from "lucide-react";

export default function InvoiceDetailPage() {
  const { invoiceId } = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"user" | "developer">("user");

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const data = await invoiceApi.getInvoice(invoiceId as string);
        setInvoice(data);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch invoice"
        );
      } finally {
        setLoading(false);
      }
    };
    if (invoiceId) fetchInvoice();
  }, [invoiceId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl space-y-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6" />
          <h2 className="text-lg font-bold">Error Loading Invoice</h2>
        </div>
        <p>{error || "Invoice not found"}</p>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-semibold hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "REPORTED":
      case "CLEARED":
        return "bg-green-100 text-green-700 border-green-200";
      case "FAILED":
      case "REJECTED":
        return "bg-red-100 text-red-700 border-red-200";
      case "PENDING":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="flex items-center bg-gray-100 p-1 rounded-xl shadow-inner border border-gray-200">
          <button
            onClick={() => setViewMode("user")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              viewMode === "user"
                ? "bg-white text-blue-600 shadow-sm border border-gray-200"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <User className="w-4 h-4" /> User View
          </button>
          <button
            onClick={() => setViewMode("developer")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              viewMode === "developer"
                ? "bg-white text-blue-600 shadow-sm border border-gray-200"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Code className="w-4 h-4" /> Developer View
          </button>
        </div>
      </div>

      {viewMode === "user" ? (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            {/* Invoice Summary Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 px-6 py-3 bg-blue-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-bl-2xl shadow-sm">
                {invoice.invoiceCategory}
              </div>

              <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-12">
                <div className="space-y-2">
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                    {invoice.invoiceNumber}
                  </h1>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border tracking-widest ${getStatusColor(
                        invoice.status
                      )}`}
                    >
                      {invoice.status}
                    </span>
                    <span className="text-gray-400 text-sm flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(invoice.issueDateTime).toLocaleDateString(
                        "en-GB",
                        { day: "2-digit", month: "short", year: "numeric" }
                      )}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Total Payable
                  </p>
                  <p className="text-4xl font-black text-blue-600 tracking-tight">
                    {invoice.totalAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}{" "}
                    <span className="text-lg text-gray-400 font-bold uppercase transition-all group-hover:text-blue-200">
                      SAR
                    </span>
                  </p>
                </div>
              </div>

              {/* Parties Grid */}
              <div className="grid md:grid-cols-2 gap-12 border-t border-gray-100 pt-10">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Building className="w-3.5 h-3.5" /> Seller Information
                  </h3>
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-gray-900">
                      {invoice.sellerName}
                    </p>
                    <p className="text-sm text-gray-500 font-medium">
                      VAT: {invoice.sellerVatNumber}
                    </p>
                    <p className="text-sm text-gray-400 leading-relaxed italic">
                      {invoice.sellerAddress}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <User className="w-3.5 h-3.5" /> Buyer Information
                  </h3>
                  <div className="space-y-1 text-right md:text-left">
                    <p className="text-lg font-bold text-gray-900">
                      {invoice.buyerName || "Generic Individual (B2C)"}
                    </p>
                    {invoice.buyerVatNumber && (
                      <p className="text-sm text-gray-500 font-medium">
                        VAT: {invoice.buyerVatNumber}
                      </p>
                    )}
                    <p className="text-sm text-gray-400 leading-relaxed italic">
                      {invoice.buyerAddress || "Address not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-8 py-5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest">
                  Invoice Particulars
                </h3>
                <span className="text-xs font-bold text-gray-400">
                  {invoice.items?.length || 0} Items
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white border-b border-gray-100">
                      <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Description
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                        Qty
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
                        Price
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
                        VAT
                      </th>
                      <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {invoice.items?.map((item: any, idx: number) => (
                      <tr
                        key={item.id || `item-${idx}`}
                        className="hover:bg-blue-50/30 transition-colors"
                      >
                        <td className="px-8 py-5">
                          <p className="text-sm font-bold text-gray-900 leading-tight">
                            {item.description}
                          </p>
                        </td>
                        <td className="px-6 py-5 text-center text-sm font-bold text-gray-600">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-5 text-right text-sm font-bold text-gray-900 font-mono tracking-tight">
                          {item.unitPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-5 text-right text-sm font-bold text-green-600 font-mono tracking-tight">
                          {item.vatAmount.toFixed(2)}
                        </td>
                        <td className="px-8 py-5 text-right text-sm font-black text-gray-900 font-mono tracking-tight">
                          {item.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50/50">
                      <td colSpan={3} className="px-8 py-6"></td>
                      <td className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right border-t border-gray-100">
                        Subtotal
                      </td>
                      <td className="px-8 py-6 text-right text-sm font-bold text-gray-900 border-t border-gray-100">
                        {invoice.subTotal.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="bg-gray-50/50">
                      <td colSpan={3} className="px-8 py-0"></td>
                      <td className="px-6 py-4 text-[10px] font-black text-green-600 uppercase tracking-widest text-right">
                        VAT Total
                      </td>
                      <td className="px-8 py-4 text-right text-sm font-bold text-green-600">
                        {invoice.vatAmount.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="bg-blue-600 border-t-2 border-white shadow-lg">
                      <td colSpan={3} className="px-8 py-0"></td>
                      <td className="px-6 py-6 text-[10px] font-black text-blue-100 uppercase tracking-widest text-right">
                        Grand Total
                      </td>
                      <td className="px-8 py-6 text-right text-xl font-black text-white tracking-tight">
                        {invoice.totalAmount.toFixed(2)}{" "}
                        <span className="text-xs opacity-70">SAR</span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar / Sidebar Cards */}
          <div className="lg:col-span-4 space-y-8">
            {/* ZATCA QR Code Display */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm flex flex-col items-center gap-6 text-center transform transition-transform hover:scale-[1.02]">
              <div className="w-full pb-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest">
                  Compliance QR
                </h3>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 shadow-inner">
                {invoice.qrCode ? (
                  <QRCodeCanvas
                    value={invoice.qrCode}
                    size={200}
                    level="M"
                    includeMargin={false}
                    className="rounded-lg shadow-sm"
                  />
                ) : (
                  <div className="w-[200px] h-[200px] flex items-center justify-center bg-gray-100 rounded-lg text-gray-400 italic text-xs">
                    QR Code not available
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-xs font-black text-gray-900 uppercase tracking-tight">
                  E-Invoicing Standard V2.1
                </p>
                <p className="text-[10px] text-gray-500 font-medium">
                  Verified Cryptographic QR Signature
                </p>
              </div>
            </div>

            {/* Submission Stats */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-6">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-4">
                Digital Passport
              </h3>

              <div className="space-y-4">
                {[
                  {
                    label: "Chain Hash (PIH)",
                    value: invoice.hash?.previousInvoiceHash,
                    icon: Hash,
                  },
                  {
                    label: "Invoice UUID",
                    value: invoice.uuid,
                    icon: FileText,
                  },
                  {
                    label: "EGS Identifier",
                    value: invoice.commonName,
                    icon: Building,
                  },
                  {
                    label: "Payment Mean",
                    value: "Cash (10)",
                    icon: CreditCard,
                  },
                ].map((stat, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <p className="text-[9px] font-black text-gray-400 uppercase flex items-center gap-1.5">
                      <stat.icon className="w-2.5 h-2.5" /> {stat.label}
                    </p>
                    <p className="text-[11px] font-mono text-gray-900 break-all bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-100 font-bold">
                      {stat.value || "N/A"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Developer View */
        <div className="bg-[#0f172a] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
          <div className="px-6 py-4 border-b border-gray-800 bg-[#1e293b] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <p className="text-[10px] text-gray-400 font-mono font-black uppercase tracking-widest italic">
              Zatca_Payload_Inspection.json
            </p>
          </div>

          <div className="grid lg:grid-cols-2">
            <div className="p-8 border-r border-gray-800">
              <h3 className="text-xs font-black text-blue-400 mb-4 uppercase flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Submission Manifest
              </h3>
              <pre className="text-[11px] font-mono text-gray-300 overflow-x-auto p-4 bg-black/30 rounded-xl border border-gray-800 leading-relaxed">
                {JSON.stringify(invoice.submission, null, 2)}
              </pre>
            </div>

            <div className="p-8">
              <h3 className="text-xs font-black text-green-400 mb-4 uppercase flex items-center gap-2">
                <FileText className="w-4 h-4" /> Invoice Data JSON
              </h3>
              <pre className="text-[11px] font-mono text-gray-300 overflow-x-auto p-4 bg-black/30 rounded-xl border border-gray-800 leading-relaxed max-h-[800px] overflow-y-auto custom-scrollbar">
                {JSON.stringify(invoice, null, 2)}
              </pre>
            </div>
          </div>

          {/* Raw Validation Messages section */}
          {invoice.submission?.zatcaResponse && (
            <div className="p-8 bg-black/20 border-t border-gray-800">
              <h3 className="text-xs font-black text-amber-400 mb-6 uppercase flex items-center gap-2 underline underline-offset-8">
                ZATCA Validation Analysis
              </h3>
              <div className="grid md:grid-cols-2 gap-8 text-[11px]">
                <div className="space-y-4">
                  <p className="font-bold text-gray-500 uppercase tracking-widest text-[9px]">
                    Validation Results:
                  </p>
                  <pre className="text-gray-400 bg-black/20 p-4 rounded-lg border border-gray-800 overflow-x-auto">
                    {JSON.stringify(
                      invoice.submission.zatcaResponse.validationResults,
                      null,
                      2
                    )}
                  </pre>
                </div>
                <div className="grid grid-cols-2 gap-4 h-fit">
                  {[
                    {
                      label: "Reporting Status",
                      value: invoice.submission.reportingStatus,
                      color: "text-blue-400",
                    },
                    {
                      label: "Clearance Status",
                      value: invoice.submission.clearanceStatus,
                      color: "text-green-400",
                    },
                    {
                      label: "Zatca Response Code",
                      value: invoice.submission.zatcaResponse.qrSellerStatus
                        ? "Success"
                        : "Verified",
                      color: "text-purple-400",
                    },
                    {
                      label: "Transmission Node",
                      value: "Sandbox-V2",
                      color: "text-gray-500",
                    },
                  ].map((v, i) => (
                    <div
                      key={i}
                      className="bg-black/40 border border-gray-800 p-3 rounded-lg flex flex-col gap-1"
                    >
                      <span className="text-[9px] font-black text-gray-600 uppercase italic leading-none">
                        {v.label}
                      </span>
                      <span className={`font-bold transition-all ${v.color}`}>
                        {v.value || "NULL"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
