// ============================================================
// Data Store - manages user log data from multiple sources:
//   1. Manual entry (user logs habits day by day)
//   2. CSV upload (bulk import from spreadsheets)
//   3. Demo data (realistic random data for testing)
// All data persists in localStorage.
// ============================================================

import { DailyEntry } from './correlationEngine';

const STORAGE_KEY = 'neothera_logs';
const USERS_KEY = 'neothera_users';

export interface UserInfo {
  id: string;
  name: string;
  age?: number;
  skinType?: string;
  startDate: string;
}

// ---------- Default factors for the Neothera acne program ----------
export const DEFAULT_FACTORS = {
  dairy: { label: 'Dairy', type: 'boolean' as const, category: 'food' },
  highSugar: { label: 'High Sugar Foods', type: 'boolean' as const, category: 'food' },
  friedFood: { label: 'Fried / Oily Food', type: 'boolean' as const, category: 'food' },
  wheyProtein: { label: 'Whey Protein', type: 'boolean' as const, category: 'food' },
  alcohol: { label: 'Alcohol', type: 'boolean' as const, category: 'food' },
  caffeine: { label: 'Caffeine', type: 'boolean' as const, category: 'food' },
  spicyFood: { label: 'Spicy Food', type: 'boolean' as const, category: 'food' },
  processedFood: { label: 'Processed / Junk Food', type: 'boolean' as const, category: 'food' },
  gluten: { label: 'Gluten-heavy Meal', type: 'boolean' as const, category: 'food' },
  waterGlasses: { label: 'Water (glasses)', type: 'number' as const, category: 'habit', min: 0, max: 15 },
  sleepHours: { label: 'Sleep (hours)', type: 'number' as const, category: 'habit', min: 0, max: 14 },
  stressLevel: { label: 'Stress Level', type: 'number' as const, category: 'habit', min: 1, max: 5 },
  exercised: { label: 'Exercised', type: 'boolean' as const, category: 'habit' },
  morningRoutine: { label: 'Morning Skincare', type: 'boolean' as const, category: 'skincare' },
  eveningRoutine: { label: 'Evening Skincare', type: 'boolean' as const, category: 'skincare' },
  sunscreen: { label: 'Applied Sunscreen', type: 'boolean' as const, category: 'skincare' },
};

export type FactorKey = keyof typeof DEFAULT_FACTORS;

export const FACTOR_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(DEFAULT_FACTORS).map(([k, v]) => [k, v.label])
);

// Factors where "absence" or "low value" is the trigger
export const INVERTED_FACTORS = new Set([
  'waterGlasses', 'sleepHours', 'exercised', 'morningRoutine', 'eveningRoutine', 'sunscreen'
]);

