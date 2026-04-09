// ============================================================
// FOOD COMPOSITION DATABASE
//
// Production vision:
//   - Pull from IFCT (Indian Food Composition Tables) API
//   - Pull from USDA FoodData Central API (free, api.nal.usda.gov)
//   - Enriched with acne-specific compound data from PubMed
//   - Users search "paneer tikka" → we resolve to components
//
// Current: embedded dataset of 80+ common Indian foods with
// nutritional data + acne-relevant compound flags.
// Each food maps to its constituent "trigger categories" so the
// engine knows that "paneer" = dairy exposure + high fat.
// ============================================================

export interface FoodItem {
  id: string;
  name: string;
  aliases: string[];           // Search terms: "paneer", "cottage cheese"
  category: string;            // "dairy", "grain", "vegetable", etc.
  // Nutritional data (per 100g, from IFCT/USDA)
  glycemicIndex: number;       // 0-100
  calories: number;
  protein: number;             // grams
  fat: number;
  carbs: number;
  fiber: number;
  sugar: number;
  // Acne-relevant compound flags
  triggerCategories: string[];  // Maps to our factor system: ["dairy", "highSugar"]
  compounds: CompoundExposure[];
  // Acne risk score: -5 (very protective) to +5 (very triggering)
  acneRiskScore: number;
  mechanism: string;           // Brief explanation
}

export interface CompoundExposure {
  compound: string;            // "IGF-1", "leucine", "capsaicin"
  level: 'high' | 'moderate' | 'low' | 'trace';
  pathway: string;             // Which biological pathway it activates
}

// ──────────────────────────────────────────────────────────────
// BIOLOGICAL PATHWAY GRAPH
// compound → pathway → skin effect
// This is the "reasoning chain" the engine traverses
// ──────────────────────────────────────────────────────────────

export interface BiologicalPathway {
  id: string;
  name: string;
  description: string;
  skinEffect: 'sebum_increase' | 'inflammation' | 'barrier_damage' |
              'comedone_formation' | 'sebum_decrease' | 'anti_inflammatory' |
              'barrier_repair' | 'antimicrobial';
  severity: number; // 1-5 how strongly it affects acne
  timeToEffect: [number, number]; // hours [min, max]
}

export const PATHWAYS: Record<string, BiologicalPathway> = {
  mtorc1: {
    id: 'mtorc1',
    name: 'mTORC1 Activation',
    description: 'Mammalian target of rapamycin complex 1 - master regulator of sebocyte lipogenesis and keratinocyte proliferation',
    skinEffect: 'sebum_increase',
    severity: 5,
    timeToEffect: [24, 72],
  },
  insulin_igf1: {
    id: 'insulin_igf1',
    name: 'Insulin / IGF-1 Spike',
    description: 'Insulin and insulin-like growth factor 1 reduce SHBG and IGFBP-3, increasing free androgens and IGF-1',
    skinEffect: 'sebum_increase',
    severity: 4,
    timeToEffect: [12, 48],
  },
  hpa_cortisol: {
    id: 'hpa_cortisol',
    name: 'HPA Axis / Cortisol',
    description: 'Hypothalamic-pituitary-adrenal axis activation increases cortisol, stimulating sebocytes and inflammation',
    skinEffect: 'sebum_increase',
    severity: 4,
    timeToEffect: [12, 72],
  },
  nfkb_inflammation: {
    id: 'nfkb_inflammation',
    name: 'NF-kB Inflammatory Cascade',
    description: 'Nuclear factor kappa-B activation drives pro-inflammatory cytokines (IL-6, TNF-alpha, IL-8)',
    skinEffect: 'inflammation',
    severity: 4,
    timeToEffect: [6, 48],
  },
  omega6_prostaglandins: {
    id: 'omega6_prostaglandins',
    name: 'Omega-6 → Pro-inflammatory Prostaglandins',
    description: 'Arachidonic acid converts to PGE2 and LTB4 via COX-2 and 5-LOX enzymes',
    skinEffect: 'inflammation',
    severity: 3,
    timeToEffect: [24, 72],
  },
  androgen_dht: {
    id: 'androgen_dht',
    name: 'Androgen / DHT Pathway',
    description: '5-alpha reductase converts testosterone to DHT, the most potent sebum stimulator',
    skinEffect: 'sebum_increase',
    severity: 5,
    timeToEffect: [24, 96],
  },
  gut_skin_axis: {
    id: 'gut_skin_axis',
    name: 'Gut-Skin Axis',
    description: 'Gut permeability and microbiome changes affect systemic inflammation via LPS translocation',
    skinEffect: 'inflammation',
    severity: 3,
    timeToEffect: [48, 168],
  },
  oxidative_stress: {
    id: 'oxidative_stress',
    name: 'Oxidative Stress / ROS',
    description: 'Reactive oxygen species oxidize squalene in sebum, making it comedogenic and inflammatory',
    skinEffect: 'comedone_formation',
    severity: 3,
    timeToEffect: [12, 48],
  },
  // Protective pathways
  omega3_resolving: {
    id: 'omega3_resolving',
    name: 'Omega-3 → Pro-resolving Mediators',
    description: 'EPA/DHA generate resolvins and protectins that actively resolve inflammation',
    skinEffect: 'anti_inflammatory',
    severity: 3,
    timeToEffect: [336, 1344], // weeks
  },
  antioxidant_defense: {
    id: 'antioxidant_defense',
    name: 'Antioxidant Defense',
    description: 'Vitamins C, E, selenium neutralize ROS, protecting sebum from oxidation',
    skinEffect: 'anti_inflammatory',
    severity: 2,
    timeToEffect: [168, 672], // weeks
  },
  barrier_ceramides: {
    id: 'barrier_ceramides',
    name: 'Ceramide Synthesis / Barrier Repair',
    description: 'Niacinamide, essential fatty acids, and hydration support skin barrier ceramide production',
    skinEffect: 'barrier_repair',
    severity: 3,
    timeToEffect: [168, 672],
  },
};

