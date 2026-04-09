'use client';

import { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { loadUsers, loadEntries, UserInfo, FACTOR_LABELS, INVERTED_FACTORS } from '@/lib/dataStore';
import { analyzeCorrelations, analyzeCohort, detectCombinationEffects, detectDoseResponse, assessDataQuality, CorrelationResult, DailyEntry, DataQualityReport, DoseResponseResult } from '@/lib/correlationEngine';
import UserSelector from '@/components/UserSelector';
import TimelineChart from '@/components/TimelineChart';
import LagChart from '@/components/LagChart';
import CohortHeatmap from '@/components/CohortHeatmap';
import InsightCards from '@/components/InsightCards';
import DailyLogger from '@/components/DailyLogger';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Users, BarChart3, Sparkles, ArrowLeft, FlaskConical,
  TrendingDown, Calendar, PlusCircle, Shield, AlertTriangle, ChevronRight, Zap, Database
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

type ViewMode = 'insights' | 'cohort' | 'log';

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialMode = searchParams.get('mode') === 'log' ? 'log' : 'insights';

  const [users, setUsers] = useState<UserInfo[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(initialMode);
  const [selectedFactor, setSelectedFactor] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const u = loadUsers();
    setUsers(u);
    if (u.length > 0 && !selectedUserId) setSelectedUserId(u[0].id);
  }, []);

  const entries = useMemo(() => {
    if (!selectedUserId) return [];
    return loadEntries(selectedUserId);
  }, [selectedUserId, refreshKey]);

  const detectedLabels = useMemo(() => {
    if (entries.length === 0) return FACTOR_LABELS;
    const keys = Object.keys(entries[0].factors);
    const labels: Record<string, string> = {};
    for (const k of keys) labels[k] = FACTOR_LABELS[k] || k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return labels;
  }, [entries]);

  const correlations = useMemo(() => {
    if (entries.length < 10) return [];
    return analyzeCorrelations(entries, detectedLabels, 7, INVERTED_FACTORS);
  }, [entries, detectedLabels]);

  const dataQuality = useMemo(() => assessDataQuality(entries), [entries]);
  const selectedCorrelation = correlations.find(c => c.factor === selectedFactor);
  const selectedUser = users.find(u => u.id === selectedUserId);
  const triggers = correlations.filter(c => c.direction === 'trigger' && c.reliabilityScore >= 30);
  const protective = correlations.filter(c => c.direction === 'protective');

  const comboEffects = useMemo(() => {
    if (entries.length < 14 || correlations.length < 2) return [];
    return detectCombinationEffects(entries, correlations, INVERTED_FACTORS);
  }, [entries, correlations]);

  const doseResponses = useMemo(() => {
    if (entries.length < 21) return [];
    return detectDoseResponse(entries, detectedLabels);
  }, [entries, detectedLabels]);

  const cohortInsights = useMemo(() => {
    if (viewMode !== 'cohort' || users.length === 0) return [];
    const datasets = users.map(u => ({ userId: u.id, entries: loadEntries(u.id) }));
    return analyzeCohort(datasets, detectedLabels, INVERTED_FACTORS);
  }, [viewMode, users, detectedLabels, refreshKey]);

  // Skin score trend
  const weekTrend = useMemo(() => {
    if (entries.length < 14) return null;
    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
    const first = sorted.slice(0, 7).reduce((s, l) => s + l.skinSeverity, 0) / 7;
    const last = sorted.slice(-7).reduce((s, l) => s + l.skinSeverity, 0) / 7;
    return Math.round((last - first) * 10) / 10;
  }, [entries]);

  const avgSeverity = entries.length > 0
    ? (entries.reduce((s, l) => s + l.skinSeverity, 0) / entries.length).toFixed(1) : '-';

  const handleLogSaved = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => { setSelectedFactor(null); }, [selectedUserId]);

  if (users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted mb-4">No data loaded.</p>
          <Link href="/" className="text-sm text-primary font-medium hover:underline">Go back</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 hover:opacity-80">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <FlaskConical size={16} className="text-white" />
              </div>
              <span className="text-base font-bold tracking-tight">Neothera Insights</span>
            </Link>

            <div className="flex items-center gap-2">
              <div className="flex bg-background rounded-xl p-0.5 border border-border text-sm">
                {[
                  { key: 'insights' as const, label: 'Insights', icon: <Sparkles size={14} /> },
                  ...(users.length > 1 ? [{ key: 'cohort' as const, label: 'Cohort', icon: <Users size={14} /> }] : []),
                  { key: 'log' as const, label: 'Log', icon: <PlusCircle size={14} /> },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => { setViewMode(tab.key); setSelectedFactor(null); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                      viewMode === tab.key ? 'bg-white shadow-sm text-foreground' : 'text-muted hover:text-foreground'
                    }`}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
              <UserSelector
                users={users.map(u => ({ ...u }))}
                selectedUserId={selectedUserId}
                onSelect={setSelectedUserId}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <AnimatePresence mode="wait">

          {/* ==================== INSIGHTS VIEW ==================== */}
          {viewMode === 'insights' && (
            <motion.div key="insights" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              {entries.length === 0 ? (
                <EmptyState onLog={() => setViewMode('log')} />
              ) : (
                <>
                  {/* Top: Score + Quick Stats */}
                  <div className="grid grid-cols-12 gap-4 mb-6">
                    {/* Skin Score */}
                    <div className="col-span-12 sm:col-span-4 bg-white rounded-2xl border border-border p-5 flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold ${
                        parseFloat(avgSeverity) > 5 ? 'bg-red-50 text-red-600' :
                        parseFloat(avgSeverity) > 3 ? 'bg-amber-50 text-amber-600' :
                        'bg-emerald-50 text-emerald-600'
                      }`}>
                        {avgSeverity}
                      </div>
                      <div>
                        <p className="text-xs text-muted font-medium">Avg Skin Score</p>
                        <p className="text-sm font-medium">
                          {parseFloat(avgSeverity) > 5 ? 'Needs attention' :
                           parseFloat(avgSeverity) > 3 ? 'Moderate' : 'Looking good'}
                        </p>
                        {weekTrend !== null && (
                          <p className={`text-xs font-medium mt-0.5 ${weekTrend < 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {weekTrend < 0 ? 'Improving' : 'Worsening'} ({weekTrend > 0 ? '+' : ''}{weekTrend} from week 1)
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quick stats */}
                    <div className="col-span-4 sm:col-span-2 bg-white rounded-2xl border border-border p-4 text-center">
                      <p className="text-2xl font-bold text-red-600">{triggers.length}</p>
                      <p className="text-xs text-muted mt-0.5">Triggers</p>
                    </div>
                    <div className="col-span-4 sm:col-span-2 bg-white rounded-2xl border border-border p-4 text-center">
                      <p className="text-2xl font-bold text-emerald-600">{protective.length}</p>
                      <p className="text-xs text-muted mt-0.5">Protective</p>
                    </div>
                    <div className="col-span-4 sm:col-span-2 bg-white rounded-2xl border border-border p-4 text-center">
                      <p className="text-2xl font-bold">{entries.length}</p>
                      <p className="text-xs text-muted mt-0.5">Days Logged</p>
                    </div>
                    <div className="col-span-12 sm:col-span-2 bg-white rounded-2xl border border-border p-4 text-center">
                      <p className={`text-2xl font-bold ${dataQuality.overallScore >= 60 ? 'text-emerald-600' : dataQuality.overallScore >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                        {dataQuality.overallScore}
                      </p>
                      <p className="text-xs text-muted mt-0.5">Data Quality</p>
                    </div>
                  </div>

                  {/* Data quality issues/strengths */}
                  {(dataQuality.issues.length > 0 || dataQuality.strengths.length > 0) && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {dataQuality.strengths.map((s, i) => (
                        <span key={`s${i}`} className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
                          {s}
                        </span>
                      ))}
                      {dataQuality.issues.map((s, i) => (
                        <span key={`i${i}`} className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Main content */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Insight cards */}
                    <div className="lg:col-span-5">
                      {selectedFactor && selectedCorrelation ? (
                        <div>
                          <button
                            onClick={() => setSelectedFactor(null)}
                            className="flex items-center gap-1.5 text-sm text-muted hover:text-primary mb-4"
                          >
                            <ArrowLeft size={14} /> All patterns
                          </button>
                          <LagChart result={selectedCorrelation} />
                        </div>
                      ) : (
                        <InsightCards
                          correlations={correlations}
                          onSelectFactor={setSelectedFactor}
                        />
                      )}
                    </div>

                    {/* Right: Timeline + Combos */}
                    <div className="lg:col-span-7 space-y-4">
                      <TimelineChart
                        entries={entries}
                        highlightFactor={selectedFactor || undefined}
                        highlightLag={selectedCorrelation?.bestLag}
                        factorLabel={selectedCorrelation?.factorLabel}
                      />

                      {/* Combination Effects */}
                      {comboEffects.length > 0 && (
                        <div className="bg-white rounded-2xl border border-amber-100 p-5">
                          <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                            <Zap size={14} className="text-amber-500" />
                            Amplifying Combinations
                          </h3>
                          <p className="text-xs text-muted mb-3">
                            These factors are worse together than separately:
                          </p>
                          <div className="space-y-2">
                            {comboEffects.map((ce, i) => (
                              <div key={i} className="flex items-center gap-3 p-3 bg-amber-50/30 rounded-xl text-sm">
                                <span className="font-bold text-amber-600">{ce.observedMultiplier.toFixed(1)}x</span>
                                <span className="font-medium">{ce.combination.labels.join(' + ')}</span>
                                <span className="text-xs text-muted ml-auto">{ce.daysObserved}d observed</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Dose-Response Thresholds */}
                      {doseResponses.length > 0 && (
                        <div className="bg-white rounded-2xl border border-violet-100 p-5">
                          <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                            <BarChart3 size={14} className="text-violet-500" />
                            Dose Thresholds
                          </h3>
                          <p className="text-xs text-muted mb-3">
                            How much matters - not just whether you did it:
                          </p>
                          <div className="space-y-3">
                            {doseResponses.slice(0, 4).map((dr) => (
                              <div key={dr.factor} className="p-3 bg-violet-50/30 rounded-xl">
                                <p className="text-sm font-medium mb-2">{dr.factorLabel}</p>
                                <div className="flex gap-1">
                                  {dr.tertiles.map((t) => (
                                    <div key={t.label} className={`flex-1 rounded-lg p-2 text-center text-xs ${
                                      t.avgSeverity === Math.max(...dr.tertiles.map(x => x.avgSeverity))
                                        ? 'bg-red-100 text-red-700' :
                                      t.avgSeverity === Math.min(...dr.tertiles.map(x => x.avgSeverity))
                                        ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                      <div className="font-bold">{t.avgSeverity}</div>
                                      <div className="text-[10px] mt-0.5">{t.label} ({t.range})</div>
                                    </div>
                                  ))}
                                </div>
                                {dr.description && (
                                  <p className="text-xs text-muted mt-2">{dr.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ==================== COHORT VIEW ==================== */}
          {viewMode === 'cohort' && (
            <motion.div key="cohort" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <Stat label="Participants" value={String(users.length)} icon={<Users size={16} className="text-violet-500" />} />
                <Stat label="Total Entries" value={String(users.reduce((s, u) => s + loadEntries(u.id).length, 0))} icon={<Database size={16} className="text-primary" />} />
                <Stat label="Factors" value={String(Object.keys(detectedLabels).length)} icon={<BarChart3 size={16} className="text-amber-500" />} />
                <Stat label="Lag Window" value="0-7d" icon={<Calendar size={16} className="text-primary" />} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CohortHeatmap insights={cohortInsights} />
                <div className="bg-white rounded-2xl border border-border p-6">
                  <h3 className="font-semibold mb-4">Key Findings</h3>
                  <div className="space-y-3">
                    {cohortInsights.slice(0, 8).map((ci, i) => (
                      <motion.div key={ci.factor} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-3 bg-background rounded-xl">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{ci.factorLabel}</span>
                          <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded-full font-medium">{ci.consistency}%</span>
                        </div>
                        <p className="text-xs text-muted">
                          {ci.affectedUsers}/{ci.totalUsers} users, +{ci.avgEffectSize.toFixed(1)} pts, ~{ci.bestLag}d lag
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ==================== LOG VIEW ==================== */}
          {viewMode === 'log' && (
            <motion.div key="log" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DailyLogger userId={selectedUserId} onSaved={handleLogSaved} />
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-border p-5">
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-3xl font-bold text-primary">{entries.length}</span>
                      <span className="text-sm text-muted">days logged</span>
                    </div>
                    <div className="w-full bg-background rounded-full h-2.5 mb-2">
                      <div className="bg-primary rounded-full h-2.5 transition-all" style={{ width: `${Math.min(100, (entries.length / 56) * 100)}%` }} />
                    </div>
                    <p className="text-xs text-muted">{entries.length}/56 days (8 weeks)</p>
                    {entries.length >= 14 && (
                      <button onClick={() => setViewMode('insights')} className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark">
                        <Sparkles size={14} /> View Insights <ChevronRight size={14} />
                      </button>
                    )}
                    {entries.length > 0 && entries.length < 14 && (
                      <p className="mt-3 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                        {14 - entries.length} more days until pattern detection activates
                      </p>
                    )}
                  </div>
                  {entries.length > 0 && (
                    <div className="bg-white rounded-2xl border border-border p-5">
                      <h3 className="font-semibold text-sm mb-3">Recent</h3>
                      <div className="space-y-1.5 max-h-52 overflow-y-auto">
                        {[...entries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8).map(e => (
                          <div key={e.date} className="flex items-center justify-between p-2.5 bg-background rounded-lg text-sm">
                            <span className="text-xs font-medium">{new Date(e.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                            <span className={`text-xs font-bold ${e.skinSeverity > 5 ? 'text-red-600' : e.skinSeverity > 3 ? 'text-amber-600' : 'text-emerald-600'}`}>
                              {e.skinSeverity}/10
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function EmptyState({ onLog }: { onLog: () => void }) {
  return (
    <div className="text-center py-20 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
        <Sparkles size={28} className="text-primary" />
      </div>
      <h2 className="text-xl font-bold mb-2">Start logging to see patterns</h2>
      <p className="text-sm text-muted mb-6">
        Log what you eat, your habits, and your skin daily. After 14 days, the engine will
        start finding connections between your diet and skin changes.
      </p>
      <button onClick={onLog} className="px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark">
        Log Your First Day
      </button>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3">
      {icon}
      <div>
        <p className="text-lg font-bold">{value}</p>
        <p className="text-xs text-muted">{label}</p>
      </div>
    </div>
  );
}
