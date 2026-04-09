// ============================================================
// REAL Pattern Detection Engine (v2 - Knowledge-Enhanced)
//
// How it works:
// 1. Takes raw daily log data (food, habits, skin scores)
// 2. For each factor × each time lag (0-7 days):
//    - Compares avg skin severity on "factor present" days vs "factor absent" days
//    - Runs chi-squared significance test
// 3. Uses the Skin Science Knowledge Base to:
//    - Weight lags toward biologically expected windows
//    - Boost confidence when statistical finding matches known science
//    - Detect multi-factor combination effects (dairy + sugar = amplified)
//    - Generate mechanism-based explanations (WHY dairy triggers acne)
// 4. Returns ranked, confidence-scored results with full mechanism context
// ============================================================

import {
  getExpectedLagDays,
  getEvidenceStrength,
  getCombinationMultiplier,
  generateMechanismInsight,
  getNutrientRecommendations,
  FOOD_SKIN_PROFILES,
  LIFESTYLE_SKIN_PROFILES,
  COMBINATION_EFFECTS,
  type CombinationEffect,
} from './skinKnowledgeBase';

export interface DailyEntry {
  date: string; // YYYY-MM-DD
  factors: Record<string, boolean | number>;
  skinSeverity: number;    // 0-10
  newBreakouts: number;    // 0-10+
  oiliness: number;        // 1-5
  inflammation: number;    // 0-5
}

export interface CorrelationResult {
  factor: string;
  factorLabel: string;
  bestLag: number;
  effectSize: number;
  avgWithFactor: number;
  avgWithoutFactor: number;
  daysWithFactor: number;
  daysWithoutFactor: number;
  pValue: number;
  pValueAdjusted: number;           // FDR-corrected p-value
  cohensD: number;                   // Standardized effect size
  confidence: 'high' | 'moderate' | 'low';
  reliabilityScore: number;          // 0-100 overall trustworthiness
  direction: 'trigger' | 'protective';
  lagEffects: { lag: number; effect: number; pValue: number }[];
  // Knowledge-enhanced fields
  mechanism: string | null;
  evidenceStrength: string | null;
  expectedLagRange: [number, number] | null;
  lagMatchesScience: boolean;
  compounds: string[];
  recommendation: string | null;
}

// ---------- Data quality score for the entire dataset ----------
export interface DataQualityReport {
  overallScore: number;             // 0-100
  totalDays: number;
  expectedDays: number;
  completionRate: number;           // % of expected days logged
  longestGap: number;               // max consecutive days missed
  factorsTracked: number;
  avgFactorsPerDay: number;
  sufficientForAnalysis: boolean;
  issues: string[];
  strengths: string[];
}

export function assessDataQuality(entries: DailyEntry[], expectedDays: number = 56): DataQualityReport {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const issues: string[] = [];
  const strengths: string[] = [];

  // Completion rate
  const completionRate = Math.min(1, sorted.length / expectedDays);
  if (completionRate < 0.5) issues.push(`Only ${Math.round(completionRate * 100)}% of days logged - need more data`);
  else if (completionRate > 0.8) strengths.push(`${Math.round(completionRate * 100)}% logging consistency - excellent`);

  // Longest gap
  let longestGap = 0;
  for (let i = 1; i < sorted.length; i++) {
    const gap = Math.round(
      (new Date(sorted[i].date).getTime() - new Date(sorted[i - 1].date).getTime()) / (1000 * 60 * 60 * 24)
    ) - 1;
    if (gap > longestGap) longestGap = gap;
  }
  if (longestGap > 5) issues.push(`${longestGap}-day gap found - patterns may be missed in that window`);

  // Factor tracking consistency
  const factorKeys = sorted.length > 0 ? Object.keys(sorted[0].factors) : [];
  const factorsTracked = factorKeys.length;
  const avgFactorsPerDay = sorted.length > 0
    ? sorted.reduce((s, e) => s + Object.values(e.factors).filter(v => v !== false && v !== 0).length, 0) / sorted.length
    : 0;

  if (factorsTracked < 5) issues.push('Tracking fewer than 5 factors - add more for better analysis');
  if (factorsTracked >= 10) strengths.push(`Tracking ${factorsTracked} factors - comprehensive coverage`);

  // Skin score variance (if all same, no patterns to find)
  const severities = sorted.map(e => e.skinSeverity);
  const sevMean = severities.reduce((a, b) => a + b, 0) / severities.length;
  const sevVariance = severities.reduce((s, v) => s + Math.pow(v - sevMean, 2), 0) / severities.length;
  if (sevVariance < 0.5) issues.push('Skin scores are very stable - hard to detect trigger effects');
  if (sevVariance > 2) strengths.push('Good skin score variation - easier to detect patterns');

  // Overall score
  let score = 0;
  score += Math.min(30, completionRate * 30);  // up to 30 pts for completion
  score += Math.min(20, sorted.length >= 28 ? 20 : (sorted.length / 28) * 20); // 20 pts for minimum days
  score += Math.min(15, longestGap <= 2 ? 15 : Math.max(0, 15 - longestGap * 2)); // 15 pts for consistency
  score += Math.min(15, factorsTracked >= 8 ? 15 : (factorsTracked / 8) * 15); // 15 pts for factor coverage
  score += Math.min(20, sevVariance > 1 ? 20 : sevVariance * 20); // 20 pts for detectable variation

  return {
    overallScore: Math.round(score),
    totalDays: sorted.length,
    expectedDays,
    completionRate: Math.round(completionRate * 100),
    longestGap,
    factorsTracked,
    avgFactorsPerDay: Math.round(avgFactorsPerDay * 10) / 10,
    sufficientForAnalysis: sorted.length >= 14 && completionRate >= 0.4,
    issues,
    strengths,
  };
}

