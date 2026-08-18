const summerAcademy = {
  id: "summer-academy-2026",
  year: 2026,
  enrollmentOpenAt: "2026-01-01T00:00:00-05:00",
  enrollmentCloseAt: "2026-07-07T23:59:59-04:00",
  startAt: "2026-07-14T00:00:00-04:00",
  endAt: "2026-08-20T23:59:59-04:00",
  capacity: 12,
  manuallyClosed: false,
  lateEnrollmentAllowed: false,
  futureAction: "Text Sandy About Future Summer Programs",
  temporaryContent: {
    owner: "Summer Academy",
    startsAt: "2026-07-14T00:00:00-04:00",
    endsAt: "2026-08-20T23:59:59-04:00",
    fallback: "future-interest",
    sourceProgram: "summer-academy-2026"
  }
};

export function getProgramState(now, cohort) {
  const time = new Date(now).getTime();
  if (Number.isNaN(time)) throw new Error(`Invalid temporal evaluation date: ${now}`);
  if (time < new Date(cohort.enrollmentOpenAt).getTime()) return "UPCOMING";
  if (cohort.manuallyClosed || !cohort.lateEnrollmentAllowed && time > new Date(cohort.enrollmentCloseAt).getTime()) {
    if (time < new Date(cohort.startAt).getTime()) return "ENROLLMENT_CLOSED";
  }
  if (time < new Date(cohort.startAt).getTime()) return "ENROLLMENT_OPEN";
  if (time <= new Date(cohort.endAt).getTime()) return "IN_PROGRESS";
  return "ENDED";
}

export function getEnrollmentState(now, cohort) {
  const time = new Date(now).getTime();
  const close = new Date(cohort.enrollmentCloseAt).getTime();
  const start = new Date(cohort.startAt).getTime();
  const open = new Date(cohort.enrollmentOpenAt).getTime();
  if (cohort.manuallyClosed || time < open || time > close || time >= start) return "CLOSED";
  return "OPEN";
}

const evaluationNow = process.env.TEMPORAL_NOW || new Date().toISOString();
const programState = getProgramState(evaluationNow, summerAcademy);
const enrollmentState = getEnrollmentState(evaluationNow, summerAcademy);

export default {
  summerAcademy: {
    ...summerAcademy,
    evaluationNow,
    programState,
    enrollmentState,
    enrollmentOpen: enrollmentState === "OPEN",
    currentFamilyLogistics: programState === "IN_PROGRESS",
    futureInterest: programState === "ENDED" || enrollmentState === "CLOSED"
  }
};
