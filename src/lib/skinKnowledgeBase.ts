// ============================================================
// Skin Science Knowledge Base
// Structured data for the pattern detection engine.
// Sources: peer-reviewed dermatology literature, noted inline.
// ============================================================

// ──────────────────────────────────────────────────────────────
// 1. FOOD → SKIN MECHANISMS
// ──────────────────────────────────────────────────────────────

export type EvidenceStrength = 'strong' | 'moderate' | 'weak' | 'protective' | 'mixed';

export interface FoodSkinProfile {
  category: string;
  glycemicIndexRange: [number, number]; // [low, high]
  acneRelevantCompounds: string[];
  evidenceStrength: EvidenceStrength;
  /** Typical onset delay in hours: [min, max] */
  onsetDelayHours: [number, number];
  mechanism: string;
  keyStudies: string[];
}

export const FOOD_SKIN_PROFILES: Record<string, FoodSkinProfile> = {
  dairy: {
    category: 'Dairy',
    glycemicIndexRange: [15, 40],
    acneRelevantCompounds: [
      'IGF-1 (insulin-like growth factor 1)',
      'bovine hormones (estrogen, progesterone, androgens)',
      'leucine (mTORC1 activator)',
      'whey proteins (insulinotropic)',
    ],
    evidenceStrength: 'strong',
    onsetDelayHours: [24, 72],
    mechanism:
      'Dairy elevates circulating IGF-1 and activates the mTORC1 signaling pathway, ' +
      'stimulating sebocyte proliferation, lipogenesis, and androgen-mediated sebum production. ' +
      'Skim milk shows stronger association than full-fat, likely because whey protein concentration ' +
      'is higher and whey is strongly insulinotropic. Bovine hormones (5-alpha-pregnanedione) can ' +
      'be converted to DHT in skin, directly stimulating sebaceous glands.',
    keyStudies: [
      'Adebamowo et al., J Am Acad Dermatol, 2005 - NHS II cohort (n=47,355): positive association skim milk & acne',
      'Melnik, Exp Dermatol, 2015 - mTORC1-driven sebocyte lipogenesis via dairy',
      'Juhl et al., J Eur Acad Dermatol Venereol, 2018 - meta-analysis: any dairy OR 1.25, skim milk OR 1.44',
      'Aghasi et al., Clin Nutr, 2019 - meta-analysis: dairy consumption increases acne risk OR 1.25',
    ],
  },

  sugar: {
    category: 'High Sugar / High Glycemic Foods',
    glycemicIndexRange: [65, 100],
    acneRelevantCompounds: [
      'insulin spike',
      'IGF-1 elevation',
      'IGFBP-3 reduction (frees more IGF-1)',
      'SHBG reduction (increases free androgens)',
      'pro-inflammatory cytokines (IL-6, TNF-alpha)',
    ],
    evidenceStrength: 'strong',
    onsetDelayHours: [12, 48],
    mechanism:
      'High-glycemic-load foods cause rapid insulin spikes. Insulin reduces SHBG (sex hormone ' +
      'binding globulin) and IGFBP-3, increasing bioavailable androgens and free IGF-1. This ' +
      'activates the PI3K/Akt/mTORC1 pathway in sebocytes and keratinocytes, increasing sebum ' +
      'production, follicular hyperkeratinization, and inflammatory mediator release. Chronic ' +
      'hyperglycemia also promotes advanced glycation end-products (AGEs) that trigger inflammation.',
    keyStudies: [
      'Smith et al., Am J Clin Nutr, 2007 - low-GL diet reduced acne lesion count significantly over 12 weeks',
      'Kwon et al., J Acad Nutr Diet, 2012 - low-GL diet reduced inflammatory acne by 51%',
      'Burris et al., J Acad Nutr Diet, 2013 - higher GL associated with increased acne severity',
      'Dall\'Oglio et al., Nutrients, 2021 - glycemic load is an independent predictor of acne severity',
    ],
  },

  gluten: {
    category: 'Gluten-heavy Foods',
    glycemicIndexRange: [55, 85],
    acneRelevantCompounds: [
      'zonulin (intestinal permeability modulator)',
      'tissue transglutaminase antibodies',
      'inflammatory cascade (in sensitive individuals)',
    ],
    evidenceStrength: 'weak',
    onsetDelayHours: [24, 96],
    mechanism:
      'Direct gluten-acne evidence is limited. In celiac disease or non-celiac gluten sensitivity, ' +
      'gluten increases intestinal permeability via zonulin release, potentially allowing endotoxins ' +
      'into systemic circulation and triggering inflammatory cytokines (IL-17, TNF-alpha). This ' +
      'systemic inflammation can theoretically worsen acne. However, most gluten-containing foods ' +
      'are also high-GI (white bread, pastries), making it hard to isolate gluten as an independent factor. ' +
      'The acne effect is likely driven by glycemic load rather than gluten itself in most people.',
    keyStudies: [
      'Bowe & Logan, Gut Pathog, 2011 - gut-brain-skin axis theory linking gut permeability to acne',
      'Fasano, Ann N Y Acad Sci, 2012 - zonulin and intestinal permeability',
      'Drago et al., Scand J Gastroenterol, 2006 - gluten increases intestinal permeability even in non-celiacs',
    ],
  },

  friedFood: {
    category: 'Fried / Oily Food',
    glycemicIndexRange: [50, 80],
    acneRelevantCompounds: [
      'oxidized lipids (lipid peroxides)',
      'advanced glycation end-products (AGEs from deep frying)',
      'omega-6 fatty acids (arachidonic acid → pro-inflammatory prostaglandins)',
      'trans fats (NF-kB activator)',
    ],
    evidenceStrength: 'moderate',
    onsetDelayHours: [24, 72],
    mechanism:
      'Deep frying generates oxidized lipids and AGEs that activate NF-kB inflammatory pathways. ' +
      'High omega-6 to omega-3 ratios promote arachidonic acid conversion to pro-inflammatory ' +
      'prostaglandin E2 (PGE2) and leukotriene B4 (LTB4), both of which drive inflammatory acne. ' +
      'Trans fats from partially hydrogenated oils directly activate inflammatory transcription factors. ' +
      'Dietary fat composition does NOT directly become sebum, but inflammatory signaling increases ' +
      'sebocyte activity and follicular inflammation.',
    keyStudies: [
      'Penso et al., JAMA Dermatol, 2020 - fatty/sugary food associated with acne (NutriNet-Santé cohort, n=24,452)',
      'Huang et al., Clin Cosmet Investig Dermatol, 2019 - fried food intake significantly associated with acne in Chinese adolescents',
      'Sohn, Ann Dermatol, 2019 - high-fat diet worsens acne through sebogenesis upregulation',
    ],
  },

  alcohol: {
    category: 'Alcohol',
    glycemicIndexRange: [0, 65],
    acneRelevantCompounds: [
      'acetaldehyde (toxic metabolite)',
      'estrogen elevation',
      'cortisol increase',
      'immune suppression (reduced T-cell function)',
      'liver enzyme competition (impairs hormone clearance)',
      'dehydration',
    ],
    evidenceStrength: 'moderate',
    onsetDelayHours: [12, 48],
    mechanism:
      'Alcohol impairs hepatic clearance of androgens and estrogens, potentially increasing ' +
      'circulating hormone levels. It elevates cortisol (which promotes sebum production), suppresses ' +
      'immune function (reducing ability to fight C. acnes), and causes vasodilation/inflammation. ' +
      'Alcohol also depletes vitamin A, zinc, and B vitamins critical for skin health. Beer and ' +
      'sweet cocktails additionally spike insulin. Dehydration impairs skin barrier function. ' +
      'The effect is dose-dependent; moderate consumption shows weaker association.',
    keyStudies: [
      'Juhl et al., J Am Acad Dermatol, 2018 - alcohol consumption weakly associated with acne risk',
      'Suh & Youn, Clin Dermatol, 2010 - alcohol effects on skin barrier and immune function',
      'Goodman, Clin Dermatol, 2010 - nutritional influences on skin including alcohol',
    ],
  },

  caffeine: {
    category: 'Caffeine',
    glycemicIndexRange: [0, 0],
    acneRelevantCompounds: [
      'cortisol stimulation (via HPA axis)',
      'insulin sensitivity reduction (acute)',
      'antioxidant polyphenols (coffee)',
      'adenosine receptor antagonism → stress hormone amplification',
    ],
    evidenceStrength: 'weak',
    onsetDelayHours: [12, 48],
    mechanism:
      'Caffeine stimulates the hypothalamic-pituitary-adrenal (HPA) axis, acutely raising cortisol ' +
      'and catecholamines, which can increase sebum production. It transiently reduces insulin sensitivity. ' +
      'However, coffee contains chlorogenic acid and other polyphenols with anti-inflammatory and ' +
      'antioxidant properties that may be protective. Net effect depends on: amount consumed, added ' +
      'sugar/cream, individual cortisol sensitivity, and habituation. Black coffee likely neutral to ' +
      'slightly protective; sweetened/creamy coffee is a net negative.',
    keyStudies: [
      'Lovallo et al., Psychosom Med, 2005 - caffeine increases cortisol at rest and during stress',
      'Moisey et al., Am J Clin Nutr, 2008 - caffeine reduces insulin sensitivity acutely',
      'Freedman et al., J Invest Dermatol, 2012 - inverse association between coffee and melanoma (antioxidant potential)',
    ],
  },

  spicyFood: {
    category: 'Spicy Food',
    glycemicIndexRange: [30, 70],
    acneRelevantCompounds: [
      'capsaicin (TRPV1 receptor agonist)',
      'substance P (neuropeptide)',
      'vasodilation mediators',
    ],
    evidenceStrength: 'weak',
    onsetDelayHours: [6, 48],
    mechanism:
      'Capsaicin activates TRPV1 receptors on sensory neurons and sebocytes, triggering release of ' +
      'substance P, a neuropeptide that promotes sebocyte proliferation and lipogenesis. TRPV1 activation ' +
      'also causes neurogenic inflammation and vasodilation, which can mimic or worsen inflammatory acne ' +
      'appearance. However, capsaicin also has systemic anti-inflammatory properties (inhibits NF-kB). ' +
      'The effect is most pronounced in rosacea-prone skin and may be minimal for pure comedonal acne. ' +
      'Often confounded by the oily/fatty preparation of spicy foods.',
    keyStudies: [
      'Lee et al., J Invest Dermatol, 2008 - TRPV1 activation increases substance P and sebocyte lipogenesis',
      'Yoon et al., J Dermatol, 2013 - spicy food associated with acne in Korean population survey',
      'Li et al., Front Pharmacol, 2020 - dual pro/anti-inflammatory properties of capsaicin',
    ],
  },

  processedFood: {
    category: 'Processed / Ultra-processed Food',
    glycemicIndexRange: [55, 90],
    acneRelevantCompounds: [
      'advanced glycation end-products (AGEs)',
      'emulsifiers (gut barrier disruption)',
      'high-fructose corn syrup (lipogenesis driver)',
      'sodium (fluid retention, inflammation)',
      'preservatives (gut microbiome disruption)',
      'omega-6 seed oils',
    ],
    evidenceStrength: 'moderate',
    onsetDelayHours: [24, 72],
    mechanism:
      'Ultra-processed foods deliver multiple acne-promoting insults simultaneously: high glycemic load ' +
      '(insulin/IGF-1 spikes), AGEs from thermal processing (RAGE-mediated inflammation), emulsifiers ' +
      'that disrupt gut barrier integrity (LPS translocation → systemic inflammation), and omega-6-heavy ' +
      'seed oils that shift the inflammatory balance. HFCS drives hepatic de novo lipogenesis, increasing ' +
      'VLDL and potentially sebum. The synergistic effect of multiple mechanisms makes processed food ' +
      'more acnegenic than individual components would predict.',
    keyStudies: [
      'Penso et al., JAMA Dermatol, 2020 - sugary/fatty products and acne in NutriNet-Santé study',
      'Chassaing et al., Nature, 2015 - dietary emulsifiers disrupt gut microbiota and promote inflammation',
      'Katta & Desai, J Clin Aesthet Dermatol, 2014 - diet and dermatology review on processed foods',
    ],
  },

  wheyProtein: {
    category: 'Whey Protein',
    glycemicIndexRange: [0, 15],
    acneRelevantCompounds: [
      'leucine (potent mTORC1 activator)',
      'insulinotropic amino acids (leucine, isoleucine, valine)',
      'IGF-1 stimulation',
      'BCAAs → androgen receptor upregulation',
    ],
    evidenceStrength: 'strong',
    onsetDelayHours: [24, 96],
    mechanism:
      'Whey protein is the most potent dietary activator of the mTORC1 pathway, primarily through its ' +
      'high leucine content. mTORC1 activation in sebocytes increases lipid synthesis (sebum), in ' +
      'keratinocytes increases proliferation (follicular plugging), and systemically raises IGF-1. ' +
      'Whey also triggers disproportionately high insulin secretion relative to its glycemic index - ' +
      'the insulinemic index of whey is 3x that predicted by GI. This insulin surge reduces SHBG and ' +
      'IGFBP-3, increasing free androgens and IGF-1. Case reports and small studies consistently show ' +
      'new-onset or worsened acne in gym-goers using whey supplements, resolving on cessation.',
    keyStudies: [
      'Melnik, Dermatoendocrinol, 2012 - whey as the most potent dietary mTORC1 signal for acne',
      'Simonart, Dermatology, 2012 - case series of whey protein-induced acne in bodybuilders',
      'Cengiz et al., Health Promot Perspect, 2017 - whey supplement association with acne in athletes',
      'Pontes et al., An Bras Dermatol, 2013 - whey protein acne in gym attendees',
    ],
  },

  chocolate: {
    category: 'Chocolate',
    glycemicIndexRange: [20, 70],
    acneRelevantCompounds: [
      'sugar (in milk/white chocolate)',
      'dairy proteins (in milk chocolate)',
      'theobromine',
      'cocoa polyphenols (antioxidant - in dark chocolate)',
    ],
    evidenceStrength: 'moderate',
    onsetDelayHours: [24, 72],
    mechanism:
      'The acne effect of chocolate is primarily mediated by its sugar and dairy content rather than ' +
      'cocoa itself. Milk chocolate combines high sugar (insulin spike) with milk solids (IGF-1, whey). ' +
      'However, two RCTs (Vongraviopap & Asawanonda, 2016; Delost et al., 2016) found that even pure ' +
      'cocoa/dark chocolate worsened acne, possibly through theobromine effects on immune function or ' +
      'direct modulation of sebocyte lipogenesis. Dark chocolate (>70% cocoa) has lower sugar but may ' +
      'still exacerbate acne in some individuals. Cocoa flavanols may be protective in isolation.',
    keyStudies: [
      'Vongraviopap & Asawanonda, Int J Dermatol, 2016 - 100% cocoa worsened acne in 25 males (double-blind RCT)',
      'Delost et al., J Am Acad Dermatol, 2016 - dark chocolate exacerbated acne in 13 males',
      'Netea et al., Clin Vaccine Immunol, 2013 - cocoa affects innate immune response to C. acnes',
      'Chalyk et al., Nutrients, 2018 - chocolate and acne association in systematic review',
    ],
  },

  nuts: {
    category: 'Nuts',
    glycemicIndexRange: [0, 25],
    acneRelevantCompounds: [
      'omega-6 fatty acids (walnuts, peanuts)',
      'vitamin E (antioxidant)',
      'selenium (Brazil nuts)',
      'zinc (cashews, pumpkin seeds)',
      'phytic acid (mineral absorption blocker)',
    ],
    evidenceStrength: 'mixed',
    onsetDelayHours: [24, 72],
    mechanism:
      'Nuts have a complex relationship with acne. Peanuts (technically legumes) and some tree nuts ' +
      'are high in omega-6 fatty acids, which can promote inflammation if omega-3 intake is low. ' +
      'However, most nuts are low-GI, rich in anti-inflammatory compounds (vitamin E, selenium), and ' +
      'contain zinc important for skin health. Almonds and walnuts specifically contain compounds that ' +
      'may reduce systemic inflammation. The net effect depends on nut type, quantity, and overall diet. ' +
      'Salted/roasted nuts with added oils may be more problematic due to processing.',
    keyStudies: [
      'Saric et al., J Am Acad Dermatol, 2016 - diet review noting nut consumption not strongly linked to acne',
      'Jackson et al., J Am Heart Assoc, 2014 - nuts reduce systemic inflammatory markers (CRP, IL-6)',
    ],
  },

  fermentedFoods: {
    category: 'Fermented Foods (kimchi, yogurt, kombucha, kefir)',
    glycemicIndexRange: [10, 40],
    acneRelevantCompounds: [
      'probiotics (Lactobacillus, Bifidobacterium)',
      'short-chain fatty acids (butyrate - gut barrier support)',
      'bioactive peptides',
      'histamine (in aged ferments - potential inflammatory trigger)',
    ],
    evidenceStrength: 'protective',
    onsetDelayHours: [168, 672], // 1-4 weeks for gut microbiome modulation
    mechanism:
      'Fermented foods supply live beneficial bacteria that modulate gut microbiota composition. A healthier ' +
      'gut microbiome reduces intestinal permeability (less endotoxin translocation), produces anti-inflammatory ' +
      'SCFAs (especially butyrate), and modulates systemic immune responses via the gut-skin axis. ' +
      'Lactobacillus species specifically reduce systemic IL-6 and TNF-alpha. Yogurt/kefir may be an exception ' +
      'due to dairy content counteracting probiotic benefits. Histamine-sensitive individuals may react ' +
      'to aged fermented foods (sauerkraut, aged cheese, kombucha) with inflammatory flares.',
    keyStudies: [
      'Bowe & Logan, Gut Pathog, 2011 - gut-brain-skin axis and probiotic potential for acne',
      'Kang et al., Ann Dermatol, 2009 - Lactobacillus supplementation reduced acne lesions',
      'Jung et al., Nutrition, 2013 - probiotic supplementation improved acne in 12-week RCT',
      'Salem et al., Benef Microbes, 2018 - probiotics modulate skin inflammation via gut-skin axis',
    ],
  },

  greenVegetables: {
    category: 'Green Vegetables',
    glycemicIndexRange: [0, 20],
    acneRelevantCompounds: [
      'vitamin A / beta-carotene (retinoid precursor)',
      'vitamin C (collagen synthesis, antioxidant)',
      'folate',
      'chlorophyll (anti-inflammatory)',
      'fiber (blood sugar stabilization)',
      'sulforaphane (broccoli - Nrf2 activator, anti-inflammatory)',
    ],
    evidenceStrength: 'protective',
    onsetDelayHours: [168, 672],
    mechanism:
      'Green vegetables provide multiple skin-protective mechanisms: low glycemic impact stabilizes ' +
      'insulin/IGF-1; beta-carotene is converted to retinol (vitamin A) which normalizes keratinization; ' +
      'fiber feeds beneficial gut bacteria; antioxidants (vitamin C, polyphenols) reduce oxidative stress ' +
      'in sebum (lipid peroxidation triggers inflammation); sulforaphane from cruciferous vegetables ' +
      'activates the Nrf2 antioxidant pathway and inhibits NF-kB inflammation. Effects are cumulative ' +
      'rather than acute - consistent intake over weeks shows benefit.',
    keyStudies: [
      'Ismail et al., J Am Acad Dermatol, 2012 - low fruit/vegetable intake associated with acne',
      'Çerman et al., J Cosmet Dermatol, 2016 - acne patients had lower vegetable intake and lower blood antioxidants',
      'Romieu et al., Nutrients, 2017 - fruit/vegetable intake reduces systemic inflammatory markers',
    ],
  },

  fruits: {
    category: 'Fruits',
    glycemicIndexRange: [20, 70],
    acneRelevantCompounds: [
      'vitamin C',
      'flavonoids (quercetin, anthocyanins - anti-inflammatory)',
      'fiber (blood sugar modulation)',
      'fructose (moderate amounts - hepatic lipogenesis at excess)',
      'carotenoids',
    ],
    evidenceStrength: 'protective',
    onsetDelayHours: [168, 672],
    mechanism:
      'Whole fruits are generally protective due to fiber slowing sugar absorption, high antioxidant ' +
      'content reducing oxidative stress, and anti-inflammatory flavonoids. Berries are particularly ' +
      'beneficial (high anthocyanins, low GI). Tropical fruits (mango, pineapple) have higher GI and ' +
      'may be less protective. Fruit juice (stripped of fiber) acts more like sugar and can spike insulin. ' +
      'Key distinction: whole fruit = protective; fruit juice = potential trigger.',
    keyStudies: [
      'Ismail et al., J Am Acad Dermatol, 2012 - low fruit intake associated with acne',
      'Skroza et al., G Ital Dermatol Venereol, 2012 - fruit consumption inversely correlated with acne',
      'Çerman et al., J Cosmet Dermatol, 2016 - lower blood antioxidants in acne patients',
    ],
  },

  omega3Fish: {
    category: 'Omega-3 Rich Fish (salmon, mackerel, sardines)',
    glycemicIndexRange: [0, 0],
    acneRelevantCompounds: [
      'EPA (eicosapentaenoic acid - anti-inflammatory)',
      'DHA (docosahexaenoic acid - anti-inflammatory)',
      'resolvin and protectin production',
      'leukotriene B4 inhibition',
      'vitamin D3',
      'selenium',
    ],
    evidenceStrength: 'protective',
    onsetDelayHours: [336, 1344], // 2-8 weeks to shift inflammatory balance
    mechanism:
      'EPA and DHA compete with arachidonic acid (omega-6) for cyclooxygenase and lipoxygenase enzymes, ' +
      'shifting eicosanoid production from pro-inflammatory PGE2 and LTB4 to anti-inflammatory PGE3 and ' +
      'LTB5. They also generate specialized pro-resolving mediators (resolvins, protectins) that actively ' +
      'resolve inflammation. Omega-3s downregulate IGF-1 receptor expression, reduce mTORC1 signaling, ' +
      'and inhibit NF-kB. The effect requires weeks of consistent intake to shift membrane phospholipid ' +
      'composition. EPA specifically reduces sebum production and inflammatory lesion counts.',
    keyStudies: [
      'Rubin et al., Lipids Health Dis, 2008 - omega-3 supplementation improved inflammatory acne',
      'Jung et al., Acta Derm Venereol, 2014 - 10 weeks omega-3 reduced acne inflammatory lesions',
      'Khayef et al., Lipids Health Dis, 2012 - EPA/DHA supplementation reduced acne severity',
      'Melnik, J Dtsch Dermatol Ges, 2018 - omega-3 vs omega-6 balance in acne pathogenesis',
    ],
  },

  probioticFoods: {
    category: 'Probiotic Foods (yogurt, kefir, miso, tempeh)',
    glycemicIndexRange: [10, 40],
    acneRelevantCompounds: [
      'Lactobacillus strains (L. rhamnosus, L. acidophilus)',
      'Bifidobacterium strains',
      'short-chain fatty acids',
      'bacteriocins (antimicrobial peptides)',
    ],
    evidenceStrength: 'protective',
    onsetDelayHours: [168, 672], // 1-4 weeks
    mechanism:
      'Probiotic bacteria modulate the gut-skin axis through multiple mechanisms: competitive exclusion ' +
      'of pathogenic bacteria, SCFA production (strengthens gut barrier), modulation of regulatory T-cells ' +
      '(reduces systemic inflammation), and direct antimicrobial peptide production. L. rhamnosus GG ' +
      'specifically downregulates IGF-1 signaling. Some strains also directly produce anti-inflammatory ' +
      'metabolites that cross into systemic circulation. Dairy-based probiotics (yogurt, kefir) may have ' +
      'partially offset benefits due to dairy\'s pro-acne properties.',
    keyStudies: [
      'Fabbrocini et al., Benef Microbes, 2016 - L. rhamnosus SP1 supplementation improved adult acne',
      'Kang et al., Ann Dermatol, 2009 - Lactobacillus-fermented dairy reduced acne lesions',
      'Dréno et al., JAAD, 2020 - gut microbiome modulation as therapeutic target in acne',
    ],
  },
};


