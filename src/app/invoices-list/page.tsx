"use client";

import { invoiceApi } from "@/lib/api-client";
import { useState, useEffect } from "react";
import { useTenant } from "@/context/TenantContext";
import { useRouter } from "next/navigation";
import {
  Plus,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  LayoutDashboard,
  ArrowRight,
} from "lucide-react";

export default function InvoicesPage() {
  const router = useRouter();
  const { activeTenant } = useTenant();
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);

  // Fetch Invoices when Tenant is active
  useEffect(() => {
    if (activeTenant) {
      const fetchInvoices = async () => {
        setInvoicesLoading(true);
        try {
          const data = await invoiceApi.listInvoices(activeTenant.slug);
          setInvoices(data);
        } catch (err) {
          console.error("Failed to fetch invoices", err);
        } finally {
          setInvoicesLoading(false);
        }
      };

      fetchInvoices();
    } else {
      setInvoices([]);
    }
  }, [activeTenant]);

  const getStatusBadge = (status: string) => {
    const s = status?.toUpperCase();
    if (s === "REPORTED" || s === "CLEARED")
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-100">
          <CheckCircle2 className="w-3 h-3" /> {s}
        </span>
      );
    if (s === "FAILED" || s === "REJECTED")
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-medium border border-red-100">
          <XCircle className="w-3 h-3" /> {s}
        </span>
      );
    if (s === "PENDING")
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-100">
          <Clock className="w-3 h-3" /> {s}
        </span>
      );
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
        {s || "UNKNOWN"}
      </span>
    );
  };

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="border-l-4 border-blue-600 pl-6">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-2">
            Invoices
          </h1>
          <p className="text-gray-600 text-base lg:text-lg">
            Manage and issue ZATCA-compliant invoices for{" "}
            {activeTenant?.organizationName}
          </p>
        </div>

        {activeTenant && (
          <button
            onClick={() => router.push("/invoices")}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          >
            <Plus className="w-4 h-4" /> Issue New Invoice
          </button>
        )}
      </div>

      {!activeTenant ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
            <LayoutDashboard className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            No Active Tenant
          </h3>
          <p className="text-sm text-gray-500 max-w-sm">
            Please select a hotel property from the dashboard to view and manage
            invoices.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Invoices List */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {invoicesLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
                <p className="text-sm text-gray-500 font-medium">
                  Loading invoices...
                </p>
              </div>
            ) : invoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  No Invoices Found
                </h3>
                <p className="text-sm text-gray-500 max-w-sm mb-6">
                  Get started by issuing your first ZATCA-compliant tax invoice.
                </p>
                <button
                  onClick={() => router.push("/invoices")}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Create Invoice
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Invoice #
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {invoices.map((inv) => (
                      <tr
                        key={inv.invoiceNumber}
                        onClick={() =>
                          router.push(`/invoices-list/${inv.invoiceNumber}`)
                        }
                        className="group hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-gray-900 font-mono">
                            {inv.invoiceNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(inv.issueDateTime).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {inv.invoiceCategory}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900">
                            {(inv.totalAmount || 0).toFixed(2)} SAR
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(inv.status)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-gray-400 group-hover:text-blue-600 transition-colors">
                            <ArrowRight className="w-5 h-5 ml-auto" />
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
      )}
    </div>
  );
}