// ---------- LocalStorage helpers ----------
export function loadUsers(): UserInfo[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveUsers(users: UserInfo[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function loadEntries(userId: string): DailyEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveEntries(userId: string, entries: DailyEntry[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(entries));
}

export function addEntry(userId: string, entry: DailyEntry) {
  const entries = loadEntries(userId);
  // Replace if same date exists, otherwise append
  const idx = entries.findIndex(e => e.date === entry.date);
  if (idx >= 0) entries[idx] = entry;
  else entries.push(entry);
  entries.sort((a, b) => a.date.localeCompare(b.date));
  saveEntries(userId, entries);
}

export function clearAllData() {
  if (typeof window === 'undefined') return;
  const keys = Object.keys(localStorage).filter(k => k.startsWith('neothera_'));
  keys.forEach(k => localStorage.removeItem(k));
}

// ---------- CSV Parser ----------
// Accepts CSV with columns: date, userId (optional), then factor columns, then skin columns
export function parseCSV(csvText: string): { users: UserInfo[]; entriesByUser: Record<string, DailyEntry[]> } {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row');

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));

  const dateCol = headers.findIndex(h => h === 'date');
  const userCol = headers.findIndex(h => h === 'user_id' || h === 'userid' || h === 'user' || h === 'name');
  const severityCol = headers.findIndex(h => h.includes('severity') || h === 'skin_score' || h === 'acne_score' || h === 'skin');
  const breakoutCol = headers.findIndex(h => h.includes('breakout') || h.includes('pimple') || h.includes('new_spots'));
  const oilinessCol = headers.findIndex(h => h.includes('oilin') || h.includes('oil'));
  const inflammationCol = headers.findIndex(h => h.includes('inflam'));

  if (dateCol === -1) throw new Error('CSV must have a "date" column');
  if (severityCol === -1) throw new Error('CSV must have a skin severity/score column (e.g., "severity", "skin_score", "acne_score")');

  // All other columns are treated as factors
  const skipCols = new Set([dateCol, userCol, severityCol, breakoutCol, oilinessCol, inflammationCol]);
  const factorCols = headers
    .map((h, i) => ({ name: h, idx: i }))
    .filter(c => !skipCols.has(c.idx));

  const entriesByUser: Record<string, DailyEntry[]> = {};
  const userSet = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim());
    if (cols.length < headers.length) continue;

    const date = cols[dateCol];
    if (!date || !/\d{4}-\d{2}-\d{2}/.test(date)) continue;

    const userId = userCol >= 0 ? cols[userCol] : 'default_user';
    userSet.add(userId);

    const factors: Record<string, boolean | number> = {};
    for (const fc of factorCols) {
      const raw = cols[fc.idx].toLowerCase();
      if (raw === 'true' || raw === 'yes' || raw === '1' || raw === 'y') {
        factors[fc.name] = true;
      } else if (raw === 'false' || raw === 'no' || raw === '0' || raw === 'n' || raw === '') {
        factors[fc.name] = false;
      } else {
        const num = parseFloat(raw);
        factors[fc.name] = isNaN(num) ? (raw.length > 0) : num;
      }
    }

    const entry: DailyEntry = {
      date,
      factors,
      skinSeverity: parseFloat(cols[severityCol]) || 0,
      newBreakouts: breakoutCol >= 0 ? parseFloat(cols[breakoutCol]) || 0 : 0,
      oiliness: oilinessCol >= 0 ? parseFloat(cols[oilinessCol]) || 3 : 3,
      inflammation: inflammationCol >= 0 ? parseFloat(cols[inflammationCol]) || 0 : 0,
    };

    if (!entriesByUser[userId]) entriesByUser[userId] = [];
    entriesByUser[userId].push(entry);
  }

  const users: UserInfo[] = Array.from(userSet).map(id => ({
    id,
    name: id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    startDate: Object.values(entriesByUser).flat().reduce(
      (min, e) => e.date < min ? e.date : min, '9999-99-99'
    ),
  }));

  return { users, entriesByUser };
}

// ---------- Demo Data Generator ----------
// Generates REALISTIC random data. The correlations are NOT predetermined -
// the engine has to actually find them from random patterns.
// However, to make the demo useful, we seed SOME real biological relationships.

function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

