'use client';

import { CorrelationResult } from '@/lib/correlationEngine';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, Clock, Zap, FlaskConical, CheckCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

// Actionable insight card: WHAT → WHY → FIX format
// No long paragraphs. Scannable. One card per insight.

interface Props {
  correlations: CorrelationResult[];
  onSelectFactor: (factor: string) => void;
}

export default function InsightCards({ correlations, onSelectFactor }: Props) {
  const triggers = correlations.filter(c => c.direction === 'trigger' && c.reliabilityScore >= 30);
  const protective = correlations.filter(c => c.direction === 'protective');

  if (triggers.length === 0 && protective.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-2xl border border-border">
        <FlaskConical size={28} className="mx-auto mb-3 text-muted opacity-40" />
        <p className="text-sm font-medium">No patterns detected yet</p>
        <p className="text-xs text-muted mt-1 max-w-xs mx-auto">
          Keep logging consistently. The engine needs 14+ days with enough variation to find patterns.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {triggers.map((t, i) => (
        <TriggerInsightCard key={t.factor} result={t} rank={i + 1} onClick={() => onSelectFactor(t.factor)} />
      ))}
      {protective.length > 0 && (
        <div className="pt-2">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2 px-1">
            Working in your favor
          </p>
          {protective.slice(0, 3).map((p) => (
            <ProtectiveCard key={p.factor} result={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function TriggerInsightCard({ result, rank, onClick }: { result: CorrelationResult; rank: number; onClick: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const lagText = result.bestLag === 0 ? 'same day' :
    result.bestLag === 1 ? '1 day' : `${result.bestLag} days`;

  // Reliability color
  const relColor = result.reliabilityScore >= 70 ? 'text-red-600 bg-red-50 border-red-100' :
    result.reliabilityScore >= 45 ? 'text-amber-600 bg-amber-50 border-amber-100' :
    'text-gray-500 bg-gray-50 border-gray-100';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.06 }}
      className="bg-white rounded-2xl border border-red-100 overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Main card - always visible */}
      <div className="p-4 cursor-pointer" onClick={onClick}>
        {/* WHAT - the finding */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-sm font-bold text-red-600 flex-shrink-0">
            {rank}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold">{result.factorLabel}</h3>
              {result.lagMatchesScience && (
                <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                  <CheckCircle size={9} /> research-backed
                </span>
              )}
            </div>
            <p className="text-sm text-foreground mt-1">
              <span className="font-bold text-red-600">+{result.effectSize.toFixed(1)}</span> severity points,{' '}
              <span className="font-medium">{lagText}</span> after exposure
            </p>
          </div>
          <div className={`px-2 py-1 rounded-lg border text-xs font-bold ${relColor}`}>
            {result.reliabilityScore}%
          </div>
        </div>

        {/* WHY - one-liner mechanism */}
        {result.mechanism && (
          <p className="text-xs text-muted mb-3 pl-11 leading-relaxed line-clamp-2">
            {result.mechanism}
          </p>
        )}

        {/* FIX - actionable recommendation */}
        {result.recommendation && (
          <div className="flex items-start gap-2 pl-11 p-2.5 bg-emerald-50/50 rounded-xl">
            <Zap size={13} className="text-emerald-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-emerald-800 leading-relaxed">{result.recommendation}</p>
          </div>
        )}
      </div>

      {/* Expand for stats */}
      <button
        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
        className="w-full px-4 py-2 border-t border-red-50 text-xs text-muted flex items-center justify-center gap-1 hover:bg-red-50/30"
      >
        <span>Stats & evidence</span>
        <ChevronDown size={12} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="px-4 pb-4 border-t border-red-50"
        >
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            <StatPill label="Avg with" value={`${result.avgWithFactor.toFixed(1)}/10`} />
            <StatPill label="Avg without" value={`${result.avgWithoutFactor.toFixed(1)}/10`} />
            <StatPill label="p-value" value={result.pValue.toFixed(3)} />
            <StatPill label="p-adjusted (FDR)" value={result.pValueAdjusted.toFixed(3)} />
            <StatPill label="Cohen's d" value={result.cohensD.toFixed(2)} />
            <StatPill label="Sample" value={`${result.daysWithFactor} + ${result.daysWithoutFactor}d`} />
          </div>
          {result.evidenceStrength && (
            <div className="flex items-center gap-1.5 mt-3 text-xs text-violet-600">
              <FlaskConical size={11} />
              <span>Literature evidence: <strong>{result.evidenceStrength}</strong></span>
              {result.expectedLagRange && (
                <span className="text-muted ml-1">
                  (expected lag: {result.expectedLagRange[0]}-{result.expectedLagRange[1]}d)
                </span>
              )}
            </div>
          )}
          {result.compounds.length > 0 && (
            <p className="text-xs text-muted mt-2">
              Compounds: {result.compounds.slice(0, 3).join(', ')}
            </p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

function ProtectiveCard({ result }: { result: CorrelationResult }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-emerald-50/30 rounded-xl border border-emerald-100 mb-2">
      <Shield size={16} className="text-emerald-500 flex-shrink-0" />
      <div className="flex-1">
        <span className="text-sm font-medium">{result.factorLabel}</span>
      </div>
      <span className="text-sm font-bold text-emerald-600">{result.effectSize.toFixed(1)}</span>
      <span className="text-xs text-muted">pts better</span>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background rounded-lg px-2.5 py-1.5">
      <span className="text-muted">{label}: </span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
