'use client';

import { useState } from 'react';
import { DEFAULT_FACTORS, FactorKey, addEntry, FACTOR_LABELS, loadEntries } from '@/lib/dataStore';
import { DailyEntry } from '@/lib/correlationEngine';
import { motion } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, Save, Utensils, Heart, Droplets } from 'lucide-react';

interface Props {
  userId: string;
  onSaved: () => void;
}

const SKIN_FEELINGS = [
  { value: 0, label: 'Clear', emoji: '😊' },
  { value: 3, label: 'Mild', emoji: '😐' },
  { value: 5, label: 'Bumpy', emoji: '😔' },
  { value: 7, label: 'Inflamed', emoji: '😬' },
  { value: 9, label: 'Painful', emoji: '😫' },
];

export default function DailyLogger({ userId, onSaved }: Props) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [step, setStep] = useState(0); // 0: food, 1: habits, 2: skin
  const [factors, setFactors] = useState<Record<string, boolean | number>>(() => {
    // Check if we have existing data for today
    const existing = loadEntries(userId).find(e => e.date === date);
    if (existing) return existing.factors;
    return Object.fromEntries(
      Object.entries(DEFAULT_FACTORS).map(([key, def]) =>
        [key, def.type === 'boolean' ? false : (def.type === 'number' ? (key === 'stressLevel' ? 3 : 0) : 0)]
      )
    );
  });
  const [skinSeverity, setSkinSeverity] = useState(3);
  const [breakouts, setBreakouts] = useState(0);
  const [oiliness, setOiliness] = useState(3);
  const [saved, setSaved] = useState(false);

  function toggleFactor(key: string) {
    setFactors(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function setNumericFactor(key: string, val: number) {
    setFactors(prev => ({ ...prev, [key]: val }));
  }

  function handleSave() {
    const entry: DailyEntry = {
      date,
      factors,
      skinSeverity,
      newBreakouts: breakouts,
      oiliness,
      inflammation: Math.round(skinSeverity * 0.4),
    };
    addEntry(userId, entry);
    setSaved(true);
    setTimeout(() => { setSaved(false); onSaved(); }, 1500);
  }

  const foodFactors = Object.entries(DEFAULT_FACTORS).filter(([, v]) => v.category === 'food');
  const habitFactors = Object.entries(DEFAULT_FACTORS).filter(([, v]) => v.category === 'habit');
  const skincareFactors = Object.entries(DEFAULT_FACTORS).filter(([, v]) => v.category === 'skincare');

  const steps = [
    { label: 'Food', icon: <Utensils size={16} /> },
    { label: 'Habits', icon: <Heart size={16} /> },
    { label: 'Skin', icon: <Droplets size={16} /> },
  ];

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      {/* Date selector */}
      <div className="px-6 pt-5 pb-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold">Daily Log</h3>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="text-sm bg-background border border-border rounded-lg px-3 py-1.5"
        />
      </div>

      {/* Step indicator */}
      <div className="flex border-b border-border">
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-all ${
              step === i ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* Step 0: Food */}
        {step === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-sm text-muted mb-4">What did you eat/drink today? Tap to toggle.</p>
            <div className="grid grid-cols-2 gap-2">
              {foodFactors.map(([key, def]) => (
                <button
                  key={key}
                  onClick={() => toggleFactor(key)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left text-sm transition-all ${
                    factors[key] === true
                      ? 'border-red-200 bg-red-50 text-red-700'
                      : 'border-border bg-background text-muted hover:border-border hover:bg-white'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                    factors[key] === true ? 'border-red-400 bg-red-400' : 'border-gray-300'
                  }`}>
                    {factors[key] === true && <Check size={12} className="text-white" />}
                  </div>
                  {def.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 1: Habits */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-sm text-muted mb-4">Your habits and routine today.</p>
            <div className="space-y-4">
              {/* Boolean habits */}
              <div className="grid grid-cols-2 gap-2">
                {[...habitFactors, ...skincareFactors]
                  .filter(([, def]) => def.type === 'boolean')
                  .map(([key, def]) => (
                    <button
                      key={key}
                      onClick={() => toggleFactor(key)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left text-sm transition-all ${
                        factors[key] === true
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-border bg-background text-muted'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                        factors[key] === true ? 'border-emerald-400 bg-emerald-400' : 'border-gray-300'
                      }`}>
                        {factors[key] === true && <Check size={12} className="text-white" />}
                      </div>
                      {def.label}
                    </button>
                  ))}
              </div>

              {/* Numeric factors */}
              {[...habitFactors, ...skincareFactors]
                .filter(([, def]) => def.type === 'number')
                .map(([key, def]) => (
                  <div key={key} className="bg-background rounded-xl p-4 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">{def.label}</label>
                      <span className="text-sm font-bold text-primary">
                        {typeof factors[key] === 'number' ? factors[key] : 0}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={(def as { min?: number }).min || 0}
                      max={(def as { max?: number }).max || 10}
                      step={key === 'sleepHours' ? 0.5 : 1}
                      value={typeof factors[key] === 'number' ? (factors[key] as number) : 0}
                      onChange={e => setNumericFactor(key, parseFloat(e.target.value))}
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted mt-1">
                      <span>{(def as { min?: number }).min || 0}</span>
                      <span>{(def as { max?: number }).max || 10}</span>
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Skin */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-sm text-muted mb-4">How is your skin today?</p>

            <div className="mb-6">
              <label className="text-sm font-medium mb-3 block">Skin Feeling</label>
              <div className="flex gap-2">
                {SKIN_FEELINGS.map(sf => (
                  <button
                    key={sf.value}
                    onClick={() => setSkinSeverity(sf.value)}
                    className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                      skinSeverity === sf.value
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <span className="text-2xl">{sf.emoji}</span>
                    <span className="text-xs font-medium">{sf.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Severity (fine-tune)</label>
                <span className="text-sm font-bold text-primary">{skinSeverity}/10</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={skinSeverity}
                onChange={e => setSkinSeverity(parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">New Breakouts</label>
                <span className="text-sm font-bold">{breakouts}</span>
              </div>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4, 5, '6+'].map((n, i) => (
                  <button
                    key={i}
                    onClick={() => setBreakouts(typeof n === 'number' ? n : 6)}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium ${
                      breakouts === (typeof n === 'number' ? n : 6)
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border text-muted'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Oiliness</label>
                <span className="text-sm font-bold">{oiliness}/5</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={oiliness}
                onChange={e => setOiliness(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted mt-1">
                <span>Dry</span>
                <span>Very oily</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="flex items-center gap-1 text-sm text-muted hover:text-foreground disabled:opacity-30"
          >
            <ChevronLeft size={16} /> Back
          </button>

          {step < 2 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1 px-5 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark"
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saved}
              className="flex items-center gap-2 px-5 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark disabled:opacity-60"
            >
              {saved ? (
                <>
                  <Check size={16} /> Saved!
                </>
              ) : (
                <>
                  <Save size={16} /> Save Entry
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
