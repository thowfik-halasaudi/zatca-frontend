import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 lg:pt-32 lg:pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold mb-8 border border-blue-100">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            ZATCA Phase-2 Certified Platform
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            E-Invoicing Compliance <br />
            <span className="text-blue-600">Made Simple</span>
          </h1>

          <p className="max-w-2xl mx-auto text-gray-600 text-lg mb-10 leading-relaxed">
            The ultimate platform for hotel onboarding, compliance certificates,
            and enterprise e-invoice generation with ZATCA Phase-2 readiness.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              Start Onboarding
            </Link>
            <Link
              href="/invoices"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              Create Invoice
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-20 lg:mt-32">
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          <Card
            title="Hotel Onboarding"
            desc="Register properties, generate cryptographic keys, and issue CSIDs through automated workflows."
            href="/onboarding"
          />

          <Card
            title="Invoice Management"
            desc="Generate, sign, and store ZATCA-compliant e-invoices with automatic VAT calculations."
            href="/invoices"
          />

          <Card
            title="Compliance Check"
            desc="Validate invoices against ZATCA standards to ensure complete compliance."
            href="/compliance"
          />
        </div>
      </section>

      {/* How ZATCA Works - Step by Step */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-20 lg:mt-32">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How ZATCA E-Invoicing <span className="text-blue-600">Works</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Understanding the complete ZATCA Phase-2 compliance workflow
            </p>
          </div>

          <div className="bg-white shadow-sm rounded-xl p-8 lg:p-10 border border-gray-200">
            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex gap-6">
                <div className="shrink-0">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                    1
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Property Onboarding & CSR Generation
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">
                    Register your hotel property with ZATCA by providing
                    organization details (VAT number, legal name, address). The
                    platform automatically generates a Certificate Signing
                    Request (CSR) containing your cryptographic identity.
                  </p>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
                    <strong>Technical:</strong> CSR includes Common Name (CN),
                    Organization (O), Organization Unit (OU), and Location
                    Address. This creates your unique EGS (E-Invoice Generation
                    Solution) identity.
                  </div>
                </div>
              </div>

              {/* Connector Line */}
              <div className="flex gap-6">
                <div className="shrink-0 flex justify-center w-12">
                  <div className="w-0.5 h-8 bg-gray-200"></div>
                </div>
                <div></div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-6">
                <div className="shrink-0">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                    2
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    CSID Certificate Issuance
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">
                    Submit your CSR to ZATCA's Fatoora Portal along with a
                    One-Time Password (OTP). ZATCA validates your credentials
                    and issues a Compliance Certificate (CSID) - a digital
                    certificate that authorizes you to generate e-invoices.
                  </p>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
                    <strong>Technical:</strong> CSID is an X.509 certificate
                    signed by ZATCA's Certificate Authority. It contains your
                    public key and is valid for a specific period. Store the
                    private key securely - it's used to sign invoices.
                  </div>
                </div>
              </div>

              {/* Connector Line */}
              <div className="flex gap-6">
                <div className="shrink-0 flex justify-center w-12">
                  <div className="w-0.5 h-8 bg-gray-200"></div>
                </div>
                <div></div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-6">
                <div className="shrink-0">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                    3
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Invoice Creation & UBL 2.1 Formatting
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">
                    Create your invoice with all required fields (supplier info,
                    customer details, line items, VAT calculations). The
                    platform automatically formats it according to UBL 2.1
                    (Universal Business Language) standard - ZATCA's required
                    XML schema.
                  </p>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
                    <strong>Technical:</strong> UBL 2.1 is an OASIS standard.
                    Each invoice must include Invoice ID, Issue Date/Time, Tax
                    Category codes, VAT breakdown, and cryptographic hash of
                    previous invoice (chain validation).
                  </div>
                </div>
              </div>

              {/* Connector Line */}
              <div className="flex gap-6">
                <div className="shrink-0 flex justify-center w-12">
                  <div className="w-0.5 h-8 bg-gray-200"></div>
                </div>
                <div></div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-6">
                <div className="shrink-0">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                    4
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    XAdES-EPES Digital Signature
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">
                    Sign the invoice using your CSID private key with XAdES-EPES
                    (XML Advanced Electronic Signatures - Explicit Policy
                    Electronic Signature) standard. This creates a tamper-proof,
                    legally binding signature that proves invoice authenticity
                    and integrity.
                  </p>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
                    <strong>Technical:</strong> XAdES-EPES embeds the signature
                    in the XML, includes timestamp, certificate chain, and
                    policy references. The signature covers the entire invoice
                    content, making any modification detectable.
                  </div>
                </div>
              </div>

              {/* Connector Line */}
              <div className="flex gap-6">
                <div className="shrink-0 flex justify-center w-12">
                  <div className="w-0.5 h-8 bg-gray-200"></div>
                </div>
                <div></div>
              </div>

              {/* Step 5 */}
              <div className="flex gap-6">
                <div className="shrink-0">
                  <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                    5
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    ZATCA Reporting & Clearance
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">
                    Submit the signed invoice to ZATCA's reporting API. ZATCA
                    validates the signature, checks compliance, and either
                    clears it (for simplified invoices) or provides a QR code
                    and UUID for clearance (for standard invoices). The invoice
                    is stored in ZATCA's database.
                  </p>
                  <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-xs text-green-700">
                    <strong>Technical:</strong> ZATCA performs cryptographic
                    validation, schema validation, business rule checks, and
                    certificate chain verification. Response includes UUID, QR
                    code (Base64), and clearance status.
                  </div>
                </div>
              </div>

              {/* Connector Line */}
              <div className="flex gap-6">
                <div className="shrink-0 flex justify-center w-12">
                  <div className="w-0.5 h-8 bg-gray-200"></div>
                </div>
                <div></div>
              </div>

              {/* Step 6 */}
              <div className="flex gap-6">
                <div className="shrink-0">
                  <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                    6
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Invoice Delivery & Compliance Verification
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">
                    Deliver the signed invoice (with QR code if applicable) to
                    your customer. Both parties can verify compliance by
                    checking the signature against ZATCA's validation API using
                    the invoice serial number and common name.
                  </p>
                  <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-xs text-green-700">
                    <strong>Technical:</strong> QR code contains invoice hash,
                    seller name, VAT number, timestamp, and total. Customers can
                    scan it to verify authenticity. The compliance check API
                    validates signature integrity and certificate validity.
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Box */}
            <div className="mt-10 pt-8 border-t border-gray-200">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Key Compliance Requirements
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>
                      <strong>Invoice Chain:</strong> Each invoice must
                      reference the hash of the previous invoice (except the
                      first one)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>
                      <strong>Real-time Reporting:</strong> Invoices must be
                      reported to ZATCA within 24 hours of issuance
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>
                      <strong>Signature Validity:</strong> CSID certificates
                      expire and must be renewed before expiration
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>
                      <strong>VAT Compliance:</strong> All VAT calculations must
                      match ZATCA's tax rules (15% standard rate)
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities + CTA */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-20 lg:mt-32 mb-24 lg:mb-32">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
          {/* Capabilities */}
          <div className="bg-white shadow-sm rounded-xl p-8 lg:p-10 border border-gray-200">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">
              Platform <span className="text-blue-600">Capabilities</span>
            </h2>

            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <span className="font-semibold text-gray-900 block mb-1">
                    Automated CSR Generation
                  </span>
                  <span className="text-sm text-gray-600">
                    Generate cryptographic keys and certificates inside the
                    platform.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <span className="font-semibold text-gray-900 block mb-1">
                    Dynamic Invoice Builder
                  </span>
                  <span className="text-sm text-gray-600">
                    Create complex invoices with nested taxes and VAT
                    automation.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <span className="font-semibold text-gray-900 block mb-1">
                    Cloud-Ready Compliance
                  </span>
                  <span className="text-sm text-gray-600">
                    Integrated with ZATCA Phase-2 APIs for reporting and
                    clearance.
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="bg-gray-900 text-white rounded-xl p-8 lg:p-10 shadow-lg">
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-sm text-gray-300 mb-8 leading-relaxed">
              Register your property and start issuing e-invoices in minutes.
            </p>

            <Link
              href="/onboarding"
              className="block w-full py-3 bg-white text-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors text-center focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Begin Onboarding →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Card({
  title,
  desc,
  href,
}: {
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white shadow-sm rounded-xl p-6 lg:p-8 border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all group"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
    </Link>
  );
}
