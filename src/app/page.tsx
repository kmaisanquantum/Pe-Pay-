import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center">
            <svg className="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10l10 5 10-5V7L12 2zM12 17l-6-3V9l6 3 6-3v5l-6 3z"/>
            </svg>
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">DSP Vendor Hub</h1>
          <p className="text-gray-500 mt-2 text-sm leading-relaxed">
            Digitise your paper records with AI. Scan receipts, track your sales,
            and get personalised business coaching — all in Kina.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 justify-center">
          {["📷 Receipt OCR", "💬 AI Business Coach", "📊 Sales Ledger", "🇵🇬 Made for PNG"].map((f) => (
            <span key={f} className="bg-emerald-50 text-emerald-700 text-xs px-3 py-1.5 rounded-full font-medium">
              {f}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3">
          <Link
            href="/vendor"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-3 rounded-xl text-center transition-colors"
          >
            Open Vendor Dashboard
          </Link>
          <Link
            href="/auth/login"
            className="w-full border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-medium py-3 rounded-xl text-center transition-colors"
          >
            Sign in to your account
          </Link>
        </div>

        <p className="text-xs text-gray-400">
          Powered by Google Gemini AI · pe.dspng.tech
        </p>
      </div>
    </main>
  );
}