export function generateDemoData(): { users: UserInfo[]; entriesByUser: Record<string, DailyEntry[]> } {
  const rng = seededRandom(Date.now()); // Different each time!
  const userCount = 20; // Smaller, more realistic cohort
  const days = 56; // 8 weeks
  const startDate = new Date('2026-02-14');

  const users: UserInfo[] = [];
  const entriesByUser: Record<string, DailyEntry[]> = {};

  const names = [
    'Aarav', 'Priya', 'Rohan', 'Ananya', 'Arjun', 'Diya', 'Vivaan', 'Ishita',
    'Aditya', 'Kavya', 'Sai', 'Meera', 'Kabir', 'Riya', 'Arnav', 'Nisha',
    'Dev', 'Pooja', 'Vihaan', 'Sneha'
  ];

  for (let u = 0; u < userCount; u++) {
    const userId = `user_${String(u + 1).padStart(2, '0')}`;
    const userName = names[u];

    users.push({
      id: userId,
      name: userName,
      age: Math.floor(rng() * 12) + 18,
      skinType: ['oily', 'dry', 'combination', 'sensitive'][Math.floor(rng() * 4)],
      startDate: startDate.toISOString().split('T')[0],
    });

    // Each user has 1-2 REAL triggers (chosen randomly) with a random lag
    const possibleTriggers = ['dairy', 'highSugar', 'friedFood', 'wheyProtein', 'alcohol', 'spicyFood', 'processedFood'];
    const userTriggers: { factor: string; lag: number; strength: number }[] = [];
    const triggerCount = Math.floor(rng() * 2) + 1;
    const shuffled = possibleTriggers.sort(() => rng() - 0.5);
    for (let t = 0; t < triggerCount; t++) {
      userTriggers.push({
        factor: shuffled[t],
        lag: Math.floor(rng() * 4) + 1, // 1-4 day lag
        strength: 1.0 + rng() * 2.5, // 1.0-3.5 severity bump
      });
    }

    const entries: DailyEntry[] = [];

    // First pass: generate factors
    const rawDays: { date: string; factors: Record<string, boolean | number> }[] = [];
    for (let d = 0; d < days; d++) {
      // ~15% chance of not logging (realistic adherence)
      if (rng() < 0.12) continue;

      const date = new Date(startDate);
      date.setDate(date.getDate() + d);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;

      rawDays.push({
        date: date.toISOString().split('T')[0],
        factors: {
          dairy: rng() < (isWeekend ? 0.5 : 0.35),
          highSugar: rng() < (isWeekend ? 0.5 : 0.28),
          friedFood: rng() < (isWeekend ? 0.4 : 0.18),
          wheyProtein: rng() < 0.2,
          alcohol: rng() < (isWeekend ? 0.35 : 0.08),
          caffeine: rng() < 0.55,
          spicyFood: rng() < 0.25,
          processedFood: rng() < 0.35,
          gluten: rng() < 0.45,
          waterGlasses: Math.floor(rng() * 10) + 2,
          sleepHours: Math.round((rng() * 4 + 5) * 10) / 10,
          stressLevel: Math.ceil(rng() * 5),
          exercised: rng() < 0.35,
          morningRoutine: rng() < 0.6,
          eveningRoutine: rng() < 0.45,
          sunscreen: rng() < 0.5,
        },
      });
    }

    // Second pass: generate skin outcomes based on triggers + noise
    for (let i = 0; i < rawDays.length; i++) {
      let baseSeverity = 2.5 + rng() * 1.5; // baseline 2.5-4
      let triggerEffect = 0;

      // Check each trigger with its lag
      for (const trigger of userTriggers) {
        for (let j = 0; j < rawDays.length; j++) {
          const daysDiff = Math.round(
            (new Date(rawDays[i].date).getTime() - new Date(rawDays[j].date).getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysDiff === trigger.lag) {
            const val = rawDays[j].factors[trigger.factor];
            if (val === true) {
              triggerEffect += trigger.strength * (0.7 + rng() * 0.6); // some variance
            }
            break;
          }
        }
      }

      // Protective effects (real biology)
      const f = rawDays[i].factors;
      if (typeof f.waterGlasses === 'number' && f.waterGlasses >= 8) baseSeverity -= 0.3;
      if (f.exercised === true) baseSeverity -= 0.2;
      if (f.morningRoutine === true && f.eveningRoutine === true) baseSeverity -= 0.4;
      if (typeof f.sleepHours === 'number' && f.sleepHours >= 7.5) baseSeverity -= 0.3;

      // Treatment effect over time
      const weekNum = Math.floor(i / 7);
      baseSeverity -= weekNum * 0.1;

      // Random noise
      const noise = (rng() - 0.5) * 2;

      const severity = Math.max(0, Math.min(10, Math.round((baseSeverity + triggerEffect + noise) * 10) / 10));
      const breakouts = Math.max(0, Math.round(severity * 0.5 + (rng() - 0.3) * 2));
      const oiliness = Math.max(1, Math.min(5, Math.round(severity * 0.35 + 1 + rng())));
      const inflammation = Math.max(0, Math.min(5, Math.round(severity * 0.3 + rng() * 0.5)));

      entries.push({
        date: rawDays[i].date,
        factors: rawDays[i].factors,
        skinSeverity: severity,
        newBreakouts: breakouts,
        oiliness,
        inflammation,
      });
    }

    entriesByUser[userId] = entries;
  }

  return { users, entriesByUser };
}
