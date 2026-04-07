"use server";

import { createServiceClient } from "@/lib/supabase/server";

export interface ReliabilityScore {
  score: number;        // 0 to 100
  rating: string;       // "A", "B", "C", "D"
  metrics: {
    digitalTxnCount: number;
    digitalVolume: number;
    totalTxnCount: number;
  };
  explanation: string;
}

/**
 * Calculates a "Reliability Score" for a vendor based on 30 days of history.
 *
 * Logic:
 * - Weighted heavily on digital payment frequency (SevisPay/Mobile Money)
 * - Volume of digital payments (Total Kina)
 * - Consistency over the 30-day window
 */
export async function calculateReliabilityScore(vendorId: string): Promise<ReliabilityScore> {
  const supabase = createServiceClient();

  const { data: stats, error } = await supabase
    .from("vendor_reliability_stats")
    .select("*")
    .eq("vendor_id", vendorId)
    .single();

  if (error || !stats) {
    return {
      score: 0,
      rating: "D",
      metrics: { digitalTxnCount: 0, digitalVolume: 0, totalTxnCount: 0 },
      explanation: "Not enough transaction history to generate a score."
    };
  }

  const dCount = Number(stats.digital_txn_count || 0);
  const dVolume = Number(stats.digital_txn_volume || 0);
  const tCount = Number(stats.total_txn_count_30d || 0);

  // BASE SCORE calculation (Simplified model)
  // 1. Digital Adoption (Max 40 pts): 4 pts per digital txn, cap at 10 txns
  const adoptionPoints = Math.min(40, dCount * 4);

  // 2. Volume Factor (Max 30 pts): 1 pt per K50 digital volume, cap at K1500
  const volumePoints = Math.min(30, (dVolume / 50));

  // 3. Activity Level (Max 30 pts): 1 pt per total txn (any type), cap at 30 txns
  const activityPoints = Math.min(30, tCount);

  const totalScore = Math.round(adoptionPoints + volumePoints + activityPoints);

  let rating = "D";
  let explanation = "Start accepting more digital payments to build your score.";

  if (totalScore >= 85) {
    rating = "A";
    explanation = "Excellent digital history. High reliability for micro-loans.";
  } else if (totalScore >= 60) {
    rating = "B";
    explanation = "Good digital adoption. Keep it up to access better credit.";
  } else if (totalScore >= 30) {
    rating = "C";
    explanation = "Fair history. Encourage customers to pay via SevisPay.";
  }

  return {
    score: totalScore,
    rating,
    metrics: {
      digitalTxnCount: dCount,
      digitalVolume: dVolume,
      totalTxnCount: tCount,
    },
    explanation,
  };
}
