"use client";

import type { Transaction } from "@/types";

interface Props {
  transactions: Transaction[];
}

export default function TransactionLedger({ transactions }: Props) {
  if (!transactions.length) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        No transactions yet. Scan a receipt to get started.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((t) => (
        <div key={t.id}
          className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-lg">
              🧾
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{t.vendor_name || "Receipt"}</p>
              <p className="text-xs text-gray-400">
                {t.receipt_date || "Unknown date"} · {(t.items || []).length} items
              </p>
            </div>
          </div>
          <span className="font-mono text-sm font-bold text-emerald-600">
            K{Number(t.total_kina).toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
}
