import records from './evidence-records.json' with { type: 'json' };

export const evidenceTeachingCards = records.filter((record) => record.evidenceGroup === 'teaching');
export const evidenceOutcomeCards = records.filter((record) => record.evidenceGroup === 'outcomes');
export const evidenceMoreReading = records.filter((record) => record.moreReadingOnly === true);

export default { evidenceTeachingCards, evidenceOutcomeCards, evidenceMoreReading };
