"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTenant } from "@/context/TenantContext";

export default function Nav() {
  const pathname = usePathname();
  const { userRole } = useTenant();

  if (!userRole) return null;

  const navItems = [
    { href: "/onboarding", label: "Onboarding", roles: ["ADMIN"] },
    { href: "/invoices-list", label: "Invoices", roles: ["HOTEL"] },
    { href: "/compliance", label: "Compliance Check", roles: ["HOTEL"] },
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <nav className="hidden md:flex items-center justify-center flex-1 mx-8 gap-2">
      {visibleItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
              isActive
                ? "text-blue-600 bg-blue-50 shadow-sm"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
