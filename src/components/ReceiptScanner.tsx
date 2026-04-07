"use client";

import { useRef, useState, useTransition } from "react";
import { scanReceipt } from "@/actions/receiptScanner";
import type { ExtractedReceipt } from "@/types";

interface Props {
  vendorId: string;
  onSaved?: (transactionId: string, data: ExtractedReceipt) => void;
}

const CONFIDENCE_COLOR: Record<string, string> = {
  high:   "text-emerald-600",
  medium: "text-amber-600",
  low:    "text-red-600",
};

export default function ReceiptScanner({ vendorId, onSaved }: Props) {
  const fileRef              = useRef<HTMLInputElement>(null);
  const [preview, setPreview]   = useState<string | null>(null);
  const [result,  setResult]    = useState<ExtractedReceipt | null>(null);
  const [savedId, setSavedId]   = useState<string | null>(null);
  const [error,   setError]     = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null); setSavedId(null); setError(null);
    setPreview(URL.createObjectURL(file));
    startTransition(async () => {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("vendorId", vendorId);
      const res = await scanReceipt(fd);
      if (res.success && res.data) {
        setResult(res.data);
        setSavedId(res.transactionId ?? null);
        onSaved?.(res.transactionId!, res.data);
      } else {
        setError(res.error ?? "Scan failed. Please retake the photo.");
      }
    });
  }

  function reset() {
    setPreview(null); setResult(null); setSavedId(null); setError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="w-full border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-emerald-400 hover:bg-emerald-50 transition-colors"
      >
        <div className="text-4xl mb-2">📷</div>
        <p className="text-sm font-medium text-gray-700">Take photo or upload receipt</p>
        <p className="text-xs text-gray-400 mt-1">
          Handwritten ledgers · market receipts · invoices
        </p>
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Preview */}
      {preview && (
        <img
          src={preview}
          alt="Receipt preview"
          className="w-full max-h-52 object-contain rounded-lg border border-gray-100"
        />
      )}

      {/* Loading */}
      {isPending && (
        <div className="flex items-center gap-3 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          Reading receipt with Gemini AI…
        </div>
      )}

      {/* Error */}
      {error && !isPending && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {/* Result */}
      {result && !isPending && (
        <div className="border border-gray-100 rounded-xl p-4 space-y-3 bg-white">
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            Extracted receipt data
          </h3>

          <div className="space-y-2">
            {([ ["Date", result.date], ["Vendor", result.vendor] ] as const).map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-gray-400">{label}</span>
                <span className="font-medium">{value || "—"}</span>
              </div>
            ))}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Total</span>
              <span className="font-mono text-lg font-bold text-emerald-600">
                K{result.total.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Confidence</span>
              <span className={`font-medium ${CONFIDENCE_COLOR[result.confidence] ?? ""}`}>
                {result.confidence}
              </span>
            </div>
            {result.notes && (
              <p className="text-xs text-gray-400 italic">{result.notes}</p>
            )}
          </div>

          {result.items.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Items</p>
              <div className="flex flex-wrap gap-1">
                {result.items.map((item, i) => (
                  <span key={i} className="bg-emerald-50 text-emerald-700 text-xs px-2 py-1 rounded-full">
                    {item.name}{item.qty > 1 && ` ×${item.qty}`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {savedId && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg p-2 text-xs text-center">
              ✓ Saved to ledger · ID: {savedId.slice(0, 8)}…
            </div>
          )}

          <button
            type="button"
            onClick={reset}
            className="w-full text-sm text-gray-400 hover:text-gray-600 py-1"
          >
            Scan another receipt
          </button>
        </div>
      )}
    </div>
  );
}
