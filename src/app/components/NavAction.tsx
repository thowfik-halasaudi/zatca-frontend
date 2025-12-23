"use client";

import Link from "next/link";
import { useTenant } from "@/context/TenantContext";

export default function NavAction() {
  const { userRole } = useTenant();

  if (userRole !== "HOTEL") return null;

  return (
    <div className="hidden md:block">
      <Link
        href="/invoices"
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        New Invoice
      </Link>
    </div>
  );
}
