'use client';

import { DailyEntry } from '@/lib/correlationEngine';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, ReferenceDot } from 'recharts';
import { format, parseISO } from 'date-fns';

interface Props {
  entries: DailyEntry[];
  highlightFactor?: string;
  highlightLag?: number;
  factorLabel?: string;
}

export default function TimelineChart({ entries, highlightFactor, highlightLag = 0, factorLabel }: Props) {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  const data = sorted.map(entry => ({
    date: entry.date,
    dateLabel: format(parseISO(entry.date), 'MMM d'),
    severity: entry.skinSeverity,
    breakouts: entry.newBreakouts,
    factorPresent: highlightFactor ? isTruthy(entry.factors[highlightFactor]) : false,
  }));

  // Mark trigger effect days
  const triggerEffectDays = new Set<string>();
  if (highlightFactor && highlightLag >= 0) {
    for (const entry of sorted) {
      if (isTruthy(entry.factors[highlightFactor])) {
        const effectDate = new Date(entry.date);
        effectDate.setDate(effectDate.getDate() + highlightLag);
        triggerEffectDays.add(effectDate.toISOString().split('T')[0]);
      }
    }
  }

  const enrichedData = data.map(d => ({
    ...d,
    triggerEffect: triggerEffectDays.has(d.date),
  }));

  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm">Skin Severity Timeline</h3>
          <p className="text-xs text-muted mt-0.5">
            {highlightFactor && factorLabel
              ? `Highlighting ${factorLabel} impact (${highlightLag}d lag)`
              : `${entries.length} days of data`}
          </p>
        </div>
        {highlightFactor && (
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-muted">Factor consumed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span className="text-muted">Effect day</span>
            </div>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={enrichedData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="severityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#059669" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="dateLabel"
            tick={{ fontSize: 10, fill: '#78716c' }}
            axisLine={{ stroke: '#e7e5e4' }}
            tickLine={false}
            interval={Math.max(0, Math.floor(enrichedData.length / 8))}
          />
          <YAxis
            domain={[0, 10]}
            tick={{ fontSize: 11, fill: '#78716c' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload;
              return (
                <div className="bg-white border border-border rounded-lg shadow-lg px-3 py-2 text-xs">
                  <p className="font-medium">{format(parseISO(d.date), 'EEE, MMM d')}</p>
                  <p>Severity: <strong>{d.severity}</strong>/10</p>
                  <p>Breakouts: <strong>{d.breakouts}</strong></p>
                  {d.factorPresent && factorLabel && (
                    <p className="text-amber-600 mt-1">{factorLabel} consumed</p>
                  )}
                  {d.triggerEffect && (
                    <p className="text-red-600 mt-1">Expected trigger effect</p>
                  )}
                </div>
              );
            }}
          />
          <Area type="monotone" dataKey="severity" fill="url(#severityGrad)" stroke="none" />
          <Line type="monotone" dataKey="severity" stroke="#059669" strokeWidth={2} dot={false} activeDot={{ r: 5, fill: '#059669' }} />
          {enrichedData.filter(d => d.triggerEffect).map((d, i) => (
            <ReferenceDot key={i} x={d.dateLabel} y={d.severity} r={5} fill="#ef4444" stroke="#fff" strokeWidth={2} />
          ))}
          {enrichedData.filter(d => d.factorPresent).map((d, i) => (
            <ReferenceDot key={`f-${i}`} x={d.dateLabel} y={0.3} r={3} fill="#f59e0b" stroke="none" />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function isTruthy(val: boolean | number | undefined): boolean {
  if (val === undefined) return false;
  if (typeof val === 'boolean') return val;
  return val > 0;
}
