import assert from "node:assert/strict";
import test from "node:test";
import { scoreJob, rankJobs } from "../server/matching.js";
import { primaryJobs } from "../server/seed-data.js";
import { getCandidateById } from "../server/candidates.js";

test("exact skill matches and location produce an explainable score", () => {
  const job = {
    location: "Zurich",
    workMode: "Hybrid",
    skills: ["React", "TypeScript", "API design", "Cloud infrastructure"],
  };
  const result = scoreJob(job, getCandidateById("candidate-001"));
  assert.equal(result.score, 80);
  assert.equal(result.matchedCount, 3);
  assert.equal(result.relatedCount, 0);
  assert.deepEqual(result.skillBreakdown.map((item) => item.matched), [true, true, true, false]);
  assert.deepEqual(result.skillBreakdown.map((item) => item.matchType), ["exact", "exact", "exact", "missing"]);
  assert.deepEqual(result.skillBreakdown.map((item) => item.contribution), [1, 1, 1, 0]);
  assert.equal(result.skillPoints, 60);
  assert.equal(result.locationPoints, 20);
  assert.equal(result.locationFits, true);
  assert.equal(scoreJob(primaryJobs[0], getCandidateById("candidate-001")).score, 90);
});

test("a related skill earns half credit and is counted separately from exact matches", () => {
  const job = { location: "Bern", workMode: "Hybrid", skills: ["Frontend development"] };
  const candidate = { location: "Zurich", skills: ["React"] };
  const result = scoreJob(job, candidate);
  assert.equal(result.score, 40);
  assert.equal(result.matchedCount, 0);
  assert.equal(result.relatedCount, 1);
  assert.equal(result.skillPoints, 40);
  assert.equal(result.skillBreakdown[0].matchType, "related");
  assert.equal(result.skillBreakdown[0].matchedSkill, "React");
  assert.equal(result.skillBreakdown[0].contribution, 0.5);
  assert.equal(result.skillBreakdown[0].reason, "Related skill: React (50% credit)");
});

test("a missing skill receives no credit and broader skills do not satisfy specific requirements", () => {
  const missingResult = scoreJob(
    { location: "Bern", workMode: "Hybrid", skills: ["Frontend development"] },
    { location: "Zurich", skills: ["SEO"] }
  );
  assert.equal(missingResult.score, 0);
  assert.equal(missingResult.skillBreakdown[0].matchType, "missing");
  assert.equal(missingResult.skillBreakdown[0].contribution, 0);
  assert.equal(missingResult.skillBreakdown[0].reason, "Not found");

  const reverseResult = scoreJob(
    { location: "Bern", workMode: "Hybrid", skills: ["React"] },
    { location: "Zurich", skills: ["Frontend development"] }
  );
  assert.equal(reverseResult.skillBreakdown[0].matchType, "missing");
  assert.equal(reverseResult.score, 0);
});

test("remote roles count as a location fit and ranking is stable", () => {
  const candidate = getCandidateById("candidate-003");
  const ranked = rankJobs(primaryJobs, candidate);
  assert.equal(ranked[0].id, "job-103");
  assert.equal(ranked[0].match.locationFits, true);
  assert.equal(ranked[0].match.locationPoints, 20);
  assert.ok(ranked.every((job) => job.match.score >= 0 && job.match.score <= 100));
});
