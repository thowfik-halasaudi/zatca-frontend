"use client";

import { useTenant } from "@/context/TenantContext";

export default function UserMenu() {
  const { userRole, activeTenant, logout } = useTenant();

  if (!userRole) return null;

  return (
    <div className="flex items-center gap-4">
      <div className="text-right hidden sm:block">
        <p className="text-sm font-bold text-gray-900 leading-none">
          {activeTenant ? activeTenant.slug : "Administrator"}
        </p>
      </div>

      <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

      <button
        onClick={logout}
        className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        Logout
      </button>
    </div>
  );
}