// ──────────────────────────────────────────────────────────────
// 2. NUTRIENT → SKIN EFFECTS
// ──────────────────────────────────────────────────────────────

export interface NutrientSkinProfile {
  nutrient: string;
  effectOnAcne: string;
  deficiencyEffects: string;
  mechanism: string;
  optimalIntake: string;
  keyStudies: string[];
}

export const NUTRIENT_SKIN_PROFILES: Record<string, NutrientSkinProfile> = {
  vitaminA: {
    nutrient: 'Vitamin A (Retinol / Beta-carotene)',
    effectOnAcne:
      'Strongly protective. Regulates keratinocyte differentiation, preventing follicular ' +
      'hyperkeratinization (comedone formation). Reduces sebum production. Isotretinoin (13-cis-retinoic acid) ' +
      'is the most effective acne drug ever developed, demonstrating vitamin A pathway centrality.',
    deficiencyEffects:
      'Follicular hyperkeratosis (phrynoderma - "toad skin"), impaired wound healing, increased susceptibility ' +
      'to skin infections, dry/rough skin, impaired sebaceous gland function.',
    mechanism:
      'Retinoid receptors (RAR/RXR) on sebocytes and keratinocytes regulate cell differentiation and ' +
      'proliferation. Adequate vitamin A normalizes desquamation of follicular epithelium (prevents plugging), ' +
      'reduces TLR-2 expression on monocytes (less inflammatory response to C. acnes), and downregulates ' +
      'sebaceous gland activity.',
    optimalIntake: '700-900 mcg RAE/day (RDA). Acne benefit may require higher intake or topical retinoids.',
    keyStudies: [
      'Zouboulis, Clin Dermatol, 2004 - retinoids in sebaceous gland biology and acne',
      'El-Akawi et al., Clin Exp Dermatol, 2006 - lower serum vitamin A in acne patients',
      'Kligman et al., J Am Acad Dermatol, 1981 - retinoid therapy for acne (foundational)',
    ],
  },

  vitaminD: {
    nutrient: 'Vitamin D',
    effectOnAcne:
      'Moderately protective. Modulates innate immunity, promotes antimicrobial peptide (cathelicidin) ' +
      'production, and has anti-inflammatory properties. Multiple studies show acne patients have lower ' +
      'serum 25(OH)D levels.',
    deficiencyEffects:
      'Impaired innate immunity (reduced cathelicidin/LL-37), increased susceptibility to skin infections, ' +
      'increased inflammatory acne lesions, impaired wound healing, potential disruption of skin barrier.',
    mechanism:
      'Vitamin D receptor (VDR) is expressed on sebocytes, keratinocytes, and immune cells. VDR activation ' +
      'induces cathelicidin (LL-37) which has direct antimicrobial activity against C. acnes. Vitamin D ' +
      'also suppresses Th17 inflammatory responses, reduces IL-17 (key acne cytokine), and modulates ' +
      'sebocyte differentiation.',
    optimalIntake: '1000-4000 IU/day. Many dermatologists recommend maintaining serum 25(OH)D > 40 ng/mL.',
    keyStudies: [
      'Lim et al., J Am Acad Dermatol, 2016 - low vitamin D associated with acne severity',
      'Yildizgoren & Togral, J Cosmet Dermatol, 2014 - vitamin D deficiency common in acne patients',
      'Agak et al., J Invest Dermatol, 2014 - vitamin D3 increases cathelicidin in sebocytes',
    ],
  },

  zinc: {
    nutrient: 'Zinc',
    effectOnAcne:
      'Strongly protective. Anti-inflammatory, antimicrobial, anti-androgenic, and wound-healing properties. ' +
      'Oral zinc supplementation reduces acne lesion counts in multiple RCTs.',
    deficiencyEffects:
      'Impaired wound healing, increased inflammation, reduced antimicrobial defense, perioral/acral ' +
      'dermatitis, increased susceptibility to infections, impaired immune cell function.',
    mechanism:
      'Zinc inhibits 5-alpha-reductase (reduces DHT production), reduces TLR-2-mediated inflammation, ' +
      'directly inhibits C. acnes growth (bacteriostatic), reduces keratinocyte inflammatory cytokine ' +
      'production, and is essential for proper immune function. Also acts as an antioxidant via ' +
      'superoxide dismutase (Cu-Zn SOD) and inhibits chemotaxis of inflammatory cells.',
    optimalIntake: '30-45 mg zinc gluconate or 15-30 mg zinc picolinate/day for acne. RDA is 8-11 mg.',
    keyStudies: [
      'Dreno et al., Dermatology, 2001 - zinc gluconate vs minocycline RCT (comparable efficacy)',
      'Yee et al., Dermatol Ther, 2020 - meta-analysis: oral zinc significantly reduces acne',
      'Bae et al., Ann Dermatol, 2010 - lower serum zinc in acne patients vs controls',
    ],
  },

  omega3: {
    nutrient: 'Omega-3 Fatty Acids (EPA/DHA)',
    effectOnAcne:
      'Protective. Reduces inflammatory acne by competing with omega-6 for enzymatic conversion, ' +
      'shifting eicosanoid balance toward anti-inflammatory mediators.',
    deficiencyEffects:
      'Pro-inflammatory eicosanoid dominance, increased LTB4 (potent chemotactic factor), dry/inflamed ' +
      'skin, impaired skin barrier (increased TEWL), increased severity of inflammatory conditions.',
    mechanism:
      'EPA competes with arachidonic acid for COX-2 and 5-LOX enzymes, reducing PGE2 and LTB4 production. ' +
      'DHA is incorporated into cell membranes, modulating fluidity and signaling. Both EPA and DHA generate ' +
      'resolvins and protectins that actively resolve inflammation. EPA specifically inhibits 5-alpha-reductase ' +
      'and reduces sebum production through PPAR-gamma modulation.',
    optimalIntake: '1-3 g combined EPA/DHA daily. Aim for omega-6:omega-3 ratio < 4:1.',
    keyStudies: [
      'Jung et al., Acta Derm Venereol, 2014 - omega-3 supplementation reduced inflammatory acne lesions',
      'Rubin et al., Lipids Health Dis, 2008 - omega-3 reduced acne severity',
      'Khayef et al., Lipids Health Dis, 2012 - omega-3 supplementation reduced inflammatory/non-inflammatory lesions',
    ],
  },

  omega6: {
    nutrient: 'Omega-6 Fatty Acids (Linoleic acid, Arachidonic acid)',
    effectOnAcne:
      'Dual role. Linoleic acid is actually DEFICIENT in acne-prone sebum and topical application is beneficial. ' +
      'However, excess dietary arachidonic acid (from meat, seed oils) promotes inflammation.',
    deficiencyEffects:
      'Linoleic acid deficiency in sebum leads to comedone formation (abnormal follicular lipid composition). ' +
      'However, dietary omega-6 deficiency is rare in Western diets.',
    mechanism:
      'Paradox: acne-prone sebum is LOW in linoleic acid and HIGH in oleic acid, suggesting local deficiency. ' +
      'Topical linoleic acid can normalize sebum composition and reduce comedones. But excess dietary ' +
      'arachidonic acid (downstream omega-6) is converted to pro-inflammatory PGE2 and LTB4 via COX-2 ' +
      'and 5-LOX. The ratio of omega-6:omega-3 matters more than absolute omega-6 intake.',
    optimalIntake: 'Reduce omega-6:omega-3 ratio to < 4:1 (Western diet averages 15-20:1).',
    keyStudies: [
      'Downing et al., J Invest Dermatol, 1986 - linoleic acid deficiency in comedonal lipids',
      'Letawe et al., Clin Exp Dermatol, 1998 - topical linoleic acid reduces comedone size',
      'Simopoulos, Biomed Pharmacother, 2006 - omega-6/omega-3 imbalance in inflammatory diseases',
    ],
  },

  vitaminE: {
    nutrient: 'Vitamin E (Tocopherols)',
    effectOnAcne:
      'Mildly protective as antioxidant. Prevents lipid peroxidation of sebum (oxidized sebum is more ' +
      'comedogenic and inflammatory). Works synergistically with vitamin C and selenium.',
    deficiencyEffects:
      'Increased lipid peroxidation, oxidative damage to cell membranes, impaired wound healing, ' +
      'potentially more inflammatory acne lesions.',
    mechanism:
      'Vitamin E (alpha-tocopherol) is the primary fat-soluble antioxidant in skin and sebum. It ' +
      'terminates lipid peroxidation chain reactions, protecting sebum from oxidation (oxidized squalene ' +
      'is comedogenic). Also modulates NF-kB signaling and reduces UV-induced skin damage.',
    optimalIntake: '15 mg/day (RDA). Higher doses (400 IU+) may have diminishing returns.',
    keyStudies: [
      'Ekanayake-Mudiyanselage et al., J Invest Dermatol, 2003 - vitamin E in sebum and skin surface lipids',
      'Sarici et al., J Eur Acad Dermatol Venereol, 2010 - lower serum vitamin E in acne patients',
    ],
  },

  selenium: {
    nutrient: 'Selenium',
    effectOnAcne:
      'Mildly protective. Component of glutathione peroxidase (antioxidant defense). Acne patients ' +
      'often have lower serum selenium levels.',
    deficiencyEffects:
      'Reduced glutathione peroxidase activity, increased oxidative stress, impaired immune function, ' +
      'potentially worse inflammatory acne.',
    mechanism:
      'Selenium is a cofactor for glutathione peroxidase, which neutralizes hydrogen peroxide and lipid ' +
      'hydroperoxides in skin. It supports immune function through selenoprotein expression in T-cells. ' +
      'Works synergistically with vitamin E to prevent oxidative damage.',
    optimalIntake: '55-100 mcg/day. Brazil nuts are the richest food source (1 nut ≈ 70-90 mcg).',
    keyStudies: [
      'Sahib et al., Saudi Med J, 2012 - selenium supplementation improved acne in combination with vitamin E',
      'Michaelsson & Edqvist, Acta Derm Venereol, 1984 - low selenium and glutathione peroxidase in acne patients',
    ],
  },

  vitaminC: {
    nutrient: 'Vitamin C (Ascorbic acid)',
    effectOnAcne:
      'Mildly protective. Antioxidant, supports collagen synthesis (scar healing), brightens post-inflammatory ' +
      'hyperpigmentation, and enhances immune defense against C. acnes.',
    deficiencyEffects:
      'Impaired collagen synthesis (poor wound/scar healing), weakened immune defense, increased susceptibility ' +
      'to skin infections, slow resolution of post-acne marks.',
    mechanism:
      'Vitamin C is a cofactor for prolyl and lysyl hydroxylases (collagen synthesis), regenerates vitamin E ' +
      '(recycling the antioxidant), enhances neutrophil antimicrobial function, and inhibits tyrosinase ' +
      '(reduces post-inflammatory hyperpigmentation). Topical vitamin C (L-ascorbic acid) at pH < 3.5 ' +
      'provides additional photoprotection and anti-inflammatory benefits.',
    optimalIntake: '200-500 mg/day from diet. Topical: 10-20% L-ascorbic acid for skin benefits.',
    keyStudies: [
      'Pullar et al., Nutrients, 2017 - role of vitamin C in skin health',
      'Telang, Indian Dermatol Online J, 2013 - vitamin C in dermatology (review)',
    ],
  },

  bVitamins: {
    nutrient: 'B Vitamins (B2, B3, B5, B6, B12)',
    effectOnAcne:
      'Complex. B3 (niacinamide) is strongly protective topically. B5 (pantothenic acid) shows some evidence ' +
      'for sebum reduction. B12 excess may WORSEN acne by altering skin microbiome gene expression in C. acnes.',
    deficiencyEffects:
      'B2 deficiency: angular cheilitis, seborrheic dermatitis. B3 deficiency: pellagra (dermatitis). ' +
      'B6 deficiency: seborrheic dermatitis. General: impaired cellular energy metabolism in skin.',
    mechanism:
      'B3 (niacinamide): inhibits sebum production, reduces TEWL, boosts ceramide synthesis, anti-inflammatory ' +
      '(reduces IL-8, TNF-alpha). B5: may regulate CoA-mediated fatty acid metabolism in sebocytes. ' +
      'B12: excess alters C. acnes gene expression (upregulates porphyrin production), potentially explaining ' +
      'B12-associated acne. B6: involved in hormone metabolism.',
    optimalIntake: 'B3: 500 mg oral or 4% topical niacinamide. Avoid high-dose B12 supplementation if acne-prone.',
    keyStudies: [
      'Shalita et al., Int J Dermatol, 1995 - niacinamide gel 4% vs clindamycin for acne (comparable)',
      'Kang et al., Sci Transl Med, 2015 - vitamin B12 modulates C. acnes transcriptome to promote acne',
      'Leung, J Orthomol Med, 1997 - pantothenic acid and acne (lipid metabolism hypothesis)',
      'Draelos et al., Cutis, 2006 - niacinamide reduces sebum production',
    ],
  },

  iron: {
    nutrient: 'Iron',
    effectOnAcne:
      'Dual role. Iron deficiency impairs wound healing and immune function. Iron excess promotes oxidative ' +
      'stress and may feed bacterial growth (C. acnes is an iron-dependent bacterium).',
    deficiencyEffects:
      'Impaired wound healing, pale/sallow complexion, increased susceptibility to infections, slow resolution ' +
      'of acne lesions, potential hair loss (compounding skin concerns).',
    mechanism:
      'C. acnes requires iron for growth and virulence - it has siderophore-like systems to acquire iron. ' +
      'Excess systemic iron increases free radical production via Fenton reaction, damaging skin cells. ' +
      'However, iron deficiency impairs neutrophil/macrophage function needed to clear acne infections. ' +
      'Optimal is maintaining normal levels without excess.',
    optimalIntake: 'RDA: 8-18 mg/day. Do not supplement without confirmed deficiency.',
    keyStudies: [
      'Dreno et al., Dermatology, 1994 - iron and C. acnes growth',
      'Winters et al., FEMS Microbiol Lett, 2019 - iron acquisition in C. acnes virulence',
    ],
  },
};


