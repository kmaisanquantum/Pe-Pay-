"use server";

/**
 * ReceiptScanner Server Action
 * pe.dspng.tech — DSP PNG Vendor Platform
 *
 * Uses Gemini 1.5 Flash (multimodal) to OCR handwritten PNG market
 * receipts and ledger pages, then persists the result to Supabase.
 */

import { HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { getGeminiClient } from "@/lib/gemini";
import { createServiceClient } from "@/lib/supabase/server";
import type { ExtractedReceipt, ScanResult } from "@/types";

// ── OCR prompt ────────────────────────────────────────────────────────────────

const OCR_PROMPT = `
You are an OCR assistant for small vendors in Papua New Guinea (PNG).
Extract structured data from photos of:
- Handwritten market receipts (Koki, Gordons, Lae markets)
- Trade store ledger pages in Tok Pisin or English
- Crumpled, low-light, or blurry paper receipts
- Typed invoices or thermal-printer receipts

Return ONLY valid JSON (no markdown fences, no preamble) matching:
{
  "date": "DD/MM/YYYY — use today if not legible",
  "vendor": "vendor/shop name or 'Unknown Vendor'",
  "total": <Kina as a number — strip K prefix, convert toea to decimal>,
  "currency": "PGK",
  "items": [{ "name": "<item>", "qty": <number>, "price": <kina> }],
  "confidence": "high|medium|low",
  "notes": "<caveats about legibility or assumptions>"
}

Rules:
- K prefix = Kina (K5.50 → 5.50). Toea = cents (50t → 0.50)
- If total not printed, sum the line items
- Common items: buai, aibika, kumu, tinfish, rice, ramu sugar
- "Tupela" = 2, "tripela" = 3 in Tok Pisin
- confidence = "high" if total is clearly visible, "low" if estimated
`;

// ── Server Action ─────────────────────────────────────────────────────────────

export async function scanReceipt(formData: FormData): Promise<ScanResult> {
  try {
    const image    = formData.get("image")    as File | null;
    const vendorId = formData.get("vendorId") as string | null;

    // Validation
    if (!image || image.size === 0)
      return { success: false, error: "No image provided." };
    if (image.size > 10 * 1024 * 1024)
      return { success: false, error: "Image must be under 10 MB." };
    if (!vendorId)
      return { success: false, error: "Vendor ID is required." };

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/heic"];
    if (!allowed.includes(image.type))
      return { success: false, error: "Use JPEG, PNG, WEBP, or HEIC." };

    // Convert to base64
    const buffer = await image.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    // Gemini multimodal call
    const model = getGeminiClient().getGenerativeModel({
      model: "gemini-1.5-flash",
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
      generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
    });

    const result = await model.generateContent([
      { text: OCR_PROMPT },
      { inlineData: {
          mimeType: image.type as "image/jpeg" | "image/png" | "image/webp",
          data: base64,
      }},
    ]);

    const rawText = result.response.text().trim();

    // Parse JSON
    let extracted: ExtractedReceipt;
    try {
      const clean = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "");
      extracted = JSON.parse(clean);
    } catch {
      return { success: false, error: "Could not read receipt. Please retake the photo." };
    }

    if (typeof extracted.total !== "number" || extracted.total <= 0)
      return { success: false, error: "Could not determine receipt total. Ensure the amount is visible." };

    extracted.items = (extracted.items || []).map((item) => ({
      name:  String(item.name  || "Unknown").slice(0, 100),
      qty:   Math.max(1, Number(item.qty)   || 1),
      price: Math.max(0, Number(item.price) || 0),
    }));

    // Persist to Supabase
    const supabase = createServiceClient();
    const { data: txn, error: dbError } = await supabase
      .from("transactions")
      .insert({
        vendor_id:           vendorId,
        receipt_date:        parseDate(extracted.date),
        vendor_name:         (extracted.vendor || "Unknown Vendor").slice(0, 200),
        total_kina:          extracted.total,
        currency:            "PGK",
        items:               extracted.items,
        ocr_confidence:      extracted.confidence,
        ocr_notes:           extracted.notes || null,
        raw_gemini_response: rawText,
        source:              "receipt_scan",
        created_at:          new Date().toISOString(),
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("[ReceiptScanner] DB error:", dbError);
      return { success: false, error: "Failed to save. Please try again." };
    }

    return { success: true, data: extracted, transactionId: txn.id };

  } catch (err) {
    console.error("[ReceiptScanner] Unexpected:", err);
    return { success: false, error: "Unexpected error. Please try again." };
  }
}

function parseDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString().split("T")[0];
  const m = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return new Date().toISOString().split("T")[0];
  return `${m[3]}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}`;
}
