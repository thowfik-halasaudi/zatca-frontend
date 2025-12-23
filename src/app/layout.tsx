import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Nav from "./components/Nav";
import BrandLogo from "./components/BrandLogo";
import UserMenu from "./components/UserMenu";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "ZATCA E-Invoicing System",
  description: "Professional ZATCA Phase-2 Compliance Management Platform",
};

import { TenantProvider } from "@/context/TenantContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} font-sans antialiased text-gray-900 bg-gray-50`}
      >
        <TenantProvider>
          <div className="min-h-screen flex flex-col">
            {/* Header */}

            <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm glass-header">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                  {/* Left: Brand */}
                  <div className="w-[200px]">
                    <BrandLogo />
                  </div>

                  {/* Center: Navigation */}
                  <Nav />

                  {/* Right: User Menu */}
                  <div className="w-[200px] flex justify-end">
                    <UserMenu />
                  </div>
                </div>
              </div>
            </header>
            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
              {children}
            </main>
            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-auto">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900 leading-none">
                        Hala Tech
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        © 2024. All rights reserved.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm font-semibold">
                    <a
                      href="#"
                      className="text-gray-500 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded"
                    >
                      Documentation
                    </a>
                    <a
                      href="#"
                      className="text-gray-500 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded"
                    >
                      Support
                    </a>
                    <a
                      href="#"
                      className="text-gray-500 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded"
                    >
                      API Reference
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </TenantProvider>
      </body>
    </html>
  );
}
