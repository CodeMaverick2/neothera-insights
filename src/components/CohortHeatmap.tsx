'use client';

import { CohortInsight } from '@/lib/correlationEngine';
import { motion } from 'framer-motion';
import { Users, TrendingUp } from 'lucide-react';

interface Props {
  insights: CohortInsight[];
}

export default function CohortHeatmap({ insights }: Props) {
  const maxAffected = Math.max(...insights.map(i => i.affectedUsers), 1);

  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
          <Users size={20} className="text-violet-600" />
        </div>
        <div>
          <h3 className="font-semibold">Population Trigger Map</h3>
          <p className="text-xs text-muted">How many participants are affected by each trigger</p>
        </div>
      </div>

      <div className="space-y-3">
        {insights.slice(0, 10).map((insight, i) => {
          const pct = (insight.affectedUsers / insight.totalUsers) * 100;
          const barWidth = (insight.affectedUsers / maxAffected) * 100;

          return (
            <motion.div
              key={insight.factor}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{insight.factorLabel}</span>
                  <span className="text-xs text-muted">
                    ~{insight.bestLag}d lag
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-muted">
                    {insight.affectedUsers}/{insight.totalUsers} users
                  </span>
                  <span className="font-medium text-red-600 flex items-center gap-1">
                    <TrendingUp size={11} />
                    +{insight.avgEffectSize.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="h-7 bg-gray-50 rounded-lg overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ delay: i * 0.06 + 0.2, duration: 0.5, ease: 'easeOut' }}
                  className="h-full rounded-lg relative"
                  style={{
                    background: `linear-gradient(90deg,
                      ${pct > 30 ? '#ef4444' : pct > 20 ? '#f59e0b' : '#a3a3a3'}22,
                      ${pct > 30 ? '#ef4444' : pct > 20 ? '#f59e0b' : '#a3a3a3'}44
                    )`,
                    borderLeft: `3px solid ${pct > 30 ? '#ef4444' : pct > 20 ? '#f59e0b' : '#a3a3a3'}`,
                  }}
                >
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold" style={{
                    color: pct > 30 ? '#dc2626' : pct > 20 ? '#d97706' : '#737373',
                  }}>
                    {pct.toFixed(0)}%
                  </span>
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center gap-6 text-xs text-muted">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1.5 rounded-full bg-red-400" />
            <span>&gt;30% affected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1.5 rounded-full bg-amber-400" />
            <span>20-30% affected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1.5 rounded-full bg-gray-400" />
            <span>&lt;20% affected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
