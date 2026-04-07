"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { askBusinessCoach } from "@/actions/businessCoach";
import type { ChatMessage } from "@/types";

interface Props {
  vendorId: string;
  monthlyTotal?: number;
  transactionCount?: number;
}

const SUGGESTIONS = [
  "How can I save K200 this month?",
  "What are my best selling items?",
  "How can I grow my trade store?",
  "Should I get a BSP loan?",
  "How to handle slow market days?",
];

export default function BusinessCoach({ vendorId, monthlyTotal = 0, transactionCount = 0 }: Props) {
  const [messages,  setMessages]  = useState<ChatMessage[]>([]);
  const [input,     setInput]     = useState("");
  const [error,     setError]     = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPending]);

  function send(text?: string) {
    const q = (text ?? input).trim();
    if (!q || isPending) return;
    setInput(""); setError(null);
    const userMsg: ChatMessage = { role: "user", content: q };
    const next = [...messages, userMsg];
    setMessages(next);

    startTransition(async () => {
      const res = await askBusinessCoach(vendorId, q, messages.slice(-8));
      if (res.success && res.reply) {
        setMessages([...next, { role: "assistant", content: res.reply }]);
      } else {
        setError(res.error ?? "Coach unavailable. Please try again.");
        setMessages(next.slice(0, -1));
      }
    });
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  const avgSale = transactionCount ? (monthlyTotal / transactionCount).toFixed(0) : "0";

  return (
    <div className="flex flex-col h-full min-h-[520px]">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: "This month", value: `K${monthlyTotal.toFixed(0)}`, green: true },
          { label: "Transactions", value: String(transactionCount), green: false },
          { label: "Avg. sale", value: `K${avgSale}`, green: false },
        ].map((s) => (
          <div key={s.label} className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-400 uppercase tracking-wide">{s.label}</p>
            <p className={`font-mono text-lg font-bold mt-1 ${s.green ? "text-emerald-600" : "text-gray-800"}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
        {messages.length === 0 && (
          <div className="bg-white border border-gray-100 rounded-xl rounded-bl-sm px-4 py-3 text-sm text-gray-700 max-w-[85%]">
            👋 Gude! I'm your AI Business Coach. I can see your sales history and help you grow your market business. Ask me anything!
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-emerald-600 text-white rounded-br-sm"
                  : "bg-white border border-gray-100 text-gray-700 rounded-bl-sm"
              }`}
              {...(msg.role === "assistant"
                ? { dangerouslySetInnerHTML: { __html: formatMd(msg.content) } }
                : { children: msg.content }
              )}
            />
          </div>
        ))}

        {isPending && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1 items-center">
                {[0,1,2].map((i) => (
                  <div key={i} className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-2 text-xs mb-2">
          {error}
        </div>
      )}

      {/* Suggestions */}
      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {SUGGESTIONS.map((q) => (
            <button key={q} type="button" onClick={() => send(q)} disabled={isPending}
              className="text-xs bg-gray-50 hover:bg-emerald-50 hover:border-emerald-300 border border-gray-200 text-gray-600 rounded-full px-3 py-1.5 transition-colors disabled:opacity-40">
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 items-end">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask your coach…"
          rows={1}
          disabled={isPending}
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-emerald-400 bg-white disabled:opacity-60"
          style={{ minHeight: 40, maxHeight: 100 }}
        />
        <button
          type="button"
          onClick={() => send()}
          disabled={isPending || !input.trim()}
          className="bg-emerald-600 text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-emerald-700 disabled:opacity-40 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}

function formatMd(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .split("\n")
    .map((l) => `<p style="margin:0 0 4px">${l}</p>`)
    .join("");
}