// ──────────────────────────────────────────────────────────────
// 3. LIFESTYLE → SKIN MECHANISMS
// ──────────────────────────────────────────────────────────────

export interface LifestyleSkinProfile {
  factor: string;
  hormonalPathway: string[];
  effectOnSebum: string;
  effectOnInflammation: string;
  effectOnSkinBarrier: string;
  /** Typical lag in hours: [min, max] */
  lagTimeHours: [number, number];
  mechanism: string;
  keyStudies: string[];
}

export const LIFESTYLE_SKIN_PROFILES: Record<string, LifestyleSkinProfile> = {
  sleep: {
    factor: 'Sleep',
    hormonalPathway: [
      'cortisol (elevated when sleep-deprived)',
      'growth hormone (reduced - impairs skin repair)',
      'melatonin (reduced - loses antioxidant protection)',
      'insulin sensitivity (decreased)',
      'inflammatory cytokines (IL-6, TNF-alpha elevated)',
    ],
    effectOnSebum: 'Sleep deprivation elevates cortisol which directly stimulates sebaceous glands. Even 1 night of poor sleep increases sebum production measurably by next day.',
    effectOnInflammation: 'Strong pro-inflammatory effect. Sleep deprivation increases CRP, IL-6, TNF-alpha, and NF-kB activation. Even partial sleep restriction (6h vs 8h) measurably increases inflammatory markers.',
    effectOnSkinBarrier: 'Impairs skin barrier recovery. Sleep deprivation reduces transepidermal water recovery rate by 30%, increases TEWL, and reduces skin pH regulation.',
    lagTimeHours: [12, 48],
    mechanism:
      'Sleep is when skin repair peaks (growth hormone surge at 11pm-2am, epidermal cell mitosis peaks during sleep). ' +
      'Chronic sleep deprivation (<6h) elevates cortisol (sebum stimulation), reduces growth hormone (impaired repair), ' +
      'increases insulin resistance (amplifies dietary triggers), and creates a systemic pro-inflammatory state. ' +
      'The combined effect is: more sebum + more inflammation + worse barrier = more acne. ' +
      'Circadian disruption (irregular sleep times) may be as harmful as insufficient sleep.',
    keyStudies: [
      'Oyetakin-White et al., Clin Exp Dermatol, 2015 - poor sleep quality associated with increased skin aging and impaired barrier function',
      'Altemus et al., Brain Behav Immun, 2001 - sleep deprivation increases skin inflammation',
      'Chiu et al., Clin Exp Dermatol, 2017 - poor sleep quality associated with acne severity',
      'Schrom et al., Clin Cosmet Investig Dermatol, 2019 - sleep deprivation adversely affects skin and accelerates aging',
    ],
  },

  stress: {
    factor: 'Stress',
    hormonalPathway: [
      'cortisol (HPA axis activation)',
      'CRH (corticotropin-releasing hormone - direct sebocyte stimulation)',
      'ACTH',
      'androgens (adrenal androgen upregulation under chronic stress)',
      'substance P (neurogenic inflammation)',
      'catecholamines (epinephrine, norepinephrine)',
    ],
    effectOnSebum: 'Strong increase. CRH receptors on sebocytes directly increase lipogenesis independent of cortisol. Stress-induced androgens (DHEA-S) add to sebum production.',
    effectOnInflammation: 'Strong pro-inflammatory effect via cortisol-mediated NF-kB activation, mast cell degranulation, substance P release, and impaired antimicrobial peptide production.',
    effectOnSkinBarrier: 'Cortisol degrades skin barrier by reducing ceramide synthesis, increasing TEWL, and impairing antimicrobial defense. Barrier recovery takes 2-3x longer under psychological stress.',
    lagTimeHours: [24, 72],
    mechanism:
      'Skin has its own HPA axis equivalent - keratinocytes and sebocytes express CRH, ACTH, and cortisol receptors. ' +
      'Under psychological stress: (1) systemic CRH/cortisol activate sebocyte CRH-R1 receptors → increased sebum, ' +
      '(2) neuropeptides (substance P) from stress-activated nerve fibers cause neurogenic inflammation in skin, ' +
      '(3) adrenal androgens (DHEA-S) rise and convert to testosterone/DHT in skin, ' +
      '(4) cortisol impairs wound healing and antimicrobial defense (less cathelicidin). ' +
      'Exam-period acne flares are well-documented: Chiu et al. showed stress severity positively correlated with acne severity in students.',
    keyStudies: [
      'Chiu et al., Arch Dermatol, 2003 - stress worsens acne severity in college students',
      'Zouboulis et al., J Invest Dermatol, 2002 - CRH stimulates sebocyte lipogenesis directly',
      'Ganceviciene et al., Dermato-Endocrinology, 2009 - skin stress response system and acne',
      'Yosipovitch et al., Arch Dermatol, 2007 - stress and skin barrier disruption',
    ],
  },

  exercise: {
    factor: 'Exercise',
    hormonalPathway: [
      'endorphins (anti-stress)',
      'cortisol (acute rise, chronic reduction)',
      'testosterone (acute transient rise)',
      'insulin sensitivity (improved)',
      'IGF-1 (acute rise with resistance training)',
      'BDNF (reduces stress-acne pathway)',
    ],
    effectOnSebum: 'Complex. Acute exercise temporarily increases sebum via testosterone spike, but regular exercise improves insulin sensitivity (less chronic sebum stimulation). Net effect is neutral to mildly protective.',
    effectOnInflammation: 'Strongly anti-inflammatory long-term. Regular exercise reduces CRP, IL-6, TNF-alpha baseline levels. Single sessions cause temporary anti-inflammatory cytokine release (IL-10).',
    effectOnSkinBarrier: 'Improves blood flow to skin (better nutrient delivery, waste removal). Sweat contains dermcidin (antimicrobial). However, prolonged unwashed sweat + friction can cause acne mechanica.',
    lagTimeHours: [0, 48],
    mechanism:
      'Exercise has a net protective effect through: (1) improved insulin sensitivity (reduces IGF-1-mediated sebocyte stimulation), ' +
      '(2) reduced chronic cortisol (less HPA axis reactivity with regular training), ' +
      '(3) anti-inflammatory myokine release (irisin, IL-10), ' +
      '(4) improved sleep quality (indirect benefit), ' +
      '(5) dermcidin in sweat has antimicrobial activity against C. acnes. ' +
      'Caveat: not washing sweat promptly, wearing occlusive clothing, and whey protein use around exercise can negate benefits. ' +
      'Resistance training may transiently spike testosterone and IGF-1 but chronic effect is beneficial.',
    keyStudies: [
      'Saric-Bosanac et al., Dermatol Online J, 2019 - exercise and skin health',
      'Gleeson et al., Nat Rev Immunol, 2011 - exercise anti-inflammatory effects on immune system',
      'Schittek et al., Nat Immunol, 2001 - dermcidin antimicrobial peptide in sweat',
    ],
  },

  hydration: {
    factor: 'Hydration (Water intake)',
    hormonalPathway: [
      'ADH/vasopressin (fluid regulation)',
      'aldosterone (sodium/water balance)',
      'cortisol (dehydration is a physiological stressor)',
    ],
    effectOnSebum: 'Mild indirect effect. Dehydration concentrates sebum and impairs its flow, potentially increasing comedone formation. Adequate hydration helps maintain sebum fluidity.',
    effectOnInflammation: 'Mild. Chronic dehydration increases baseline cortisol and inflammatory markers. Adequate hydration supports lymphatic drainage and waste removal from skin.',
    effectOnSkinBarrier: 'Moderate effect. Hydration directly affects stratum corneum water content, influencing barrier function and desquamation. Dehydration increases TEWL and impairs barrier recovery.',
    lagTimeHours: [6, 48],
    mechanism:
      'Water intake affects skin primarily through: (1) maintaining adequate dermal blood flow and nutrient delivery, ' +
      '(2) supporting kidney filtration of circulating toxins and hormones, ' +
      '(3) maintaining stratum corneum hydration (though topical hydration matters more than oral for surface skin), ' +
      '(4) reducing physiological stress of dehydration (cortisol). ' +
      'The effect is permissive rather than therapeutic - below a threshold (~6 glasses/day), skin health suffers; ' +
      'above adequate intake, additional water has diminishing returns.',
    keyStudies: [
      'Palma et al., Clin Cosmet Investig Dermatol, 2015 - dietary water affects skin hydration in those with low baseline intake',
      'Popkin et al., Nutr Rev, 2010 - water, hydration, and health',
    ],
  },

  sunExposure: {
    factor: 'Sun Exposure',
    hormonalPathway: [
      'vitamin D synthesis (UVB → protective)',
      'cortisol modulation (sunlight regulates circadian rhythm)',
      'beta-endorphin production (UV-induced)',
      'melanocyte-stimulating hormone',
    ],
    effectOnSebum: 'UV temporarily dries sebum on skin surface (perceived improvement). However, UV damage triggers compensatory sebum overproduction within days. Long-term net effect is increased sebum.',
    effectOnInflammation: 'Dual. UVB has mild immunosuppressive/anti-inflammatory effect (reduces T-cell activity - why acne sometimes improves in summer). But UV generates ROS, damages DNA, and causes delayed inflammation.',
    effectOnSkinBarrier: 'UV damages skin barrier (lipid peroxidation, protein crosslinking). Impairs barrier function within hours of significant exposure. Cumulative damage worsens barrier integrity.',
    lagTimeHours: [6, 168],
    mechanism:
      'Short-term: UV (especially UVB) has mild antibacterial effect on skin surface C. acnes and suppresses ' +
      'local T-cell inflammation, explaining perceived improvement. Medium-term (days): UV-induced ' +
      'hyperkeratinization INCREASES comedone formation. UV triggers compensatory sebum increase. ' +
      'UV generates ROS that oxidize squalene in sebum (oxidized squalene is comedogenic). ' +
      'UV also triggers post-inflammatory hyperpigmentation in acne marks, especially in darker skin. ' +
      'Net effect: brief anti-inflammatory benefit, then worse acne and scarring. Sunscreen use is strongly recommended.',
    keyStudies: [
      'Kligman & Mills, Arch Dermatol, 1972 - acne aestivalis (acne from sun exposure)',
      'Mills & Kligman, Arch Dermatol, 1975 - UV-induced comedogenesis',
      'El-Domyati et al., Exp Dermatol, 2002 - UV effects on skin barrier and aging',
    ],
  },

  screenTime: {
    factor: 'Screen Time / Blue Light',
    hormonalPathway: [
      'melatonin suppression (circadian disruption)',
      'cortisol (indirect via sleep disruption and psychological stress)',
    ],
    effectOnSebum: 'Indirect effect through circadian/sleep disruption. Blue light at night suppresses melatonin, disrupts sleep → cortisol elevation → sebum increase.',
    effectOnInflammation: 'HEV (high-energy visible) blue light may induce ROS in skin, causing oxidative stress and inflammation. The intensity from screens is likely too low to matter directly, but indirect sleep/stress effects are significant.',
    effectOnSkinBarrier: 'Minimal direct barrier effect from screen light. Indirect effects through sleep disruption and stress (see sleep and stress entries).',
    lagTimeHours: [24, 72],
    mechanism:
      'Primary mechanism is INDIRECT: screen time before bed suppresses melatonin production (blue light 460-490nm), ' +
      'delays sleep onset, reduces sleep quality, and can increase psychological stress (social media comparison, ' +
      'doom scrolling). These mediate acne through sleep and stress pathways. ' +
      'Direct blue light effect on skin is debated - lab studies show HEV light (410-450nm) generates ROS and ' +
      'induces MMP-1 in fibroblasts, but real-world screen intensity is ~100-300x less than sunlight. ' +
      'The sleep disruption pathway is far more clinically significant than direct light-skin interaction.',
    keyStudies: [
      'Cajochen et al., J Appl Physiol, 2011 - evening screen light suppresses melatonin and disrupts sleep',
      'Liebmann et al., J Invest Dermatol, 2010 - blue light induces ROS in skin cells (in vitro)',
      'Arjmandi et al., J Biomed Phys Eng, 2018 - blue light from screens and skin effects (review)',
    ],
  },

  smoking: {
    factor: 'Smoking',
    hormonalPathway: [
      'nicotine → androgen receptor upregulation',
      'cortisol elevation',
      'insulin resistance',
      'aryl hydrocarbon receptor (AhR) activation',
    ],
    effectOnSebum: 'Increases sebum production via androgen pathway upregulation. Nicotine directly stimulates sebocytes through nicotinic acetylcholine receptors. Alters sebum composition (more squalene, less linoleic acid).',
    effectOnInflammation: 'Paradoxically immunosuppressive AND pro-inflammatory. Reduces neutrophil chemotaxis (slower lesion resolution) while increasing oxidative stress and NF-kB activation (more tissue damage).',
    effectOnSkinBarrier: 'Severely damages skin barrier. Reduces blood flow by 30-40% (vasoconstriction), depletes vitamin C and antioxidants, impairs collagen synthesis, accelerates barrier aging.',
    lagTimeHours: [24, 168],
    mechanism:
      'Smoking activates the aryl hydrocarbon receptor (AhR) in keratinocytes, which alters keratinocyte ' +
      'differentiation and promotes comedone formation. Nicotine stimulates sebocyte androgen receptors, ' +
      'increases sebum. Carbon monoxide reduces oxygen delivery to skin. ROS from smoke deplete antioxidants ' +
      '(vitamin C, E) in skin. Smokers have a specific acne subtype - "smoker\'s acne" - characterized by ' +
      'non-inflammatory comedones and microcysts, distinct from typical adolescent inflammatory acne. ' +
      'The association is complex: some studies show worsened acne, others show a different pattern rather than more severe.',
    keyStudies: [
      'Capitanio et al., Br J Dermatol, 2007 - "smoker\'s acne": clinical variant with non-inflammatory lesions',
      'Schäfer et al., Br J Dermatol, 2001 - prevalence of acne highest in smokers (cross-sectional, n=896)',
      'Ju et al., Ann Dermatol, 2011 - smoking and acne severity in Korean males',
      'Morita, Toxicol Ind Health, 2007 - AhR activation by cigarette smoke in skin',
    ],
  },
};