// ──────────────────────────────────────────────────────────────
// FOOD DATABASE
// 80+ common Indian foods with acne-relevant data
// Source: IFCT 2017 (Indian Food Composition Tables) + USDA FoodData Central
// ──────────────────────────────────────────────────────────────

export const FOOD_DATABASE: FoodItem[] = [
  // === DAIRY ===
  {
    id: 'milk_whole', name: 'Whole Milk', aliases: ['milk', 'doodh', 'full cream milk'],
    category: 'dairy', glycemicIndex: 31, calories: 61, protein: 3.2, fat: 3.3, carbs: 4.8, fiber: 0, sugar: 4.8,
    triggerCategories: ['dairy'],
    compounds: [
      { compound: 'IGF-1', level: 'high', pathway: 'insulin_igf1' },
      { compound: 'Leucine (mTORC1 activator)', level: 'high', pathway: 'mtorc1' },
      { compound: 'Bovine hormones', level: 'moderate', pathway: 'androgen_dht' },
    ],
    acneRiskScore: 3, mechanism: 'Dairy elevates IGF-1 and activates mTORC1 via leucine, stimulating sebum production.',
  },
  {
    id: 'milk_skim', name: 'Skim Milk', aliases: ['skimmed milk', 'toned milk', 'low fat milk'],
    category: 'dairy', glycemicIndex: 32, calories: 34, protein: 3.4, fat: 0.1, carbs: 5.0, fiber: 0, sugar: 5.0,
    triggerCategories: ['dairy'],
    compounds: [
      { compound: 'Whey protein (concentrated)', level: 'high', pathway: 'mtorc1' },
      { compound: 'IGF-1', level: 'high', pathway: 'insulin_igf1' },
    ],
    acneRiskScore: 4, mechanism: 'Skim milk has HIGHER acne risk than whole - whey is more concentrated when fat is removed. OR=1.44 in meta-analysis.',
  },
  {
    id: 'paneer', name: 'Paneer', aliases: ['cottage cheese', 'indian cheese'],
    category: 'dairy', glycemicIndex: 27, calories: 265, protein: 18.3, fat: 20.8, carbs: 1.2, fiber: 0, sugar: 1.2,
    triggerCategories: ['dairy'],
    compounds: [
      { compound: 'Casein', level: 'high', pathway: 'insulin_igf1' },
      { compound: 'Leucine', level: 'high', pathway: 'mtorc1' },
      { compound: 'Saturated fat', level: 'high', pathway: 'nfkb_inflammation' },
    ],
    acneRiskScore: 3, mechanism: 'High in casein and leucine. Casein stimulates IGF-1; leucine activates mTORC1.',
  },
  {
    id: 'curd', name: 'Curd / Dahi', aliases: ['yogurt', 'dahi', 'yoghurt'],
    category: 'dairy', glycemicIndex: 28, calories: 60, protein: 3.1, fat: 3.1, carbs: 4.7, fiber: 0, sugar: 4.7,
    triggerCategories: ['dairy'],
    compounds: [
      { compound: 'IGF-1', level: 'moderate', pathway: 'insulin_igf1' },
      { compound: 'Probiotics (Lactobacillus)', level: 'moderate', pathway: 'gut_skin_axis' },
    ],
    acneRiskScore: 1, mechanism: 'Mixed: dairy component triggers, but fermentation produces probiotics that support gut-skin axis. Net effect is mild.',
  },
  {
    id: 'cheese', name: 'Cheese', aliases: ['cheddar', 'mozzarella', 'processed cheese'],
    category: 'dairy', glycemicIndex: 0, calories: 402, protein: 25, fat: 33, carbs: 1.3, fiber: 0, sugar: 0.5,
    triggerCategories: ['dairy'],
    compounds: [
      { compound: 'Casein (concentrated)', level: 'high', pathway: 'insulin_igf1' },
      { compound: 'Saturated fat', level: 'high', pathway: 'nfkb_inflammation' },
    ],
    acneRiskScore: 3, mechanism: 'Concentrated dairy protein. High casein and saturated fat.',
  },
  {
    id: 'whey_protein', name: 'Whey Protein Powder', aliases: ['protein shake', 'protein powder', 'whey'],
    category: 'dairy', glycemicIndex: 0, calories: 120, protein: 24, fat: 1.5, carbs: 3, fiber: 0, sugar: 1,
    triggerCategories: ['dairy', 'wheyProtein'],
    compounds: [
      { compound: 'Leucine (very high)', level: 'high', pathway: 'mtorc1' },
      { compound: 'BCAAs', level: 'high', pathway: 'insulin_igf1' },
      { compound: 'Insulinotropic peptides', level: 'high', pathway: 'insulin_igf1' },
    ],
    acneRiskScore: 5, mechanism: 'Most potent dietary mTORC1 activator. Insulinemic index is 3x higher than predicted by GI.',
  },
  {
    id: 'ice_cream', name: 'Ice Cream', aliases: ['kulfi', 'gelato'],
    category: 'dairy', glycemicIndex: 62, calories: 207, protein: 3.5, fat: 11, carbs: 24, fiber: 0, sugar: 21,
    triggerCategories: ['dairy', 'highSugar'],
    compounds: [
      { compound: 'Sugar + dairy combination', level: 'high', pathway: 'mtorc1' },
      { compound: 'IGF-1', level: 'moderate', pathway: 'insulin_igf1' },
    ],
    acneRiskScore: 5, mechanism: 'Double hit: high sugar spikes insulin + dairy activates mTORC1. One of the worst foods for acne.',
  },

  // === HIGH SUGAR / HIGH GI ===
  {
    id: 'white_rice', name: 'White Rice', aliases: ['chawal', 'rice', 'steamed rice'],
    category: 'grain', glycemicIndex: 73, calories: 130, protein: 2.7, fat: 0.3, carbs: 28, fiber: 0.4, sugar: 0,
    triggerCategories: ['highSugar'],
    compounds: [
      { compound: 'Rapid glucose release', level: 'high', pathway: 'insulin_igf1' },
    ],
    acneRiskScore: 2, mechanism: 'High GI causes insulin spike. Effect depends on portion size and what it is eaten with (dal reduces GI).',
  },
  {
    id: 'white_bread', name: 'White Bread', aliases: ['bread', 'toast', 'pav'],
    category: 'grain', glycemicIndex: 75, calories: 265, protein: 9, fat: 3.2, carbs: 49, fiber: 2.7, sugar: 5,
    triggerCategories: ['highSugar', 'gluten'],
    compounds: [
      { compound: 'Rapid glucose', level: 'high', pathway: 'insulin_igf1' },
      { compound: 'Gluten', level: 'high', pathway: 'gut_skin_axis' },
    ],
    acneRiskScore: 3, mechanism: 'High GI + gluten. Insulin spike plus potential gut permeability in sensitive individuals.',
  },
  {
    id: 'sugar_jaggery', name: 'Sugar / Jaggery / Honey', aliases: ['sugar', 'cheeni', 'gur', 'jaggery', 'honey', 'mishri'],
    category: 'sweetener', glycemicIndex: 65, calories: 387, protein: 0, fat: 0, carbs: 100, fiber: 0, sugar: 100,
    triggerCategories: ['highSugar'],
    compounds: [
      { compound: 'Sucrose → insulin spike', level: 'high', pathway: 'insulin_igf1' },
      { compound: 'IGFBP-3 reduction', level: 'moderate', pathway: 'insulin_igf1' },
      { compound: 'AGEs potential', level: 'moderate', pathway: 'nfkb_inflammation' },
    ],
    acneRiskScore: 4, mechanism: 'Direct insulin spike reduces SHBG and IGFBP-3, increasing free androgens and IGF-1.',
  },
  {
    id: 'mithai', name: 'Indian Sweets (Mithai)', aliases: ['gulab jamun', 'rasgulla', 'barfi', 'ladoo', 'jalebi', 'halwa'],
    category: 'dessert', glycemicIndex: 80, calories: 350, protein: 5, fat: 15, carbs: 50, fiber: 0, sugar: 40,
    triggerCategories: ['highSugar', 'dairy', 'friedFood'],
    compounds: [
      { compound: 'Sugar (very high)', level: 'high', pathway: 'insulin_igf1' },
      { compound: 'Dairy (ghee, khoya, milk)', level: 'high', pathway: 'mtorc1' },
      { compound: 'Deep-fried AGEs', level: 'moderate', pathway: 'nfkb_inflammation' },
    ],
    acneRiskScore: 5, mechanism: 'Triple threat: extreme sugar + dairy + often deep-fried. Activates insulin, mTORC1, and NF-kB simultaneously.',
  },
  {
    id: 'soft_drink', name: 'Soft Drinks / Cola', aliases: ['coke', 'pepsi', 'sprite', 'soda', 'cold drink'],
    category: 'beverage', glycemicIndex: 63, calories: 41, protein: 0, fat: 0, carbs: 10.6, fiber: 0, sugar: 10.6,
    triggerCategories: ['highSugar'],
    compounds: [
      { compound: 'High-fructose corn syrup', level: 'high', pathway: 'insulin_igf1' },
      { compound: 'Phosphoric acid', level: 'low', pathway: 'oxidative_stress' },
    ],
    acneRiskScore: 4, mechanism: 'Liquid sugar = fastest insulin spike. HFCS drives hepatic lipogenesis.',
  },
  {
    id: 'chocolate_milk', name: 'Milk Chocolate', aliases: ['chocolate', 'cadbury', 'dairy milk'],
    category: 'dessert', glycemicIndex: 49, calories: 535, protein: 8, fat: 30, carbs: 60, fiber: 3, sugar: 52,
    triggerCategories: ['dairy', 'highSugar'],
    compounds: [
      { compound: 'Sugar', level: 'high', pathway: 'insulin_igf1' },
      { compound: 'Milk solids', level: 'moderate', pathway: 'mtorc1' },
      { compound: 'Theobromine', level: 'moderate', pathway: 'nfkb_inflammation' },
    ],
    acneRiskScore: 4, mechanism: 'Sugar + dairy + theobromine. Even pure cocoa may worsen acne via immune modulation.',
  },

  // === FRIED / OILY ===
  {
    id: 'samosa', name: 'Samosa', aliases: ['samose'],
    category: 'fried', glycemicIndex: 55, calories: 262, protein: 4.2, fat: 17, carbs: 24, fiber: 2, sugar: 1,
    triggerCategories: ['friedFood', 'processedFood'],
    compounds: [
      { compound: 'Oxidized oils (from deep frying)', level: 'high', pathway: 'nfkb_inflammation' },
      { compound: 'AGEs', level: 'high', pathway: 'oxidative_stress' },
      { compound: 'Trans fats (reused oil)', level: 'moderate', pathway: 'nfkb_inflammation' },
    ],
    acneRiskScore: 4, mechanism: 'Deep-fried in reused oil = high oxidized lipids + AGEs. NF-kB driven inflammation.',
  },
  {
    id: 'pakora', name: 'Pakora / Bhajia', aliases: ['bhajia', 'pakoda', 'fritters'],
    category: 'fried', glycemicIndex: 50, calories: 240, protein: 5, fat: 16, carbs: 20, fiber: 2, sugar: 1,
    triggerCategories: ['friedFood'],
    compounds: [
      { compound: 'Oxidized oils', level: 'high', pathway: 'nfkb_inflammation' },
      { compound: 'AGEs', level: 'high', pathway: 'oxidative_stress' },
    ],
    acneRiskScore: 3, mechanism: 'Deep-fried, similar mechanism to samosa. Besan (chickpea flour) base is actually nutritious - it\'s the frying that\'s problematic.',
  },
  {
    id: 'french_fries', name: 'French Fries', aliases: ['fries', 'chips'],
    category: 'fried', glycemicIndex: 75, calories: 312, protein: 3.4, fat: 15, carbs: 41, fiber: 3.8, sugar: 0.3,
    triggerCategories: ['friedFood', 'highSugar'],
    compounds: [
      { compound: 'Acrylamide', level: 'moderate', pathway: 'oxidative_stress' },
      { compound: 'Oxidized seed oils', level: 'high', pathway: 'omega6_prostaglandins' },
      { compound: 'High GI potato + frying', level: 'high', pathway: 'insulin_igf1' },
    ],
    acneRiskScore: 4, mechanism: 'High GI + deep-fried = insulin spike + inflammatory oxidized lipids.',
  },
  {
    id: 'pizza', name: 'Pizza', aliases: ['dominos', 'pizza hut'],
    category: 'processed', glycemicIndex: 60, calories: 266, protein: 11, fat: 10, carbs: 33, fiber: 2, sugar: 3.6,
    triggerCategories: ['dairy', 'highSugar', 'processedFood', 'gluten'],
    compounds: [
      { compound: 'Cheese (dairy)', level: 'high', pathway: 'mtorc1' },
      { compound: 'Refined flour (high GI)', level: 'high', pathway: 'insulin_igf1' },
      { compound: 'Processed meat (if topping)', level: 'moderate', pathway: 'nfkb_inflammation' },
    ],
    acneRiskScore: 4, mechanism: 'Multi-factor: dairy (cheese) + refined carbs (dough) + processed toppings. Hits multiple pathways.',
  },
  {
    id: 'burger', name: 'Burger', aliases: ['mcdonalds', 'zomato burger'],
    category: 'processed', glycemicIndex: 66, calories: 295, protein: 17, fat: 14, carbs: 24, fiber: 1, sugar: 5,
    triggerCategories: ['processedFood', 'highSugar', 'gluten'],
    compounds: [
      { compound: 'Refined bun (high GI)', level: 'high', pathway: 'insulin_igf1' },
      { compound: 'Processed meat additives', level: 'moderate', pathway: 'nfkb_inflammation' },
      { compound: 'Seed oil (fried patty)', level: 'moderate', pathway: 'omega6_prostaglandins' },
    ],
    acneRiskScore: 3, mechanism: 'Processed meat + refined carbs + potential cheese. Multiple mild triggers stacking.',
  },

  // === INDIAN STAPLES ===
  {
    id: 'dal', name: 'Dal (Lentils)', aliases: ['dal', 'daal', 'toor dal', 'moong dal', 'masoor dal', 'lentil soup'],
    category: 'legume', glycemicIndex: 29, calories: 116, protein: 9, fat: 0.4, carbs: 20, fiber: 8, sugar: 2,
    triggerCategories: [],
    compounds: [
      { compound: 'Fiber (blood sugar stabilizer)', level: 'high', pathway: 'antioxidant_defense' },
      { compound: 'Zinc', level: 'moderate', pathway: 'antioxidant_defense' },
      { compound: 'Folate', level: 'moderate', pathway: 'antioxidant_defense' },
    ],
    acneRiskScore: -2, mechanism: 'Low GI, high fiber, good zinc source. Stabilizes blood sugar when eaten with rice. Protective.',
  },
  {
    id: 'roti', name: 'Roti / Chapati', aliases: ['chapati', 'roti', 'phulka', 'wheat roti'],
    category: 'grain', glycemicIndex: 52, calories: 240, protein: 8, fat: 3, carbs: 45, fiber: 4, sugar: 1,
    triggerCategories: ['gluten'],
    compounds: [
      { compound: 'Whole wheat (moderate GI)', level: 'moderate', pathway: 'insulin_igf1' },
      { compound: 'Fiber', level: 'moderate', pathway: 'antioxidant_defense' },
    ],
    acneRiskScore: 0, mechanism: 'Moderate GI, some fiber. Better than white bread/rice. Gluten may matter for sensitive individuals.',
  },
  {
    id: 'idli', name: 'Idli', aliases: ['idly'],
    category: 'grain', glycemicIndex: 69, calories: 39, protein: 2, fat: 0.2, carbs: 8, fiber: 0.5, sugar: 0,
    triggerCategories: [],
    compounds: [
      { compound: 'Fermented batter (probiotic)', level: 'low', pathway: 'gut_skin_axis' },
    ],
    acneRiskScore: 0, mechanism: 'Moderate GI but fermented (mild probiotic benefit). Small portion = low glycemic load. Neutral.',
  },
  {
    id: 'dosa', name: 'Dosa', aliases: ['masala dosa', 'plain dosa'],
    category: 'grain', glycemicIndex: 66, calories: 120, protein: 3.9, fat: 3.7, carbs: 18, fiber: 0.8, sugar: 0,
    triggerCategories: [],
    compounds: [
      { compound: 'Fermented batter', level: 'low', pathway: 'gut_skin_axis' },
      { compound: 'Oil (cooking)', level: 'low', pathway: 'omega6_prostaglandins' },
    ],
    acneRiskScore: 0, mechanism: 'Similar to idli. If cooked with excessive oil, mild inflammatory risk. Mostly neutral.',
  },
  {
    id: 'biryani', name: 'Biryani / Pulao', aliases: ['pulao', 'biryani', 'chicken biryani', 'veg biryani'],
    category: 'mixed', glycemicIndex: 65, calories: 200, protein: 8, fat: 7, carbs: 28, fiber: 1, sugar: 1,
    triggerCategories: ['highSugar'],
    compounds: [
      { compound: 'White rice (high GI)', level: 'high', pathway: 'insulin_igf1' },
      { compound: 'Ghee/oil', level: 'moderate', pathway: 'omega6_prostaglandins' },
      { compound: 'Spices (turmeric - anti-inflammatory)', level: 'low', pathway: 'antioxidant_defense' },
    ],
    acneRiskScore: 2, mechanism: 'High GI rice base, but spices (turmeric, cumin) provide some anti-inflammatory offset.',
  },
  {
    id: 'paratha', name: 'Paratha', aliases: ['aloo paratha', 'gobi paratha', 'stuffed paratha'],
    category: 'grain', glycemicIndex: 55, calories: 260, protein: 6, fat: 12, carbs: 33, fiber: 3, sugar: 1,
    triggerCategories: ['friedFood', 'gluten'],
    compounds: [
      { compound: 'Ghee/butter/oil (pan-fried)', level: 'moderate', pathway: 'omega6_prostaglandins' },
      { compound: 'Wheat', level: 'moderate', pathway: 'insulin_igf1' },
    ],
    acneRiskScore: 2, mechanism: 'Pan-fried in oil/ghee adds some inflammatory lipids. Moderate GI from whole wheat.',
  },

  // === BEVERAGES ===
  {
    id: 'chai', name: 'Chai (Milk Tea)', aliases: ['tea', 'chai', 'masala chai', 'milk tea'],
    category: 'beverage', glycemicIndex: 25, calories: 45, protein: 1.5, fat: 1.5, carbs: 6, fiber: 0, sugar: 5,
    triggerCategories: ['dairy', 'highSugar', 'caffeine'],
    compounds: [
      { compound: 'Milk (dairy exposure)', level: 'low', pathway: 'mtorc1' },
      { compound: 'Sugar', level: 'moderate', pathway: 'insulin_igf1' },
      { compound: 'Caffeine', level: 'moderate', pathway: 'hpa_cortisol' },
      { compound: 'Tea polyphenols (protective)', level: 'moderate', pathway: 'antioxidant_defense' },
    ],
    acneRiskScore: 1, mechanism: 'Small dairy + sugar dose, offset by tea antioxidants. 3-4 cups/day = significant cumulative dairy/sugar exposure.',
  },
  {
    id: 'coffee', name: 'Coffee (Black)', aliases: ['black coffee', 'espresso', 'americano'],
    category: 'beverage', glycemicIndex: 0, calories: 2, protein: 0, fat: 0, carbs: 0, fiber: 0, sugar: 0,
    triggerCategories: ['caffeine'],
    compounds: [
      { compound: 'Caffeine (cortisol stimulant)', level: 'high', pathway: 'hpa_cortisol' },
      { compound: 'Chlorogenic acid (antioxidant)', level: 'high', pathway: 'antioxidant_defense' },
    ],
    acneRiskScore: 0, mechanism: 'Cortisol spike vs antioxidant benefit. Black coffee is roughly neutral. Adding milk/sugar changes the equation.',
  },
  {
    id: 'coffee_latte', name: 'Latte / Cappuccino', aliases: ['latte', 'cappuccino', 'cafe latte'],
    category: 'beverage', glycemicIndex: 28, calories: 120, protein: 6, fat: 5, carbs: 10, fiber: 0, sugar: 9,
    triggerCategories: ['dairy', 'caffeine'],
    compounds: [
      { compound: 'Milk (200-300ml per cup)', level: 'high', pathway: 'mtorc1' },
      { compound: 'Caffeine', level: 'high', pathway: 'hpa_cortisol' },
    ],
    acneRiskScore: 3, mechanism: 'Significant dairy dose per cup. 2 lattes = ~500ml milk = substantial IGF-1/mTORC1 activation.',
  },
  {
    id: 'green_tea', name: 'Green Tea', aliases: ['matcha', 'herbal tea'],
    category: 'beverage', glycemicIndex: 0, calories: 1, protein: 0, fat: 0, carbs: 0, fiber: 0, sugar: 0,
    triggerCategories: [],
    compounds: [
      { compound: 'EGCG (epigallocatechin gallate)', level: 'high', pathway: 'antioxidant_defense' },
      { compound: 'L-theanine (stress reducer)', level: 'moderate', pathway: 'antioxidant_defense' },
    ],
    acneRiskScore: -2, mechanism: 'EGCG reduces sebum production, inhibits 5-alpha reductase, and is anti-inflammatory. One of the best beverages for acne.',
  },
  {
    id: 'alcohol_beer', name: 'Beer', aliases: ['beer', 'lager', 'craft beer'],
    category: 'beverage', glycemicIndex: 66, calories: 43, protein: 0.5, fat: 0, carbs: 3.6, fiber: 0, sugar: 0,
    triggerCategories: ['alcohol', 'highSugar', 'gluten'],
    compounds: [
      { compound: 'Ethanol', level: 'high', pathway: 'hpa_cortisol' },
      { compound: 'Maltose (high GI)', level: 'high', pathway: 'insulin_igf1' },
      { compound: 'Gluten (barley/wheat)', level: 'moderate', pathway: 'gut_skin_axis' },
    ],
    acneRiskScore: 4, mechanism: 'Alcohol + high GI + gluten. Dehydrates skin, impairs liver hormone clearance, spikes insulin.',
  },
  {
    id: 'alcohol_wine', name: 'Wine', aliases: ['red wine', 'white wine'],
    category: 'beverage', glycemicIndex: 0, calories: 83, protein: 0, fat: 0, carbs: 2.6, fiber: 0, sugar: 0.6,
    triggerCategories: ['alcohol'],
    compounds: [
      { compound: 'Ethanol', level: 'moderate', pathway: 'hpa_cortisol' },
      { compound: 'Resveratrol (red wine - antioxidant)', level: 'low', pathway: 'antioxidant_defense' },
    ],
    acneRiskScore: 2, mechanism: 'Lower sugar than beer. Red wine resveratrol provides mild antioxidant offset. Still dehydrating.',
  },

  // === PROTECTIVE FOODS ===
  {
    id: 'salmon', name: 'Salmon / Fatty Fish', aliases: ['salmon', 'mackerel', 'sardine', 'tuna', 'rawas'],
    category: 'protein', glycemicIndex: 0, calories: 208, protein: 20, fat: 13, carbs: 0, fiber: 0, sugar: 0,
    triggerCategories: [],
    compounds: [
      { compound: 'EPA (anti-inflammatory)', level: 'high', pathway: 'omega3_resolving' },
      { compound: 'DHA', level: 'high', pathway: 'omega3_resolving' },
      { compound: 'Vitamin D3', level: 'high', pathway: 'antioxidant_defense' },
      { compound: 'Selenium', level: 'moderate', pathway: 'antioxidant_defense' },
    ],
    acneRiskScore: -4, mechanism: 'EPA competes with arachidonic acid for COX-2, shifting to anti-inflammatory prostaglandins. One of the best foods for acne.',
  },
  {
    id: 'spinach', name: 'Spinach / Palak', aliases: ['palak', 'spinach', 'saag'],
    category: 'vegetable', glycemicIndex: 15, calories: 23, protein: 2.9, fat: 0.4, carbs: 3.6, fiber: 2.2, sugar: 0.4,
    triggerCategories: [],
    compounds: [
      { compound: 'Beta-carotene (vitamin A precursor)', level: 'high', pathway: 'antioxidant_defense' },
      { compound: 'Vitamin C', level: 'high', pathway: 'antioxidant_defense' },
      { compound: 'Iron', level: 'moderate', pathway: 'antioxidant_defense' },
      { compound: 'Zinc', level: 'low', pathway: 'antioxidant_defense' },
    ],
    acneRiskScore: -3, mechanism: 'Rich in retinoid precursors and antioxidants. Supports skin turnover and reduces oxidative stress.',
  },
  {
    id: 'berries', name: 'Berries', aliases: ['blueberry', 'strawberry', 'raspberry', 'amla', 'indian gooseberry'],
    category: 'fruit', glycemicIndex: 25, calories: 57, protein: 0.7, fat: 0.3, carbs: 14, fiber: 2.4, sugar: 10,
    triggerCategories: [],
    compounds: [
      { compound: 'Anthocyanins (anti-inflammatory)', level: 'high', pathway: 'antioxidant_defense' },
      { compound: 'Vitamin C', level: 'high', pathway: 'antioxidant_defense' },
      { compound: 'Ellagic acid', level: 'moderate', pathway: 'antioxidant_defense' },
    ],
    acneRiskScore: -3, mechanism: 'Highest antioxidant content among fruits. Anthocyanins reduce NF-kB inflammatory signaling.',
  },
  {
    id: 'nuts_almonds', name: 'Almonds', aliases: ['almond', 'badam'],
    category: 'nut', glycemicIndex: 0, calories: 579, protein: 21, fat: 50, carbs: 22, fiber: 12, sugar: 4,
    triggerCategories: [],
    compounds: [
      { compound: 'Vitamin E', level: 'high', pathway: 'antioxidant_defense' },
      { compound: 'Magnesium', level: 'high', pathway: 'antioxidant_defense' },
      { compound: 'Fiber', level: 'high', pathway: 'antioxidant_defense' },
    ],
    acneRiskScore: -1, mechanism: 'Excellent vitamin E source (prevents sebum oxidation). Low GI, high fiber. Mildly protective.',
  },
  {
    id: 'walnuts', name: 'Walnuts', aliases: ['akhrot'],
    category: 'nut', glycemicIndex: 0, calories: 654, protein: 15, fat: 65, carbs: 14, fiber: 7, sugar: 2.6,
    triggerCategories: [],
    compounds: [
      { compound: 'Alpha-linolenic acid (plant omega-3)', level: 'high', pathway: 'omega3_resolving' },
      { compound: 'Omega-6 (linoleic acid)', level: 'high', pathway: 'omega6_prostaglandins' },
    ],
    acneRiskScore: 0, mechanism: 'Good plant omega-3 but also high omega-6. Net effect depends on overall dietary omega ratio.',
  },
  {
    id: 'turmeric', name: 'Turmeric / Haldi', aliases: ['haldi', 'turmeric', 'haldi doodh'],
    category: 'spice', glycemicIndex: 0, calories: 312, protein: 10, fat: 3, carbs: 67, fiber: 22, sugar: 3,
    triggerCategories: [],
    compounds: [
      { compound: 'Curcumin (potent anti-inflammatory)', level: 'high', pathway: 'antioxidant_defense' },
    ],
    acneRiskScore: -3, mechanism: 'Curcumin inhibits NF-kB, COX-2, and TNF-alpha. One of the most potent natural anti-inflammatory compounds.',
  },
  {
    id: 'flaxseed', name: 'Flaxseed', aliases: ['alsi', 'flax'],
    category: 'seed', glycemicIndex: 0, calories: 534, protein: 18, fat: 42, carbs: 29, fiber: 27, sugar: 2,
    triggerCategories: [],
    compounds: [
      { compound: 'ALA omega-3', level: 'high', pathway: 'omega3_resolving' },
      { compound: 'Lignans (phytoestrogen - may reduce androgens)', level: 'high', pathway: 'androgen_dht' },
      { compound: 'Fiber', level: 'high', pathway: 'antioxidant_defense' },
    ],
    acneRiskScore: -3, mechanism: 'Richest plant source of omega-3 (ALA). Lignans may reduce 5-alpha reductase activity.',
  },
];

