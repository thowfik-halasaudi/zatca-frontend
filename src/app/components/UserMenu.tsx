"use client";

import { useTenant } from "@/context/TenantContext";
import { useEffect, useState } from "react";

export default function UserMenu() {
  const { userRole, activeTenant, logout } = useTenant();
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const storedLang = localStorage.getItem("lang") || "en";
    setLang(storedLang);
  }, []);

  const toggleLanguage = () => {
    const newLang = lang === "en" ? "ar" : "en";
    setLang(newLang);
    localStorage.setItem("lang", newLang);
    window.location.reload();
  };

  if (!userRole) return null;

  return (
    <div className="flex items-center gap-4">
      {/* Language Switcher */}
      <button
        onClick={toggleLanguage}
        className="px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors uppercase tracking-wider"
      >
        {lang === "en" ? "🇺🇸 EN" : "🇸🇦 AR"}
      </button>

      <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

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
