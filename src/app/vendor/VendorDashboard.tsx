"use client";

import { useState } from "react";
import ReceiptScanner from "@/components/ReceiptScanner";
import BusinessCoach from "@/components/BusinessCoach";
import TransactionLedger from "@/components/TransactionLedger";
import type { Transaction, Vendor, ExtractedReceipt } from "@/types";

interface Props {
  vendor: Vendor;
  transactions: Transaction[];
  monthlyTotal: number;
  transactionCount: number;
}

type Tab = "scanner" | "coach" | "ledger";

export default function VendorDashboard({
  vendor,
  transactions: initialTxns,
  monthlyTotal: initialMonthly,
  transactionCount: initialCount,
}: Props) {
  const [activeTab, setActiveTab]   = useState<Tab>("scanner");
  const [transactions, setTxns]     = useState(initialTxns);
  const [monthlyTotal, setMonthly]  = useState(initialMonthly);
  const [txnCount, setTxnCount]     = useState(initialCount);

  function handleSaved(txnId: string, data: ExtractedReceipt) {
    const newTxn: Transaction = {
      id:             txnId,
      vendor_id:      vendor.id,
      receipt_date:   data.date,
      vendor_name:    data.vendor,
      total_kina:     data.total,
      currency:       "PGK",
      items:          data.items,
      ocr_confidence: data.confidence,
      ocr_notes:      data.notes,
      source:         "receipt_scan",
      created_at:     new Date().toISOString(),
    };
    setTxns((prev) => [newTxn, ...prev]);
    setMonthly((prev) => prev + data.total);
    setTxnCount((prev) => prev + 1);
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "scanner", label: "Scanner",  icon: "📷" },
    { id: "coach",   label: "Coach",    icon: "💬" },
    { id: "ledger",  label: "Ledger",   icon: "📊" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10l10 5 10-5V7L12 2zM12 17l-6-3V9l6 3 6-3v5l-6 3z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-base font-semibold text-gray-900 leading-tight">
                {vendor.business_name || vendor.full_name}
              </h1>
              <p className="text-xs text-gray-400">
                {vendor.market_name || "DSP Vendor Hub"}
              </p>
            </div>
          </div>
          <form action="/auth/logout" method="POST">
            <button
              type="submit"
              className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5"
            >
              Sign out
            </button>
          </form>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 bg-white border border-gray-100 rounded-xl p-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === tab.id
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="text-base leading-none">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Panels */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          {activeTab === "scanner" && (
            <ReceiptScanner vendorId={vendor.id} onSaved={handleSaved} />
          )}
          {activeTab === "coach" && (
            <BusinessCoach
              vendorId={vendor.id}
              monthlyTotal={monthlyTotal}
              transactionCount={txnCount}
            />
          )}
          {activeTab === "ledger" && (
            <TransactionLedger transactions={transactions} />
          )}
        </div>

        <p className="text-center text-xs text-gray-300 mt-6">
          pe.dspng.tech · Powered by Google Gemini
        </p>
      </div>
    </div>
  );
}
