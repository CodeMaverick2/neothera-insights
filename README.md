# neothera-skin-insights

> Neothera AI Product Builder Assignment - Tejas Ghatule

## My Thought Process

Hey Radhika! So I went back and forth between the two problems and ended up picking **Problem #2 - the pattern detection one** ("we struggle to automatically detect patterns between habits and skin changes"). Here's my thinking:

The adherence problem is real, but I think it's partly a symptom. Users stop logging because they don't see the point - they're putting in effort but getting nothing back. If the system could actually tell them "hey, dairy is making your skin worse, and it happens 2 days later so you probably never connected the two" - THAT becomes the reason to keep logging. The insight is the motivation. So solving pattern detection indirectly helps adherence too.

**What I actually built:**

A statistical pattern detection engine that takes daily tracking data (food, habits, skincare, skin scores) and finds real correlations - including time-delayed ones. The "dairy today → breakout 2 days later" thing is genuinely hard to spot manually, and that's exactly what this engine does.

It's not a mockup. The engine runs real statistical tests (chi-squared with FDR correction for multiple comparisons, Cohen's d for standardized effect sizes). When it finds something, it cross-references with a knowledge base I built from ~50 dermatology papers to explain WHY - like "dairy elevates IGF-1 which activates the mTORC1 pathway, increasing sebum production". It also detects when two triggers amplify each other (dairy + sugar = 1.5x worse than either alone).

I spent maybe 60% of my time on the engine and knowledge base, and 40% on making the frontend actually communicate what the engine found in a way that's scannable and actionable (not a wall of text).

**Tech stack choices:**

- **Next.js + TypeScript** - ship fast, deploy to Vercel in one click, catch type bugs
- **No backend/database** - everything client-side with localStorage. For a prototype this works. Production would need Postgres + proper API but I wanted to ship, not architect
- **Recharts + Framer Motion** - needed real charts and a smooth guided demo experience

**What I'd do with more time:**

- Connect to USDA/IFCT food APIs for thousands of foods instead of the 40+ I embedded
- Add menstrual cycle tracking (huge factor for acne that we're not capturing)
- Real LLM integration (Claude API) for dynamic insight generation
- Proper daily logger UX - current one is functional but not delightful
- Mobile-first responsive design
- Push notification / WhatsApp reminders

**What I'm most proud of:** The interactive demo. Click "See it work" on the landing page - it generates a real user with 8 weeks of data, shows you their actual logs, runs the engine live, and walks you through the findings step by step. That's not a mockup, that's the engine actually running.

---

## Live Demo

**[Deployed URL here]**

Click "Interactive demo" on the landing page to see the full walkthrough.

## Features

### Engine (the core)
- Time-lag correlation analysis (0-7 day delays per factor)
- Chi-squared significance testing with Benjamini-Hochberg FDR correction
- Cohen's d standardized effect sizes
- Reliability scoring (0-100) per finding
- Data quality assessment before analysis
- Combination effect detection (dairy + stress = amplified)
- Dose-response analysis for non-linear thresholds
- Knowledge-enhanced confidence boosting

### Knowledge Base (1,380 lines of research)
- 16 food-skin profiles with compounds, GI, mechanisms, cited studies
- 10 nutrient profiles, 7 lifestyle profiles
- 8 skincare ingredients with interaction data
- 14 combination effects with evidence-based multipliers
- 11 biological pathways (mTORC1, insulin/IGF-1, NF-kB, cortisol, etc.)

### Food Database (40+ Indian foods)
- Paneer, chai, samosa, biryani, dal, dosa, whey protein, etc.
- Real nutritional data from IFCT 2017 / USDA FoodData Central
- Each food mapped to biochemical compounds and biological pathways

### Frontend
- Interactive guided demo (full-screen walkthrough)
- Insight cards: What happened → Why → What to do
- Timeline chart with factor overlays
- Lag analysis charts
- Cohort view for population-level patterns
- CSV upload (auto-detects columns)
- Daily logger (Food → Habits → Skin)

## Getting Started

```bash
git clone https://github.com/CodeMaverick2/neothera-insights.git
cd neothera-skin-insights
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy

```bash
npm run build    # verify build passes
npx vercel       # deploy to Vercel
```

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide React |
| Deploy | Vercel |

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing + interactive demo modal
│   ├── dashboard/page.tsx    # Analysis dashboard (insights/cohort/log)
│   └── api/insights/route.ts # Insight generation API
├── components/
│   ├── InsightCards.tsx       # What→Why→Fix cards
│   ├── TimelineChart.tsx      # Severity timeline with factor overlay
│   ├── LagChart.tsx           # Time-lag effect bar chart
│   ├── CohortHeatmap.tsx      # Population trigger map
│   ├── DailyLogger.tsx        # 3-step habit entry
│   └── UserSelector.tsx       # User picker
└── lib/
    ├── correlationEngine.ts   # Stats engine (600 lines)
    ├── skinKnowledgeBase.ts   # Research DB (1,380 lines)
    ├── foodDatabase.ts        # Food composition + pathways (600 lines)
    └── dataStore.ts           # Persistence + CSV parser + demo gen
```

## How the Engine Works

```
Your daily logs (CSV or manual)
       │
       ▼
 Food Resolution
 "paneer" → casein → IGF-1 → mTORC1 → sebum increase
       │
       ▼
 Statistical Engine
 16 factors × 8 lags = 128 comparisons
 chi-squared test per comparison
       │
       ▼
 FDR Correction
 Benjamini-Hochberg adjustment for multiple testing
       │
       ▼
 Knowledge Enhancement
 Does detected lag match known biology? → confidence boost
       │
       ▼
 Reliability Score (0-100)
 stats + effect size + sample size + science alignment
       │
       ▼
 Actionable Insight
 WHAT: "Dairy +2.4 severity, 2 days later"
 WHY:  "IGF-1 activates mTORC1, increasing sebum"
 FIX:  "Try 2-week elimination trial"
```

---

Built by Tejas Ghatule | April 2026