export interface CohortInsight {
  factor: string;
  factorLabel: string;
  affectedUsers: number;
  totalUsers: number;
  avgEffectSize: number;
  bestLag: number;
  consistency: number;
}

// ---------- Factor extraction ----------
// Determines if a factor was "present" on a given day.
// Booleans: true = present. Numbers: above 66th-percentile = present (for continuous factors like stress).
// The engine figures out thresholds from the data itself - nothing hardcoded.

function computeThresholds(entries: DailyEntry[]): Record<string, number | null> {
  const thresholds: Record<string, number | null> = {};
  if (entries.length === 0) return thresholds;

  const sampleFactors = entries[0].factors;
  for (const key of Object.keys(sampleFactors)) {
    const val = sampleFactors[key];
    if (typeof val === 'boolean') {
      thresholds[key] = null; // boolean - no threshold needed
    } else {
      // numeric - compute 66th percentile as "high" threshold
      const values = entries
        .map(e => e.factors[key])
        .filter((v): v is number => typeof v === 'number')
        .sort((a, b) => a - b);
      if (values.length > 0) {
        const idx = Math.floor(values.length * 0.66);
        thresholds[key] = values[idx];
      } else {
        thresholds[key] = null;
      }
    }
  }
  return thresholds;
}

function isFactorPresent(
  value: boolean | number | undefined,
  threshold: number | null,
  invert: boolean = false
): boolean {
  if (value === undefined) return false;
  let present: boolean;
  if (typeof value === 'boolean') {
    present = value;
  } else {
    present = threshold !== null ? value >= threshold : value > 0;
  }
  return invert ? !present : present;
}