// ──────────────────────────────────────────────────────────────
// 4. SKINCARE INGREDIENT INTERACTIONS
// ──────────────────────────────────────────────────────────────

export interface SkincareIngredient {
  name: string;
  mechanism: string;
  acneBenefit: string;
  irritationPotential: 'low' | 'moderate' | 'high';
  bestTimeOfDay: 'morning' | 'evening' | 'both';
  pHRange: [number, number] | null;
}

export type InteractionType = 'synergistic' | 'antagonistic' | 'caution' | 'neutral';

export interface IngredientInteraction {
  ingredientA: string;
  ingredientB: string;
  interaction: InteractionType;
  explanation: string;
  recommendation: string;
}

export const SKINCARE_INGREDIENTS: Record<string, SkincareIngredient> = {
  retinol: {
    name: 'Retinol / Retinoids',
    mechanism: 'Binds RAR/RXR receptors → normalizes keratinocyte differentiation, reduces comedones, stimulates collagen, increases cell turnover.',
    acneBenefit: 'Gold standard for comedonal and inflammatory acne. Prevents microcomedone formation, the precursor of all acne lesions.',
    irritationPotential: 'high',
    bestTimeOfDay: 'evening',
    pHRange: [5.0, 6.0],
  },
  niacinamide: {
    name: 'Niacinamide (Vitamin B3)',
    mechanism: 'Inhibits sebum production, boosts ceramide synthesis, reduces TEWL, anti-inflammatory (reduces NF-kB, IL-8).',
    acneBenefit: 'Reduces sebum, calms inflammation, improves skin barrier. 4% niacinamide comparable to 1% clindamycin in one RCT.',
    irritationPotential: 'low',
    bestTimeOfDay: 'both',
    pHRange: [5.0, 7.0],
  },
  salicylicAcid: {
    name: 'Salicylic Acid (BHA)',
    mechanism: 'Lipophilic - penetrates into pores. Dissolves sebum plugs, exfoliates within follicle, mild anti-inflammatory (COX inhibition).',
    acneBenefit: 'Best chemical exfoliant for acne. Unclogs pores from within. Anti-inflammatory property unique among exfoliants.',
    irritationPotential: 'moderate',
    bestTimeOfDay: 'both',
    pHRange: [3.0, 4.0],
  },
  benzoylPeroxide: {
    name: 'Benzoyl Peroxide',
    mechanism: 'Releases free oxygen radicals → kills C. acnes (anaerobic bacteria cannot survive). Also mildly keratolytic.',
    acneBenefit: 'Most effective OTC antibacterial for acne. C. acnes cannot develop resistance (unlike antibiotics). 2.5% as effective as 10% with less irritation.',
    irritationPotential: 'high',
    bestTimeOfDay: 'both',
    pHRange: [4.0, 7.0],
  },
  aha: {
    name: 'AHA (Glycolic acid, Lactic acid, Mandelic acid)',
    mechanism: 'Water-soluble. Dissolves intercellular bonds in stratum corneum → exfoliation. Stimulates collagen at higher concentrations.',
    acneBenefit: 'Surface exfoliation, improves post-acne hyperpigmentation, mild comedolytic. Better for post-acne marks than active acne.',
    irritationPotential: 'moderate',
    bestTimeOfDay: 'evening',
    pHRange: [3.0, 4.0],
  },
  vitaminCTopical: {
    name: 'Vitamin C (L-Ascorbic Acid)',
    mechanism: 'Antioxidant, collagen synthesis cofactor, tyrosinase inhibitor (brightening), mild photoprotection.',
    acneBenefit: 'Best for post-inflammatory hyperpigmentation and acne scars. Mild anti-inflammatory. Not a primary acne treatment.',
    irritationPotential: 'moderate',
    bestTimeOfDay: 'morning',
    pHRange: [2.5, 3.5],
  },
  hyaluronicAcid: {
    name: 'Hyaluronic Acid',
    mechanism: 'Humectant - draws water to skin. Supports barrier hydration without adding oil.',
    acneBenefit: 'Counteracts dryness from acne treatments (retinoids, BPO). Does not cause acne. Helps barrier recovery.',
    irritationPotential: 'low',
    bestTimeOfDay: 'both',
    pHRange: [5.0, 7.0],
  },
  sunscreen: {
    name: 'Sunscreen (SPF 30+)',
    mechanism: 'Absorbs or reflects UV radiation. Prevents UV-induced comedogenesis, PIH darkening, and barrier damage.',
    acneBenefit: 'Prevents post-inflammatory hyperpigmentation from darkening. Prevents UV-induced comedones. Essential when using photosensitizing actives (retinoids, AHAs).',
    irritationPotential: 'low',
    bestTimeOfDay: 'morning',
    pHRange: null,
  },
};

