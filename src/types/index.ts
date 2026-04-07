// ── Receipt / OCR ─────────────────────────────────────────────────────────────

export interface ReceiptItem {
  name: string;
  qty: number;
  price: number;
}

export interface ExtractedReceipt {
  date: string;        // "DD/MM/YYYY"
  vendor: string;
  total: number;       // Kina (PGK)
  currency: "PGK";
  items: ReceiptItem[];
  confidence: "high" | "medium" | "low";
  notes?: string;
}

export interface ScanResult {
  success: boolean;
  data?: ExtractedReceipt;
  transactionId?: string;
  error?: string;
}

// ── Business Coach ────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface CoachResponse {
  success: boolean;
  reply?: string;
  context?: {
    transactionCount: number;
    totalKina: number;
    topItems: string[];
  };
  error?: string;
}

// ── Database rows ─────────────────────────────────────────────────────────────

export interface Vendor {
  id: string;
  auth_user_id: string;
  full_name: string;
  business_name?: string;
  phone?: string;
  province?: string;
  market_name?: string;
  sevis_id?: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  vendor_id: string;
  receipt_date?: string;
  vendor_name?: string;
  total_kina: number;
  currency: string;
  items: ReceiptItem[];
  ocr_confidence?: "high" | "medium" | "low";
  ocr_notes?: string;
  source: string;
  type: "IN" | "OUT";
  is_digital: boolean;
  created_at: string;
}
