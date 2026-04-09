'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical, Upload, ArrowRight, ChevronRight, Sparkles, Clock,
  AlertTriangle, Shield, X, Beaker, Zap, BarChart3,
  Play, Milk, Flame, Moon, Droplets, ChevronLeft, ExternalLink
} from 'lucide-react';
import { parseCSV, generateDemoData, saveUsers, saveEntries, clearAllData, FACTOR_LABELS, INVERTED_FACTORS } from '@/lib/dataStore';
import { analyzeCorrelations, assessDataQuality, detectCombinationEffects, detectDoseResponse, CorrelationResult, DataQualityReport } from '@/lib/correlationEngine';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCSV, setShowCSV] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  function startManual() {
    setLoading('manual');
    clearAllData();
    saveUsers([{ id: 'me', name: 'My Data', startDate: new Date().toISOString().split('T')[0] }]);
    router.push('/dashboard?mode=log');
  }

  async function uploadCSV(file: File) {
    setLoading('csv'); setError(null);
    try {
      const text = await file.text();
      const { users, entriesByUser } = parseCSV(text);
      if (users.length === 0) throw new Error('No valid data found');
      clearAllData(); saveUsers(users);
      for (const [userId, entries] of Object.entries(entriesByUser)) saveEntries(userId, entries);
      router.push('/dashboard');
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed to parse'); setLoading(null); }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[#FAFAF8]/80 backdrop-blur-lg border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
              <FlaskConical size={15} className="text-white" />
            </div>
            <span className="font-bold text-[15px] tracking-tight">Neothera Insights</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setShowDemo(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors font-medium">
              <Play size={13} /> Demo
            </button>
            <button onClick={() => setShowCSV(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors font-medium">
              <Upload size={13} /> Upload CSV
            </button>
            <button onClick={startManual}
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors font-medium">
              <BarChart3 size={13} /> Log & Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* Hero - full viewport, 2-col */}
      <div className="min-h-screen flex items-center pt-14">
        <div className="max-w-6xl mx-auto px-5 w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-medium mb-5">
              <Beaker size={11} /> Built for the 8-week program
            </div>
            <h1 className="text-4xl sm:text-[2.75rem] font-extrabold tracking-tight leading-[1.08] mb-4">
              Your food diary<br/>holds the{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">answers.</span>
            </h1>
            <p className="text-[15px] text-stone-500 leading-relaxed mb-8 max-w-sm">
              We test every food and habit at every time delay (0-7 days), cross-reference
              with dermatological research, and find your personal acne triggers.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button
                onClick={() => setShowDemo(true)}
                className="flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#1a1a1a] text-white font-medium rounded-xl hover:bg-[#333] text-sm transition-all group"
              >
                <Play size={15} className="group-hover:scale-110 transition-transform" />
                Interactive demo
                <ArrowRight size={14} />
              </button>
              <button
                onClick={() => setShowCSV(true)}
                className="flex items-center justify-center gap-2 px-5 py-3.5 bg-white border border-stone-200 text-stone-700 font-medium rounded-xl hover:border-stone-300 text-sm transition-colors"
              >
                <Upload size={14} />
                Upload your CSV
              </button>
            </div>

            {/* Quick links */}
            <div className="flex items-center gap-4 text-xs">
              <button onClick={startManual} className="text-stone-400 hover:text-emerald-600 flex items-center gap-1 transition-colors">
                <ChevronRight size={12} /> Start logging manually
              </button>
              <button onClick={() => {
                clearAllData();
                const d = generateDemoData();
                saveUsers(d.users);
                for (const [uid, e] of Object.entries(d.entriesByUser)) saveEntries(uid, e);
                router.push('/dashboard');
              }} className="text-stone-400 hover:text-emerald-600 flex items-center gap-1 transition-colors">
                <ChevronRight size={12} /> Skip to dashboard
              </button>
            </div>
          </motion.div>

          {/* Right - preview window */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-7">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-emerald-50/60 via-transparent to-amber-50/30 rounded-3xl -z-10" />
              <div className="bg-white rounded-2xl border border-stone-150 shadow-xl shadow-stone-100/50 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-stone-100 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-stone-200" />
                    <div className="w-2.5 h-2.5 rounded-full bg-stone-200" />
                    <div className="w-2.5 h-2.5 rounded-full bg-stone-200" />
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono ml-2">neothera-insights / analysis</span>
                </div>
                <div className="p-5 space-y-2.5">
                  {[
                    { icon: <Milk size={14} />, label: 'Dairy', score: '+2.4', lag: '2d', rel: 82, c: 'red' },
                    { icon: <Moon size={14} />, label: 'Poor Sleep (<6h)', score: '+1.9', lag: '1d', rel: 74, c: 'amber' },
                    { icon: <Flame size={14} />, label: 'Fried Food', score: '+1.6', lag: '3d', rel: 68, c: 'amber' },
                    { icon: <Droplets size={14} />, label: 'Good Hydration', score: '-1.2', lag: '0d', rel: 61, c: 'green' },
                  ].map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.12 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-stone-50/70 hover:bg-stone-50 transition-colors">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        item.c === 'red' ? 'bg-red-50 text-red-500' : item.c === 'amber' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'
                      }`}>{item.icon}</div>
                      <span className="text-sm font-medium flex-1">{item.label}</span>
                      <span className="text-[11px] text-stone-400 font-mono">{item.lag}</span>
                      <span className={`text-sm font-bold ${item.c === 'green' ? 'text-emerald-600' : 'text-red-600'}`}>{item.score}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        item.rel >= 75 ? 'bg-red-50 text-red-600' : item.c === 'green' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>{item.rel}%</span>
                    </motion.div>
                  ))}
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                    className="mt-2 p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center gap-2 text-xs text-emerald-700">
                    <Zap size={12} className="flex-shrink-0" />
                    <span><strong>Top action:</strong> Eliminate dairy for 2 weeks - estimated ~2.4pt improvement</span>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Minimal stats footer */}
      <div className="border-t border-stone-100 bg-white">
        <div className="max-w-6xl mx-auto px-5 py-6 grid grid-cols-4 gap-4 text-center">
          {[
            { n: '40+', l: 'Foods mapped', s: 'compounds & pathways' },
            { n: '11', l: 'Bio pathways', s: 'mTORC1, cortisol...' },
            { n: '0-7d', l: 'Lag detection', s: 'per factor per user' },
            { n: '5', l: 'Stat tests', s: 'FDR, Cohen\'s d...' },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-xl font-bold text-stone-800">{s.n}</p>
              <p className="text-[11px] font-medium text-stone-600">{s.l}</p>
              <p className="text-[10px] text-stone-400">{s.s}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ====== DEMO MODAL - full screen stepper ====== */}
      <AnimatePresence>
        {showDemo && (
          <DemoModal
            onClose={() => setShowDemo(false)}
            onGoToDashboard={(data) => {
              setLoading('demo');
              clearAllData();
              saveUsers(data.users);
              for (const [userId, entries] of Object.entries(data.entriesByUser)) saveEntries(userId, entries);
              router.push('/dashboard');
            }}
          />
        )}
      </AnimatePresence>

      {/* CSV Modal */}
      <AnimatePresence>
        {showCSV && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowCSV(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Upload your data</h3>
                <button onClick={() => setShowCSV(false)}><X size={18} className="text-stone-400" /></button>
              </div>
              <div onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.name.endsWith('.csv')) uploadCSV(f); }}
                className="border-2 border-dashed border-stone-200 rounded-xl p-8 text-center hover:border-emerald-300">
                <Upload size={24} className="mx-auto mb-2 text-stone-300" />
                <p className="text-sm font-medium mb-3">Drag & drop CSV</p>
                <label className="inline-flex px-4 py-2 bg-[#1a1a1a] text-white text-sm rounded-xl cursor-pointer">
                  {loading === 'csv' ? 'Parsing...' : 'Choose file'}
                  <input type="file" accept=".csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadCSV(f); }} />
                </label>
              </div>
              <p className="text-[10px] text-stone-400 mt-3">Needs <code className="bg-stone-50 px-1 rounded">date</code> + <code className="bg-stone-50 px-1 rounded">severity</code>. All other columns = factors.</p>
              {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// DEMO MODAL - Full screen guided walkthrough
// ============================================

function DemoModal({ onClose, onGoToDashboard }: {
  onClose: () => void;
  onGoToDashboard: (data: ReturnType<typeof generateDemoData>) => void;
}) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ReturnType<typeof generateDemoData> | null>(null);
  const [results, setResults] = useState<{
    correlations: CorrelationResult[];
    quality: DataQualityReport;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Generate on mount
  useEffect(() => {
    const d = generateDemoData();
    setData(d);
  }, []);

  const user = data?.users[0];
  const entries = data && user ? data.entriesByUser[user.id] || [] : [];

  function runEngine() {
    setIsProcessing(true);
    // Simulate brief processing time for dramatic effect
    setTimeout(() => {
      const correlations = analyzeCorrelations(entries, FACTOR_LABELS, 7, INVERTED_FACTORS);
      const quality = assessDataQuality(entries);
      setResults({ correlations, quality });
      setIsProcessing(false);
      setStep(2);
    }, 1200);
  }

  const triggers = results?.correlations.filter(c => c.direction === 'trigger' && c.reliabilityScore >= 25) || [];
  const protective = results?.correlations.filter(c => c.direction === 'protective') || [];
  const totalSteps = 3;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#FAFAF8] overflow-y-auto"
    >
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-[#FAFAF8]/90 backdrop-blur-lg border-b border-stone-100 px-5 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FlaskConical size={16} className="text-emerald-600" />
            <span className="text-sm font-bold">Interactive Demo</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Progress */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all ${
                  i <= step ? 'w-6 bg-emerald-500' : 'w-1.5 bg-stone-200'
                }`} />
              ))}
            </div>
            <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={18} /></button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-10">
        <AnimatePresence mode="wait">

          {/* ===== STEP 0: Meet the user ===== */}
          {step === 0 && user && (
            <motion.div key="step0" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider mb-2">Step 1 of 3</p>
              <h2 className="text-2xl font-bold mb-1">Meet {user.name}.</h2>
              <p className="text-sm text-stone-500 mb-8">
                {user.name} has been tracking food, habits, and skin for 8 weeks in the Neothera program.
                Let&apos;s see what the engine can find.
              </p>

              {/* Profile */}
              <div className="bg-white rounded-2xl border border-stone-100 p-5 mb-6 flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center text-xl font-bold text-emerald-700">
                  {user.name[0]}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-lg">{user.name}</p>
                  <p className="text-sm text-stone-500">Age {user.age} · {user.skinType} skin · Started {user.startDate}</p>
                </div>
                <div className="text-right bg-emerald-50 rounded-xl px-4 py-2">
                  <p className="text-2xl font-bold text-emerald-600">{entries.length}</p>
                  <p className="text-[10px] text-emerald-600">days logged</p>
                </div>
              </div>

              {/* Data preview */}
              <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden mb-8">
                <div className="px-5 py-3 border-b border-stone-50 flex items-center justify-between">
                  <span className="text-xs font-medium text-stone-500">DATA PREVIEW - {user.name}&apos;s logs</span>
                  <span className="text-[10px] text-stone-400">{entries.length} rows total</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-stone-50">
                        {['Date', 'Dairy', 'Sugar', 'Fried', 'Sleep', 'Stress', 'Severity'].map(h => (
                          <th key={h} className="text-left py-2 px-3 font-semibold text-stone-400 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {entries.slice(0, 6).map((e, i) => (
                        <tr key={i} className="border-t border-stone-50">
                          <td className="py-2 px-3 font-mono text-stone-600">{e.date}</td>
                          <td className="py-2 px-3">{e.factors.dairy ? <span className="text-red-500 font-medium">yes</span> : <span className="text-stone-300">no</span>}</td>
                          <td className="py-2 px-3">{e.factors.highSugar ? <span className="text-red-500 font-medium">yes</span> : <span className="text-stone-300">no</span>}</td>
                          <td className="py-2 px-3">{e.factors.friedFood ? <span className="text-red-500 font-medium">yes</span> : <span className="text-stone-300">no</span>}</td>
                          <td className="py-2 px-3 font-mono">{typeof e.factors.sleepHours === 'number' ? `${(e.factors.sleepHours as number).toFixed(1)}h` : '-'}</td>
                          <td className="py-2 px-3 font-mono">{typeof e.factors.stressLevel === 'number' ? `${e.factors.stressLevel}/5` : '-'}</td>
                          <td className={`py-2 px-3 font-bold ${e.skinSeverity > 5 ? 'text-red-600' : e.skinSeverity > 3 ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {e.skinSeverity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-2 bg-stone-50 text-[10px] text-stone-400">
                  + {entries.length - 6} more days of data
                </div>
              </div>

              <button onClick={() => setStep(1)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1a1a1a] text-white font-medium rounded-xl hover:bg-[#333] text-sm">
                Run the pattern engine on this data <ArrowRight size={14} />
              </button>
            </motion.div>
          )}

          {/* ===== STEP 1: Processing ===== */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              className="text-center py-16">
              <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider mb-6">Step 2 of 3</p>

              {isProcessing ? (
                <div>
                  <div className="w-16 h-16 border-3 border-emerald-100 border-t-emerald-500 rounded-full animate-spin mx-auto mb-6" />
                  <h2 className="text-xl font-bold mb-2">Analyzing {entries.length} days of data...</h2>
                  <p className="text-sm text-stone-500">Testing 16 factors × 8 lags = 128 comparisons with FDR correction</p>
                </div>
              ) : (
                <div>
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                    <Sparkles size={28} className="text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">Engine ready</h2>
                  <p className="text-sm text-stone-500 mb-6">Click to analyze the data</p>
                </div>
              )}

              {!isProcessing && !results && (
                <button onClick={runEngine}
                  className="mx-auto flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] text-white font-medium rounded-xl hover:bg-[#333] text-sm">
                  <BarChart3 size={14} /> Analyze now
                </button>
              )}

              {/* Auto-run on mount */}
              {!isProcessing && !results && <AutoRun fn={runEngine} />}
            </motion.div>
          )}

          {/* ===== STEP 2: Results ===== */}
          {step === 2 && results && user && (
            <motion.div key="step2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider mb-2">Step 3 of 3</p>
              <h2 className="text-2xl font-bold mb-1">Results for {user.name}</h2>
              <p className="text-sm text-stone-500 mb-6">
                Data quality: <span className={`font-bold ${results.quality.overallScore >= 60 ? 'text-emerald-600' : 'text-amber-600'}`}>{results.quality.overallScore}/100</span>
                {' · '}{results.quality.totalDays} days · {results.quality.completionRate}% completion
              </p>

              {/* Triggers */}
              {triggers.length > 0 ? (
                <div className="mb-6">
                  <p className="text-xs font-semibold text-red-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                    <AlertTriangle size={12} /> {triggers.length} trigger{triggers.length !== 1 ? 's' : ''} detected
                  </p>
                  <div className="space-y-3">
                    {triggers.slice(0, 5).map((t, i) => (
                      <motion.div
                        key={t.factor}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white rounded-2xl border border-stone-100 p-5 hover:shadow-md transition-shadow"
                      >
                        {/* Header */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-sm font-bold text-red-600 flex-shrink-0">
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold">{t.factorLabel}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                t.reliabilityScore >= 70 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                              }`}>{t.reliabilityScore}% reliable</span>
                              {t.lagMatchesScience && (
                                <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">research-backed</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* What */}
                        <div className="bg-red-50/40 rounded-xl p-3 mb-3">
                          <p className="text-sm">
                            Skin severity goes from <strong>{t.avgWithoutFactor.toFixed(1)}</strong> to{' '}
                            <strong className="text-red-600">{t.avgWithFactor.toFixed(1)}</strong>{' '}
                            (<strong className="text-red-600">+{t.effectSize.toFixed(1)} pts</strong>) - peaks{' '}
                            <strong>{t.bestLag === 0 ? 'same day' : `${t.bestLag} day${t.bestLag > 1 ? 's' : ''} later`}</strong>
                          </p>
                        </div>

                        {/* Why */}
                        {t.mechanism && (
                          <p className="text-xs text-stone-500 mb-3 leading-relaxed">
                            <span className="font-semibold text-stone-600">Why: </span>{t.mechanism}
                          </p>
                        )}

                        {/* Fix */}
                        {t.recommendation && (
                          <div className="bg-emerald-50/50 rounded-xl p-3 flex items-start gap-2">
                            <Zap size={13} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-emerald-800">{t.recommendation}</p>
                          </div>
                        )}

                        {/* Stats row */}
                        <div className="flex items-center gap-3 mt-3 text-[10px] text-stone-400 font-mono">
                          <span>p={t.pValue.toFixed(3)}</span>
                          <span>p_adj={t.pValueAdjusted.toFixed(3)}</span>
                          <span>d={t.cohensD}</span>
                          <span>n={t.daysWithFactor}+{t.daysWithoutFactor}</span>
                          {t.evidenceStrength && <span>evidence: {t.evidenceStrength}</span>}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-stone-50 rounded-2xl p-8 text-center mb-6">
                  <p className="text-sm text-stone-500">No strong triggers detected in this demo run. Try again for different random data.</p>
                </div>
              )}

              {/* Protective */}
              {protective.length > 0 && (
                <div className="mb-8">
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                    <Shield size={12} /> Protective factors
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {protective.slice(0, 4).map(p => (
                      <div key={p.factor} className="bg-emerald-50/40 rounded-xl border border-emerald-100 p-3 flex items-center gap-3">
                        <Shield size={14} className="text-emerald-500 flex-shrink-0" />
                        <span className="text-sm flex-1">{p.factorLabel}</span>
                        <span className="text-sm font-bold text-emerald-600">{p.effectSize.toFixed(1)} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="bg-[#1a1a1a] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-white font-semibold">This is just {user.name}&apos;s summary.</p>
                  <p className="text-stone-400 text-sm mt-0.5">Full dashboard: timelines, lag charts, dose thresholds, all 20 users</p>
                </div>
                <button
                  onClick={() => data && onGoToDashboard(data)}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-[#1a1a1a] font-medium rounded-xl text-sm hover:bg-stone-100 flex-shrink-0 whitespace-nowrap"
                >
                  <ExternalLink size={14} />
                  Explore full dashboard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back button */}
        {step > 0 && step < 2 && (
          <button onClick={() => setStep(s => s - 1)} className="mt-6 flex items-center gap-1 text-sm text-stone-400 hover:text-stone-600">
            <ChevronLeft size={14} /> Back
          </button>
        )}
      </div>
    </motion.div>
  );
}

// Auto-trigger function after mount
function AutoRun({ fn }: { fn: () => void }) {
  useEffect(() => { fn(); }, []);
  return null;
}