export const INGREDIENT_INTERACTIONS: IngredientInteraction[] = [
  // SYNERGISTIC COMBINATIONS
  {
    ingredientA: 'retinol',
    ingredientB: 'niacinamide',
    interaction: 'synergistic',
    explanation: 'Niacinamide reduces retinol-induced irritation while both target different acne mechanisms. Niacinamide boosts ceramide production to counteract retinoid barrier disruption.',
    recommendation: 'Excellent combination. Apply niacinamide first (or mixed in moisturizer), then retinol. Can use together in PM routine.',
  },
  {
    ingredientA: 'benzoylPeroxide',
    ingredientB: 'retinol',
    interaction: 'synergistic',
    explanation: 'BP kills C. acnes while retinol prevents comedones - complementary mechanisms covering both inflammatory and non-inflammatory acne. Foundation of prescription acne regimens (Epiduo).',
    recommendation: 'Apply BP in morning, retinol in evening to avoid mutual oxidative degradation. If using together, apply BP first and let dry completely.',
  },
  {
    ingredientA: 'niacinamide',
    ingredientB: 'salicylicAcid',
    interaction: 'synergistic',
    explanation: 'Salicylic acid exfoliates within pores while niacinamide reduces sebum and inflammation. Niacinamide buffers potential irritation from BHA.',
    recommendation: 'Safe to layer. Apply salicylic acid first (lower pH), wait 1-2 minutes, then niacinamide.',
  },
  {
    ingredientA: 'vitaminCTopical',
    ingredientB: 'sunscreen',
    interaction: 'synergistic',
    explanation: 'Vitamin C provides antioxidant photoprotection that complements sunscreen UV filtering. Together they provide superior protection against UV-induced PIH darkening.',
    recommendation: 'Apply vitamin C serum first, let dry, then sunscreen. Ideal AM routine for acne-prone skin with PIH.',
  },
  {
    ingredientA: 'hyaluronicAcid',
    ingredientB: 'retinol',
    interaction: 'synergistic',
    explanation: 'HA provides hydration that counteracts retinoid-induced dryness and peeling without clogging pores. Helps maintain barrier function during retinoid use.',
    recommendation: 'Apply HA serum on damp skin first, let absorb, then retinol, then moisturizer.',
  },
  {
    ingredientA: 'niacinamide',
    ingredientB: 'hyaluronicAcid',
    interaction: 'synergistic',
    explanation: 'Both support barrier function through complementary mechanisms (ceramide synthesis + hydration). Excellent base for acne-prone skin undergoing treatment.',
    recommendation: 'Layer freely together. Both tolerated well at any time of day.',
  },
  {
    ingredientA: 'benzoylPeroxide',
    ingredientB: 'niacinamide',
    interaction: 'synergistic',
    explanation: 'Niacinamide buffers BP irritation and dryness while both have independent anti-acne mechanisms.',
    recommendation: 'Apply BP first, let dry, then niacinamide in moisturizer.',
  },

  // ANTAGONISTIC / CAUTION COMBINATIONS
  {
    ingredientA: 'vitaminCTopical',
    ingredientB: 'retinol',
    interaction: 'caution',
    explanation: 'Both are potent actives that can cause irritation. Vitamin C works best at pH 2.5-3.5, retinol at pH 5-6. Using together may reduce efficacy of both and increase irritation.',
    recommendation: 'Use vitamin C in AM, retinol in PM. Do NOT layer together. If skin tolerates both, alternate days initially.',
  },
  {
    ingredientA: 'vitaminCTopical',
    ingredientB: 'benzoylPeroxide',
    interaction: 'antagonistic',
    explanation: 'Benzoyl peroxide is an oxidizer; vitamin C (ascorbic acid) is an antioxidant. BP oxidizes and degrades vitamin C on contact, rendering both less effective.',
    recommendation: 'Never layer together. Use vitamin C in AM, BP in PM. Or alternate days.',
  },
  {
    ingredientA: 'vitaminCTopical',
    ingredientB: 'niacinamide',
    interaction: 'caution',
    explanation: 'Old concern was that vitamin C converts niacinamide to niacin (flushing). Modern formulations at use concentrations show this is minimal. At very low pH (<3) some conversion may occur.',
    recommendation: 'Generally safe to use together or layered. Wait 10-15 minutes between applications if concerned, or use in AM/PM split.',
  },
  {
    ingredientA: 'retinol',
    ingredientB: 'aha',
    interaction: 'caution',
    explanation: 'Both increase cell turnover and can cause significant irritation, peeling, and barrier disruption when combined. Over-exfoliation risk is high.',
    recommendation: 'Do NOT use on same night. Alternate nights or use AHA 1-2x/week and retinol on other nights. Never layer directly.',
  },
  {
    ingredientA: 'retinol',
    ingredientB: 'salicylicAcid',
    interaction: 'caution',
    explanation: 'Both are potent actives that thin the stratum corneum. Combined use increases risk of irritation, dryness, and compromised barrier.',
    recommendation: 'Use salicylic acid in AM, retinol in PM. Or alternate days. Do not layer. Start with one, introduce the other slowly.',
  },
  {
    ingredientA: 'aha',
    ingredientB: 'benzoylPeroxide',
    interaction: 'caution',
    explanation: 'Both are irritating and barrier-disrupting. AHA + BP together greatly increases dryness, redness, and peeling risk.',
    recommendation: 'Use on different days or different times of day. AHA in PM, BP in AM, with adequate moisturizer and sunscreen.',
  },
  {
    ingredientA: 'benzoylPeroxide',
    ingredientB: 'salicylicAcid',
    interaction: 'caution',
    explanation: 'Both are drying and can compromise skin barrier. However, this is a common and effective combination in many acne regimens when used carefully.',
    recommendation: 'Can be combined if introduced gradually. SA cleanser + BP leave-on, or alternating AM/PM. Monitor for excessive dryness.',
  },
];


