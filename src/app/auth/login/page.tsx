import LoginForm from "./LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sign in — DSP Vendor Hub" };

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10l10 5 10-5V7L12 2zM12 17l-6-3V9l6 3 6-3v5l-6 3z"/>
              </svg>
            </div>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your DSP Vendor Hub account</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