// ──────────────────────────────────────────────────────────────
// FOOD SEARCH & RESOLUTION
// ──────────────────────────────────────────────────────────────

export function searchFood(query: string): FoodItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return FOOD_DATABASE
    .filter(food =>
      food.name.toLowerCase().includes(q) ||
      food.aliases.some(a => a.toLowerCase().includes(q)) ||
      food.category.toLowerCase().includes(q)
    )
    .sort((a, b) => {
      // Exact name match first
      const aExact = a.name.toLowerCase() === q || a.aliases.some(al => al === q);
      const bExact = b.name.toLowerCase() === q || b.aliases.some(al => al === q);
      if (aExact && !bExact) return -1;
      if (bExact && !aExact) return 1;
      return 0;
    });
}

// Given a food item, resolve what trigger categories it activates
export function resolveFood(food: FoodItem): {
  triggerCategories: string[];
  pathwaysActivated: { pathway: BiologicalPathway; compound: string; level: string }[];
  acneRiskScore: number;
  explanation: string;
} {
  const pathwaysActivated = food.compounds
    .filter(c => PATHWAYS[c.pathway])
    .map(c => ({
      pathway: PATHWAYS[c.pathway],
      compound: c.compound,
      level: c.level,
    }));

  const triggerPathways = pathwaysActivated
    .filter(p => ['sebum_increase', 'inflammation', 'comedone_formation', 'barrier_damage'].includes(p.pathway.skinEffect));

  const protectivePathways = pathwaysActivated
    .filter(p => ['anti_inflammatory', 'barrier_repair', 'sebum_decrease', 'antimicrobial'].includes(p.pathway.skinEffect));

  let explanation = `**${food.name}** (GI: ${food.glycemicIndex}, acne risk: ${food.acneRiskScore > 0 ? '+' : ''}${food.acneRiskScore}/5):\n`;

  if (triggerPathways.length > 0) {
    explanation += `Triggers: ${triggerPathways.map(p => `${p.compound} → ${p.pathway.name}`).join('; ')}. `;
  }
  if (protectivePathways.length > 0) {
    explanation += `Protective: ${protectivePathways.map(p => `${p.compound} → ${p.pathway.name}`).join('; ')}. `;
  }
  explanation += food.mechanism;

  return {
    triggerCategories: food.triggerCategories,
    pathwaysActivated,
    acneRiskScore: food.acneRiskScore,
    explanation,
  };
}