// ──────────────────────────────────────────────────────────────
// 5. COMBINATION / SYNERGISTIC EFFECTS
// ──────────────────────────────────────────────────────────────

export interface CombinationEffect {
  triggers: string[];
  labels: string[];
  interactionType: 'amplifying' | 'compounding' | 'protective_synergy' | 'negating';
  multiplier: number; // 1.0 = no interaction. >1 = worse than sum of parts. <1 = better than sum.
  mechanism: string;
  evidenceBasis: string;
}

export const COMBINATION_EFFECTS: CombinationEffect[] = [
  // AMPLIFYING COMBINATIONS (worse than sum of parts)
  {
    triggers: ['dairy', 'highSugar'],
    labels: ['Dairy', 'High Sugar'],
    interactionType: 'amplifying',
    multiplier: 1.5,
    mechanism:
      'Both independently activate mTORC1 through different inputs (dairy via leucine/BCAAs, sugar via insulin/IGF-1). ' +
      'Combined, they converge on mTORC1 from multiple upstream signals, causing greater activation than either alone. ' +
      'Insulin from sugar also reduces IGFBP-3, amplifying the IGF-1 already elevated by dairy.',
    evidenceBasis: 'Mechanistic (Melnik, 2012: dual mTORC1 activation). Supported by dietary intervention studies showing high-GL + dairy diets are most acnegenic.',
  },
  {
    triggers: ['dairy', 'wheyProtein'],
    labels: ['Dairy', 'Whey Protein'],
    interactionType: 'amplifying',
    multiplier: 1.7,
    mechanism:
      'Whey is a concentrated dairy extract - the most insulinotropic component. Adding whey on top of dietary dairy ' +
      'causes supra-physiological leucine and BCAAs, maximally activating mTORC1 and producing very high insulin response. ' +
      'The IGF-1 elevation is dose-dependent on total dairy protein intake.',
    evidenceBasis: 'Mechanistic (Melnik, 2012). Case series show severe acne in individuals consuming both dairy diet and whey supplements.',
  },
  {
    triggers: ['stress', 'dairy'],
    labels: ['High Stress', 'Dairy'],
    interactionType: 'amplifying',
    multiplier: 1.4,
    mechanism:
      'Stress elevates cortisol which increases insulin resistance, amplifying the insulin spike from dairy. ' +
      'Cortisol also directly stimulates sebocyte CRH receptors while dairy-derived IGF-1 stimulates sebocyte ' +
      'proliferation - two independent pathways converging on the same target (sebaceous gland).',
    evidenceBasis: 'Mechanistic inference from known cortisol-insulin interaction (Dallman et al., 2004) and dairy-IGF-1 pathway.',
  },
  {
    triggers: ['stress', 'highSugar'],
    labels: ['High Stress', 'High Sugar'],
    interactionType: 'amplifying',
    multiplier: 1.5,
    mechanism:
      'Stress-induced cortisol directly causes insulin resistance, making the insulin spike from high-GI foods ' +
      'even larger. Additionally, cortisol increases appetite for high-sugar "comfort foods" (behavioral feedback loop). ' +
      'The combined hormonal assault (cortisol + insulin + IGF-1) produces more severe sebum and inflammatory response.',
    evidenceBasis: 'Dallman et al., PNAS, 2003 - cortisol increases preference for high-fat/sugar foods. Mechanistic synergy of insulin resistance + glycemic load.',
  },
  {
    triggers: ['sleepHours', 'highSugar'],
    labels: ['Poor Sleep', 'High Sugar'],
    interactionType: 'amplifying',
    multiplier: 1.6,
    mechanism:
      'Sleep deprivation reduces insulin sensitivity by 25-30% after just 4 days (Spiegel et al., 1999). ' +
      'Consuming high-GI foods on top of sleep-deprived insulin resistance causes dramatically higher glucose and ' +
      'insulin spikes. Sleep-deprived individuals also have increased ghrelin and decreased leptin, driving sugar cravings ' +
      '(behavioral amplification). The result is: worse insulin response + more sugar consumed + higher baseline inflammation.',
    evidenceBasis: 'Spiegel et al., Lancet, 1999 - sleep restriction reduces insulin sensitivity. Behavioral studies show sleep-deprived individuals choose higher-GI foods.',
  },
  {
    triggers: ['sleepHours', 'stress'],
    labels: ['Poor Sleep', 'High Stress'],
    interactionType: 'amplifying',
    multiplier: 1.5,
    mechanism:
      'Bidirectional amplification: stress causes poor sleep; poor sleep increases stress reactivity. ' +
      'Combined, cortisol remains chronically elevated (no overnight nadir), growth hormone suppression is ' +
      'more severe, and inflammatory markers (IL-6, CRP) are synergistically elevated beyond what either alone produces.',
    evidenceBasis: 'Vgontzas et al., J Clin Endocrinol Metab, 2003 - sleep-stress cortisol interaction. Altemus et al., 2001 - combined sleep/stress effects on skin inflammation.',
  },
  {
    triggers: ['alcohol', 'highSugar'],
    labels: ['Alcohol', 'High Sugar'],
    interactionType: 'amplifying',
    multiplier: 1.4,
    mechanism:
      'Alcohol impairs hepatic glucose regulation while sugar provides a glucose load - result is prolonged hyperglycemia ' +
      'and hyperinsulinemia. Alcohol also depletes B vitamins and zinc needed for skin health, while sugar depletes vitamin C. ' +
      'Sweet alcoholic drinks (cocktails, sweet wine) compound both mechanisms simultaneously.',
    evidenceBasis: 'Mechanistic: alcohol-glucose interaction is well-established in metabolic literature. Nutritional depletion is additive.',
  },
  {
    triggers: ['friedFood', 'processedFood'],
    labels: ['Fried Food', 'Processed Food'],
    interactionType: 'compounding',
    multiplier: 1.3,
    mechanism:
      'Overlapping mechanisms (AGEs, oxidized lipids, omega-6 excess, high glycemic load) but through different ' +
      'food matrices. Combined consumption saturates antioxidant defenses, creating overwhelming oxidative stress. ' +
      'Typical fast-food meal combines both categories in a single sitting.',
    evidenceBasis: 'Penso et al., JAMA Dermatol, 2020 - fatty/sugary foods associated with acne in dose-response manner.',
  },

  // PROTECTIVE SYNERGIES
  {
    triggers: ['exercised', 'sleepHours'],
    labels: ['Exercise', 'Good Sleep'],
    interactionType: 'protective_synergy',
    multiplier: 0.7,
    mechanism:
      'Exercise improves sleep quality (deeper slow-wave sleep, more growth hormone release). Good sleep improves exercise recovery ' +
      'and reduces next-day cortisol. Together they create a virtuous cycle: better insulin sensitivity, lower inflammation, ' +
      'improved skin barrier repair, and reduced stress hormones.',
    evidenceBasis: 'Kredlow et al., J Behav Med, 2015 - exercise improves sleep quality (meta-analysis). Bidirectional sleep-exercise-skin benefits.',
  },
  {
    triggers: ['waterGlasses', 'exercised'],
    labels: ['High Water Intake', 'Exercise'],
    interactionType: 'protective_synergy',
    multiplier: 0.8,
    mechanism:
      'Adequate hydration during exercise optimizes sweat production (dermcidin antimicrobial) and blood flow to skin. ' +
      'Exercise-induced circulation brings nutrients and removes waste products more efficiently when well-hydrated.',
    evidenceBasis: 'Mechanistic inference. Hydration supports exercise benefits and vice versa.',
  },
  {
    triggers: ['morningRoutine', 'eveningRoutine'],
    labels: ['Morning Skincare', 'Evening Skincare'],
    interactionType: 'protective_synergy',
    multiplier: 0.6,
    mechanism:
      'Consistent AM/PM routine provides continuous active ingredient coverage. AM routine protects (sunscreen, antioxidants) ' +
      'while PM routine treats (retinoid, exfoliant). Skipping either leaves gaps in protection/treatment cycle.',
    evidenceBasis: 'Clinical dermatology standard of care. Treatment efficacy depends on consistent application.',
  },
  {
    triggers: ['omega3Fish', 'greenVegetables'],
    labels: ['Omega-3 Fish', 'Green Vegetables'],
    interactionType: 'protective_synergy',
    multiplier: 0.65,
    mechanism:
      'Omega-3 fatty acids shift inflammatory balance while vegetable antioxidants protect against oxidative stress. ' +
      'Combined: reduced inflammatory mediators + reduced oxidative damage to sebum = significantly less inflammatory acne. ' +
      'Mediterranean diet studies show this combination is particularly effective.',
    evidenceBasis: 'Skroza et al., 2012 - Mediterranean diet (fish + vegetables) inversely associated with acne. Complementary anti-inflammatory mechanisms.',
  },

  // NEGATING COMBINATIONS
  {
    triggers: ['exercised', 'wheyProtein'],
    labels: ['Exercise', 'Whey Protein'],
    interactionType: 'negating',
    multiplier: 1.0,
    mechanism:
      'Exercise is normally protective for acne (insulin sensitivity, anti-inflammatory). However, combining exercise with ' +
      'whey protein supplementation negates the benefit - whey\'s strong mTORC1 activation and insulinotropic effect ' +
      'overwhelm exercise\'s insulin-sensitizing benefit. Post-workout whey also spikes IGF-1 at a time when muscle ' +
      'IGF-1 receptors are already upregulated.',
    evidenceBasis: 'Simonart, 2012; Cengiz et al., 2017 - acne in whey-supplementing gym-goers despite high exercise levels.',
  },
  {
    triggers: ['sunscreen', 'sunExposure'],
    labels: ['Sunscreen', 'Sun Exposure'],
    interactionType: 'negating',
    multiplier: 0.9,
    mechanism:
      'Sunscreen blocks the harmful UV effects (comedogenesis, barrier damage, PIH darkening) while still allowing ' +
      'some vitamin D synthesis and circadian regulation benefits of outdoor light. Effectively negates the negative ' +
      'aspects of sun exposure while preserving the positive.',
    evidenceBasis: 'Standard dermatologic recommendation. UV filtering prevents UV-comedogenesis documented by Mills & Kligman, 1975.',
  },
];


