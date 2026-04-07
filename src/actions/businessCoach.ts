"use server";

/**
 * Business Coach Server Action
 * pe.dspng.tech — DSP PNG Vendor Platform
 *
 * Fetches last 10 transactions from Supabase, injects as Gemini context,
 * returns personalised PNG-market business advice in Kina.
 */

import { getGeminiClient } from "@/lib/gemini";
import { createServiceClient } from "@/lib/supabase/server";
import type { ChatMessage, CoachResponse } from "@/types";

// ── System prompt builder ─────────────────────────────────────────────────────

function buildSystemPrompt(txnContext: string, summary: string): string {
  return `You are an AI Business Coach for small vendors in Papua New Guinea (PNG),
deployed on pe.dspng.tech by the Digital Skills PNG (DSP) programme.

Your users are market sellers, trade store owners, and micro-entrepreneurs
in Port Moresby, Lae, Mt Hagen, and Kokopo.

TONE & STYLE:
- Warm, practical, encouraging — like a trusted wantok (friend)
- Mostly English; occasional Tok Pisin is welcome (gutpela, baimbai, wantok, tru, orait)
- 3-5 paragraphs max; bullet points for action items
- Always give advice in specific Kina (K) amounts
- Reference their actual transaction data when relevant

VENDOR SUMMARY:
${summary}

RECENT TRANSACTIONS (last 10 from Supabase ledger):
${txnContext}

ADVISORY FOCUS AREAS:
1. Cash flow management (saving K, avoiding debt cycles)
2. Stock optimisation (what to buy more/less of)
3. Pricing strategies for PNG market conditions
4. Supplier negotiation (rausim hap prais — better prices)
5. Growing to a trade store or PMV route supplier
6. Mobile money (BSP Kundu, Digicel m-Money) for safer cash handling
7. Seasonal demand patterns (school terms, elections, holidays, betelnut season)

Always tie recommendations to the vendor's actual numbers and PNG market realities.`;
}

// ── Server Action ─────────────────────────────────────────────────────────────

export async function askBusinessCoach(
  vendorId: string,
  message: string,
  history: ChatMessage[] = []
): Promise<CoachResponse> {
  try {
    if (!vendorId) return { success: false, error: "Vendor ID required." };
    if (!message?.trim()) return { success: false, error: "Message cannot be empty." };
    if (message.length > 1000) return { success: false, error: "Message too long (max 1000 chars)." };

    // Fetch last 10 transactions
    const supabase = createServiceClient();
    const { data: transactions, error: fetchError } = await supabase
      .from("transactions")
      .select("receipt_date, vendor_name, total_kina, items")
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (fetchError) {
      console.error("[BusinessCoach] Supabase fetch:", fetchError);
      return { success: false, error: "Could not load your transaction history." };
    }

    const txns = transactions || [];
    const txnContext = buildTxnContext(txns);
    const summary    = buildSummary(txns);
    const topItems   = extractTopItems(txns);
    const systemPrompt = buildSystemPrompt(txnContext, summary);

    // Build Gemini conversation history (last 8 turns)
    const geminiHistory = history.slice(-8).map((msg) => ({
      role:  msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Gemini call
    const model = getGeminiClient().getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt,
      generationConfig: { temperature: 0.7, maxOutputTokens: 800, topP: 0.9 },
    });

    const chat   = model.startChat({ history: geminiHistory });
    const result = await chat.sendMessage(message.trim());
    const reply  = result.response.text().trim();

    if (!reply) return { success: false, error: "No response from AI. Please try again." };

    // Log interaction (fire-and-forget, non-blocking)
    supabase.from("coach_interactions").insert({
      vendor_id:                  vendorId,
      user_message:               message.trim(),
      ai_reply:                   reply,
      transaction_count_at_time:  txns.length,
      created_at:                 new Date().toISOString(),
    }).then(({ error }: { error: any }) => { if (error) console.warn("[BusinessCoach] Log error:", error); });

    const totalKina = txns.reduce((s: number, t: any) => s + (t.total_kina || 0), 0);
    return { success: true, reply, context: { transactionCount: txns.length, totalKina, topItems } };

  } catch (err) {
    console.error("[BusinessCoach] Unexpected:", err);
    return { success: false, error: "Coach is temporarily unavailable. Please try again." };
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildTxnContext(txns: any[]): string {
  if (!txns.length) return "No transactions recorded yet — vendor is just getting started.";
  return txns.map((t, i) => {
    const items = (t.items || []).map((x: any) => x.name).join(", ") || "unspecified";
    return `${i + 1}. ${t.receipt_date || "Unknown date"} | Vendor: ${t.vendor_name || "?"} | Total: K${Number(t.total_kina).toFixed(2)} | Items: ${items}`;
  }).join("\n");
}

function buildSummary(txns: any[]): string {
  if (!txns.length) return "New vendor — no transaction history yet.";
  const total = txns.reduce((s, t) => s + (t.total_kina || 0), 0);
  const avg   = total / txns.length;
  const max   = txns.reduce((m, t) => (t.total_kina > m ? t.total_kina : m), 0);
  const min   = txns.reduce((m, t) => (t.total_kina < m ? t.total_kina : m), Infinity);
  return `Total (${txns.length} txns): K${total.toFixed(2)} | Avg: K${avg.toFixed(2)} | High: K${max.toFixed(2)} | Low: K${min === Infinity ? 0 : min.toFixed(2)}`;
}

function extractTopItems(txns: any[]): string[] {
  const counts: Record<string, number> = {};
  for (const t of txns)
    for (const item of t.items || [])
      if (item.name) counts[item.name] = (counts[item.name] || 0) + 1;
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([n]) => n);
}
