import records from './evidence-records.json' with { type: 'json' };

const sourcePageIds = new Set([
  'bjj-ecological-dynamical-2026',
  'manninen-games-based-pe-review-2025',
  'saha-pe-game-pedagogy-review-2026',
  'roaas-loras-challenge-perspective-2026',
  'bjj-school-rct',
  'youth-martial-arts-attention-rct',
  'open-skill-youth-meta-analysis',
  'bjj-adult-fitness',
  'bjj-mma-youth-development',
  'rugby-ecological-dynamics-2026',
  'ecological-dynamic-learning-review-2026',
  'bjj-injury-2025',
  'bjj-injury-rates-review',
  'combat-sports-injury-epidemiology-review',
  'combat-sports-post-concussion-care',
  'deliberate-practice-expertise',
  'exercise-cognition-neuroplasticity-review',
  'greene-county-child-health-2024',
  'greene-county-community-health-2022-2024',
  'pediatric-bjj-injury-review',
  'youth-sports-injury-prevention'
]);

export default records.filter((record) => sourcePageIds.has(record.id));