// ──────────────────────────────────────────────────────────────
// 6. ENGINE INTEGRATION HELPERS
// ──────────────────────────────────────────────────────────────

/**
 * Get the expected onset delay range (in days) for a given factor.
 * Used by the correlation engine to weight lag analysis.
 */
export function getExpectedLagDays(factorKey: string): [number, number] {
  // Check food profiles
  const food = FOOD_SKIN_PROFILES[factorKey];
  if (food) {
    return [
      Math.round(food.onsetDelayHours[0] / 24),
      Math.round(food.onsetDelayHours[1] / 24),
    ];
  }
  // Check lifestyle profiles
  const lifestyle = LIFESTYLE_SKIN_PROFILES[factorKey];
  if (lifestyle) {
    return [
      Math.round(lifestyle.lagTimeHours[0] / 24),
      Math.round(lifestyle.lagTimeHours[1] / 24),
    ];
  }
  // Default: 1-3 day window
  return [1, 3];
}

/**
 * Get the evidence strength for a given factor.
 * Used to weight confidence in detected correlations.
 */
export function getEvidenceStrength(factorKey: string): EvidenceStrength | null {
  const food = FOOD_SKIN_PROFILES[factorKey];
  if (food) return food.evidenceStrength;
  return null;
}

/**
 * Get the combination multiplier for a set of active factors on a given day.
 * Returns total multiplier (product of all applicable combination effects).
 */
