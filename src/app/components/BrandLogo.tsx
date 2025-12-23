import Link from "next/link";

export default function BrandLogo() {
  return (
    <Link href="/" className="flex items-center gap-3 group shrink-0">
      <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      </div>
      <div className="flex flex-col justify-center">
        <span className="text-xl font-bold text-gray-900 leading-none tracking-tight">
          ZATCA
        </span>
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mt-0.5">
          System v2.0
        </span>
      </div>
    </Link>
  );
}
