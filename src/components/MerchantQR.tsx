"use client";

import { QRCodeSVG } from "qrcode.react";

interface Props {
  sevisId: string;
  businessName: string;
}

export default function MerchantQR({ sevisId, businessName }: Props) {
  if (!sevisId) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl mb-4">
          ⚠️
        </div>
        <p className="text-gray-600 font-medium">No SevisID found</p>
        <p className="text-gray-400 text-xs max-w-[200px] mt-1">
          Please contact support to link your SevisPay account.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-50 mb-6">
        <QRCodeSVG
          value={sevisId}
          size={200}
          level="H"
          includeMargin={true}
          className="rounded-lg"
        />
      </div>

      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{businessName}</h3>
        <div className="inline-flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-mono font-bold text-emerald-700">
            {sevisId}
          </span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 w-full">
        <button
          onClick={() => window.print()}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors"
        >
          <span className="text-xl">🖨️</span>
          <span className="text-xs font-medium text-gray-600">Print QR</span>
        </button>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'My SevisID',
                text: `Pay me at ${businessName} using SevisID: ${sevisId}`,
              });
            }
          }}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors"
        >
          <span className="text-xl">📤</span>
          <span className="text-xs font-medium text-gray-600">Share ID</span>
        </button>
      </div>

      <p className="mt-6 text-[10px] text-gray-400 text-center leading-relaxed">
        Customers can scan this code using SevisPay or any mobile money app to
        send money directly to your account.
      </p>
    </div>
  );
}