export function getCombinationMultiplier(activeFactors: string[]): {
  multiplier: number;
  activeCombinations: CombinationEffect[];
} {
  const activeSet = new Set(activeFactors);
  const activeCombinations: CombinationEffect[] = [];
  let totalMultiplier = 1.0;

  for (const combo of COMBINATION_EFFECTS) {
    if (combo.triggers.every(t => activeSet.has(t))) {
      activeCombinations.push(combo);
      // For amplifying/compounding, multiply. For protective, multiply (value < 1 reduces).
      totalMultiplier *= combo.multiplier;
    }
  }

  return { multiplier: totalMultiplier, activeCombinations };
}

/**
 * Generate a human-readable insight for a detected correlation,
 * enriched with mechanism knowledge.
 */
export function generateMechanismInsight(factorKey: string, direction: 'trigger' | 'protective', lagDays: number): string {
  const food = FOOD_SKIN_PROFILES[factorKey];
  if (food) {
    const compounds = food.acneRelevantCompounds.slice(0, 2).join(' and ');
    if (direction === 'trigger') {
      return `${food.category} may worsen acne through ${compounds}. ${food.mechanism.split('.')[0]}.`;
    }
    return `${food.category} appears protective for your skin. ${food.mechanism.split('.')[0]}.`;
  }

  const lifestyle = LIFESTYLE_SKIN_PROFILES[factorKey];
  if (lifestyle) {
    if (direction === 'trigger') {
      return `${lifestyle.factor} appears to worsen your skin. ${lifestyle.mechanism.split('.')[0]}.`;
    }
    return `${lifestyle.factor} appears protective for your skin. ${lifestyle.mechanism.split('.')[0]}.`;
  }

  return direction === 'trigger'
    ? `This factor appears to worsen your skin with a ~${lagDays}-day delay.`
    : `This factor appears protective for your skin.`;
}

/**
 * Get all skincare ingredient interactions for a given set of active ingredients.
 */
export function getActiveInteractions(ingredients: string[]): IngredientInteraction[] {
  const set = new Set(ingredients);
  return INGREDIENT_INTERACTIONS.filter(
    i => set.has(i.ingredientA) && set.has(i.ingredientB)
  );
}

/**
 * Get nutrient recommendations based on detected deficiency signals.
 * (e.g., if acne worsens despite good habits, suggest checking these nutrients)
 */
export function getNutrientRecommendations(
  primaryTriggers: string[],
  skinSeverity: number
): { nutrient: string; rationale: string }[] {
  const recommendations: { nutrient: string; rationale: string }[] = [];

  // Always recommend for moderate+ severity
  if (skinSeverity >= 4) {
    recommendations.push({
      nutrient: 'zinc',
      rationale: NUTRIENT_SKIN_PROFILES.zinc.effectOnAcne.split('.')[0] + '.',
    });
  }

  if (skinSeverity >= 3) {
    recommendations.push({
      nutrient: 'omega3',
      rationale: NUTRIENT_SKIN_PROFILES.omega3.effectOnAcne.split('.')[0] + '.',
    });
  }

  // If dairy/whey are triggers, vitamin D may be low (less dairy intake)
  if (primaryTriggers.includes('dairy') || primaryTriggers.includes('wheyProtein')) {
    recommendations.push({
      nutrient: 'vitaminD',
      rationale: 'If reducing dairy, ensure adequate vitamin D from other sources. ' + NUTRIENT_SKIN_PROFILES.vitaminD.effectOnAcne.split('.')[0] + '.',
    });
  }

  // General for persistent acne
  if (skinSeverity >= 5) {
    recommendations.push({
      nutrient: 'vitaminA',
      rationale: NUTRIENT_SKIN_PROFILES.vitaminA.effectOnAcne.split('.')[0] + '.',
    });
  }

  return recommendations;
}
