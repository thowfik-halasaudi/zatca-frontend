"use client";

import Link from "next/link";
import { useTenant } from "@/context/TenantContext";

export default function NavHeader() {
  const { userRole, activeTenant } = useTenant();

  return (
    <Link
      href={userRole === "HOTEL" ? "/invoices-list" : "/"}
      className="flex items-center gap-3 group shrink-0"
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all ${
          userRole === "ADMIN" ? "bg-gray-900" : "bg-blue-600"
        }`}
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {userRole === "ADMIN" ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          )}
        </svg>
      </div>
      <div className="flex flex-col justify-center">
        <span className="text-xl font-bold text-gray-900 leading-none tracking-tight">
          {activeTenant
            ? activeTenant.organizationName
            : userRole === "ADMIN"
            ? "Admin Portal"
            : "ZATCA System"}
        </span>
        <span
          className={`text-[10px] font-semibold uppercase tracking-wider mt-0.5 ${
            userRole === "ADMIN" ? "text-gray-500" : "text-blue-600"
          }`}
        >
          {activeTenant
            ? "Hala Tech • Phase-2"
            : userRole === "ADMIN"
            ? "Configuration Mode"
            : "Select Identity"}
        </span>
      </div>
    </Link>
  );
}