// ---------- Cohen's d (standardized effect size) ----------
function cohensD(group1: number[], group2: number[]): number {
  const n1 = group1.length, n2 = group2.length;
  if (n1 < 2 || n2 < 2) return 0;
  const mean1 = group1.reduce((a, b) => a + b, 0) / n1;
  const mean2 = group2.reduce((a, b) => a + b, 0) / n2;
  const var1 = group1.reduce((s, v) => s + Math.pow(v - mean1, 2), 0) / (n1 - 1);
  const var2 = group2.reduce((s, v) => s + Math.pow(v - mean2, 2), 0) / (n2 - 1);
  const pooledSD = Math.sqrt(((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2));
  if (pooledSD === 0) return 0;
  return (mean1 - mean2) / pooledSD;
}

// ---------- Benjamini-Hochberg FDR correction ----------
// Adjusts p-values for multiple comparisons
function fdrCorrect(pValues: { factor: string; pValue: number }[]): Record<string, number> {
  const sorted = [...pValues].sort((a, b) => a.pValue - b.pValue);
  const m = sorted.length;
  const adjusted: Record<string, number> = {};
  let prevAdj = 1;

  for (let i = m - 1; i >= 0; i--) {
    const adj = Math.min(prevAdj, (sorted[i].pValue * m) / (i + 1));
    adjusted[sorted[i].factor] = Math.min(1, adj);
    prevAdj = adj;
  }
  return adjusted;
}

// ---------- Reliability score for a single correlation ----------
function computeReliability(
  pValue: number, pValueAdj: number, absCohenD: number,
  daysWith: number, daysWithout: number,
  lagMatchesScience: boolean, evidenceStrength: string | null
): number {
  let score = 0;
  // Statistical significance (0-30)
  if (pValueAdj < 0.01) score += 30;
  else if (pValueAdj < 0.05) score += 25;
  else if (pValueAdj < 0.1) score += 15;
  else if (pValue < 0.1) score += 8;

  // Effect size (0-25)
  if (absCohenD > 0.8) score += 25;       // large
  else if (absCohenD > 0.5) score += 20;   // medium
  else if (absCohenD > 0.2) score += 12;   // small
  else score += 5;

  // Sample size (0-20)
  const minSample = Math.min(daysWith, daysWithout);
  if (minSample >= 15) score += 20;
  else if (minSample >= 10) score += 15;
  else if (minSample >= 7) score += 10;
  else score += 5;

  // Science alignment (0-15)
  if (lagMatchesScience && evidenceStrength === 'strong') score += 15;
  else if (lagMatchesScience) score += 10;
  else if (evidenceStrength === 'strong' || evidenceStrength === 'moderate') score += 5;

  // Bonus for FDR survival (0-10)
  if (pValueAdj < 0.05) score += 10;

  return Math.min(100, score);
}

// ---------- Chi-squared p-value approximation ----------
function chiSquaredPValue(a: number, b: number, c: number, d: number): number {
  const n = a + b + c + d;
  if (n === 0 || (a + b) === 0 || (c + d) === 0 || (a + c) === 0 || (b + d) === 0) return 1;
  const chi2 = (n * Math.pow(a * d - b * c, 2)) / ((a + b) * (c + d) * (a + c) * (b + d));
  if (chi2 === 0) return 1;
  if (chi2 > 10.83) return 0.001;
  if (chi2 > 6.63) return 0.01;
  if (chi2 > 3.84) return 0.05;
  if (chi2 > 2.71) return 0.1;
  if (chi2 > 1.64) return 0.2;
  return Math.min(1, Math.exp(-chi2 / 2));
}

// ---------- Single-user correlation analysis ----------
export function analyzeCorrelations(
  entries: DailyEntry[],
  factorLabels: Record<string, string>,
  maxLag: number = 7,
  // Some factors are "inverse" - low water, no exercise, skipped routine
  // The caller can specify which factors should be inverted
  invertedFactors: Set<string> = new Set()
): CorrelationResult[] {
  if (entries.length < 10) return []; // need minimum data

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const dateIndex: Record<string, DailyEntry> = {};
  for (const e of sorted) dateIndex[e.date] = e;

  const thresholds = computeThresholds(sorted);
  const factors = Object.keys(sorted[0]?.factors || {});
  const results: CorrelationResult[] = [];

  for (const factor of factors) {
    const lagEffects: { lag: number; effect: number; pValue: number }[] = [];
    let bestLag = 0;
    let bestAbsEffect = 0;
    let bestEffect = 0;
    let bestPValue = 1;
    let bestAvgWith = 0;
    let bestAvgWithout = 0;
    let bestDaysWith = 0;
    let bestDaysWithout = 0;
    let bestSevWith: number[] = [];
    let bestSevWithout: number[] = [];

    for (let lag = 0; lag <= maxLag; lag++) {
      const severitiesWith: number[] = [];
      const severitiesWithout: number[] = [];

      for (const entry of sorted) {
        const pastDate = new Date(entry.date);
        pastDate.setDate(pastDate.getDate() - lag);
        const pastDateStr = pastDate.toISOString().split('T')[0];
        const pastEntry = dateIndex[pastDateStr];

        if (!pastEntry) continue;

        const factorVal = pastEntry.factors[factor];
        const invert = invertedFactors.has(factor);

        if (isFactorPresent(factorVal, thresholds[factor], invert)) {
          severitiesWith.push(entry.skinSeverity);
        } else {
          severitiesWithout.push(entry.skinSeverity);
        }
      }

      if (severitiesWith.length < 3 || severitiesWithout.length < 3) {
        lagEffects.push({ lag, effect: 0, pValue: 1 });
        continue;
      }

      const avgWith = severitiesWith.reduce((a, b) => a + b, 0) / severitiesWith.length;
      const avgWithout = severitiesWithout.reduce((a, b) => a + b, 0) / severitiesWithout.length;
      const effect = Math.round((avgWith - avgWithout) * 100) / 100;

      const allSev = [...severitiesWith, ...severitiesWithout].sort((a, b) => a - b);
      const median = allSev[Math.floor(allSev.length / 2)];
      const a = severitiesWith.filter(s => s > median).length;
      const b = severitiesWith.filter(s => s <= median).length;
      const c = severitiesWithout.filter(s => s > median).length;
      const d = severitiesWithout.filter(s => s <= median).length;
      const pValue = chiSquaredPValue(a, b, c, d);

      lagEffects.push({ lag, effect, pValue });

      if (Math.abs(effect) > bestAbsEffect && pValue < 0.2) {
        bestAbsEffect = Math.abs(effect);
        bestEffect = effect;
        bestLag = lag;
        bestPValue = pValue;
        bestAvgWith = avgWith;
        bestAvgWithout = avgWithout;
        bestDaysWith = severitiesWith.length;
        bestDaysWithout = severitiesWithout.length;
        bestSevWith = [...severitiesWith];
        bestSevWithout = [...severitiesWithout];
      }
    }

    if (bestAbsEffect > 0.2) {
      // Cohen's d - standardized effect size
      const d = cohensD(bestSevWith, bestSevWithout);

      // Knowledge-enhanced confidence
      let confidence: 'high' | 'moderate' | 'low' = 'low';
      const evidence = getEvidenceStrength(factor);
      const expectedLag = getExpectedLagDays(factor);
      const lagMatchesScience = expectedLag
        ? bestLag >= expectedLag[0] && bestLag <= expectedLag[1]
        : false;

      if (bestPValue < 0.05 && bestDaysWith >= 7) confidence = 'high';
      else if (bestPValue < 0.1 && bestDaysWith >= 5) confidence = 'moderate';

      if (lagMatchesScience && (evidence === 'strong' || evidence === 'moderate')) {
        if (confidence === 'low') confidence = 'moderate';
        else if (confidence === 'moderate') confidence = 'high';
      }

      // Mechanism context
      const direction: 'trigger' | 'protective' = bestEffect > 0 ? 'trigger' : 'protective';
      const mechanism = generateMechanismInsight(factor, direction, bestLag);
      const foodProfile = FOOD_SKIN_PROFILES[factor];
      const lifestyleProfile = LIFESTYLE_SKIN_PROFILES[factor];
      const compounds = foodProfile?.acneRelevantCompounds || [];

      let recommendation: string | null = null;
      if (direction === 'trigger' && confidence !== 'low') {
        if (foodProfile) {
          recommendation = `Try eliminating ${(factorLabels[factor] || factor).toLowerCase()} for 2 weeks. Known mechanism: ${foodProfile.mechanism.split('.')[0]}.`;
        } else if (lifestyleProfile) {
          recommendation = `Improve ${lifestyleProfile.factor.toLowerCase()}. Pathway: ${lifestyleProfile.hormonalPathway.slice(0, 2).join(', ')}.`;
        }
      }

      results.push({
        factor,
        factorLabel: factorLabels[factor] || factor,
        bestLag,
        effectSize: bestEffect,
        avgWithFactor: Math.round(bestAvgWith * 100) / 100,
        avgWithoutFactor: Math.round(bestAvgWithout * 100) / 100,
        daysWithFactor: bestDaysWith,
        daysWithoutFactor: bestDaysWithout,
        pValue: bestPValue,
        pValueAdjusted: bestPValue, // will be corrected below
        cohensD: Math.round(Math.abs(d) * 100) / 100,
        confidence,
        reliabilityScore: 0, // will be computed below
        direction,
        lagEffects,
        mechanism,
        evidenceStrength: evidence,
        expectedLagRange: expectedLag || null,
        lagMatchesScience,
        compounds,
        recommendation,
      });
    }
  }

  // ----- FDR correction across all results -----
  if (results.length > 1) {
    const pVals = results.map(r => ({ factor: r.factor, pValue: r.pValue }));
    const adjusted = fdrCorrect(pVals);
    for (const r of results) {
      r.pValueAdjusted = adjusted[r.factor] ?? r.pValue;
    }
  }

  // ----- Compute reliability scores -----
  for (const r of results) {
    r.reliabilityScore = computeReliability(
      r.pValue, r.pValueAdjusted, r.cohensD,
      r.daysWithFactor, r.daysWithoutFactor,
      r.lagMatchesScience, r.evidenceStrength
    );
  }

  // Sort by reliability score (most trustworthy first)
  return results.sort((a, b) => b.reliabilityScore - a.reliabilityScore);
}

// ---------- Combination effect analysis ----------
// Looks for days where multiple triggers co-occurred and checks if skin was worse
export function detectCombinationEffects(
  entries: DailyEntry[],
  correlations: CorrelationResult[],
  invertedFactors: Set<string> = new Set()
): { combination: CombinationEffect; observedMultiplier: number; daysObserved: number }[] {
  if (entries.length < 14) return [];
  const triggerFactors = correlations.filter(c => c.direction === 'trigger').map(c => c.factor);
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const thresholds = computeThresholds(sorted);
  const results: { combination: CombinationEffect; observedMultiplier: number; daysObserved: number }[] = [];

  for (const combo of COMBINATION_EFFECTS) {
    // Only check combos where both factors are detected triggers for this user
    if (!combo.triggers.every(t => triggerFactors.includes(t) || invertedFactors.has(t))) continue;

    const daysWithBoth: number[] = [];
    const daysWithOne: number[] = [];
    const daysWithNeither: number[] = [];

    for (const entry of sorted) {
      const activeCount = combo.triggers.filter(t => {
        const val = entry.factors[t];
        const invert = invertedFactors.has(t);
        return isFactorPresent(val, thresholds[t], invert);
      }).length;

      if (activeCount === combo.triggers.length) {
        daysWithBoth.push(entry.skinSeverity);
      } else if (activeCount > 0) {
        daysWithOne.push(entry.skinSeverity);
      } else {
        daysWithNeither.push(entry.skinSeverity);
      }
    }

    if (daysWithBoth.length >= 3 && daysWithOne.length >= 3 && daysWithNeither.length >= 3) {
      const avgBoth = daysWithBoth.reduce((a, b) => a + b, 0) / daysWithBoth.length;
      const avgOne = daysWithOne.reduce((a, b) => a + b, 0) / daysWithOne.length;
      const avgNeither = daysWithNeither.reduce((a, b) => a + b, 0) / daysWithNeither.length;

      const singleEffect = avgOne - avgNeither;
      const combinedEffect = avgBoth - avgNeither;
      const observedMultiplier = singleEffect > 0 ? combinedEffect / singleEffect : 1;

      if (combinedEffect > singleEffect * 1.1) { // At least 10% amplification
        results.push({
          combination: combo,
          observedMultiplier: Math.round(observedMultiplier * 100) / 100,
          daysObserved: daysWithBoth.length,
        });
      }
    }
  }

  return results;
}

// ---------- Non-linear dose-response detection ----------
// For numeric factors (sleep, water, stress), checks if the relationship
// is non-linear. E.g., "moderate dairy is fine, but heavy dairy triggers acne"
// Uses tertile binning + Kruskal-Wallis style comparison.

export interface DoseResponseResult {
  factor: string;
  factorLabel: string;
  isNonLinear: boolean;
  tertiles: {
    label: string;
    range: string;
    avgSeverity: number;
    count: number;
  }[];
  threshold: number | null; // the value where the effect kicks in
  description: string;
}

export function detectDoseResponse(
  entries: DailyEntry[],
  factorLabels: Record<string, string>
): DoseResponseResult[] {
  if (entries.length < 21) return []; // need enough data for 3 bins

  const results: DoseResponseResult[] = [];
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  // Only check numeric factors
  const numericFactors = Object.keys(sorted[0]?.factors || {}).filter(k => {
    return typeof sorted[0].factors[k] === 'number';
  });

  for (const factor of numericFactors) {
    const values = sorted
      .map(e => ({ val: e.factors[factor] as number, sev: e.skinSeverity }))
      .filter(v => typeof v.val === 'number')
      .sort((a, b) => a.val - b.val);

    if (values.length < 15) continue;

    // Split into tertiles
    const t1End = Math.floor(values.length / 3);
    const t2End = Math.floor(2 * values.length / 3);

    const low = values.slice(0, t1End);
    const mid = values.slice(t1End, t2End);
    const high = values.slice(t2End);

    if (low.length < 3 || mid.length < 3 || high.length < 3) continue;

    const avgLow = low.reduce((s, v) => s + v.sev, 0) / low.length;
    const avgMid = mid.reduce((s, v) => s + v.sev, 0) / mid.length;
    const avgHigh = high.reduce((s, v) => s + v.sev, 0) / high.length;

    // Check for non-linearity: is mid closer to low or high?
    const linearExpected = (avgLow + avgHigh) / 2;
    const deviation = Math.abs(avgMid - linearExpected);
    const totalRange = Math.abs(avgHigh - avgLow);
    const isNonLinear = totalRange > 0.3 && deviation / totalRange > 0.25;

    // Determine threshold
    let threshold: number | null = null;
    let description = '';
    const label = factorLabels[factor] || factor;

    if (totalRange > 0.3) {
      if (avgHigh > avgLow + 0.5 && avgHigh > avgMid + 0.3) {
        // High values are worse
        threshold = high[0].val;
        description = `${label} above ${threshold} is associated with worse skin (${avgHigh.toFixed(1)}/10 vs ${avgLow.toFixed(1)}/10)`;
      } else if (avgLow > avgHigh + 0.5 && avgLow > avgMid + 0.3) {
        // Low values are worse (e.g., low water, low sleep)
        threshold = low[low.length - 1].val;
        description = `${label} below ${threshold} is associated with worse skin (${avgLow.toFixed(1)}/10 vs ${avgHigh.toFixed(1)}/10)`;
      } else if (isNonLinear) {
        description = `${label} has a non-linear relationship with skin - moderate levels show different effects than extremes`;
      }
    }

    if (totalRange > 0.3) {
      results.push({
        factor,
        factorLabel: label,
        isNonLinear,
        tertiles: [
          { label: 'Low', range: `${low[0].val}-${low[low.length - 1].val}`, avgSeverity: Math.round(avgLow * 10) / 10, count: low.length },
          { label: 'Medium', range: `${mid[0].val}-${mid[mid.length - 1].val}`, avgSeverity: Math.round(avgMid * 10) / 10, count: mid.length },
          { label: 'High', range: `${high[0].val}-${high[high.length - 1].val}`, avgSeverity: Math.round(avgHigh * 10) / 10, count: high.length },
        ],
        threshold,
        description,
      });
    }
  }

  return results.sort((a, b) => {
    const rangeA = Math.abs(a.tertiles[2].avgSeverity - a.tertiles[0].avgSeverity);
    const rangeB = Math.abs(b.tertiles[2].avgSeverity - b.tertiles[0].avgSeverity);
    return rangeB - rangeA;
  });
}

// ---------- Multi-user cohort analysis ----------
export function analyzeCohort(
  userDatasets: { userId: string; entries: DailyEntry[] }[],
  factorLabels: Record<string, string>,
  invertedFactors: Set<string> = new Set()
): CohortInsight[] {
  const factorResults: Record<string, { effects: number[]; lags: number[]; users: number }> = {};

  for (const { entries } of userDatasets) {
    const correlations = analyzeCorrelations(entries, factorLabels, 7, invertedFactors);

    for (const corr of correlations) {
      if (corr.direction === 'trigger' && corr.confidence !== 'low') {
        if (!factorResults[corr.factor]) {
          factorResults[corr.factor] = { effects: [], lags: [], users: 0 };
        }
        factorResults[corr.factor].effects.push(corr.effectSize);
        factorResults[corr.factor].lags.push(corr.bestLag);
        factorResults[corr.factor].users++;
      }
    }
  }

  const totalUsers = userDatasets.length;
  return Object.entries(factorResults)
    .map(([factor, data]) => ({
      factor,
      factorLabel: factorLabels[factor] || factor,
      affectedUsers: data.users,
      totalUsers,
      avgEffectSize: Math.round((data.effects.reduce((a, b) => a + b, 0) / data.effects.length) * 100) / 100,
      bestLag: Math.round(data.lags.reduce((a, b) => a + b, 0) / data.lags.length),
      consistency: Math.round((data.users / totalUsers) * 100),
    }))
    .sort((a, b) => b.affectedUsers - a.affectedUsers);
}
