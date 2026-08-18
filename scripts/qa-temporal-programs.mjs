import assert from "node:assert/strict";
import fs from "node:fs";
import { getProgramState, getEnrollmentState } from "../src/_data/temporal-programs.js";

const cohort = {
  enrollmentOpenAt: "2026-01-01T00:00:00Z",
  enrollmentCloseAt: "2026-07-07T23:59:59Z",
  startAt: "2026-07-14T00:00:00Z",
  endAt: "2026-08-20T23:59:59Z",
  manuallyClosed: false,
  lateEnrollmentAllowed: false
};

assert.equal(getProgramState("2025-12-31T23:59:59Z", cohort), "UPCOMING");
assert.equal(getEnrollmentState("2025-12-31T23:59:59Z", cohort), "CLOSED");
assert.equal(getProgramState("2026-06-01T12:00:00Z", cohort), "ENROLLMENT_OPEN");
assert.equal(getEnrollmentState("2026-06-01T12:00:00Z", cohort), "OPEN");
assert.equal(getProgramState("2026-07-08T00:00:00Z", cohort), "ENROLLMENT_CLOSED");
assert.equal(getEnrollmentState("2026-07-08T00:00:00Z", cohort), "CLOSED");
assert.equal(getProgramState("2026-08-17T12:00:00Z", cohort), "IN_PROGRESS");
assert.equal(getProgramState("2026-08-21T00:00:00Z", cohort), "ENDED");
assert.equal(getProgramState("2026-06-01T12:00:00Z", {...cohort, manuallyClosed: true}), "ENROLLMENT_CLOSED");
const summerHtml = fs.readFileSync("dist/summer-academy.html", "utf8");
const safetyHtml = fs.readFileSync("dist/jiu-jitsu-safety-tannersville-ny.html", "utf8");
const evaluated = getEnrollmentState(process.env.TEMPORAL_NOW || new Date().toISOString(), cohort);
if (evaluated !== "OPEN") {
  for (const stale of ["Reserve a Spot", "Reserve One of 12", "$99 deposit", "Founding 12"]) {
    assert.equal(summerHtml.includes(stale), false, `closed Summer output contains stale sales copy: ${stale}`);
  }
}
assert.equal(safetyHtml.includes("Pre-Camp Express"), false, "Safety output contains expired seasonal module");
console.log("Temporal program boundary QA passed.");