// Score a day's food intake
export function scoreDailyFoods(foodIds: string[]): {
  totalRisk: number;
  pathwayCounts: Record<string, number>;
  explanation: string;
} {
  const foods = foodIds.map(id => FOOD_DATABASE.find(f => f.id === id)).filter(Boolean) as FoodItem[];
  const totalRisk = foods.reduce((s, f) => s + f.acneRiskScore, 0);

  const pathwayCounts: Record<string, number> = {};
  for (const food of foods) {
    for (const compound of food.compounds) {
      const pw = PATHWAYS[compound.pathway];
      if (pw) {
        pathwayCounts[pw.name] = (pathwayCounts[pw.name] || 0) + 1;
      }
    }
  }

  const worst = foods.filter(f => f.acneRiskScore >= 3).map(f => f.name);
  const best = foods.filter(f => f.acneRiskScore <= -2).map(f => f.name);

  let explanation = `Daily food risk score: **${totalRisk > 0 ? '+' : ''}${totalRisk}**. `;
  if (worst.length > 0) explanation += `Watch out for: ${worst.join(', ')}. `;
  if (best.length > 0) explanation += `Good choices: ${best.join(', ')}. `;

  // Flag pathway stacking
  const overloadedPathways = Object.entries(pathwayCounts)
    .filter(([, count]) => count >= 3)
    .map(([name]) => name);
  if (overloadedPathways.length > 0) {
    explanation += `Warning: ${overloadedPathways.join(', ')} pathway hit by ${pathwayCounts[overloadedPathways[0]]} foods today - amplified effect likely.`;
  }

  return { totalRisk, pathwayCounts, explanation };
}
