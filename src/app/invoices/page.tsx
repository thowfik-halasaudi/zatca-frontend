"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { invoiceApi, complianceApi } from "@/lib/api-client";
import { useTenant } from "@/context/TenantContext";
import type {
  SignInvoiceDto,
  EgsListItem,
  ZatcaSubmissionResponse,
} from "@/lib/types";
import { QRCodeCanvas } from "qrcode.react";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Building,
  User,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Save,
  Send,
  Loader2,
  Lock,
} from "lucide-react";

// Invoice Line Item Presets
const INVOICE_PRESETS: Record<string, any[]> = {
  "Deluxe Room": [
    {
      lineId: "1",
      type: "Service",
      description: "Deluxe Room – One Night Stay",
      quantity: 1,
      unitCode: "PCE",
      unitPrice: 800.0,
      taxExclusiveAmount: 800.0,
      vatPercent: 15,
      vatAmount: 120.0,
      taxCategory: "S",
    },
    {
      lineId: "2",
      type: "Service",
      description: "Breakfast Buffet",
      quantity: 2,
      unitCode: "PCE",
      unitPrice: 75.0,
      taxExclusiveAmount: 150.0,
      vatPercent: 15,
      vatAmount: 22.5,
      taxCategory: "S",
    },
    {
      lineId: "3",
      type: "Service",
      description: "Airport Pickup Service",
      quantity: 1,
      unitCode: "PCE",
      unitPrice: 120.0,
      taxExclusiveAmount: 120.0,
      vatPercent: 15,
      vatAmount: 18.0,
      taxCategory: "S",
    },
    {
      lineId: "4",
      type: "Service",
      description: "Laundry Service",
      quantity: 1,
      unitCode: "PCE",
      unitPrice: 60.0,
      taxExclusiveAmount: 60.0,
      vatPercent: 15,
      vatAmount: 9.0,
      taxCategory: "S",
    },
  ],
  "Executive Room": [
    {
      lineId: "1",
      type: "Service",
      description: "Executive Room – One Night Stay",
      quantity: 1,
      unitCode: "PCE",
      unitPrice: 1000.0,
      taxExclusiveAmount: 1000.0,
      vatPercent: 15,
      vatAmount: 150.0,
      taxCategory: "S",
    },
    {
      lineId: "2",
      type: "Service",
      description: "Executive Lounge Access",
      quantity: 1,
      unitCode: "PCE",
      unitPrice: 200.0,
      taxExclusiveAmount: 200.0,
      vatPercent: 15,
      vatAmount: 30.0,
      taxCategory: "S",
    },
    {
      lineId: "3",
      type: "Service",
      description: "Breakfast Buffet",
      quantity: 2,
      unitCode: "PCE",
      unitPrice: 90.0,
      taxExclusiveAmount: 180.0,
      vatPercent: 15,
      vatAmount: 27.0,
      taxCategory: "S",
    },
    {
      lineId: "4",
      type: "Service",
      description: "Laundry Service",
      quantity: 1,
      unitCode: "PCE",
      unitPrice: 80.0,
      taxExclusiveAmount: 80.0,
      vatPercent: 15,
      vatAmount: 12.0,
      taxCategory: "S",
    },
  ],
  "Suite Room": [
    {
      lineId: "1",
      type: "Service",
      description: "Suite Room – One Night Stay",
      quantity: 1,
      unitCode: "PCE",
      unitPrice: 1500.0,
      taxExclusiveAmount: 1500.0,
      vatPercent: 15,
      vatAmount: 225.0,
      taxCategory: "S",
    },
    {
      lineId: "2",
      type: "Service",
      description: "In-Room Dining",
      quantity: 1,
      unitCode: "PCE",
      unitPrice: 250.0,
      taxExclusiveAmount: 250.0,
      vatPercent: 15,
      vatAmount: 37.5,
      taxCategory: "S",
    },
    {
      lineId: "3",
      type: "Service",
      description: "Spa Access",
      quantity: 1,
      unitCode: "PCE",
      unitPrice: 300.0,
      taxExclusiveAmount: 300.0,
      vatPercent: 15,
      vatAmount: 45.0,
      taxCategory: "S",
    },
    {
      lineId: "4",
      type: "Service",
      description: "Airport Pickup Service",
      quantity: 1,
      unitCode: "PCE",
      unitPrice: 150.0,
      taxExclusiveAmount: 150.0,
      vatPercent: 15,
      vatAmount: 22.5,
      taxCategory: "S",
    },
  ],
  "Family Room": [
    {
      lineId: "1",
      type: "Service",
      description: "Family Room – One Night Stay",
      quantity: 1,
      unitCode: "PCE",
      unitPrice: 1200.0,
      taxExclusiveAmount: 1200.0,
      vatPercent: 15,
      vatAmount: 180.0,
      taxCategory: "S",
    },
    {
      lineId: "2",
      type: "Service",
      description: "Extra Bed",
      quantity: 1,
      unitCode: "PCE",
      unitPrice: 150.0,
      taxExclusiveAmount: 150.0,
      vatPercent: 15,
      vatAmount: 22.5,
      taxCategory: "S",
    },
    {
      lineId: "3",
      type: "Service",
      description: "Breakfast Buffet",
      quantity: 4,
      unitCode: "PCE",
      unitPrice: 70.0,
      taxExclusiveAmount: 280.0,
      vatPercent: 15,
      vatAmount: 42.0,
      taxCategory: "S",
    },
    {
      lineId: "4",
      type: "Service",
      description: "Kids Play Area Access",
      quantity: 1,
      unitCode: "PCE",
      unitPrice: 50.0,
      taxExclusiveAmount: 50.0,
      vatPercent: 15,
      vatAmount: 7.5,
      taxCategory: "S",
    },
  ],
};

