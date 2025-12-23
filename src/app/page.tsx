"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTenant } from "@/context/TenantContext";
import { complianceApi } from "@/lib/api-client";
import type { EgsListItem } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const { login, userRole } = useTenant();

  // Tab state: 'admin' | 'hotel'
  const [activeTab, setActiveTab] = useState<"admin" | "hotel">("admin");
  const [hotels, setHotels] = useState<EgsListItem[]>([]);
  const [fetchingHotels, setFetchingHotels] = useState(false);
  const [selectedHotelSlug, setSelectedHotelSlug] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (userRole === "ADMIN") router.push("/onboarding");
    if (userRole === "HOTEL") router.push("/invoices-list");
  }, [userRole, router]);

  // Fetch hotels for dropdown
  useEffect(() => {
    const fetchHotels = async () => {
      setFetchingHotels(true);
      try {
        const data = await complianceApi.listEgs();
        setHotels(data);
      } catch (error) {
        console.error("Failed to fetch hotels", error);
      } finally {
        setFetchingHotels(false);
      }
    };
    fetchHotels();
  }, []);

  const handleAdminLogin = () => {
    login("ADMIN");
    router.push("/onboarding");
  };

  const handleHotelLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const hotel = hotels.find((h) => h.slug === selectedHotelSlug);
    if (hotel) {
      login("HOTEL", hotel);
      router.push("/invoices-list"); // Updated to point to Invoices List page
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 p-8 text-center border-b border-gray-100">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-sm text-gray-500 mt-2">
            ZATCA Phase-2 Compliance Platform
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("admin")}
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${
              activeTab === "admin"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            Admin Access
          </button>
          <button
            onClick={() => setActiveTab("hotel")}
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${
              activeTab === "hotel"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            Hotel Login
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {activeTab === "admin" ? (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-6">
                  Log in to manage hotel onboarding and system configuration.
                </p>
                <button
                  onClick={handleAdminLogin}
                  className="w-full py-3 px-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                >
                  Enter Dashboard as Admin
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleHotelLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Select Hotel Property
                </label>
                <div className="relative">
                  <select
                    value={selectedHotelSlug}
                    onChange={(e) => setSelectedHotelSlug(e.target.value)}
                    required
                    disabled={fetchingHotels}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors appearance-none bg-white"
                  >
                    <option value="">Choose a hotel...</option>
                    {hotels.map((hotel) => (
                      <option key={hotel.slug} value={hotel.slug}>
                        {hotel.organizationName}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                {hotels.length === 0 && !fetchingHotels && (
                  <p className="text-xs text-amber-600 mt-2">
                    No active hotels found. Please contact admin.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={!selectedHotelSlug}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Access Hotel Portal
              </button>
            </form>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-8">
        Secure Access • ZATCA Phase-2 Compliant System
      </p>
    </div>
  );
}
