'use client';

import { CorrelationResult } from '@/lib/correlationEngine';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

interface Props {
  result: CorrelationResult;
}

export default function LagChart({ result }: Props) {
  const data = result.lagEffects.map(le => ({
    name: le.lag === 0 ? 'Same day' : `+${le.lag}d`,
    effect: le.effect,
    isBest: le.lag === result.bestLag,
    significant: le.pValue < 0.1,
  }));

  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <div className="mb-4">
        <h3 className="font-semibold text-sm">Time-Lag Analysis: {result.factorLabel}</h3>
        <p className="text-xs text-muted mt-1">
          How skin severity changes at different time delays after exposure
        </p>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#78716c' }}
            axisLine={{ stroke: '#e7e5e4' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#78716c' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1)}`}
          />
          <ReferenceLine y={0} stroke="#e7e5e4" />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload;
              return (
                <div className="bg-white border border-border rounded-lg shadow-lg px-3 py-2 text-xs">
                  <p className="font-medium">{d.name}</p>
                  <p className={d.effect > 0 ? 'text-red-600' : 'text-emerald-600'}>
                    Effect: {d.effect > 0 ? '+' : ''}{d.effect.toFixed(2)} pts
                  </p>
                  {d.isBest && <p className="text-primary font-medium mt-1">Strongest correlation</p>}
                </div>
              );
            }}
          />
          <Bar dataKey="effect" radius={[6, 6, 0, 0]} maxBarSize={40}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.isBest
                  ? (entry.effect > 0 ? '#ef4444' : '#059669')
                  : (entry.effect > 0 ? '#fecaca' : '#d1fae5')
                }
                stroke={entry.isBest ? (entry.effect > 0 ? '#dc2626' : '#047857') : 'transparent'}
                strokeWidth={2}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-4 mt-3 text-xs text-muted">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span>Peak trigger</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-200" />
          <span>Mild effect</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-emerald-200" />
          <span>Protective</span>
        </div>
      </div>
    </div>
  );
}
