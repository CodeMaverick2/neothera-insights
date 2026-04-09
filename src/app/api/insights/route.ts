import { NextRequest, NextResponse } from 'next/server';
import {
  FOOD_SKIN_PROFILES,
  LIFESTYLE_SKIN_PROFILES,
  getNutrientRecommendations,
  NUTRIENT_SKIN_PROFILES,
} from '@/lib/skinKnowledgeBase';

export async function POST(req: NextRequest) {
  const { correlations, userName, userProfile, entryCount, combinationEffects } = await req.json();

  const triggers = correlations.filter((c: { direction: string; confidence: string }) =>
    c.direction === 'trigger' && c.confidence !== 'low'
  );
  const protective = correlations.filter((c: { direction: string }) =>
    c.direction === 'protective'
  );

  const insight = generateInsight(triggers, protective, userName, userProfile, entryCount, combinationEffects || []);
  return NextResponse.json({ insight });
}

function generateInsight(
  triggers: Array<{
    factorLabel: string; factor: string; effectSize: number; bestLag: number;
    confidence: string; daysWithFactor: number; daysWithoutFactor: number;
    avgWithFactor: number; avgWithoutFactor: number; pValue: number;
    mechanism: string | null; evidenceStrength: string | null;
    lagMatchesScience: boolean; compounds: string[]; recommendation: string | null;
  }>,
  protective: Array<{ factorLabel: string; factor: string; effectSize: number; mechanism: string | null }>,
  userName: string,
  userProfile: { age?: number; skinType?: string },
  entryCount: number,
  combinationEffects: Array<{
    combination: { labels: string[]; mechanism: string; multiplier: number };
    observedMultiplier: number;
    daysObserved: number;
  }>
): string {
  let text = '';

  text += `**Personalized Skin Pattern Report - ${userName}**\n\n`;
  text += `Based on **${entryCount} daily log entries**`;
  if (userProfile?.skinType) text += ` | ${userProfile.skinType} skin`;
  text += `\n\n`;
  text += `The engine analyzed every tracked factor at 8 different time delays (0-7 days), `;
  text += `cross-referenced with dermatological research, and scored using chi-squared significance testing.\n\n`;

  // ---------- TRIGGERS ----------
  if (triggers.length > 0) {
    text += `---\n\n**TRIGGERS IDENTIFIED (${triggers.length})**\n\n`;

    for (let i = 0; i < triggers.length; i++) {
      const t = triggers[i];
      const lagText = t.bestLag === 0 ? 'same day' :
        t.bestLag === 1 ? '~24 hours' : `~${t.bestLag} days`;
      const confLabel = t.confidence === 'high' ? 'HIGH' : 'MODERATE';

      // Science match indicator
      const sciMatch = t.lagMatchesScience
        ? ' - matches known biological timeline'
        : '';

      // Evidence badge
      const evBadge = t.evidenceStrength
        ? ` [Scientific evidence: ${t.evidenceStrength}]`
        : '';

      text += `**${i + 1}. ${t.factorLabel}** - ${confLabel} confidence${evBadge}\n\n`;

      // Statistical finding
      text += `Your skin severity averages **${t.avgWithFactor.toFixed(1)}/10** after exposure `;
      text += `vs **${t.avgWithoutFactor.toFixed(1)}/10** otherwise = **+${t.effectSize.toFixed(1)} points** increase. `;
      text += `Peak effect at **${lagText}**${sciMatch}. `;
      text += `(p=${t.pValue.toFixed(3)}, observed on ${t.daysWithFactor} days)\n\n`;

      // Mechanism from knowledge base
      if (t.mechanism) {
        text += `**Why this happens:** ${t.mechanism}\n\n`;
      }

      // Key compounds
      if (t.compounds && t.compounds.length > 0) {
        text += `**Key compounds involved:** ${t.compounds.slice(0, 3).join(', ')}\n\n`;
      }

      // Recommendation
      if (t.recommendation) {
        text += `**What to do:** ${t.recommendation}\n\n`;
      }
    }
  } else {
    text += `**No strong triggers detected.** This could mean:\n`;
    text += `- Your tracked factors don't strongly drive your acne\n`;
    text += `- More data is needed (30+ days gives much better detection)\n`;
    text += `- Your triggers may be hormonal or environmental (not currently tracked)\n\n`;
  }

  // ---------- COMBINATION EFFECTS ----------
  if (combinationEffects.length > 0) {
    text += `---\n\n**COMBINATION EFFECTS DETECTED**\n\n`;
    text += `These factor pairs are worse together than the sum of their individual effects:\n\n`;

    for (const ce of combinationEffects) {
      text += `**${ce.combination.labels.join(' + ')}** - `;
      text += `**${ce.observedMultiplier.toFixed(1)}x** amplification `;
      text += `(expected: ${ce.combination.multiplier}x from research). `;
      text += `Observed on ${ce.daysObserved} days.\n`;
      text += `*${ce.combination.mechanism.split('.')[0]}.*\n\n`;
    }
  }

  // ---------- PROTECTIVE FACTORS ----------
  if (protective.length > 0) {
    text += `---\n\n**PROTECTIVE FACTORS (keep doing these!)**\n\n`;
    for (const p of protective.slice(0, 4)) {
      text += `**${p.factorLabel}** - **${Math.abs(p.effectSize).toFixed(1)} point** improvement. `;
      if (p.mechanism) text += `${p.mechanism}`;
      text += `\n\n`;
    }
  }

  // ---------- NUTRIENT RECOMMENDATIONS ----------
  const avgSeverity = triggers.length > 0
    ? triggers.reduce((s, t) => s + t.avgWithFactor, 0) / triggers.length
    : 3;
  const nutrientRecs = getNutrientRecommendations(
    triggers.map(t => t.factor),
    avgSeverity
  );

  if (nutrientRecs.length > 0) {
    text += `---\n\n**NUTRIENT RECOMMENDATIONS**\n\n`;
    text += `Based on your trigger profile and severity, consider these supplements (discuss with your dermatologist):\n\n`;
    for (const nr of nutrientRecs) {
      const profile = NUTRIENT_SKIN_PROFILES[nr.nutrient];
      text += `**${profile?.nutrient || nr.nutrient}** - ${nr.rationale}`;
      if (profile?.optimalIntake) text += ` Suggested intake: ${profile.optimalIntake}`;
      text += `\n\n`;
    }
  }

  // ---------- PROJECTED IMPROVEMENT ----------
  if (triggers.length > 0) {
    const topTriggers = triggers.slice(0, 2);
    const potentialImprovement = topTriggers.reduce((s, t) => s + t.effectSize, 0) * 0.65;
    text += `---\n\n**PROJECTED IMPROVEMENT**\n\n`;
    text += `If you address your top ${topTriggers.length} trigger${topTriggers.length > 1 ? 's' : ''} `;
    text += `(${topTriggers.map(t => t.factorLabel).join(' and ')}), `;
    text += `your skin severity could improve by an estimated **~${potentialImprovement.toFixed(1)} points** `;
    text += `(conservative estimate at 65% effectiveness).\n\n`;
  }

  text += `---\n\n`;
  text += `*These are correlations from YOUR data, validated against peer-reviewed dermatological research. `;
  text += `Discuss findings with your Neothera dermatologist before making major changes. `;
  text += `Pattern accuracy improves with more consistent logging.*`;

  return text;
}
