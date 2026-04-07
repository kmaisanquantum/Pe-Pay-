"use client";

import type { Transaction } from "@/types";

interface Props {
  transactions: Transaction[];
}

export default function TransactionLedger({ transactions }: Props) {
  if (!transactions.length) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm leading-relaxed">
        <div className="text-3xl mb-3">📖</div>
        No transactions yet.<br />Scan a receipt or receive a digital payment.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1 mb-2">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Digital Passbook</h2>
        <div className="flex gap-3">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-[10px] text-gray-500 font-medium">IN</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
            <span className="text-[10px] text-gray-500 font-medium">OUT</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {transactions.map((t) => (
          <div key={t.id}
            className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3 hover:border-emerald-100 transition-colors group">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-transform group-hover:scale-105 ${
                t.type === 'OUT' ? 'bg-red-50' : 'bg-emerald-50'
              }`}>
                {t.is_digital ? '📱' : (t.type === 'OUT' ? '💸' : '🧾')}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-gray-800">{t.vendor_name || (t.type === 'OUT' ? 'Expense' : 'Sale')}</p>
                  {t.is_digital && (
                    <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded uppercase tracking-tighter">Digital</span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 font-medium">
                  {t.receipt_date || "Today"} · {t.source === 'receipt_scan' ? 'OCR Scan' : 'Mobile Pay'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-mono text-sm font-black ${
                t.type === 'OUT' ? 'text-red-500' : 'text-emerald-600'
              }`}>
                {t.type === 'OUT' ? '-' : '+'}K{Number(t.total_kina).toFixed(2)}
              </p>
              {t.ocr_confidence === 'low' && (
                <p className="text-[9px] text-orange-400 font-bold uppercase tracking-tighter">Check Amount</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-[10px] text-gray-400 pt-4 italic">
        "Showing last 30 transactions"
      </p>
    </div>
  );
}