export default function InvoicesPage() {
  const { activeTenant } = useTenant();
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [submitResponse, setSubmitResponse] =
    useState<ZatcaSubmissionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hotels, setHotels] = useState<EgsListItem[]>([]);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const data = await complianceApi.listEgs();
        setHotels(data);
      } catch (err) {
        console.error("Failed to fetch hotels", err);
      }
    };
    fetchHotels();
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<SignInvoiceDto>({
    defaultValues: {
      egs: {
        production: false,
        countryCode: "SA",
        invoiceType: "1100",
      },
      invoice: {
        currency: "SAR",
        invoiceTypeCode: "388",
        paymentMeansCode: "10", // Cash
      },
      supplier: {
        registrationName: "",
        vatNumber: "",
        address: {
          street: "Main St",
          city: "Riyadh",
          country: "SA",
        },
      },
      customer: { type: "B2C", name: "" },
      lineItems: [
        {
          lineId: "1",
          type: "Service",
          description: "Deluxe Room – One Night Stay",
          quantity: 1,
          unitCode: "PCE",
          unitPrice: 800.0,
          taxExclusiveAmount: 800.0,
          vatPercent: 15,
          vatAmount: 120.0,
          taxCategory: "S",
        },
      ],
    },
  });

  // Pre-fill form if activeTenant is set
  useEffect(() => {
    if (activeTenant) {
      setValue("egs.commonName", activeTenant.slug);
      setValue("egs.vatNumber", activeTenant.vatNumber);
      setValue("supplier.registrationName", activeTenant.organizationName);
      setValue("supplier.vatNumber", activeTenant.vatNumber);
    }
  }, [activeTenant, setValue]);

  const selectedCommonName = watch("egs.commonName");

  useEffect(() => {
    if (selectedCommonName && hotels.length > 0) {
      const hotel = hotels.find((h) => h.slug === selectedCommonName);
      if (hotel) {
        setValue("egs.vatNumber", hotel.vatNumber);
        setValue("supplier.vatNumber", hotel.vatNumber);
        setValue("supplier.registrationName", hotel.organizationName);
      }
    }
  }, [selectedCommonName, hotels, setValue]);

  const customerType = watch("customer.type");

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "lineItems",
  });
  const lineItems = watch("lineItems");

  const calculateTotals = () => {
    const items = watch("lineItems") || [];
    const lineExtensionTotal = items.reduce(
      (sum, item) =>
        sum + (Number(item.quantity) * Number(item.unitPrice) || 0),
      0
    );
    const vatTotal = items.reduce(
      (sum, item) =>
        sum +
        (Number(item.quantity) *
          Number(item.unitPrice) *
          (Number(item.vatPercent) / 100) || 0),
      0
    );
    const taxInclusiveTotal = lineExtensionTotal + vatTotal;

    return {
      lineExtensionTotal: Number(lineExtensionTotal.toFixed(2)),
      taxExclusiveTotal: Number(lineExtensionTotal.toFixed(2)),
      vatTotal: Number(vatTotal.toFixed(2)),
      taxInclusiveTotal: Number(taxInclusiveTotal.toFixed(2)),
      payableAmount: Number(taxInclusiveTotal.toFixed(2)),
    };
  };

  const invoiceTypeCode = watch("invoice.invoiceTypeCode");

  const onSubmit = async (data: SignInvoiceDto) => {
    setLoading(true);
    setError(null);
    setResponse(null);
    setSubmitResponse(null);

    // Auto-set invoiceTypeCodeName based on selection if not set
    if (!data.invoice.invoiceTypeCodeName) {
      data.invoice.invoiceTypeCodeName =
        data.customer?.type === "B2B" ? "0111010" : "0211010";
    }

    const currentTotals = calculateTotals();
    data.totals = currentTotals;

    // Ensure line items have calculated amounts for the XML template
    data.lineItems = data.lineItems.map((item) => ({
      ...item,
      taxExclusiveAmount: Number((item.quantity * item.unitPrice).toFixed(2)),
      vatAmount: Number(
        (item.quantity * item.unitPrice * (item.vatPercent / 100)).toFixed(2)
      ),
    }));

    try {
      const result = (await invoiceApi.sign(data)) as any;
      setResponse(result);
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "An error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleZatcaSubmission = async () => {
    if (!response || !selectedCommonName) return;

    setSubmitLoading(true);
    setError(null);

    try {
      const result = await complianceApi.submit({
        commonName: selectedCommonName,
        invoiceSerialNumber: response.fileName.replace("_signed.xml", ""),
        production: false,
      });
      setSubmitResponse(result);
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Submission failed"
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const addLineItem = () => {
    append({
      lineId: String(fields.length + 1),
      type: "Service",
      description: "",
      quantity: 1,
      unitCode: "PCE",
      unitPrice: 0,
      taxExclusiveAmount: 0,
      vatPercent: 15,
      vatAmount: 0,
      taxCategory: "S",
    });
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-l-4 border-blue-600 pl-6">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-2">
          Create New Invoice
        </h1>
        <p className="text-gray-600">
          Issue a Standard or Simplified tax invoice for{" "}
          {activeTenant?.organizationName || "your organization"}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Main Form Fields */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Configuration & Metadata */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-6 pb-2 border-b border-gray-100 flex items-center gap-2">
                <Building className="w-4 h-4" /> Invoice Details
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issuing Property (EGS)
                  </label>
                  <div className="relative">
                    <input
                      value={activeTenant?.organizationName || ""}
                      readOnly
                      className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium cursor-not-allowed focus:outline-none"
                    />
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="hidden"
                    {...register("egs.commonName", { required: true })}
                  />
                  <input type="hidden" {...register("egs.vatNumber")} />
                  <input type="hidden" {...register("supplier.vatNumber")} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invoice Type
                    </label>
                    <select
                      {...register("invoice.invoiceTypeCode")}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
                    >
                      <option value="388">Tax Invoice</option>
                      <option value="381">Credit Note</option>
                      <option value="383">Debit Note</option>
                    </select>
                  </div>
                  {invoiceTypeCode !== "388" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ref ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register("invoice.billingReferenceId", {
                          required: true,
                        })}
                        className="w-full px-4 py-2 border border-blue-200 bg-blue-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                        placeholder="Original Inv#"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Parties */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Supplier (Read Only mostly, pre-filled) */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                  Supplier Info
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Registration Name
                    </label>
                    <input
                      {...register("supplier.registrationName", {
                        required: true,
                      })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      VAT Number
                    </label>
                    <input
                      {...register("supplier.vatNumber", { required: true })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 font-mono"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Customer */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2 flex items-center justify-between">
                  Customer Info
                  <div className="flex gap-2 text-[10px] font-medium">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        value="B2C"
                        {...register("customer.type")}
                        className="text-blue-600 focus:ring-blue-500"
                      />{" "}
                      Individual
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        value="B2B"
                        {...register("customer.type")}
                        className="text-blue-600 focus:ring-blue-500"
                      />{" "}
                      Business
                    </label>
                  </div>
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      {customerType === "B2B"
                        ? "Company Legal Name"
                        : "Customer Name"}
                    </label>
                    <input
                      {...register("customer.name", { required: true })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder={
                        customerType === "B2B"
                          ? "Official Registered Name"
                          : "Guest Name"
                      }
                    />
                  </div>

                  {customerType === "B2B" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          VAT Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register("customer.vatNumber", {
                            required: true,
                            minLength: 15,
                            maxLength: 15,
                          })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
                          placeholder="300..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Street Address{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            {...register("customer.address.street", {
                              required: true,
                            })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                            placeholder="Building No, Street Name"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            City <span className="text-red-500">*</span>
                          </label>
                          <input
                            {...register("customer.address.city", {
                              required: true,
                            })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                            placeholder="Riyadh"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Postal Code <span className="text-red-500">*</span>
                          </label>
                          <input
                            {...register("customer.address.postalCode", {
                              required: true,
                            })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                            placeholder="12345"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Line Items */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Line Items
                </h3>

                <div className="flex gap-2">
                  {Object.keys(INVOICE_PRESETS).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => replace(INVOICE_PRESETS[p])}
                      className="px-2 py-1 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                    >
                      + {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => {
                  const quantity = watch(`lineItems.${index}.quantity`) || 0;
                  const unitPrice = watch(`lineItems.${index}.unitPrice`) || 0;
                  const gross = quantity * unitPrice;

                  return (
                    <div
                      key={field.id}
                      className="grid grid-cols-12 gap-3 items-start p-4 bg-gray-50/50 rounded-lg border border-transparent hover:border-gray-200 transition-colors group"
                    >
                      <div className="col-span-12 md:col-span-5">
                        <label className="text-[10px] text-gray-400 uppercase font-bold mb-1 block">
                          Description
                        </label>
                        <input
                          {...register(`lineItems.${index}.description`, {
                            required: true,
                          })}
                          className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                          placeholder="Item description"
                        />
                      </div>
                      <div className="col-span-3 md:col-span-2">
                        <label className="text-[10px] text-gray-400 uppercase font-bold mb-1 block">
                          Qty
                        </label>
                        <input
                          type="number"
                          {...register(`lineItems.${index}.quantity`, {
                            valueAsNumber: true,
                          })}
                          className="w-full px-3 py-2 border border-gray-200 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                      <div className="col-span-4 md:col-span-2">
                        <label className="text-[10px] text-gray-400 uppercase font-bold mb-1 block">
                          Price
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          {...register(`lineItems.${index}.unitPrice`, {
                            valueAsNumber: true,
                          })}
                          className="w-full px-3 py-2 border border-gray-200 rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                      <div className="col-span-4 md:col-span-2">
                        <label className="text-[10px] text-gray-400 uppercase font-bold mb-1 block">
                          Total
                        </label>
                        <div className="px-3 py-2 bg-gray-100 rounded text-sm text-right font-medium text-gray-600">
                          {gross.toFixed(2)}
                        </div>
                        <input
                          type="hidden"
                          {...register(`lineItems.${index}.vatPercent`)}
                          value={15}
                        />
                        <input
                          type="hidden"
                          {...register(`lineItems.${index}.taxCategory`)}
                          value="S"
                        />
                      </div>
                      <div className="col-span-1 md:col-span-1 flex justify-end pt-6">
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={addLineItem}
                  className="w-full py-3 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 font-medium hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Line Item
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Totals & Actions */}
          <div className="lg:col-span-4 space-y-6">
            {/* Actions Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg sticky top-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-100 pb-4">
                Payment & Totals
              </h3>

              <div className="space-y-3 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">
                    {totals.lineExtensionTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">VAT (15%)</span>
                  <span className="font-medium text-green-600">
                    {totals.vatTotal.toFixed(2)}
                  </span>
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-base font-bold text-gray-900">
                    Total Payable
                  </span>
                  <span className="text-xl font-black text-blue-600">
                    {totals.payableAmount.toFixed(2)}{" "}
                    <span className="text-xs font-normal text-gray-400">
                      SAR
                    </span>
                  </span>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {!response ? (
                <button
                  type="submit"
                  disabled={loading || !selectedCommonName}
                  className={`w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 mb-3
                                ${
                                  loading || !selectedCommonName
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
                                }
                            `}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Generate & Sign Invoice
                </button>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="p-4 bg-green-50 border border-green-100 rounded-lg text-center">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-sm font-bold text-green-800">
                      Invoice Signed Successfully
                    </p>
                    <p className="text-xs text-green-600 mt-1 font-mono break-all">
                      {response.fileName}
                    </p>
                  </div>

                  <div className="bg-white p-4 border border-gray-100 rounded-lg flex justify-center">
                    <QRCodeCanvas
                      value={response.qrCode}
                      size={256}
                      level="M"
                      includeMargin={true}
                    />
                  </div>

                  {!submitResponse ? (
                    <button
                      type="button"
                      onClick={handleZatcaSubmission}
                      disabled={submitLoading}
                      className="w-full py-3 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      {submitLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Submit to ZATCA
                    </button>
                  ) : (
                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg text-center space-y-2">
                      <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                        ZATCA Response
                      </p>
                      <div className="text-sm font-medium">
                        Status: {submitResponse.reportingStatus || "REPORTED"}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
