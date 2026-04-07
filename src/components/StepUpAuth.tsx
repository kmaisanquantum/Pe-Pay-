"use client";

import { useState } from "react";

interface Props {
  amount: number;
  onVerified: () => void;
  onCancel: () => void;
}

export default function StepUpAuth({ amount, onVerified, onCancel }: Props) {
  const [isVerifying, setIsVerifying] = useState(false);

  const handleBiometricAuth = async () => {
    setIsVerifying(true);
    // Simulate WebAuthn / Biometric prompt
    // In a real app, this would use navigator.credentials.get()
    setTimeout(() => {
      setIsVerifying(false);
      onVerified();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🛡️</span>
          </div>

          <h2 className="text-xl font-black text-gray-900 mb-2">Security Verification</h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Transfers over <span className="font-bold text-gray-900">K100.00</span> require biometric confirmation.
          </p>

          <div className="bg-gray-50 rounded-2xl p-4 mb-8">
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Transfer Amount</p>
            <p className="text-2xl font-mono font-black text-emerald-600">K{amount.toFixed(2)}</p>
          </div>

          <button
            onClick={handleBiometricAuth}
            disabled={isVerifying}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl text-base transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-3"
          >
            {isVerifying ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <span>👆</span>
                Confirm with Biometrics
              </>
            )}
          </button>

          <button
            onClick={onCancel}
            disabled={isVerifying}
            className="w-full mt-4 text-gray-400 hover:text-gray-600 font-bold py-2 text-sm transition-colors"
          >
            Cancel Transfer
          </button>
        </div>

        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 text-center leading-tight">
            SevisPay Step-up Authentication (WebAuthn)
          </p>
        </div>
      </div>
    </div>
  );
}
