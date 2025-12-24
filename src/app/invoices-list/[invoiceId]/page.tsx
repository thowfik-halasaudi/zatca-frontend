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
  AlertCircle,
  Hash,
  CheckCircle2,
  XCircle,
  Clock,
  LayoutDashboard,
  Download,
} from "lucide-react";

export default function InvoiceDetailPage() {
  const { invoiceId } = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"user" | "developer">("user");
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

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

  const handleDownloadPDF = async () => {
    if (!invoice) return;

    setDownloadingPDF(true);
    setPdfError(null);

    try {
      const pdfUrl = invoiceApi.getPdfUrl(invoice.invoiceNumber);
      const response = await fetch(pdfUrl);

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `inv-${invoice.invoiceNumber.toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setPdfError(err.message || "Failed to download PDF");
      console.error("PDF download error:", err);
    } finally {
      setDownloadingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-8 h-8 border-2 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Loading details...</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="max-w-xl mx-auto mt-12 p-6 bg-red-50 border border-red-100 rounded-xl text-center space-y-4">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Unable to Load Invoice
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {error || "Invoice not found"}
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    );
  }

  const getInvoiceTypeLabel = (typeCode?: string) => {
    const typeMap: Record<string, string> = {
      "388": "Tax Invoice",
      "381": "Credit Note",
      "383": "Debit Note",
      "386": "Advance Payment",
    };
    return typeMap[typeCode || ""] || "Invoice";
  };

  const getInvoiceCategory = (typeCodeName?: string) => {
    if (typeCodeName?.startsWith("01")) return "Standard (B2B)";
    if (typeCodeName?.startsWith("02")) return "Simplified (B2C)";
    return "Unknown";
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toUpperCase();
    if (s === "REPORTED" || s === "CLEARED")
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-100">
          <CheckCircle2 className="w-3.5 h-3.5" /> {s}
        </span>
      );
    if (s === "FAILED" || s === "REJECTED")
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-medium border border-red-100">
          <XCircle className="w-3.5 h-3.5" /> {s}
        </span>
      );
    if (s === "PENDING")
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-100">
          <Clock className="w-3.5 h-3.5" /> {s}
        </span>
      );
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200">
        {s || "UNKNOWN"}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              Invoice #{invoice.invoiceNumber}
            </h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              Issued on{" "}
              {new Date(invoice.issueDateTime).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* PDF Download Button */}
          <button
            onClick={handleDownloadPDF}
            disabled={downloadingPDF}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:cursor-not-allowed"
          >
            {downloadingPDF ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download PDF
              </>
            )}
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200 self-start md:self-auto">
            <button
              onClick={() => setViewMode("user")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === "user"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <User className="w-4 h-4" /> Standard View
            </button>
            <button
              onClick={() => setViewMode("developer")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === "developer"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Code className="w-4 h-4" /> Technical Data
            </button>
          </div>
        </div>
      </div>

      {/* PDF Error Message */}
      {pdfError && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <strong>PDF Download Failed:</strong> {pdfError}
          </div>
        </div>
      )}

      {viewMode === "user" ? (
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Card */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded border border-blue-100">
                        {getInvoiceTypeLabel(invoice.invoiceTypeCode)}
                      </span>
                      <span className="text-xs font-medium text-gray-600">
                        {getInvoiceCategory(invoice.invoiceTypeCodeName)}
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                      {invoice.totalAmount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}{" "}
                      <span className="text-sm font-normal text-gray-500">
                        SAR
                      </span>
                    </div>
                  </div>
                  <div>{getStatusBadge(invoice.status)}</div>
                </div>
              </div>

              {/* Parties */}
              <div className="grid md:grid-cols-2 gap-8 p-6 border-b border-gray-100 bg-gray-50/50">
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Building className="w-3 h-3" /> Supplier
                  </h3>
                  <div className="text-sm text-gray-900 font-medium">
                    {invoice.sellerName}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    VAT: {invoice.sellerVatNumber}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {invoice.sellerAddress}
                  </div>
                </div>

                <div className="text-left md:text-right">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2 md:justify-end">
                    <User className="w-3 h-3" /> Customer
                  </h3>
                  <div className="text-sm text-gray-900 font-medium">
                    {invoice.buyerName || "Generic Customer"}
                  </div>
                  {invoice.buyerVatNumber && (
                    <div className="text-xs text-gray-500 mt-1">
                      VAT: {invoice.buyerVatNumber}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {invoice.buyerAddress || "No address provided"}
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500">
                      <th className="px-6 py-3 font-medium text-xs uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 font-medium text-xs uppercase tracking-wider text-center">
                        Qty
                      </th>
                      <th className="px-6 py-3 font-medium text-xs uppercase tracking-wider text-right">
                        Price
                      </th>
                      <th className="px-6 py-3 font-medium text-xs uppercase tracking-wider text-right">
                        VAT
                      </th>
                      <th className="px-6 py-3 font-medium text-xs uppercase tracking-wider text-right">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {invoice.items?.map((item: any, idx: number) => (
                      <tr
                        key={idx}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {item.description}
                        </td>
                        <td className="px-6 py-4 text-center text-gray-600">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-600">
                          {item.unitPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-600">
                          {item.vatAmount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                          {item.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-6 py-4"></td>
                      <td className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">
                        Subtotal
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        {invoice.subTotal.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="px-6 pt-0 py-4"></td>
                      <td className="px-6 py-4 pt-0 text-right text-xs font-medium text-gray-500 uppercase">
                        VAT Total
                      </td>
                      <td className="px-6 py-4 pt-0 text-right font-medium text-gray-900">
                        {invoice.vatAmount.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="border-t border-gray-200">
                      <td colSpan={3} className="px-6 py-4"></td>
                      <td className="px-6 py-4 text-right text-xs font-bold text-gray-900 uppercase">
                        Grand Total
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900 text-lg">
                        {invoice.totalAmount.toFixed(2)} SAR
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* QR Code */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col items-center text-center">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 w-full text-left border-b border-gray-100 pb-2">
                ZATCA QR Code
              </h3>

              <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm mb-4">
                {invoice.qrCode ? (
                  <QRCodeCanvas
                    value={invoice.qrCode}
                    size={180}
                    level="M"
                    includeMargin={true}
                  />
                ) : (
                  <div className="w-[180px] h-[180px] bg-gray-50 flex items-center justify-center text-gray-400 text-xs rounded-lg">
                    QR Not Available
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Scan to verify compliance status via ZATCA App
              </p>
            </div>

            {/* Meta Data */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-2">
                Document Details
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Invoice UUID
                  </label>
                  <code className="block bg-gray-50 px-2 py-1.5 rounded text-xs text-gray-700 font-mono break-all border border-gray-100">
                    {invoice.uuid}
                  </code>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Previous Invoice Hash
                  </label>
                  <code className="block bg-gray-50 px-2 py-1.5 rounded text-xs text-gray-700 font-mono break-all border border-gray-100">
                    {invoice.hash?.previousInvoiceHash || "N/A"}
                  </code>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-gray-50">
                  <span className="text-xs text-gray-500">Payment Method</span>
                  <span className="text-xs font-medium text-gray-900">
                    Cash (10)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Developer View */
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                <Code className="w-4 h-4 text-blue-500" /> Technical Payload
                Inspection
              </h3>
            </div>

            <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
              <div className="p-0">
                <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ZATCA Response / Manifest
                </div>
                <pre className="p-6 text-xs text-gray-600 bg-white overflow-auto max-h-[600px] font-mono leading-relaxed">
                  {JSON.stringify(invoice.submission, null, 2)}
                </pre>
              </div>
              <div className="p-0">
                <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Full Invoice Object
                </div>
                <pre className="p-6 text-xs text-gray-600 bg-white overflow-auto max-h-[600px] font-mono leading-relaxed">
                  {JSON.stringify(invoice, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
