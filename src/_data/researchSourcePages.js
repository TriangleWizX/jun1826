import records from './evidence-records.json' with { type: 'json' };

const sourcePageIds = new Set([
  'bjj-ecological-dynamical-2026',
  'manninen-games-based-pe-review-2025',
  'saha-pe-game-pedagogy-review-2026',
  'roaas-loras-challenge-perspective-2026',
  'bjj-mma-youth-development'
]);

export default records.filter((record) => sourcePageIds.has(record.id));
